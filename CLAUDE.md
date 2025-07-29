# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Universal Mobile App Template built with React Native, Expo, and modern mobile development best practices. The template provides a production-ready foundation for any mobile app with authentication, analytics, subscriptions, and comprehensive UI components.

## Implementation Best Practices

### 0 — Purpose  

These rules ensure maintainability, safety, and developer velocity for universal mobile app development.
**MUST** rules are enforced by CI; **SHOULD** rules are strongly recommended.

---

### 1 — Before Coding

- **BP-1 (MUST)** Ask the user clarifying questions.
- **BP-2 (SHOULD)** Draft and confirm an approach for complex work.  
- **BP-3 (SHOULD)** If ≥ 2 approaches exist, list clear pros and cons.
- **BP-4 (MUST)** Before implementing any solution, ALWAYS: Use CI/CD workflows in scripts/ci/ first, search for additional information via MCP tools or WebSearch if uncertain, be 100% confident in implementation approach before proceeding, verify solution against current documentation and recent issues.

---

### 2 — While Coding

- **C-1 (MUST)** Follow TDD when applicable: scaffold stub → write failing test → implement.
- **C-2 (MUST)** Name functions with existing domain vocabulary for consistency.  
- **C-3 (SHOULD NOT)** Introduce classes when small testable functions suffice.  
- **C-4 (SHOULD)** Prefer simple, composable, testable functions.
- **C-5 (MUST)** Prefer branded `type`s for IDs
  ```ts
  type UserId = Brand<string, 'UserId'>   // ✅ Good
  type UserId = string                    // ❌ Bad
  ```  
- **C-6 (MUST)** Use `import type { … }` for type-only imports.
- **C-7 (SHOULD NOT)** Add comments except for critical caveats; rely on self‑explanatory code.
- **C-8 (SHOULD)** Default to `type`; use `interface` only when more readable or interface merging is required. 
- **C-9 (SHOULD NOT)** Extract a new function unless it will be reused elsewhere, is the only way to unit-test otherwise untestable logic, or drastically improves readability of an opaque block.
- **C-10 (MUST)** Use NativeWind className prop for styling; avoid StyleSheet.create unless absolutely necessary.
- **C-11 (SHOULD)** Use English-first localization for user-facing text (adaptable to any language).
- **C-12 (SHOULD)** Optimize for mobile performance: 60fps animations, memory efficiency during long sessions.

---

### 3 — Testing

- **T-1 (MUST)** For a simple function, colocate unit tests in `*.spec.ts` in same directory as source file.
- **T-2 (MUST)** For any API change, add/extend integration tests with Supabase.
- **T-3 (MUST)** ALWAYS separate pure-logic unit tests from database-touching integration tests.
- **T-4 (SHOULD)** Prefer integration tests over heavy mocking.  
- **T-5 (SHOULD)** Unit-test complex algorithms thoroughly.
- **T-6 (SHOULD)** Test the entire structure in one assertion if possible
  ```ts
  expect(result).toBe([value]) // Good

  expect(result).toHaveLength(1); // Bad
  expect(result[0]).toBe(value); // Bad
  ```
- **T-7 (MUST)** Test critical user flows: authentication, subscription management, data sync.
- **T-8 (SHOULD)** Test offline functionality and network error handling.

---

### 4 — Mobile App Specifics

- **M-1 (MUST)** Test on both iOS and Android devices, not just simulators.
- **M-2 (MUST)** Ensure components work with different screen sizes and safe area insets.
- **M-3 (SHOULD)** Implement loading states for all async operations (network requests, file operations).
- **M-4 (MUST)** Handle network connectivity changes gracefully.
- **M-5 (SHOULD)** Use React Query for server state management with Supabase.
- **M-6 (MUST)** Implement proper error boundaries with user-friendly error messages.

---

### 5 — Code Organization

- **O-1 (MUST)** Place shared components in `src/components/` with feature-based subdirectories.
- **O-2 (MUST)** Use Expo Router file-based routing: `app/(tabs)/`, `app/auth/`, etc.
- **O-3 (SHOULD)** Group related functionality: `services/`, `stores/`, `hooks/`, `utils/`.
- **O-4 (MUST)** Keep data types in `src/types/` with proper Zod schemas.

---

### 6 — Tooling Gates

- **G-1 (MUST)** `npm run type-check` passes (TypeScript compilation).  
- **G-2 (SHOULD)** `npm run quality` passes (linting and formatting).
- **G-3 (MUST)** EAS development build compiles successfully before production builds.

---

### 7 - Git

- **GH-1 (MUST)** Use Conventional Commits format: https://www.conventionalcommits.org/en/v1.0.0
- **GH-2 (SHOULD NOT)** Refer to Claude or Anthropic in commit messages.

---

## Writing Functions Best Practices

When evaluating whether a function you implemented is good or not, use this checklist:

1. Can you read the function and HONESTLY easily follow what it's doing? If yes, then stop here.
2. Does the function have very high cyclomatic complexity? (number of independent paths, or, in a lot of cases, number of nesting if if-else as a proxy). If it does, then it's probably sketchy.
3. Are there any common data structures and algorithms that would make this function much easier to follow and more robust? Parsers, trees, stacks / queues, etc.
4. Are there any unused parameters in the function?
5. Are there any unnecessary type casts that can be moved to function arguments?
6. Is the function easily testable without mocking core features (e.g. Supabase queries, RevenueCat, etc.)? If not, can this function be tested as part of an integration test?
7. Does it have any hidden untested dependencies or any values that can be factored out into the arguments instead? Only care about non-trivial dependencies that can actually change or affect the function.
8. Brainstorm 3 better function names and see if the current name is the best, consistent with rest of codebase.

IMPORTANT: you SHOULD NOT refactor out a separate function unless there is a compelling need, such as:
  - the refactored function is used in more than one place
  - the refactored function is easily unit testable while the original function is not AND you can't test it any other way
  - the original function is extremely hard to follow and you resort to putting comments everywhere just to explain it

## Writing Tests Best Practices

When evaluating whether a test you've implemented is good or not, use this checklist:

1. SHOULD parameterize inputs; never embed unexplained literals such as 42 or "foo" directly in the test.
2. SHOULD NOT add a test unless it can fail for a real defect. Trivial asserts (e.g., expect(2).toBe(2)) are forbidden.
3. SHOULD ensure the test description states exactly what the final expect verifies. If the wording and assert don't align, rename or rewrite.
4. SHOULD compare results to independent, pre-computed expectations or to properties of the domain, never to the function's output re-used as the oracle.
5. SHOULD follow the same lint, type-safety, and style rules as prod code (prettier, ESLint, strict types).
6. SHOULD express invariants or axioms (e.g., commutativity, idempotence, round-trip) rather than single hard-coded cases whenever practical.
7. Unit tests for a function should be grouped under `describe(functionName, () => ...`.
8. Use `expect.any(...)` when testing for parameters that can be anything (e.g. variable ids).
9. ALWAYS use strong assertions over weaker ones e.g. `expect(x).toEqual(1)` instead of `expect(x).toBeGreaterThanOrEqual(1)`.
10. SHOULD test edge cases, realistic input, unexpected input, and value boundaries.
11. SHOULD NOT test conditions that are caught by the type checker.
12. SHOULD test user authentication flows and subscription management.
13. SHOULD test mobile-specific scenarios (offline mode, background state, memory pressure).

## Common Development Commands

### Development & Testing
```bash
# Start development server
npm run dev                  # Development variant with expo dev client
npm run dev:clear           # Start with cleared cache
npm run dev:lan             # Use LAN for device testing
npm start                   # Basic expo start

# Platform-specific testing
npm run ios:dev             # Run on iOS device
npm run android:dev         # Run on Android device
npm run ios:sim             # Run on iOS simulator

# Type checking and quality
npm run type-check          # TypeScript validation (tsc --noEmit)
npm run quality             # Run quality checks via CI script
npm run fix                 # Auto-fix issues via CI script
npm run pre-commit          # Pre-commit checks

# Testing and diagnostics
npm run test-screens        # Test screen implementations
npm run debug-env           # Check environment variables
npm run diagnose-network    # Network connectivity diagnostics
```

### Build & Deployment
```bash
# EAS Builds (uses build credits)
npm run build:ios           # iOS development build
npm run build:android       # Android development build
npm run build:preview       # Preview build for both platforms
npm run build:production    # Production build for app stores

# CI/CD Pipeline
npm run ci:build            # CI build script
npm run ci:test             # CI test script
npm run ci:deploy           # CI deployment script
```

### Cache Management
```bash
npm run clear-cache         # Clear expo and node_modules cache
npm run clear-ios           # Clear iOS build artifacts and reinstall pods
npm run clear-android       # Clean Android gradle build
npm run reset-metro         # Kill and restart Metro server
```

## Code Architecture

### File-Based Routing (Expo Router)
- `src/app/` - All screens using Expo Router file-based navigation
- `src/app/(tabs)/` - Main tab navigation (customizable for your app)
- `src/app/auth/` - Authentication screens (login, register, forgot-password)
- `src/app/dev/` - Development and testing screens

### Component Architecture
- `src/components/ui/` - Reusable UI components (buttons, loading states, toasts)
- `src/components/auth/` - Authentication-specific components
- `src/components/common/` - Shared components across features
- Feature-specific folders as needed for your domain

### State Management
- **Zustand**: UI state management (`src/stores/`)
  - `auth-store.ts` - Authentication state
  - `revenuecat-store.ts` - Subscription/payment state
- **TanStack React Query**: Server state and caching for Supabase data

### Services Layer
- `src/services/supabase/` - Database client and queries
- `src/services/auth/` - Google and Apple OAuth implementations
- `src/services/analytics/` - PostHog analytics integration
- `src/services/notifications/` - Push notification handling

### Styling Approach
- **Primary**: NativeWind (utility-first CSS) for 90% of styling
- **Secondary**: Gluestack UI v2 for complex components (when needed)
- **Brand Theme**: Configurable via `tailwind.config.js`
- All styling uses `className` prop with NativeWind utilities

### Key Dependencies
```json
{
  "expo": "53.0.19",
  "react": "19.0.0", 
  "react-native": "0.79.5",
  "expo-router": "~5.1.3",
  "nativewind": "^4.1.23",
  "zustand": "^5.0.5",
  "@tanstack/react-query": "^5.81.2",
  "@supabase/supabase-js": "^2.50.1",
  "react-native-purchases": "^8.11.4",
  "posthog-react-native": "^4.1.3",
  "@sentry/react-native": "~6.14.0"
}
```

## Environment Setup

### Required Environment Variables
Always verify environment configuration before starting work:
```bash
cat .env  # Check current environment variables
```

Required variables include:
- Supabase URL/keys for database and auth
- PostHog API key for analytics (configurable region)
- Sentry DSN for error tracking
- RevenueCat API keys for subscription management (optional)

### Development Guidelines
- **Local development**: Use OTA updates (`expo start`) - no build credits used
- **Device testing**: Create development builds monthly - uses EAS build credits
- **Production**: Only build when ready for app store submission

## Universal Template Specifics

### Adaptability
- English-first localization (easily adaptable to any language)
- Configurable branding and color schemes
- Generic UI components suitable for any domain
- Modular architecture for easy feature addition/removal

### Mobile Performance
- Target 60fps for smooth animations
- Optimized for long user sessions with proper memory management
- Offline-first architecture with Supabase sync
- Network error handling and retry mechanisms

### Production Services Integration
- Supabase for authentication and database
- PostHog for user analytics (GDPR compliant options)
- Sentry for error tracking and performance monitoring
- RevenueCat for subscription management
- Google/Apple OAuth for social authentication

## Remember Shortcuts

### T-RESEARCH
When I type "t-research", this means:
```
Before implementing any solution, ALWAYS:
1. Use our CI/CD workflows in scripts/ci/ first to understand proper build process
2. Search for additional information via MCP tools or WebSearch if uncertain 
3. Be 100% confident in implementation approach before proceeding
4. If not confident, gather more information rather than guessing
5. Verify solution against current Expo/EAS documentation and recent issues (2024-2025)
```

### TNEW
When I type "tnew", this means:
```
Understand all BEST PRACTICES listed in CLAUDE.md.
Your code SHOULD ALWAYS follow these best practices for universal mobile app development.
```

### TPLAN
When I type "tplan", this means:
```
Analyze similar parts of the template codebase and determine whether your plan:
- is consistent with rest of React Native/Expo codebase
- introduces minimal changes
- reuses existing universal components and patterns
- follows NativeWind styling conventions
```

### TCODE
When I type "tcode", this means:
```
Implement your plan for the universal template and make sure your new tests pass.
Always run tests to make sure you didn't break anything else.
Always run `npm run type-check` to ensure TypeScript compilation.  
Test on both iOS and Android if UI changes are involved.
```

### TCHECK
When I type "tcheck", this means:
```
You are a SKEPTICAL senior mobile engineer working on universal apps.
Perform this analysis for every MAJOR code change you introduced (skip minor changes):

1. CLAUDE.md checklist Writing Functions Best Practices.
2. CLAUDE.md checklist Writing Tests Best Practices.
3. CLAUDE.md checklist Implementation Best Practices.
4. Mobile-specific considerations (performance, offline, cross-platform compatibility).
```

### TCHECKF
When I type "tcheckf", this means:
```
You are a SKEPTICAL senior mobile engineer.
Perform this analysis for every MAJOR function you added or edited (skip minor changes):

1. CLAUDE.md checklist Writing Functions Best Practices.
2. Mobile performance considerations for universal compatibility.
```

### TCHECKT
When I type "tcheckt", this means:
```
You are a SKEPTICAL senior mobile engineer.
Perform this analysis for every MAJOR test you added or edited (skip minor changes):

1. CLAUDE.md checklist Writing Tests Best Practices.
2. Universal app testing scenarios (auth flows, offline mode, cross-platform features).
```

### TUX
When I type "tux", this means:
```
Imagine you are a user testing the universal app feature you implemented. 
Output a comprehensive list of scenarios you would test, sorted by highest priority.
Consider different user types, device conditions, and network states.
```

### TGIT
When I type "tgit", this means:
```
Add all changes to staging, create a commit, and push to remote.

Follow this checklist for writing your commit message:
- SHOULD use Conventional Commits format: https://www.conventionalcommits.org/en/v1.0.0
- SHOULD NOT refer to Claude or Anthropic in the commit message.
- SHOULD structure commit message as follows:
<type>[optional scope]: <description>
[optional body]
[optional footer(s)]

Common types for Universal Template:
feat: new universal feature (auth, UI components, integrations)
fix: bug fix in core functionality, UI, or integrations
perf: performance improvement for mobile or universal compatibility
style: NativeWind styling updates, UI improvements
refactor: code restructuring without changing functionality
test: adding or updating tests for universal features
docs: documentation updates
build: EAS build configuration, dependencies
ci: CI/CD pipeline changes
```

## Common Issues & Solutions

### iOS Development Build
- Requires Developer Mode enabled in iPhone Settings
- Needs Local Network permission for Metro connection
- Must restart iPhone after enabling Developer Mode

### RevenueCat Development
- Development builds may show configuration warnings
- Fallback handling implemented for missing offerings
- Use development API keys for testing subscription flows

### Network Connectivity & Offline Mode
Use diagnostic commands when debugging connection issues:
```bash
npm run diagnose-network     # Check network configuration
npm run help-connection     # Show connection troubleshooting steps
```

### Universal Compatibility
- Test with different app domains and content types
- Verify internationalization works with various languages
- Test with different branding colors and themes

This architecture supports rapid development of any mobile app while maintaining commercial app quality standards and universal compatibility.