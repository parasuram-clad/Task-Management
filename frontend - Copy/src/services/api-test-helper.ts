// API Test Helper - Use this to test API integration
import { apiConfig } from './api-config';
import { 
  authApi, 
  attendanceApi, 
  projectApi, 
  taskApi, 
  timesheetApi,
  employeeApi,
  reportsApi 
} from './api';

export const testApiConnection = async () => {
  const baseUrl = apiConfig.getBaseUrl();
  
  if (!baseUrl) {
    console.error('❌ API base URL not configured');
    return false;
  }

  console.log(`🔍 Testing API connection to: ${baseUrl}`);

  try {
    const response = await fetch(`${baseUrl}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      console.log('✅ API is reachable (401 expected without auth)');
      return true;
    } else if (response.ok) {
      console.log('✅ API connection successful');
      return true;
    } else {
      console.warn(`⚠️ API responded with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to connect to API:', error);
    return false;
  }
};

export const testAuthentication = async (email: string, password: string) => {
  console.log('🔐 Testing authentication...');
  
  try {
    const response = await authApi.login({ email, password });
    console.log('✅ Login successful:', response);
    
    // Save token
    apiConfig.setAccessToken(response.accessToken);
    
    // Test authenticated request
    const user = await authApi.getMe();
    console.log('✅ Authenticated user data:', user);
    
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    return false;
  }
};

export const testAttendanceEndpoints = async () => {
  console.log('📅 Testing attendance endpoints...');
  
  try {
    // Get today's attendance
    const today = await attendanceApi.getToday();
    console.log('✅ Today\'s attendance:', today);
    
    // Test clock in (might fail if already clocked in)
    try {
      const clockIn = await attendanceApi.clockIn();
      console.log('✅ Clock in successful:', clockIn);
    } catch (error: any) {
      console.warn('⚠️ Clock in failed (might be already clocked in):', error.message);
    }
    
    // Test clock out
    try {
      const clockOut = await attendanceApi.clockOut();
      console.log('✅ Clock out successful:', clockOut);
    } catch (error: any) {
      console.warn('⚠️ Clock out failed:', error.message);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Attendance test failed:', error);
    return false;
  }
};

export const testProjectEndpoints = async () => {
  console.log('📁 Testing project endpoints...');
  
  try {
    // List projects
    const projects = await projectApi.list();
    console.log(`✅ Projects list (${projects.length} projects):`, projects);
    
    // Get first project if available
    if (projects.length > 0) {
      const project = await projectApi.get(projects[0].id);
      console.log('✅ Project details:', project);
    }
    
    // Test create project (comment out in production)
    /*
    const newProject = await projectApi.create({
      name: 'Test Project - API Integration',
      description: 'Created via API test',
      start_date: '2024-11-01',
      end_date: '2024-12-31',
      status: 'active',
    });
    console.log('✅ Project created:', newProject);
    */
    
    return true;
  } catch (error) {
    console.error('❌ Project test failed:', error);
    return false;
  }
};

export const testTaskEndpoints = async () => {
  console.log('✅ Testing task endpoints...');
  
  try {
    // Get my tasks
    const tasks = await taskApi.getMyTasks();
    console.log(`✅ My tasks (${tasks.length} tasks):`, tasks);
    
    return true;
  } catch (error) {
    console.error('❌ Task test failed:', error);
    return false;
  }
};

export const testTimesheetEndpoints = async () => {
  console.log('⏰ Testing timesheet endpoints...');
  
  try {
    // Get current week's timesheet
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(today.setDate(diff));
    const weekStartDate = weekStart.toISOString().split('T')[0];
    
    const timesheet = await timesheetApi.getWeekly(weekStartDate);
    console.log('✅ Weekly timesheet:', timesheet);
    
    return true;
  } catch (error: any) {
    if (error.status === 404) {
      console.warn('⚠️ No timesheet found for current week (expected if not created yet)');
      return true;
    }
    console.error('❌ Timesheet test failed:', error);
    return false;
  }
};

export const runAllTests = async (email?: string, password?: string) => {
  console.log('🚀 Running all API tests...\n');
  
  // Test connection
  const connectionOk = await testApiConnection();
  if (!connectionOk) return;
  
  // Test authentication if credentials provided
  if (email && password) {
    const authOk = await testAuthentication(email, password);
    if (!authOk) return;
  } else {
    console.log('⚠️ Skipping authenticated endpoints (no credentials provided)');
    return;
  }
  
  console.log('\n--- Testing Authenticated Endpoints ---\n');
  
  // Test all endpoints
  await testAttendanceEndpoints();
  console.log('');
  
  await testProjectEndpoints();
  console.log('');
  
  await testTaskEndpoints();
  console.log('');
  
  await testTimesheetEndpoints();
  console.log('');
  
  console.log('✅ All tests completed!');
};

// Make available in browser console for testing
if (typeof window !== 'undefined') {
  (window as any).apiTest = {
    testConnection: testApiConnection,
    testAuth: testAuthentication,
    testAttendance: testAttendanceEndpoints,
    testProjects: testProjectEndpoints,
    testTasks: testTaskEndpoints,
    testTimesheets: testTimesheetEndpoints,
    runAll: runAllTests,
  };
  
  console.log('💡 API test functions available via window.apiTest');
  console.log('   - apiTest.testConnection()');
  console.log('   - apiTest.testAuth(email, password)');
  console.log('   - apiTest.runAll(email, password)');
}
