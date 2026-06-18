@echo off
:: =========================================================================
:: amzRufus - Database Seeding Orchestrator Script (Windows Batch)
:: =========================================================================

echo --------------------------------------------------
echo 🚀 Initializing amzRufus Catalog Generation...
echo --------------------------------------------------
node "%~dp0generateCatalog.js"
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Generation failed.
    exit /b %ERRORLEVEL%
)

echo.
echo --------------------------------------------------
echo 💾 Seeding Catalog into MongoDB...
echo --------------------------------------------------
npx tsx "%~dp0..\seeds\seed.ts"
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Seeding failed.
    exit /b %ERRORLEVEL%
)

echo.
echo ✅ Seeding Orchestration Complete!
