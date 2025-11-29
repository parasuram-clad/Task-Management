import { useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  ArrowLeft,
  Save,
  Send,
  Star,
  Target,
  TrendingUp,
  Users,
  Code,
  MessageSquare,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Progress } from '../ui/progress';

interface AppraisalFormProps {
  user: User;
  navigateTo: (page: string, params?: any) => void;
  appraisalId?: string;
}

interface RatingCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  rating: number;
  comments: string;
}

export function AppraisalForm({ user, navigateTo, appraisalId }: AppraisalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overallComments, setOverallComments] = useState('');
  const [achievements, setAchievements] = useState('');
  const [challenges, setChallenges] = useState('');
  const [goals, setGoals] = useState('');

  const [categories, setCategories] = useState<RatingCategory[]>([
    {
      id: '1',
      name: 'Technical Skills',
      description: 'Proficiency in required technologies and tools',
      icon: Code,
      rating: 0,
      comments: '',
    },
    {
      id: '2',
      name: 'Quality of Work',
      description: 'Accuracy, thoroughness, and attention to detail',
      icon: Award,
      rating: 0,
      comments: '',
    },
    {
      id: '3',
      name: 'Productivity',
      description: 'Efficiency and ability to meet deadlines',
      icon: TrendingUp,
      rating: 0,
      comments: '',
    },
    {
      id: '4',
      name: 'Communication',
      description: 'Clarity in verbal and written communication',
      icon: MessageSquare,
      rating: 0,
      comments: '',
    },
    {
      id: '5',
      name: 'Teamwork',
      description: 'Collaboration and support for team members',
      icon: Users,
      rating: 0,
      comments: '',
    },
    {
      id: '6',
      name: 'Initiative',
      description: 'Proactiveness and problem-solving abilities',
      icon: Target,
      rating: 0,
      comments: '',
    },
  ]);

  const updateRating = (categoryId: string, rating: number) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, rating } : cat
      )
    );
  };

  const updateComments = (categoryId: string, comments: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, comments } : cat
      )
    );
  };

  const getAverageRating = () => {
    const totalRating = categories.reduce((sum, cat) => sum + cat.rating, 0);
    return categories.length > 0 ? totalRating / categories.length : 0;
  };

  const isFormComplete = () => {
    return categories.every((cat) => cat.rating > 0) && achievements && challenges && goals;
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Draft saved successfully');
      navigateTo('my-appraisals');
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!isFormComplete()) {
      toast.error('Please complete all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Self-assessment submitted successfully');
      navigateTo('my-appraisals');
    } catch (error) {
      toast.error('Failed to submit assessment');
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

  const getRatingColor = (rating: number) => {
    if (rating === 0) return 'text-gray-400';
    if (rating <= 2) return 'text-red-600';
    if (rating === 3) return 'text-yellow-600';
    if (rating === 4) return 'text-blue-600';
    return 'text-green-600';
  };

  const completionPercentage = (categories.filter(c => c.rating > 0).length / categories.length) * 100;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigateTo('my-appraisals')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Appraisals
        </Button>
        <h1 className="text-3xl mb-2">Self-Assessment</h1>
        <p className="text-muted-foreground">Q4 2024 Performance Review (Oct - Dec 2024)</p>
      </div>

      {/* Progress Indicator */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Completion Progress</span>
            <span className="text-sm font-medium">{completionPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2 mb-2" />
          <p className="text-sm text-muted-foreground">
            {categories.filter(c => c.rating > 0).length} of {categories.length} categories rated
          </p>
        </CardContent>
      </Card>

      {/* Overall Rating Summary */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Overall Self-Rating</p>
              <div className="flex items-center gap-2">
                <p className="text-4xl font-semibold">{getAverageRating().toFixed(2)}</p>
                <span className="text-muted-foreground">/ 5.0</span>
              </div>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 ${
                    star <= getAverageRating()
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating Categories */}
      <div className="space-y-6 mb-6">
        <h2 className="text-xl font-semibold">Performance Categories</h2>
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={category.rating > 0 ? getRatingColor(category.rating) : ''}
                    variant={category.rating > 0 ? 'secondary' : 'outline'}
                  >
                    {getRatingLabel(category.rating)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Star Rating */}
                  <div>
                    <Label className="mb-3 block">Rating *</Label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => updateRating(category.id, star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 cursor-pointer ${
                              star <= category.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 hover:text-gray-400'
                            }`}
                          />
                        </button>
                      ))}
                      {category.rating > 0 && (
                        <span className="ml-3 text-sm font-medium">
                          {category.rating}.0 - {getRatingLabel(category.rating)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Comments */}
                  <div>
                    <Label htmlFor={`comments-${category.id}`}>
                      Comments (Optional)
                    </Label>
                    <Textarea
                      id={`comments-${category.id}`}
                      placeholder="Add specific examples or comments..."
                      value={category.comments}
                      onChange={(e) => updateComments(category.id, e.target.value)}
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Sections */}
      <div className="space-y-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Key Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="List your major accomplishments during this review period..."
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              rows={4}
              required
            />
            <p className="text-sm text-muted-foreground mt-2">
              * Required: Highlight projects completed, goals achieved, or significant contributions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              Challenges Faced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe any challenges or obstacles you encountered..."
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              rows={4}
              required
            />
            <p className="text-sm text-muted-foreground mt-2">
              * Required: Be honest about difficulties and how you addressed them
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Goals for Next Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="What are your goals and development areas for the next review period?"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              rows={4}
              required
            />
            <p className="text-sm text-muted-foreground mt-2">
              * Required: Outline your professional development objectives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              Additional Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Any other feedback or comments you'd like to share..."
              value={overallComments}
              onChange={(e) => setOverallComments(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {!isFormComplete() && (
                <p className="text-orange-600">Please complete all required fields before submitting</p>
              )}
              {isFormComplete() && (
                <p className="text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  All required fields completed
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !isFormComplete()}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit Self-Assessment'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
