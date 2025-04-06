@echo off
echo ==========================================
echo EdVantage Setup - Installing Dependencies
echo ==========================================
echo.

echo Installing required dependencies...
npm install

echo.
echo Checking for UUID specifically (required for storage functionality)...
npm list uuid || npm install uuid

echo.
echo Setting up environment variables...
(
echo # Firebase Configuration
echo VITE_FIREBASE_API_KEY=AIzaSyCmj3oPX2UgzN0ovH-tIPV-6Owk0N1-wYU
echo VITE_FIREBASE_AUTH_DOMAIN=vision09.firebaseapp.com
echo VITE_FIREBASE_PROJECT_ID=vision09
echo VITE_FIREBASE_STORAGE_BUCKET=vision09.appspot.com
echo VITE_FIREBASE_MESSAGING_SENDER_ID=204850414986
echo VITE_FIREBASE_APP_ID=1:204850414986:web:696157845a0a384f92b473
echo.
echo # Gemini API Key
echo VITE_GEMINI_API_KEY=AIzaSyDVK-nClnQbEV-IX8GHGalomH2U3C2_tDo
) > .env

echo.
echo ==========================================
echo Setup complete! Starting development server...
echo ==========================================
echo.

npm run dev
