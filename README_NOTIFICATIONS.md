# Notificaties Beheren - Documentatie

## 📱 Overzicht

De notificatie functionaliteit in je boodschappenlijst app is nu volledig geïmplementeerd! Hier vind je alles wat je moet weten over hoe notificaties werken en hoe je ze kunt beheren.

## 🔧 Wat is Geïmplementeerd

### 1. **Notification Service** (`lib/notifications.js`)
- Complete notificatie service met alle benodigde functies
- Permissions management
- Push token beheer
- Local en scheduled notifications
- Event listeners voor notificatie interacties

### 2. **Notification Settings Screen** (`screens/NotificationSettingsScreen.js`)
- Gebruiksvriendelijke interface voor notificatie instellingen
- Toggles voor verschillende soorten notificaties
- Test functionaliteit
- Permissions status weergave

### 3. **Notification Triggers** (`lib/notificationTriggers.js`)
- Automatische notificatie triggers voor app acties
- Settings-aware notificaties (alleen als ingeschakeld)
- Verschillende soorten notificaties voor verschillende acties

### 4. **App Integration**
- Automatische initialisatie bij app start
- Integratie in navigatie
- Settings screen link

## 🚀 Hoe Notificaties Werken

### **Soorten Notificaties**

1. **Boodschappen Herinneringen**
   - Herinneringen voor je boodschappenlijsten
   - Kan gepland worden voor specifieke tijden

2. **Items Toegevoegd**
   - Notificatie wanneer iemand een item toevoegt aan een gedeelde lijst
   - Real-time updates voor samenwerking

3. **Lijsten Gedeeld**
   - Notificatie wanneer iemand een lijst met je deelt
   - Met 6-cijferige codes

4. **Wekelijkse Herinneringen**
   - Optionele wekelijkse herinneringen
   - Kan ingesteld worden voor regelmatige boodschappen

### **Permissions Flow**

1. **Eerste keer**: App vraagt toestemming voor notificaties
2. **Toestemming gegeven**: Notificaties zijn actief
3. **Toestemming geweigerd**: Gebruiker kan later instellingen openen
4. **Status check**: App controleert automatisch permissions status

## ⚡ **Wanneer Worden Notificaties Automatisch Verzonden?**

### **📝 Items Toegevoegd**
- **Wanneer**: Wanneer iemand een product toevoegt aan een lijst
- **Notificatie**: `"Appels" is toegevoegd aan "Boodschappen"`
- **Instelling**: "Items Toegevoegd" moet ingeschakeld zijn

### **📝 Items Verwijderd**
- **Wanneer**: Wanneer iemand een product verwijdert uit een lijst
- **Notificatie**: `"Melk" is verwijderd uit "Boodschappen"`
- **Instelling**: "Items Toegevoegd" moet ingeschakeld zijn

### **📝 Lijst Gedeeld**
- **Wanneer**: Wanneer iemand een lijst deelt via een deelcode
- **Notificatie**: `"Jan heeft de lijst "Feestje" met je gedeeld (Code: ABC123)"`
- **Instelling**: "Lijsten Gedeeld" moet ingeschakeld zijn

### **📝 Lid Toegevoegd**
- **Wanneer**: Wanneer iemand een lijst joint met een deelcode
- **Notificatie**: `"Piet is lid geworden van "Feestje"`
- **Instelling**: "Lijsten Gedeeld" moet ingeschakeld zijn

### **📝 Lijst Voltooid**
- **Wanneer**: Wanneer alle items in een lijst zijn afgevinkt
- **Notificatie**: `"Gefeliciteerd! Je hebt alle 5 items van "Boodschappen" afgevinkt!"`
- **Instelling**: "Boodschappen Herinneringen" moet ingeschakeld zijn

### **📝 Bijna Klaar**
- **Wanneer**: Wanneer er nog maar 1 item over is in een lijst
- **Notificatie**: `"Je hebt nog maar 1 items over in "Boodschappen"!"`
- **Instelling**: "Boodschappen Herinneringen" moet ingeschakeld zijn

### **📅 Wekelijkse Herinneringen**
- **Wanneer**: Elke maandag om 9:00 uur (automatisch gepland)
- **Notificatie**: `"Tijd om je boodschappenlijst te checken!"`
- **Instelling**: "Wekelijkse Herinneringen" moet ingeschakeld zijn

## 📋 Hoe Te Gebruiken

### **Voor Gebruikers**

1. **Ga naar Instellingen**
   - Open de app
   - Ga naar het "Instellingen" tabblad
   - Tap op "Notificaties beheren"

2. **Schakel Notificaties In**
   - Tap op de "Notificaties" toggle
   - Geef toestemming wanneer gevraagd
   - Status wordt "Ingeschakeld"

3. **Beheer Soorten Notificaties**
   - Boodschappen Herinneringen: Herinneringen voor lijsten
   - Items Toegevoegd: Wanneer iemand items toevoegt
   - Lijsten Gedeeld: Wanneer lijsten gedeeld worden
   - Wekelijkse Herinneringen: Regelmatige herinneringen

4. **Test Notificaties**
   - Tap op "Test Notificatie Versturen"
   - Controleer of je notificatie ontvangt

### **Voor Ontwikkelaars**

#### **Notificatie Service Gebruiken**

```javascript
import notificationService from '../lib/notifications';

// Test notificatie versturen
await notificationService.sendTestNotification();

// Shopping reminder versturen
await notificationService.sendShoppingReminder('Mijn Lijst');

// Item toegevoegd notificatie
await notificationService.sendItemAddedNotification('Appels', 'Boodschappen');

// Lijst gedeeld notificatie
await notificationService.sendListSharedNotification('Feestje', 'Jan');
```

#### **Notification Triggers Gebruiken**

```javascript
import notificationTriggers from '../lib/notificationTriggers';

// Trigger item added notification
await notificationTriggers.triggerItemAddedNotification('Appels', 'Boodschappen', 'Jan');

// Trigger list shared notification
await notificationTriggers.triggerListSharedNotification('Feestje', 'Jan', 'ABC123');

// Trigger list completed notification
await notificationTriggers.triggerListCompletedNotification('Boodschappen', 5);

// Schedule weekly reminder
await notificationTriggers.scheduleWeeklyReminder();
```

#### **Scheduled Notificaties**

```javascript
// Notificatie over 1 uur
await notificationService.scheduleNotification(
  'Boodschappen Herinnering',
  'Vergeet niet je lijst mee te nemen!',
  { seconds: 3600 }, // 1 uur
  { type: 'shopping_reminder' }
);

// Dagelijkse notificatie om 9:00
await notificationService.scheduleNotification(
  'Dagelijkse Herinnering',
  'Check je boodschappenlijst!',
  { hour: 9, minute: 0, repeats: true },
  { type: 'daily_reminder' }
);
```

#### **Notification Settings Ophalen**

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const getNotificationSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem('notificationSettings');
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.error('Error loading notification settings:', error);
    return null;
  }
};
```

## 🔧 Technische Details

### **Dependencies**
- `expo-notifications`: Core notificatie functionaliteit
- `expo-device`: Device detection voor permissions
- `@react-native-async-storage/async-storage`: Settings opslag

### **Configuration**
- **app.json**: Expo notificatie plugin configuratie
- **Permissions**: Automatische permission requests
- **Channels**: Android notification channels
- **Tokens**: Push token management

### **Storage**
- **Push Tokens**: Opgeslagen in AsyncStorage
- **Settings**: JSON in AsyncStorage
- **Permissions**: System-level storage

## 🐛 Troubleshooting

### **Veelvoorkomende Problemen**

1. **"Notificaties werken niet"**
   - Controleer of permissions zijn gegeven
   - Test met test notificatie
   - Controleer device settings

2. **"Test notificatie komt niet"**
   - Controleer of app in foreground is
   - Controleer device notificatie instellingen
   - Probeer app opnieuw te starten

3. **"Permissions worden niet gevraagd"**
   - Controleer of je op een fysiek device test
   - Simulator ondersteunt geen push notificaties
   - Controleer app.json configuratie

4. **"Automatische notificaties komen niet"**
   - Controleer of de juiste instellingen zijn ingeschakeld
   - Controleer of de app acties uitvoert die notificaties triggeren
   - Controleer console logs voor errors

### **Debug Tips**

```javascript
// Check permissions status
const permissions = await notificationService.getNotificationPermissions();
console.log('Permissions:', permissions);

// Check if notifications are enabled
const enabled = await notificationService.areNotificationsEnabled();
console.log('Notifications enabled:', enabled);

// Get saved push token
const token = await notificationService.getPushToken();
console.log('Push token:', token);

// Check notification settings
const settings = await AsyncStorage.getItem('notificationSettings');
console.log('Notification settings:', settings);
```

## 🔮 Toekomstige Features

### **Geplande Verbeteringen**

1. **Push Notifications**
   - Server-side notificaties
   - Real-time updates tussen gebruikers
   - Supabase integratie

2. **Advanced Scheduling**
   - Custom reminder tijden
   - Location-based reminders
   - Smart suggestions

3. **Rich Notifications**
   - Action buttons
   - Custom sounds
   - Rich media support

4. **Analytics**
   - Notificatie engagement tracking
   - User behavior analytics
   - A/B testing

## 📱 Platform Specifieke Details

### **iOS**
- Permissions worden één keer gevraagd
- Settings kunnen alleen via system settings gewijzigd worden
- Rich notifications ondersteund

### **Android**
- Notification channels vereist
- Permissions kunnen via app gewijzigd worden
- Custom sounds en vibration patterns

### **Expo**
- Cross-platform compatibility
- Automatic configuration
- Development build vereist voor push notificaties

## 🎯 Best Practices

1. **Permissions**
   - Vraag permissions op het juiste moment
   - Leg uit waarom notificaties nuttig zijn
   - Bied optie om later in te schakelen

2. **User Experience**
   - Test notificaties op echte devices
   - Geef gebruikers controle over notificaties
   - Bied duidelijke opties om uit te schakelen

3. **Performance**
   - Cleanup listeners bij component unmount
   - Handle errors gracefully
   - Cache settings lokaal

4. **Privacy**
   - Vraag alleen noodzakelijke permissions
   - Leg uit hoe data gebruikt wordt
   - Bied optie om data te verwijderen

## 📞 Support

Voor vragen over notificaties:
- Check de troubleshooting sectie
- Test op fysiek device
- Controleer console logs
- Raadpleeg Expo notificatie documentatie

---

**Laatste update**: Automatische notificaties geïmplementeerd ✅
**Status**: Volledig functioneel 🚀 