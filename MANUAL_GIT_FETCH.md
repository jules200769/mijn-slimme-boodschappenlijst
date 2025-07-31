# Handmatige Git Fetch Guide

## Als automatische git fetch niet werkt in Cursor

### **Methode 1: Via Cursor Command Palette**

1. **Druk op `Ctrl + Shift + P`**
2. **Type "Git: Fetch"**
3. **Selecteer "Git: Fetch"**
4. **Dit haalt alle updates op**

### **Methode 2: Via Terminal in Cursor**

1. **Open terminal in Cursor**: `Ctrl + `` (backtick)
2. **Type deze commands**:
   ```bash
   git fetch origin
   git status
   ```

### **Methode 3: Via Git Panel**

1. **Druk op `Ctrl + Shift + G`** (Git panel)
2. **Klik op de "..." menu**
3. **Selecteer "Fetch"**

### **Methode 4: Keyboard Shortcuts**

- **`Ctrl + Shift + G`**: Open Git panel
- **`Ctrl + Shift + P`**: Command palette
- **`Ctrl + ``**: Open terminal

## 🔄 **Regelmatige workflow zonder automatische fetch:**

### **Elke 30 minuten handmatig fetch:**

```bash
# In Cursor terminal
git fetch origin
git pull origin main
```

### **Voor het beginnen met werken:**

```bash
# Altijd eerst updaten
git pull origin main

# Dan beginnen met werken
git checkout -b feature/mijn-feature
```

### **Tussendoor pushen:**

```bash
# Regelmatig pushen zodat team updates ziet
git add .
git commit -m "WIP: Voortgang"
git push origin feature/mijn-feature
```

## 📊 **Git status checken:**

### **In Cursor status bar:**
- **Onderaan links**: Zie git status
- **Blauwe pijl**: Nieuwe commits beschikbaar
- **Rode pijl**: Je hebt uncommitted changes

### **Via terminal:**
```bash
git status
git log --oneline -5
```

## 🎯 **Tips voor handmatige git workflow:**

1. **Set reminders**: Elke 30 minuten fetch doen
2. **Use git panel**: `Ctrl + Shift + G` voor overzicht
3. **Check status bar**: Zie altijd git status onderaan
4. **Communicate**: Laat team weten wanneer je pusht

## 🚀 **Snelle commands:**

```bash
# Check voor updates
git fetch origin

# Haal updates op
git pull origin main

# Push je wijzigingen
git push origin feature/mijn-feature

# Zie status
git status
```

---

**Remember**: Zelfs zonder automatische fetch kun je prima samenwerken! Het is alleen wat meer handwerk. 🛠️ 