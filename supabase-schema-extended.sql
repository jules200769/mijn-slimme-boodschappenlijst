-- Functie om automatisch de updated_at kolom bij te werken
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Persoonlijke boodschappenlijsten
CREATE TABLE IF NOT EXISTS lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lists" ON lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create lists" ON lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lists" ON lists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lists" ON lists
  FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_lists_updated_at ON lists;
CREATE TRIGGER update_lists_updated_at
  BEFORE UPDATE ON lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabel voor gedeelde lijsten (vernieuwd)
DROP TABLE IF EXISTS shared_lists CASCADE;
CREATE TABLE IF NOT EXISTS shared_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(6) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tabel voor lijst leden
CREATE TABLE IF NOT EXISTS list_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES shared_lists(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(list_id, user_id)
);

-- RLS policies voor shared_lists
ALTER TABLE shared_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shared lists" ON shared_lists
  FOR SELECT USING (true);

CREATE POLICY "Users can create shared lists" ON shared_lists
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own shared lists" ON shared_lists
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own shared lists" ON shared_lists
  FOR DELETE USING (auth.uid() = created_by);

-- RLS policies voor list_members
ALTER TABLE list_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own membership" ON list_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view list members" ON list_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join lists" ON list_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can remove themselves" ON list_members
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "List owner can remove members" ON list_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM shared_lists 
      WHERE id = list_members.list_id 
      AND created_by = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_shared_lists_code ON shared_lists(code);
CREATE INDEX IF NOT EXISTS idx_shared_lists_expires_at ON shared_lists(expires_at);
CREATE INDEX IF NOT EXISTS idx_shared_lists_created_by ON shared_lists(created_by);
CREATE INDEX IF NOT EXISTS idx_list_members_list_id ON list_members(list_id);
CREATE INDEX IF NOT EXISTS idx_list_members_user_id ON list_members(user_id);

CREATE TRIGGER update_shared_lists_updated_at
  BEFORE UPDATE ON shared_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Functie om automatisch eigenaar toe te voegen als lid
CREATE OR REPLACE FUNCTION add_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO list_members (list_id, user_id)
  VALUES (NEW.id, NEW.created_by)
  ON CONFLICT (list_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_shared_list_created
  AFTER INSERT ON shared_lists
  FOR EACH ROW EXECUTE FUNCTION add_owner_as_member();

-- Functie om alle leden van een lijst op te halen met gebruikersnamen
CREATE OR REPLACE FUNCTION get_list_members_with_names(list_code VARCHAR)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  email TEXT,
  joined_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lm.user_id,
    p.full_name,
    p.email,
    lm.joined_at
  FROM list_members lm
  JOIN shared_lists sl ON lm.list_id = sl.id
  JOIN profiles p ON lm.user_id = p.id
  WHERE sl.code = list_code
  ORDER BY lm.joined_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Functie om te controleren of een gebruiker lid is van een lijst
CREATE OR REPLACE FUNCTION is_user_member_of_list(user_uuid UUID, list_code VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM list_members lm
    JOIN shared_lists sl ON lm.list_id = sl.id
    WHERE lm.user_id = user_uuid AND sl.code = list_code
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 