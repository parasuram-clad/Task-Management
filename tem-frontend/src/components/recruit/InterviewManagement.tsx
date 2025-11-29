import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar, Clock, Video, MapPin, User, Star, FileText, Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface Interview {
  id: string;
  candidate: string;
  position: string;
  round: string;
  date: string;
  time: string;
  duration: number;
  mode: 'In-person' | 'Video' | 'Phone';
  location: string;
  interviewers: string[];
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';
  feedback?: InterviewFeedback;
}

interface InterviewFeedback {
  rating: number;
  technicalSkills: number;
  communication: number;
  cultureFit: number;
  recommendation: 'Strong Yes' | 'Yes' | 'Maybe' | 'No';
  comments: string;
  strengths: string;
  concerns: string;
}

const mockInterviews: Interview[] = [
  {
    id: 'INT-001',
    candidate: 'John Doe',
    position: 'Senior Software Engineer',
    round: 'Technical Round 1',
    date: '2024-11-25',
    time: '10:00 AM',
    duration: 60,
    mode: 'Video',
    location: 'Google Meet',
    interviewers: ['Sarah Johnson', 'Mike Chen'],
    status: 'Scheduled'
  },
  {
    id: 'INT-002',
    candidate: 'Jane Smith',
    position: 'Product Designer',
    round: 'Portfolio Review',
    date: '2024-11-22',
    time: '2:00 PM',
    duration: 45,
    mode: 'In-person',
    location: 'Office - Conference Room A',
    interviewers: ['Emily Davis'],
    status: 'Completed',
    feedback: {
      rating: 4,
      technicalSkills: 4,
      communication: 5,
      cultureFit: 4,
      recommendation: 'Yes',
      comments: 'Strong portfolio with excellent UI/UX skills. Great communication and passion for design.',
      strengths: 'Excellent design thinking, strong portfolio, good cultural fit',
      concerns: 'Limited experience with design systems'
    }
  },
  {
    id: 'INT-003',
    candidate: 'Alex Johnson',
    position: 'Marketing Intern',
    round: 'HR Screening',
    date: '2024-11-23',
    time: '11:00 AM',
    duration: 30,
    mode: 'Phone',
    location: 'Phone Call',
    interviewers: ['Lisa Anderson'],
    status: 'Scheduled'
  },
  {
    id: 'INT-004',
    candidate: 'Maria Garcia',
    position: 'Data Analyst',
    round: 'Technical Assessment',
    date: '2024-11-20',
    time: '3:00 PM',
    duration: 90,
    mode: 'Video',
    location: 'Zoom',
    interviewers: ['David Wilson', 'Robert Brown'],
    status: 'Completed',
    feedback: {
      rating: 5,
      technicalSkills: 5,
      communication: 4,
      cultureFit: 5,
      recommendation: 'Strong Yes',
      comments: 'Exceptional SQL and Python skills. Solved complex problems efficiently. Great analytical thinking.',
      strengths: 'Strong technical skills, problem-solving ability, quick learner',
      concerns: 'None significant'
    }
  }
];

export function InterviewManagement() {
  const [interviews, setInterviews] = useState<Interview[]>(mockInterviews);
  const [selectedTab, setSelectedTab] = useState('scheduled');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  const scheduledInterviews = interviews.filter(i => i.status === 'Scheduled');
  const completedInterviews = interviews.filter(i => i.status === 'Completed');

  const handleSubmitFeedback = () => {
    toast.success('Interview feedback submitted successfully');
    setShowFeedbackDialog(false);
  };

  const getStatusBadge = (status: Interview['status']) => {
    const variants = {
      'Scheduled': 'bg-blue-100 text-blue-700',
      'Completed': 'bg-green-100 text-green-700',
      'Cancelled': 'bg-red-100 text-red-700',
      'No Show': 'bg-gray-100 text-gray-700'
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const getModeBadge = (mode: Interview['mode']) => {
    const variants = {
      'In-person': 'bg-purple-100 text-purple-700',
      'Video': 'bg-blue-100 text-blue-700',
      'Phone': 'bg-green-100 text-green-700'
    };
    return <Badge className={variants[mode]}>{mode}</Badge>;
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl mb-2">Interview Management</h1>
          <p className="text-muted-foreground">Schedule and manage candidate interviews</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Resume Parser
          </Button>
          <Button onClick={() => setShowScheduleDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Interview
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Interviews</CardDescription>
            <CardTitle className="text-3xl">{interviews.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Scheduled</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{scheduledInterviews.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl text-green-600">{completedInterviews.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Rating</CardDescription>
            <CardTitle className="text-3xl">4.5</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="scheduled">Scheduled ({scheduledInterviews.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedInterviews.length})</TabsTrigger>
          <TabsTrigger value="all">All Interviews</TabsTrigger>
        </TabsList>

        <TabsContent value="scheduled" className="space-y-4 mt-6">
          {scheduledInterviews.map((interview) => (
            <Card key={interview.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{interview.candidate}</CardTitle>
                    <CardDescription>{interview.position} - {interview.round}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(interview.status)}
                    {getModeBadge(interview.mode)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">{new Date(interview.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">{interview.time} ({interview.duration} min)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{interview.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Interviewers</p>
                      <p className="font-medium">{interview.interviewers.join(', ')}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline">Reschedule</Button>
                  <Button size="sm" variant="outline">Cancel</Button>
                  {interview.mode === 'Video' && (
                    <Button size="sm">
                      <Video className="w-4 h-4 mr-1" />
                      Join Meeting
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {completedInterviews.map((interview) => (
            <Card key={interview.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{interview.candidate}</CardTitle>
                    <CardDescription>{interview.position} - {interview.round}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(interview.status)}
                    {interview.feedback && getRatingStars(interview.feedback.rating)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {interview.feedback ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Technical Skills</p>
                        <div className="flex items-center gap-2">
                          {getRatingStars(interview.feedback.technicalSkills)}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Communication</p>
                        <div className="flex items-center gap-2">
                          {getRatingStars(interview.feedback.communication)}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Culture Fit</p>
                        <div className="flex items-center gap-2">
                          {getRatingStars(interview.feedback.cultureFit)}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Recommendation</p>
                        <Badge className={
                          interview.feedback.recommendation === 'Strong Yes' ? 'bg-green-100 text-green-700' :
                          interview.feedback.recommendation === 'Yes' ? 'bg-blue-100 text-blue-700' :
                          interview.feedback.recommendation === 'Maybe' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }>
                          {interview.feedback.recommendation}
                        </Badge>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-1">Comments</p>
                      <p className="text-sm">{interview.feedback.comments}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Strengths</p>
                        <p className="text-sm">{interview.feedback.strengths}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Concerns</p>
                        <p className="text-sm">{interview.feedback.concerns}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-4">No feedback submitted yet</p>
                    <Button onClick={() => {
                      setSelectedInterview(interview);
                      setShowFeedbackDialog(true);
                    }}>
                      Submit Feedback
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <p className="text-muted-foreground">All interviews view</p>
        </TabsContent>
      </Tabs>

      {/* Schedule Interview Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>Set up a new interview with a candidate</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label>Candidate Name</Label>
              <Input placeholder="John Doe" />
            </div>
            <div>
              <Label>Position</Label>
              <Input placeholder="Senior Software Engineer" />
            </div>
            <div>
              <Label>Interview Round</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select round" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hr">HR Screening</SelectItem>
                  <SelectItem value="tech1">Technical Round 1</SelectItem>
                  <SelectItem value="tech2">Technical Round 2</SelectItem>
                  <SelectItem value="manager">Manager Round</SelectItem>
                  <SelectItem value="final">Final Round</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" />
            </div>
            <div>
              <Label>Time</Label>
              <Input type="time" />
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input type="number" defaultValue="60" />
            </div>
            <div>
              <Label>Mode</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="inperson">In-person</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Location/Meeting Link</Label>
              <Input placeholder="Google Meet link or Office location" />
            </div>
            <div className="col-span-2">
              <Label>Interviewers</Label>
              <Input placeholder="Add interviewer names (comma-separated)" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success('Interview scheduled successfully');
              setShowScheduleDialog(false);
            }}>
              Schedule Interview
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit Interview Feedback</DialogTitle>
            <DialogDescription>
              Provide your evaluation for {selectedInterview?.candidate}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Overall Rating</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star key={rating} className="w-6 h-6 cursor-pointer text-gray-300 hover:text-yellow-400" />
                ))}
              </div>
            </div>
            <div>
              <Label>Technical Skills</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star key={rating} className="w-6 h-6 cursor-pointer text-gray-300 hover:text-yellow-400" />
                ))}
              </div>
            </div>
            <div>
              <Label>Communication</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star key={rating} className="w-6 h-6 cursor-pointer text-gray-300 hover:text-yellow-400" />
                ))}
              </div>
            </div>
            <div>
              <Label>Culture Fit</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star key={rating} className="w-6 h-6 cursor-pointer text-gray-300 hover:text-yellow-400" />
                ))}
              </div>
            </div>
            <div>
              <Label>Recommendation</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select recommendation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strong-yes">Strong Yes</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="maybe">Maybe</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Overall Comments</Label>
              <Textarea rows={3} placeholder="Detailed feedback about the candidate..." />
            </div>
            <div>
              <Label>Key Strengths</Label>
              <Textarea rows={2} placeholder="What did the candidate excel at?" />
            </div>
            <div>
              <Label>Areas of Concern</Label>
              <Textarea rows={2} placeholder="Any concerns or areas for improvement?" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitFeedback}>Submit Feedback</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
