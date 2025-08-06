# Supabase Setup voor check it!

## Stap 1: Supabase Project Aanmaken

1. Ga naar [supabase.com](https://supabase.com)
2. Log in of maak een account aan
3. Klik op "New Project"
4. Kies een naam (bijv. "mijn-slimme-boodschappenlijst")
5. Kies een database wachtwoord (bewaar dit goed!)
6. Kies een regio (bijv. West Europe)
7. Klik "Create new project"

## 🔧 Stap 2: Database Schema Instellen

1. Ga naar je Supabase project dashboard
2. Klik op "SQL Editor" in het linker menu
3. Klik op "New query"
4. Kopieer en plak de inhoud van `supabase-schema.sql`
5. Klik op "Run" om het schema uit te voeren

## 🔑 Stap 3: API Keys Ophalen

1. Ga naar "Settings" → "API" in je Supabase dashboard
2. Kopieer de volgende waarden:
   - **Project URL** (bijv. `https://your-project.supabase.co`)
   - **Anon Key** (public key)

## 📱 Stap 4: App Configureren

1. Open `lib/supabase.js` in je project
2. Vervang de placeholder waarden:

```javascript
const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL'; // Vervang met je Project URL
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Vervang met je Anon Key
```

## 🔐 Stap 5: Email Verificatie Instellen (Optioneel)

1. Ga naar "Settings" → "Auth" in Supabase
2. Onder "Email Templates" kun je de email templates aanpassen
3. Voor development kun je "Enable email confirmations" uitzetten

## 🧪 Stap 6: Testen

1. Start je app: `npm start`
2. Test registratie en login
3. Test het aanmaken van lijsten
4. Test het delen van lijsten met codes

## 📊 Database Tabellen

### `profiles`
- Gebruikers profielen
- Automatisch aangemaakt bij registratie

### `lists`
- Boodschappenlijsten van gebruikers
- JSONB items voor flexibiliteit

### `shared_lists`
- Gedeelde lijsten met 6-cijferige codes
- 24-uurs geldigheid
- Automatische cleanup van verlopen codes

## 🔒 Row Level Security (RLS)

Alle tabellen hebben RLS ingeschakeld:
- Gebruikers kunnen alleen hun eigen data zien/bewerken
- Gedeelde lijsten zijn publiek leesbaar (voor join functionaliteit)
- Alleen eigenaren kunnen gedeelde lijsten aanmaken/bijwerken

## 🚨 Troubleshooting

### "Error: Invalid API key"
- Controleer of je de juiste Anon Key gebruikt
- Controleer of je Project URL correct is

### "Error: JWT expired"
- Gebruiker moet opnieuw inloggen
- Session management wordt automatisch afgehandeld

### "Error: Row Level Security policy violation"
- Controleer of de gebruiker is ingelogd
- Controleer of de RLS policies correct zijn ingesteld

### Database connectie problemen
- Controleer of je internet verbinding werkt
- Controleer of je Supabase project actief is
- Probeer de app opnieuw te starten

## 📈 Performance Tips

1. **Indexen**: Alle belangrijke queries hebben indexen
2. **JSONB**: Items worden opgeslagen als JSONB voor flexibiliteit
3. **Automatic cleanup**: Verlopen codes worden automatisch opgeruimd
4. **Caching**: Supabase heeft ingebouwde caching

## 🔄 Real-time Updates

Voor real-time updates tussen gebruikers:
```javascript
// Luister naar wijzigingen in lijsten
const subscription = supabase
  .channel('lists')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'lists' },
    (payload) => {
      // Update UI met nieuwe data
    }
  )
  .subscribe();
```

## 📱 App Features

✅ **Authenticatie**: Registratie, login, logout  
✅ **Lijsten beheer**: Aanmaken, bewerken, verwijderen  
✅ **Producten**: Toevoegen, afvinken, verwijderen  
✅ **Delen**: 6-cijferige codes voor lijst delen  
✅ **Joinen**: Lijsten joinen met codes  
✅ **Persistence**: Data blijft bewaard tussen sessies  
✅ **Security**: Row Level Security voor data bescherming  

## 🎯 Volgende Stappen

1. **Real-time updates** implementeren
2. **Push notifications** toevoegen
3. **Offline support** met lokale caching
4. **Analytics** toevoegen
5. **Advanced sharing** (email, WhatsApp, etc.)

## 📞 Support

Als je problemen hebt:
1. Check de Supabase logs in het dashboard
2. Controleer de console logs in je app
3. Test de API calls in de Supabase SQL Editor
4. Raadpleeg de [Supabase docs](https://supabase.com/docs) 