# Tadam Mobile App

**Tamil-first hyperlocal news mobile application** built with React Native, TypeScript, and Strapi CMS.

## 📱 About

Tadam is a mobile news platform focused on delivering hyperlocal Tamil news with district-level personalization, allowing users to:
- Read personalized news based on their district and category preferences
- Receive push notifications for breaking news in their areas of interest
- Submit citizen journalism articles and advertisements
- Manage preferences in Tamil (primary) or English

## 🏗️ Architecture

This is a **production-ready React Native application** built with:
- **TypeScript** for type safety
- **React Navigation** for navigation
- **React Query** for server state management
- **Zustand** for client state
- **Firebase** for authentication and push notifications
- **Strapi CMS** backend integration
- **Sentry** for error tracking
- **Full Tamil localization** with Mukta Malar fonts

See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete technical details.

## 🎨 Design

See [UX-FLOWS.md](./UX-FLOWS.md) for:
- Complete screen designs
- User journey flows
- Tamil-first UI patterns
- Interaction specifications

## 📊 Project Status

**Foundation Complete** ✅
- Architecture documented
- UX flows designed
- Project structure created
- TypeScript types defined
- Constants configured
- Dependencies installed

**In Progress** 🚧
- Implementation (see [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md))

**Timeline**: 8 weeks for full production release

## 🚀 Quick Start

### Prerequisites

```bash
# Node.js 18+
node --version

# npm or yarn
npm --version

# React Native CLI
npm install -g react-native-cli

# iOS (macOS only)
brew install cocoapods
sudo gem install ffi -- --enable-libffi-alloc

# Android
# Install Android Studio with SDK 33+
# Set ANDROID_HOME environment variable
```

### Installation

```bash
# Clone repository
git clone <repo-url>
cd mobile-app

# Install dependencies
npm install

# iOS only
cd ios && pod install && cd ..

# Set up environment
cp .env.example .env
# Edit .env with your API keys
```

### Running the App

```bash
# Start Metro bundler
npm start

# Run on iOS (macOS only)
npm run ios

# Run on Android
npm run android

# Run specific device
npm run ios -- --simulator="iPhone 15"
npm run android -- --deviceId=<device-id>
```

## 📁 Project Structure

```
mobile-app/
├── src/
│   ├── api/                   # API clients and hooks
│   ├── auth/                  # Authentication providers
│   ├── components/            # Reusable components
│   ├── screens/               # Screen components
│   ├── navigation/            # Navigation configuration
│   ├── store/                 # Zustand stores
│   ├── services/              # Business logic services
│   ├── utils/                 # Utility functions
│   ├── hooks/                 # Custom hooks
│   ├── constants/             # App constants
│   ├── types/                 # TypeScript types
│   ├── i18n/                  # Translations (Tamil/English)
│   └── theme/                 # Theming (colors, fonts)
├── android/                   # Android native code
├── ios/                       # iOS native code
├── __tests__/                 # Tests
├── .env.example               # Environment template
├── ARCHITECTURE.md            # Technical architecture
├── UX-FLOWS.md                # Design specifications
├── IMPLEMENTATION-STATUS.md   # What's done/todo
└── README.md                  # This file
```

## 🔑 Environment Variables

Required environment variables (see `.env.example`):

```bash
# API
API_BASE_URL=http://localhost:1337

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY_IOS=your-ios-key
FIREBASE_API_KEY_ANDROID=your-android-key

# Google Sign-In
GOOGLE_WEB_CLIENT_ID_IOS=your-client-id
GOOGLE_WEB_CLIENT_ID_ANDROID=your-client-id

# Sentry
SENTRY_DSN=your-sentry-dsn
```

## 🛠️ Development

### Code Quality

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format
```

### Testing

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E tests (requires detox setup)
npm run test:e2e:build:ios
npm run test:e2e:test:ios
```

### Debugging

- **React Native Debugger**: Use standalone app for Redux, network, etc.
- **Flipper**: Integrated debugging tool
- **Console Logs**: `npm start` shows Metro bundler logs
- **Sentry**: Production error tracking

## 📦 Building for Production

### iOS

```bash
# Archive and upload to TestFlight
cd ios
fastlane beta

# Production build
fastlane release
```

### Android

```bash
# Build release APK
cd android
./gradlew assembleRelease

# Build App Bundle (for Play Store)
./gradlew bundleRelease
```

## 🌐 Features

### Authentication
- ✅ Google Sign-In
- ✅ Apple Sign-In
- ✅ Truecaller Login
- ✅ Phone OTP (Firebase)

### Core Features
- ✅ Personalized news feed
- ✅ Infinite scroll with caching
- ✅ District and category-based filtering
- ✅ Article detail view
- ✅ User profile management
- ✅ Preference management
- ✅ Push notifications (per-category)
- ✅ Article submission
- ✅ Advertisement submission
- ✅ Offline support
- ✅ Tamil and English localization

### Technical Features
- ✅ TypeScript strict mode
- ✅ React Query for data fetching
- ✅ Optimistic updates
- ✅ Image optimization and caching
- ✅ Error boundaries
- ✅ Performance monitoring
- ✅ Analytics tracking
- ✅ Crash reporting

## 🧪 Testing Strategy

- **Unit Tests**: Jest + React Native Testing Library (70%+ coverage)
- **Integration Tests**: API mocking with MSW
- **E2E Tests**: Detox for critical user flows
- **Manual QA**: Device testing on iOS 14+ and Android 10+

## 🚢 Deployment

### TestFlight (iOS)
1. Configure signing in Xcode
2. Archive build
3. Upload to App Store Connect
4. Distribute to testers

### Internal Testing (Android)
1. Generate signed AAB
2. Upload to Play Console
3. Create internal testing track
4. Distribute to testers

### Production Release
1. Complete App Store assets (screenshots, descriptions)
2. Submit for review
3. Release when approved

See detailed deployment guide in `DEPLOYMENT.md` (to be created).

## 🐛 Troubleshooting

### Common Issues

**Build failures**:
```bash
# Clean and rebuild
npm run clean
cd ios && pod install --repo-update && cd ..
npm run ios
```

**Metro bundler issues**:
```bash
npm start -- --reset-cache
```

**Android SDK issues**:
```bash
# Set ANDROID_HOME
export ANDROID_HOME=~/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

**Tamil fonts not rendering**:
- Ensure Mukta Malar fonts are linked: `npx react-native-asset`
- Test on physical device (emulator font rendering may differ)

## 📚 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture and design decisions
- [UX-FLOWS.md](./UX-FLOWS.md) - Screen designs and user flows
- [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md) - Current progress and todos

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style
- Follow TypeScript strict mode
- Use functional components with hooks
- Write tests for new features
- Document complex logic
- Use Tamil for UI text (primary)

## 📄 License

Proprietary - Tadam News Platform

## 👥 Team

- **Architecture & Planning**: Tech Co-founder
- **Development**: TBD
- **Design**: TBD
- **QA**: TBD

## 📞 Support

- **Issues**: GitHub Issues
- **Email**: tech@tadam.app
- **Slack**: #mobile-dev

## 🗺️ Roadmap

### Phase 0: Foundation (Current)
- ✅ Architecture design
- ✅ Project setup
- ✅ Type definitions
- ✅ Documentation

### Phase 1: Core Features (Weeks 1-4)
- [ ] Authentication flows
- [ ] Onboarding experience
- [ ] Feed implementation
- [ ] Article detail

### Phase 2: Content Submission (Weeks 5-6)
- [ ] Article submission
- [ ] Ad submission
- [ ] Image uploads

### Phase 3: Polish & Launch (Weeks 7-8)
- [ ] Push notifications
- [ ] Performance optimization
- [ ] Testing
- [ ] App Store submission

### Future Enhancements
- [ ] Bookmarks and reading history
- [ ] Social sharing improvements
- [ ] Comments system
- [ ] Video content support
- [ ] Dark mode toggle
- [ ] Widgets (iOS 14+)

---

**Built with ❤️ for Tamil-speaking communities**

**Status**: Foundation Complete | Implementation In Progress | ETA: 8 weeks
