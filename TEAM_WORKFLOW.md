# Team Workflow Guide

## Samenwerken aan hetzelfde project

### Setup voor nieuwe teamleden

1. **Clone de repository:**
```bash
git clone https://github.com/jules200769/mijn-slimme-boodschappenlijst.git
cd mijn-slimme-boodschappenlijst
```

2. **Installeer dependencies:**
```bash
npm install
```

3. **Setup environment:**
```bash
cp env.template .env
# Vul je eigen environment variables in
```

### Dagelijkse workflow

#### 1. Start van de dag
```bash
# Haal de laatste wijzigingen op
git pull origin main

# Start de development server
npm start
```

#### 2. Werken aan features
```bash
# Maak een nieuwe branch voor je feature
git checkout -b feature/naam-van-feature

# Werk aan je code...

# Commit regelmatig
git add .
git commit -m "Beschrijving van wijzigingen"

# Push naar GitHub
git push origin feature/naam-van-feature
```

#### 3. Feature afmaken
```bash
# Ga terug naar main branch
git checkout main

# Haal laatste wijzigingen op
git pull origin main

# Merge je feature
git merge feature/naam-van-feature

# Push naar main
git push origin main

# Verwijder feature branch (optioneel)
git branch -d feature/naam-van-feature
```

### Cursor instellingen voor team collaboration

1. **Automatische git fetch inschakelen:**
   - Ga naar `File > Preferences > Settings`
   - Zoek naar "git.autofetch"
   - Zet dit aan voor automatische updates

2. **Git integratie:**
   - Cursor toont automatisch wijzigingen in de gutter
   - Gebruik `Ctrl+Shift+G` voor git panel
   - Commit direct vanuit Cursor

### Best practices

1. **Regelmatig pullen:** Altijd `git pull` doen voordat je begint met werken
2. **Kleine commits:** Commit vaak met duidelijke beschrijvingen
3. **Branch naming:** Gebruik duidelijke namen zoals `feature/login-screen` of `bugfix/crash-fix`
4. **Communicatie:** Laat team weten welke features je aan werkt
5. **Testen:** Test altijd je code voordat je pusht

### Conflict resolution

Als er conflicten zijn:
```bash
# Pull met rebase om conflicten te voorkomen
git pull --rebase origin main

# Los conflicten op in je editor
# Commit de oplossing
git add .
git rebase --continue
```

### Handige git commands

```bash
# Status bekijken
git status

# Wijzigingen bekijken
git diff

# Branch lijst
git branch -a

# Recente commits
git log --oneline -10

# Stash wijzigingen (tijdelijk opslaan)
git stash
git stash pop
```

### Cursor tips voor team work

1. **Git panel gebruiken:** `Ctrl+Shift+G`
2. **Automatische fetch:** Cursor kan automatisch controleren op updates
3. **Inline git info:** Cursor toont git status in de status bar
4. **Branch switcher:** Gebruik Cursor's git integratie om snel branches te wisselen

### Troubleshooting

**"Permission denied" bij push:**
- Controleer of je toegang hebt tot de repository
- Vraag admin om je toe te voegen aan het team

**Merge conflicts:**
- Communiceer met team over welke bestanden je aanpast
- Los conflicten samen op

**Vergeten te pullen:**
- Stash je wijzigingen: `git stash`
- Pull: `git pull origin main`
- Pop je wijzigingen: `git stash pop` 