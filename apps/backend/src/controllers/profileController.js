import { z } from 'zod';
import { pool } from '../config/db.js';
import { calculateNutritionGoals } from '../utils/nutritionUtils.js';
import { EQUIPMENT_OPTIONS, filterExercisesByEquipment } from '../services/equipmentEngine.js';

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  age: z.number().int().min(10).max(100).optional(),
  weightKg: z.number().min(20).max(250).optional(),
  heightCm: z.number().min(100).max(250).optional(),
  activityLevel: z.enum(['low', 'moderate', 'high']).optional(),
  goal: z.enum(['lose_fat', 'maintain', 'gain_muscle']).optional(),
  targetWeightChangeKg: z.number().min(-100).max(100).optional(),
  equipmentPreferences: z.array(z.string()).optional()
});

function calculateBmi(weightKg, heightCm) {
  const h = Number(heightCm) / 100;
  if (!h || h <= 0) return 0;
  return Number((Number(weightKg) / (h * h)).toFixed(1));
}

function bmiStatus(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Healthy';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

async function recommendationByGoal({ goal, bmi, equipmentPreferences }) {
  let where = "category IN ('Yoga','Cardio')";

  if (goal === 'gain_muscle') {
    where = "category = 'Strength'";
  } else if (goal === 'lose_fat' || bmi >= 25) {
    where = "category IN ('Cardio','Strength')";
  }

  const result = await pool.query(
    `SELECT id, name, category, difficulty, calories_burned_per_30min
     FROM exercises
     WHERE ${where}
     ORDER BY calories_burned_per_30min DESC
     LIMIT 6`
  );

  return filterExercisesByEquipment(result.rows, equipmentPreferences).slice(0, 6);
}

export async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;

    const [userResult, weightResult] = await Promise.all([
      pool.query('SELECT * FROM users WHERE id = $1', [userId]),
      pool.query(
        `SELECT weight_kg, logged_at
         FROM weight_logs
         WHERE user_id = $1
         ORDER BY logged_at DESC
         LIMIT 1`,
        [userId]
      )
    ]);

    if (!userResult.rowCount) return res.status(404).json({ message: 'User not found' });

    const user = userResult.rows[0];

    const goals = calculateNutritionGoals({
      age: user.age,
      weightKg: user.weight_kg,
      heightCm: user.height_cm,
      activityLevel: user.activity_level,
      goal: user.goal,
      targetWeightChangeKg: user.target_weight_change_kg
    });

    const bmi = calculateBmi(user.weight_kg, user.height_cm);
    const lastWeightLog = weightResult.rows[0] || null;
    const daysSinceWeightUpdate = lastWeightLog
      ? Math.floor((Date.now() - new Date(lastWeightLog.logged_at).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    const equipmentPreferences = user.equipment_preferences || [];
    const recommendations = await recommendationByGoal({ goal: user.goal, bmi, equipmentPreferences });

    return res.json({
      user,
      nutritionGoals: goals,
      bmi,
      bmiStatus: bmiStatus(bmi),
      lastWeightUpdateAt: lastWeightLog?.logged_at || null,
      daysSinceWeightUpdate,
      shouldUpdateWeight: daysSinceWeightUpdate >= 7,
      recommendations,
      equipmentOptions: EQUIPMENT_OPTIONS
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const payload = profileSchema.parse(req.body);

    const result = await pool.query(
      `UPDATE users SET
        name = COALESCE($2, name),
        age = COALESCE($3, age),
        weight_kg = COALESCE($4, weight_kg),
        height_cm = COALESCE($5, height_cm),
        activity_level = COALESCE($6, activity_level),
        goal = COALESCE($7, goal),
        target_weight_change_kg = COALESCE($8, target_weight_change_kg),
        equipment_preferences = COALESCE($9, equipment_preferences),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *`,
      [
        userId,
        payload.name,
        payload.age,
        payload.weightKg,
        payload.heightCm,
        payload.activityLevel,
        payload.goal,
        payload.targetWeightChangeKg,
        payload.equipmentPreferences
      ]
    );

    if (payload.weightKg) {
      await pool.query(
        'INSERT INTO weight_logs (user_id, weight_kg) VALUES ($1,$2)',
        [userId, payload.weightKg]
      );
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}
