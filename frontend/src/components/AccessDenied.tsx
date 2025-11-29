import { ShieldAlert } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

interface AccessDeniedProps {
  onNavigateBack?: () => void;
  message?: string;
}

export function AccessDenied({ onNavigateBack, message }: AccessDeniedProps) {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <Card className="max-w-md">
        <CardContent className="pt-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="p-4 bg-red-100 rounded-full">
              <ShieldAlert className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <h2 className="text-2xl mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            {message || 'You do not have permission to access this page.'}
          </p>
          {onNavigateBack && (
            <Button onClick={onNavigateBack}>
              Go Back to Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
