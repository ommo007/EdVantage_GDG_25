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
echo VITE_FIREBASE_API_KEY="YOUR_API_KEY"
echo VITE_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
echo VITE_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
echo VITE_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
echo VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
echo VITE_FIREBASE_APP_ID="YOUR_APP_ID"
echo.
echo # Gemini API Key
echo VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
) > .env

echo.
echo ==========================================
echo Setup complete! Starting development server...
echo ==========================================
echo.

npm run dev
