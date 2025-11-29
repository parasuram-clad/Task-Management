import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Star, StarOff, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { EmployeeSkill } from '../../types/skills';

interface SkillApprovalModalProps {
  open: boolean;
  onClose: () => void;
  skill: EmployeeSkill;
  onApprove: () => void;
}

export function SkillApprovalModal({ open, onClose, skill, onApprove }: SkillApprovalModalProps) {
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [managerRating, setManagerRating] = useState(skill.self_rating);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (action === 'approve') {
      toast.success('Skill approved successfully');
    } else {
      toast.success('Skill rejected');
    }
    onApprove();
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          i <= rating ? (
            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ) : (
            <StarOff key={i} className="h-4 w-4 text-gray-300" />
          )
        ))}
      </div>
    );
  };

  const renderStarRating = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(rating => (
          <button
            key={rating}
            type="button"
            onClick={() => setManagerRating(rating)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                rating <= managerRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Skill Approval</DialogTitle>
          <DialogDescription>
            Review and approve or reject this skill submission
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Skill Details */}
          <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-lg">{skill.skill_name}</h3>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline">{skill.category}</Badge>
                  <Badge variant="secondary">{skill.proficiency}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Years of Experience</p>
                <p className="font-medium">{skill.years_of_experience} years</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Used</p>
                <p className="font-medium">
                  {new Date(skill.last_used).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Self Rating</p>
                {renderStars(skill.self_rating)}
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge className="bg-yellow-100 text-yellow-700" variant="secondary">
                  {skill.status}
                </Badge>
              </div>
            </div>

            {skill.evidence && (
              <div>
                <p className="text-muted-foreground text-sm mb-1">Evidence:</p>
                <p className="text-sm bg-white p-3 rounded border">{skill.evidence}</p>
              </div>
            )}
          </div>

          {/* Action Selection */}
          <div className="space-y-3">
            <Label>Decision</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAction('approve')}
                className={`p-4 border-2 rounded-lg flex items-center gap-3 transition-colors ${
                  action === 'approve'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <CheckCircle className={action === 'approve' ? 'text-green-600' : 'text-gray-400'} />
                <div className="text-left">
                  <p className="font-medium">Approve</p>
                  <p className="text-sm text-muted-foreground">Verify this skill</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAction('reject')}
                className={`p-4 border-2 rounded-lg flex items-center gap-3 transition-colors ${
                  action === 'reject'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <XCircle className={action === 'reject' ? 'text-red-600' : 'text-gray-400'} />
                <div className="text-left">
                  <p className="font-medium">Reject</p>
                  <p className="text-sm text-muted-foreground">Needs revision</p>
                </div>
              </button>
            </div>
          </div>

          {/* Manager Rating (only for approve) */}
          {action === 'approve' && (
            <div>
              <Label>Manager Rating</Label>
              <div className="mt-2">
                {renderStarRating()}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Your assessment of the employee's proficiency in this skill
              </p>
            </div>
          )}

          {/* Comment */}
          <div>
            <Label htmlFor="comment">Comment {action === 'reject' && '(Required)'}</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                action === 'approve'
                  ? 'Optional: Add feedback or notes about this skill...'
                  : 'Please explain why this skill is being rejected...'
              }
              rows={3}
              required={action === 'reject'}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className={action === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
            disabled={action === 'reject' && !comment.trim()}
          >
            {action === 'approve' ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Skill
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Reject Skill
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
