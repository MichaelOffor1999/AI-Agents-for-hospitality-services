# Restaurant Manager App Deployment Guide

## 🚀 Complete Deployment Guide for Restaurant Manager

### Prerequisites
- [ ] Apple Developer Account ($99/year) for iOS
- [ ] Google Play Developer Account ($25 one-time) for Android  
- [ ] Expo Account (free)
- [ ] App icons and screenshots ready
- [ ] App store descriptions written

### Step 1: Prepare Your App for Production

#### Update app.json/app.config.js
```json
{
  "expo": {
    "name": "Restaurant Manager Pro",
    "slug": "restaurant-manager-pro",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#667EEA"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.restaurantmanager"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#667EEA"
      },
      "package": "com.yourcompany.restaurantmanager"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

### Step 2: Install and Setup EAS CLI

```bash
# Install EAS CLI globally
npm install -g @expo/eas-cli

# Login to your Expo account
eas login

# Initialize EAS in your project
cd /path/to/restaurant-manager
eas build:configure
```

### Step 3: Configure Build Profiles

Create `eas.json`:
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Step 4: Build Your App

#### For Production (App Stores):
```bash
# Build for both platforms
eas build --platform all --profile production

# Or build individually
eas build --platform ios --profile production
eas build --platform android --profile production
```

#### For Testing (Internal Distribution):
```bash
# Build preview version
eas build --platform all --profile preview
```

### Step 5: Submit to App Stores

#### iOS App Store:
```bash
# Submit to App Store Connect
eas submit --platform ios

# You'll need:
# - Apple ID credentials
# - App Store Connect API key
```

#### Google Play Store:
```bash
# Submit to Google Play Console
eas submit --platform android

# You'll need:
# - Google Play service account JSON key
```

### Step 6: Alternative Deployment Methods

#### A. Web Deployment (PWA)
```bash
# Build web version
expo export:web

# Deploy to hosting services:
# Netlify: drag and drop 'web-build' folder
# Vercel: connect GitHub repo
# Firebase: firebase deploy
```

#### B. Direct APK Distribution (Android)
```bash
# Build APK for direct installation
eas build --platform android --profile preview

# Share the download link with users
# Users need to enable "Install from unknown sources"
```

#### C. TestFlight (iOS) / Internal Testing (Android)
```bash
# Build for internal testing
eas build --platform all --profile preview

# iOS: Automatically uploaded to TestFlight
# Android: Upload to Google Play Console Internal Testing
```

### Step 7: App Store Requirements

#### iOS App Store:
- [ ] App icons (1024x1024px and various sizes)
- [ ] Screenshots for different device sizes
- [ ] Privacy policy URL
- [ ] App description and keywords
- [ ] Age rating questionnaire
- [ ] Pricing and availability settings

#### Google Play Store:
- [ ] App icons (512x512px and various sizes)
- [ ] Screenshots for phones and tablets
- [ ] Feature graphic (1024x500px)
- [ ] Privacy policy URL
- [ ] App description and short description
- [ ] Content rating questionnaire
- [ ] Pricing and distribution settings

### Step 8: Marketing Assets Needed

#### App Icons:
- iOS: 1024x1024px (App Store), 180x180px (iPhone), 152x152px (iPad)
- Android: 512x512px (Play Store), 192x192px (launcher)

#### Screenshots:
- iOS: iPhone 6.7", iPhone 6.5", iPhone 5.5", iPad Pro 12.9"
- Android: Phone and 7" tablet screenshots

#### Store Graphics:
- Feature graphic: 1024x500px (Google Play)
- Promotional images for marketing

### Step 9: App Store Optimization (ASO)

#### App Title:
"Restaurant Manager Pro - AI Voice Assistant & Menu Management"

#### Keywords/Tags:
- restaurant management
- pos system
- menu management
- ai assistant
- call transcription
- business analytics

#### Description Template:
```
🍽️ Transform your restaurant operations with Restaurant Manager Pro!

KEY FEATURES:
✨ AI-Powered Voice Assistant
📞 Automatic Call Transcription  
📊 Real-time Business Analytics
🍕 Smart Menu Management
⚙️ Comprehensive Settings Control

PERFECT FOR:
• Restaurant owners
• Food service managers
• Quick service restaurants
• Fine dining establishments

Download now and streamline your restaurant management!
```

### Step 10: Launch Checklist

- [ ] App thoroughly tested on multiple devices
- [ ] All APIs and backend services working
- [ ] Privacy policy and terms of service ready
- [ ] App store accounts set up and paid
- [ ] Marketing materials prepared
- [ ] Beta testing completed
- [ ] App built and submitted to stores
- [ ] Store listings optimized
- [ ] Launch marketing plan ready

### Timeline Expectations

#### Initial Setup: 1-3 days
- Expo account setup
- Developer accounts registration
- EAS CLI configuration

#### First Build: 1-2 days
- App configuration
- Build process (15-30 minutes per platform)
- Testing and iterations

#### App Store Review: 1-7 days
- iOS: 1-3 days typically
- Android: 1-3 days typically
- Possible rejections requiring fixes

#### Total Launch Time: 1-2 weeks
From start to app being live in stores

### Costs Breakdown

#### Required Costs:
- Apple Developer Program: $99/year
- Google Play Developer: $25 one-time
- **Total: $124 first year, $99/year after**

#### Optional Costs:
- EAS Build credits: Free tier available, paid plans start at $29/month
- Professional app store assets: $100-500 (optional)
- Marketing budget: Variable

### Support Resources

- **Expo Documentation**: https://docs.expo.dev/
- **EAS Build Guide**: https://docs.expo.dev/build/introduction/
- **App Store Guidelines**: https://developer.apple.com/app-store/guidelines/
- **Google Play Policies**: https://play.google.com/about/developer-content-policy/

### Next Steps

1. **Start with EAS setup**: Run `eas build:configure` in your project
2. **Create developer accounts**: Apple and Google registration
3. **Prepare assets**: Icons, screenshots, descriptions
4. **Build and test**: Create preview builds for testing
5. **Submit for review**: Upload to app stores
6. **Launch and monitor**: Track downloads and user feedback

Need help with any specific step? The Expo community and documentation are excellent resources!
