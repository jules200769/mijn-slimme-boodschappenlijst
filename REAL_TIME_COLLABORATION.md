# Real-time Team Collaboration Guide

## 🚀 Hoe je team real-time kan samenwerken

### **Scenario 1: Je werkt, team ziet updates**

#### **Jouw workflow:**
```bash
# 1. Begin met werken
git checkout -b feature/nieuwe-functie

# 2. Maak wijzigingen in je code...

# 3. Commit en push regelmatig
git add .
git commit -m "Voeg nieuwe functie toe"
git push origin feature/nieuwe-functie

# 4. Als feature klaar is, merge naar main
git checkout main
git pull origin main
git merge feature/nieuwe-functie
git push origin main
```

#### **Team workflow:**
```bash
# 1. Regelmatig pullen om updates te zien
git pull origin main

# 2. Of specifiek jouw branch bekijken
git fetch origin
git checkout feature/nieuwe-functie
```

### **Scenario 2: Team werkt, jij ziet updates**

#### **Team doet:**
```bash
# 1. Werkt aan hun feature
git checkout -b feature/team-functie

# 2. Push hun wijzigingen
git add .
git commit -m "Team voegt nieuwe functie toe"
git push origin feature/team-functie
```

#### **Jij doet:**
```bash
# 1. Haal laatste wijzigingen op
git pull origin main

# 2. Of bekijk hun specifieke branch
git fetch origin
git checkout feature/team-functie
```

## 🔔 **Automatische notificaties**

### **Cursor instellingen voor real-time updates:**

1. **Automatische git fetch:**
   - Ga naar `File > Preferences > Settings`
   - Zoek naar "git.autofetch"
   - Zet dit aan (controleert elke 3 minuten)

2. **Git status in status bar:**
   - Cursor toont automatisch of je achter loopt
   - Blauwe pijl = nieuwe commits beschikbaar
   - Rode pijl = je hebt uncommitted changes

3. **Git panel gebruiken:**
   - `Ctrl+Shift+G` voor git panel
   - Zie real-time status van alle branches

## 📱 **Team communicatie tools**

### **Voor real-time communicatie:**

1. **Discord/Slack**: Voor directe communicatie
2. **GitHub Issues**: Voor bug reports en features
3. **GitHub Pull Requests**: Voor code reviews
4. **Cursor Chat**: Voor directe vragen in de editor

### **Best practices voor real-time work:**

1. **Kleine, frequente commits:**
   ```bash
   # Doe dit vaak
   git add .
   git commit -m "WIP: Voeg login functie toe"
   git push origin feature/login
   ```

2. **Communicatie over wat je doet:**
   - "Ik werk aan de login screen"
   - "Ik fix een bug in de shopping list"
   - "Ik voeg een nieuwe feature toe"

3. **Branch naming conventions:**
   ```
   feature/login-screen
   bugfix/crash-fix
   hotfix/urgent-fix
   ```

## 🚨 **Conflict voorkomen**

### **Voordat je begint met werken:**
```bash
# Altijd eerst pullen
git pull origin main

# Dan pas beginnen met werken
git checkout -b feature/mijn-feature
```

### **Als er conflicten zijn:**
```bash
# Pull met rebase
git pull --rebase origin main

# Los conflicten op
# Dan continue
git add .
git rebase --continue
```

## 📊 **Status monitoring**

### **Check wat er gebeurt:**
```bash
# Zie alle branches
git branch -a

# Zie recente commits
git log --oneline -10

# Zie wie wat heeft gedaan
git log --oneline --author="teamnaam"

# Zie wijzigingen in bestanden
git diff
```

### **Cursor git integratie:**
- **Gutter markers**: Rode/groene lijnen naast code
- **Status bar**: Git status onderaan
- **Source control panel**: `Ctrl+Shift+G`
- **Branch switcher**: Snel wisselen tussen branches

## 🎯 **Real-time workflow tips**

1. **Commit message template:**
   ```
   [FEATURE] Voeg login functionaliteit toe
   [BUGFIX] Los crash op in shopping list
   [HOTFIX] Urgente fix voor app crash
   ```

2. **Regelmatige sync:**
   ```bash
   # Elke 30 minuten
   git pull origin main
   ```

3. **Feature flags gebruiken:**
   ```javascript
   // In je code
   if (FEATURE_FLAGS.NEW_LOGIN) {
     // Nieuwe login code
   } else {
     // Oude login code
   }
   ```

## 🚀 **Snelle commands voor team**

### **Voor jou:**
```bash
# Start werken
git pull origin main
git checkout -b feature/mijn-feature

# Tussendoor pushen
git add .
git commit -m "WIP: Voortgang"
git push origin feature/mijn-feature

# Feature afmaken
git checkout main
git merge feature/mijn-feature
git push origin main
```

### **Voor team:**
```bash
# Updates ophalen
git pull origin main

# Specifieke feature bekijken
git checkout feature/team-feature
```

## 📱 **Mobile development workflow**

### **Voor React Native/Expo:**
```bash
# Start development
npm start

# Test op verschillende platforms
npm run android
npm run ios
npm run web
```

### **Real-time testing:**
- Gebruik Expo Go app voor snelle tests
- Share QR code met team
- Test op verschillende devices

---

**Remember**: Communiceer met je team! Laat weten wat je doet en wanneer je grote wijzigingen maakt. 🚀 