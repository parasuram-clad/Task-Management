import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CheckCircle, Circle, Clock, FileText, Users, Calendar, Award, UserPlus } from 'lucide-react';

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  category: 'Pre-Joining' | 'Day 1' | 'Week 1' | '30 Days' | '60 Days' | '90 Days';
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate?: string;
  assignedTo?: string;
}

const mockTasks: OnboardingTask[] = [
  {
    id: 'TASK-001',
    title: 'Sign Offer Letter',
    description: 'Review and sign your offer letter digitally',
    category: 'Pre-Joining',
    status: 'Completed',
    dueDate: '2024-11-10'
  },
  {
    id: 'TASK-002',
    title: 'Submit Documents',
    description: 'Upload ID proof, education certificates, and previous experience letters',
    category: 'Pre-Joining',
    status: 'Completed',
    dueDate: '2024-11-15'
  },
  {
    id: 'TASK-003',
    title: 'Complete Background Verification',
    description: 'Provide information for background check',
    category: 'Pre-Joining',
    status: 'In Progress',
    dueDate: '2024-11-20'
  },
  {
    id: 'TASK-004',
    title: 'Welcome & Office Tour',
    description: 'Meet your team and get familiar with the office',
    category: 'Day 1',
    status: 'Pending',
    dueDate: '2024-12-01',
    assignedTo: 'HR Team'
  },
  {
    id: 'TASK-005',
    title: 'IT Setup',
    description: 'Receive laptop, email access, and necessary tools',
    category: 'Day 1',
    status: 'Pending',
    dueDate: '2024-12-01',
    assignedTo: 'IT Department'
  },
  {
    id: 'TASK-006',
    title: 'Meet Your Buddy',
    description: 'Introduction to your onboarding buddy',
    category: 'Day 1',
    status: 'Pending',
    dueDate: '2024-12-01'
  },
  {
    id: 'TASK-007',
    title: 'Complete Company Policies Training',
    description: 'Online training on company policies and code of conduct',
    category: 'Week 1',
    status: 'Pending',
    dueDate: '2024-12-05'
  },
  {
    id: 'TASK-008',
    title: 'Meet with Manager',
    description: 'One-on-one with your direct manager to discuss goals',
    category: 'Week 1',
    status: 'Pending',
    dueDate: '2024-12-03'
  },
  {
    id: 'TASK-009',
    title: '30-Day Check-in',
    description: 'Feedback session with HR and Manager',
    category: '30 Days',
    status: 'Pending',
    dueDate: '2024-12-31'
  },
  {
    id: 'TASK-010',
    title: '60-Day Performance Review',
    description: 'Mid-probation performance evaluation',
    category: '60 Days',
    status: 'Pending',
    dueDate: '2025-01-31'
  },
  {
    id: 'TASK-011',
    title: '90-Day Confirmation Review',
    description: 'Final probation review and confirmation',
    category: '90 Days',
    status: 'Pending',
    dueDate: '2025-02-28'
  }
];

export function OnboardingDashboard() {
  const [tasks] = useState<OnboardingTask[]>(mockTasks);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['Pre-Joining', 'Day 1', 'Week 1', '30 Days', '60 Days', '90 Days'];
  
  const filteredTasks = selectedCategory === 'all' 
    ? tasks 
    : tasks.filter(t => t.category === selectedCategory);

  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const totalTasks = tasks.length;
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

  const getStatusIcon = (status: OnboardingTask['status']) => {
    if (status === 'Completed') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === 'In Progress') return <Clock className="w-5 h-5 text-blue-600" />;
    return <Circle className="w-5 h-5 text-gray-400" />;
  };

  const getStatusBadge = (status: OnboardingTask['status']) => {
    const variants = {
      'Pending': 'bg-gray-100 text-gray-700',
      'In Progress': 'bg-blue-100 text-blue-700',
      'Completed': 'bg-green-100 text-green-700'
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Welcome to the Team! 🎉</h1>
        <p className="text-muted-foreground">Your onboarding journey starts here</p>
      </div>

      {/* Progress Card */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-2xl">Onboarding Progress</CardTitle>
          <CardDescription>You've completed {completedTasks} out of {totalTasks} tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{progressPercentage}% Complete</span>
              <span className="font-medium">{totalTasks - completedTasks} tasks remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Tasks</CardDescription>
            <CardTitle className="text-3xl">{totalTasks}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <FileText className="w-4 h-4 mr-1" />
              All milestones
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl text-green-600">{completedTasks}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 mr-1" />
              Done
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>In Progress</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {tasks.filter(t => t.status === 'In Progress').length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-1" />
              Active
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Days to Confirmation</CardDescription>
            <CardTitle className="text-3xl text-purple-600">90</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-1" />
              Probation period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="checklist">
        <TabsList>
          <TabsTrigger value="checklist">Onboarding Checklist</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="team">Meet Your Team</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="space-y-6 mt-6">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Tasks
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Tasks by Category */}
          {categories.map((category) => {
            const categoryTasks = tasks.filter(t => t.category === category);
            if (selectedCategory !== 'all' && selectedCategory !== category) return null;
            
            return (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-4">{category}</h3>
                <div className="space-y-3">
                  {categoryTasks.map((task) => (
                    <Card key={task.id} className={task.status === 'Completed' ? 'opacity-70' : ''}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          {getStatusIcon(task.status)}
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold">{task.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                              </div>
                              {getStatusBadge(task.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                              {task.dueDate && (
                                <span className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  Due: {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              )}
                              {task.assignedTo && (
                                <span className="flex items-center">
                                  <Users className="w-4 h-4 mr-1" />
                                  {task.assignedTo}
                                </span>
                              )}
                            </div>
                            {task.status === 'Pending' && (
                              <Button size="sm" className="mt-3">Start Task</Button>
                            )}
                            {task.status === 'In Progress' && (
                              <Button size="sm" variant="outline" className="mt-3">Mark as Complete</Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Onboarding Timeline</CardTitle>
              <CardDescription>90-day journey to becoming a full team member</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {categories.map((category, index) => (
                  <div key={category} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      {index < categories.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <h4 className="font-semibold mb-1">{category}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {tasks.filter(t => t.category === category).length} tasks
                      </p>
                      <Progress 
                        value={
                          (tasks.filter(t => t.category === category && t.status === 'Completed').length / 
                          tasks.filter(t => t.category === category).length) * 100
                        } 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Employee Handbook</CardTitle>
                <CardDescription>Everything you need to know about working here</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">Download PDF</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Company Policies</CardTitle>
                <CardDescription>Code of conduct, leave policy, and more</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">View Policies</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">IT Setup Guide</CardTitle>
                <CardDescription>Setup your laptop and access company tools</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">View Guide</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Training Videos</CardTitle>
                <CardDescription>Orientation and training sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">Watch Videos</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Your Manager</CardTitle>
                    <CardDescription>Sarah Johnson</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">Engineering Manager</p>
                <Button size="sm" variant="outline" className="w-full">Schedule 1:1</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Your Buddy</CardTitle>
                    <CardDescription>Mike Chen</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">Senior Developer</p>
                <Button size="sm" variant="outline" className="w-full">Send Message</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">HR Contact</CardTitle>
                    <CardDescription>Emily Davis</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">HR Manager</p>
                <Button size="sm" variant="outline" className="w-full">Contact HR</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
