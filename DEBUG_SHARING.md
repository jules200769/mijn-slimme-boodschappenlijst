# Debug Instructies voor Lijst Delen

## Probleem
De "lijst delen" en "vul code in" functionaliteit werkt niet.

## Mogelijke Oorzaken

### 1. Database Schema
De `shared_lists` tabel bestaat mogelijk niet in de database.

**Controleer:**
- Ga naar je Supabase dashboard
- Klik op "Table Editor" in het linker menu
- Zoek naar de `shared_lists` tabel
- Als deze niet bestaat, voer dan het schema uit:

```sql
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
CREATE INDEX IF NOT EXISTS idx_shared_lists_code ON shared_lists(code);
CREATE INDEX IF NOT EXISTS idx_shared_lists_expires_at ON shared_lists(expires_at);
CREATE INDEX IF NOT EXISTS idx_shared_lists_created_by ON shared_lists(created_by);
```

### 2. RLS Policies
De Row Level Security policies zijn mogelijk niet correct ingesteld.

**Controleer:**
- Ga naar "Authentication" → "Policies" in Supabase
- Zoek naar de `shared_lists` tabel
- Controleer of alle policies correct zijn ingesteld

### 3. API Keys
De Supabase API keys zijn mogelijk incorrect.

**Controleer:**
- Open `lib/supabase.js`
- Controleer of de URL en Anon Key correct zijn
- Test de verbinding met de "Test DB" knop in de app

### 4. Gebruiker Niet Ingelogd
De gebruiker is mogelijk niet ingelogd.

**Controleer:**
- Kijk of je bent ingelogd in de app
- Controleer de console logs voor "Missing geselecteerdeLijst or user"

## Debug Stappen

### Stap 1: Test Database Verbinding
1. Open de app
2. Ga naar een lijst
3. Tik op de menu knop (3 puntjes)
4. Kies "Lijst delen"
5. Tik op "Test DB"
6. Kijk naar de alert voor de resultaat

### Stap 2: Check Console Logs
1. Open de developer tools
2. Kijk naar de console logs
3. Zoek naar:
   - `handleDeelLijst: Starting with`
   - `createSharedList: Response`
   - `testConnection: Response`

### Stap 3: Test Delen Functionaliteit
1. Selecteer een lijst
2. Tik op menu → "Lijst delen"
3. Tik op "Deel lijst"
4. Kijk naar de console logs voor errors

### Stap 4: Test Code Invoer
1. Tik op "Vul code in"
2. Voer een test code in (bijv. "ABC123")
3. Tik op "Join lijst"
4. Kijk naar de console logs voor errors

## Veelvoorkomende Errors

### "relation "shared_lists" does not exist"
- **Oplossing**: Voer het database schema uit

### "new row violates row-level security policy"
- **Oplossing**: Controleer de RLS policies

### "JWT expired"
- **Oplossing**: Log opnieuw in

### "Invalid API key"
- **Oplossing**: Controleer de API keys in `lib/supabase.js`

## Test Data

Om te testen, kun je handmatig een gedeelde lijst aanmaken in Supabase:

```sql
INSERT INTO shared_lists (code, list_data, created_by, expires_at) 
VALUES (
  'TEST123',
  '{"naam": "Test Lijst", "items": [{"naam": "melk", "checked": false}]}',
  'your-user-id-here',
  NOW() + INTERVAL '24 hours'
);
```

## Contact

Als het probleem blijft bestaan, controleer dan:
1. Alle console logs
2. Supabase dashboard voor errors
3. Internet verbinding
4. Of je bent ingelogd in de app 