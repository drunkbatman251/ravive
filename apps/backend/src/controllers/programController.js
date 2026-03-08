import { z } from 'zod';
import { pool } from '../config/db.js';
import { buildSatabdiDay, buildSatabdiWeek, satabdiMeta } from '../data/satabdiProgram.js';

const completionSchema = z.object({
  week: z.number().int().min(1).max(8),
  caloriesBurned: z.number().min(0),
  fatLossG: z.number().min(0),
  muscleGainG: z.number().min(0)
});

async function getCompletionMap(userId, week) {
  const progress = await pool.query(
    `SELECT day_no, workout_date, calories_burned, fat_loss_g, muscle_gain_g
     FROM satabdi_daily_progress
     WHERE user_id = $1 AND week_no = $2
     ORDER BY workout_date DESC`,
    [userId, week]
  );

  return progress.rows.reduce((acc, row) => {
    acc[row.day_no] = {
      completed: true,
      workoutDate: row.workout_date,
      caloriesBurned: Number(row.calories_burned || 0),
      fatLossG: Number(row.fat_loss_g || 0),
      muscleGainG: Number(row.muscle_gain_g || 0)
    };
    return acc;
  }, {});
}

export async function getSatabdiProgram(req, res, next) {
  try {
    const userId = req.user.id;
    const week = Math.max(1, Math.min(8, Number(req.query.week) || 1));
    const days = buildSatabdiWeek(week);
    const completion = await getCompletionMap(userId, week);

    const summary = days.reduce(
      (acc, day) => {
        acc.totalCalories += day.totalEstimated.calories;
        acc.totalFatLossG += day.totalEstimated.fatLossG;
        acc.totalMuscleGainG += day.totalEstimated.muscleGainG;
        return acc;
      },
      { totalCalories: 0, totalFatLossG: 0, totalMuscleGainG: 0 }
    );

    summary.totalFatLossG = Number(summary.totalFatLossG.toFixed(1));
    summary.totalMuscleGainG = Number(summary.totalMuscleGainG.toFixed(1));

    return res.json({
      ...satabdiMeta,
      week,
      progressionNote: days[0]?.progressionNote,
      summary,
      completion,
      days
    });
  } catch (error) {
    return next(error);
  }
}

export async function getSatabdiDay(req, res, next) {
  try {
    const userId = req.user.id;
    const week = Math.max(1, Math.min(8, Number(req.query.week) || 1));
    const dayNo = Number(req.params.day);
    const day = buildSatabdiDay(dayNo, week);
    if (!day) return res.status(404).json({ message: 'Day not found' });

    const completionMap = await getCompletionMap(userId, week);
    return res.json({
      ...satabdiMeta,
      week,
      dayNo,
      completion: completionMap[dayNo] || { completed: false },
      day
    });
  } catch (error) {
    return next(error);
  }
}

export async function completeSatabdiDay(req, res, next) {
  try {
    const userId = req.user.id;
    const dayNo = Number(req.params.day);
    const payload = completionSchema.parse(req.body);
    const today = new Date().toISOString().slice(0, 10);

    await pool.query(
      `INSERT INTO satabdi_daily_progress
        (user_id, workout_date, week_no, day_no, calories_burned, fat_loss_g, muscle_gain_g, completed)
       VALUES ($1, $2::date, $3, $4, $5, $6, $7, TRUE)
       ON CONFLICT (user_id, workout_date, day_no)
       DO UPDATE SET
         week_no = EXCLUDED.week_no,
         calories_burned = EXCLUDED.calories_burned,
         fat_loss_g = EXCLUDED.fat_loss_g,
         muscle_gain_g = EXCLUDED.muscle_gain_g,
         completed = TRUE`,
      [userId, today, payload.week, dayNo, payload.caloriesBurned, payload.fatLossG, payload.muscleGainG]
    );

    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
}
