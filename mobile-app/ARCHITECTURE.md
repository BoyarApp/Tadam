# Tadam Mobile App - Architecture Document

## Executive Summary
Production-ready React Native mobile application for Tadam news platform with Tamil-first experience.

## Technology Stack

### Core Framework
- **React Native**: 0.73+ (Latest stable)
- **TypeScript**: 5.3+ (Type safety)
- **React Navigation**: 6.x (Navigation)
- **Expo**: NO (We need native modules for Truecaller, better control)

### State Management
- **React Query (TanStack Query)**: Server state, caching, offline support
- **Zustand**: Global client state (auth, preferences)
- **AsyncStorage**: Local persistence

### Authentication
- **Google Sign-In**: @react-native-google-signin/google-signin
- **Apple Authentication**: @invertase/react-native-apple-authentication
- **Truecaller**: truecaller-sdk-react-native
- **Phone OTP**: Firebase Authentication (SMS)

### Notifications
- **Firebase Cloud Messaging**: Push notifications
- **React Native Notifee**: Local notifications, rich media

### Networking & API
- **Axios**: HTTP client with interceptors
- **React Query**: Cache, retry, background sync
- **API Base**: Strapi REST API

### Localization
- **i18n-js**: Tamil/English translations
- **react-native-localize**: Device locale detection

### Location
- **react-native-geolocation-service**: Location detection
- **Geocoding API**: Reverse geocoding for district/city

### UI Components
- **React Native Paper**: Material Design components
- **React Native Vector Icons**: Icons
- **React Native Fast Image**: Optimized image loading
- **React Native Reanimated**: Smooth animations

### Forms & Validation
- **React Hook Form**: Form management
- **Zod**: Schema validation

### Media & Files
- **React Native Image Picker**: Photo selection
- **React Native Image Crop Picker**: Image editing
- **React Native BLOB Utils**: File handling

### Analytics & Monitoring
- **Firebase Analytics**: Usage tracking
- **Sentry React Native**: Error tracking, performance monitoring

### Testing
- **Jest**: Unit testing
- **React Native Testing Library**: Component testing
- **Detox**: E2E testing (iOS/Android)

### Build & Deployment
- **Fastlane**: Automated builds and deployments
- **CodePush**: OTA updates
- **App Center**: Distribution for testing

## App Architecture

### Folder Structure
```
mobile-app/
├── src/
│   ├── api/                    # API clients and services
│   │   ├── client.ts          # Axios instance
│   │   ├── endpoints/         # API endpoints
│   │   ├── hooks/             # React Query hooks
│   │   └── types/             # API types
│   ├── auth/                   # Authentication
│   │   ├── providers/         # Auth providers (Google, Apple, etc.)
│   │   ├── hooks/             # useAuth, useSession
│   │   └── context.tsx        # Auth context
│   ├── components/             # Reusable components
│   │   ├── common/            # Buttons, Cards, etc.
│   │   ├── feed/              # Feed components
│   │   ├── article/           # Article components
│   │   └── forms/             # Form components
│   ├── screens/                # Screen components
│   │   ├── auth/              # Login, OTP screens
│   │   ├── onboarding/        # Welcome, preferences
│   │   ├── home/              # Feed screen
│   │   ├── article/           # Article detail
│   │   ├── profile/           # User profile
│   │   ├── submission/        # Submit article/ad
│   │   └── settings/          # App settings
│   ├── navigation/             # Navigation config
│   │   ├── RootNavigator.tsx  # Root stack
│   │   ├── AuthNavigator.tsx  # Auth flow
│   │   └── AppNavigator.tsx   # Main app tabs
│   ├── store/                  # State management
│   │   ├── auth.store.ts      # Auth state
│   │   ├── preferences.store.ts # User preferences
│   │   └── offline.store.ts   # Offline queue
│   ├── services/               # Business logic services
│   │   ├── notification.service.ts
│   │   ├── location.service.ts
│   │   ├── analytics.service.ts
│   │   └── storage.service.ts
│   ├── utils/                  # Utility functions
│   │   ├── validation.ts      # Validators
│   │   ├── formatters.ts      # Date, number formatting
│   │   └── helpers.ts         # Misc helpers
│   ├── hooks/                  # Custom hooks
│   ├── constants/              # App constants
│   ├── types/                  # TypeScript types
│   ├── i18n/                   # Translations
│   │   ├── ta.json            # Tamil
│   │   └── en.json            # English
│   └── theme/                  # Theming
│       ├── colors.ts
│       ├── typography.ts
│       └── spacing.ts
├── android/                    # Android native code
├── ios/                        # iOS native code
├── __tests__/                  # Tests
├── fastlane/                   # Deployment automation
├── .env.example                # Environment variables
├── app.json                    # App configuration
├── package.json
├── tsconfig.json
└── README.md
```

## User Flows

### 1. First Launch Flow
```
App Launch
  ↓
Splash Screen (Check auth)
  ↓
[Not Authenticated] → Welcome Screen
  ↓
Authentication Choice:
  - Google
  - Apple
  - Truecaller
  - Mobile OTP
  ↓
[Success] → Request Location Permission
  ↓
Auto-detect District (or Manual Selection)
  ↓
Onboarding: Select Interests
  - Categories (Politics, Cinema, Sports, etc.)
  - Districts (Multi-select)
  ↓
Enable Notifications (Optional)
  ↓
Home Feed
```

### 2. Authentication Flow
```
Login Screen
  ↓
[Google] → Google OAuth → Strapi JWT
[Apple] → Apple Sign In → Strapi JWT
[Truecaller] → Truecaller SDK → Mobile Number → Strapi JWT
[Phone] → Enter Number → OTP Screen → Verify → Strapi JWT
  ↓
Store JWT + User Data
  ↓
Sync Preferences to Backend
  ↓
Home Screen
```

### 3. Home Feed Flow
```
Home Screen (Bottom Tabs)
  ↓
Feed Tab (Default)
  - Personalized based on preferences
  - Infinite scroll
  - Pull to refresh
  - Category filters (horizontal scroll)
  ↓
Tap Article → Article Detail
  - Full content
  - Related articles
  - Share options
  - Save for later
```

### 4. Submit Content Flow
```
Home → Submit Button (FAB)
  ↓
Choose Type:
  - News Article
  - Advertisement
  ↓
[Article] → Form:
  - Title (Tamil/English)
  - Category
  - District
  - Content (Rich text)
  - Images (Multi-upload)
  - Source (optional)
  ↓
Preview → Submit for Review
  ↓
Success Message → Pending Review Status
```

### 5. Preferences Management
```
Profile → Settings → Preferences
  ↓
Categories:
  - Politics
  - Cinema
  - Sports
  - Astrology
  - Business
  - Technology
  - Health
  - Education
  (Toggle selection)
  ↓
Districts:
  - Multi-select districts
  - My location (auto-detect)
  ↓
Notification Settings:
  - Push enabled/disabled
  - Per-category toggles
  - Quiet hours
  ↓
Save → Sync to Backend → Update Feed
```

## API Integration

### Strapi Endpoints Used

#### Authentication
- `POST /api/auth/local` - Email/Password (fallback)
- `GET /api/auth/google/callback` - Google OAuth
- `GET /api/auth/apple/callback` - Apple OAuth
- `POST /api/auth/send-otp` - Send OTP (custom)
- `POST /api/auth/verify-otp` - Verify OTP (custom)

#### User Profile
- `GET /api/users/me` - Get current user
- `PUT /api/users/:id` - Update profile
- `GET /api/account/profile` - User profile with preferences
- `PUT /api/account/profile` - Update preferences

#### Feed
- `GET /api/feed/latest` - Personalized feed
- Query params: `categories`, `districts`, `limit`, `offset`

#### Articles
- `GET /api/articles` - List articles
- `GET /api/articles/:slug` - Article detail
- `POST /api/articles` - Submit article (contributor role)
- `GET /api/articles/:id/related` - Related articles

#### Categories & Districts
- `GET /api/categories` - List all categories
- `GET /api/districts` - List all districts

#### Advertisements
- `GET /api/ad-campaigns` - List ads
- `POST /api/ad-campaigns` - Submit ad
- `GET /api/ad-campaigns/:id` - Ad details

#### Submissions
- `GET /api/submissions` - User's submissions
- `POST /api/submissions` - Create submission

#### Notifications
- `POST /api/account/fcm-token` - Register FCM token
- `PUT /api/account/notification-preferences` - Update notification settings

## State Management Strategy

### React Query Keys
```typescript
// Query keys structure
export const queryKeys = {
  auth: ['auth'] as const,
  user: ['user'] as const,
  feed: (filters: FeedFilters) => ['feed', filters] as const,
  article: (slug: string) => ['article', slug] as const,
  categories: ['categories'] as const,
  districts: ['districts'] as const,
  submissions: ['submissions'] as const,
  userPreferences: ['user', 'preferences'] as const,
};
```

### Zustand Store (Client State)
```typescript
interface AppState {
  // Auth
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;

  // Preferences
  selectedCategories: string[];
  selectedDistricts: string[];
  language: 'ta' | 'en';

  // UI State
  isOnboarded: boolean;
  notificationsEnabled: boolean;

  // Actions
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updatePreferences: (prefs: Partial<Preferences>) => void;
}
```

### Offline Support
- React Query automatic retries
- Offline queue for submissions
- Cached feed data (7 days)
- Optimistic updates for likes/saves

## Security Considerations

### API Security
- JWT tokens in secure storage (react-native-keychain)
- Token refresh logic
- Auto-logout on 401
- HTTPS only

### Data Protection
- No sensitive data in AsyncStorage
- Biometric authentication (optional)
- Certificate pinning (production)

### Privacy
- Location permission with explanation
- Notification permission opt-in
- Clear data collection notice
- GDPR compliance (user data export/delete)

## Performance Optimization

### Image Optimization
- Use React Native Fast Image
- Lazy load images
- Thumbnail → Full image progression
- CDN URLs from Strapi

### List Performance
- FlatList with `windowSize` optimization
- Item height estimation
- Remove clipped subviews
- Pagination (20 items per page)

### Bundle Size
- Code splitting per screen
- Lazy load heavy modules
- Tree shaking
- Hermes engine (Android)

### Network
- Request deduplication (React Query)
- Aggressive caching (5 min feed cache)
- Background sync for preferences
- Compression (gzip)

## Testing Strategy

### Unit Tests (Jest)
- API client functions
- Utility functions
- Validation schemas
- Store actions

### Integration Tests (React Native Testing Library)
- Authentication flows
- Form submissions
- Preference updates
- API hooks

### E2E Tests (Detox)
- Critical user journeys:
  1. Login → Onboarding → Feed
  2. Article submission
  3. Preference changes
  4. Notification reception

### Manual QA Checklist
- [ ] All auth methods work
- [ ] Location detection accurate
- [ ] Tamil text renders correctly
- [ ] Notifications received
- [ ] Offline mode works
- [ ] Image uploads succeed
- [ ] Deep links work
- [ ] App doesn't crash

## Build & Deployment

### Environment Configs
- **Development**: Local Strapi
- **Staging**: Staging Strapi
- **Production**: Production Strapi

### Build Variants
- **Debug**: Development mode
- **Beta**: Internal testing (TestFlight/Internal Testing)
- **Release**: Production build

### CI/CD Pipeline
```yaml
On PR:
  - Lint (ESLint, TypeScript)
  - Unit tests
  - Build check (iOS/Android)

On Main Merge:
  - Run E2E tests
  - Build release candidates
  - Upload to TestFlight/Play Console Beta
  - Send to testers

On Tag (v*):
  - Build production
  - Deploy to App Store / Play Store
```

### Code Signing
- iOS: App Store Connect
- Android: Keystore (secured in CI)

## Monitoring & Analytics

### Firebase Analytics Events
- `screen_view` - Track screen visits
- `article_view` - Article opens
- `article_submit` - Article submissions
- `preference_update` - Preference changes
- `notification_tap` - Notification interactions

### Sentry Integration
- Error tracking
- Performance monitoring
- Crash reporting
- User feedback

### Custom Metrics
- Time to interactive
- API response times
- Offline usage percentage
- Submission success rate

## Accessibility

### Requirements
- Screen reader support (TalkBack/VoiceOver)
- Text scaling (Dynamic Type)
- High contrast mode
- Minimum touch target: 44x44 points
- Tamil TTS support

## Compliance

### App Store Requirements
- Privacy policy link
- Data collection disclosure
- Age rating (4+ / Everyone)
- In-app purchases (if applicable)

### Permissions Required
- Location (Optional, for district detection)
- Camera (Optional, for photo uploads)
- Photo Library (Optional, for uploads)
- Notifications (Optional, for alerts)

## Success Metrics

### Performance
- App load time: < 2 seconds
- Screen transition: < 300ms
- Article load: < 1 second
- Crash-free rate: > 99.5%

### Engagement
- Daily active users (DAU)
- Session length: > 5 minutes
- Articles per session: > 3
- Submission rate: 1% of users

### Technical
- API error rate: < 1%
- Push notification delivery: > 95%
- App size: < 50MB

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Strapi API changes | High | API versioning, contract testing |
| Auth provider downtime | High | Multiple auth methods, clear error messages |
| High image upload failures | Medium | Compression, retry logic, queue |
| Tamil font issues | Medium | Bundle Tamil fonts, test on devices |
| Notification permission denied | Medium | In-app notification center as fallback |
| App rejection (stores) | High | Follow guidelines strictly, test beforehand |

## Development Timeline (Realistic)

**Phase 1: Foundation (Week 1-2)**
- Project setup
- Navigation structure
- API client
- Authentication (all methods)

**Phase 2: Core Features (Week 3-4)**
- Feed implementation
- Article detail
- User preferences
- Location detection

**Phase 3: Content Submission (Week 5)**
- Article submission flow
- Ad submission flow
- Image uploads

**Phase 4: Polish & Testing (Week 6)**
- Tamil translations
- UI polish
- Unit tests
- E2E tests

**Phase 5: Beta (Week 7)**
- Internal testing
- Bug fixes
- Performance optimization

**Phase 6: Production (Week 8)**
- App Store submission
- Final QA
- Production deployment

**Total: 8 weeks for production-ready app**

## Production Readiness Checklist

### Code Quality
- [ ] TypeScript strict mode enabled
- [ ] ESLint with no warnings
- [ ] All APIs have error handling
- [ ] Loading states for all async operations
- [ ] Offline support implemented

### Security
- [ ] Tokens in secure storage
- [ ] Certificate pinning enabled
- [ ] No hardcoded secrets
- [ ] API requests over HTTPS only

### UX
- [ ] Tamil translations complete
- [ ] All screens have proper navigation
- [ ] Error messages are user-friendly
- [ ] Loading indicators on all actions
- [ ] Empty states designed

### Testing
- [ ] Unit test coverage > 70%
- [ ] Critical flows have E2E tests
- [ ] Tested on iOS 14+ and Android 10+
- [ ] Tested on low-end devices

### Performance
- [ ] App size < 50MB
- [ ] Startup time < 2s
- [ ] No memory leaks
- [ ] Smooth 60fps scrolling

### Compliance
- [ ] Privacy policy added
- [ ] Terms of service added
- [ ] Permissions justified
- [ ] Age rating appropriate

### Deployment
- [ ] App icons (all sizes)
- [ ] Splash screens
- [ ] App Store listings (screenshots, descriptions)
- [ ] Build configurations tested
- [ ] Crash reporting configured

---

**This architecture is designed for a production-ready, scalable mobile app. No shortcuts, no compromises.**
