# Capacitor Mobile Build Setup

This guide will help you build Android APK files for the Battle Game.

## Prerequisites

1. **Node.js and npm** - Already installed
2. **Android Studio** - Download from https://developer.android.com/studio
3. **Java JDK 17** - Required for Android builds

## Initial Setup

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Initialize Capacitor (First time only)
\`\`\`bash
npm run cap:init
\`\`\`

### 3. Add Android Platform (First time only)
\`\`\`bash
npm run cap:add:android
\`\`\`

## Building for Android

### Quick Build (Recommended)
Build and open Android Studio in one command:
\`\`\`bash
npm run android
\`\`\`

### Step-by-Step Build

1. **Build the web app:**
\`\`\`bash
npm run build:mobile
\`\`\`

2. **Sync web assets to Android:**
\`\`\`bash
npm run cap:sync
\`\`\`

3. **Open Android Studio:**
\`\`\`bash
npm run cap:open:android
\`\`\`

4. **In Android Studio:**
   - Wait for Gradle sync to complete
   - Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   - The APK will be generated in `android/app/build/outputs/apk/debug/app-debug.apk`

## Available Scripts

- `npm run build:mobile` - Build static Next.js site for mobile
- `npm run cap:init` - Initialize Capacitor configuration
- `npm run cap:add:android` - Add Android platform
- `npm run cap:sync` - Sync web assets to native platforms
- `npm run cap:open:android` - Open project in Android Studio
- `npm run cap:build` - Build and sync in one command
- `npm run android` - Complete build pipeline (build + sync + open)

## Configuration

### App Details
Edit `capacitor.config.ts` to customize:
- `appId`: Package name (com.yourcompany.appname)
- `appName`: Display name shown on device
- `webDir`: Output directory (default: 'out')

### Android Settings
Located in `android/app/src/main/AndroidManifest.xml`
- Permissions (camera, storage, etc.)
- App orientation
- Hardware requirements

## Troubleshooting

### Gradle Build Errors
\`\`\`bash
cd android
./gradlew clean
cd ..
npm run cap:sync
\`\`\`

### Clear Cache and Rebuild
\`\`\`bash
rm -rf .next out android
npm run build:mobile
npm run cap:add:android
\`\`\`

### WebGL/Three.js Issues
The app uses WebGL which is supported on Android. Ensure:
- Hardware acceleration is enabled in Android settings
- Testing on physical device (emulator may have limited WebGL support)

## Production Builds

For production APK with signing:
1. Generate a keystore file
2. Update `capacitor.config.ts` with keystore details
3. Build signed APK in Android Studio: **Build** → **Generate Signed Bundle / APK**

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Studio Guide](https://developer.android.com/studio/run)
- [Capacitor Android Guide](https://capacitorjs.com/docs/android)
