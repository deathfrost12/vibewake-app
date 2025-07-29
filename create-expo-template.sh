#!/bin/bash

PROJECT_NAME=$1

if [ -z "$PROJECT_NAME" ]; then
    echo "❌ Chybí název projektu!"
    echo "Použití: ./create-expo-template.sh my-app"
    exit 1
fi

echo "🎯 Vytvářím nový Expo projekt: $PROJECT_NAME"

# Vytvoř složku
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Vytvoř Expo projekt
npx create-expo-app@latest . --template blank-typescript

# Zkopíruj konfigurační soubory z Repetito templatu
echo "📋 Kopíruji template soubory..."
TEMPLATE_DIR="../"  # Předpokládáme, že template je o úroveň výš

if [ -f "${TEMPLATE_DIR}package.json" ]; then
    cp "${TEMPLATE_DIR}tsconfig.json" .
    cp "${TEMPLATE_DIR}babel.config.js" .
    cp "${TEMPLATE_DIR}metro.config.js" .
    cp "${TEMPLATE_DIR}.eslintrc.js" .
    cp "${TEMPLATE_DIR}.prettierrc" .
    cp "${TEMPLATE_DIR}.gitignore" .
    cp "${TEMPLATE_DIR}eas.json" .
    cp "${TEMPLATE_DIR}env.example" .
    echo "✅ Template soubory zkopírovány"
else
    echo "⚠️  Template soubory nenalezeny, použij ./setup-repetito-project.sh pro ruční setup"
fi

# Vytvoř folder strukturu
echo "📁 Vytvářím folder strukturu..."
mkdir -p src/app/\(auth\)/{login,register,forgot-password}
mkdir -p src/app/\(tabs\)/{dashboard,library,stats,profile}
mkdir -p src/app/create/{text,image,ai}
mkdir -p src/app/study/{flashcards,quiz,review}
mkdir -p src/app/onboarding

mkdir -p src/components/{dashboard,library,create,stats,profile,study,auth,ui,common}
mkdir -p src/services/{supabase,openai,stripe,analytics,storage}
mkdir -p src/stores src/hooks
mkdir -p src/utils/{constants,validation,formatting,spaced-repetition}
mkdir -p src/types
mkdir -p src/assets/{images,fonts,animations}

echo "✅ Projekt $PROJECT_NAME je připraven!"
echo ""
echo "Další kroky:"
echo "1. cd $PROJECT_NAME"
echo "2. Vyplň package.json (name, description atd.)"
echo "3. ./setup-repetito-project.sh"
echo "4. npm run start" 