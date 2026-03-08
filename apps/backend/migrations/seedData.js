import bcrypt from 'bcryptjs';
import { pool } from '../src/config/db.js';
import { foods } from '../src/data/foods.js';
import { exercises } from '../src/data/exercises.js';
import { achievements } from '../src/data/achievements.js';

async function seed() {
  try {
    const passwordHash = await bcrypt.hash('Demo@123', 10);

    const userInsert = await pool.query(
      `INSERT INTO users (name, email, password_hash, friend_code, age, weight_kg, height_cm, activity_level, goal)
       VALUES ('Demo User', 'demo@ravive.app', $1, 'RV001PLAY', 28, 72, 175, 'moderate', 'gain_muscle')
       ON CONFLICT (email)
       DO UPDATE SET name = EXCLUDED.name, friend_code = EXCLUDED.friend_code
       RETURNING id`,
      [passwordHash]
    );

    const demoUserId = userInsert.rows[0].id;

    const friendInsert = await pool.query(
      `INSERT INTO users (name, email, password_hash, friend_code, age, weight_kg, height_cm, activity_level, goal, total_xp, level, life_score)
       VALUES ('Buddy Hero', 'buddy@ravive.app', $1, 'RV002BUDY', 27, 69, 172, 'moderate', 'maintain', 620, 4, 118)
       ON CONFLICT (email)
       DO UPDATE SET name = EXCLUDED.name, friend_code = EXCLUDED.friend_code
       RETURNING id`,
      [passwordHash]
    );

    const buddyUserId = friendInsert.rows[0].id;

    const satabdiInsert = await pool.query(
      `INSERT INTO users (name, email, password_hash, friend_code, age, weight_kg, height_cm, activity_level, goal, equipment_preferences)
       VALUES ('Satabdi', 'satabdi@ravive.app', $1, 'RV003SATA', 30, 67, 163, 'moderate', 'gain_muscle', ARRAY['Yoga Mat','Resistance Bands','Dumbbells'])
       ON CONFLICT (email)
       DO UPDATE SET name = EXCLUDED.name, friend_code = EXCLUDED.friend_code
       RETURNING id`,
      [passwordHash]
    );

    const satabdiUserId = satabdiInsert.rows[0].id;

    for (const item of foods) {
      await pool.query(
        `INSERT INTO food_items (name, category, calories, protein, carbs, fat, fiber, vitamins, minerals)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (name) DO NOTHING`,
        [
          item.name,
          item.category,
          item.calories,
          item.protein,
          item.carbs,
          item.fat,
          item.fiber,
          item.vitamins,
          item.minerals
        ]
      );
    }

    for (const exercise of exercises) {
      await pool.query(
        `INSERT INTO exercises (name, category, calories_burned_per_30min, muscles_used, difficulty, xp_reward)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (name) DO NOTHING`,
        [
          exercise.name,
          exercise.category,
          exercise.calories_burned_per_30min,
          exercise.muscles_used,
          exercise.difficulty,
          exercise.xp_reward
        ]
      );
    }

    for (const achievement of achievements) {
      await pool.query(
        `INSERT INTO achievements (code, title, description, xp_reward, icon)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (code) DO NOTHING`,
        [achievement.code, achievement.title, achievement.description, achievement.xp_reward, achievement.icon]
      );
    }

    await pool.query(
      `INSERT INTO friend_requests (sender_id, receiver_id, status, responded_at)
       VALUES ($1, $2, 'accepted', NOW())
       ON CONFLICT (sender_id, receiver_id)
       DO UPDATE SET status = 'accepted', responded_at = NOW()`,
      [demoUserId, buddyUserId]
    );

    const challengeResult = await pool.query(
      `INSERT INTO social_challenges (creator_id, title, target_xp, start_date, end_date, status)
       VALUES ($1, '7 Day XP Sprint', 500, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 day', 'active')
       RETURNING id`,
      [demoUserId]
    );

    const challengeId = challengeResult.rows[0].id;
    await pool.query(
      `INSERT INTO social_challenge_participants (challenge_id, user_id)\n       VALUES ($1,$2), ($1,$3)\n       ON CONFLICT (challenge_id, user_id) DO NOTHING`,
      [challengeId, demoUserId, buddyUserId]
    );

    const satabdiProgram = [
      ['Warmup Flow', 'Cat Cow Stretch', 'Mobilize spine and shoulders before strength work.', ['Start on all fours', 'Inhale arch your back', 'Exhale round your back', 'Repeat slowly'], '8 reps', 90],
      ['Lower Body', 'Supported Squats', 'Controlled squats while maintaining chest up.', ['Feet shoulder-width apart', 'Sit back like a chair', 'Push through heels to stand'], '10 reps', 120],
      ['Upper Body', 'Band Rows', 'Pull resistance band to activate upper back.', ['Anchor band at chest level', 'Pull elbows back', 'Pause and release with control'], '12 reps', 120],
      ['Core', 'Dead Bug', 'Core stability drill with alternating limbs.', ['Lie on back with knees up', 'Extend opposite arm and leg', 'Return and alternate'], '10 reps each side', 150]
    ];

    for (const [group, name, description, steps, reps, duration] of satabdiProgram) {
      await pool.query(
        `INSERT INTO custom_exercises
          (user_id, program_name, routine_group, exercise_name, description, steps, repetitions, duration_sec, animation_type, animation_payload, source_file)
         VALUES
          ($1, 'Satabdi Training Program', $2, $3, $4, $5::jsonb, $6, $7, 'skeletal', $8::jsonb, 'seed')
         ON CONFLICT DO NOTHING`,
        [
          satabdiUserId,
          group,
          name,
          description,
          JSON.stringify(steps),
          reps,
          duration,
          JSON.stringify({ style: 'loop', bodyFocus: group.toLowerCase() })
        ]
      );
    }

    console.log('Seed completed. Demo user id:', demoUserId, 'Buddy user id:', buddyUserId, 'Satabdi user id:', satabdiUserId);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
