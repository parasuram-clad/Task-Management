import { useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Award,
  Target,
  TrendingUp,
  Calendar,
  FileText,
  Eye,
  Edit,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Star,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Progress } from '../ui/progress';

interface Appraisal {
  id: string;
  cycle: string;
  period: string;
  type: 'quarterly' | 'half-yearly' | 'annual';
  status: 'pending' | 'self-submitted' | 'under-review' | 'completed';
  self_rating?: number;
  manager_rating?: number;
  final_rating?: number;
  deadline: string;
  created_date: string;
  reviewed_by?: string;
  review_date?: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'performance' | 'skill' | 'project' | 'team';
  target_date: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  progress: number;
  weightage: number;
}

interface MyAppraisalsProps {
  user: User;
  navigateTo: (page: string, params?: any) => void;
}

// Mock data
const mockAppraisals: Appraisal[] = [
  {
    id: '1',
    cycle: 'Q4 2024',
    period: 'Oct - Dec 2024',
    type: 'quarterly',
    status: 'pending',
    deadline: '2024-12-31',
    created_date: '2024-12-01',
  },
  {
    id: '2',
    cycle: 'Q3 2024',
    period: 'Jul - Sep 2024',
    type: 'quarterly',
    status: 'completed',
    self_rating: 4.2,
    manager_rating: 4.5,
    final_rating: 4.35,
    deadline: '2024-09-30',
    created_date: '2024-09-01',
    reviewed_by: 'Sarah Johnson',
    review_date: '2024-10-05',
  },
  {
    id: '3',
    cycle: 'H1 2024',
    period: 'Jan - Jun 2024',
    type: 'half-yearly',
    status: 'completed',
    self_rating: 4.0,
    manager_rating: 4.3,
    final_rating: 4.15,
    deadline: '2024-06-30',
    created_date: '2024-06-01',
    reviewed_by: 'Sarah Johnson',
    review_date: '2024-07-10',
  },
  {
    id: '4',
    cycle: 'Q2 2024',
    period: 'Apr - Jun 2024',
    type: 'quarterly',
    status: 'completed',
    self_rating: 3.8,
    manager_rating: 4.0,
    final_rating: 3.9,
    deadline: '2024-06-30',
    created_date: '2024-06-01',
    reviewed_by: 'Sarah Johnson',
    review_date: '2024-07-05',
  },
];

const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Complete React Advanced Certification',
    description: 'Achieve certification in React Advanced concepts',
    category: 'skill',
    target_date: '2024-12-31',
    status: 'in-progress',
    progress: 75,
    weightage: 15,
  },
  {
    id: '2',
    title: 'Lead Project X Implementation',
    description: 'Successfully deliver Project X on time and within budget',
    category: 'project',
    target_date: '2024-12-15',
    status: 'in-progress',
    progress: 60,
    weightage: 30,
  },
  {
    id: '3',
    title: 'Improve Code Review Efficiency',
    description: 'Reduce average code review time by 20%',
    category: 'performance',
    target_date: '2024-12-31',
    status: 'in-progress',
    progress: 80,
    weightage: 20,
  },
  {
    id: '4',
    title: 'Mentor 2 Junior Developers',
    description: 'Provide guidance and mentorship to junior team members',
    category: 'team',
    target_date: '2024-12-31',
    status: 'in-progress',
    progress: 50,
    weightage: 15,
  },
];

export function MyAppraisals({ user, navigateTo }: MyAppraisalsProps) {
  const [activeTab, setActiveTab] = useState('appraisals');

  const pendingAppraisals = mockAppraisals.filter(a => a.status === 'pending' || a.status === 'under-review');
  const completedAppraisals = mockAppraisals.filter(a => a.status === 'completed');
  
  const averageRating = completedAppraisals.length > 0
    ? completedAppraisals.reduce((sum, a) => sum + (a.final_rating || 0), 0) / completedAppraisals.length
    : 0;

  const activeGoals = mockGoals.filter(g => g.status !== 'completed');
  const completedGoals = mockGoals.filter(g => g.status === 'completed');
  const overallProgress = mockGoals.reduce((sum, g) => sum + (g.progress * g.weightage / 100), 0) / 
    mockGoals.reduce((sum, g) => sum + g.weightage, 0) * 100;

  const getStatusBadge = (status: Appraisal['status']) => {
    const variants: Record<Appraisal['status'], { className: string; label: string; icon: any }> = {
      'pending': { className: 'bg-yellow-100 text-yellow-700', label: 'Pending', icon: Clock },
      'self-submitted': { className: 'bg-blue-100 text-blue-700', label: 'Submitted', icon: CheckCircle2 },
      'under-review': { className: 'bg-purple-100 text-purple-700', label: 'Under Review', icon: Eye },
      'completed': { className: 'bg-green-100 text-green-700', label: 'Completed', icon: CheckCircle2 },
    };

    const variant = variants[status];
    const Icon = variant.icon;

    return (
      <Badge className={variant.className} variant="secondary">
        <Icon className="h-3 w-3 mr-1" />
        {variant.label}
      </Badge>
    );
  };

  const getGoalStatusBadge = (status: Goal['status']) => {
    const variants: Record<Goal['status'], { className: string; label: string }> = {
      'not-started': { className: 'bg-gray-100 text-gray-700', label: 'Not Started' },
      'in-progress': { className: 'bg-blue-100 text-blue-700', label: 'In Progress' },
      'completed': { className: 'bg-green-100 text-green-700', label: 'Completed' },
      'delayed': { className: 'bg-red-100 text-red-700', label: 'Delayed' },
    };

    const variant = variants[status];

    return (
      <Badge className={variant.className} variant="secondary">
        {variant.label}
      </Badge>
    );
  };

  const getCategoryBadge = (category: Goal['category']) => {
    const variants: Record<Goal['category'], { className: string; label: string; icon: any }> = {
      'performance': { className: 'bg-orange-100 text-orange-700', label: 'Performance', icon: TrendingUp },
      'skill': { className: 'bg-purple-100 text-purple-700', label: 'Skill', icon: Award },
      'project': { className: 'bg-blue-100 text-blue-700', label: 'Project', icon: Target },
      'team': { className: 'bg-green-100 text-green-700', label: 'Team', icon: Award },
    };

    const variant = variants[category];
    const Icon = variant.icon;

    return (
      <Badge className={variant.className} variant="secondary">
        <Icon className="h-3 w-3 mr-1" />
        {variant.label}
      </Badge>
    );
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl mb-2">My Performance</h1>
        <p className="text-muted-foreground">
          Track your appraisals, goals, and performance metrics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="text-2xl">{averageRating.toFixed(1)}/5.0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl">{pendingAppraisals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Goals</p>
                <p className="text-2xl">{activeGoals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className="text-2xl">{overallProgress.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="appraisals">
            <Award className="h-4 w-4 mr-2" />
            Appraisals
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Target className="h-4 w-4 mr-2" />
            Goals & Objectives
          </TabsTrigger>
        </TabsList>

        {/* Appraisals Tab */}
        <TabsContent value="appraisals" className="mt-6 space-y-6">
          {/* Pending Appraisals */}
          {pendingAppraisals.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Action Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingAppraisals.map((appraisal) => (
                    <div
                      key={appraisal.id}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                          <FileText className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium">{appraisal.cycle} Appraisal</p>
                          <p className="text-sm text-muted-foreground">{appraisal.period}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Deadline</p>
                          <p className="text-sm font-medium">
                            {new Date(appraisal.deadline).toLocaleDateString()}
                          </p>
                        </div>
                        {getStatusBadge(appraisal.status)}
                        <Button
                          size="sm"
                          onClick={() =>
                            navigateTo('appraisal-form', { appraisalId: appraisal.id })
                          }
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Complete Self-Assessment
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appraisal History */}
          <Card>
            <CardHeader>
              <CardTitle>Appraisal History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cycle</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Self Rating</TableHead>
                    <TableHead>Manager Rating</TableHead>
                    <TableHead>Final Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAppraisals.map((appraisal) => (
                    <TableRow key={appraisal.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-primary" />
                          <span className="font-medium">{appraisal.cycle}</span>
                        </div>
                      </TableCell>
                      <TableCell>{appraisal.period}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {appraisal.type === 'quarterly' && 'Quarterly'}
                          {appraisal.type === 'half-yearly' && 'Half-Yearly'}
                          {appraisal.type === 'annual' && 'Annual'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {appraisal.self_rating ? (
                          getRatingStars(appraisal.self_rating)
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {appraisal.manager_rating ? (
                          getRatingStars(appraisal.manager_rating)
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {appraisal.final_rating ? (
                          <div className="flex items-center gap-2">
                            {getRatingStars(appraisal.final_rating)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(appraisal.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigateTo('appraisal-detail', { appraisalId: appraisal.id })
                          }
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Goals & Objectives</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Overall Progress</p>
                    <p className="text-2xl font-semibold">{overallProgress.toFixed(0)}%</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockGoals.map((goal) => (
                  <Card key={goal.id} className="border">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{goal.title}</h3>
                              {getCategoryBadge(goal.category)}
                              {getGoalStatusBadge(goal.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {goal.description}
                            </p>
                            <div className="flex items-center gap-6 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Target: {new Date(goal.target_date).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Weightage: {goal.weightage}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm font-medium">{goal.progress}%</span>
                          </div>
                          <Progress value={goal.progress} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
