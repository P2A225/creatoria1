/*
  # CreatorAI Initial Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `created_at` (timestamptz)
      - `generation_count_today` (integer, default 0)
      - `last_generation_date` (date)
    - `generations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `topic` (text)
      - `platform` (text, default 'tiktok')
      - `hook` (text)
      - `script` (text)
      - `title` (text)
      - `hashtags` (text)
      - `description` (text)
      - `visual_ideas` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Profiles: users can read/update own data only
    - Generations: users can read/insert own data only
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  generation_count_today integer DEFAULT 0,
  last_generation_date date DEFAULT CURRENT_DATE
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic text NOT NULL DEFAULT '',
  platform text NOT NULL DEFAULT 'tiktok',
  hook text DEFAULT '',
  script text DEFAULT '',
  title text DEFAULT '',
  hashtags text DEFAULT '',
  description text DEFAULT '',
  visual_ideas text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own generations"
  ON generations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations"
  ON generations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own generations"
  ON generations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);
