// Skills & Competencies Type Definitions

export type SkillCategory = 'Technical' | 'Domain' | 'Soft Skills' | 'Tools' | 'Languages' | 'Other';

export type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type SkillStatus = 'Pending' | 'Verified' | 'Rejected';

export interface Skill {
  id: number;
  name: string;
  category: SkillCategory;
  description: string;
  tags: string[];
  default_guidelines?: string;
  is_active: boolean;
  created_at: string;
}

export interface EmployeeSkill {
  id: number;
  employee_id: number;
  skill_id: number;
  skill_name: string;
  category: SkillCategory;
  proficiency: ProficiencyLevel;
  years_of_experience: number;
  last_used: string; // date string
  self_rating: number; // 1-5
  manager_rating?: number; // 1-5
  status: SkillStatus;
  evidence?: string;
  created_at: string;
  updated_at: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
}

export interface SkillHistoryEntry {
  id: number;
  employee_skill_id: number;
  action: 'created' | 'updated' | 'approved' | 'rejected';
  changed_by: number;
  changed_by_name: string;
  changes: {
    field: string;
    old_value: any;
    new_value: any;
  }[];
  comment?: string;
  timestamp: string;
}

export interface TeamSkillMatrix {
  employee_id: number;
  employee_name: string;
  role: string;
  location: string;
  skills: {
    skill_id: number;
    skill_name: string;
    proficiency: ProficiencyLevel;
    self_rating: number;
    manager_rating?: number;
    years_of_experience: number;
  }[];
}

export interface OrgNode {
  id: number;
  employee_id: number;
  name: string;
  role: string;
  team_name: string;
  primary_skills: string[];
  reports: OrgNode[];
  skill_count: number;
  team_member_count: number;
}
