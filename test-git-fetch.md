# Test Git Fetch

Dit is een test bestand om automatische git fetch te testen.

## Hoe het werkt:

1. **Automatische fetch**: Cursor controleert elke 3 minuten op updates
2. **Status bar**: Zie git status onderaan in Cursor
3. **Git panel**: `Ctrl+Shift+G` voor git overzicht
4. **Notificaties**: Krijg meldingen bij nieuwe commits

## Test workflow:

```bash
# 1. Maak wijzigingen
# 2. Commit en push
git add .
git commit -m "Test: Voeg test bestand toe"
git push origin main

# 3. Team ziet updates na git pull
git pull origin main
```

## Cursor instellingen:

- `git.autofetch`: true
- `git.autofetchPeriod`: 180 (3 minuten)
- `git.confirmSync`: false
- `git.enableSmartCommit`: true

## Team workflow:

1. **Regelmatig pullen**: `git pull origin main`
2. **Branch werken**: `git checkout -b feature/nieuwe-functie`
3. **Frequente commits**: Kleine, regelmatige commits
4. **Communicatie**: Laat team weten wat je doet

---

**Test**: Dit bestand wordt automatisch gesynchroniseerd via git! 🚀 