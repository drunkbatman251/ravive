import { pool } from '../config/db.js';
import { deriveLevel } from '../utils/levelUtils.js';

function normalizeStats(stats = {}) {
  return {
    health: Number(stats.health || 0),
    strength: Number(stats.strength || 0),
    focus: Number(stats.focus || 0),
    discipline: Number(stats.discipline || 0),
    knowledge: Number(stats.knowledge || 0)
  };
}

export async function applyXpEvent({ userId, sourceType, sourceId, action, xpChange, lifeScoreChange = 0, statsDelta = {} }) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const userResult = await client.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [userId]);
    if (!userResult.rowCount) throw new Error('User not found');

    const user = userResult.rows[0];
    const delta = normalizeStats(statsDelta);

    const totalXp = Math.max(0, Number(user.total_xp) + Number(xpChange));
    const lifeScore = Math.max(0, Number(user.life_score) + Number(lifeScoreChange));

    const nextStats = {
      health: Math.max(0, Number(user.health) + delta.health),
      strength: Math.max(0, Number(user.strength) + delta.strength),
      focus: Math.max(0, Number(user.focus) + delta.focus),
      discipline: Math.max(0, Number(user.discipline) + delta.discipline),
      knowledge: Math.max(0, Number(user.knowledge) + delta.knowledge)
    };

    const levelInfo = deriveLevel(totalXp);

    await client.query(
      `UPDATE users SET
        total_xp = $2,
        life_score = $3,
        level = $4,
        health = $5,
        strength = $6,
        focus = $7,
        discipline = $8,
        knowledge = $9,
        updated_at = NOW()
      WHERE id = $1`,
      [
        userId,
        totalXp,
        lifeScore,
        levelInfo.level,
        nextStats.health,
        nextStats.strength,
        nextStats.focus,
        nextStats.discipline,
        nextStats.knowledge
      ]
    );

    const eventResult = await client.query(
      `INSERT INTO xp_events (user_id, source_type, source_id, action, xp_change, life_score_change, stats_delta)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [userId, sourceType, sourceId || null, action, xpChange, lifeScoreChange, JSON.stringify(delta)]
    );

    await client.query('COMMIT');

    return {
      event: eventResult.rows[0],
      user: {
        ...user,
        total_xp: totalXp,
        life_score: lifeScore,
        level: levelInfo.level,
        ...nextStats,
        xp_into_level: levelInfo.xpIntoLevel,
        xp_to_next_level: levelInfo.xpToNextLevel
      }
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function upsertStreak(userId, streakType, positive = true) {
  const today = new Date().toISOString().slice(0, 10);
  const streakResult = await pool.query(
    'SELECT * FROM streaks WHERE user_id = $1 AND streak_type = $2',
    [userId, streakType]
  );

  if (!streakResult.rowCount) {
    await pool.query(
      'INSERT INTO streaks (user_id, streak_type, current_count, best_count, last_logged_date) VALUES ($1,$2,$3,$4,$5)',
      [userId, streakType, positive ? 1 : 0, positive ? 1 : 0, today]
    );
    return { current: positive ? 1 : 0, best: positive ? 1 : 0 };
  }

  const streak = streakResult.rows[0];
  let current = streak.current_count;

  if (!positive) {
    current = 0;
  } else if (streak.last_logged_date?.toISOString?.().slice(0, 10) === today) {
    current = streak.current_count;
  } else {
    current = streak.current_count + 1;
  }

  const best = Math.max(streak.best_count, current);

  await pool.query(
    'UPDATE streaks SET current_count = $3, best_count = $4, last_logged_date = $5 WHERE user_id = $1 AND streak_type = $2',
    [userId, streakType, current, best, today]
  );

  return { current, best };
}

export async function getUserByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

export async function getUserByLoginId(loginId) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [loginId]);
  return result.rows[0] || null;
}

export async function getUserById(userId) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows[0] || null;
}
