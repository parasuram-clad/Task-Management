import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  MessageSquare,
  PhoneCall,
  Video,
  FileText,
  Plus,
  Link as LinkIcon,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Skeleton } from '../ui/skeleton';
import { toast } from 'sonner@2.0.3';
import { User } from '../../App';
import { Lead, LeadActivity } from '../../services/leads-api';

interface LeadDetailProps {
  leadId: string;
  user: User;
  navigateTo: (page: string, params?: any) => void;
}

const mockActivities: LeadActivity[] = [
  {
    id: 1,
    lead_id: 1,
    user_id: 1,
    type: 'note',
    subject: 'Initial Discovery Call',
    body: 'Discussed project scope and requirements. Client needs website redesign with modern UI/UX.',
    created_at: '2024-11-15T14:30:00Z',
    user: { id: 1, name: 'Sarah Johnson', email: 'sarah@company.com' }
  },
  {
    id: 2,
    lead_id: 1,
    user_id: 1,
    type: 'call',
    subject: 'Follow-up call scheduled',
    body: 'Scheduled for Nov 20, 2024 at 2:00 PM',
    created_at: '2024-11-12T10:00:00Z',
    user: { id: 1, name: 'Sarah Johnson', email: 'sarah@company.com' }
  },
  {
    id: 3,
    lead_id: 1,
    user_id: 2,
    type: 'email',
    subject: 'Proposal sent',
    body: 'Sent detailed proposal with pricing and timeline',
    created_at: '2024-11-10T09:00:00Z',
    user: { id: 2, name: 'Mike Wilson', email: 'mike@company.com' }
  }
];

export function LeadDetail({ leadId, user, navigateTo }: LeadDetailProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activityType, setActivityType] = useState<'note' | 'call' | 'email' | 'meeting'>('note');
  const [activitySubject, setActivitySubject] = useState('');
  const [activityBody, setActivityBody] = useState('');
  const [showActivityDialog, setShowActivityDialog] = useState(false);

  useEffect(() => {
    loadLead();
  }, [leadId]);

  const loadLead = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLead({
        id: 1,
        company_id: 1,
        name: 'Acme Corp Website Redesign',
        contact_name: 'John Smith',
        contact_email: 'john@acmecorp.com',
        contact_phone: '+1-555-0101',
        source: 'Website',
        status: 'qualified',
        value_amount: 45000,
        owner_id: 1,
        notes: 'Interested in Q1 2024 project. Looking for modern design with focus on mobile experience.',
        created_at: '2024-11-01T10:00:00Z',
        updated_at: '2024-11-15T14:30:00Z',
        owner: { id: 1, name: 'Sarah Johnson', email: 'sarah@company.com' },
        activities: mockActivities,
        linkedProjects: []
      });
      setIsLoading(false);
    }, 600);
  };

  const handleAddActivity = () => {
    if (!activitySubject || !activityBody) {
      toast.error('Please fill in all fields');
      return;
    }

    toast.success('Activity added successfully');
    setActivitySubject('');
    setActivityBody('');
    setShowActivityDialog(false);
    loadLead();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'qualified':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'converted':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'lost':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'note':
        return <MessageSquare className="w-4 h-4" />;
      case 'call':
        return <PhoneCall className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'meeting':
        return <Video className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-12">
            <XCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h3>Lead not found</h3>
            <Button onClick={() => navigateTo('leads')} className="mt-4">
              Back to Leads
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateTo('leads')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Lead Header */}
      <Card className="shadow-sm border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="mb-2">{lead.name}</h1>
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(lead.status)}>
                  {lead.status}
                </Badge>
                {lead.source && (
                  <span className="text-sm text-muted-foreground">
                    Source: {lead.source}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigateTo('lead-edit', { leadId: lead.id })}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              {lead.status === 'qualified' && (
                <Button>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Convert to Project
                </Button>
              )}
              {lead.status === 'open' && (
                <Button variant="destructive">
                  <XCircle className="w-4 h-4 mr-2" />
                  Mark as Lost
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contact Info */}
            <div className="space-y-3">
              <h4 className="text-sm text-muted-foreground">Contact Information</h4>
              {lead.contact_name && (
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {lead.contact_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{lead.contact_name}</span>
                </div>
              )}
              {lead.contact_email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {lead.contact_email}
                </div>
              )}
              {lead.contact_phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  {lead.contact_phone}
                </div>
              )}
            </div>

            {/* Value & Dates */}
            <div className="space-y-3">
              <h4 className="text-sm text-muted-foreground">Deal Information</h4>
              {lead.value_amount && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span>${lead.value_amount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Created {new Date(lead.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Updated {new Date(lead.updated_at).toLocaleDateString()}
              </div>
            </div>

            {/* Owner */}
            <div className="space-y-3">
              <h4 className="text-sm text-muted-foreground">Lead Owner</h4>
              {lead.owner && (
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {lead.owner.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">{lead.owner.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.owner.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {lead.notes && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="text-sm mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground">{lead.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activities Timeline */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>Communication history and notes</CardDescription>
                </div>
                <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Activity
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Activity</DialogTitle>
                      <DialogDescription>
                        Record a note, call, email, or meeting
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="activity-type">Activity Type</Label>
                        <Select value={activityType} onValueChange={(v: any) => setActivityType(v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="note">Note</SelectItem>
                            <SelectItem value="call">Call</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="meeting">Meeting</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={activitySubject}
                          onChange={(e) => setActivitySubject(e.target.value)}
                          placeholder="Enter subject"
                        />
                      </div>
                      <div>
                        <Label htmlFor="body">Details</Label>
                        <Textarea
                          id="body"
                          value={activityBody}
                          onChange={(e) => setActivityBody(e.target.value)}
                          placeholder="Enter details..."
                          rows={4}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAddActivity} className="flex-1">
                          Save Activity
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowActivityDialog(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {lead.activities && lead.activities.length > 0 ? (
                <div className="space-y-4">
                  {lead.activities.map((activity, index) => (
                    <div
                      key={activity.id}
                      className="flex gap-4 pb-4 border-b last:border-0 last:pb-0"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <p className="text-sm capitalize">
                              <span className="font-medium">{activity.type}</span>
                              {activity.subject && ` - ${activity.subject}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              by {activity.user.name} · {new Date(activity.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {activity.body && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {activity.body}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No activities yet</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowActivityDialog(true)}
                    className="mt-4"
                  >
                    Add First Activity
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Linked Projects */}
        <div>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Linked Projects</CardTitle>
              <CardDescription>Associated projects</CardDescription>
            </CardHeader>
            <CardContent>
              {lead.linkedProjects && lead.linkedProjects.length > 0 ? (
                <div className="space-y-2">
                  {lead.linkedProjects.map(project => (
                    <div
                      key={project.id}
                      className="p-3 border rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <p className="text-sm">{project.name}</p>
                      <Badge variant="secondary" className="mt-1">
                        {project.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <LinkIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">No linked projects</p>
                  {lead.status === 'converted' && (
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Link Project
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
