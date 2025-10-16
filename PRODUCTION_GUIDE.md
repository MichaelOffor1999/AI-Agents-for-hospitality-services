# Production Deployment Guide

## Prerequisites

### Development Environment
- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- EAS CLI (`npm install -g eas-cli`)

### Accounts & Services
- Expo account (free tier available)
- Apple Developer Account (iOS deployment)
- Google Play Console Account (Android deployment)
- Backend API server

## Initial Setup

### 1. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your production values
nano .env
```

### 2. App Configuration
Update the following files with your app details:
- `app.json`: Update name, slug, bundle identifiers
- `eas.json`: Configure build profiles
- `src/config/index.js`: Set production API URLs

### 3. EAS Setup
```bash
# Login to Expo
eas login

# Initialize EAS in your project
eas init

# Configure project
eas configure
```

## Building for Production

### Development Build
```bash
# For testing on physical devices
eas build --profile development --platform android
eas build --profile development --platform ios
```

### Preview Build
```bash
# Internal testing/beta releases
eas build --profile preview --platform all
```

### Production Build
```bash
# App Store/Play Store releases
eas build --profile production --platform all
```

## Store Submission

### iOS App Store
```bash
# Submit to App Store Connect
eas submit --platform ios

# Or manual upload via Xcode
```

### Google Play Store
```bash
# Submit to Google Play Console  
eas submit --platform android

# Or manual upload via Play Console
```

## Backend Integration

### API Requirements
Your backend should provide these endpoints:

#### Authentication
- `POST /auth/login` - User authentication
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout

#### Tenant Management
- `GET /tenants/{id}` - Get tenant info
- `PUT /tenants/{id}` - Update tenant
- `GET /tenants/{id}/config/effective` - Get configuration

#### Orders
- `GET /orders` - List orders
- `POST /orders` - Create order
- `GET /orders/{id}` - Get order details
- `PUT /orders/{id}` - Update order
- `DELETE /orders/{id}` - Cancel order

#### Menu Management
- `GET /menu-items` - List menu items
- `POST /menu-items` - Create menu item
- `PUT /menu-items/{id}` - Update menu item
- `DELETE /menu-items/{id}` - Delete menu item

#### Analytics
- `GET /analytics/dashboard` - Dashboard stats
- `GET /analytics/revenue` - Revenue data
- `POST /analytics/export` - Export data

#### AI Voice
- `GET /ai/greeting/preview` - Preview greeting
- `PUT /ai/settings` - Update AI settings

### Database Schema
Recommended database tables:
- `tenants` - Business information
- `users` - User accounts
- `menu_items` - Menu management
- `orders` - Order tracking  
- `order_items` - Order line items
- `transcripts` - Call transcripts
- `analytics_events` - Usage analytics

## Security & Performance

### Security Considerations
- Use HTTPS only in production
- Implement JWT token authentication
- Rate limiting on API endpoints
- Input validation and sanitization

### Performance Optimization
- Use Hermes engine (Android)
- Enable tree shaking
- Optimize images and assets
- Cache API responses

## Checklist

Before production release:
- [ ] All environment variables configured
- [ ] API endpoints tested
- [ ] Error handling implemented
- [ ] Offline mode tested
- [ ] Performance optimized
- [ ] Security audit completed
- [ ] Store assets prepared
- [ ] Legal pages added (Privacy Policy, Terms)
- [ ] Analytics configured
- [ ] Monitoring setup
