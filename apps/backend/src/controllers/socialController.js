import { z } from 'zod';
import { pool } from '../config/db.js';

function makeFriendCode(userId) {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RV${String(userId).padStart(3, '0')}${suffix}`;
}

async function ensureFriendCode(userId) {
  const existing = await pool.query('SELECT friend_code FROM users WHERE id = $1', [userId]);
  const current = existing.rows[0]?.friend_code;
  if (current) return current;

  let code = makeFriendCode(userId);
  let attempts = 0;

  while (attempts < 5) {
    try {
      await pool.query('UPDATE users SET friend_code = $2 WHERE id = $1', [userId, code]);
      return code;
    } catch {
      attempts += 1;
      code = makeFriendCode(userId);
    }
  }

  return code;
}

const friendRequestSchema = z.object({
  friendCode: z.string().trim().min(4)
});

const friendRespondSchema = z.object({
  requestId: z.number().int(),
  action: z.enum(['accept', 'reject'])
});

const challengeSchema = z.object({
  title: z.string().min(3).max(120),
  targetXp: z.number().int().min(50).max(10000).default(300),
  durationDays: z.number().int().min(1).max(30).default(7)
});

export async function getSocialOverview(req, res, next) {
  try {
    const userId = req.user.id;
    const friendCode = await ensureFriendCode(userId);

    const [incoming, friends, leaderboard, challenges] = await Promise.all([
      pool.query(
        `SELECT fr.id, u.id AS sender_id, u.name, u.friend_code, fr.created_at
         FROM friend_requests fr
         JOIN users u ON u.id = fr.sender_id
         WHERE fr.receiver_id = $1 AND fr.status = 'pending'
         ORDER BY fr.created_at DESC`,
        [userId]
      ),
      pool.query(
        `SELECT u.id, u.name, u.friend_code, u.level, u.total_xp, u.life_score
         FROM friend_requests fr
         JOIN users u ON u.id = CASE WHEN fr.sender_id = $1 THEN fr.receiver_id ELSE fr.sender_id END
         WHERE (fr.sender_id = $1 OR fr.receiver_id = $1) AND fr.status = 'accepted'
         ORDER BY u.total_xp DESC`,
        [userId]
      ),
      pool.query(
        `WITH friend_ids AS (
            SELECT CASE WHEN fr.sender_id = $1 THEN fr.receiver_id ELSE fr.sender_id END AS id
            FROM friend_requests fr
            WHERE (fr.sender_id = $1 OR fr.receiver_id = $1) AND fr.status = 'accepted'
            UNION SELECT $1
          )
          SELECT u.id, u.name, u.level,
            COALESCE((SELECT SUM(xp_change) FROM xp_events xe WHERE xe.user_id = u.id AND xe.created_at >= CURRENT_DATE - INTERVAL '7 day'), 0)::int AS weekly_xp
          FROM users u
          JOIN friend_ids f ON f.id = u.id
          ORDER BY weekly_xp DESC, u.level DESC`,
        [userId]
      ),
      pool.query(
        `SELECT sc.id, sc.title, sc.target_xp, sc.start_date, sc.end_date, sc.status,
                creator.name AS creator_name,
                EXISTS (
                  SELECT 1 FROM social_challenge_participants p
                  WHERE p.challenge_id = sc.id AND p.user_id = $1
                ) AS joined
         FROM social_challenges sc
         JOIN users creator ON creator.id = sc.creator_id
         WHERE sc.status = 'active'
           AND (
             sc.creator_id = $1
             OR sc.creator_id IN (
               SELECT CASE WHEN fr.sender_id = $1 THEN fr.receiver_id ELSE fr.sender_id END
               FROM friend_requests fr
               WHERE (fr.sender_id = $1 OR fr.receiver_id = $1) AND fr.status = 'accepted'
             )
           )
         ORDER BY sc.created_at DESC
         LIMIT 20`,
        [userId]
      )
    ]);

    return res.json({
      me: { friendCode },
      incomingRequests: incoming.rows,
      friends: friends.rows,
      leaderboard: leaderboard.rows,
      challenges: challenges.rows
    });
  } catch (error) {
    return next(error);
  }
}

export async function sendFriendRequest(req, res, next) {
  try {
    const userId = req.user.id;
    const payload = friendRequestSchema.parse(req.body);

    const target = await pool.query('SELECT id, name FROM users WHERE friend_code = $1', [payload.friendCode.toUpperCase()]);
    if (!target.rowCount) return res.status(404).json({ message: 'Friend code not found' });

    const receiverId = target.rows[0].id;
    if (receiverId === userId) return res.status(400).json({ message: 'You cannot add yourself' });

    const existing = await pool.query(
      `SELECT * FROM friend_requests
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)`,
      [userId, receiverId]
    );

    if (existing.rowCount) {
      return res.status(409).json({ message: `Friend request already ${existing.rows[0].status}` });
    }

    const request = await pool.query(
      `INSERT INTO friend_requests (sender_id, receiver_id, status)
       VALUES ($1,$2,'pending')
       RETURNING id, status, created_at`,
      [userId, receiverId]
    );

    return res.status(201).json({ request: request.rows[0], receiver: target.rows[0] });
  } catch (error) {
    return next(error);
  }
}

export async function respondFriendRequest(req, res, next) {
  try {
    const userId = req.user.id;
    const payload = friendRespondSchema.parse(req.body);

    const request = await pool.query(
      `SELECT * FROM friend_requests
       WHERE id = $1 AND receiver_id = $2 AND status = 'pending'`,
      [payload.requestId, userId]
    );

    if (!request.rowCount) return res.status(404).json({ message: 'Request not found' });

    const nextStatus = payload.action === 'accept' ? 'accepted' : 'rejected';
    await pool.query(
      'UPDATE friend_requests SET status = $2, responded_at = NOW() WHERE id = $1',
      [payload.requestId, nextStatus]
    );

    return res.json({ ok: true, status: nextStatus });
  } catch (error) {
    return next(error);
  }
}

export async function createChallenge(req, res, next) {
  try {
    const userId = req.user.id;
    const payload = challengeSchema.parse(req.body);

    const challenge = await pool.query(
      `INSERT INTO social_challenges (creator_id, title, target_xp, end_date)
       VALUES ($1,$2,$3,CURRENT_DATE + ($4 || ' day')::interval)
       RETURNING *`,
      [userId, payload.title, payload.targetXp, payload.durationDays]
    );

    await pool.query(
      `INSERT INTO social_challenge_participants (challenge_id, user_id)
       VALUES ($1,$2)
       ON CONFLICT (challenge_id, user_id) DO NOTHING`,
      [challenge.rows[0].id, userId]
    );

    return res.status(201).json(challenge.rows[0]);
  } catch (error) {
    return next(error);
  }
}

export async function joinChallenge(req, res, next) {
  try {
    const userId = req.user.id;
    const challengeId = Number(req.params.id);

    const challenge = await pool.query('SELECT * FROM social_challenges WHERE id = $1 AND status = $2', [challengeId, 'active']);
    if (!challenge.rowCount) return res.status(404).json({ message: 'Challenge not found' });

    await pool.query(
      `INSERT INTO social_challenge_participants (challenge_id, user_id)
       VALUES ($1,$2)
       ON CONFLICT (challenge_id, user_id) DO NOTHING`,
      [challengeId, userId]
    );

    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
}

export async function getChallengeBoard(req, res, next) {
  try {
    const challengeId = Number(req.params.id);

    const challenge = await pool.query('SELECT * FROM social_challenges WHERE id = $1', [challengeId]);
    if (!challenge.rowCount) return res.status(404).json({ message: 'Challenge not found' });

    const board = await pool.query(
      `SELECT u.id, u.name,
              COALESCE((
                SELECT SUM(xe.xp_change)
                FROM xp_events xe
                WHERE xe.user_id = u.id
                  AND xe.created_at::date BETWEEN $2 AND $3
              ), 0)::int AS xp_points
       FROM social_challenge_participants p
       JOIN users u ON u.id = p.user_id
       WHERE p.challenge_id = $1
       ORDER BY xp_points DESC`,
      [challengeId, challenge.rows[0].start_date, challenge.rows[0].end_date]
    );

    return res.json({ challenge: challenge.rows[0], board: board.rows });
  } catch (error) {
    return next(error);
  }
}
