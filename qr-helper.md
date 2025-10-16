# 📱 QR Code Troubleshooting Guide

## Current Connection Info:
- **URL**: `exp://172.20.10.12:8081`
- **Web**: `http://localhost:8081`

## 🔧 QR Code Fix Options:

### Option 1: Make sure you're on the same WiFi network
- Your phone and computer MUST be on the same WiFi network
- Check WiFi settings on both devices

### Option 2: Manual URL Entry (Most Reliable)
1. Open **Expo Go** app on your phone
2. Look for "Enter URL manually" or "Connect manually"
3. Type: `exp://172.20.10.12:8081`

### Option 3: Use Camera App (iOS)
1. Open iPhone **Camera** app
2. Point at QR code
3. Tap the notification that appears

### Option 4: Use Expo Go Scanner
1. Open **Expo Go** app
2. Tap "Scan QR Code"
3. Point at the QR code in terminal

### Option 5: Web Version (Always Works)
- Go to: `http://localhost:8081` in any browser

## 🚨 Common Issues & Fixes:

### Issue: "Network error" or "Could not connect"
**Fix**: Switch to tunnel mode
```bash
npx expo start --tunnel
```

### Issue: "Expo Go not responding"
**Fix**: 
1. Close Expo Go completely
2. Restart the app
3. Try again

### Issue: QR code changes/different each time
**Fix**: This is normal - use the newest QR code

### Issue: "This experience uses SDK..." error
**Fix**: Update Expo Go app from App Store/Play Store

## 📱 Download Expo Go:
- **iOS**: App Store → Search "Expo Go"
- **Android**: Google Play → Search "Expo Go"

## 💡 Pro Tip:
The web version (`http://localhost:8081`) works identically to mobile for testing!
