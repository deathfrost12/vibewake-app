# VibeWake - Aplikace pro chytrá buzení

## Přehled aplikace

VibeWake (dříve Owlee) je pokročilá mobilní aplikace pro buzení postavená na React Native a Expo. Aplikace nabízí inovativní přístup k rannímu buzení s důrazem na personalizaci, kvalitní audio zážitek a prémiové funkce pro lepší začátek dne.

## Hlavní funkce

### 🔊 Pokročilá audio integrace

- **Přednastavené zvuky**: Kurátorovaná kolekce kvalitních budíků
- **Nahrávání vlastních souborů**: Možnost nahrát MP3, M4A, WAV, AAC soubory
- **Spotify integrace**: Buzení s oblíbenými písničkami ze Spotify
- **Audio preview**: Okamžité přehrání a testování vybraných zvuků
- **Pozadí audio**: Spolehlivé přehrávání i při uzamčeném telefonu

### ⏰ Chytré plánování alarmů

- **Opakování**: Denní, týdenní, nebo vlastní vzory opakování
- **Více alarmů**: Neomezený počet aktivních buzení
- **Inteligentní plánování**: Optimalizace pro spolehlivé buzení
- **Pozadí zpracování**: Alarm funguje i když je aplikace zavřená

### 👤 Správa uživatelských účtů

- **Autentizace**: Google OAuth, Apple Sign-In
- **Synchronizace**: Alarmy synchronizované mezi zařízeními
- **Profil uživatele**: Správa osobních údajů a preferencí

### 💎 Prémiové předplatné

- **RevenueCat integrace**: Správa předplatného a plateb
- **Pokročilé funkce**: Exkluzivní zvuky, neomezené alarmy
- **Spotify Premium**: Integrace s placenými Spotify účty

## Struktura obrazovek

### Hlavní navigace (Tab Navigation)

1. **Dashboard** (`/dashboard`)
   - Přehled všech aktivních alarmů
   - Rychlé zapnutí/vypnutí alarmů
   - Swipe-to-delete funkcionalita
   - Celkový stav alarmů

2. **Vytvořit Alarm** (`/create`)
   - Nastavení času buzení
   - Výběr audio zdroje
   - Konfigurace opakování
   - Preview vybraného zvuku

3. **Profil** (`/profile`)
   - Uživatelské nastavení
   - Správa předplatného
   - Informace o účtu

### Autentizační obrazovky (`/auth`)

- **Přihlášení** (`/auth/login`)
- **Registrace** (`/auth/register`)
- **Zapomenuté heslo** (`/auth/forgot-password`)
- **OAuth callback** (`/auth/callback`)

### Správa profilu (`/profile`)

- **Nastavení účtu** (`/profile/account`)
- **Správa předplatného** (`/profile/subscription`)
- **Soukromí a bezpečnost** (`/profile/privacy`)

### Alarm systém (`/alarms`)

- **Zvonění alarmu** (`/alarms/ringing`)
- **Editace alarmu** (`/alarms/edit/[id]`)
- **Historie alarmů** (`/alarms/history`)

### Vývojářské nástroje (`/dev`)

- **Testování komponent** (`/dev/test-screens`)
- **Audio testy** (`/dev/audio-test`)
- **Diagnostika sítě** (`/dev/network-test`)

## Klíčové komponenty

### Audio systém

- **AudioPicker**: Výběr ze všech dostupných audio zdrojů
- **SpotifyWebPlayer**: Integrace s Spotify Web API
- **SoundLibrary**: Správa přednastavených zvuků
- **FileUploader**: Nahrávání vlastních audio souborů

### UI komponenty

- **ThemedView/ThemedText**: Komponenty s podporou tmavého/světlého režimu
- **LoadingStates**: Jednotné loading stavy napříč aplikací
- **Toast notifikace**: Zpětná vazba pro uživatelské akce
- **SafeAreaView**: Správné zobrazení na všech zařízeních

### Správa stavu

- **auth-store**: Zustand store pro autentizaci
- **revenuecat-store**: Správa předplatného a plateb
- **React Query**: Server state management pro Supabase data

## Technické služby

### Databáze (Supabase)

- **Uživatelské účty**: Správa profilů a autentizace
- **Alarmy**: Persistentní uložení všech alarmů
- **Audio soubory**: Metadata nahraných souborů
- **Předplatné**: Tracking prémiových funkcí

### Externí integrace

- **Spotify API**: Přístup k hudební knihovně uživatele
- **Google/Apple OAuth**: Bezpečná autentizace
- **RevenueCat**: Správa in-app purchases a předplatného
- **PostHog**: Analytika používání aplikace
- **Sentry**: Monitoring chyb a performance

### Notifikace a pozadí

- **Push notifikace**: Spolehlivé doručování alarmů
- **Background processing**: Plánování alarmů v systému
- **App permissions**: Správa povolení pro mikrofon, notifikace

## Designový systém

### Barevná paleta "Vibrant Cyan"

- **Primární**: #5CFFF0 (Neon cyan)
- **Akcentní**: #75FFB0 (Neon mint), #66F0FF (Neon aqua)
- **Pozadí**: Adaptivní tmavý/světlý režim
- **UI**: Minimalistický design s focus na funkčnost

### Stylovací přístup

- **NativeWind**: Utility-first CSS pro 90% stylování
- **Gluestack UI v2**: Komplexní komponenty když je potřeba
- **Responzivní**: Optimalizováno pro všechny velikosti displejů

## Uživatelské scénáře

### Základní použití

1. **Nastavení prvního alarmu**: Registrace → výběr času → výběr zvuku → aktivace
2. **Ranní buzení**: Alarm zvoní → snooze/zastavit → rychlé nastavení dalšího dne
3. **Správa více alarmů**: Dashboard s přehledem → rychlé zapínání/vypínání

### Pokročilé funkce

1. **Spotify integrace**: Propojení účtu → procházení playlistů → výběr skladby
2. **Vlastní audio**: Nahrání souboru → preview → uložení do knihovny
3. **Prémiové předplatné**: Upgrade → přístup k exkluzivním zvukům

### Administrace

1. **Synchronizace**: Změny se automaticky sync mezi zařízeními
2. **Záloha**: Všechna data bezpečně uložena v cloudu
3. **Privacy**: Plná kontrola nad sdílenými daty

## Cílová skupina

- **Primární**: Mladí dospělí (18-35 let) se zájmem o kvalitní audio a tech
- **Sekundární**: Všichni uživatelé hledající spolehlivé a personalizovatelné buzení
- **Premium segment**: Spotify Premium uživatelé, audiophiles

## Monetizace

- **Freemium model**: Základní funkce zdarma
- **Prémiové předplatné**: Pokročilé audio, unlimited alarmy, Spotify integrace
- **In-app purchases**: Jednotlivé prémiové zvukové balíčky

## Platformy

- **iOS**: App Store (iPhone, iPad)
- **Android**: Google Play Store
- **Cross-platform**: Jediný kód pro obě platformy díky React Native/Expo
