#!/bin/bash

# Fix Prisma Schema Issues
# This script will clean and regenerate Prisma client

echo "🔧 Fixing Prisma Schema..."

# Step 1: Clean cache
echo "📦 Cleaning Prisma cache..."
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma

# Step 2: Format schema
echo "✨ Formatting Prisma schema..."
npx prisma format

# Step 3: Validate schema
echo "✅ Validating Prisma schema..."
npx prisma validate

if [ $? -eq 0 ]; then
    echo "✅ Schema is valid!"
    
    # Step 4: Generate client
    echo "🔨 Generating Prisma Client..."
    npx prisma generate
    
    if [ $? -eq 0 ]; then
        echo "✅ Prisma Client generated successfully!"
        echo ""
        echo "🎉 All done! You can now use:"
        echo "   - npx prisma db push (to sync with database)"
        echo "   - npx prisma migrate dev (to create migration)"
        echo "   - npx prisma studio (to view data)"
    else
        echo "❌ Failed to generate Prisma Client"
        exit 1
    fi
else
    echo "❌ Schema validation failed. Please check the error above."
    exit 1
fi
