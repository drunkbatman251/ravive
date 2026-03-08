import { pool } from '../config/db.js';
import { deriveLevel } from '../utils/levelUtils.js';

export async function getDashboard(req, res, next) {
  try {
    const userId = req.user.id;
    const [userResult, xpResult, streakResult] = await Promise.all([
      pool.query('SELECT * FROM users WHERE id = $1', [userId]),
      pool.query(
        `SELECT action, xp_change, created_at FROM xp_events
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 7`,
        [userId]
      ),
      pool.query('SELECT streak_type, current_count, best_count FROM streaks WHERE user_id = $1', [userId])
    ]);

    if (!userResult.rowCount) return res.status(404).json({ message: 'User not found' });

    const user = userResult.rows[0];
    const levelInfo = deriveLevel(user.total_xp);

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        level: user.level,
        total_xp: user.total_xp,
        xpIntoLevel: levelInfo.xpIntoLevel,
        xpToNextLevel: levelInfo.xpToNextLevel,
        life_score: user.life_score,
        stats: {
          health: user.health,
          strength: user.strength,
          focus: user.focus,
          discipline: user.discipline,
          knowledge: user.knowledge
        }
      },
      recentXpEvents: xpResult.rows,
      streaks: streakResult.rows
    });
  } catch (error) {
    return next(error);
  }
}
