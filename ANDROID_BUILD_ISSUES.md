# Android Build Issues & Solutions

This document outlines all the Android build issues encountered and their solutions for the ONE AI Agent React Native app.

## Issues Encountered

### 1. Android SDK Location Not Found
**Error:** `SDK location not found. Define a valid SDK location with an ANDROID_HOME environment variable`

**Solution:**
- Set `ANDROID_HOME` environment variable: `export ANDROID_HOME=~/Library/Android/sdk`
- Add to PATH: `export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools`
- Create `android/local.properties` file with: `sdk.dir=/Users/alisohail/Library/Android/sdk`

### 2. React Native IAP Dependency Conflict
**Error:** `NoClassDefFoundError: Failed resolution of: Lcom/android/billingclient/api/BillingConfig`

**Root Cause:** 
- `react-native-iap` library has both Amazon and Play Store variants
- Gradle couldn't choose between `amazonDebugApiElements` and `playDebugApiElements`
- Billing client version was too old (6.0.1) and missing `BillingConfig` class

**Solution Applied:**
- Added product flavors to resolve ambiguity
- Updated billing client to version 6.2.0
- Forced specific billing client version in dependencies

### 3. Expo Build Properties Plugin Configuration Error
**Error:** `Wrong number of arguments provided for static config plugin, expected either 1 or 2, got 3`

**Root Cause:** 
- `expo-build-properties` plugin had incorrect configuration with separate objects for iOS and Android

**Solution Applied:**
- Combined iOS and Android configurations into single object

## Configuration Files Modified

### 1. app.json
```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static",
            "deploymentTarget": "15.1"
          },
          "android": {
            "kotlinVersion": "2.1.20"
          }
        }
      ]
    ],
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "https",
              "host": "links.366degreefitresearch.com",
              "pathPrefix": "/verify"
            },
            {
              "scheme": "https",
              "host": "links.366degreefitresearch.com",
              "pathPrefix": "/reset-password"
            },
            {
              "scheme": "oneaiagent"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### 2. android/app/build.gradle
```gradle
android {
    defaultConfig {
        minSdkVersion 26  // Updated from rootProject.ext.minSdkVersion
    }
    
    // Fix for react-native-iap dependency conflict
    configurations.all {
        resolutionStrategy {
            force 'com.android.billingclient:billing:6.2.0'
        }
    }
    
    // Product flavors to resolve react-native-iap ambiguity
    flavorDimensions "store"
    productFlavors {
        play {
            dimension "store"
        }
    }
}

dependencies {
    // Force specific billing client version to resolve react-native-iap conflict
    implementation('com.android.billingclient:billing:6.2.0')
}
```

### 3. android/local.properties
```
sdk.dir=/Users/alisohail/Library/Android/sdk
```

### 4. android/gradle.properties
No changes required - using default configuration.

### 5. android/app/src/main/AndroidManifest.xml
No manual changes required - autolinking handles the configuration.

## Build Commands

### Clean Build
```bash
cd android && ./gradlew clean
```

### Run with Play Flavor
```bash
export ANDROID_HOME=~/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
npx expo run:android --variant playDebug
```

### Prebuild (if needed)
```bash
rm -rf android ios
npx expo prebuild
```

## Environment Setup Requirements

### Prerequisites
1. Android Studio installed
2. Android SDK installed at `~/Library/Android/sdk`
3. Environment variables set:
   - `ANDROID_HOME=~/Library/Android/sdk`
   - `PATH` includes Android tools

### Dependencies
- React Native 0.79.5
- Expo SDK 53
- react-native-iap with Play Store variant
- Google Play Billing Client 6.2.0

## Deep Linking Configuration

### iOS Universal Links
- Domain: `links.366degreefitresearch.com`
- Configured in `associatedDomains`

### Android App Links
- Domain: `links.366degreefitresearch.com`
- Configured in `intentFilters`
- **Note:** Requires `assetlinks.json` file on backend for verification

### Required Backend File
Create `https://links.366degreefitresearch.com/.well-known/assetlinks.json`:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.threesixsixdegreefitechandsciinstitute.one",
    "sha256_cert_fingerprints": ["YOUR_ANDROID_APP_SHA256_CERT_FINGERPRINT"]
  }
}]
```

## Troubleshooting

### If Build Still Fails
1. Clean project: `cd android && ./gradlew clean`
2. Clear Metro cache: `npx expo start --clear`
3. Rebuild: `npx expo run:android --variant playDebug`

### If IAP Still Doesn't Work
1. Verify Play Store variant is being used
2. Check billing client version is 6.2.0
3. Ensure Google Play Services are available on device/emulator

### Environment Issues
1. Verify `ANDROID_HOME` is set correctly
2. Check `android/local.properties` exists
3. Ensure Android SDK tools are in PATH

## Notes for Developers

1. **Always use `--variant playDebug`** when running Android builds
2. **Don't modify** the product flavors configuration - it's required for react-native-iap
3. **Keep billing client version** at 6.2.0 or higher
4. **Test deep links** on both iOS and Android after deployment
5. **Update SHA256 fingerprint** in assetlinks.json for production builds

## Related Files Modified
- `app.json` - Plugin configuration and deep linking
- `android/app/build.gradle` - Dependencies and product flavors
- `android/local.properties` - SDK location
- `components/ui/Tabs.tsx` - UI component fixes
- `screens/auth-page.tsx` - Authentication screen updates

---
*Last updated: December 2024*
*Build tested on: Android API 35, React Native 0.79.5*
