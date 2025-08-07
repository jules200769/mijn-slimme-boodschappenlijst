# Supabase Storage Setup voor Profielfoto's

## Stap 1: Storage Bucket Aanmaken

1. **Ga naar je Supabase Dashboard**
   - Open: https://supabase.com/dashboard
   - Selecteer je project

2. **Navigeer naar Storage**
   - Klik op "Storage" in het linker menu
   - Klik op "New bucket"

3. **Maak de bucket aan**
   - **Name:** `profile-photos`
   - **Public bucket:** ✅ Aanvinken (zodat foto's publiek toegankelijk zijn)
   - **File size limit:** 5MB (of meer indien gewenst)
   - **Allowed MIME types:** `image/*`

4. **Klik op "Create bucket"**

## Stap 2: Storage Policies Instellen

1. **Ga naar de Storage Policies**
   - Klik op je `profile-photos` bucket
   - Ga naar het "Policies" tabblad

2. **Maak een INSERT policy**
   ```sql
   CREATE POLICY "Users can upload their own profile photos" ON storage.objects
   FOR INSERT WITH CHECK (
     bucket_id = 'profile-photos' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

3. **Maak een SELECT policy**
   ```sql
   CREATE POLICY "Profile photos are publicly accessible" ON storage.objects
   FOR SELECT USING (bucket_id = 'profile-photos');
   ```

4. **Maak een UPDATE policy**
   ```sql
   CREATE POLICY "Users can update their own profile photos" ON storage.objects
   FOR UPDATE USING (
     bucket_id = 'profile-photos' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

5. **Maak een DELETE policy**
   ```sql
   CREATE POLICY "Users can delete their own profile photos" ON storage.objects
   FOR DELETE USING (
     bucket_id = 'profile-photos' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

## Stap 3: Test de Setup

1. **Start je app**
   ```bash
   npx expo start
   ```

2. **Test profielfoto upload**
   - Ga naar Profiel bewerken
   - Probeer een foto te uploaden
   - Controleer of de foto zichtbaar blijft na uitlog/inlog

## Troubleshooting

### Probleem: "Storage bucket not found"
**Oplossing:** Controleer of de bucket naam exact `profile-photos` is

### Probleem: "Permission denied"
**Oplossing:** Controleer of de storage policies correct zijn ingesteld

### Probleem: "Photo not showing after login"
**Oplossing:** Controleer of de user metadata correct wordt opgeslagen

## Belangrijke Punten

- ✅ **Bucket naam moet exact zijn:** `profile-photos`
- ✅ **Bucket moet publiek zijn** voor foto weergave
- ✅ **Policies moeten correct zijn** voor upload/update/delete
- ✅ **User metadata wordt opgeslagen** in Supabase Auth

## Debug Tips

1. **Controleer console logs** voor upload errors
2. **Controleer Supabase logs** in dashboard
3. **Test met een kleine foto** eerst (< 1MB)
4. **Controleer internetverbinding** tijdens upload
