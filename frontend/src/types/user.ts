// types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'hr' | 'admin' | 'finance' | 'accounts';
  employeeId: string;
  department: string;
  designation: string;
  avatar?: string;
  is_super_admin?: boolean;
}