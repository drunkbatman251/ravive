import { z } from 'zod';
import { pool } from '../config/db.js';
import { applyXpEvent, upsertStreak } from '../services/userService.js';
import { resolveAction, recoverySuggestion } from '../services/xpEngine.js';

const habitSchema = z.object({
  name: z.string().min(2),
  status: z.enum(['done', 'missed', 'negative']),
  score: z.number().int().optional()
});

const moodSchema = z.object({
  mood: z.enum(['Happy', 'Calm', 'Tired', 'Stressed', 'Anxious']),
  stressLevel: z.number().min(1).max(10).default(5),
  meditationMinutes: z.number().int().min(0).default(0),
  notes: z.string().optional()
});

const readingSchema = z.object({
  title: z.string().min(1),
  pagesRead: z.number().int().min(0),
  minutesRead: z.number().int().min(1)
});

const sleepSchema = z.object({
  hours: z.number().min(0),
  quality: z.enum(['poor', 'fair', 'good', 'great']).default('good'),
  deepSleepHours: z.number().min(0).default(0),
  consistencyScore: z.number().int().min(0).max(100).default(60)
});

const negativeEventSchema = z.object({
  actionKey: z.enum([
    'cigarette',
    'heavy_smoking',
    'alcohol',
    'heavy_drinking',
    'fast_food',
    'sugary_dessert',
    'sleep_under_5',
    'inactivity_day'
  ]),
  notes: z.string().optional()
});

export async function addHabit(req, res, next) {
  try {
    const userId = req.user.id;
    const payload = habitSchema.parse(req.body);

    const habit = await pool.query(
      'INSERT INTO habits (user_id, name, status, score) VALUES ($1,$2,$3,$4) RETURNING *',
      [userId, payload.name, payload.status, payload.score || 0]
    );

    const positive = payload.status === 'done';
    const xpChange = positive ? 35 : payload.status === 'negative' ? -35 : -15;
    const statsDelta = positive
      ? { discipline: 3, focus: 2 }
      : payload.status === 'negative'
      ? { discipline: -3 }
      : { discipline: -1 };

    const xp = await applyXpEvent({
      userId,
      sourceType: 'habit',
      sourceId: habit.rows[0].id,
      action: `Habit: ${payload.name} (${payload.status})`,
      xpChange,
      lifeScoreChange: positive ? 2 : -2,
      statsDelta
    });

    await upsertStreak(userId, 'habit', positive);

    return res.status(201).json({ habit: habit.rows[0], xpEvent: xp.event });
  } catch (error) {
    return next(error);
  }
}

export async function addMood(req, res, next) {
  try {
    const userId = req.user.id;
    const payload = moodSchema.parse(req.body);

    const mood = await pool.query(
      `INSERT INTO mood_logs (user_id, mood, stress_level, meditation_minutes, notes)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [userId, payload.mood, payload.stressLevel, payload.meditationMinutes, payload.notes || null]
    );

    const meditationBoost = payload.meditationMinutes >= 20 ? 50 : payload.meditationMinutes >= 10 ? 25 : 0;
    const xpChange = payload.mood === 'Stressed' || payload.mood === 'Anxious' ? -15 + meditationBoost : 20 + meditationBoost;
    const statsDelta = {
      focus: payload.meditationMinutes >= 20 ? 4 : 1,
      discipline: payload.meditationMinutes >= 20 ? 2 : 0,
      health: payload.mood === 'Stressed' ? -1 : 1
    };

    const xp = await applyXpEvent({
      userId,
      sourceType: 'mood',
      sourceId: mood.rows[0].id,
      action: `Mood: ${payload.mood}`,
      xpChange,
      lifeScoreChange: xpChange > 0 ? 2 : -1,
      statsDelta
    });

    return res.status(201).json({ mood: mood.rows[0], xpEvent: xp.event });
  } catch (error) {
    return next(error);
  }
}

export async function addReading(req, res, next) {
  try {
    const userId = req.user.id;
    const payload = readingSchema.parse(req.body);

    const reading = await pool.query(
      `INSERT INTO reading_logs (user_id, title, pages_read, minutes_read)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [userId, payload.title, payload.pagesRead, payload.minutesRead]
    );

    const xpChange = payload.minutesRead >= 30 ? 40 : payload.minutesRead >= 20 ? 30 : 15;

    const xp = await applyXpEvent({
      userId,
      sourceType: 'reading',
      sourceId: reading.rows[0].id,
      action: `Reading: ${payload.title}`,
      xpChange,
      lifeScoreChange: 2,
      statsDelta: { knowledge: 4, focus: 2 }
    });

    await upsertStreak(userId, 'reading', true);

    return res.status(201).json({ reading: reading.rows[0], xpEvent: xp.event });
  } catch (error) {
    return next(error);
  }
}

export async function addSleep(req, res, next) {
  try {
    const userId = req.user.id;
    const payload = sleepSchema.parse(req.body);

    const sleep = await pool.query(
      `INSERT INTO sleep_logs (user_id, hours, quality, deep_sleep_hours, consistency_score)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [userId, payload.hours, payload.quality, payload.deepSleepHours, payload.consistencyScore]
    );

    const actionKey = payload.hours >= 7 ? 'sleep_7h' : payload.hours < 5 ? 'sleep_under_5' : null;
    const action = actionKey ? resolveAction(actionKey) : { xp: 10, lifeScore: 1, stats: { health: 1, focus: 1 } };

    const xp = await applyXpEvent({
      userId,
      sourceType: 'sleep',
      sourceId: sleep.rows[0].id,
      action: `Sleep: ${payload.hours}h`,
      xpChange: action.xp,
      lifeScoreChange: action.lifeScore,
      statsDelta: action.stats
    });

    await upsertStreak(userId, 'sleep', payload.hours >= 7);

    return res.status(201).json({
      sleep: sleep.rows[0],
      xpEvent: xp.event,
      recoverySuggestion: actionKey === 'sleep_under_5' ? recoverySuggestion('sleep_under_5') : null
    });
  } catch (error) {
    return next(error);
  }
}

export async function addNegativeEvent(req, res, next) {
  try {
    const userId = req.user.id;
    const payload = negativeEventSchema.parse(req.body);
    const action = resolveAction(payload.actionKey);

    const xp = await applyXpEvent({
      userId,
      sourceType: 'negative_action',
      sourceId: null,
      action: payload.actionKey,
      xpChange: action.xp,
      lifeScoreChange: action.lifeScore,
      statsDelta: action.stats
    });

    await upsertStreak(userId, 'habit', false);

    return res.status(201).json({
      xpEvent: xp.event,
      recoverySuggestion: recoverySuggestion(payload.actionKey)
    });
  } catch (error) {
    return next(error);
  }
}
