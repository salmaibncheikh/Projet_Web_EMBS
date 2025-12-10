@echo off
echo ========================================
echo DEMARRAGE SERVEUR CHAT (Port 8081)
echo ========================================
echo.
echo Ce serveur est REQUIS pour la messagerie
echo (Mere, Docteur, Adolescent)
echo.
cd /d "%~dp0chat-app-backend"
echo Dossier: %CD%
echo.
echo Installation des dependances...
call npm install
echo.
echo Demarrage du serveur...
call npm run dev
pause
