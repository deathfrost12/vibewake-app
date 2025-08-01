# Universal Mobile App Template

A production-ready React Native template built with Expo, TypeScript, and modern mobile development best practices.

## 🚀 Quick Start

**1. Clone and install:**

```bash
git clone https://github.com/yourusername/your-app-name.git
cd your-app-name
npm install
```

**2. Setup environment:**

```bash
cp .env.template .env
# Edit .env with your API keys
```

**3. Start development:**

```bash
npm run dev
```

## 📱 What's Included

- **Expo SDK 53** with React Native 0.79.5
- **TypeScript** for type safety
- **Expo Router** for file-based navigation
- **NativeWind** for styling (Tailwind CSS)
- **Zustand** for state management
- **TanStack React Query** for server state
- **Supabase** integration for database and auth
- **PostHog** analytics setup
- **Sentry** error tracking
- **RevenueCat** subscription management
- **Google/Apple OAuth** authentication
- **Light/Dark mode** theming
- **Development menu** with testing tools

## 📚 Documentation

- **[Setup Guide](SETUP-TEMPLATE.md)** - Complete setup instructions for new projects
- **[Template README](README-TEMPLATE.md)** - Detailed features and architecture
- **[Development Guide](CLAUDE.md)** - Best practices and coding guidelines

## 🛠️ Development Commands

```bash
# Development
npm run dev                  # Start with expo dev client
npm run ios:dev             # Run on iOS device
npm run android:dev         # Run on Android device

# Building
npm run build:ios           # iOS development build
npm run build:android       # Android development build
npm run build:production    # Production build

# Quality
npm run type-check          # TypeScript validation
npm run quality             # Run quality checks
```

## 🎯 Template Features

### Core Architecture

- File-based routing with Expo Router
- Component-based UI architecture
- Centralized state management
- Type-safe API integration

### Production Services

- **Database**: Supabase with RLS policies
- **Authentication**: Google/Apple OAuth + email/password
- **Analytics**: PostHog with GDPR compliance
- **Error Tracking**: Sentry integration
- **Subscriptions**: RevenueCat setup
- **Push Notifications**: Expo notifications

### UI/UX Features

- Responsive design for all screen sizes
- Light/dark mode with system preference
- Loading states and error boundaries
- Toast notification system
- Premium gates and paywall components

### Development Tools

- Development menu (`/dev-menu`) for testing
- Mock data service for rapid prototyping
- TypeScript strict mode enabled
- Hot reloading and fast refresh
- CI/CD scripts included

## 🚀 Getting Started

1. **Use the setup guide**: Follow [SETUP-TEMPLATE.md](SETUP-TEMPLATE.md) for complete project setup
2. **Configure services**: Set up Supabase, PostHog, Sentry according to the guide
3. **Customize branding**: Update colors, icons, and app metadata
4. **Add your features**: Build on the universal foundation

## 📄 License

MIT License - feel free to use this template for your projects.

## 🤝 Contributing

Contributions welcome! This template is designed to be a solid foundation for any mobile app project.

---

**Ready to build your next mobile app?** 🎉

Start with the [Setup Guide](SETUP-TEMPLATE.md) and you'll have a production-ready app running in minutes.
