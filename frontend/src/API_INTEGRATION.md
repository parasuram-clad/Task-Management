# API Integration Guide

## Overview

This HR and Project Management system now supports both **Mock Mode** (for demo/testing) and **API Mode** (for production use with your backend).

## Quick Start

### 1. Configure API Base URL

You can configure the API in two ways:

#### Option A: Login Page
- Click the "API Config" button in the top-right of the login page
- Enter your API base URL (e.g., `https://api.example.com` or `http://localhost:3000/api`)
- Click "Save & Connect"

#### Option B: Settings Page (After Login)
- Navigate to Settings from the sidebar
- Click the "API Configuration" tab
- Enter your base URL
- Click "Save Configuration"
- Use "Test Connection" to verify the API is reachable

### 2. Login

**Mock Mode** (No API configured):
- Use demo credentials:
  - `employee@company.com` / `password`
  - `manager@company.com` / `password`
  - `hr@company.com` / `password`
  - `admin@company.com` / `password`

**API Mode** (API configured):
- Use your actual credentials from the backend
- The system will authenticate against your API
- JWT token is automatically managed

## API Endpoints Integrated

### Authentication
- ✅ `POST /auth/login` - User login with email/password
- ✅ `GET /auth/me` - Get current user profile
- ✅ `POST /auth/logout` - Logout current user
- ✅ `POST /auth/refresh` - Refresh access token

### Attendance
- ✅ `GET /attendance/me/today` - Get today's attendance
- ✅ `POST /attendance/me/clock-in` - Clock in
- ✅ `POST /attendance/me/clock-out` - Clock out
- ✅ `GET /attendance/team` - Get team attendance
- ⏳ `GET /attendance/me/calendar` - Calendar view (needs endpoint)

### Timesheets
- ✅ `GET /timesheets/me` - Get weekly timesheet
- ✅ `POST /timesheets/me/save` - Save draft
- ✅ `POST /timesheets/me/submit` - Submit
- ⏳ `GET /timesheets/team` - Team timesheets (needs endpoint)
- ⏳ `PUT /timesheets/{id}/approve` - Approve (needs endpoint)
- ⏳ `PUT /timesheets/{id}/reject` - Reject (needs endpoint)

### Projects
- ✅ `GET /projects` - List all
- ✅ `GET /projects/{id}` - Get details
- ✅ `POST /projects` - Create
- ✅ `PUT /projects/{id}` - Update
- ⏳ `DELETE /projects/{id}` - Delete (not yet used)

### Tasks
- ✅ `GET /tasks/me` - My tasks
- ⏳ `GET /tasks/project/{projectId}` - Project tasks
- ⏳ `POST /tasks` - Create
- ⏳ `PUT /tasks/{id}` - Update
- ⏳ `DELETE /tasks/{id}` - Delete

### Employees
- ✅ `GET /employees` - List all employees
- ⏳ `GET /employees/{id}` - Employee profile

### Reports
- ✅ `GET /reports/attendance` - Attendance report
- ✅ `GET /reports/timesheet` - Timesheet report

### Employees
- ⏳ `GET /employees` - List employees
- ⏳ `GET /employees/{id}` - Get employee details
- ⏳ `POST /employees` - Create employee
- ⏳ `PUT /employees/{id}` - Update employee
- ⏳ `DELETE /employees/{id}` - Delete employee

### Reports
- ⏳ `GET /reports/attendance` - Attendance report
- ⏳ `GET /reports/timesheets` - Timesheet report

**Legend:** ✅ Integrated | ⏳ Pending Integration

## Architecture

### Service Layer

The application uses a clean service layer architecture:

```
/services
├── api-config.ts    - API configuration & token management
├── api-client.ts    - HTTP client with error handling
└── api.ts           - API endpoint definitions & types
```

### API Client Features

- **Automatic JWT Token Management**: Tokens are stored securely and attached to requests
- **Error Handling**: Centralized error handling with `ApiError` class
- **401 Handling**: Automatic token clearing on authentication failure
- **Type Safety**: Full TypeScript support with request/response types

### Usage Example

```typescript
import { authApi, attendanceApi } from './services/api';
import { apiConfig } from './services/api-config';

// Login
const response = await authApi.login({ 
  email: 'user@example.com', 
  password: 'password' 
});
apiConfig.setAccessToken(response.accessToken);

// Make authenticated requests
const attendance = await attendanceApi.getToday();
await attendanceApi.clockIn();
```

## Component Updates

### Fully Integrated Components ✅

1. **LoginPage** (`/components/auth/LoginPage.tsx`)
   - ✅ Mock and API authentication
   - ✅ API configuration dialog
   - ✅ JWT token storage

2. **MyAttendance** (`/components/attendance/MyAttendance.tsx`)
   - ✅ Today's attendance from API
   - ✅ Real-time clock in/out
   - ✅ Worked hours calculation

3. **TeamAttendance** (`/components/attendance/TeamAttendance.tsx`)
   - ✅ Team attendance list
   - ✅ Real-time status updates
   - ⏳ Regularization approvals (pending endpoint)

4. **ProjectList** (`/components/projects/ProjectList.tsx`)
   - ✅ List projects from API
   - ✅ Create new projects
   - ✅ Automatic refresh
   - ✅ Loading & error states

5. **ProjectDetail** (`/components/projects/ProjectDetail.tsx`)
   - ✅ Project details from API
   - ✅ Update project info
   - ✅ Real-time sync

6. **MyTasks** (`/components/tasks/MyTasks.tsx`)
   - ✅ User's tasks from API
   - ✅ Project information
   - ✅ Status/priority mapping

7. **MyTimesheet** (`/components/timesheet/MyTimesheet.tsx`)
   - ✅ Weekly timesheet data
   - ✅ Save as draft
   - ✅ Submit for approval
   - ✅ Week navigation

8. **EmployeeDirectory** (`/components/employees/EmployeeDirectory.tsx`)
   - ✅ List employees from API
   - ✅ Department/status filtering
   - ✅ Search functionality

9. **AttendanceReport** (`/components/reports/AttendanceReport.tsx`)
   - ✅ Generate attendance reports
   - ✅ Date range filtering
   - ✅ Department filtering

10. **TimesheetReport** (`/components/reports/TimesheetReport.tsx`)
    - ✅ By employee & project reports
    - ✅ Date range filtering
    - ✅ Project filtering

11. **PersonalSettings** (`/components/settings/PersonalSettings.tsx`)
    - ✅ API Configuration tab
    - ✅ Base URL management
    - ✅ Connection testing

### Partially Integrated (Mock Fallback)

- **AttendanceCalendar** - Calendar view needs dedicated endpoint
- **TimesheetApproval** - Approval workflow needs manager endpoints
- **ProjectTasks** - Task CRUD operations (create/update/delete)
- **EmployeeProfile** - Individual employee profile endpoint

## Configuration Storage

The application stores configuration in `localStorage`:

- `api_base_url` - Your API base URL
- `access_token` - JWT access token (for authenticated requests)

## Error Handling

The API client provides comprehensive error handling:

```typescript
try {
  await attendanceApi.clockIn();
} catch (error) {
  if (error instanceof ApiError) {
    // Handle specific API errors
    console.error(`API Error ${error.status}: ${error.message}`);
    toast.error(error.message);
  } else {
    // Handle network errors
    console.error('Network error:', error);
  }
}
```

## CORS Configuration

Ensure your backend API supports CORS for the frontend origin:

```javascript
// Example for Node.js/Express
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));
```

## Environment Setup

### Development
```bash
# Frontend (default: http://localhost:5173)
npm run dev

# Configure API URL in the app:
# http://localhost:3000/api  (or your backend URL)
```

### Production
- Deploy frontend to your hosting service
- Configure API base URL to production backend
- Ensure HTTPS is used for secure token transmission

## Security Notes

1. **JWT Tokens**: Stored in localStorage (consider httpOnly cookies for enhanced security)
2. **HTTPS**: Always use HTTPS in production
3. **Token Expiration**: Implement refresh token logic for long-lived sessions
4. **CORS**: Configure strict CORS policies on your backend

## Troubleshooting

### "API base URL not configured"
- Click "API Config" button on login page
- Enter your backend URL
- Save configuration

### "Unauthorized - please login again"
- Your token has expired
- Login again to get a new token

### "Network error: Failed to fetch"
- Check if backend is running
- Verify API base URL is correct
- Check CORS configuration
- Check network connectivity

### Connection Test Fails
- Ensure backend is accessible
- Check for firewall/network issues
- Verify URL format (include protocol: http/https)

### Create Project Not Working

**Symptom:** Clicking "Create Project" doesn't save or shows an error

**Solutions:**

1. **Verify API Configuration:**
   ```javascript
   // In browser console
   console.log(localStorage.getItem('api_base_url'))
   ```
   - Should show your API URL
   - If empty, configure in Settings > API Configuration

2. **Check Authentication:**
   ```javascript
   // In browser console
   console.log(localStorage.getItem('access_token'))
   ```
   - Should have a token
   - If null, you need to login

3. **Test Project Endpoint:**
   ```javascript
   // In browser console
   await apiTest.testProjects()
   ```
   - Should show list of projects
   - Check console for error details

4. **Verify User Role:**
   - Only Manager and Admin users can create projects
   - Employee and HR users don't have "New Project" button

5. **Check Backend Logs:**
   - Look for POST /projects requests
   - Check for validation errors
   - Verify request payload

6. **Common Backend Issues:**
   - CORS not configured for POST requests
   - Authentication middleware failing
   - Database connection issues
   - Missing required fields validation

**Debug Steps:**
```javascript
// 1. Open browser console
// 2. Try to create a project through UI
// 3. Check Network tab for the POST request
// 4. Look at Request Payload
// 5. Check Response status and body

// Or use API test helper:
await apiTest.testProjects()
```

### Data Not Refreshing

If data doesn't update after an operation:
- Component should auto-refresh (implemented in ProjectList)
- Try navigating away and back
- Check if API returned success (200/201)
- Look for errors in console

## Migration from Mock to API

To migrate from mock mode to API mode:

1. Configure API base URL
2. Login with real credentials
3. All integrated components will automatically use API
4. Mock data is only used as fallback when API is not configured

## Next Steps

To complete the integration:

1. Integrate remaining endpoints (timesheets, projects, tasks, etc.)
2. Update components to use API service
3. Add loading states for async operations
4. Implement proper error handling and user feedback
5. Add retry logic for failed requests
6. Implement refresh token mechanism
7. Add offline support (optional)

## Support

For issues or questions about API integration:
- Check the OpenAPI specification provided
- Review component implementations in `/components/`
- Check service layer in `/services/`
