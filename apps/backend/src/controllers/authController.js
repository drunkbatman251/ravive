import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../config/db.js';
import { env } from '../config/env.js';
import { getUserByEmail } from '../services/userService.js';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

function tokenFor(user) {
  return jwt.sign({ id: user.id, email: user.email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });
}

function friendCodeFromId(id) {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RV${String(id).padStart(3, '0')}${suffix}`;
}

export async function register(req, res, next) {
  try {
    const payload = registerSchema.parse(req.body);
    const existing = await getUserByEmail(payload.email);
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1,$2,$3)
       RETURNING id, name, email, level, total_xp, life_score, health, strength, focus, discipline, knowledge`,
      [payload.name, payload.email, passwordHash]
    );

    const user = result.rows[0];
    const friendCode = friendCodeFromId(user.id);
    await pool.query('UPDATE users SET friend_code = $2 WHERE id = $1', [user.id, friendCode]);
    user.friend_code = friendCode;
    return res.status(201).json({ token: tokenFor(user), user });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const payload = loginSchema.parse(req.body);
    const user = await getUserByEmail(payload.email);
    if (!user || !user.password_hash) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(payload.password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    return res.json({
      token: tokenFor(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        level: user.level,
        total_xp: user.total_xp,
        life_score: user.life_score,
        health: user.health,
        strength: user.strength,
        focus: user.focus,
        discipline: user.discipline,
        knowledge: user.knowledge
      }
    });
  } catch (error) {
    return next(error);
  }
}

export async function oauthSuccess(req, res) {
  const token = tokenFor(req.user);
  return res.redirect(`${env.frontendUrl}?token=${token}`);
}
