# Universal Mobile App Template

A production-ready React Native template built with Expo, TypeScript, and modern mobile development best practices.

## 🚀 Features

### Core Architecture
- **Expo SDK 53** with React Native 0.79.5
- **TypeScript** for type safety
- **Expo Router** for file-based navigation
- **NativeWind** for styling (Tailwind CSS)
- **Zustand** for state management
- **TanStack React Query** for server state

### Production Services
- **Supabase** - Database and authentication
- **PostHog** - User analytics (EU compliant)
- **Sentry** - Error tracking
- **RevenueCat** - Subscription management
- **Google/Apple OAuth** - Social authentication

### UI/UX
- **Light/Dark mode** with system preference support
- **Responsive design** for all screen sizes
- **Accessibility** features built-in
- **Loading states** and error boundaries
- **Toast notifications** system

### Development Experience
- **Development menu** for testing all features
- **Hot reloading** and fast refresh
- **TypeScript strict mode** enabled
- **EAS Build** pipeline ready
- **Git hooks** for code quality

## 📱 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (macOS) or Android Studio
- EAS CLI for building (`npm install -g eas-cli`)

### Installation

1. **Clone and setup:**
   ```bash
   git clone <your-repo-url>
   cd your-app-name
   npm install    # ⚠️ DŮLEŽITÉ: Bez tohoto kroku nebude expo fungovat!
   ```

2. **Configure environment:**
   ```bash
   cp .env.template .env
   # Edit .env with your actual API keys
   ```

3. **Start development:**
   ```bash
   npm run dev
   ```

### Environment Configuration

Copy `.env.template` to `.env` and configure:

```env
# Supabase (Required)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Google OAuth (Optional)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-client-id
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=your-client-secret

# Analytics & Error Tracking (Recommended)
EXPO_PUBLIC_POSTHOG_API_KEY=phc_your_key
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Subscriptions (Optional)
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_your_key
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_your_key
```

## 🏗️ Project Structure

```
src/
├── app/                 # Expo Router screens
│   ├── (tabs)/         # Tab navigation
│   ├── auth/           # Authentication screens
│   └── dev/            # Development screens
├── components/         # Reusable components
│   ├── ui/             # Basic UI components
│   └── common/         # Feature components
├── contexts/           # React contexts
├── hooks/             # Custom hooks
├── lib/               # Third-party configurations
├── services/          # External services
├── stores/            # Zustand stores
├── types/             # TypeScript types
└── utils/             # Utility functions
```

## 🔧 Development Commands

### Development
```bash
npm run dev                  # Start with dev client
npm run dev:clear           # Start with cleared cache
npm run ios:dev             # Run on iOS device
npm run android:dev         # Run on Android device
```

### Building
```bash
npm run build:ios           # iOS development build
npm run build:android       # Android development build
npm run build:production    # Production build
```

### Quality
```bash
npm run type-check          # TypeScript validation
npm run quality             # Run all quality checks
npm run fix                 # Auto-fix issues
```

## 📊 Services Setup

### Supabase Database
1. Create project at [supabase.com](https://supabase.com)
2. Run the database migrations in `supabase/migrations/`
3. Configure RLS policies for security
4. Add your URL and anon key to `.env`

### PostHog Analytics
1. Create account at [posthog.com](https://posthog.com)
2. Choose EU instance for GDPR compliance
3. Add your API key to `.env`
4. Test with the analytics development panel

### Sentry Error Tracking
1. Create project at [sentry.io](https://sentry.io)
2. Add your DSN to `.env`
3. Configure source maps for better debugging

### RevenueCat Subscriptions
1. Create account at [revenuecat.com](https://revenuecat.com)
2. Configure your iOS and Android apps
3. Add API keys to `.env`
4. Test with the RevenueCat development panel

## 🎨 Theming

The app includes a universal gray theme with light/dark mode support:

### Using Theme
```tsx
import { useTheme } from '../contexts/theme-context';

function MyComponent() {
  const { isDark, setThemeMode } = useTheme();
  
  return (
    <View className="bg-white dark:bg-gray-900">
      <Text className="text-gray-900 dark:text-white">
        Hello, {isDark ? 'dark' : 'light'} mode!
      </Text>
    </View>
  );
}
```

### Theme Colors
- **Primary**: Gray-based (`#6B7280`)
- **Background**: White/Dark gray
- **Text**: Adaptive contrast
- **Status**: Success, warning, error, info

## 🔒 Authentication

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Configure for iOS and Android
4. Add client IDs to `.env`

### Apple Sign-In
1. Enable in Apple Developer Console
2. Configure in Xcode project
3. No additional keys needed

## 🚀 Deployment

### EAS Build
```bash
# Development builds
eas build --platform ios --profile development
eas build --platform android --profile development

# Production builds
eas build --platform all --profile production
```

### App Store Deployment
```bash
# Submit to stores
eas submit --platform all
```

## 🧪 Testing

### Development Menu
Access the development menu at `/dev-menu` to test:
- Analytics events
- Error tracking
- Authentication flows
- Subscription management
- Theme switching
- Mock data scenarios

### Running Tests
```bash
npm run test-screens        # Test screen implementations
npm run diagnose-network    # Network diagnostics
```

## 📱 Platform-Specific Notes

### iOS
- Requires Apple Developer account for device testing
- Enable Developer Mode in Settings
- Local Network permission needed for Metro

### Android
- Enable Developer Options
- USB Debugging required
- May need to accept Metro server certificate

## 🔧 Customization

### App Configuration
1. Update `app.config.ts` with your app details
2. Replace icons and splash screen in `assets/`
3. Configure deep linking in `app.config.ts`

### Database Schema
1. Modify `src/types/database.ts` for your data structure
2. Update `src/services/mock-data.ts` with relevant mock data
3. Create Supabase migrations for schema changes

### Styling
1. Update `tailwind.config.js` for custom colors
2. Modify `src/utils/constants/styles.ts` for component styles
3. Customize theme in `src/contexts/theme-context.tsx`

## 🐛 Troubleshooting

### Common Issues

**"Failed to resolve plugin for module expo-router" po git clone:**
```bash
npm install  # Nejprve nainstalujte závislosti!
```

**Metro bundler issues:**
```bash
npm run clear-cache
npm run reset-metro
```

**iOS build issues:**
```bash
npm run clear-ios
cd ios && pod install
```

**Android build issues:**
```bash
npm run clear-android
```

**Network connectivity:**
```bash
npm run diagnose-network
```

### Getting Help
- Check the development menu for diagnostic tools
- Review error logs in Sentry dashboard
- Use PostHog to understand user behavior
- Check Expo documentation for platform-specific issues

## 📝 License

This template is MIT licensed. Feel free to use it for your projects.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**Happy coding! 🎉**

Built with ❤️ using Expo, React Native, and modern development practices.