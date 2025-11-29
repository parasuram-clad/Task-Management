import { useState } from 'react';
import {
  Building2,
  Users,
  Settings,
  Crown,
  Mail,
  Trash2,
  UserPlus,
  Copy,
  Check
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { toast } from 'sonner@2.0.3';
import { useCompany } from '../../contexts/CompanyContext';
import { User } from '../../App';

interface CompanyManagementProps {
  user: User;
}

const mockMembers = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah@company.com', role: 'admin', joinedAt: '2024-01-15' },
  { id: 2, name: 'Mike Wilson', email: 'mike@company.com', role: 'manager', joinedAt: '2024-02-10' },
  { id: 3, name: 'John Doe', email: 'john@company.com', role: 'employee', joinedAt: '2024-03-05' },
  { id: 4, name: 'Emily Davis', email: 'emily@company.com', role: 'hr', joinedAt: '2024-03-20' },
];

export function CompanyManagement({ user }: CompanyManagementProps) {
  const { currentCompany, userRole } = useCompany();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('employee');
  const [copied, setCopied] = useState(false);

  const isAdmin = userRole === 'admin';
  const canManageMembers = isAdmin || userRole === 'hr';

  const inviteUrl = `${window.location.origin}/invite/${currentCompany?.slug}/abc123`;

  const handleInvite = () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    // Simulate API call
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
    setInviteRole('employee');
    setShowInviteDialog(false);
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success('Invite link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveMember = (memberId: number, memberName: string) => {
    if (confirm(`Are you sure you want to remove ${memberName} from the company?`)) {
      toast.success(`${memberName} removed from company`);
    }
  };

  const handleChangeRole = (memberId: number, memberName: string, newRole: string) => {
    toast.success(`${memberName}'s role updated to ${newRole}`);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-700"><Crown className="w-3 h-3 mr-1" />Admin</Badge>;
      case 'hr':
        return <Badge className="bg-blue-100 text-blue-700">HR</Badge>;
      case 'manager':
        return <Badge className="bg-green-100 text-green-700">Manager</Badge>;
      default:
        return <Badge variant="secondary">Employee</Badge>;
    }
  };

  if (!currentCompany) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-primary" />
            Company Management
          </h1>
          <p className="text-muted-foreground mt-1">{currentCompany.name}</p>
        </div>
      </div>

      {/* Company Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Basic details about your company</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Company Name</Label>
              <p className="text-sm mt-1">{currentCompany.name}</p>
            </div>
            <div>
              <Label>Company Slug</Label>
              <p className="text-sm mt-1 font-mono">{currentCompany.slug}</p>
            </div>
            <div>
              <Label>Plan</Label>
              <div className="mt-1">
                <Badge className={
                  currentCompany.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                  currentCompany.plan === 'professional' ? 'bg-blue-100 text-blue-700' :
                  currentCompany.plan === 'basic' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }>
                  {currentCompany.plan}
                </Badge>
              </div>
            </div>
            <div>
              <Label>Created</Label>
              <p className="text-sm mt-1">
                {new Date(currentCompany.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          {isAdmin && (
            <div className="pt-4 border-t">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Edit Company Settings
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Members ({mockMembers.length})
              </CardTitle>
              <CardDescription>Manage users and their roles</CardDescription>
            </div>
            {canManageMembers && (
              <Button onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  {canManageMembers && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      {canManageMembers && member.id !== user.id ? (
                        <Select
                          value={member.role}
                          onValueChange={(role) => handleChangeRole(member.id, member.name, role)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="hr">HR</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="employee">Employee</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        getRoleBadge(member.role)
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </TableCell>
                    {canManageMembers && (
                      <TableCell className="text-right">
                        {member.id !== user.id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveMember(member.id, member.name)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Invite Team Member
            </DialogTitle>
            <DialogDescription>
              Send an invitation to join {currentCompany.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="invite-role">Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {isAdmin && <SelectItem value="admin">Admin</SelectItem>}
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t">
              <Label>Or share invite link</Label>
              <div className="flex gap-2 mt-2">
                <Input value={inviteUrl} readOnly className="font-mono text-xs" />
                <Button variant="outline" onClick={handleCopyInviteLink}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Anyone with this link can join as an employee
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleInvite} className="flex-1">
                Send Invitation
              </Button>
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
