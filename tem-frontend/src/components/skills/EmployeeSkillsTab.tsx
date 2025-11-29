import { useState, useMemo } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Plus,
  Search,
  Filter,
  Edit,
  History,
  Check,
  X,
  Star,
  StarOff,
  TrendingUp,
  Award,
  Clock,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { SkillModal } from './SkillModal';
import { SkillHistoryDrawer } from './SkillHistoryDrawer';
import { SkillApprovalModal } from './SkillApprovalModal';
import { mockEmployeeSkills, mockSkills } from '../../data/mockSkills';
import { EmployeeSkill, SkillCategory, ProficiencyLevel, SkillStatus } from '../../types/skills';
import { canEditEmployeeSkills, canApproveEmployeeSkills } from '../../utils/rbac';

interface EmployeeSkillsTabProps {
  user: User;
  employeeId: number;
  employeeName: string;
  employeeRole: string;
  department: string;
  location: string;
  managerName?: string;
  isManager?: boolean;
}

export function EmployeeSkillsTab({
  user,
  employeeId,
  employeeName,
  employeeRole,
  department,
  location,
  managerName,
  isManager = false,
}: EmployeeSkillsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [proficiencyFilter, setProficiencyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<EmployeeSkill | null>(null);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [selectedSkillForHistory, setSelectedSkillForHistory] = useState<number | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedSkillForApproval, setSelectedSkillForApproval] = useState<EmployeeSkill | null>(null);

  // Get employee skills
  const employeeSkills = mockEmployeeSkills.filter(s => s.employee_id === employeeId);

  // Calculate skill stats
  const skillStats = useMemo(() => {
    const categoryCount: Record<string, number> = {};
    let technicalDepth = 0;
    let domainExpertise = 0;
    let leadershipScore = 0;
    let totalVerified = 0;

    employeeSkills.forEach(skill => {
      categoryCount[skill.category] = (categoryCount[skill.category] || 0) + 1;

      if (skill.status === 'Verified') {
        totalVerified++;
        const proficiencyScore = {
          'Beginner': 1,
          'Intermediate': 2,
          'Advanced': 3,
          'Expert': 4,
        }[skill.proficiency] || 0;

        if (skill.category === 'Technical' || skill.category === 'Tools') {
          technicalDepth += proficiencyScore;
        } else if (skill.category === 'Domain') {
          domainExpertise += proficiencyScore;
        } else if (skill.category === 'Soft Skills') {
          leadershipScore += proficiencyScore;
        }
      }
    });

    return {
      categoryCount,
      technicalDepth: Math.min((technicalDepth / (employeeSkills.length * 4)) * 100, 100),
      domainExpertise: Math.min((domainExpertise / (employeeSkills.length * 4)) * 100, 100),
      leadershipScore: Math.min((leadershipScore / (employeeSkills.length * 4)) * 100, 100),
      totalSkills: employeeSkills.length,
      verifiedSkills: totalVerified,
    };
  }, [employeeSkills]);

  // Get primary skill
  const primarySkill = employeeSkills.find(s => s.proficiency === 'Expert') || employeeSkills[0];

  // Filter skills
  const filteredSkills = employeeSkills.filter(skill => {
    const matchesSearch = skill.skill_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || skill.category === categoryFilter;
    const matchesProficiency = proficiencyFilter === 'all' || skill.proficiency === proficiencyFilter;
    const matchesStatus = statusFilter === 'all' || skill.status === statusFilter;
    const matchesSelectedCategory = !selectedCategory || skill.category === selectedCategory;

    return matchesSearch && matchesCategory && matchesProficiency && matchesStatus && matchesSelectedCategory;
  });

  // Get pending approvals (for managers)
  const pendingApprovals = employeeSkills.filter(s => s.status === 'Pending');

  // Check permissions
  const canEdit = canEditEmployeeSkills(user, employeeId.toString());
  const canApprove = canApproveEmployeeSkills(user, employeeId.toString());

  const getProficiencyBadge = (proficiency: ProficiencyLevel) => {
    const variants: Record<ProficiencyLevel, string> = {
      'Beginner': 'bg-gray-100 text-gray-700',
      'Intermediate': 'bg-blue-100 text-blue-700',
      'Advanced': 'bg-purple-100 text-purple-700',
      'Expert': 'bg-orange-100 text-orange-700',
    };

    return (
      <Badge className={variants[proficiency]} variant="secondary">
        {proficiency}
      </Badge>
    );
  };

  const getStatusBadge = (status: SkillStatus) => {
    const variants: Record<SkillStatus, string> = {
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Verified': 'bg-green-100 text-green-700',
      'Rejected': 'bg-red-100 text-red-700',
    };

    return (
      <Badge className={variants[status]} variant="secondary">
        {status}
      </Badge>
    );
  };

  const renderStars = (rating?: number) => {
    if (!rating) return <span className="text-muted-foreground text-sm">Not rated</span>;
    
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          i <= rating ? (
            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ) : (
            <StarOff key={i} className="h-4 w-4 text-gray-300" />
          )
        ))}
      </div>
    );
  };

  const handleAddSkill = () => {
    setEditingSkill(null);
    setShowSkillModal(true);
  };

  const handleEditSkill = (skill: EmployeeSkill) => {
    setEditingSkill(skill);
    setShowSkillModal(true);
  };

  const handleViewHistory = (skillId: number) => {
    setSelectedSkillForHistory(skillId);
    setShowHistoryDrawer(true);
  };

  const handleApprove = (skill: EmployeeSkill) => {
    setSelectedSkillForApproval(skill);
    setShowApprovalModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl mb-2">{employeeName}</h2>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span>{employeeRole}</span>
                <span>•</span>
                <span>{department}</span>
                <span>•</span>
                <span>{location}</span>
                {managerName && (
                  <>
                    <span>•</span>
                    <span>Manager: <span className="text-primary cursor-pointer hover:underline">{managerName}</span></span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-2">
            {primarySkill && (
              <Badge variant="outline" className="gap-1">
                <Award className="h-3 w-3" />
                Primary: {primarySkill.skill_name}
              </Badge>
            )}
            <Badge variant="outline" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              Level: {primarySkill?.proficiency || 'N/A'}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Star className="h-3 w-3" />
              Skills: {skillStats.totalSkills}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Skill Summary */}
        <div className="space-y-6">
          {/* Pending Approvals (for managers) */}
          {canApprove && pendingApprovals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending Approvals ({pendingApprovals.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pendingApprovals.map(skill => (
                  <div key={skill.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{skill.skill_name}</p>
                        <p className="text-xs text-muted-foreground">{skill.proficiency} • Self: {skill.self_rating}/5</p>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs">
                        Pending
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 text-xs"
                        onClick={() => handleApprove(skill)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 text-xs text-red-600 hover:text-red-700"
                        onClick={() => handleApprove(skill)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Skill Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Skill Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCategory === null ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(null)}
                >
                  All ({skillStats.totalSkills})
                </Badge>
                {Object.entries(skillStats.categoryCount).map(([category, count]) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category} ({count})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skill Scorecards */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Skill Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Technical Depth</span>
                  <span className="text-muted-foreground">{Math.round(skillStats.technicalDepth)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${skillStats.technicalDepth}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Domain Expertise</span>
                  <span className="text-muted-foreground">{Math.round(skillStats.domainExpertise)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500"
                    style={{ width: `${skillStats.domainExpertise}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Leadership / Soft Skills</span>
                  <span className="text-muted-foreground">{Math.round(skillStats.leadershipScore)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${skillStats.leadershipScore}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Last Updated</span>
                  <span className="text-muted-foreground">
                    {employeeSkills[0] ? new Date(employeeSkills[0].updated_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Skills Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Skills ({filteredSkills.length})</CardTitle>
                {canEdit && (
                  <Button onClick={handleAddSkill} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skill
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Domain">Domain</SelectItem>
                    <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                    <SelectItem value="Tools">Tools</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={proficiencyFilter} onValueChange={setProficiencyFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Proficiency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Verified">Verified</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Skills Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Skill Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Proficiency</TableHead>
                      <TableHead>YOE</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Self Rating</TableHead>
                      <TableHead>Manager Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSkills.map((skill) => (
                      <TableRow key={skill.id}>
                        <TableCell className="font-medium">{skill.skill_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {skill.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{getProficiencyBadge(skill.proficiency)}</TableCell>
                        <TableCell>{skill.years_of_experience}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(skill.last_used).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </TableCell>
                        <TableCell>{renderStars(skill.self_rating)}</TableCell>
                        <TableCell>{renderStars(skill.manager_rating)}</TableCell>
                        <TableCell>{getStatusBadge(skill.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditSkill(skill)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewHistory(skill.id)}
                            >
                              <History className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredSkills.length === 0 && (
                  <div className="text-center py-12">
                    <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-2">No skills found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your filters or add a new skill
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <SkillModal
        open={showSkillModal}
        onClose={() => setShowSkillModal(false)}
        employeeId={employeeId}
        editingSkill={editingSkill}
      />

      <SkillHistoryDrawer
        open={showHistoryDrawer}
        onClose={() => setShowHistoryDrawer(false)}
        skillId={selectedSkillForHistory}
      />

      {selectedSkillForApproval && (
        <SkillApprovalModal
          open={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          skill={selectedSkillForApproval}
          onApprove={() => {
            setShowApprovalModal(false);
            setSelectedSkillForApproval(null);
          }}
        />
      )}
    </div>
  );
}