# Backend Implementation Guide

## 📚 Documentation Files

You now have 4 comprehensive backend specification documents:

1. **BACKEND_SPECIFICATION.md** - Complete API documentation with data models
2. **API_ENDPOINTS_SUMMARY.md** - Quick reference for all 185+ endpoints
3. **DATABASE_SCHEMA.sql** - PostgreSQL database schema with 30+ tables
4. **IMPLEMENTATION_GUIDE.md** - This file

---

## 🚀 Quick Start

### Step 1: Database Setup
```bash
# Create PostgreSQL database
createdb hr_pm_system

# Run schema
psql hr_pm_system < DATABASE_SCHEMA.sql

# Verify tables created
psql hr_pm_system -c "\dt"
```

### Step 2: Seed Default Data

```sql
-- Insert default permissions
INSERT INTO permissions (module, action, description, code) VALUES
('Dashboard', 'View Dashboard', 'Access to main dashboard', 'dashboard.view'),
('Employees', 'View Employees', 'View employee directory', 'employees.view'),
('Employees', 'Create Employee', 'Add new employees', 'employees.create'),
-- ... add all permissions from BACKEND_SPECIFICATION.md

-- Insert system roles
INSERT INTO roles (company_id, name, display_name, description, permissions, is_system) VALUES
('company-uuid', 'admin', 'Administrator', 'Full system access', '["all"]', true),
('company-uuid', 'manager', 'Manager', 'Manage team', '["dashboard.view", ...]', true),
-- ... add all system roles
```

### Step 3: Backend Framework Setup

#### Option A: Node.js + Express
```bash
npm init -y
npm install express pg jsonwebtoken bcrypt multer
npm install --save-dev typescript @types/node @types/express
```

#### Option B: Python + FastAPI
```bash
pip install fastapi uvicorn sqlalchemy psycopg2 pyjwt bcrypt python-multipart
```

#### Option C: PHP + Laravel
```bash
composer create-project laravel/laravel hr-pm-system
composer require laravel/sanctum
```

---

## 📋 Implementation Checklist

### Phase 1: Core Setup (Week 1-2)
- [ ] Set up database schema
- [ ] Configure environment variables
- [ ] Implement authentication (JWT)
- [ ] Create user registration/login
- [ ] Set up multi-tenancy middleware
- [ ] Implement RBAC middleware
- [ ] Configure file storage (S3/local)
- [ ] Set up email service

### Phase 2: User & Company Management (Week 3)
- [ ] Company CRUD operations
- [ ] Employee CRUD operations
- [ ] User profile management
- [ ] Role & permission management
- [ ] Company settings

### Phase 3: Attendance & Time (Week 4)
- [ ] Attendance clock in/out
- [ ] Attendance settings
- [ ] Calendar view
- [ ] Team attendance
- [ ] Timesheet management
- [ ] Timesheet approval workflow

### Phase 4: Leave Management (Week 5)
- [ ] Leave types CRUD
- [ ] Leave balance calculation
- [ ] Leave request submission
- [ ] Leave approval workflow
- [ ] Leave calendar
- [ ] Leave allocation

### Phase 5: Payroll (Week 6-7)
- [ ] Payroll cycle management
- [ ] Salary component configuration
- [ ] Payroll calculation engine
- [ ] Payslip generation
- [ ] Payroll approval workflow
- [ ] PDF generation for payslips

### Phase 6: Projects & Tasks (Week 8)
- [ ] Project CRUD operations
- [ ] Project members management
- [ ] Task CRUD operations
- [ ] Task comments & attachments
- [ ] Kanban board view
- [ ] Activity tracking

### Phase 7: Performance Management (Week 9)
- [ ] Appraisal templates
- [ ] Appraisal cycle management
- [ ] Self-assessment submission
- [ ] Manager review
- [ ] HR review
- [ ] Rating calculations

### Phase 8: Skills & Documents (Week 10)
- [ ] Skills catalog
- [ ] Employee skills management
- [ ] Skill endorsements
- [ ] Document upload
- [ ] Document access control
- [ ] Document versioning

### Phase 9: Leads & Reports (Week 11)
- [ ] Leads management
- [ ] Lead activities
- [ ] Lead conversion
- [ ] Report generation
- [ ] Dashboard analytics
- [ ] Export functionality

### Phase 10: Testing & Optimization (Week 12)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation
- [ ] Deployment

---

## 🔒 Security Implementation

### 1. Authentication
```typescript
// JWT Token Structure
{
  user_id: "uuid",
  company_id: "uuid",
  role: "admin",
  exp: timestamp,
  iat: timestamp
}

// Password Hashing
bcrypt.hash(password, 10) // Use bcrypt with 10 rounds
```

### 2. Multi-Tenancy
```typescript
// Middleware to add company_id to all queries
app.use((req, res, next) => {
  const { company_id } = req.user;
  req.company_id = company_id;
  next();
});

// All queries must include company_id
db.query('SELECT * FROM employees WHERE company_id = $1', [company_id]);
```

### 3. RBAC Middleware
```typescript
const checkPermission = (permission: string) => {
  return async (req, res, next) => {
    const userPermissions = await getUserPermissions(req.user.id);
    if (userPermissions.includes(permission)) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  };
};

// Usage
app.post('/api/employees', checkPermission('employees.create'), createEmployee);
```

### 4. Input Validation
```typescript
// Use validation libraries
import Joi from 'joi';

const employeeSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  department: Joi.string().required(),
  // ... more fields
});

// Validate before processing
const { error, value } = employeeSchema.validate(req.body);
if (error) {
  return res.status(400).json({ error: error.details });
}
```

---

## 💾 Database Optimization

### 1. Indexing Strategy
```sql
-- Already included in schema
-- Key indexes on:
-- - Foreign keys (company_id, employee_id, etc.)
-- - Frequently queried columns (status, date, email)
-- - Composite indexes for common query patterns
```

### 2. Query Optimization
```typescript
// Bad: N+1 Query Problem
const employees = await db.query('SELECT * FROM employees');
for (const emp of employees) {
  emp.skills = await db.query('SELECT * FROM employee_skills WHERE employee_id = $1', [emp.id]);
}

// Good: Use JOIN
const employees = await db.query(`
  SELECT e.*, 
         json_agg(es.*) as skills
  FROM employees e
  LEFT JOIN employee_skills es ON e.id = es.employee_id
  WHERE e.company_id = $1
  GROUP BY e.id
`, [company_id]);
```

### 3. Caching Strategy
```typescript
// Cache frequently accessed data
import Redis from 'redis';
const redis = Redis.createClient();

// Cache company settings (rarely changes)
const getCompanySettings = async (company_id) => {
  const cached = await redis.get(`company:${company_id}:settings`);
  if (cached) return JSON.parse(cached);
  
  const settings = await db.query('SELECT * FROM companies WHERE id = $1', [company_id]);
  await redis.setex(`company:${company_id}:settings`, 3600, JSON.stringify(settings));
  return settings;
};

// Invalidate cache on update
const updateCompanySettings = async (company_id, data) => {
  await db.query('UPDATE companies SET ... WHERE id = $1', [company_id]);
  await redis.del(`company:${company_id}:settings`);
};
```

---

## 📊 Business Logic Implementation

### 1. Leave Balance Calculation
```typescript
const calculateLeaveBalance = async (employee_id, leave_type_id, year) => {
  // Get leave type details
  const leaveType = await db.query('SELECT * FROM leave_types WHERE id = $1', [leave_type_id]);
  
  // Get current balance
  let balance = await db.query(`
    SELECT * FROM leave_balances 
    WHERE employee_id = $1 AND leave_type_id = $2 AND year = $3
  `, [employee_id, leave_type_id, year]);
  
  if (!balance) {
    // Create initial balance
    balance = {
      total_allocated: leaveType.annual_quota,
      used: 0,
      pending: 0,
      carried_forward: 0
    };
    
    // Check carry forward from previous year
    if (leaveType.carry_forward_enabled) {
      const prevYear = await db.query(`
        SELECT available FROM leave_balances 
        WHERE employee_id = $1 AND leave_type_id = $2 AND year = $3
      `, [employee_id, leave_type_id, year - 1]);
      
      if (prevYear && prevYear.available > 0) {
        const carryForward = Math.min(prevYear.available, leaveType.max_carry_forward || 999);
        balance.carried_forward = carryForward;
        balance.total_allocated += carryForward;
      }
    }
  }
  
  balance.available = balance.total_allocated - balance.used - balance.pending;
  return balance;
};
```

### 2. Payroll Calculation
```typescript
const calculatePayroll = async (employee_id, month, year, working_days, present_days) => {
  // Get employee salary components
  const components = await db.query(`
    SELECT * FROM salary_components 
    WHERE employee_id = $1 AND is_active = true
  `, [employee_id]);
  
  // Get base salary
  const employee = await db.query('SELECT * FROM employees WHERE id = $1', [employee_id]);
  
  // Calculate earnings
  const earnings = {
    basic_salary: (employee.salary_basic / working_days) * present_days,
    hra: (employee.salary_hra / working_days) * present_days,
    special_allowance: (employee.salary_special_allowance / working_days) * present_days,
    performance_bonus: 0,
    other_allowances: 0
  };
  
  // Add variable components
  for (const comp of components) {
    if (comp.component_type === 'earning') {
      if (comp.calculation_type === 'fixed') {
        earnings[comp.component_name] = comp.value;
      } else if (comp.calculation_type === 'percentage') {
        earnings[comp.component_name] = earnings.basic_salary * (comp.value / 100);
      }
    }
  }
  
  const gross_salary = Object.values(earnings).reduce((sum, val) => sum + val, 0);
  
  // Calculate deductions
  const deductions = {
    provident_fund: gross_salary * 0.12, // 12% PF
    professional_tax: 200, // Fixed PT
    income_tax: calculateTax(gross_salary * 12), // Annual tax / 12
    insurance: 1000,
    other_deductions: 0
  };
  
  // Add deduction components
  for (const comp of components) {
    if (comp.component_type === 'deduction') {
      if (comp.calculation_type === 'fixed') {
        deductions[comp.component_name] = comp.value;
      } else if (comp.calculation_type === 'percentage') {
        deductions[comp.component_name] = gross_salary * (comp.value / 100);
      }
    }
  }
  
  const total_deductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
  const net_salary = gross_salary - total_deductions;
  
  return {
    earnings,
    gross_salary,
    deductions,
    total_deductions,
    net_salary
  };
};
```

### 3. Attendance Status Logic
```typescript
const determineAttendanceStatus = (clock_in, clock_out, settings) => {
  if (!clock_in) return 'absent';
  
  const shift_start = new Date(settings.shift_start_time);
  const clock_in_time = new Date(clock_in);
  const late_threshold = shift_start.getTime() + (settings.grace_period_minutes * 60000);
  
  let status = 'present';
  
  // Check if late
  if (clock_in_time.getTime() > late_threshold) {
    status = 'late';
  }
  
  // Check if half-day
  if (clock_out) {
    const work_hours = (new Date(clock_out) - new Date(clock_in)) / (1000 * 60 * 60);
    if (work_hours < settings.half_day_threshold_hours) {
      status = 'half-day';
    }
  }
  
  return status;
};
```

---

## 🔔 Notifications Implementation

### Email Notifications
```typescript
import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, template, data) => {
  const transporter = nodemailer.createTransport({
    service: 'SendGrid',
    auth: {
      user: process.env.SENDGRID_USER,
      pass: process.env.SENDGRID_PASSWORD
    }
  });
  
  const html = renderTemplate(template, data);
  
  await transporter.sendMail({
    from: 'noreply@company.com',
    to,
    subject,
    html
  });
};

// Notification triggers
const notifyLeaveApproval = async (leave_request) => {
  const employee = await getEmployee(leave_request.employee_id);
  const manager = await getManager(employee.reporting_manager_id);
  
  await sendEmail(
    manager.email,
    'Leave Approval Request',
    'leave-approval',
    { employee, leave_request }
  );
};
```

### Background Jobs
```typescript
import Queue from 'bull';
const emailQueue = new Queue('email', process.env.REDIS_URL);

// Add job
emailQueue.add('leave-approval', {
  to: manager.email,
  leave_request: leave_request
});

// Process job
emailQueue.process('leave-approval', async (job) => {
  await sendEmail(
    job.data.to,
    'Leave Approval Request',
    'leave-approval',
    job.data.leave_request
  );
});
```

---

## 📄 PDF Generation

### Payslip PDF
```typescript
import PDFDocument from 'pdfkit';

const generatePayslipPDF = async (payslip, employee) => {
  const doc = new PDFDocument();
  const filename = `payslip-${payslip.id}.pdf`;
  
  // Header
  doc.fontSize(20).text('PAYSLIP', { align: 'center' });
  doc.moveDown();
  
  // Employee details
  doc.fontSize(12).text(`Employee: ${employee.name}`);
  doc.text(`Employee ID: ${employee.employee_id}`);
  doc.text(`Month: ${payslip.month} ${payslip.year}`);
  doc.moveDown();
  
  // Earnings table
  doc.fontSize(14).text('EARNINGS');
  doc.fontSize(10);
  doc.text(`Basic Salary: $${payslip.basic_salary}`);
  doc.text(`HRA: $${payslip.hra}`);
  // ... more earnings
  doc.moveDown();
  
  // Deductions table
  doc.fontSize(14).text('DEDUCTIONS');
  doc.fontSize(10);
  doc.text(`PF: $${payslip.provident_fund}`);
  // ... more deductions
  doc.moveDown();
  
  // Net pay
  doc.fontSize(16).text(`NET PAY: $${payslip.net_salary}`, { align: 'right' });
  
  doc.end();
  
  // Upload to S3
  await uploadToS3(filename, doc);
  
  return filename;
};
```

---

## 🧪 Testing

### Unit Tests
```typescript
import { describe, test, expect } from '@jest/globals';

describe('Leave Balance Calculation', () => {
  test('should calculate correct available balance', async () => {
    const balance = await calculateLeaveBalance(
      'employee-1',
      'leave-type-1',
      2024
    );
    
    expect(balance.available).toBe(18);
  });
  
  test('should carry forward unused leaves', async () => {
    const balance = await calculateLeaveBalance(
      'employee-1',
      'leave-type-1',
      2024
    );
    
    expect(balance.carried_forward).toBe(5);
  });
});
```

### Integration Tests
```typescript
describe('Leave Approval Workflow', () => {
  test('should approve leave and update balance', async () => {
    // Apply leave
    const leave = await applyLeave({
      employee_id: 'emp-1',
      leave_type_id: 'type-1',
      start_date: '2024-12-01',
      end_date: '2024-12-05',
      total_days: 5
    });
    
    expect(leave.status).toBe('pending');
    
    // Approve leave
    const approved = await approveLeave(leave.id, 'manager-1');
    expect(approved.status).toBe('approved');
    
    // Check balance updated
    const balance = await getLeaveBalance('emp-1', 'type-1', 2024);
    expect(balance.used).toBe(5);
    expect(balance.available).toBe(15);
  });
});
```

---

## 🚀 Deployment

### Environment Variables
```.env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hr_pm_system

# Authentication
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# File Storage
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket
AWS_REGION=us-east-1

# Email
SENDGRID_API_KEY=your-api-key
EMAIL_FROM=noreply@company.com

# Redis
REDIS_URL=redis://localhost:6379

# App
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://app.company.com
```

### Docker Setup
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/hr_pm_system
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: hr_pm_system
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## 📈 Monitoring & Logging

### Application Logging
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log all requests
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    user_id: req.user?.id,
    company_id: req.company_id
  });
  next();
});
```

### Performance Monitoring
```typescript
import newrelic from 'newrelic';

// Or use alternatives like:
// - DataDog
// - Sentry
// - AppSignal
```

---

## 🔄 API Versioning

```typescript
// v1 routes
app.use('/api/v1', v1Router);

// v2 routes (when needed)
app.use('/api/v2', v2Router);
```

---

## 📖 API Documentation

Use Swagger/OpenAPI for auto-generated documentation:

```typescript
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HR & PM System API',
      version: '1.0.0',
      description: 'Complete API documentation'
    },
    servers: [
      { url: 'http://localhost:3000/api/v1' }
    ]
  },
  apis: ['./routes/*.ts']
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

---

## ✅ Production Readiness Checklist

- [ ] All endpoints implemented and tested
- [ ] Authentication & authorization working
- [ ] Multi-tenancy properly isolated
- [ ] Input validation on all endpoints
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] HTTPS enforced
- [ ] Database migrations set up
- [ ] Backup strategy in place
- [ ] Monitoring & alerting configured
- [ ] Documentation complete
- [ ] Performance tested
- [ ] Security audit completed
- [ ] Load testing done

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks
1. Database backups (daily)
2. Log rotation (weekly)
3. Security updates (as needed)
4. Performance monitoring (continuous)
5. User feedback collection
6. Bug fixes (as reported)

### Scaling Considerations
- Horizontal scaling with load balancer
- Database read replicas
- Caching layer (Redis)
- CDN for static assets
- Background job workers
- Microservices (if needed)

---

Good luck with your backend implementation! 🚀
