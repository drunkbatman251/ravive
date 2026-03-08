import { z } from 'zod';
import { pool } from '../config/db.js';
import { applyXpEvent, upsertStreak } from '../services/userService.js';
import { recoverySuggestion } from '../services/xpEngine.js';
import { calculateNutritionGoals } from '../utils/nutritionUtils.js';

const mealSchema = z.object({
  foodItemId: z.number().int(),
  quantity: z.number().min(0.5).max(20).refine((n) => Number.isInteger(n * 2), {
    message: 'Quantity must be in 0.5 steps'
  }).default(1),
  mealType: z.string().optional()
});

function getMealQualitySignals(food, quantity = 1) {
  const calories = Number(food.calories) * quantity;
  const protein = Number(food.protein) * quantity;
  const carbs = Number(food.carbs) * quantity;
  const fat = Number(food.fat) * quantity;
  const fiber = Number(food.fiber) * quantity;

  const fatCalories = fat * 9;
  const carbCalories = carbs * 4;
  const proteinCalories = protein * 4;
  const totalMacroCalories = Math.max(1, fatCalories + carbCalories + proteinCalories);

  const fatRatio = fatCalories / totalMacroCalories;
  const carbRatio = carbCalories / totalMacroCalories;
  const proteinRatio = proteinCalories / totalMacroCalories;

  const signals = {
    calories,
    fatRatio,
    carbRatio,
    proteinRatio,
    fiber,
    oily: fatRatio > 0.42 || fat > 24,
    veryCarby: carbRatio > 0.68 || carbs > 70,
    proteinRich: protein >= 15,
    fiberRich: fiber >= 5,
    processed: String(food.category || '').toLowerCase().includes('street')
  };

  return signals;
}

function mealXpFromQuality(signals) {
  let xp = 10;
  let lifeScore = 0;
  const stats = { health: 0, discipline: 0, focus: 0 };
  let quality = 'balanced';

  if (signals.proteinRich) {
    xp += 15;
    stats.health += 2;
    stats.discipline += 1;
  }

  if (signals.fiberRich) {
    xp += 10;
    stats.health += 2;
    stats.focus += 1;
  }

  if (signals.oily) {
    xp -= 20;
    stats.health -= 2;
    lifeScore -= 2;
    quality = 'oily';
  }

  if (signals.veryCarby) {
    xp -= 12;
    stats.health -= 1;
    quality = quality === 'oily' ? 'oily_carb_heavy' : 'carb_heavy';
  }

  if (signals.processed) {
    xp -= 8;
    lifeScore -= 1;
    if (quality === 'balanced') quality = 'processed';
  }

  if (!signals.oily && !signals.veryCarby && (signals.proteinRich || signals.fiberRich) && !signals.processed) {
    xp += 10;
    lifeScore += 2;
    quality = 'high_quality';
  }

  xp = Math.max(-40, Math.min(45, Math.round(xp)));

  return { xp, lifeScore, stats, quality };
}

export async function listFoodItems(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM food_items ORDER BY category, name');
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

export async function addMeal(req, res, next) {
  try {
    const payload = mealSchema.parse(req.body);
    const userId = req.user.id;

    const mealResult = await pool.query(
      `INSERT INTO meals (user_id, food_item_id, quantity, meal_type)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [userId, payload.foodItemId, payload.quantity, payload.mealType || 'meal']
    );

    const foodResult = await pool.query('SELECT * FROM food_items WHERE id = $1', [payload.foodItemId]);
    const food = foodResult.rows[0];

    const signals = getMealQualitySignals(food, payload.quantity);
    const qualityXp = mealXpFromQuality(signals);

    const xp = await applyXpEvent({
      userId,
      sourceType: 'meal',
      sourceId: mealResult.rows[0].id,
      action: `Meal logged: ${food.name} (${qualityXp.quality})`,
      xpChange: qualityXp.xp,
      lifeScoreChange: qualityXp.lifeScore,
      statsDelta: qualityXp.stats
    });

    await upsertStreak(userId, 'nutrition', qualityXp.xp >= 0);

    const isPoorQuality = qualityXp.xp < 0 || signals.oily || signals.veryCarby;

    return res.status(201).json({
      meal: mealResult.rows[0],
      xpEvent: xp.event,
      mealQuality: qualityXp.quality,
      recoverySuggestion: isPoorQuality ? recoverySuggestion('fast_food') : null,
      qualitySignals: {
        oily: signals.oily,
        veryCarby: signals.veryCarby,
        proteinRich: signals.proteinRich,
        fiberRich: signals.fiberRich
      }
    });
  } catch (error) {
    return next(error);
  }
}

export async function dailyNutrition(req, res, next) {
  try {
    const userId = req.user.id;
    const [mealResult, userResult] = await Promise.all([
      pool.query(
        `SELECT f.name, m.quantity, f.calories, f.protein, f.carbs, f.fat, f.fiber
         FROM meals m
         JOIN food_items f ON f.id = m.food_item_id
         WHERE m.user_id = $1 AND m.consumed_at::date = CURRENT_DATE`,
        [userId]
      ),
      pool.query('SELECT age, weight_kg, height_cm, activity_level, goal, target_weight_change_kg FROM users WHERE id = $1', [userId])
    ]);

    const totals = mealResult.rows.reduce(
      (acc, row) => {
        const qty = Number(row.quantity);
        acc.calories += Number(row.calories) * qty;
        acc.protein += Number(row.protein) * qty;
        acc.carbs += Number(row.carbs) * qty;
        acc.fat += Number(row.fat) * qty;
        acc.fiber += Number(row.fiber || 0) * qty;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    const user = userResult.rows[0];
    const goals = calculateNutritionGoals({
      age: user.age,
      weightKg: user.weight_kg,
      heightCm: user.height_cm,
      activityLevel: user.activity_level,
      goal: user.goal,
      targetWeightChangeKg: user.target_weight_change_kg
    });

    const delta = {
      calories: Number((goals.calories - totals.calories).toFixed(1)),
      protein: Number((goals.protein - totals.protein).toFixed(1)),
      carbs: Number((goals.carbs - totals.carbs).toFixed(1)),
      fat: Number((goals.fat - totals.fat).toFixed(1)),
      fiber: Number((goals.fiber - totals.fiber).toFixed(1))
    };

    const status = {
      calories: delta.calories < 0 ? 'over' : 'remaining',
      protein: delta.protein < 0 ? 'over' : 'remaining',
      carbs: delta.carbs < 0 ? 'over' : 'remaining',
      fat: delta.fat < 0 ? 'over' : 'remaining',
      fiber: delta.fiber < 0 ? 'over' : 'remaining'
    };

    return res.json({ totals, goals, delta, status, entries: mealResult.rows });
  } catch (error) {
    return next(error);
  }
}

export async function recentMeals(req, res, next) {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT DISTINCT ON (f.id)
          f.id, f.name, f.category, f.calories, f.protein, f.carbs, f.fat, f.fiber,
          MAX(m.consumed_at) AS last_consumed_at
       FROM meals m
       JOIN food_items f ON f.id = m.food_item_id
       WHERE m.user_id = $1
       GROUP BY f.id
       ORDER BY f.id, last_consumed_at DESC`,
      [userId]
    );

    const sorted = result.rows
      .sort((a, b) => new Date(b.last_consumed_at).getTime() - new Date(a.last_consumed_at).getTime())
      .slice(0, 12);

    return res.json(sorted);
  } catch (error) {
    return next(error);
  }
}
