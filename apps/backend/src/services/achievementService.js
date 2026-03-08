import { pool } from '../config/db.js';

export async function evaluateAchievements(userId) {
  const checks = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS count FROM workouts WHERE user_id = $1', [userId]),
    pool.query('SELECT COUNT(*)::int AS count FROM mood_logs WHERE user_id = $1 AND meditation_minutes > 0', [userId]),
    pool.query('SELECT MAX(current_count)::int AS best FROM streaks WHERE user_id = $1', [userId])
  ]);

  const workoutCount = checks[0].rows[0].count;
  const meditationCount = checks[1].rows[0].count;
  const bestStreak = checks[2].rows[0].best || 0;

  const codes = [];
  if (workoutCount >= 1) codes.push('first_workout');
  if (bestStreak >= 7) codes.push('streak_7');
  if (bestStreak >= 30) codes.push('streak_30');
  if (workoutCount >= 100) codes.push('workout_100');
  if (meditationCount >= 100) codes.push('meditation_100');

  if (!codes.length) return [];

  const achievements = await pool.query(
    'SELECT id, code, title, xp_reward FROM achievements WHERE code = ANY($1::text[])',
    [codes]
  );

  const unlocked = [];
  for (const achievement of achievements.rows) {
    const result = await pool.query(
      `INSERT INTO user_achievements (user_id, achievement_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, achievement_id) DO NOTHING
       RETURNING id`,
      [userId, achievement.id]
    );

    if (result.rowCount > 0) {
      unlocked.push(achievement);
    }
  }

  return unlocked;
}
