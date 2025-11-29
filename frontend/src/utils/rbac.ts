import { User, UserRole } from '../App';

// Define manager-employee relationships (in real app, this comes from API)
const managerTeams: Record<string, string[]> = {
  '3': ['2', '6'], // Mike Chen manages Sarah Johnson and Lisa Anderson
  '2': ['4'], // Sarah Johnson manages Emily Davis
  '5': ['7', '8'], // James Wilson manages his team
};

/**
 * Check if user can access employee details
 */
export function canAccessEmployeeDetails(user: User, employeeId: string): boolean {
  // Admin and HR can access all employees
  if (user.role === 'admin' || user.role === 'hr') {
    return true;
  }

  // Employee can access their own data
  if (user.id === employeeId) {
    return true;
  }

  // Manager can access their direct reports
  if (user.role === 'manager') {
    const teamMembers = managerTeams[user.id] || [];
    return teamMembers.includes(employeeId);
  }

  return false;
}

/**
 * Check if user can access employee skills
 */
export function canAccessEmployeeSkills(user: User, employeeId: string): boolean {
  // Same logic as employee details - admin, HR, self, or manager can access
  return canAccessEmployeeDetails(user, employeeId);
}

/**
 * Check if user can edit employee skills
 */
export function canEditEmployeeSkills(user: User, employeeId: string): boolean {
  // Only the employee themselves can edit their own skills
  return user.id === employeeId;
}

/**
 * Check if user can approve employee skills
 */
export function canApproveEmployeeSkills(user: User, employeeId: string): boolean {
  // Only managers of the employee or admin can approve
  if (user.role === 'admin') {
    return true;
  }

  if (user.role === 'manager') {
    const teamMembers = managerTeams[user.id] || [];
    return teamMembers.includes(employeeId);
  }

  return false;
}

/**
 * Get list of employees the user can access
 */
export function getAccessibleEmployees(user: User, allEmployeeIds: string[]): string[] {
  // Admin and HR can access all
  if (user.role === 'admin' || user.role === 'hr') {
    return allEmployeeIds;
  }

  // Manager can access their team
  if (user.role === 'manager') {
    const teamMembers = managerTeams[user.id] || [];
    return [user.id, ...teamMembers]; // Include self
  }

  // Employee can only access themselves
  return [user.id];
}

/**
 * Check if user can access projects
 */
export function canAccessProjects(user: User): boolean {
  // HR cannot access projects
  return user.role !== 'hr';
}

/**
 * Check if user can access leads
 */
export function canAccessLeads(user: User): boolean {
  // HR cannot access leads
  // Only manager and admin have access
  return user.role === 'admin' || user.role === 'manager';
}

/**
 * Check if user can access specific project
 */
export function canAccessProject(user: User, projectId: string): boolean {
  // HR cannot access projects
  if (user.role === 'hr') {
    return false;
  }

  // For simplicity, admin and manager can access all projects
  // Employee would need to be a member of the project (would check in real app)
  return true;
}

/**
 * Check if user can access lead details
 */
export function canAccessLeadDetails(user: User, leadId: string): boolean {
  // HR cannot access leads
  if (user.role === 'hr') {
    return false;
  }

  // Manager and admin can access
  return user.role === 'admin' || user.role === 'manager';
}

/**
 * Check if user can access employee directory
 */
export function canAccessEmployeeDirectory(user: User): boolean {
  // All authenticated users can access employee directory
  // But they'll see filtered results based on their role
  return true;
}

/**
 * Check if user can access skill catalog
 */
export function canAccessSkillCatalog(user: User): boolean {
  // All users can view skill catalog
  return true;
}

/**
 * Check if user can edit skill catalog
 */
export function canEditSkillCatalog(user: User): boolean {
  // Only admin and HR can edit skill catalog
  return user.role === 'admin' || user.role === 'hr';
}

/**
 * Check if user can access skill matrix
 */
export function canAccessSkillMatrix(user: User): boolean {
  // Manager, admin, and HR can access skill matrix
  return user.role === 'admin' || user.role === 'hr' || user.role === 'manager';
}

/**
 * Check if user can access team structure
 */
export function canAccessTeamStructure(user: User): boolean {
  // Manager, admin, and HR can access team structure
  return user.role === 'admin' || user.role === 'hr' || user.role === 'manager';
}

/**
 * Check if user can access reports
 */
export function canAccessReports(user: User): boolean {
  // HR, Manager, and Admin can access reports
  return user.role === 'hr' || user.role === 'manager' || user.role === 'admin';
}

/**
 * Check if user can access company settings
 */
export function canAccessCompanySettings(user: User): boolean {
  // Only admin can access company settings
  return user.role === 'admin';
}

/**
 * Filter navigation items based on user role
 */
export function filterNavigationByRole(user: User, navItems: any[]): any[] {
  return navItems.filter(item => {
    // Check role-based restrictions
    if (item.id === 'projects' && !canAccessProjects(user)) {
      return false;
    }
    if (item.id === 'leads' && !canAccessLeads(user)) {
      return false;
    }
    if (item.id === 'skill-matrix' && !canAccessSkillMatrix(user)) {
      return false;
    }
    if (item.id === 'team-structure' && !canAccessTeamStructure(user)) {
      return false;
    }
    if (item.id === 'reports' && !canAccessReports(user)) {
      return false;
    }
    if (item.id === 'company-settings' && !canAccessCompanySettings(user)) {
      return false;
    }

    return true;
  });
}

/**
 * Get manager's team member IDs
 */
export function getManagerTeamMembers(managerId: string): string[] {
  return managerTeams[managerId] || [];
}

/**
 * Check if employee is managed by user
 */
export function isDirectReport(managerId: string, employeeId: string): boolean {
  const teamMembers = managerTeams[managerId] || [];
  return teamMembers.includes(employeeId);
}
