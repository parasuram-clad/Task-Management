import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Save, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';
import { User } from '../../App';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { timesheetApi, Timesheet as ApiTimesheet } from '../../services/api';
import { apiConfig } from '../../services/api-config';
import { ApiError } from '../../services/api-client';

interface MyTimesheetProps {
  user: User;
}

interface TimesheetEntry {
  id: string;
  projectId: string;
  projectName: string;
  taskId?: string;
  taskName?: string;
  hours: { [key: string]: number };
}

export function MyTimesheet({ user }: MyTimesheetProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday
    return new Date(date.setDate(diff));
  });

  const mockEntries: TimesheetEntry[] = [
    {
      id: '1',
      projectId: 'proj1',
      projectName: 'E-commerce Platform',
      taskName: 'Bug Fixes',
      hours: { mon: 8, tue: 7, wed: 8, thu: 6, fri: 5 },
    },
    {
      id: '2',
      projectId: 'proj2',
      projectName: 'Mobile App Redesign',
      taskName: 'UI Components',
      hours: { mon: 0, tue: 1, wed: 0, thu: 2, fri: 3 },
    },
  ];

  const [entries, setEntries] = useState<TimesheetEntry[]>(mockEntries);
  const [status, setStatus] = useState<'draft' | 'submitted' | 'approved' | 'rejected'>('draft');
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const useApi = apiConfig.hasBaseUrl();

  // Fetch timesheet from API when week changes
  useEffect(() => {
    if (useApi) {
      fetchTimesheet();
    }
  }, [currentWeekStart, useApi]);

  const fetchTimesheet = async () => {
    setIsLoading(true);
    try {
      const weekStartDate = currentWeekStart.toISOString().split('T')[0];
      const data = await timesheetApi.getWeekly(weekStartDate);
      
      // Map API timesheet to local format
      if (data.entries && data.entries.length > 0) {
        const mappedEntries: TimesheetEntry[] = data.entries.map(entry => {
          const workDate = new Date(entry.work_date);
          const dayIndex = workDate.getDay() === 0 ? 6 : workDate.getDay() - 1; // Convert to 0=Mon, 6=Sun
          const dayKey = weekDays[dayIndex];
          
          return {
            id: entry.id?.toString() || Date.now().toString(),
            projectId: entry.project_id.toString(),
            projectName: entry.project_name || 'Unknown Project',
            taskId: entry.task_id?.toString(),
            taskName: entry.task_title,
            hours: { [dayKey]: entry.hours },
          };
        });
        
        setEntries(mappedEntries);
        setStatus(data.status as any);
      } else {
        setEntries([]);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status !== 404) {
        toast.error(`Failed to load timesheet: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const weekDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const weekDates = weekDays.map((_, index) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + index);
    return date;
  });

  const projects = [
    { id: 'proj1', name: 'E-commerce Platform' },
    { id: 'proj2', name: 'Mobile App Redesign' },
    { id: 'proj3', name: 'API Integration' },
  ];

  const getDailyTotal = (day: string) => {
    return entries.reduce((sum, entry) => sum + (entry.hours[day] || 0), 0);
  };

  const getWeeklyTotal = () => {
    return weekDays.reduce((sum, day) => sum + getDailyTotal(day), 0);
  };

  const getEntryTotal = (entry: TimesheetEntry) => {
    return weekDays.reduce((sum, day) => sum + (entry.hours[day] || 0), 0);
  };

  const handleHoursChange = (entryId: string, day: string, value: string) => {
    const hours = parseFloat(value) || 0;
    if (hours < 0 || hours > 24) return;

    setEntries(entries.map(entry => 
      entry.id === entryId
        ? { ...entry, hours: { ...entry.hours, [day]: hours } }
        : entry
    ));
  };

  const addNewEntry = () => {
    const newEntry: TimesheetEntry = {
      id: Date.now().toString(),
      projectId: '',
      projectName: '',
      hours: {},
    };
    setEntries([...entries, newEntry]);
  };

  const deleteEntry = (entryId: string) => {
    setEntries(entries.filter(entry => entry.id !== entryId));
  };

  const handleSaveDraft = async () => {
    if (useApi) {
      setIsSaving(true);
      try {
        const weekStartDate = currentWeekStart.toISOString().split('T')[0];
        
        // Convert entries to API format
        const apiEntries = entries.flatMap(entry => {
          return weekDays.map((day, index) => {
            const hours = entry.hours[day];
            if (!hours || hours === 0) return null;
            
            const workDate = new Date(currentWeekStart);
            workDate.setDate(currentWeekStart.getDate() + index);
            
            return {
              project_id: parseInt(entry.projectId) || 1,
              task_id: entry.taskId ? parseInt(entry.taskId) : undefined,
              work_date: workDate.toISOString().split('T')[0],
              hours: hours,
              note: entry.taskName,
            };
          }).filter(e => e !== null);
        });
        
        await timesheetApi.save({
          week_start_date: weekStartDate,
          status: 'draft',
          entries: apiEntries as any,
          user_id: parseInt(user.id),
        });
        
        toast.success('Timesheet saved as draft');
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(`Failed to save timesheet: ${error.message}`);
        }
      } finally {
        setIsSaving(false);
      }
    } else {
      toast.success('Timesheet saved as draft (Mock Mode)');
    }
  };

  const handleSubmit = async () => {
    if (useApi) {
      setIsSaving(true);
      try {
        const weekStartDate = currentWeekStart.toISOString().split('T')[0];
        
        // Convert entries to API format
        const apiEntries = entries.flatMap(entry => {
          return weekDays.map((day, index) => {
            const hours = entry.hours[day];
            if (!hours || hours === 0) return null;
            
            const workDate = new Date(currentWeekStart);
            workDate.setDate(currentWeekStart.getDate() + index);
            
            return {
              project_id: parseInt(entry.projectId) || 1,
              task_id: entry.taskId ? parseInt(entry.taskId) : undefined,
              work_date: workDate.toISOString().split('T')[0],
              hours: hours,
              note: entry.taskName,
            };
          }).filter(e => e !== null);
        });
        
        await timesheetApi.submit({
          week_start_date: weekStartDate,
          status: 'submitted',
          entries: apiEntries as any,
          user_id: parseInt(user.id),
        });
        
        setStatus('submitted');
        setShowSubmitDialog(false);
        toast.success('Timesheet submitted for approval');
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(`Failed to submit timesheet: ${error.message}`);
        }
      } finally {
        setIsSaving(false);
      }
    } else {
      setStatus('submitted');
      setShowSubmitDialog(false);
      toast.success('Timesheet submitted for approval (Mock Mode)');
    }
  };

  const previousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const formatWeekRange = () => {
    const endDate = new Date(currentWeekStart);
    endDate.setDate(currentWeekStart.getDate() + 6);
    return `${currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>My Timesheet</h1>
          <p className="text-gray-500">Log your hours by project and task</p>
        </div>
        <Badge variant={
          status === 'approved' ? 'default' :
          status === 'submitted' ? 'secondary' :
          status === 'rejected' ? 'destructive' :
          'outline'
        }>
          {status.toUpperCase()}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{formatWeekRange()}</CardTitle>
              <CardDescription>Weekly timesheet entry</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={previousWeek} disabled={status === 'submitted'}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextWeek} disabled={status === 'submitted'}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 min-w-[200px]">Project / Task</th>
                  {weekDates.map((date, index) => (
                    <th key={index} className="text-center p-3 min-w-[100px]">
                      <div className="text-sm">{weekDays[index].toUpperCase()}</div>
                      <div className="text-xs text-gray-500">{date.getDate()}</div>
                    </th>
                  ))}
                  <th className="text-center p-3 min-w-[80px]">Total</th>
                  <th className="p-3 w-[80px]"></th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr key={entry.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      {entry.projectName ? (
                        <div>
                          <p>{entry.projectName}</p>
                          {entry.taskName && (
                            <p className="text-sm text-gray-500">{entry.taskName}</p>
                          )}
                        </div>
                      ) : (
                        <Select
                          value={entry.projectId}
                          onValueChange={(value) => {
                            const project = projects.find(p => p.id === value);
                            setEntries(entries.map(e =>
                              e.id === entry.id
                                ? { ...e, projectId: value, projectName: project?.name || '' }
                                : e
                            ));
                          }}
                          disabled={status === 'submitted'}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                          <SelectContent>
                            {projects.map(project => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </td>
                    {weekDays.map(day => (
                      <td key={day} className="p-2 text-center">
                        <Input
                          type="number"
                          min="0"
                          max="24"
                          step="0.5"
                          value={entry.hours[day] || ''}
                          onChange={(e) => handleHoursChange(entry.id, day, e.target.value)}
                          className="w-20 text-center"
                          disabled={status === 'submitted'}
                        />
                      </td>
                    ))}
                    <td className="p-3 text-center">
                      {getEntryTotal(entry).toFixed(1)}
                    </td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEntry(entry.id)}
                        disabled={status === 'submitted'}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2">
                  <td className="p-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addNewEntry}
                      className="gap-2"
                      disabled={status === 'submitted'}
                    >
                      <Plus className="w-4 h-4" />
                      Add Row
                    </Button>
                  </td>
                  {weekDays.map(day => (
                    <td key={day} className="p-3 text-center">
                      {getDailyTotal(day).toFixed(1)}
                    </td>
                  ))}
                  <td className="p-3 text-center">
                    {getWeeklyTotal().toFixed(1)}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6 pt-6 border-t">
            <div className="text-sm text-gray-500">
              Expected: 40 hours | Logged: {getWeeklyTotal().toFixed(1)} hours
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                className="gap-2"
                disabled={status === 'submitted'}
              >
                <Save className="w-4 h-4" />
                Save Draft
              </Button>
              <Button
                onClick={() => setShowSubmitDialog(true)}
                className="gap-2"
                disabled={status === 'submitted'}
              >
                <Send className="w-4 h-4" />
                Submit Week
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Timesheet?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your timesheet for {formatWeekRange()}?
              Once submitted, you won't be able to make changes until it's approved or rejected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
