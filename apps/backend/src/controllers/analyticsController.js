import { pool } from '../config/db.js';

export async function getAnalytics(req, res, next) {
  try {
    const userId = req.user.id;

    const [xpTrend, workoutTrend, sleepTrend, nutritionTrend] = await Promise.all([
      pool.query(
        `SELECT DATE(created_at) AS day, SUM(xp_change)::int AS xp
         FROM xp_events
         WHERE user_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '14 day'
         GROUP BY DATE(created_at)
         ORDER BY day`,
        [userId]
      ),
      pool.query(
        `SELECT DATE(performed_at) AS day, COUNT(*)::int AS sessions
         FROM workouts
         WHERE user_id = $1 AND performed_at >= CURRENT_DATE - INTERVAL '14 day'
         GROUP BY DATE(performed_at)
         ORDER BY day`,
        [userId]
      ),
      pool.query(
        `SELECT DATE(slept_at) AS day, AVG(hours)::numeric(4,2) AS hours
         FROM sleep_logs
         WHERE user_id = $1 AND slept_at >= CURRENT_DATE - INTERVAL '14 day'
         GROUP BY DATE(slept_at)
         ORDER BY day`,
        [userId]
      ),
      pool.query(
        `SELECT DATE(m.consumed_at) AS day, SUM(f.calories * m.quantity)::int AS calories
         FROM meals m
         JOIN food_items f ON f.id = m.food_item_id
         WHERE m.user_id = $1 AND m.consumed_at >= CURRENT_DATE - INTERVAL '14 day'
         GROUP BY DATE(m.consumed_at)
         ORDER BY day`,
        [userId]
      )
    ]);

    return res.json({
      xpGrowth: xpTrend.rows,
      workoutFrequency: workoutTrend.rows,
      sleepTrend: sleepTrend.rows,
      nutritionTrend: nutritionTrend.rows,
      weightTrend: [
        { day: 'Week 1', weight: 72.4 },
        { day: 'Week 2', weight: 72.0 },
        { day: 'Week 3', weight: 71.8 },
        { day: 'Week 4', weight: 71.5 }
      ]
    });
  } catch (error) {
    return next(error);
  }
}
