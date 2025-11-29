# Testing Checklist - API Integration

## ✅ Project Creation Feature

### Prerequisites
- [ ] Backend API is running
- [ ] API base URL configured in app
- [ ] Logged in as Manager or Admin user
- [ ] Browser console open (F12)

### Step-by-Step Test

#### 1. Configure API
- [ ] Click "API Config" on login page OR go to Settings > API Configuration
- [ ] Enter API base URL (e.g., `http://localhost:3000/api`)
- [ ] Click "Save Configuration"
- [ ] Click "Test Connection" - should show success message
- [ ] Verify in console: `localStorage.getItem('api_base_url')` returns your URL

#### 2. Login
- [ ] Enter valid credentials
- [ ] Click "Login"
- [ ] Should see "Welcome back, [Name]!" message
- [ ] Verify in console: `localStorage.getItem('access_token')` returns a token

#### 3. Navigate to Projects
- [ ] Click "Projects" in sidebar
- [ ] Should see "Projects" page with project list
- [ ] Should see "New Project" button (Manager/Admin only)
- [ ] Existing projects should load from API (check console for API calls)

#### 4. Create New Project
- [ ] Click "New Project" button
- [ ] Dialog should open with form fields
- [ ] Fill in required fields:
  - **Project Name:** Test Project - [Your Name]
  - **Client:** Test Client Inc.
  - **Description:** Testing API integration for project creation
  - **Start Date:** 2024-11-01
  - **End Date:** 2024-12-31
  - **Status:** Active
- [ ] Click "Create Project" button
- [ ] Button should show "Creating..." while processing
- [ ] Should see success toast: "Project created successfully"
- [ ] Dialog should close
- [ ] Project list should refresh automatically
- [ ] New project should appear in the list

#### 5. Verify in Browser Console

**Check Network Tab:**
- [ ] Find POST request to `/projects`
- [ ] Status should be 200 or 201
- [ ] Request payload should contain your project data
- [ ] Response should contain created project with ID

**Check Console Logs:**
- [ ] No error messages
- [ ] API calls completed successfully

**Verify Data:**
```javascript
// In console - should show your new project
await apiTest.testProjects()
```

#### 6. Verify Project Details
- [ ] Click on the newly created project
- [ ] Should navigate to project detail page
- [ ] All fields should match what you entered
- [ ] Project ID should be assigned by backend

---

## 🧪 Additional API Tests

### Test Attendance
```javascript
// In browser console
await apiTest.testAttendance()
```
**Expected:**
- [ ] ✅ Today's attendance: { status, check_in_at, check_out_at }
- [ ] ✅ Clock in successful (or warning if already clocked in)
- [ ] ✅ Clock out successful (or error if not clocked in)

### Test Tasks
```javascript
await apiTest.testTasks()
```
**Expected:**
- [ ] ✅ My tasks (X tasks): [array of tasks]

### Test Timesheets
```javascript
await apiTest.testTimesheets()
```
**Expected:**
- [ ] ✅ Weekly timesheet: { entries, status }
- [ ] OR ⚠️ No timesheet found (if none created yet)

### Test Full Suite
```javascript
await apiTest.runAll('your@email.com', 'your-password')
```
**Expected:**
- [ ] ✅ API is reachable
- [ ] ✅ Login successful
- [ ] ✅ All endpoint tests pass

---

## 🐛 Common Issues & Solutions

### Issue: "API base URL not configured"
**Solution:**
1. Go to Settings > API Configuration
2. Enter your API URL
3. Save and test connection

### Issue: "Unauthorized" error
**Solution:**
1. Clear localStorage: `localStorage.clear()`
2. Refresh page
3. Configure API URL again
4. Login with valid credentials

### Issue: CORS error in console
**Solution:**
Backend needs CORS configuration:
```javascript
// Express.js example
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));
```

### Issue: Project creation fails silently
**Debug:**
1. Open Network tab
2. Look for POST /projects request
3. Check status code:
   - **400:** Validation error (check request payload)
   - **401:** Not authenticated (re-login)
   - **403:** Forbidden (check user role)
   - **500:** Server error (check backend logs)

### Issue: Projects list doesn't refresh
**Solution:**
- Should auto-refresh after creation
- If not, navigate away and back
- Check if POST request succeeded
- Look for JavaScript errors in console

### Issue: Cannot see "New Project" button
**Check:**
- User role must be Manager or Admin
- Employee and HR roles don't have create permission
- Login as different user if needed

---

## 📊 Test Results Template

```
Date: [DATE]
Tester: [YOUR NAME]
Environment: [Development/Staging/Production]
API Base URL: [URL]

✅ PASS | ❌ FAIL | ⚠️ PARTIAL

[ ] API Configuration
[ ] User Authentication
[ ] Project List Loading
[ ] Project Creation
[ ] Project Details
[ ] Attendance Clock In/Out
[ ] Task List
[ ] Timesheet Management

Notes:
- [Any issues encountered]
- [Performance observations]
- [Suggestions for improvement]

Overall Status: ✅ PASS / ❌ FAIL
```

---

## 🔍 Advanced Debugging

### Enable Detailed Logging

Add to browser console:
```javascript
// Monitor all fetch requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('🌐 Fetch:', args[0], args[1]);
  return originalFetch.apply(this, args)
    .then(response => {
      console.log('📥 Response:', response.status, response.url);
      return response;
    });
};
```

### Check API Configuration
```javascript
console.log('API Config:', {
  baseUrl: localStorage.getItem('api_base_url'),
  hasToken: !!localStorage.getItem('access_token'),
  tokenPreview: localStorage.getItem('access_token')?.substring(0, 20) + '...'
});
```

### Manually Test Endpoint
```javascript
const baseUrl = localStorage.getItem('api_base_url');
const token = localStorage.getItem('access_token');

fetch(`${baseUrl}/projects`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Manual Test Project',
    start_date: '2024-11-01',
    end_date: '2024-12-31',
    status: 'active'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

---

## ✅ Success Criteria

A successful API integration should:

1. **Connect to API**
   - Test connection succeeds
   - Proper CORS configuration
   - SSL/TLS if using HTTPS

2. **Authenticate Users**
   - Login works with valid credentials
   - JWT token stored and used
   - Unauthorized requests handled gracefully

3. **CRUD Operations**
   - Create: New projects save to backend
   - Read: Projects load from API
   - Update: Project edits persist
   - Delete: (When implemented)

4. **Error Handling**
   - User-friendly error messages
   - Network errors caught
   - 401/403 handled appropriately
   - Validation errors displayed

5. **User Experience**
   - Loading states shown
   - Success feedback given
   - Data refreshes automatically
   - No console errors

---

## 📝 Report Template

```markdown
## API Integration Test Report

**Date:** 2024-11-07
**Tester:** [Name]
**Backend URL:** http://localhost:3000/api

### Configuration
- [x] API URL configured
- [x] Connection test passed
- [x] CORS enabled

### Authentication
- [x] Login successful
- [x] Token stored
- [x] Protected endpoints accessible

### Projects Module
- [x] List projects from API
- [x] Create new project
- [x] View project details
- [x] Update project
- [ ] Delete project (not implemented)

### Attendance Module
- [x] View today's status
- [x] Clock in
- [x] Clock out

### Timesheet Module
- [x] View weekly timesheet
- [x] Save draft
- [x] Submit for approval

### Tasks Module
- [x] View my tasks
- [ ] Create task (pending)
- [ ] Update task (pending)

### Issues Found
1. [Description]
   - Severity: High/Medium/Low
   - Status: Open/Resolved

### Recommendations
- [Suggestion 1]
- [Suggestion 2]

### Overall Assessment
✅ Ready for [Development/Testing/Production]
❌ Needs fixes before [Next Phase]
```
