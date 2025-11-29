import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { BookOpen, Video, FileText, Award, Clock, TrendingUp, Users, Target, Play, CheckCircle } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  category: 'Technical' | 'Soft Skills' | 'Compliance' | 'Leadership';
  type: 'E-Learning' | 'Classroom' | 'Webinar';
  duration: number; // in hours
  progress: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
  instructor: string;
  thumbnail: string;
  rating: number;
  enrolledStudents: number;
  modules: number;
  deadline?: string;
  certificateEarned: boolean;
}

const mockCourses: Course[] = [
  {
    id: 'CRS-001',
    title: 'Advanced React & TypeScript',
    category: 'Technical',
    type: 'E-Learning',
    duration: 12,
    progress: 65,
    status: 'In Progress',
    instructor: 'Sarah Johnson',
    thumbnail: 'react',
    rating: 4.8,
    enrolledStudents: 145,
    modules: 8,
    deadline: '2024-12-15',
    certificateEarned: false
  },
  {
    id: 'CRS-002',
    title: 'Effective Communication Skills',
    category: 'Soft Skills',
    type: 'Classroom',
    duration: 6,
    progress: 100,
    status: 'Completed',
    instructor: 'Michael Chen',
    thumbnail: 'communication',
    rating: 4.9,
    enrolledStudents: 89,
    modules: 4,
    deadline: '2024-11-10',
    certificateEarned: true
  },
  {
    id: 'CRS-003',
    title: 'Data Privacy & GDPR Compliance',
    category: 'Compliance',
    type: 'E-Learning',
    duration: 3,
    progress: 0,
    status: 'Not Started',
    instructor: 'Emily Davis',
    thumbnail: 'compliance',
    rating: 4.6,
    enrolledStudents: 312,
    modules: 5,
    deadline: '2024-12-31',
    certificateEarned: false
  },
  {
    id: 'CRS-004',
    title: 'Leadership Fundamentals',
    category: 'Leadership',
    type: 'Webinar',
    duration: 8,
    progress: 30,
    status: 'In Progress',
    instructor: 'Robert Brown',
    thumbnail: 'leadership',
    rating: 4.7,
    enrolledStudents: 56,
    modules: 6,
    certificateEarned: false
  },
  {
    id: 'CRS-005',
    title: 'AWS Cloud Practitioner',
    category: 'Technical',
    type: 'E-Learning',
    duration: 15,
    progress: 0,
    status: 'Not Started',
    instructor: 'David Wilson',
    thumbnail: 'aws',
    rating: 4.9,
    enrolledStudents: 203,
    modules: 10,
    certificateEarned: false
  },
  {
    id: 'CRS-006',
    title: 'Time Management Mastery',
    category: 'Soft Skills',
    type: 'E-Learning',
    duration: 4,
    progress: 100,
    status: 'Completed',
    instructor: 'Lisa Anderson',
    thumbnail: 'time',
    rating: 4.5,
    enrolledStudents: 178,
    modules: 3,
    certificateEarned: true
  }
];

export function LMSDashboard() {
  const [courses] = useState<Course[]>(mockCourses);
  const [selectedTab, setSelectedTab] = useState('my-courses');

  const myCourses = courses.filter(c => c.status !== 'Not Started');
  const completedCourses = courses.filter(c => c.status === 'Completed');
  const inProgressCourses = courses.filter(c => c.status === 'In Progress');

  const stats = {
    enrolled: myCourses.length,
    completed: completedCourses.length,
    inProgress: inProgressCourses.length,
    totalHours: completedCourses.reduce((sum, c) => sum + c.duration, 0),
    certificates: courses.filter(c => c.certificateEarned).length,
    avgProgress: myCourses.length > 0 
      ? Math.round(myCourses.reduce((sum, c) => sum + c.progress, 0) / myCourses.length)
      : 0
  };

  const getStatusBadge = (status: Course['status']) => {
    const variants = {
      'Not Started': 'bg-gray-100 text-gray-700',
      'In Progress': 'bg-blue-100 text-blue-700',
      'Completed': 'bg-green-100 text-green-700'
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const getCategoryColor = (category: Course['category']) => {
    const colors = {
      'Technical': 'bg-blue-100 text-blue-700',
      'Soft Skills': 'bg-purple-100 text-purple-700',
      'Compliance': 'bg-red-100 text-red-700',
      'Leadership': 'bg-green-100 text-green-700'
    };
    return colors[category];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Learning Management System</h1>
        <p className="text-muted-foreground">Your personalized learning journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Enrolled Courses</CardDescription>
            <CardTitle className="text-3xl">{stats.enrolled}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <BookOpen className="w-4 h-4 mr-1" />
              Active
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>In Progress</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.inProgress}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-1" />
              Learning
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.completed}</CardTitle>
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
            <CardDescription>Learning Hours</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{stats.totalHours}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4 mr-1" />
              Total
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Certificates</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.certificates}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Award className="w-4 h-4 mr-1" />
              Earned
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Progress</CardDescription>
            <CardTitle className="text-3xl">{stats.avgProgress}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Target className="w-4 h-4 mr-1" />
              Overall
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="my-courses">My Courses ({myCourses.length})</TabsTrigger>
          <TabsTrigger value="catalog">Course Catalog</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="schedule">Training Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="my-courses" className="space-y-4 mt-6">
          {/* Continue Learning Section */}
          {inProgressCourses.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Continue Learning</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inProgressCourses.map((course) => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{course.title}</CardTitle>
                          <CardDescription>{course.instructor}</CardDescription>
                        </div>
                        <Badge className={getCategoryColor(course.category)}>
                          {course.category}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {course.duration}h
                          </span>
                          <span className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            {course.modules} modules
                          </span>
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {course.enrolledStudents}
                          </span>
                        </div>
                      </div>
                      {course.deadline && (
                        <p className="text-sm text-muted-foreground mb-3">
                          Deadline: {new Date(course.deadline).toLocaleDateString()}
                        </p>
                      )}
                      <Button className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        Continue Learning
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Completed Courses */}
          {completedCourses.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Completed Courses</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {completedCourses.map((course) => (
                  <Card key={course.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-base">{course.title}</CardTitle>
                        {course.certificateEarned && (
                          <Award className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                      <CardDescription>{course.instructor}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Completed</span>
                      </div>
                      {course.certificateEarned ? (
                        <Button variant="outline" size="sm" className="w-full">
                          <Award className="w-4 h-4 mr-2" />
                          View Certificate
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="w-full">
                          Review Course
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="catalog" className="mt-6">
          <div className="mb-6">
            <Input placeholder="Search courses..." className="max-w-md" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-base">{course.title}</CardTitle>
                    <Badge className={getCategoryColor(course.category)} variant="outline">
                      {course.category}
                    </Badge>
                  </div>
                  <CardDescription>{course.instructor}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.duration}h
                    </span>
                    <span className="flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      {course.modules} modules
                    </span>
                    <span>★ {course.rating}</span>
                  </div>
                  <Button 
                    className="w-full" 
                    variant={course.status === 'Not Started' ? 'default' : 'outline'}
                  >
                    {course.status === 'Not Started' ? 'Enroll Now' : 'View Course'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="certificates" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.filter(c => c.certificateEarned).map((course) => (
              <Card key={course.id} className="border-2 border-yellow-200">
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
                  <div className="flex items-start gap-4">
                    <Award className="w-12 h-12 text-yellow-600" />
                    <div>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription>Completed on {new Date().toLocaleDateString()}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Instructor:</span>
                      <span className="font-medium">{course.instructor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{course.duration} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rating:</span>
                      <span className="font-medium">★ {course.rating}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button className="flex-1">Download Certificate</Button>
                    <Button variant="outline" className="flex-1">Share</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {courses.filter(c => c.certificateEarned).length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No certificates earned yet</p>
                <p className="text-sm text-muted-foreground mt-2">Complete courses to earn certificates</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Training Sessions</CardTitle>
              <CardDescription>Classroom and webinar schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Video className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Effective Communication Skills</h4>
                    <p className="text-sm text-muted-foreground">Classroom Training • Michael Chen</p>
                    <p className="text-sm text-muted-foreground mt-2">December 5, 2024 • 9:00 AM - 12:00 PM</p>
                    <p className="text-sm text-muted-foreground">Conference Room A</p>
                  </div>
                  <Button size="sm">Register</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}