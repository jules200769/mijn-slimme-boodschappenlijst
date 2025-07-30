# Team Workflow Guide

## 🎯 Team Samenwerking Workflow

### 1. **Project Setup voor Teamleden**

#### Voor nieuwe teamleden:
1. **Clone de repository**
```bash
git clone [repository-url]
cd mijn-slimme-boodschappenlijst
```

2. **Installeer dependencies**
```bash
npm install
```

3. **Configureer environment**
- Kopieer `.env.example` naar `.env`
- Vul je Supabase credentials in

4. **Start development server**
```bash
npm start
```

### 2. **Daily Workflow**

#### Ochtend routine:
```bash
# Pull latest changes
git pull origin main

# Start development server
npm start
```

#### Avond routine:
```bash
# Commit je changes
git add .
git commit -m "feat: beschrijving van je changes"

# Push naar je feature branch
git push origin feature/your-feature
```

### 3. **Feature Development**

#### Nieuwe feature starten:
```bash
# Maak nieuwe branch
git checkout -b feature/nieuwe-feature-naam

# Start development
npm start
```

#### Feature voltooien:
```bash
# Commit alle changes
git add .
git commit -m "feat: implementeer nieuwe feature"

# Push naar remote
git push origin feature/nieuwe-feature-naam

# Maak Pull Request op GitHub
```

### 4. **Code Review Process**

#### Pull Request maken:
1. Ga naar GitHub repository
2. Klik "Compare & pull request"
3. Vul template in:
   - **Beschrijving**: Wat heb je toegevoegd/gewijzigd?
   - **Testing**: Hoe heb je getest?
   - **Screenshots**: Voeg screenshots toe indien UI changes

#### Code review checklist:
- [ ] Code volgt project conventions
- [ ] Geen console.log statements
- [ ] Proper error handling
- [ ] Responsive design
- [ ] Accessibility considerations
- [ ] Performance impact geëvalueerd

### 5. **Communication**

#### Daily Standup (optioneel):
- Wat heb je gisteren gedaan?
- Wat ga je vandaag doen?
- Zijn er blockers?

#### Team chat in Cursor:
- Gebruik @mentions voor specifieke personen
- Deel screenshots van bugs/features
- Vraag om hulp bij problemen

### 6. **File Organization**

#### Nieuwe componenten:
```
components/
├── NewFeature/
│   ├── index.js
│   ├── styles.js
│   └── README.md
```

#### Nieuwe screens:
```
screens/
├── NewFeatureScreen.js
└── NewFeatureScreen.styles.js
```

### 7. **Testing Guidelines**

#### Voor elke feature:
- [ ] Test op Android emulator
- [ ] Test op iOS simulator
- [ ] Test offline functionaliteit
- [ ] Test error scenarios
- [ ] Test performance

#### Test checklist:
```bash
# Start Android emulator
npm run android

# Start iOS simulator
npm run ios

# Test web versie
npm run web
```

### 8. **Deployment**

#### Staging deployment:
```bash
# Build voor testing
expo build:android --release-channel staging
expo build:ios --release-channel staging
```

#### Production deployment:
```bash
# Build voor production
expo build:android --release-channel production
expo build:ios --release-channel production
```

### 9. **Troubleshooting**

#### Veelvoorkomende problemen:

**Metro bundler errors:**
```bash
npm start --reset-cache
```

**Dependencies issues:**
```bash
rm -rf node_modules
npm install
```

**Git conflicts:**
```bash
git stash
git pull origin main
git stash pop
```

### 10. **Best Practices**

#### Code Quality:
- Gebruik ESLint en Prettier
- Schrijf duidelijke commit messages
- Voeg comments toe voor complexe logica
- Test edge cases

#### Git Best Practices:
- Commit regelmatig (minimaal dagelijks)
- Gebruik feature branches
- Squash commits voor PR
- Write meaningful commit messages

#### Communication:
- Update team over grote changes
- Deel progress in team chat
- Vraag om feedback vroeg
- Documenteer belangrijke beslissingen

### 11. **Tools & Resources**

#### Development Tools:
- **Cursor**: Primary IDE
- **Expo Go**: Mobile testing
- **GitHub**: Version control
- **Supabase Dashboard**: Database management

#### Useful Commands:
```bash
# Check project status
git status

# View recent commits
git log --oneline -10

# Check for updates
npm outdated

# Clean project
npm run clean
```

### 12. **Emergency Procedures**

#### Als iets breekt:
1. **Don't panic!**
2. Revert naar laatste working commit
3. Notify team immediately
4. Document the issue
5. Create fix branch

#### Rollback procedure:
```bash
# Revert naar laatste working commit
git revert HEAD

# Of reset naar specifieke commit
git reset --hard [commit-hash]
```

---

**Remember**: We're a team! Help each other, communicate openly, and have fun building this awesome app together! 🚀 