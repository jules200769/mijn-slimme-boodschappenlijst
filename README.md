# check it!

Een React Native/Expo applicatie voor het beheren van boodschappenlijsten met real-time samenwerking.

## 🚀 Features

- Real-time boodschappenlijst beheer
- Gebruiker authenticatie
- Supabase cloud database integratie
- Team samenwerking
- Push notificaties
- Offline functionaliteit

## 🛠️ Tech Stack

- **Frontend**: React Native, Expo
- **Backend**: Supabase (cloud database)
- **State Management**: React Context
- **Navigation**: React Navigation
- **UI Components**: React Native Paper

## 📋 Vereisten

- Node.js (versie 16 of hoger)
- npm of yarn
- Expo CLI
- Git

## 🚀 Installatie

1. **Clone de repository**
```bash
git clone [repository-url]
cd mijn-slimme-boodschappenlijst
```

2. **Installeer dependencies**
```bash
npm install
```

3. **Start de development server**
```bash
npm start
```

4. **Open de app**
- Scan de QR code met Expo Go app
- Of druk op 'a' voor Android emulator
- Of druk op 'i' voor iOS simulator

## 📁 Project Structuur

```
├── components/          # Herbruikbare componenten
├── contexts/           # React Context providers
├── lib/               # Utility functies en configuratie
├── navigation/         # Navigatie configuratie
├── screens/           # App schermen
├── lib/              # Utility libraries
└── assets/            # Afbeeldingen en iconen
```

## 🔧 Development

### Scripts
- `npm start` - Start Expo development server
- `npm run android` - Start Android emulator
- `npm run ios` - Start iOS simulator
- `npm run web` - Start web versie

### Code Style
- Gebruik consistent indentation (2 spaties)
- Schrijf duidelijke component en functie namen
- Voeg comments toe waar nodig
- Test je code voordat je commit

## 🤝 Team Samenwerking

### Git Workflow
1. **Pull latest changes**
```bash
git pull origin main
```

2. **Maak een nieuwe branch voor features**
```bash
git checkout -b feature/nieuwe-feature
```

3. **Commit je changes**
```bash
git add .
git commit -m "Beschrijving van je changes"
```

4. **Push naar remote**
```bash
git push origin feature/nieuwe-feature
```

5. **Maak een Pull Request op GitHub**

### Best Practices
- Commit regelmatig met duidelijke commit messages
- Test je code voordat je een PR maakt
- Review code van teamleden
- Communiceer over grote changes

## 🔐 Environment Variables

Maak een `.env` bestand aan in de root met:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📱 Build & Deploy

### Android
```bash
expo build:android
```

### iOS
```bash
expo build:ios
```

## 🐛 Troubleshooting

### Veelvoorkomende problemen:
1. **Metro bundler errors**: `npm start --reset-cache`
2. **Dependencies issues**: `rm -rf node_modules && npm install`
3. **Expo CLI issues**: `npm install -g @expo/cli`

## 📞 Contact

Voor vragen of problemen, neem contact op met het team via:
- GitHub Issues
- Team chat in Cursor
- Email: [team-email]

## 📄 License

Dit project is eigendom van het team. Alle rechten voorbehouden. 