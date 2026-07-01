@echo off
cd /d "%~dp0"
start "" http://localhost:5188
npx vite --port 5188 --strictPort
