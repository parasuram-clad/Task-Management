import { useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  ArrowLeft,
  Send,
  Star,
  User as UserIcon,
  Briefcase,
  Mail,
  Calendar,
  CheckCircle2,
  MessageSquare,
  Award,
  TrendingUp,
  Target,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Separator } from '../ui/separator';

interface ReviewAppraisalProps {
  user: User;
  navigateTo: (page: string, params?: any) => void;
  appraisalId?: string;
}

interface RatingCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  self_rating: number;
  self_comments: string;
  manager_rating: number;
  manager_comments: string;
}

export function ReviewAppraisal({ user, navigateTo, appraisalId }: ReviewAppraisalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overallComments, setOverallComments] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [improvementAreas, setImprovementAreas] = useState('');

  const [categories, setCategories] = useState<RatingCategory[]>([
    {
      id: '1',
      name: 'Technical Skills',
      description: 'Proficiency in required technologies and tools',
      icon: Award,
      self_rating: 4,
      self_comments: 'Successfully completed React certification and improved code quality metrics by 20%.',
      manager_rating: 0,
      manager_comments: '',
    },
    {
      id: '2',
      name: 'Quality of Work',
      description: 'Accuracy, thoroughness, and attention to detail',
      icon: CheckCircle2,
      self_rating: 4,
      self_comments: 'Maintained high standards with minimal bugs in production.',
      manager_rating: 0,
      manager_comments: '',
    },
    {
      id: '3',
      name: 'Productivity',
      description: 'Efficiency and ability to meet deadlines',
      icon: TrendingUp,
      self_rating: 4,
      self_comments: 'Delivered all projects on time with good sprint velocity.',
      manager_rating: 0,
      manager_comments: '',
    },
    {
      id: '4',
      name: 'Communication',
      description: 'Clarity in verbal and written communication',
      icon: MessageSquare,
      self_rating: 4,
      self_comments: 'Improved documentation and team communication.',
      manager_rating: 0,
      manager_comments: '',
    },
    {
      id: '5',
      name: 'Teamwork',
      description: 'Collaboration and support for team members',
      icon: UserIcon,
      self_rating: 5,
      self_comments: 'Actively helped junior developers and participated in code reviews.',
      manager_rating: 0,
      manager_comments: '',
    },
    {
      id: '6',
      name: 'Initiative',
      description: 'Proactiveness and problem-solving abilities',
      icon: Target,
      self_rating: 4,
      self_comments: 'Proposed and implemented several process improvements.',
      manager_rating: 0,
      manager_comments: '',
    },
  ]);

  // Mock employee data
  const employeeData = {
    name: 'John Doe',
    email: 'john.doe@company.com',
    employeeId: 'EMP001',
    department: 'Engineering',
    designation: 'Senior Developer',
    manager: 'Sarah Johnson',
    joinDate: '2023-06-15',
    achievements: 'Led the migration to React 18, mentored 2 junior developers, and improved test coverage to 85%.',
    challenges: 'Initially struggled with the new CI/CD pipeline but overcame it through learning and team support.',
    goals: 'Become a tech lead, achieve AWS certification, and contribute to open-source projects.',
  };

  const updateManagerRating = (categoryId: string, rating: number) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, manager_rating: rating } : cat
      )
    );
  };

  const updateManagerComments = (categoryId: string, comments: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, manager_comments: comments } : cat
      )
    );
  };

  const getAverageSelfRating = () => {
    const totalRating = categories.reduce((sum, cat) => sum + cat.self_rating, 0);
    return categories.length > 0 ? totalRating / categories.length : 0;
  };

  const getAverageManagerRating = () => {
    const totalRating = categories.reduce((sum, cat) => sum + cat.manager_rating, 0);
    return categories.length > 0 ? totalRating / categories.length : 0;
  };

  const getFinalRating = () => {
    return (getAverageSelfRating() + getAverageManagerRating()) / 2;
  };

  const isFormComplete = () => {
    return (
      categories.every((cat) => cat.manager_rating > 0) &&
      overallComments &&
      recommendations
    );
  };

  const handleSubmit = async () => {
    if (!isFormComplete()) {
      toast.error('Please complete all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Appraisal review submitted successfully');
      navigateTo('appraisal-management');
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (rating: number) => {
    if (rating === 0) return 'Not Rated';
    if (rating === 1) return 'Needs Improvement';
    if (rating === 2) return 'Below Expectations';
    if (rating === 3) return 'Meets Expectations';
    if (rating === 4) return 'Exceeds Expectations';
    if (rating === 5) return 'Outstanding';
    return '';
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
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigateTo('appraisal-management')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Appraisal Management
        </Button>
        <h1 className="text-3xl mb-2">Performance Review</h1>
        <p className="text-muted-foreground">Q4 2024 Review (Oct - Dec 2024)</p>
      </div>

      {/* Employee Info Card */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-6 flex-1">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                {employeeData.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <h2 className="text-xl font-semibold mb-1">{employeeData.name}</h2>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      {employeeData.designation} - {employeeData.department}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {employeeData.email}
                    </div>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Employee ID:</span>{' '}
                    <span className="font-medium">{employeeData.employeeId}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Manager:</span>{' '}
                    <span className="font-medium">{employeeData.manager}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Joined: {new Date(employeeData.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <Badge className="bg-blue-100 text-blue-700 mb-2">
                Self-Assessment Submitted
              </Badge>
              <p className="text-sm text-muted-foreground">Nov 15, 2024</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Self-Rating</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-semibold">{getAverageSelfRating().toFixed(2)}</p>
              <span className="text-muted-foreground">/ 5.0</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Manager Rating</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-semibold">
                {getAverageManagerRating() > 0 ? getAverageManagerRating().toFixed(2) : '-'}
              </p>
              <span className="text-muted-foreground">/ 5.0</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Final Rating</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-semibold text-primary">
                {getAverageManagerRating() > 0 ? getFinalRating().toFixed(2) : '-'}
              </p>
              <span className="text-muted-foreground">/ 5.0</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Self-Assessment Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Employee Self-Assessment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Key Achievements
            </h3>
            <p className="text-sm text-muted-foreground pl-6">{employeeData.achievements}</p>
          </div>
          <Separator />
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-600" />
              Challenges Faced
            </h3>
            <p className="text-sm text-muted-foreground pl-6">{employeeData.challenges}</p>
          </div>
          <Separator />
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Goals for Next Period
            </h3>
            <p className="text-sm text-muted-foreground pl-6">{employeeData.goals}</p>
          </div>
        </CardContent>
      </Card>

      {/* Rating Categories */}
      <div className="space-y-4 mb-6">
        <h2 className="text-xl font-semibold">Performance Ratings</h2>
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {/* Self Rating */}
                  <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                    <div>
                      <Label className="text-blue-900">Employee Self-Rating</Label>
                      <div className="mt-2">
                        {getRatingStars(category.self_rating)}
                      </div>
                    </div>
                    {category.self_comments && (
                      <div>
                        <Label className="text-blue-900">Comments</Label>
                        <p className="text-sm text-blue-900/70 mt-1">
                          {category.self_comments}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Manager Rating */}
                  <div className="space-y-3 p-4 bg-purple-50 rounded-lg">
                    <div>
                      <Label className="text-purple-900">Manager Rating *</Label>
                      <div className="flex items-center gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => updateManagerRating(category.id, star)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-7 w-7 cursor-pointer ${
                                star <= category.manager_rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300 hover:text-gray-400'
                              }`}
                            />
                          </button>
                        ))}
                        {category.manager_rating > 0 && (
                          <span className="ml-2 text-sm font-medium text-purple-900">
                            {category.manager_rating}.0 - {getRatingLabel(category.manager_rating)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`manager-comments-${category.id}`} className="text-purple-900">
                        Your Comments (Optional)
                      </Label>
                      <Textarea
                        id={`manager-comments-${category.id}`}
                        placeholder="Add your feedback and comments..."
                        value={category.manager_comments}
                        onChange={(e) =>
                          updateManagerComments(category.id, e.target.value)
                        }
                        rows={3}
                        className="mt-1 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Manager's Overall Assessment */}
      <div className="space-y-6 mb-6">
        <h2 className="text-xl font-semibold">Overall Assessment</h2>
        
        <Card>
          <CardHeader>
            <CardTitle>Overall Comments *</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Provide comprehensive feedback on the employee's overall performance..."
              value={overallComments}
              onChange={(e) => setOverallComments(e.target.value)}
              rows={5}
              required
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations *</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Recommendations for salary increment, promotion, training, etc..."
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              rows={4}
              required
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Areas for Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Specific areas where the employee can improve (Optional)..."
              value={improvementAreas}
              onChange={(e) => setImprovementAreas(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>
      </div>

      {/* Submit Button */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              {!isFormComplete() && (
                <p className="text-orange-600">
                  Please complete all required ratings and comments
                </p>
              )}
              {isFormComplete() && (
                <p className="text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Review is complete and ready to submit
                </p>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormComplete()}
              size="lg"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
