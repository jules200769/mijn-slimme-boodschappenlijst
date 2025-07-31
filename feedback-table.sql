-- Feedback tabel voor Mijn slimme Boodschappenlijst
-- Voer dit uit in je Supabase SQL Editor

-- Tabel voor feedback
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feedback_text TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies voor feedback
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Gebruikers kunnen alleen hun eigen feedback bekijken
CREATE POLICY "Users can view own feedback" ON feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Gebruikers kunnen alleen hun eigen feedback aanmaken
CREATE POLICY "Users can insert own feedback" ON feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Gebruikers kunnen alleen hun eigen feedback bijwerken
CREATE POLICY "Users can update own feedback" ON feedback
  FOR UPDATE USING (auth.uid() = user_id);

-- Gebruikers kunnen alleen hun eigen feedback verwijderen
CREATE POLICY "Users can delete own feedback" ON feedback
  FOR DELETE USING (auth.uid() = user_id);

-- Indexen voor betere performance
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);

-- Constraint om te zorgen dat er minimaal feedback_text OF rating is ingevuld
ALTER TABLE feedback ADD CONSTRAINT check_feedback_or_rating 
  CHECK (feedback_text IS NOT NULL OR rating IS NOT NULL); 