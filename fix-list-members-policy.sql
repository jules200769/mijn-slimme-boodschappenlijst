-- Fix voor list_members RLS policy
-- Voer dit uit in je Supabase SQL Editor

-- Leden kunnen zichzelf verwijderen uit een lijst
CREATE POLICY "Members can remove themselves" ON list_members
  FOR DELETE USING (auth.uid() = user_id);

-- Controleer of de policy is toegevoegd
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'list_members'; 