#!/bin/bash

# QR Code Connection Helper Script
echo "🚀 Restaurant Manager App - Connection Helper"
echo "============================================="

echo ""
echo "📱 MOBILE CONNECTION OPTIONS:"
echo ""
echo "1. 📷 QR Code URL: exp://172.16.2.15:8081"
echo "2. 🌐 Manual Entry: Type the above URL in Expo Go"
echo "3. 💻 Web Version: http://localhost:8081"

echo ""
echo "🔧 TROUBLESHOOTING:"
echo ""
echo "If QR code doesn't work:"
echo "• Make sure phone and computer are on same WiFi"
echo "• Download 'Expo Go' app from App Store/Play Store"
echo "• Open Expo Go → 'Enter URL manually' → Type: exp://172.16.2.15:8081"

echo ""
echo "🌐 WEB VERSION (Always works):"
echo "Open your browser and go to: http://localhost:8081"

echo ""
echo "📞 Need tunnel connection? Run:"
echo "npx expo start --tunnel"

echo ""
read -p "Press Enter to open web version..." 
open http://localhost:8081
