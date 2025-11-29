import { useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  ArrowLeft,
  Send,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Info,
  Umbrella,
  Activity,
  Plane,
  Heart,
  Home,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner@2.0.3';
import { Alert, AlertDescription } from '../ui/alert';

interface LeaveFormProps {
  user: User;
  navigateTo: (page: string, params?: any) => void;
}

interface LeaveType {
  id: string;
  name: string;
  icon: any;
  available: number;
  description: string;
  color: string;
}

const leaveTypes: LeaveType[] = [
  {
    id: 'casual',
    name: 'Casual Leave',
    icon: Umbrella,
    available: 5,
    description: 'For personal reasons and short-term absences',
    color: 'blue',
  },
  {
    id: 'sick',
    name: 'Sick Leave',
    icon: Activity,
    available: 7,
    description: 'For medical reasons and health issues',
    color: 'red',
  },
  {
    id: 'privilege',
    name: 'Privilege Leave',
    icon: Plane,
    available: 7,
    description: 'For planned vacations and extended breaks',
    color: 'purple',
  },
  {
    id: 'maternity',
    name: 'Maternity/Paternity',
    icon: Heart,
    available: 90,
    description: 'For new parents',
    color: 'pink',
  },
  {
    id: 'wfh',
    name: 'Work From Home',
    icon: Home,
    available: 13,
    description: 'Work remotely from home',
    color: 'green',
  },
];

export function LeaveForm({ user, navigateTo }: LeaveFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    from_date: '',
    to_date: '',
    reason: '',
    contact_number: '',
    address_during_leave: '',
  });

  const selectedLeaveType = leaveTypes.find(lt => lt.id === formData.type);

  const calculateDays = () => {
    if (!formData.from_date || !formData.to_date) return 0;
    const from = new Date(formData.from_date);
    const to = new Date(formData.to_date);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const days = calculateDays();
  const canApply = selectedLeaveType && days <= selectedLeaveType.available;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canApply) {
      toast.error('Insufficient leave balance');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Leave request submitted successfully');
      navigateTo('my-leaves');
    } catch (error) {
      toast.error('Failed to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      pink: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
      green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigateTo('my-leaves')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Leaves
        </Button>
        <h1 className="text-3xl mb-2">Apply for Leave</h1>
        <p className="text-muted-foreground">
          Submit a new leave request for approval
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Leave Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Leave Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leaveTypes.map((type) => {
                const Icon = type.icon;
                const colors = getColorClasses(type.color);
                const isSelected = formData.type === type.id;

                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.id })}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? `${colors.border} ${colors.bg}`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${colors.bg} rounded-lg`}>
                          <Icon className={`h-5 w-5 ${colors.text}`} />
                        </div>
                        <div>
                          <p className="font-medium">{type.name}</p>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <span className="text-sm text-muted-foreground">Available</span>
                      <Badge variant={type.available > 0 ? 'default' : 'secondary'}>
                        {type.available} days
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Leave Details */}
        {formData.type && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Leave Duration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="from_date">From Date *</Label>
                    <Input
                      id="from_date"
                      type="date"
                      value={formData.from_date}
                      onChange={(e) =>
                        setFormData({ ...formData, from_date: e.target.value })
                      }
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="to_date">To Date *</Label>
                    <Input
                      id="to_date"
                      type="date"
                      value={formData.to_date}
                      onChange={(e) =>
                        setFormData({ ...formData, to_date: e.target.value })
                      }
                      min={formData.from_date || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                {formData.from_date && formData.to_date && (
                  <Alert className={canApply ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    <div className="flex items-center gap-2">
                      {canApply ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription className={canApply ? 'text-green-700' : 'text-red-700'}>
                        {canApply ? (
                          <>
                            Requesting {days} day{days > 1 ? 's' : ''} of leave. You have{' '}
                            {selectedLeaveType?.available} day{selectedLeaveType?.available !== 1 ? 's' : ''} available.
                          </>
                        ) : (
                          <>
                            Insufficient balance! Requesting {days} day{days > 1 ? 's' : ''} but only{' '}
                            {selectedLeaveType?.available} day{selectedLeaveType?.available !== 1 ? 's' : ''} available.
                          </>
                        )}
                      </AlertDescription>
                    </div>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leave Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="reason">Reason for Leave *</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please provide a detailed reason for your leave..."
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contact_number">Contact Number During Leave</Label>
                  <Input
                    id="contact_number"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.contact_number}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_number: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="address_during_leave">Address During Leave</Label>
                  <Textarea
                    id="address_during_leave"
                    placeholder="Where can you be reached during your leave?"
                    value={formData.address_during_leave}
                    onChange={(e) =>
                      setFormData({ ...formData, address_during_leave: e.target.value })
                    }
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Info Alert */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Your leave request will be sent to your manager for approval. You will receive a notification once it has been reviewed.
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    {!canApply && formData.from_date && formData.to_date && (
                      <p className="text-orange-600">
                        You don't have enough leave balance for this request
                      </p>
                    )}
                    {canApply && formData.from_date && formData.to_date && (
                      <p className="text-green-600 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Your request is ready to submit
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigateTo('my-leaves')}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !canApply || !formData.reason}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </form>
    </div>
  );
}
