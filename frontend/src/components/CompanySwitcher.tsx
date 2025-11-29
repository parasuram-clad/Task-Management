import { useState } from 'react';
import { Check, ChevronsUpDown, Plus, Building2, Settings } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { Button } from './ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { useCompany } from '../contexts/CompanyContext';
import { useNavigate } from 'react-router-dom';
interface CompanySwitcherProps {
  onCreateCompany?: () => void;
  onManageCompanies?: () => void;
}

export function CompanySwitcher({ onCreateCompany, onManageCompanies }: CompanySwitcherProps) {
  const [open, setOpen] = useState(false);
  const { currentCompany, userCompanies, switchCompany } = useCompany();
 const navigate = useNavigate();
   const handleCreateCompany = () => {
    navigate('/create-company');
  };
  
  const handleManageCompanies = () => {
    navigate('/company-management');
  };
  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-700';
      case 'professional':
        return 'bg-blue-100 text-blue-700';
      case 'basic':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {currentCompany ? getInitials(currentCompany.name) : '?'}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">
              {currentCompany ? currentCompany.name : 'Select company...'}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search companies..." />
          <CommandList>
            <CommandEmpty>No companies found.</CommandEmpty>
            <CommandGroup heading="Your Companies">
              {userCompanies.map((company) => (
                <CommandItem
                  key={company.id}
                  onSelect={() => {
                    if (company.id !== currentCompany?.id) {
                      switchCompany(company.id);
                    }
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {getInitials(company.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {company.name}
                        </p>
                        <Badge className={`text-xs ${getPlanColor(company.plan)}`}>
                          {company.plan}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {company.slug}
                      </p>
                    </div>
                    {currentCompany?.id === company.id && (
                      <Check className="h-4 w-4 shrink-0" />
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            
            <CommandSeparator />
            
            <CommandGroup>
              {onCreateCompany && (
                <CommandItem
                  onSelect={() => {
                    onCreateCompany();
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Company
                </CommandItem>
              )}
              
              {onManageCompanies && (
                <CommandItem
                  onSelect={() => {
                    onManageCompanies();
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Companies
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
