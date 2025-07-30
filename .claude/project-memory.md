# Repetito Project Memory

## Current Project Status

**Date**: January 16, 2025  
**Branch**: `feature/phase5-revenuecat-xcode-build`  
**Last Major Achievement**: Successfully resolved PostHog getCurrentRoute navigation errors ✅  
**Current Phase**: Phase 5 - RevenueCat Integration & Xcode Build Optimization

---

## 🚨 Recent Major Issues RESOLVED

### 1. PostHog getCurrentRoute Navigation Error (RESOLVED ✅)

**Issue**: `ERROR getCurrentRoute error [TypeError: navigation.getCurrentRoute is not a function]`  
**Root Cause**: PostHog React Native automatically tracks navigation using `navigation.getCurrentRoute()` from React Navigation, but Expo Router doesn't have this method.  
**Solution**:

- Disabled PostHog automatic screen tracking in `_layout.tsx`
- Implemented manual screen tracking in `lib/analytics.ts`
- Updated configuration: `autocapture: { captureScreens: false, captureTouches: true }`
- **User Confirmation**: "TPČ ONO TO FAKT ZAFUNGOVALO!!!! Už se nevypisuje navigation error :D"

### 2. EAS Build Podfile Issues (RESOLVED ✅)

**Issue**: "No Podfile found in the project directory" during EAS builds  
**Solution**: Cache invalidation strategy in `eas.json` with regular cache key updates

### 3. RevenueCat Development Configuration (RESOLVED ✅)

**Issue**: Missing offerings in development builds  
**Solution**: Enhanced fallback system with mock packages for development testing

---

## 🎯 Key Project Decisions

### Positioning & Target Market

- **Scope**: Universal educational app for ALL Czech students (elementary → university)
- **NOT limited to maturita** - serves basic schools, high schools, universities
- **Czech-first localization** with cultural context

### Technical Architecture

- **Primary UI**: NativeWind (utility-first CSS) - 90% of styling
- **Secondary UI**: Gluestack UI v2 - complex components only when needed
- **Brand**: "Magical Green" (#14C46D) theme
- **Routing**: Expo Router file-based navigation
- **State**: Zustand (UI) + React Query (server state)
- **Backend**: Supabase with PostgreSQL + RLS

### Development Workflow

- **Build Strategy**: EAS Build free plan optimization
- **Daily Development**: OTA updates (0 credits)
- **Monthly Builds**: Development builds (2 credits)
- **Production**: Only when ready for app stores

### MCP Servers Configured

- ✅ Supabase MCP - Database integration
- ✅ GitHub MCP - Repository management
- ✅ Smart Memory MCP - Local context (backup)
- ✅ Context7 MCP - Documentation access
- ✅ Brave Search MCP - Research capabilities
- ✅ React Native Debugger MCP - Runtime debugging
- ✅ Expo Docs MCP - Development documentation

## 📱 App Features Priority

### Core Educational Features

1. **Spaced Repetition Engine** - Advanced algorithm for optimal learning
2. **Magic Notes OCR** - AI-powered content creation from images
3. **Study Sets Management** - Czech educational content organization
4. **Progress Tracking** - Learning analytics and performance metrics

### Premium Features (RevenueCat)

- Unlimited study sets
- Offline download
- Advanced analytics
- Premium educational content

## 🎨 Design Guidelines

### "Magical Green" Theme

- Primary: #14C46D
- Primary Dark: #0F9954 (interactions)
- Primary Light: #A7F3D0 (backgrounds)

### Mobile-First Performance

- Target: 60fps animations
- Memory efficiency for long study sessions
- Offline-first architecture
- Czech typography optimization

## 🔧 Environment Configuration

### Required Variables

- Supabase: URL + Service Role Key ✅
- GitHub: Personal Access Token ✅
- PostHog: EU instance for GDPR compliance ✅
- Sentry: Error tracking ✅
- RevenueCat: iOS/Android API keys ✅
- Context7: API key 🔄 (pending registration)

## 🛠️ Current Technical Stack

### Core Framework

- **React Native**: 0.79.5
- **Expo SDK**: 53.0.19
- **Expo Router**: 5.1.3 (file-based routing)
- **TypeScript**: Latest

### State Management

- **Zustand**: UI state management
- **TanStack React Query**: Server state for Supabase

### Backend & Services

- **Supabase**: Database, auth, real-time features
- **RevenueCat**: Subscription management
- **PostHog**: Analytics (EU instance for GDPR)
- **Sentry**: Error tracking

### Styling & UI

- **NativeWind**: Primary styling system (utility-first)
- **Gluestack UI v2**: Complex components (secondary)

---

## 📊 Analytics & Error Tracking

### PostHog Configuration

- **Instance**: EU (https://eu.posthog.com) for GDPR compliance
- **Auto-capture**: Disabled for screen tracking (manual implementation)
- **Touch events**: Enabled
- **Czech localization**: Built-in

### Sentry Configuration

- **Production-ready**: Error boundaries and route tracking
- **Xcode Cloud**: Auto-upload disabled for cloud builds
- **Development**: Reduced logging to minimize noise

---

## 🔧 Development Workflow

### Current Commands

```bash
# Development
npm run dev                 # Start dev server
npm run dev:clear          # Clear cache
npm run type-check         # TypeScript validation

# Building
npm run build:ios          # iOS development build
npm run build:android      # Android development build

# Quality
npm run quality            # Linting + formatting
npm run fix               # Auto-fix issues
```

### Quality Gates

- ✅ Zero getCurrentRoute errors
- ✅ Successful EAS builds
- ✅ TypeScript compilation passes
- ✅ All quality gates pass

---

## 📋 Next Development Phases

### Phase 6: Core Educational Features

- [ ] Spaced repetition algorithm implementation
- [ ] Study session management
- [ ] Progress tracking system
- [ ] Czech content validation

### Phase 7: Magic Notes OCR

- [ ] Image processing pipeline
- [ ] AI-powered content generation
- [ ] Czech language optimization
- [ ] User credit system

### Phase 8: Premium Features

- [ ] Advanced analytics dashboard
- [ ] Export functionality
- [ ] Collaboration features
- [ ] Advanced study modes

---

## 🚑 Emergency Procedures

### If Build Fails

1. Clear all caches: `npm run clear-cache`
2. Update EAS cache key in `eas.json`
3. Reset native directories: `rm -rf ios android`
4. Emergency prebuild: `npx expo prebuild --clean`

### If Runtime Errors

1. Check console for getCurrentRoute errors (should be resolved)
2. Verify environment variables: `npm run debug-env`
3. Test with minimal configuration
4. Use MCP debugging tools

---

## 💬 Communication Notes

### For Future Sessions

- **Czech Language**: User prefers Czech communication
- **Direct Approach**: Minimal explanations, focus on solutions
- **Quality Focus**: Production-ready code required
- **Testing**: Always verify on real devices

### Key Phrases

- **"RNEW"**: Apply all CLAUDE.md best practices
- **"RPLAN"**: Check consistency with existing codebase
- **"RCODE"**: Implement with tests and type checking
- **"RCHECK"**: Skeptical senior engineer review

---

**Last Updated**: January 16, 2025  
**Next Review**: After Phase 6 completion  
**Status**: Ready for next development phase ✅
