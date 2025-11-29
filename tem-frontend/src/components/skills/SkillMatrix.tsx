import { useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Download, Filter, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { mockEmployeeSkills, mockSkills } from '../../data/mockSkills';
import { ProficiencyLevel } from '../../types/skills';
import { toast } from 'sonner@2.0.3';

interface SkillMatrixProps {
  user: User;
}

// Mock employees
const mockEmployees = [
  { id: 2, name: 'Sarah Johnson', role: 'Senior Frontend Developer', location: 'New York' },
  { id: 3, name: 'Mike Chen', role: 'Backend Developer', location: 'San Francisco' },
  { id: 4, name: 'Emily Davis', role: 'UX Designer', location: 'Boston' },
  { id: 5, name: 'James Wilson', role: 'DevOps Engineer', location: 'Seattle' },
  { id: 6, name: 'Lisa Anderson', role: 'Full Stack Developer', location: 'Austin' },
];

export function SkillMatrix({ user }: SkillMatrixProps) {
  const [scopeType, setScopeType] = useState('team');
  const [scopeValue, setScopeValue] = useState('Frontend Squad A');
  const [selectedSkills, setSelectedSkills] = useState<number[]>([1, 2, 5, 8]); // React, TypeScript, Node, AWS

  const getProficiencyColor = (proficiency: ProficiencyLevel | null) => {
    if (!proficiency) return 'bg-gray-100 text-gray-400';
    
    const colors: Record<ProficiencyLevel, string> = {
      'Beginner': 'bg-yellow-100 text-yellow-700',
      'Intermediate': 'bg-blue-100 text-blue-700',
      'Advanced': 'bg-purple-100 text-purple-700',
      'Expert': 'bg-green-100 text-green-700',
    };
    
    return colors[proficiency];
  };

  const getProficiencyDot = (proficiency: ProficiencyLevel | null) => {
    if (!proficiency) return null;
    
    const colors: Record<ProficiencyLevel, string> = {
      'Beginner': 'bg-yellow-500',
      'Intermediate': 'bg-blue-500',
      'Advanced': 'bg-purple-500',
      'Expert': 'bg-green-500',
    };
    
    return <div className={`w-3 h-3 rounded-full ${colors[proficiency]}`} />;
  };

  const getEmployeeSkill = (employeeId: number, skillId: number) => {
    return mockEmployeeSkills.find(
      s => s.employee_id === employeeId && s.skill_id === skillId && s.status === 'Verified'
    );
  };

  const selectedSkillsData = mockSkills.filter(s => selectedSkills.includes(s.id));

  // Calculate insights
  const insights = selectedSkillsData.map(skill => {
    const employeesWithSkill = mockEmployees.filter(emp =>
      getEmployeeSkill(emp.id, skill.id)
    );
    const experts = employeesWithSkill.filter(emp =>
      getEmployeeSkill(emp.id, skill.id)?.proficiency === 'Expert'
    );
    const belowAdvanced = employeesWithSkill.filter(emp => {
      const empSkill = getEmployeeSkill(emp.id, skill.id);
      return empSkill && (empSkill.proficiency === 'Beginner' || empSkill.proficiency === 'Intermediate');
    });

    return {
      skill: skill.name,
      totalWithSkill: employeesWithSkill.length,
      experts: experts.length,
      belowAdvanced: belowAdvanced.length,
      expertNames: experts.map(e => e.name),
    };
  });

  const handleExport = () => {
    toast.success('Skill matrix exported to CSV');
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl mb-2">Skill Matrix</h1>
            <p className="text-muted-foreground">
              Visualize team skills and identify gaps for resource planning
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-2">
            <Select value={scopeType} onValueChange={setScopeType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="team">By Team</SelectItem>
                <SelectItem value="department">By Department</SelectItem>
                <SelectItem value="project">By Project</SelectItem>
              </SelectContent>
            </Select>

            <Select value={scopeValue} onValueChange={setScopeValue}>
              <SelectTrigger className="w-60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Frontend Squad A">Frontend Squad A</SelectItem>
                <SelectItem value="Backend Team">Backend Team</SelectItem>
                <SelectItem value="DevOps Team">DevOps Team</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Showing {mockEmployees.length} employees
            </p>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {insights.slice(0, 3).map((insight) => (
          <Card key={insight.skill}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium">{insight.skill}</p>
                <Badge variant="outline">{insight.totalWithSkill}/{mockEmployees.length}</Badge>
              </div>
              {insight.experts > 0 && (
                <p className="text-sm text-green-600">
                  {insight.experts} Expert{insight.experts > 1 ? 's' : ''}: {insight.expertNames.join(', ')}
                </p>
              )}
              {insight.belowAdvanced > 0 && (
                <p className="text-sm text-yellow-600">
                  {insight.belowAdvanced} below Advanced level
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Matrix */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Skill Matrix: {scopeValue}</CardTitle>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Expert</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-muted-foreground">Advanced</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">Intermediate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-muted-foreground">Beginner</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium sticky left-0 bg-white z-10 min-w-[200px]">
                    Employee
                  </th>
                  {selectedSkillsData.map(skill => (
                    <th key={skill.id} className="text-center p-3 font-medium min-w-[120px]">
                      <div className="flex flex-col items-center gap-1">
                        <span>{skill.name}</span>
                        <Badge variant="outline" className="text-xs">{skill.category}</Badge>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockEmployees.map(employee => (
                  <tr key={employee.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 sticky left-0 bg-white">
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">{employee.role}</p>
                        <p className="text-xs text-muted-foreground">{employee.location}</p>
                      </div>
                    </td>
                    {selectedSkillsData.map(skill => {
                      const employeeSkill = getEmployeeSkill(employee.id, skill.id);
                      
                      return (
                        <td key={skill.id} className="p-3 text-center">
                          {employeeSkill ? (
                            <div className="group relative inline-flex flex-col items-center gap-1">
                              {getProficiencyDot(employeeSkill.proficiency)}
                              <Badge
                                variant="secondary"
                                className={`text-xs ${getProficiencyColor(employeeSkill.proficiency)}`}
                              >
                                {employeeSkill.proficiency[0]}
                              </Badge>
                              
                              {/* Tooltip on hover */}
                              <div className="absolute bottom-full mb-2 hidden group-hover:block z-20">
                                <div className="bg-gray-900 text-white text-xs rounded p-2 whitespace-nowrap">
                                  <p className="font-medium">{employeeSkill.proficiency}</p>
                                  <p>Self: {employeeSkill.self_rating}/5</p>
                                  {employeeSkill.manager_rating && (
                                    <p>Manager: {employeeSkill.manager_rating}/5</p>
                                  )}
                                  <p>{employeeSkill.years_of_experience} years</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
