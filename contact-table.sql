-- Contact tabel voor check it!
-- Voer dit uit in je Supabase SQL Editor

-- Tabel voor contact berichten
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies voor contact_messages
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Gebruikers kunnen alleen hun eigen contact berichten bekijken
CREATE POLICY "Users can view own contact messages" ON contact_messages
  FOR SELECT USING (auth.uid() = user_id);

-- Gebruikers kunnen alleen hun eigen contact berichten aanmaken
CREATE POLICY "Users can insert own contact messages" ON contact_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Gebruikers kunnen alleen hun eigen contact berichten bijwerken
CREATE POLICY "Users can update own contact messages" ON contact_messages
  FOR UPDATE USING (auth.uid() = user_id);

-- Gebruikers kunnen alleen hun eigen contact berichten verwijderen
CREATE POLICY "Users can delete own contact messages" ON contact_messages
  FOR DELETE USING (auth.uid() = user_id);

-- Indexen voor betere performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_user_id ON contact_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
