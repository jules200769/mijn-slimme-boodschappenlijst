# 🚀 check it! - Demo Guide

A clean, simple demo of your AI assistant with optional authentication.

## ✨ Features

- **AI Chat Interface**: Send prompts to DeepSeek API
- **Optional Authentication**: Login or use as guest
- **Modern UI**: Clean, minimalist design
- **Mobile Optimized**: Swipe gestures, keyboard handling
- **Backend**: Supabase (cloud database)

## 🛠️ Quick Setup

### 1. Start the App
```bash
npx expo start
```
```bash
npx expo start
```

### 4. Run on Device
- Install Expo Go on your phone
- Scan the QR code
- Or press 'i' for iOS simulator, 'a' for Android

## 🎯 Demo Flow

### Option 1: Guest Mode (Easiest)
1. Open the app
2. Tap "Skip Login (Demo Mode)"
3. Start using the AI assistant immediately

### Option 2: Create Account
1. Tap "Sign Up"
2. Fill in your details
3. Create account
4. Use the AI assistant

### Option 3: Login with Demo Account
1. Tap "Sign In"
2. Use these credentials:
   - **Email**: `demo@example.com`
   - **Password**: `demo123`

## 📱 App Features

### AI Chat
- Type any question or prompt
- Get instant AI responses
- Swipe left/right on responses to clear
- Loading indicator with "This can take a few seconds..."

### User Interface
- Clean, modern design
- User info in header (name, email)
- Logout/Sign In button
- Responsive keyboard handling

### Error Handling
- Network error messages
- API timeout handling
- User-friendly error cards

## 🔧 App Architecture

### Frontend
- React Native with Expo
- Supabase for authentication and database
- Real-time data synchronization
- Push notifications

## 🎨 UI Components

- **Login Screen**: Email/password + skip option
- **Register Screen**: Name, email, password fields
- **Main Screen**: AI chat with user header
- **Navigation**: Stack navigation between screens

## 🚀 Ready to Demo!

Your app is now ready for demonstration. The authentication is completely optional - users can skip it and still use the AI assistant functionality.

**Key Demo Points:**
- ✅ Clean, modern UI
- ✅ Optional authentication
- ✅ AI chat with DeepSeek
- ✅ Mobile-optimized gestures
- ✅ Error handling
- ✅ Loading states

Enjoy your demo! 🎉 