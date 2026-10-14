@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cd /d "%~dp0"

where git >nul 2>nul
if errorlevel 1 (
  echo Git не найден. Установите Git for Windows: https://git-scm.com/download/win
  pause
  exit /b 1
)

if not exist .git (
  git init
  git branch -M main
)

git config user.name >nul 2>nul
if errorlevel 1 (
  set /p GNAME=Ваше имя для коммитов: 
  git config user.name "!GNAME!"
)
git config user.email >nul 2>nul
if errorlevel 1 (
  set /p GMAIL=Ваш email как на GitHub: 
  git config user.email "!GMAIL!"
)

git remote get-url origin >nul 2>nul
if errorlevel 1 (
  set /p URL=Адрес пустого репозитория, например https://github.com/ИМЯ/РЕПО.git: 
  git remote add origin !URL!
)

git add -A
git commit -m "Обновление игры"
git push -u origin main
if errorlevel 1 (
  echo.
  echo Не получилось отправить. Репозиторий на GitHub должен быть пустым без README. Если просят вход, войдите в браузере.
) else (
  echo.
  echo Готово: код загружен на GitHub.
)
pause
