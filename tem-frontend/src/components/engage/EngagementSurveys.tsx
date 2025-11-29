import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { MessageSquare, TrendingUp, Users, BarChart3, ThumbsUp, ThumbsDown, Smile, Frown, Meh } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

interface Survey {
  id: string;
  title: string;
  type: 'Engagement' | 'Pulse' | 'Exit' | 'eNPS' | 'Custom';
  status: 'Active' | 'Completed' | 'Scheduled';
  dueDate?: string;
  responses: number;
  totalQuestions: number;
  completionRate: number;
  eNPSScore?: number;
}

interface Poll {
  id: string;
  question: string;
  options: string[];
  responses: number[];
  totalVotes: number;
  endDate: string;
  status: 'Active' | 'Closed';
}

const mockSurveys: Survey[] = [
  {
    id: 'SUR-001',
    title: 'Q4 2024 Employee Engagement Survey',
    type: 'Engagement',
    status: 'Active',
    dueDate: '2024-12-15',
    responses: 0,
    totalQuestions: 25,
    completionRate: 0,
    eNPSScore: undefined
  },
  {
    id: 'SUR-002',
    title: 'November Pulse Check',
    type: 'Pulse',
    status: 'Completed',
    dueDate: '2024-11-20',
    responses: 1,
    totalQuestions: 5,
    completionRate: 100,
    eNPSScore: 8
  },
  {
    id: 'SUR-003',
    title: 'Manager Effectiveness Survey',
    type: 'Custom',
    status: 'Scheduled',
    dueDate: '2024-12-01',
    responses: 0,
    totalQuestions: 15,
    completionRate: 0
  }
];

const mockPolls: Poll[] = [
  {
    id: 'POLL-001',
    question: 'What should our next team building activity be?',
    options: ['Bowling Night', 'Escape Room', 'Hiking Trip', 'Cooking Class'],
    responses: [45, 62, 38, 29],
    totalVotes: 174,
    endDate: '2024-11-30',
    status: 'Active'
  },
  {
    id: 'POLL-002',
    question: 'Preferred work arrangement?',
    options: ['Full Remote', 'Hybrid (3 days)', 'Hybrid (2 days)', 'Full Office'],
    responses: [89, 112, 67, 23],
    totalVotes: 291,
    endDate: '2024-11-25',
    status: 'Closed'
  }
];

export function EngagementSurveys() {
  const [surveys] = useState<Survey[]>(mockSurveys);
  const [polls] = useState<Poll[]>(mockPolls);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  const activeSurveys = surveys.filter(s => s.status === 'Active');
  const completedSurveys = surveys.filter(s => s.status === 'Completed');

  const handleSubmitSurvey = () => {
    toast.success('Survey submitted successfully!');
    setSelectedSurvey(null);
  };

  const getStatusBadge = (status: Survey['status']) => {
    const variants = {
      'Active': 'bg-green-100 text-green-700',
      'Completed': 'bg-blue-100 text-blue-700',
      'Scheduled': 'bg-yellow-100 text-yellow-700'
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const getSentimentIcon = (score?: number) => {
    if (!score) return <Meh className="w-6 h-6 text-gray-400" />;
    if (score >= 8) return <Smile className="w-6 h-6 text-green-600" />;
    if (score >= 6) return <Meh className="w-6 h-6 text-yellow-600" />;
    return <Frown className="w-6 h-6 text-red-600" />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Employee Engagement</h1>
        <p className="text-muted-foreground">Surveys, Polls, and Employee Engagement</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Surveys</CardDescription>
            <CardTitle className="text-3xl">{activeSurveys.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <MessageSquare className="w-4 h-4 mr-1" />
              Pending response
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completion Rate</CardDescription>
            <CardTitle className="text-3xl text-blue-600">85%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4 mr-1" />
              Company average
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>eNPS Score</CardDescription>
            <CardTitle className="text-3xl text-green-600">+42</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <ThumbsUp className="w-4 h-4 mr-1" />
              Excellent
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Polls</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{polls.filter(p => p.status === 'Active').length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <BarChart3 className="w-4 h-4 mr-1" />
              Vote now
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="surveys">
        <TabsList>
          <TabsTrigger value="surveys">Surveys</TabsTrigger>
          <TabsTrigger value="polls">Polls</TabsTrigger>
          <TabsTrigger value="results">Results & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="surveys" className="space-y-6 mt-6">
          {/* Active Surveys */}
          {activeSurveys.length > 0 && !selectedSurvey && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Pending Surveys</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSurveys.map((survey) => (
                  <Card key={survey.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg">{survey.title}</CardTitle>
                        {getStatusBadge(survey.status)}
                      </div>
                      <CardDescription>
                        <Badge variant="outline" className="mr-2">{survey.type}</Badge>
                        {survey.totalQuestions} questions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {survey.dueDate && (
                          <p className="text-sm text-muted-foreground">
                            Due: {new Date(survey.dueDate).toLocaleDateString()}
                          </p>
                        )}
                        <Button 
                          className="w-full"
                          onClick={() => setSelectedSurvey(survey)}
                        >
                          Start Survey
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Survey Form */}
          {selectedSurvey && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedSurvey.title}</CardTitle>
                    <CardDescription>
                      {selectedSurvey.totalQuestions} questions • Anonymous responses
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedSurvey(null)}>
                    Save & Exit
                  </Button>
                </div>
                <Progress value={0} className="mt-4" />
                <p className="text-sm text-muted-foreground mt-2">Question 1 of {selectedSurvey.totalQuestions}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sample Question 1 - Rating Scale */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">1. How satisfied are you with your current role?</h4>
                    <RadioGroup>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="5" id="q1-5" />
                        <Label htmlFor="q1-5">Very Satisfied</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="4" id="q1-4" />
                        <Label htmlFor="q1-4">Satisfied</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3" id="q1-3" />
                        <Label htmlFor="q1-3">Neutral</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2" id="q1-2" />
                        <Label htmlFor="q1-2">Dissatisfied</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="q1-1" />
                        <Label htmlFor="q1-1">Very Dissatisfied</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Sample Question 2 - eNPS */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">2. How likely are you to recommend our company as a place to work?</h4>
                    <p className="text-sm text-muted-foreground mb-3">Scale of 0 (Not at all likely) to 10 (Extremely likely)</p>
                    <div className="flex gap-2">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                        <button
                          key={score}
                          className="w-10 h-10 border rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sample Question 3 - Open Text */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">3. What do you value most about working here?</h4>
                    <Textarea
                      placeholder="Share your thoughts..."
                      rows={4}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t">
                  <Button variant="outline">Previous</Button>
                  <Button onClick={handleSubmitSurvey}>Next</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completed Surveys */}
          {completedSurveys.length > 0 && !selectedSurvey && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Completed Surveys</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {completedSurveys.map((survey) => (
                  <Card key={survey.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{survey.title}</CardTitle>
                      <CardDescription>
                        Completed on {survey.dueDate ? new Date(survey.dueDate).toLocaleDateString() : 'N/A'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        {getSentimentIcon(survey.eNPSScore)}
                        {survey.eNPSScore && (
                          <div>
                            <p className="text-sm text-muted-foreground">Your Score</p>
                            <p className="text-lg font-semibold">{survey.eNPSScore}/10</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="polls" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {polls.map((poll) => (
              <Card key={poll.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{poll.question}</CardTitle>
                    <Badge className={poll.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {poll.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {poll.totalVotes} votes • Ends {new Date(poll.endDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {poll.options.map((option, index) => {
                      const percentage = poll.totalVotes > 0 
                        ? Math.round((poll.responses[index] / poll.totalVotes) * 100) 
                        : 0;
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{option}</span>
                            <span className="font-medium">{percentage}%</span>
                          </div>
                          <Progress value={percentage} />
                          <p className="text-xs text-muted-foreground">{poll.responses[index]} votes</p>
                        </div>
                      );
                    })}
                  </div>
                  {poll.status === 'Active' && (
                    <Button className="w-full mt-4" onClick={() => toast.success('Vote recorded!')}>
                      Submit Vote
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Trend</CardTitle>
                <CardDescription>Last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/30">
                  <p className="text-muted-foreground">Engagement trend chart would appear here</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Department Comparison</CardTitle>
                <CardDescription>Average eNPS score by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Engineering', 'Product', 'Marketing', 'Sales'].map((dept) => (
                    <div key={dept}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{dept}</span>
                        <span className="font-medium">+{Math.floor(Math.random() * 30 + 30)}</span>
                      </div>
                      <Progress value={Math.random() * 40 + 60} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}