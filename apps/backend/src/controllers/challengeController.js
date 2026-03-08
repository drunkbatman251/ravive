import { z } from 'zod';
import { pool } from '../config/db.js';
import { applyXpEvent, upsertStreak } from '../services/userService.js';

const miniChallenges = [
  { title: 'Drink one glass of water', durationSec: 60, xpReward: 10, recovery: 'Hydration boost' },
  { title: 'Do 10 pushups', durationSec: 120, xpReward: 15, recovery: 'Strength micro-burst' },
  { title: '2 minute stretch', durationSec: 120, xpReward: 12, recovery: 'Mobility reset' },
  { title: '20 deep breaths', durationSec: 90, xpReward: 10, recovery: 'Stress recovery' },
  { title: '3 minute walk', durationSec: 180, xpReward: 15, recovery: 'Active recovery walk' }
];

const completeSchema = z.object({
  challengeId: z.string().min(2)
});

function pickDailyChallenge(userId) {
  const day = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const seed = Number(day) + Number(userId) * 13;
  return { id: `mini-${seed % 100000}`, ...miniChallenges[seed % miniChallenges.length] };
}

export async function getDailyMiniChallenge(req, res, next) {
  try {
    const userId = req.user.id;
    const existing = await pool.query(
      `SELECT challenge_payload, completed, xp_awarded, challenge_date
       FROM user_daily_challenges
       WHERE user_id = $1 AND challenge_date = CURRENT_DATE`,
      [userId]
    );

    if (existing.rowCount) return res.json(existing.rows[0]);

    const daily = pickDailyChallenge(userId);
    const inserted = await pool.query(
      `INSERT INTO user_daily_challenges (user_id, challenge_payload)
       VALUES ($1, $2::jsonb)
       ON CONFLICT (user_id, challenge_date) DO UPDATE SET challenge_payload = EXCLUDED.challenge_payload
       RETURNING challenge_payload, completed, xp_awarded, challenge_date`,
      [userId, JSON.stringify(daily)]
    );

    return res.json(inserted.rows[0]);
  } catch (error) {
    return next(error);
  }
}

export async function completeDailyMiniChallenge(req, res, next) {
  try {
    const userId = req.user.id;
    const payload = completeSchema.parse(req.body);

    const row = await pool.query(
      `SELECT id, challenge_payload, completed
       FROM user_daily_challenges
       WHERE user_id = $1 AND challenge_date = CURRENT_DATE`,
      [userId]
    );

    if (!row.rowCount) return res.status(404).json({ message: 'No mini challenge found for today' });
    if (row.rows[0].completed) return res.status(409).json({ message: 'Mini challenge already completed' });

    const challenge = row.rows[0].challenge_payload;
    if (challenge.id !== payload.challengeId) {
      return res.status(400).json({ message: 'Challenge mismatch' });
    }

    const xp = await applyXpEvent({
      userId,
      sourceType: 'mini_challenge',
      sourceId: row.rows[0].id,
      action: `Mini challenge: ${challenge.title}`,
      xpChange: challenge.xpReward,
      lifeScoreChange: 2,
      statsDelta: { discipline: 2, health: 1, focus: 1 }
    });

    await pool.query(
      `UPDATE user_daily_challenges
       SET completed = TRUE, completed_at = NOW(), xp_awarded = $2
       WHERE id = $1`,
      [row.rows[0].id, challenge.xpReward]
    );

    await upsertStreak(userId, 'mini_challenge', true);

    return res.json({ ok: true, challenge, xpEvent: xp.event });
  } catch (error) {
    return next(error);
  }
}
