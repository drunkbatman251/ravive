import { pool } from '../config/db.js';
import { generateCoachAdvice } from '../services/aiCoachService.js';

export async function getCoachAdvice(req, res, next) {
  try {
    const userId = req.user.id;

    const [nutrition, sleep, workouts, negatives] = await Promise.all([
      pool.query(
        `SELECT COALESCE(SUM(f.protein * m.quantity), 0)::numeric(8,2) AS protein
         FROM meals m
         JOIN food_items f ON f.id = m.food_item_id
         WHERE m.user_id = $1 AND m.consumed_at >= CURRENT_DATE - INTERVAL '7 day'`,
        [userId]
      ),
      pool.query(
        `SELECT COALESCE(AVG(hours), 0)::numeric(4,2) AS avg_sleep
         FROM sleep_logs
         WHERE user_id = $1 AND slept_at >= CURRENT_DATE - INTERVAL '7 day'`,
        [userId]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS workouts
         FROM workouts
         WHERE user_id = $1 AND performed_at >= CURRENT_DATE - INTERVAL '7 day'`,
        [userId]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS negatives
         FROM xp_events
         WHERE user_id = $1 AND xp_change < 0 AND created_at >= CURRENT_DATE - INTERVAL '7 day'`,
        [userId]
      )
    ]);

    const summary = {
      weeklyProtein: Number(nutrition.rows[0].protein),
      avgSleep: Number(sleep.rows[0].avg_sleep),
      workouts: Number(workouts.rows[0].workouts),
      negativeEvents: Number(negatives.rows[0].negatives)
    };

    const advice = await generateCoachAdvice(summary);
    return res.json({ summary, advice: advice.message });
  } catch (error) {
    return next(error);
  }
}
