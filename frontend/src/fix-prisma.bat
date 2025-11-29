@echo off
REM Fix Prisma Schema Issues (Windows)
REM This script will clean and regenerate Prisma client

echo 🔧 Fixing Prisma Schema...

REM Step 1: Clean cache
echo 📦 Cleaning Prisma cache...
if exist node_modules\.prisma rmdir /s /q node_modules\.prisma
if exist node_modules\@prisma rmdir /s /q node_modules\@prisma

REM Step 2: Format schema
echo ✨ Formatting Prisma schema...
call npx prisma format

REM Step 3: Validate schema
echo ✅ Validating Prisma schema...
call npx prisma validate

if %errorlevel% equ 0 (
    echo ✅ Schema is valid!
    
    REM Step 4: Generate client
    echo 🔨 Generating Prisma Client...
    call npx prisma generate
    
    if %errorlevel% equ 0 (
        echo ✅ Prisma Client generated successfully!
        echo.
        echo 🎉 All done! You can now use:
        echo    - npx prisma db push (to sync with database^)
        echo    - npx prisma migrate dev (to create migration^)
        echo    - npx prisma studio (to view data^)
    ) else (
        echo ❌ Failed to generate Prisma Client
        exit /b 1
    )
) else (
    echo ❌ Schema validation failed. Please check the error above.
    exit /b 1
)
