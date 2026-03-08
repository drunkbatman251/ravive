import { z } from 'zod';
import { pool } from '../config/db.js';
import { applyXpEvent, upsertStreak } from '../services/userService.js';
import { filterExercisesByEquipment, requiredEquipmentForExercise } from '../services/equipmentEngine.js';

const workoutSchema = z.object({
  exerciseId: z.number().int(),
  durationMin: z.number().int().min(1),
  intensity: z.enum(['low', 'moderate', 'high']).default('moderate')
});

export async function listExercises(req, res, next) {
  try {
    const [exerciseResult, userResult] = await Promise.all([
      pool.query('SELECT * FROM exercises ORDER BY category, name'),
      pool.query('SELECT equipment_preferences FROM users WHERE id = $1', [req.user.id])
    ]);

    const equipmentPreferences = userResult.rows[0]?.equipment_preferences || [];
    const filtered = filterExercisesByEquipment(exerciseResult.rows, equipmentPreferences).map((exercise) => ({
      ...exercise,
      requiredEquipment: requiredEquipmentForExercise(exercise.name)
    }));

    return res.json(filtered);
  } catch (error) {
    return next(error);
  }
}

export async function addWorkout(req, res, next) {
  try {
    const payload = workoutSchema.parse(req.body);
    const userId = req.user.id;

    const workoutResult = await pool.query(
      `INSERT INTO workouts (user_id, exercise_id, duration_min, intensity)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [userId, payload.exerciseId, payload.durationMin, payload.intensity]
    );

    const exerciseResult = await pool.query('SELECT * FROM exercises WHERE id = $1', [payload.exerciseId]);
    const exercise = exerciseResult.rows[0];

    const durationFactor = payload.durationMin / 30;
    const intensityFactor = payload.intensity === 'high' ? 1.2 : payload.intensity === 'low' ? 0.85 : 1;
    const xpChange = Math.round(exercise.xp_reward * durationFactor * intensityFactor);
    const caloriesBurned = Math.round(exercise.calories_burned_per_30min * durationFactor * intensityFactor);
    const fatLossG = Number((caloriesBurned * 0.35 / 9).toFixed(1));
    const muscleGainG = Number((
      (exercise.category === 'Strength' ? 1.2 : exercise.category === 'Yoga' ? 0.5 : 0.3) *
      durationFactor *
      (payload.intensity === 'high' ? 1.1 : 1)
    ).toFixed(1));

    const xp = await applyXpEvent({
      userId,
      sourceType: 'workout',
      sourceId: workoutResult.rows[0].id,
      action: `${exercise.name} ${payload.durationMin}min`,
      xpChange,
      lifeScoreChange: 3,
      statsDelta: { health: 3, strength: 4, discipline: 2 }
    });

    await upsertStreak(userId, 'workout', true);

    return res.status(201).json({
      workout: workoutResult.rows[0],
      xpEvent: xp.event,
      bodyImpact: {
        caloriesBurned,
        fatLossG,
        muscleGainG
      }
    });
  } catch (error) {
    return next(error);
  }
}
