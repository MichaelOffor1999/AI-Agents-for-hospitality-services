# 🚨 QR Code Not Loading - Troubleshooting Guide

## 🔄 FRESH RESTART - TUNNEL MODE (MOST RELIABLE)
- **Current QR Code URL**: `exp://ylhumji-anonymous-8081.exp.direct`
- **Web Version**: `http://localhost:8081` (always works as backup)
- **Status**: ✅ Tunnel connected and ready!

---

## 📱 STEP-BY-STEP QR CODE FIX

### STEP 1: Check Expo Go App
1. **Download/Update Expo Go** from App Store or Google Play
2. Make sure it's the **latest version**
3. If you already have it, **force close and reopen** the app

### STEP 2: Try Different Scanning Methods

**Method A: Expo Go Scanner**
1. Open **Expo Go** app
2. Tap **"Scan QR Code"** 
3. Point camera at the NEW QR code (tunnel version)
4. Wait 5-10 seconds for it to process

**Method B: Manual URL Entry (MOST RELIABLE)**
1. Open **Expo Go** app  
2. Look for **"Enter URL manually"** or **"Connect manually"**
3. Type exactly: `exp://ylhumji-anonymous-8081.exp.direct`
4. Tap **Connect**

**Method C: iPhone Camera App**
1. Open **Camera** app (not Expo Go)
2. Point at QR code
3. Tap the notification that pops up
4. It should open in Expo Go

### STEP 3: Check Common Issues

**Issue: "Network Error" or "Could not load"**
- ✅ **FIXED**: Now using tunnel mode (bypasses network issues)
- Your phone doesn't need to be on same WiFi anymore

**Issue: "Experience not found"**  
- Make sure you're using the NEW tunnel URL: `exp://ylhumji-anonymous-8081.exp.direct`
- Don't use old URLs from previous sessions

**Issue: "This experience uses SDK..." error**
- Update Expo Go app from App Store/Play Store
- Restart Expo Go completely

**Issue: QR code scans but app doesn't load**
- Wait 30-60 seconds (first load takes time)
- Check your internet connection
- Try the manual URL method instead

---

## 🌐 BACKUP OPTION: WEB VERSION
If QR code still doesn't work, use the web version:
- Go to: `http://localhost:8081` in any browser
- **Identical functionality** to mobile version
- Perfect for testing the "Add Info" feature

---

## 📞 ALTERNATIVE: iOS SIMULATOR
If you have Xcode installed:
1. In terminal, press `i` to open iOS simulator
2. App will open in simulated iPhone

---

## ✅ SUCCESS CHECKLIST
- [ ] Expo Go app downloaded/updated
- [ ] Tried tunnel URL: `exp://ylhumji-anonymous-8081.exp.direct` 
- [ ] Used manual URL entry method
- [ ] Waited 30+ seconds for first load
- [ ] Tested web version as backup

The tunnel connection should fix most QR code loading issues!
