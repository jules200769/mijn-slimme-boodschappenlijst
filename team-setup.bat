@echo off
echo 🚀 Welkom bij het team setup script!

REM Check of git geïnstalleerd is
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is niet geïnstalleerd. Installeer git eerst.
    pause
    exit /b 1
)

REM Check of Node.js geïnstalleerd is
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is niet geïnstalleerd. Installeer Node.js eerst.
    pause
    exit /b 1
)

REM Clone repository (als nog niet gedaan)
if not exist "mijn-slimme-boodschappenlijst" (
    echo 📥 Cloning repository...
    git clone https://github.com/jules200769/mijn-slimme-boodschappenlijst.git
    cd mijn-slimme-boodschappenlijst
) else (
    echo 📁 Repository bestaat al, ga naar directory...
    cd mijn-slimme-boodschappenlijst
)

REM Installeer dependencies
echo 📦 Installing dependencies...
npm install

REM Setup environment
if not exist ".env" (
    echo ⚙️  Setting up environment...
    copy env.template .env
    echo ✅ .env file aangemaakt. Vul je Supabase credentials in!
) else (
    echo ✅ .env file bestaat al
)

REM Check git status
echo 🔍 Checking git status...
git status

echo.
echo ✅ Setup voltooid!
echo.
echo 📋 Volgende stappen:
echo 1. Vul je Supabase credentials in in .env
echo 2. Start de app: npm start
echo 3. Lees TEAM_WORKFLOW.md voor workflow info
echo.
echo 🎉 Je bent klaar om te beginnen!
pause 