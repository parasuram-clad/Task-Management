import { Building2, Users, Crown } from 'lucide-react';
import { Badge } from './ui/badge';
import { useCompany } from '../contexts/CompanyContext';

export function CompanyBadge() {
  const { currentCompany, userRole } = useCompany();

  if (!currentCompany) return null;

  const getPlanIcon = () => {
    switch (currentCompany.plan) {
      case 'enterprise':
        return <Crown className="w-3 h-3" />;
      case 'professional':
        return <Building2 className="w-3 h-3" />;
      default:
        return <Users className="w-3 h-3" />;
    }
  };

  const getPlanColor = () => {
    switch (currentCompany.plan) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'professional':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'basic':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleColor = () => {
    switch (userRole) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'hr':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'manager':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={getPlanColor()}>
        {getPlanIcon()}
        <span className="ml-1 capitalize">{currentCompany.plan}</span>
      </Badge>
      <Badge variant="outline" className={getRoleColor()}>
        <span className="capitalize">{userRole}</span>
      </Badge>
    </div>
  );
}
