#!/bin/bash

# Team Setup Script voor Mijn Slimme Boodschappenlijst
echo "🚀 Welkom bij het team setup script!"

# Check of git geïnstalleerd is
if ! command -v git &> /dev/null; then
    echo "❌ Git is niet geïnstalleerd. Installeer git eerst."
    exit 1
fi

# Check of Node.js geïnstalleerd is
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is niet geïnstalleerd. Installeer Node.js eerst."
    exit 1
fi

# Clone repository (als nog niet gedaan)
if [ ! -d "mijn-slimme-boodschappenlijst" ]; then
    echo "📥 Cloning repository..."
    git clone https://github.com/jules200769/mijn-slimme-boodschappenlijst.git
    cd mijn-slimme-boodschappenlijst
else
    echo "📁 Repository bestaat al, ga naar directory..."
    cd mijn-slimme-boodschappenlijst
fi

# Installeer dependencies
echo "📦 Installing dependencies..."
npm install

# Setup environment
if [ ! -f ".env" ]; then
    echo "⚙️  Setting up environment..."
    cp env.template .env
    echo "✅ .env file aangemaakt. Vul je Supabase credentials in!"
else
    echo "✅ .env file bestaat al"
fi

# Check git status
echo "🔍 Checking git status..."
git status

echo ""
echo "✅ Setup voltooid!"
echo ""
echo "📋 Volgende stappen:"
echo "1. Vul je Supabase credentials in in .env"
echo "2. Start de app: npm start"
echo "3. Lees TEAM_WORKFLOW.md voor workflow info"
echo ""
echo "🎉 Je bent klaar om te beginnen!" 