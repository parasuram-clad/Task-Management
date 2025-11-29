import { useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ChevronRight, ChevronDown, Users, Award, MapPin } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { mockEmployeeSkills } from '../../data/mockSkills';

interface SkillMatrixProps {
  user: User;
  navigateTo?: (page: string, params?: any) => void;
}

interface OrgNodeData {
  id: number;
  employee_id: number;
  name: string;
  role: string;
  team_name: string;
  primary_skills: string[];
  reports: OrgNodeData[];
  isExpanded?: boolean;
}

// Mock org structure
const mockOrgStructure: OrgNodeData = {
  id: 1,
  employee_id: 1,
  name: 'John Doe',
  role: 'CTO',
  team_name: 'Engineering',
  primary_skills: ['Leadership', 'Architecture'],
  reports: [
    {
      id: 2,
      employee_id: 3,
      name: 'Mike Chen',
      role: 'Engineering Manager',
      team_name: 'Backend Team',
      primary_skills: ['Python', 'AWS', 'Node.js'],
      reports: [
        {
          id: 3,
          employee_id: 6,
          name: 'Lisa Anderson',
          role: 'Full Stack Developer',
          team_name: 'Backend Team',
          primary_skills: ['Python', 'React'],
          reports: [],
        },
      ],
    },
    {
      id: 4,
      employee_id: 2,
      name: 'Sarah Johnson',
      role: 'Frontend Lead',
      team_name: 'Frontend Squad A',
      primary_skills: ['React', 'TypeScript', 'AWS'],
      reports: [
        {
          id: 5,
          employee_id: 4,
          name: 'Emily Davis',
          role: 'UX Designer',
          team_name: 'Frontend Squad A',
          primary_skills: ['Figma', 'Communication'],
          reports: [],
        },
      ],
    },
    {
      id: 6,
      employee_id: 5,
      name: 'James Wilson',
      role: 'DevOps Manager',
      team_name: 'DevOps Team',
      primary_skills: ['AWS', 'Docker', 'Kubernetes'],
      reports: [],
    },
  ],
};

export function TeamStructure({ user, navigateTo }: SkillMatrixProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set([1, 2, 4]));
  const [selectedNode, setSelectedNode] = useState<OrgNodeData | null>(mockOrgStructure.reports[1]); // Sarah's team
  const [viewMode, setViewMode] = useState<'org-chart' | 'team-list'>('org-chart');

  const toggleNode = (nodeId: number) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const getTeamMembers = (node: OrgNodeData): OrgNodeData[] => {
    const members: OrgNodeData[] = [node];
    const addReports = (n: OrgNodeData) => {
      n.reports.forEach(report => {
        members.push(report);
        addReports(report);
      });
    };
    addReports(node);
    return members;
  };

  const getEmployeeSkills = (employeeId: number) => {
    return mockEmployeeSkills
      .filter(s => s.employee_id === employeeId && s.status === 'Verified')
      .sort((a, b) => {
        const profOrder = { 'Expert': 4, 'Advanced': 3, 'Intermediate': 2, 'Beginner': 1 };
        return profOrder[b.proficiency] - profOrder[a.proficiency];
      })
      .slice(0, 5);
  };

  const getSkillHeatmap = (members: OrgNodeData[]) => {
    const skillCounts: Record<string, number> = {};
    
    members.forEach(member => {
      const skills = getEmployeeSkills(member.employee_id);
      skills.forEach(skill => {
        if (skill.proficiency === 'Advanced' || skill.proficiency === 'Expert') {
          skillCounts[skill.skill_name] = (skillCounts[skill.skill_name] || 0) + 1;
        }
      });
    });

    return Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  };

  const renderNode = (node: OrgNodeData, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasReports = node.reports.length > 0;
    const isSelected = selectedNode?.id === node.id;

    return (
      <div key={node.id} className="mb-2">
        <div
          className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
            isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
          }`}
          style={{ marginLeft: `${level * 24}px` }}
          onClick={() => setSelectedNode(node)}
        >
          {hasReports && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          {!hasReports && <div className="w-6" />}

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{node.name}</p>
              <Badge variant="outline" className="text-xs">{node.role}</Badge>
              {hasReports && (
                <Badge variant="secondary" className="text-xs">
                  {node.reports.length + 1} members
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-muted-foreground">{node.team_name}</p>
              {node.primary_skills.length > 0 && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <div className="flex gap-1">
                    {node.primary_skills.slice(0, 3).map(skill => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {isExpanded && hasReports && (
          <div className="mt-2">
            {node.reports.map(report => renderNode(report, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const teamMembers = selectedNode ? getTeamMembers(selectedNode) : [];
  const skillHeatmap = getSkillHeatmap(teamMembers);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl mb-2">Team Structure & Org Chart</h1>
            <p className="text-muted-foreground">
              Visualize reporting structure and team skills
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'org-chart' ? 'default' : 'outline'}
              onClick={() => setViewMode('org-chart')}
            >
              Org Chart
            </Button>
            <Button
              variant={viewMode === 'team-list' ? 'default' : 'outline'}
              onClick={() => setViewMode('team-list')}
            >
              Team List
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Org Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Organization Structure</CardTitle>
            </CardHeader>
            <CardContent>
              {renderNode(mockOrgStructure)}
            </CardContent>
          </Card>
        </div>

        {/* Right: Team Details */}
        <div className="space-y-6">
          {selectedNode && (
            <>
              {/* Team Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Team Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Team</p>
                    <p className="font-medium">{selectedNode.team_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Manager</p>
                    <p className="font-medium">{selectedNode.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Members</p>
                    <p className="font-medium">{teamMembers.length}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Skill Heatmap */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Team Skill Heatmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {skillHeatmap.map(([skill, count]) => (
                      <div key={skill}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{skill}</span>
                          <span className="text-muted-foreground">{count} members</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${(count / teamMembers.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {skillHeatmap.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No advanced skills recorded
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Team Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Team Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {teamMembers.map(member => {
                      const skills = getEmployeeSkills(member.employee_id);
                      const primarySkills = skills.slice(0, 2);
                      const secondarySkills = skills.slice(2, 4);

                      return (
                        <div key={member.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-muted-foreground">{member.role}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7"
                              onClick={() => navigateTo?.('employee-detail', { employeeId: member.employee_id, tab: 'skills' })}
                            >
                              View Profile
                            </Button>
                          </div>
                          
                          {primarySkills.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs text-muted-foreground mb-1">Primary Skills</p>
                              <div className="flex flex-wrap gap-1">
                                {primarySkills.map(skill => (
                                  <Badge key={skill.id} variant="default" className="text-xs">
                                    {skill.skill_name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {secondarySkills.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Secondary Skills</p>
                              <div className="flex flex-wrap gap-1">
                                {secondarySkills.map(skill => (
                                  <Badge key={skill.id} variant="outline" className="text-xs">
                                    {skill.skill_name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
