# Tadam Mobile App - UX Flows & Screen Designs

## Design Principles
1. **Tamil-First**: Primary language is Tamil, English as secondary
2. **Simplicity**: Maximum 3 taps to any feature
3. **Performance**: All interactions < 300ms response
4. **Accessibility**: Support TalkBack/VoiceOver
5. **Consistency**: Material Design 3 with Tamil cultural elements

## Color Palette
```
Primary: #C52233 (Tadam Red - from branding)
Background: #0F172A (Slate 900 - dark mode)
Surface: #1E293B (Slate 800)
Text Primary: #F1F5F9 (Slate 100)
Text Secondary: #94A3B8 (Slate 400)
Success: #10B981
Error: #EF4444
Warning: #F59E0B
```

## Typography
```
Headlines: Mukta Malar Bold (Tamil) / Inter Bold (English)
Body: Mukta Malar Regular (Tamil) / Inter Regular (English)
Captions: Mukta Malar Medium (Tamil) / Inter Medium (English)
```

---

## Screen Flows

### 1. Splash Screen
```
┌─────────────────────┐
│                     │
│                     │
│      [LOGO]         │
│      தடம்           │
│                     │
│    Loading...       │
│                     │
└─────────────────────┘

Duration: 1-2 seconds
Checks: Auth token, network status
Next: → Welcome OR → Home
```

### 2. Welcome Screen
```
┌─────────────────────┐
│   [Skip] →          │
├─────────────────────┤
│                     │
│     [Illustration]  │
│                     │
│  உங்கள் மாவட்ட      │
│  செய்திகள்          │
│                     │
│  Tamil-first news   │
│  for your district  │
│                     │
│  ┌────────────────┐ │
│  │  தொடங்குவோம்  │ │ (Let's Start)
│  └────────────────┘ │
│                     │
│  • • • ○            │ (Pagination dots)
└─────────────────────┘

Swipeable carousel (3-4 screens)
Skip button → Jump to Login
தொடங்குவோம் → Next welcome screen or Login
```

### 3. Login Screen
```
┌─────────────────────┐
│   [< Back]          │
├─────────────────────┤
│                     │
│  உள்நுழைவு          │
│  (Login)            │
│                     │
│  ┌────────────────┐ │
│  │ 🔵 Google ile   │ │
│  │    உள்நுழை     │ │
│  └────────────────┘ │
│                     │
│  ┌────────────────┐ │
│  │ 🍎 Apple ile    │ │
│  │    உள்நுழை     │ │
│  └────────────────┘ │
│                     │
│  ┌────────────────┐ │
│  │ 📞 Truecaller   │ │
│  │    உள்நுழை     │ │
│  └────────────────┘ │
│                     │
│  ┌────────────────┐ │
│  │ 📱 மொபைல் எண்   │ │
│  │    மூலம்        │ │
│  └────────────────┘ │
│                     │
└─────────────────────┘

Each button has icon + Tamil text
Clicking opens respective auth flow
```

### 4. Phone OTP Screen
```
┌─────────────────────┐
│   [< Back]          │
├─────────────────────┤
│  மொபைல் எண்          │
│  (Mobile Number)    │
│                     │
│  ┌────────────────┐ │
│  │ +91            │ │
│  └────────────────┘ │
│  ┌────────────────┐ │
│  │ 98XXXXXXXX     │ │
│  └────────────────┘ │
│                     │
│  ┌────────────────┐ │
│  │   OTP அனுப்பு   │ │
│  └────────────────┘ │
│                     │
│  Terms & Privacy    │
│                     │
└─────────────────────┘

→ OTP Verify Screen
```

### 5. OTP Verify Screen
```
┌─────────────────────┐
│   [< Back]          │
├─────────────────────┤
│  OTP சரிபார்ப்பு     │
│  (OTP Verification) │
│                     │
│  +91 98XXXXXXX க்கு │
│  அனுப்பப்பட்டது      │
│                     │
│  ┌───┬───┬───┬───┐  │
│  │ 1 │ 2 │ 3 │ 4 │  │ (OTP input boxes)
│  └───┴───┴───┴───┘  │
│                     │
│  மீண்டும் அனுப்பு    │
│  (Resend in 30s)    │
│                     │
│  ┌────────────────┐ │
│  │   சரிபார்       │ │
│  └────────────────┘ │
│                     │
└─────────────────────┘

Auto-submit on 4 digits
Resend timer
```

### 6. Location Permission Screen
```
┌─────────────────────┐
│   [Skip] →          │
├─────────────────────┤
│                     │
│  [Location Icon]    │
│                     │
│  உங்கள் இடத்தை      │
│  அறிய அனுமதிக்கவும் │
│                     │
│  உங்கள் மாவட்ட      │
│  செய்திகளை காட்ட    │
│  உதவும்             │
│                     │
│  ┌────────────────┐ │
│  │  அனுமதி வழங்கு │ │
│  └────────────────┘ │
│                     │
│  கைமுறையாக தேர்வு  │
│                     │
└─────────────────────┘

Permission granted → Auto-detect district
Denied/Skip → Manual district selection
```

### 7. District Selection Screen
```
┌─────────────────────┐
│   [< Back]  [Skip]→ │
├─────────────────────┤
│  மாவட்டங்களை தேர்வு │
│  (Select Districts) │
│                     │
│  🔍 [Search...]     │
│                     │
│  📍 உங்கள் இடம்:    │
│  ☑ Chennai          │
│                     │
│  தமிழ்நாடு:          │
│  ☑ Coimbatore       │
│  ☐ Madurai          │
│  ☐ Trichy           │
│  ☐ Salem            │
│  ☐ Tirunelveli      │
│  ...                │
│                     │
│  ┌────────────────┐ │
│  │  அடுத்து (3/33) │ │
│  └────────────────┘ │
└─────────────────────┘

Multi-select with checkboxes
Search functionality
Shows count (selected/total)
Minimum 1 required
```

### 8. Category Selection Screen
```
┌─────────────────────┐
│   [< Back]  [Skip]→ │
├─────────────────────┤
│  ஆர்வமுள்ள பிரிவுகள் │
│  (Interests)        │
│                     │
│  🔍 [Search...]     │
│                     │
│  ☑ அரசியல் 🏛️      │
│  ☑ சினிமா 🎬        │
│  ☐ விளையாட்டு ⚽    │
│  ☐ ஜோதிடம் ⭐       │
│  ☐ வணிகம் 💼        │
│  ☐ தொழில்நுட்பம் 💻 │
│  ☐ உடல்நலம் ❤️     │
│  ☐ கல்வி 📚         │
│  ☐ சமையல் 🍛        │
│  ...                │
│                     │
│  ┌────────────────┐ │
│  │  தொடங்கு (5/12)│ │
│  └────────────────┘ │
└─────────────────────┘

Multi-select with emoji icons
Search functionality
Minimum 2 required
தொடங்கு → Home Feed
```

### 9. Enable Notifications Screen
```
┌─────────────────────┐
│   [Skip] →          │
├─────────────────────┤
│                     │
│  [Bell Icon]        │
│                     │
│  அறிவிப்புகளை       │
│  இயக்கவும்          │
│                     │
│  முக்கிய செய்திகளை │
│  உடனுக்குடன் பெறுக │
│                     │
│  ┌────────────────┐ │
│  │   இயக்கு        │ │
│  └────────────────┘ │
│                     │
│  பின்னர்            │
│                     │
└─────────────────────┘

Permission prompt
Skip → Can enable later in settings
```

### 10. Home Screen (Feed Tab)
```
┌─────────────────────┐
│ தடம்  🔔 [Profile]  │ (Header)
├─────────────────────┤
│ 🔥 அனைத்தும்        │ (Category filters)
│ 🏛️ அரசியல் 🎬 சினிமா│
├─────────────────────┤
│                     │
│ ┌─────────────────┐ │
│ │ [Image]         │ │
│ │ செய்தி தலைப்பு   │ │
│ │ சுருக்கம்...     │ │
│ │ 📍Chennai 🏛️அரசியல│ │
│ │ 2 hrs ago       │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ [Image]         │ │
│ │ மற்றொரு செய்தி  │ │
│ │ ...             │ │
│ └─────────────────┘ │
│                     │
│     Loading...      │
│                     │
├─────────────────────┤
│ [🏠] [🔍] [➕] [👤] │ (Bottom tabs)
└─────────────────────┘

Infinite scroll
Pull-to-refresh
Category filter carousel
FAB for submit (➕)
```

### 11. Article Detail Screen
```
┌─────────────────────┐
│ [< Back]  [⋯ Share] │
├─────────────────────┤
│ [Hero Image]        │
│                     │
│ செய்தி தலைப்பு       │
│ முழுவதும்            │
│                     │
│ By அரசு | 2hrs ago  │
│ 📍Chennai 🏛️அரசியல  │
├─────────────────────┤
│                     │
│ முழு செய்தி உள்ளடக்கம்│
│ ...                 │
│                     │
│ [More images]       │
│                     │
│ உறவினர் செய்திகள்:   │
│ • Link 1            │
│ • Link 2            │
│                     │
│ ┌────────────────┐  │
│ │ 💬 கருத்து (23) │  │ (Comments - future)
│ └────────────────┘  │
└─────────────────────┘

Share options: WhatsApp, Twitter, Copy link
Bookmark icon (top right)
```

### 12. Submit Content Screen
```
┌─────────────────────┐
│ [< Back]            │
├─────────────────────┤
│  என்ன பகிர்கிறீர்கள்?│
│  (What to share?)   │
│                     │
│  ┌────────────────┐ │
│  │ 📰 செய்தி கட்டுரை│ │
│  │ News Article    │ │
│  └────────────────┘ │
│                     │
│  ┌────────────────┐ │
│  │ 📢 விளம்பரம்    │ │
│  │ Advertisement   │ │
│  └────────────────┘ │
│                     │
│  குறிப்பு: கட்டுரைகள்│
│  சரிபார்க்கப்படும்   │
│                     │
└─────────────────────┘

Two options to choose from
```

### 13. Submit Article Screen
```
┌─────────────────────┐
│ [< Back]  [Preview] │
├─────────────────────┤
│  கட்டுரை சமர்ப்பிப்பு │
│                     │
│  📷 [Add Photos]    │
│                     │
│  தலைப்பு *           │
│  ┌────────────────┐ │
│  │                │ │
│  └────────────────┘ │
│                     │
│  பிரிவு *            │
│  ┌────────────────┐ │
│  │ [Select] ▼     │ │
│  └────────────────┘ │
│                     │
│  மாவட்டம் *          │
│  ┌────────────────┐ │
│  │ [Select] ▼     │ │
│  └────────────────┘ │
│                     │
│  உள்ளடக்கம் *        │
│  ┌────────────────┐ │
│  │                │ │
│  │                │ │
│  │                │ │
│  └────────────────┘ │
│                     │
│  மூலம் (optional)   │
│  ┌────────────────┐ │
│  │                │ │
│  └────────────────┘ │
│                     │
│  ┌────────────────┐ │
│  │  சமர்ப்பிக்கவும் │ │
│  └────────────────┘ │
└─────────────────────┘

* = Required field
Rich text editor for content
Image multi-upload
Preview before submit
```

### 14. Profile Screen
```
┌─────────────────────┐
│ [< Back]  [Edit]    │
├─────────────────────┤
│                     │
│    [Avatar]         │
│    பெயர்            │
│    +91 98XXXXXXXX   │
│                     │
├─────────────────────┤
│                     │
│ என் சமர்ப்பிப்புகள் │
│ (My Submissions)    │
│                     │
│ விருப்பத்தேர்வுகள்   │
│ (Preferences)       │
│                     │
│ அறிவிப்புகள்        │
│ (Notifications)     │
│                     │
│ மொழி                │
│ (Language)          │
│                     │
│ உதவி & ஆதரவு        │
│ (Help & Support)    │
│                     │
│ வெளியேறு             │
│ (Logout)            │
│                     │
└─────────────────────┘

List of menu items
Tap to navigate
```

### 15. Preferences Screen
```
┌─────────────────────┐
│ [< Back]  [Save]    │
├─────────────────────┤
│  விருப்பத்தேர்வுகள்  │
│                     │
│ 📍 மாவட்டங்கள்      │
│ ┌────────────────┐  │
│ │ Chennai        │  │
│ │ Coimbatore     │  │
│ │ +2 more        │  │
│ └────────────────┘  │
│ [மாற்று]           │
│                     │
│ 📂 பிரிவுகள்        │
│ ┌────────────────┐  │
│ │ அரசியல்        │  │
│ │ சினிமா          │  │
│ │ +3 more        │  │
│ └────────────────┘  │
│ [மாற்று]           │
│                     │
│ 🔔 அறிவிப்புகள்    │
│ அனைத்தும்      [ON]│
│ அரசியல்       [ON]│
│ சினிமா         [OFF]│
│ ...                │
│                     │
│ ⏰ அமைதி நேரம்     │
│ 10:00 PM - 7:00 AM │
│                     │
└─────────────────────┘

Edit districts → District selection
Edit categories → Category selection
Per-category notification toggles
```

### 16. Submissions List Screen
```
┌─────────────────────┐
│ [< Back]            │
├─────────────────────┤
│  என் சமர்ப்பிப்புகள் │
│                     │
│ ┌─────────────────┐ │
│ │ கட்டுரை தலைப்பு  │ │
│ │ ⏳ Pending      │ │
│ │ 2 days ago      │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ மற்றொரு கட்டுரை │ │
│ │ ✅ Approved     │ │
│ │ 5 days ago      │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ பழைய கட்டுரை    │ │
│ │ ❌ Rejected     │ │
│ │ 1 week ago      │ │
│ │ Reason: ...     │ │
│ └─────────────────┘ │
│                     │
└─────────────────────┘

Status badges
Tap to view details
Show rejection reason
```

---

## Interaction Patterns

### Loading States
```
Shimmer effect for feed cards
Spinner for button actions
Skeleton screens for article detail
```

### Error States
```
┌─────────────────────┐
│                     │
│   [Error Icon]      │
│                     │
│  ஏதோ தவறு ஏற்பட்டது │
│  (Something went    │
│   wrong)            │
│                     │
│  Error details...   │
│                     │
│  ┌────────────────┐ │
│  │  மீண்டும் முயற்சி│ │
│  └────────────────┘ │
│                     │
└─────────────────────┘

Clear error message
Retry option
Back to previous screen
```

### Empty States
```
┌─────────────────────┐
│                     │
│   [Empty Icon]      │
│                     │
│  செய்திகள் இல்லை    │
│  (No news yet)      │
│                     │
│  Your preferences   │
│  may be too specific│
│                     │
│  ┌────────────────┐ │
│  │  விருப்பங்களை  │ │
│  │  மாற்று          │ │
│  └────────────────┘ │
│                     │
└─────────────────────┘

Helpful illustration
Call-to-action
Suggestion to fix
```

### Bottom Sheet (e.g., Share)
```
┌─────────────────────┐
│     ═ ═ ═           │ (Pull indicator)
├─────────────────────┤
│  பகிர்              │
│  (Share)            │
│                     │
│  📱 WhatsApp        │
│  🐦 Twitter         │
│  📋 Copy Link       │
│  📧 Email           │
│  • • More           │
│                     │
│  [Cancel]           │
└─────────────────────┘

Swipe down to dismiss
Tap outside to dismiss
```

---

## Gestures

- **Swipe Left/Right**: Navigate between categories (optional)
- **Pull Down**: Refresh feed
- **Long Press**: Show options menu (share, save, report)
- **Pinch to Zoom**: Images in article
- **Swipe Down**: Dismiss bottom sheets/modals

---

## Accessibility

### Screen Reader Support
- All interactive elements have labels
- Images have alt text
- Form inputs have hints
- Dynamic content announces changes

### Touch Targets
- Minimum 44x44 points
- Adequate spacing between tappable items

### Color Contrast
- All text meets WCAG AA standards (4.5:1 for normal text)

### Text Scaling
- Support Dynamic Type up to 200%
- Layout adapts to larger fonts

---

## Performance Targets

- **Time to Interactive**: < 2 seconds
- **Screen Transitions**: < 300ms
- **Feed Load**: < 1 second (cached) / < 2 seconds (network)
- **Image Load**: Progressive (thumbnail → full)
- **Smooth Scrolling**: 60fps minimum

---

## Platform-Specific Considerations

### iOS
- Use native haptic feedback
- Respect Safe Area insets
- Large titles for main screens
- Context menus for long press

### Android
- Material You dynamic colors (optional)
- Respect system navigation gestures
- FAB for primary action
- Snackbar for ephemeral messages

---

**These UX flows prioritize Tamil users while maintaining accessibility and performance. Every interaction is designed for production use.**
