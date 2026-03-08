CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) UNIQUE NOT NULL,
  password_hash TEXT,
  oauth_provider VARCHAR(40),
  oauth_id VARCHAR(120),
  friend_code VARCHAR(20) UNIQUE,
  equipment_preferences TEXT[] DEFAULT '{}',
  age INT DEFAULT 25,
  weight_kg NUMERIC(5,2) DEFAULT 70,
  height_cm NUMERIC(5,2) DEFAULT 170,
  activity_level VARCHAR(20) DEFAULT 'moderate',
  goal VARCHAR(30) DEFAULT 'maintain',
  target_weight_change_kg NUMERIC(5,2) DEFAULT 0,
  level INT DEFAULT 1,
  total_xp INT DEFAULT 0,
  life_score INT DEFAULT 100,
  health INT DEFAULT 10,
  strength INT DEFAULT 10,
  focus INT DEFAULT 10,
  discipline INT DEFAULT 10,
  knowledge INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS friend_code VARCHAR(20);
ALTER TABLE users
ADD COLUMN IF NOT EXISTS target_weight_change_kg NUMERIC(5,2) DEFAULT 0;
ALTER TABLE users
ADD COLUMN IF NOT EXISTS equipment_preferences TEXT[] DEFAULT '{}';

CREATE TABLE IF NOT EXISTS food_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) UNIQUE NOT NULL,
  category VARCHAR(80) NOT NULL,
  calories INT NOT NULL,
  protein NUMERIC(6,2) NOT NULL,
  carbs NUMERIC(6,2) NOT NULL,
  fat NUMERIC(6,2) NOT NULL,
  fiber NUMERIC(6,2) NOT NULL,
  vitamins TEXT,
  minerals TEXT
);

CREATE TABLE IF NOT EXISTS meals (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  food_item_id INT REFERENCES food_items(id),
  quantity NUMERIC(4,1) DEFAULT 1.0,
  meal_type VARCHAR(40) DEFAULT 'meal',
  consumed_at TIMESTAMP DEFAULT NOW(),
  notes TEXT
);

ALTER TABLE meals
ALTER COLUMN quantity TYPE NUMERIC(4,1) USING quantity::numeric;

CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) UNIQUE NOT NULL,
  category VARCHAR(60) NOT NULL,
  calories_burned_per_30min INT NOT NULL,
  muscles_used TEXT NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  xp_reward INT DEFAULT 40
);

CREATE TABLE IF NOT EXISTS workouts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  exercise_id INT REFERENCES exercises(id),
  duration_min INT NOT NULL,
  intensity VARCHAR(20) DEFAULT 'moderate',
  performed_at TIMESTAMP DEFAULT NOW(),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS habits (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  status VARCHAR(20) NOT NULL,
  score INT DEFAULT 0,
  logged_at TIMESTAMP DEFAULT NOW(),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS sleep_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  hours NUMERIC(4,2) NOT NULL,
  quality VARCHAR(20) DEFAULT 'good',
  deep_sleep_hours NUMERIC(4,2) DEFAULT 0,
  consistency_score INT DEFAULT 0,
  slept_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mood_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  mood VARCHAR(20) NOT NULL,
  stress_level INT DEFAULT 5,
  meditation_minutes INT DEFAULT 0,
  logged_at TIMESTAMP DEFAULT NOW(),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS reading_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  pages_read INT DEFAULT 0,
  minutes_read INT NOT NULL,
  logged_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xp_events (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  source_type VARCHAR(40) NOT NULL,
  source_id INT,
  action VARCHAR(200) NOT NULL,
  xp_change INT NOT NULL,
  life_score_change INT DEFAULT 0,
  stats_delta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  code VARCHAR(80) UNIQUE NOT NULL,
  title VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  xp_reward INT DEFAULT 0,
  icon VARCHAR(40) DEFAULT 'trophy'
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INT REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS streaks (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  streak_type VARCHAR(60) NOT NULL,
  current_count INT DEFAULT 0,
  best_count INT DEFAULT 0,
  last_logged_date DATE,
  UNIQUE (user_id, streak_type)
);

CREATE TABLE IF NOT EXISTS weight_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  weight_kg NUMERIC(5,2) NOT NULL,
  logged_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS friend_requests (
  id SERIAL PRIMARY KEY,
  sender_id INT REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INT REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP,
  UNIQUE (sender_id, receiver_id)
);

CREATE TABLE IF NOT EXISTS social_challenges (
  id SERIAL PRIMARY KEY,
  creator_id INT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(140) NOT NULL,
  target_xp INT DEFAULT 300,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_challenge_participants (
  id SERIAL PRIMARY KEY,
  challenge_id INT REFERENCES social_challenges(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (challenge_id, user_id)
);

CREATE TABLE IF NOT EXISTS user_daily_challenges (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  challenge_date DATE DEFAULT CURRENT_DATE,
  challenge_payload JSONB NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  xp_awarded INT DEFAULT 0,
  completed_at TIMESTAMP,
  UNIQUE (user_id, challenge_date)
);

CREATE TABLE IF NOT EXISTS custom_exercises (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  program_name VARCHAR(180) NOT NULL,
  routine_group VARCHAR(120) DEFAULT 'General',
  exercise_name VARCHAR(180) NOT NULL,
  description TEXT,
  steps JSONB DEFAULT '[]'::jsonb,
  repetitions VARCHAR(80),
  duration_sec INT DEFAULT 0,
  animation_type VARCHAR(30) DEFAULT 'skeletal',
  animation_payload JSONB DEFAULT '{}'::jsonb,
  source_file VARCHAR(240),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS satabdi_daily_progress (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  workout_date DATE NOT NULL,
  week_no INT NOT NULL,
  day_no INT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  calories_burned NUMERIC(8,2) DEFAULT 0,
  fat_loss_g NUMERIC(8,2) DEFAULT 0,
  muscle_gain_g NUMERIC(8,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, workout_date, day_no)
);
