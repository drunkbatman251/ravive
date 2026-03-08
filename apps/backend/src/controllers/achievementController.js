import { pool } from '../config/db.js';
import { evaluateAchievements } from '../services/achievementService.js';
import { applyXpEvent } from '../services/userService.js';

export async function evaluateAndList(req, res, next) {
  try {
    const userId = req.user.id;
    const unlocked = await evaluateAchievements(userId);

    for (const item of unlocked) {
      await applyXpEvent({
        userId,
        sourceType: 'achievement',
        sourceId: item.id,
        action: `Achievement unlocked: ${item.title}`,
        xpChange: item.xp_reward,
        lifeScoreChange: 5,
        statsDelta: { discipline: 2, focus: 1 }
      });
    }

    const list = await pool.query(
      `SELECT a.*, ua.unlocked_at
       FROM achievements a
       LEFT JOIN user_achievements ua
         ON ua.achievement_id = a.id AND ua.user_id = $1
       ORDER BY a.id`,
      [userId]
    );

    return res.json({ unlockedNow: unlocked, achievements: list.rows });
  } catch (error) {
    return next(error);
  }
}
