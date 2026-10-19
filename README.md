# Calendario Menstrual (APK con Capacitor)

## Opción 1: sin instalar nada (GitHub Actions)
1. Crea un repo en GitHub y sube esta carpeta (`git init && git add . && git commit -m init && git push`).
2. Pestaña **Actions** > "Build APK" (corre solo al hacer push a `main`, o con *Run workflow*).
3. Al terminar, descarga el artefacto `calendario-menstrual-apk` (zip con `app-debug.apk`).
4. Pásalo al teléfono, ábrelo y permite "Instalar apps de orígenes desconocidos".

## Opción 2: en tu PC (Node 18+, JDK 17, Android SDK)
npm install
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug      # Windows: gradlew.bat assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
