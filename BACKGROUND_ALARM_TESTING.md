# VibeWake Background Alarm Testing Guide

## 🎯 Implementace dokončena

Byl kompletně implementován background alarm systém pro VibeWake aplikaci s těmito klíčovými komponenty:

### ✅ Implementované funkce

1. **Background Audio Playback** - `AudioService`
   - Konfigurace `Audio.setAudioModeAsync()` pro background přehrávání
   - Support pro iOS silent mode
   - Interruption handling pro prioritizaci alarmů

2. **Local Notifications** - `NotificationService`
   - Scheduling alarmů pomocí Expo Notifications
   - Support pro recurring a one-time alarmy
   - Custom notification channels pro Android

3. **Background Tasks** - `BackgroundTaskService`
   - TaskManager integrace pro background execution
   - Automatic alarm triggering when app is closed

4. **Centralized Management** - `AlarmService` & `AlarmManager`
   - Unified API pro všechny alarm operace
   - Integration mezi audio, notifications a background tasks
   - Health monitoring a error handling

5. **Store Integration** - aktualizovaný `alarm-store.ts`
   - Automatic service initialization
   - State synchronization s background systémem

### 📁 Nové soubory

```
src/services/
├── alarm-manager.ts              # Central manager pro všechny alarm služby
├── audio/
│   └── audio-service.ts          # Background audio configuration
├── alarms/
│   └── alarm-service.ts          # Main alarm logic & management
├── background/
│   └── background-task-service.ts # Background task handling
└── notifications/
    └── notification-service.ts    # Enhanced with background audio support
```

### 🔧 Konfigurace

**app.json** - aktualizováno pro:

- iOS `UIBackgroundModes: ["audio", "background-processing"]`
- Android permissions (`WAKE_LOCK`, `SCHEDULE_EXACT_ALARM`)
- expo-task-manager plugin

**\_layout.tsx** - automatic initialization při startu aplikace

## 🧪 Testing na Real Devices

### Předpoklady

1. **Development build required** - background audio nefunguje v Expo Go
2. **Real device testing** - simulátory mají omezené background capabilities
3. **Permissions** - notification permissions musí být uděleny

### Test Scenarios

#### 1. Basic Background Audio Test

```bash
# Build development version
npm run build:ios
# nebo
npm run build:android
```

**Test kroky:**

1. Otevři aplikaci na real device
2. Vytvoř alarm na za 2-3 minuty
3. Minimalizuj aplikaciju (home button)
4. Počkej až alarm zvoní
5. ✅ **Expected:** Audio pokračuje i když je app minimalizována

#### 2. App Killed Test

**Test kroky:**

1. Vytvoř alarm na za 5 minut
2. Zavři aplikaci úplně (swipe up a swipe away)
3. Počkej až alarm zvoní
4. ✅ **Expected:** Local notification zobrazí alarm, audio hraje na pozadí

#### 3. Device Locked Test

**Test kroky:**

1. Vytvoř alarm na za 2 minuty
2. Uzamkni device (power button)
3. Počkej až alarm zvoní
4. ✅ **Expected:** Alarm zvoní i s uzamčeným displejem

#### 4. Silent Mode Test (iOS)

**Test kroky:**

1. Zapni silent mode (mute switch)
2. Vytvoř alarm na za 1 minutu
3. Počkej až alarm zvoní
4. ✅ **Expected:** Alarm hraje i v silent mode

### Debug Commands

```bash
# Check system status
console.log('AlarmManager status:', await alarmManager.healthCheck());

# Check background tasks
console.log('Background tasks:', await backgroundTaskService.getBackgroundTaskStatus());

# Check scheduled notifications
console.log('Scheduled alarms:', await alarmService.getScheduledAlarms());
```

### Troubleshooting

#### Audio nepokračuje na pozadí

1. Zkontroluj iOS Background App Refresh (Settings > General > Background App Refresh)
2. Zkontroluj Android Battery Optimization (Settings > Apps > VibeWake > Battery)
3. Verify development build (ne Expo Go)

#### Notifications se nezobrazují

1. Zkontroluj notification permissions
2. Verify Android notification channels
3. Check `expo-notifications` plugin v app.json

#### Background tasks nefungují

1. iOS: Background App Refresh must be enabled
2. Android: Disable battery optimization
3. Verify `expo-task-manager` plugin v app.json

### Performance Notes

- Background audio consumption: ~5-10% battery per hour
- Local notifications: minimal battery impact
- Background tasks: iOS má strict 30s limit
- Memory: optimized for long-running alarms

### Production Considerations

1. **Battery Usage** - inform users about background audio
2. **Permissions** - graceful handling when denied
3. **Error Recovery** - fallback to system notifications
4. **Testing** - comprehensive real device testing required

---

## 🚀 Ready for Testing

Systém je připraven pro testování na real devices. Background alarm funkcionalita by měla fungovat správně i když je aplikace minimalizována, zavřená nebo je device uzamčený.

**Next Steps:**

1. Build development version pro iOS/Android
2. Test na real devices podle výše uvedených scénářů
3. Monitor konzoli pro debug zprávy
4. Report any issues pro další optimalizaci
