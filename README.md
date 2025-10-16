# AI Restaurant Manager - Production Ready

A comprehensive AI phone assistant + owner dashboard system built with React Native and Expo. This production-ready template handles customer calls, takes orders/bookings, and provides business owners with powerful analytics and management tools.

## 🎯 What This App Does

An AI phone assistant + owner dashboard that:
- **Answers calls automatically** with branded greetings using business name/hours
- **Understands customer requests** via Speech-to-Text + LLM (orders, bookings, FAQ)
- **Clarifies & confirms** orders by reading back items/times with quantities/prices
- **Creates records** by making Orders or Bookings in the database on confirmation
- **Generates receipts** as kitchen PDF tickets for confirmed orders
- **Sends SMS notifications** with pickup/delivery summaries (optional)

## 🏗️ Production Features

### Core User Flows (Caller Side)
1. **Answer Call** → Plays branded greeting with business name/hours
2. **Understand Request** → STT + LLM detects intent (order/booking/FAQ/fallback)
3. **Clarify & Confirm** → Reads back items/times, asks for confirmation
4. **Create Record** → Makes Order/Booking in database
5. **Receipt Generation** → Creates kitchen PDF ticket
6. **SMS Notifications** → Sends pickup/delivery summary

### Owner Dashboard Features
- **Real-time Analytics**: Revenue, orders, missed calls with growth metrics
- **Order Management**: Status updates, filtering, receipt downloads
- **AI Voice Configuration**: Greeting, tone, response templates
- **Menu/Data Management**: Items, pricing, availability with categories
- **Business Profile**: Hours, contact info, AI settings, industry templates
- **Call Transcripts**: Searchable conversation history with confidence scores

## 📱 Mobile App Screens

### Dashboard
- **KPI Cards**: Today's Revenue (€), Orders Today, Avg Order Value, Missed Calls
- **Growth Metrics**: Delta vs yesterday with positive/negative indicators
- **Revenue Chart**: Last 14 days with interactive line chart
- **Daily Totals Table**: Date | Orders | Gross | Refunds | Net with CSV export

### Orders Management
- **Order List**: Search & filter by status, type, customer, phone
- **Order Details**: Items, notes, totals (Gross/Refunds/Net)
- **Status Updates**: Tap to change status (Pending→Confirmed→Preparing→Ready→Completed)
- **Receipt Downloads**: Kitchen PDF generation
- **Transcript Preview**: Link to full conversation

### AI Voice Assistant
- **Custom Greetings**: Branded messages with business hours
- **Response Templates**: Allergen info, unavailable items, closed messages
- **Voice Configuration**: Tone (friendly/professional/casual/formal)
- **Call Handling**: Recording, transcripts, confidence thresholds
- **Fallback Settings**: Transfer to human for complex calls
- **Preview Mode**: Test AI responses before going live

### Menu/Data Management
- **Category Organization**: Main, Appetizers, Desserts, Drinks, Specials
- **Item Management**: Add/Edit name, price, description, availability
- **Real-time Toggles**: Enable/disable items instantly
- **Bulk Operations**: Category-based management
- **Template Ready**: Easily adaptable for retail/real-estate inventories

### Business Profile
- **Basic Info**: Name, phone, address, timezone, industry, languages
- **Opening Hours**: Weekly schedule with holiday overrides
- **Order Options**: Takeaway/delivery/dine-in, delivery radius, prep times
- **Data Retention**: Configurable transcript retention (30-365 days)
- **Industry Templates**: Restaurant-first, expandable to retail/real-estate

### Call Transcripts
- **Search Functionality**: By call ID, phone number, or date range
- **Conversation View**: Chat-style customer ↔ AI conversation display
- **Confidence Scores**: AI response quality metrics
- **Export Options**: Individual or bulk transcript downloads

## Installation & Setup

1. **Prerequisites**
   - Node.js (v16 or later)
   - Expo CLI: `npm install -g @expo/cli`
   - Expo Go app on your phone (available in App Store/Play Store)

2. **Install Dependencies**
   ```bash
   cd restaurant-manager
   npm install
   ```

3. **Start the Development Server**
   ```bash
   npm start
   # or
   npx expo start
   ```

4. **Run on Your Device**
   - Install the **Expo Go** app on your phone
   - Scan the QR code displayed in your terminal/browser
   - The app will load on your device

## Alternative Running Methods

- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal  
- **Web Browser**: Press `w` in the terminal

## 🏗️ Production Architecture

### Project Structure
```
src/
├── screens/
│   ├── DashboardScreen.js       # Analytics, KPIs, revenue charts
│   ├── OrdersScreen.js          # Order list with real-time updates
│   ├── OrderDetailsScreen.js    # Full order view with actions
│   ├── TranscriptsScreen.js     # AI conversation history
│   ├── MenuManagementScreen.js  # Menu CRUD with categories
│   ├── SettingsScreen.js        # Business configuration hub
│   ├── BusinessProfileScreen.js # Complete business setup
│   └── AIVoiceSettingsScreen.js # AI assistant configuration
├── services/
│   └── ApiService.js           # Production API client
├── models/
│   └── index.js                # Data models (Tenant, Order, etc.)
├── context/
│   └── AppContext.js           # Global state management
├── utils/
│   └── helpers.js              # Formatting, validation utilities
└── components/                 # Reusable UI components
```

### Backend API Integration (Ready for Production)
```javascript
// Tenant Management
GET/PUT /tenants/{id}
GET /tenants/{id}/config/effective
POST /tenants/{id}/preview/greeting

// Menu Management  
GET/POST/PUT/DELETE /menu
PATCH /menu/{id}/availability

// Order Management
GET /orders?tenant_id&filters
GET /orders/{id}
PATCH /orders/{id}/status
GET /orders/{id}/receipt (PDF)

// Analytics & Reporting
GET /analytics/dashboard?tenant_id&dateRange
GET /analytics/revenue-by-day
GET /analytics/daily-totals
GET /export?type&dateRange (CSV)

// Call & Transcript Management
POST /transcripts
GET /transcripts?tenant_id&search&dateRange
GET /transcripts/{id}
```

### Data Models (Production Ready)
- **Tenant**: Business profile, settings, AI configuration
- **MenuItem**: SKU, pricing, availability, categories  
- **Order**: Customer info, items, status, payments, refunds
- **Transcript**: Call recordings, AI conversations, confidence scores
- **OrderItem**: Line items with modifications and notes

## Key Dependencies

- **React Navigation**: Bottom tabs and stack navigation
- **Expo Vector Icons**: Icons throughout the app
- **React Native Chart Kit**: Revenue analytics charts
- **React Native SVG**: Chart rendering support

## Development

The app is built with:
- React Native with Expo
- Modern React hooks and functional components
- Responsive design that matches your UI mockups
- Clean, maintainable code structure

## Features Implemented

✅ Dashboard with revenue charts and statistics  
✅ Orders list with filtering and status management  
✅ Order details with customer information  
✅ AI transcript conversations  
✅ Menu management with item toggles  
✅ Settings with opening hours configuration  
✅ Business profile management  
✅ Bottom tab navigation  
✅ Modern UI matching your designs  

The app is now ready to run on your phone via Expo Go! Simply scan the QR code and start exploring all the features.
