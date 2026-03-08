import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import bcrypt from 'bcryptjs';
import { pool } from '../src/config/db.js';

const DEFAULT_PDF = '/Users/ravisingh/Downloads/8-Week_Low_Impact_Strength.pdf';

function cleanLine(line) {
  return line.replace(/\s+/g, ' ').replace(/[•●]/g, '').trim();
}

function isRoutineHeading(line) {
  return /^(week|day|phase|session|block)\s*\d*/i.test(line) || /warm ?up|cool ?down/i.test(line);
}

function looksLikeExerciseName(line) {
  if (line.length < 3 || line.length > 80) return false;
  if (/^\d+$/.test(line)) return false;
  if (/^(notes?|tips?|instructions?)$/i.test(line)) return false;
  const words = line.split(' ');
  return words.length <= 8 && /^[A-Za-z0-9()'/-]+(?: [A-Za-z0-9()'/-]+)*$/.test(line);
}

function parseMeta(text) {
  const reps = text.match(/(\d+\s*(?:reps?|x|sets?))/i)?.[1] || null;
  const sec = text.match(/(\d+\s*(?:sec|secs|seconds|min|mins|minutes))/i)?.[1] || null;
  const durationSec = sec
    ? (() => {
        const value = Number(sec.match(/\d+/)?.[0] || 0);
        return /min/i.test(sec) ? value * 60 : value;
      })()
    : 0;

  return { repetitions: reps, durationSec };
}

function toAnimationPayload(exerciseName) {
  const n = exerciseName.toLowerCase();
  if (n.includes('squat') || n.includes('lunge')) return { style: 'loop', direction: 'up-down', bodyFocus: 'legs' };
  if (n.includes('row') || n.includes('press') || n.includes('push')) return { style: 'loop', direction: 'pull-push', bodyFocus: 'upper' };
  if (n.includes('plank') || n.includes('dead bug') || n.includes('core')) return { style: 'loop', direction: 'hold', bodyFocus: 'core' };
  return { style: 'loop', direction: 'flow', bodyFocus: 'full' };
}

function parseExercises(text) {
  const lines = text
    .split('\n')
    .map(cleanLine)
    .filter(Boolean);

  const exercises = [];
  let currentGroup = 'General';
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (isRoutineHeading(line)) {
      currentGroup = line;
      i += 1;
      continue;
    }

    if (!looksLikeExerciseName(line)) {
      i += 1;
      continue;
    }

    const exerciseName = line;
    const stepLines = [];
    i += 1;

    while (i < lines.length && !isRoutineHeading(lines[i]) && !looksLikeExerciseName(lines[i])) {
      stepLines.push(lines[i]);
      i += 1;
    }

    if (!stepLines.length) continue;
    const description = stepLines[0];
    const steps = stepLines.slice(1, 6);
    const meta = parseMeta(stepLines.join(' '));

    exercises.push({
      routine_group: currentGroup,
      exercise_name: exerciseName,
      description,
      steps,
      repetitions: meta.repetitions || '10 reps',
      duration_sec: meta.durationSec || 90
    });
  }

  return exercises;
}

const fallbackExercises = [
  {
    routine_group: 'Week 1',
    exercise_name: 'Chair Squat',
    description: 'Low-impact squat to build leg strength safely.',
    steps: ['Stand in front of a chair', 'Lower slowly until seated', 'Stand back up through heels'],
    repetitions: '10 reps',
    duration_sec: 90
  },
  {
    routine_group: 'Week 1',
    exercise_name: 'Wall Pushup',
    description: 'Upper body pressing with minimal joint stress.',
    steps: ['Hands on wall at shoulder height', 'Bend elbows toward wall', 'Push back to start'],
    repetitions: '12 reps',
    duration_sec: 90
  },
  {
    routine_group: 'Week 2',
    exercise_name: 'Glute Bridge',
    description: 'Posterior chain activation with core control.',
    steps: ['Lie on back with bent knees', 'Press hips upward', 'Pause and lower with control'],
    repetitions: '12 reps',
    duration_sec: 90
  },
  {
    routine_group: 'Week 2',
    exercise_name: 'Bird Dog',
    description: 'Balance and core stability movement.',
    steps: ['Start on all fours', 'Extend opposite arm and leg', 'Return and switch sides'],
    repetitions: '10 reps each side',
    duration_sec: 120
  }
];

async function ensureSatabdiUser() {
  const existing = await pool.query(
    `SELECT id
     FROM users
     WHERE LOWER(name) = 'satabdi' OR LOWER(email) = 'satabdi@ravive.app'
     LIMIT 1`
  );
  if (existing.rowCount) return existing.rows[0].id;

  const passwordHash = await bcrypt.hash('Demo@123', 10);
  const inserted = await pool.query(
    `INSERT INTO users (name, email, password_hash, friend_code, age, weight_kg, height_cm, activity_level, goal, equipment_preferences)
     VALUES ('Satabdi', 'satabdi@ravive.app', $1, 'RV003SATA', 30, 67, 163, 'moderate', 'gain_muscle', ARRAY['Yoga Mat','Resistance Bands','Dumbbells'])
     RETURNING id`,
    [passwordHash]
  );
  return inserted.rows[0].id;
}

async function run() {
  const pdfPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_PDF;

  try {
    const satabdiUserId = await ensureSatabdiUser();
    const buffer = await fs.readFile(pdfPath);
    const parsed = await pdfParse(buffer);
    const extracted = parseExercises(parsed.text);
    const exercises = extracted.length ? extracted : fallbackExercises;

    await pool.query('DELETE FROM custom_exercises WHERE user_id = $1 AND program_name = $2', [satabdiUserId, 'Satabdi Training Program']);

    for (const ex of exercises) {
      await pool.query(
        `INSERT INTO custom_exercises
          (user_id, program_name, routine_group, exercise_name, description, steps, repetitions, duration_sec, animation_type, animation_payload, source_file)
         VALUES
          ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, 'skeletal', $9::jsonb, $10)`,
        [
          satabdiUserId,
          'Satabdi Training Program',
          ex.routine_group || 'General',
          ex.exercise_name,
          ex.description || '',
          JSON.stringify(ex.steps || []),
          ex.repetitions || null,
          ex.duration_sec || 90,
          JSON.stringify(toAnimationPayload(ex.exercise_name)),
          path.basename(pdfPath)
        ]
      );
    }

    console.log(`Imported ${exercises.length} exercises for Satabdi from ${pdfPath}`);
  } catch (error) {
    console.error('Failed to import Satabdi PDF:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
