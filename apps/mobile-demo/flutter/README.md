# Flutter lab client

Minimal Dart UI that `GET {API_BASE}/api/hello`.

**Need:** Flutter SDK, JDK 17, Android Studio (or VS Code Flutter extras). iOS device builds require a Mac.

## First time (generates android/ ios/ folders)

```bash
cd apps/mobile-demo/flutter
flutter create --project-name secure_demo_mobile --org lab.secure .
# If create overwrites lib/main.dart, restore from git: git checkout -- lib/main.dart
flutter pub get
```

Enable **HTTP** to a LAN IP on Android (lab only): in `android/app/src/main/AndroidManifest.xml` on `<application>` add:

```xml
android:usesCleartextTraffic="true"
```

iOS lab: `ios/Runner/Info.plist` — `NSAppTransportSecurity` → `NSAllowsLocalNetworking` = true (or the documented ATS exception). Remove before store builds.

## Run

```bash
flutter run --dart-define=API_BASE=http://192.168.1.42:3080
```

Emulator on the same PC: `http://10.0.2.2:3080` is Android’s alias for the **host** loopback (not used on a physical phone).

## Store / cloud

Ship `https://api.example.com` via `--dart-define=API_BASE=...` in CI. Never put Vault or DB credentials in Dart.
