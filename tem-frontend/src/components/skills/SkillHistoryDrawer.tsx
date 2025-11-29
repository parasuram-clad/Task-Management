import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import { Badge } from '../ui/badge';
import { CheckCircle, XCircle, Edit, Plus } from 'lucide-react';
import { mockSkillHistory } from '../../data/mockSkills';

interface SkillHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  skillId: number | null;
}

export function SkillHistoryDrawer({ open, onClose, skillId }: SkillHistoryDrawerProps) {
  if (!skillId) return null;

  const history = mockSkillHistory.filter(h => h.employee_skill_id === skillId);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <Plus className="h-4 w-4 text-blue-600" />;
      case 'updated':
        return <Edit className="h-4 w-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, string> = {
      created: 'bg-blue-100 text-blue-700',
      updated: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };

    return (
      <Badge className={variants[action] || ''} variant="secondary">
        {action.charAt(0).toUpperCase() + action.slice(1)}
      </Badge>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Skill History</SheetTitle>
          <SheetDescription>
            View all changes and approvals for this skill
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No history available</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

              {/* Timeline entries */}
              <div className="space-y-6">
                {history.map((entry, index) => (
                  <div key={entry.id} className="relative flex gap-4">
                    {/* Icon */}
                    <div className="relative z-10 flex items-center justify-center w-10 h-10 bg-white border-2 border-gray-200 rounded-full">
                      {getActionIcon(entry.action)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{entry.changed_by_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {getActionBadge(entry.action)}
                      </div>

                      {/* Changes */}
                      {entry.changes.length > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                          <p className="text-sm font-medium mb-2">Changes:</p>
                          <div className="space-y-1">
                            {entry.changes.map((change, idx) => (
                              <div key={idx} className="text-sm">
                                <span className="text-muted-foreground capitalize">
                                  {change.field.replace(/_/g, ' ')}:
                                </span>{' '}
                                {change.old_value !== null && (
                                  <>
                                    <span className="line-through text-red-600">
                                      {String(change.old_value)}
                                    </span>
                                    {' → '}
                                  </>
                                )}
                                <span className="text-green-600 font-medium">
                                  {String(change.new_value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Comment */}
                      {entry.comment && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm">
                            <span className="font-medium">Comment:</span> {entry.comment}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
