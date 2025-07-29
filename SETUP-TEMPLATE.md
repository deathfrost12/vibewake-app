# Universal Mobile App Template - Setup Guide

Tento dokument obsahuje kroky pro adaptaci tohoto universal templatu pro váš nový mobilní projekt.

## 📋 Rychlý Setup Checklist

### 1. Základní konfigurace projektu

**package.json:**
```json
{
  "name": "your-app-name",
  "description": "Your app description",
  "repository": {
    "url": "git+https://github.com/yourusername/your-app-name.git"
  },
  "author": "Your Name <your.email@example.com>",
  "bugs": {
    "url": "https://github.com/yourusername/your-app-name/issues"
  },
  "homepage": "https://github.com/yourusername/your-app-name#readme"
}
```

**app.json - změň tyto hodnoty:**
```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-name",
    "scheme": "yourapp",
    "splash": {
      "backgroundColor": "#YourBrandColor"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp",
      "associatedDomains": ["applinks:yourapp.com"]
    },
    "android": {
      "package": "com.yourcompany.yourapp",
      "adaptiveIcon": {
        "backgroundColor": "#YourBrandColor"
      }
    },
    "plugins": [
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "YOUR_GOOGLE_CLIENT_ID"
        }
      ],
      [
        "@sentry/react-native/expo",
        {
          "organization": "yourorg",
          "project": "yourapp"
        }
      ]
    ]
  }
}
```

**eas.json - aktualizuj cache keys a bundle IDs:**
```json
{
  "build": {
    "development": {
      "env": {
        "EXPO_PUBLIC_BUNDLE_ID": "com.yourcompany.yourapp"
      },
      "ios": {
        "cache": {
          "key": "yourapp-ios-cache-2025-01-29"
        }
      }
    }
  }
}
```

### 2. Environment Variables (.env)

Zkopíruj `.env.template` do `.env` a nakonfiguruj:

```env
# Povinné - Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Volitelné - Google OAuth
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-client-id
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=your-client-secret

# Doporučené - Analytics & Error Tracking
EXPO_PUBLIC_POSTHOG_API_KEY=phc_your_key
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Volitelné - Subscriptions
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_your_key
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_your_key
```

### 3. Branding & Design

**Barvy - nahraď tyto hodnoty:**
- Hlavní barva templatu: `#6B7280` (šedá)
- Nahraď za svou brand barvu ve všech souborech:
  - `app.json` - splash screen a adaptive icon
  - `src/` složce - všechny komponenty s šedou barvou

**Assets:**
- `assets/icon.png` - 1024x1024px app ikona
- `assets/splash.png` - splash screen obrázek
- `assets/adaptive-icon.png` - Android adaptive ikona
- `assets/favicon.png` - web favicon

### 4. Databáze Setup (Supabase)

1. **Vytvoř projekt na [supabase.com](https://supabase.com)**
2. **Spusť migrace:**
   ```bash
   # Jen základní auth a payments tabulky
   supabase db push
   ```
3. **Nakonfiguruj RLS policies pro bezpečnost**
4. **Přidej URL a anon key do `.env`**

### 5. External Services Setup

**PostHog Analytics (doporučené):**
1. Účet na [posthog.com](https://posthog.com)
2. Vyber EU instance pro GDPR
3. Přidej API key do `.env`

**Sentry Error Tracking:**
1. Projekt na [sentry.io](https://sentry.io)
2. Přidej DSN do `.env`
3. Aktualizuj organization/project v `app.json`

**RevenueCat Subscriptions (volitelné):**
1. Účet na [revenuecat.com](https://revenuecat.com)
2. Nakonfiguruj iOS a Android apps
3. Přidaj API keys do `.env`

**Google OAuth (volitelné):**
1. [Google Cloud Console](https://console.cloud.google.com)
2. Vytvoř OAuth 2.0 credentials
3. Nakonfiguruj pro iOS a Android
4. Přidaj client IDs do `.env` a `app.json`

### 6. Customizace kódu

**Mock Data:**
- `src/services/mock-data.ts` - nahraď za svá testovací data
- `src/types/database.ts` - definuj své database typy

**UI Komponenty:**
- `src/components/ui/` - základní UI komponenty
- Přidej své specifické komponenty do `src/components/`

**Navigace:**
- `src/app/(tabs)/` - hlavní tab navigace
- Přidaj své screens do `src/app/`

**State Management:**
- `src/stores/` - Zustand stores
- `src/services/` - external services

### 7. Testing & Quality

**Před spuštěním:**
```bash
npm install
npm run type-check  # TypeScript kontrola
npm run quality     # Quality checks (pokud nakonfigurováno)
```

**Development:**
```bash
npm run dev         # Spustí Expo dev server
npm run ios:dev     # iOS device
npm run android:dev # Android device
```

**Building:**
```bash
npm run build:ios           # iOS development build
npm run build:android       # Android development build
npm run build:production    # Production build
```

## 🔧 Pokročilá customizace

### Změna color scheme

1. **Aktualizuj `tailwind.config.js`:**
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#your-color-50',
          500: '#your-color-500',
          900: '#your-color-900',
        }
      }
    }
  }
}
```

2. **Aktualizuj komponenty v `src/components/ui/`**

### Přidání nové navigace

1. **Přidaj screen do `src/app/`**
2. **Aktualizuj tab navigation v `src/app/(tabs)/_layout.tsx`**

### Database schema změny

1. **Vytvoř novou migraci v `supabase/migrations/`**
2. **Aktualizuj TypeScript typy v `src/types/database.ts`**
3. **Přidaj do mock dat v `src/services/mock-data.ts`**

## ✅ Verifikace setup

Po dokončení setup zkontroluj:

- [ ] App se spustí bez chyb (`npm run dev`)
- [ ] TypeScript compilation prochází (`npm run type-check`)
- [ ] Supabase connection funguje
- [ ] Authentication flows fungují
- [ ] App store build prochází (`npm run build:production`)
- [ ] Analytics events se odesílají (development menu)

## 🚀 Deploy Checklist

Před nasazením do production:

- [ ] Všechny environment variables nakonfigurovány
- [ ] App ikony a splash screen nahrazeny
- [ ] Bundle IDs a schemes aktualizovány
- [ ] Google OAuth nakonfigurován pro production
- [ ] Sentry project vytvořen
- [ ] RevenueCat products nakonfigurovány (pokud používáš)
- [ ] Apple Developer / Google Play accounts připraveny

---

**Hotovo! 🎉** 

Váš universal template je připraven k použití. Pro další pomoč se podívejte do `README-TEMPLATE.md` nebo development menu v aplikaci.