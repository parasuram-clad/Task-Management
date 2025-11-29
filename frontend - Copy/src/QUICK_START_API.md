# Quick Start - API Integration

## 🚀 Getting Started

### Step 1: Configure API Base URL

#### Option A: From Login Page
1. Open the application
2. Click **"API Config"** button (top-right)
3. Enter your API base URL (e.g., `http://localhost:3000/api`)
4. Click **"Save & Connect"**

#### Option B: From Settings (After Login)
1. Login to the application
2. Navigate to **Settings** from sidebar
3. Click **"API Configuration"** tab
4. Enter your API base URL
5. Click **"Save Configuration"**
6. Optionally click **"Test Connection"** to verify

### Step 2: Login

**With API Configured:**
- Use your backend credentials
- System automatically authenticates against your API

**Without API (Mock Mode):**
- `employee@company.com` / `password`
- `manager@company.com` / `password`
- `hr@company.com` / `password`
- `admin@company.com` / `password`

---

## ✅ What's Currently Integrated

### 🔐 Authentication
- Login with email/password
- JWT token management
- Automatic token refresh
- Logout functionality

### 📅 Attendance
- View today's attendance status
- Clock in/out functionality
- Auto-fetch on component load
- Real-time hour calculation

### ⏰ Timesheets
- View weekly timesheet
- Save as draft
- Submit for approval
- Week navigation with auto-fetch

### 📁 Projects
- List all projects
- View project details
- **Create new projects** ✨
- Update project information
- Automatic refresh after changes

### ✅ Tasks
- View assigned tasks
- See task details with project info
- Status and priority display

---

## 🧪 Testing Your API Integration

### Using Browser Console

The application includes built-in API testing tools. Open browser console and use:

```javascript
// Test API connection
await apiTest.testConnection()

// Test authentication
await apiTest.testAuth('your@email.com', 'your-password')

// Test all endpoints (with auth)
await apiTest.runAll('your@email.com', 'your-password')

// Test individual modules
await apiTest.testAttendance()
await apiTest.testProjects()
await apiTest.testTasks()
await apiTest.testTimesheets()
```

### Expected Responses

**✅ Success:**
```
✅ API is reachable
✅ Login successful
✅ Projects list (5 projects)
✅ All tests completed!
```

**❌ Common Issues:**

1. **"API base URL not configured"**
   - Solution: Configure API URL in settings

2. **"Network error: Failed to fetch"**
   - Check if backend is running
   - Verify URL is correct
   - Check CORS configuration

3. **"Unauthorized - please login again"**
   - Token expired, login again

---

## 📋 Feature Status by Module

### Fully Integrated ✅
- [x] Login/Authentication
- [x] My Attendance (Clock In/Out)
- [x] Project List & Details
- [x] Create/Edit Projects
- [x] My Tasks
- [x] Timesheet (View/Save/Submit)

### Using Mock Data (fallback) ⏳
- [ ] Attendance Calendar
- [ ] Team Attendance
- [ ] Timesheet Approval
- [ ] Task CRUD operations
- [ ] Employee Directory
- [ ] Reports

---

## 🔧 For Developers

### Adding API Integration to New Components

1. **Import API services:**
```typescript
import { projectApi, Project } from '../../services/api';
import { apiConfig } from '../../services/api-config';
import { ApiError } from '../../services/api-client';
```

2. **Check if API is configured:**
```typescript
const useApi = apiConfig.hasBaseUrl();
```

3. **Fetch data with error handling:**
```typescript
const fetchData = async () => {
  if (!useApi) return; // Use mock data
  
  try {
    const data = await projectApi.list();
    setData(data);
  } catch (error) {
    if (error instanceof ApiError) {
      toast.error(`Failed: ${error.message}`);
    }
  }
};
```

4. **Add loading states:**
```typescript
const [isLoading, setIsLoading] = useState(false);

// In fetch function
setIsLoading(true);
try {
  // ... API call
} finally {
  setIsLoading(false);
}
```

### API Service Structure

```
/services
├── api-config.ts       - Config & token management
├── api-client.ts       - HTTP client
├── api.ts              - All API endpoints
└── api-test-helper.ts  - Testing utilities
```

---

## 🎯 Common Use Cases

### Creating a New Project

1. Navigate to **Projects** from sidebar
2. Click **"New Project"** button (Manager/Admin only)
3. Fill in project details:
   - Project Name (required)
   - Client (optional)
   - Description (optional)
   - Start Date (required)
   - End Date (required)
   - Status (active/on-hold/completed)
4. Click **"Create Project"**
5. ✅ Project is created and list refreshes automatically

### Tracking Attendance

1. Navigate to **Attendance > My Attendance**
2. Click **"Check In"** button
3. System records timestamp to API
4. Work during the day
5. Click **"Check Out"** when leaving
6. System calculates total hours worked

### Submitting Timesheet

1. Navigate to **Timesheet > My Timesheet**
2. Select week using navigation arrows
3. Add project/task entries
4. Fill in hours for each day
5. Click **"Save Draft"** to save progress
6. Click **"Submit"** when ready for approval
7. ✅ Timesheet submitted to manager

---

## 📡 API Endpoints Reference

### Authentication
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout

### Attendance
- `GET /attendance/me/today` - Today's status
- `POST /attendance/me/clock-in` - Clock in
- `POST /attendance/me/clock-out` - Clock out

### Timesheets
- `GET /timesheets/me?weekStartDate=YYYY-MM-DD` - Get weekly
- `POST /timesheets/me/save` - Save draft
- `POST /timesheets/me/submit` - Submit

### Projects
- `GET /projects` - List all
- `GET /projects/:id` - Get details
- `POST /projects` - Create
- `PUT /projects/:id` - Update

### Tasks
- `GET /tasks/me` - My tasks
- `GET /tasks/project/:projectId` - Project tasks

---

## 🔒 Security Notes

- JWT tokens stored in localStorage
- Tokens automatically attached to requests
- 401 responses trigger re-login
- Always use HTTPS in production

---

## 💡 Tips

1. **Test connection first** using the "Test Connection" button in settings
2. **Check browser console** for detailed API logs
3. **Use mock mode** for development without backend
4. **Clear configuration** if switching between environments
5. **Check API_INTEGRATION.md** for detailed documentation

---

## 🆘 Getting Help

### Issue: Project creation not working

**Checklist:**
- ✅ API URL configured correctly?
- ✅ Logged in with valid credentials?
- ✅ User has Manager/Admin role?
- ✅ Backend server running?
- ✅ Check browser console for errors

**Debug:**
```javascript
// In browser console
apiTest.testProjects()
```

### Issue: Data not loading

**Checklist:**
- ✅ API configured?
- ✅ Token valid? (try re-login)
- ✅ Correct endpoint path?
- ✅ CORS enabled on backend?

**Debug:**
```javascript
// Check configuration
console.log('API URL:', localStorage.getItem('api_base_url'))
console.log('Token:', localStorage.getItem('access_token'))
```

---

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Review API_INTEGRATION.md
3. Use `apiTest` utilities for debugging
4. Check backend API logs
