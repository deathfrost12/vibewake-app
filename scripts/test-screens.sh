#!/bin/bash

# 🧪 Repetito Screen Testing Script
# Rychlý způsob jak testovat naše UI screens

echo "🧪 Repetito Screen Testing"
echo "========================="
echo ""

# Function to check if Expo is running
check_expo() {
    if ! pgrep -f "expo start" > /dev/null; then
        echo "❌ Expo server není spuštěný"
        echo "💡 Spusť nejdřív: npm start"
        exit 1
    else
        echo "✅ Expo server běží"
    fi
}

# Function to open specific screen
open_screen() {
    local screen=$1
    echo "📱 Otevírám screen: $screen"
    
    # Use Expo CLI to navigate to screen
    # This would work if we had expo-cli navigation commands
    echo "💡 Pro otestování: Otevři aplikaci a naviguj na /dev-menu"
    echo "📋 Nebo použij Deep Link: exp://localhost:8081/--/dev-menu"
}

# Main menu
echo "Vyber možnost:"
echo "1) 🏠 Kontrola Expo serveru"
echo "2) 🧪 Otevřít Dev Menu"
echo "3) 📱 Generovat QR kód"
echo "4) 🔧 Restart Expo serveru"
echo "5) 📊 Zobrazit dostupné screens"
echo ""

read -p "Tvoje volba (1-5): " choice

case $choice in
    1)
        check_expo
        ;;
    2)
        check_expo
        echo "🧪 Dev Menu route: /dev-menu"
        echo "📱 Otevři aplikaci a klikni na 'Development Menu' card"
        ;;
    3)
        echo "📱 QR kód pro testování:"
        echo "Otevři aplikaci Expo Go a naskenuj QR kód v terminálu"
        ;;
    4)
        echo "🔧 Restartuji Expo server..."
        pkill -f "expo start"
        sleep 2
        npm start &
        echo "✅ Expo server restartován"
        ;;
    5)
        echo "📊 Dostupné screens pro testování:"
        echo "=================================="
        echo "📱 Tabs:"
        echo "  - /(tabs)/dashboard"
        echo "  - /(tabs)/library" 
        echo "  - /(tabs)/create"
        echo "  - /(tabs)/stats"
        echo "  - /(tabs)/profile"
        echo ""
        echo "🔐 Auth:"
        echo "  - /auth/login"
        echo "  - /auth/register"
        echo "  - /auth/forgot-password"
        echo ""
        echo "📝 Create:"
        echo "  - /create"
        echo "  - /create/magic-notes"
        echo ""
        echo "📚 Study:"
        echo "  - /study/session"
        echo "  - /study/results"
        echo ""
        echo "👋 Onboarding:"
        echo "  - /onboarding/welcome"
        echo "  - /onboarding/permissions"
        echo ""
        echo "🎵 Demo:"
        echo "  - /songmaker-demo"
        echo ""
        echo "🧪 Development:"
        echo "  - /dev-menu (MAIN TESTING HUB)"
        ;;
    *)
        echo "❌ Neplatná volba"
        exit 1
        ;;
esac

echo ""
echo "✨ Happy testing! ✨" 