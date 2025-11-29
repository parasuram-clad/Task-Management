# Prisma Schema Setup Guide

## Issue Resolution

If you're getting the error:
```
Type "AttendanceSettings" is neither a built-in type, nor refers to another model, composite type, or enum.
```

This is likely due to Prisma caching or formatting issues. Here's how to fix it:

## Step 1: Clean Prisma Cache

```bash
# Delete node_modules and reinstall
rm -rf node_modules
rm -rf prisma/generated
rm package-lock.json

npm install

# Or with yarn
rm -rf node_modules
rm -rf prisma/generated
rm yarn.lock

yarn install
```

## Step 2: Format the Schema

```bash
# Format the Prisma schema file
npx prisma format

# This will auto-format and validate the schema
```

## Step 3: Validate the Schema

```bash
# Validate without generating
npx prisma validate
```

## Step 4: Generate Prisma Client

```bash
# Generate the Prisma Client
npx prisma generate
```

## Step 5: Push to Database (Development)

```bash
# For development - pushes schema to database
npx prisma db push

# Or create a migration (recommended for production)
npx prisma migrate dev --name initial_setup
```

## Common Issues & Solutions

### Issue 1: Model Not Found

**Cause**: Prisma parser error or cache issue

**Solution**:
1. Run `npx prisma format` to auto-format
2. Check for typos in model names
3. Ensure all models are properly closed with `}`

### Issue 2: Relation Errors

**Cause**: Mismatched field types in relations

**Solution**:
- Ensure foreign key fields have the same type as the referenced primary key
- Example: If `Company.id` is `String @db.Uuid`, then `User.companyId` must also be `String @db.Uuid`

### Issue 3: Enum Errors

**Cause**: Enum values with special characters

**Solution**:
- Use `@map()` for enum values with hyphens
- Example: `half_day @map("half-day")`

## Environment Setup

Create a `.env` file in the root directory:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/hr_system?schema=public"

# Example for local development
# DATABASE_URL="postgresql://postgres:password@localhost:5432/hr_management_db?schema=public"

# Example for Supabase
# DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

## Prisma Studio

To view and edit your data:

```bash
npx prisma studio
```

This will open a GUI at `http://localhost:5555`

## Schema Organization

The schema is organized in the following sections:

1. **Core Models** (Company, User, Employee, Department)
2. **Attendance & Timesheet**
3. **Leave Management**
4. **Payroll Management**
5. **Payment Processing & UTR Tracking** ⭐ NEW
6. **Projects & Tasks**
7. **Performance & Appraisal**
8. **Skills & Competencies**
9. **Documents**
10. **Permissions & Roles**
11. **CRM (Leads & Clients)**
12. **Finance & Accounting**
13. **Notifications & Communications**
14. **Integrations**
15. **Audit & Logs**
16. **Enums** (at the end)

## Tips for Development

### 1. Use Prisma Client

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Query example
const companies = await prisma.company.findMany({
  include: {
    employees: true,
    attendanceSettings: true
  }
})
```

### 2. Seeding Data

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a company
  const company = await prisma.company.create({
    data: {
      name: "Acme Corporation",
      slug: "acme",
      subdomain: "acme",
      email: "admin@acme.com",
      // ... other fields
    }
  })

  console.log({ company })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Run seed:
```bash
npx prisma db seed
```

### 3. Migrations

```bash
# Create a new migration
npx prisma migrate dev --name add_utr_tracking

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### 4. Introspection

If you have an existing database:

```bash
# Pull schema from database
npx prisma db pull

# This will update your schema.prisma based on the database
```

## Troubleshooting Commands

```bash
# Check Prisma version
npx prisma --version

# Show detailed error logs
npx prisma generate --schema=./prisma/schema.prisma

# Validate schema
npx prisma validate

# Format schema
npx prisma format

# Check migration status
npx prisma migrate status
```

## Performance Optimization

### 1. Connection Pooling

For production, use connection pooling:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 2. Indexes

The schema already includes indexes on:
- Foreign keys
- Frequently queried fields
- Status fields
- Date fields
- Unique identifiers

### 3. Query Optimization

```typescript
// Bad - N+1 problem
const users = await prisma.user.findMany()
for (const user of users) {
  const employee = await prisma.employee.findUnique({
    where: { userId: user.id }
  })
}

// Good - Use include
const users = await prisma.user.findMany({
  include: {
    employee: true
  }
})
```

## Next Steps

1. ✅ Set up `.env` with DATABASE_URL
2. ✅ Run `npx prisma format`
3. ✅ Run `npx prisma generate`
4. ✅ Run `npx prisma db push` (dev) or `npx prisma migrate dev`
5. ✅ Run `npx prisma studio` to verify
6. ✅ Start building your application!

## Support

If you continue to have issues:

1. Check Prisma version: `npx prisma --version` (should be 5.x or higher)
2. Clear cache: `rm -rf node_modules/.prisma`
3. Reinstall: `npm install @prisma/client prisma --save-dev`
4. Check PostgreSQL version: Should be 12 or higher
5. Verify DATABASE_URL is correct

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [PostgreSQL Data Types](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#postgresql)
