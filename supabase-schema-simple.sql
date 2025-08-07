-- check it! Database Schema voor Supabase (Vereenvoudigd)
-- Voer dit uit in je Supabase SQL Editor

-- Tabel voor gebruikers profielen
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies voor profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Tabel voor boodschappenlijsten
CREATE TABLE IF NOT EXISTS lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies voor lists
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lists" ON lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lists" ON lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lists" ON lists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lists" ON lists
  FOR DELETE USING (auth.uid() = user_id);

-- Tabel voor gedeelde lijsten
CREATE TABLE IF NOT EXISTS shared_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(6) UNIQUE NOT NULL,
  list_data JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- RLS policies voor shared_lists
ALTER TABLE shared_lists ENABLE ROW LEVEL SECURITY;

-- Iedereen kan gedeelde lijsten bekijken (voor join functionaliteit)
CREATE POLICY "Anyone can view shared lists" ON shared_lists
  FOR SELECT USING (true);

-- Alleen eigenaar kan gedeelde lijsten aanmaken/bijwerken
CREATE POLICY "Users can create shared lists" ON shared_lists
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own shared lists" ON shared_lists
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own shared lists" ON shared_lists
  FOR DELETE USING (auth.uid() = created_by);

-- Indexen voor betere performance
CREATE INDEX IF NOT EXISTS idx_lists_user_id ON lists(user_id);
CREATE INDEX IF NOT EXISTS idx_lists_created_at ON lists(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shared_lists_code ON shared_lists(code);
CREATE INDEX IF NOT EXISTS idx_shared_lists_expires_at ON shared_lists(expires_at);
CREATE INDEX IF NOT EXISTS idx_shared_lists_created_by ON shared_lists(created_by);

-- Functie om updated_at automatisch bij te werken
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers voor updated_at
CREATE TRIGGER update_lists_updated_at
  BEFORE UPDATE ON lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Functie om verlopen gedeelde lijsten automatisch op te ruimen
CREATE OR REPLACE FUNCTION cleanup_expired_shared_lists()
RETURNS void AS $$
BEGIN
  DELETE FROM shared_lists WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql; 