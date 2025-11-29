import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingDown, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { User } from '../../App';
import { Sprint, BurndownPoint } from '../../services/sprints-api';

interface BurndownChartProps {
  sprintId: string;
  user: User;
  navigateTo: (page: string, params?: any) => void;
}

const mockSprint: Sprint = {
  id: 2,
  project_id: 1,
  name: 'Sprint 2 - Authentication',
  goal: 'Implement user authentication and authorization',
  start_date: '2024-11-15',
  end_date: '2024-11-28',
  status: 'active',
  created_at: '2024-11-14T10:00:00Z',
  updated_at: '2024-11-15T09:00:00Z'
};

// Generate burndown data
const generateBurndownData = () => {
  const startDate = new Date('2024-11-15');
  const endDate = new Date('2024-11-28');
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalTasks = 15;

  const data = [];
  
  // Ideal burndown (straight line)
  for (let i = 0; i <= totalDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const idealRemaining = totalTasks - (totalTasks / totalDays) * i;
    
    // Actual burndown (with some variance)
    let actualRemaining;
    if (i === 0) {
      actualRemaining = totalTasks;
    } else if (i <= 4) {
      // Current progress (days 1-4)
      actualRemaining = totalTasks - (i * 1.5); // Slightly behind
    } else {
      // Future (null for days not yet passed)
      actualRemaining = null;
    }

    data.push({
      day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      date: date.toISOString().split('T')[0],
      ideal: Math.max(0, Math.round(idealRemaining)),
      actual: actualRemaining !== null ? Math.max(0, Math.round(actualRemaining)) : null,
    });
  }

  return data;
};

export function BurndownChart({ sprintId, user, navigateTo }: BurndownChartProps) {
  const [sprint] = useState<Sprint>(mockSprint);
  const [burndownData] = useState(generateBurndownData());
  const [isLoading, setIsLoading] = useState(false);

  const currentDay = burndownData.find(d => d.actual !== null && 
    burndownData.indexOf(d) === burndownData.filter(x => x.actual !== null).length - 1
  );
  
  const idealForToday = currentDay?.ideal || 0;
  const actualForToday = currentDay?.actual || 0;
  const variance = actualForToday - idealForToday;
  const isOnTrack = variance <= 0;

  return (
    <div className="p-6 space-y-6 bg-background">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateTo('sprint-detail', { sprintId })}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sprint
        </Button>
      </div>

      {/* Sprint Info */}
      <Card className="shadow-sm border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="w-6 h-6 text-primary" />
                <h1 className="text-2xl">{sprint.name} - Burndown Chart</h1>
              </div>
              <p className="text-muted-foreground">{sprint.goal}</p>
            </div>
            <Badge className={isOnTrack ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
              {isOnTrack ? 'On Track' : 'Behind Schedule'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Sprint Duration</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl">
              {Math.ceil((new Date(sprint.end_date).getTime() - new Date(sprint.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Tasks Remaining</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl">{actualForToday}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Ideal Remaining</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl">{idealForToday}</p>
          </CardContent>
        </Card>

        <Card className={`shadow-sm ${!isOnTrack ? 'border-yellow-500' : ''}`}>
          <CardHeader className="pb-3">
            <CardDescription>Variance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl ${variance > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
              {variance > 0 ? '+' : ''}{variance}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Burndown Chart */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Burndown Chart</CardTitle>
              <CardDescription>
                Remaining tasks over sprint duration
              </CardDescription>
            </div>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4 mt-0.5" />
              <div className="max-w-md">
                <p className="mb-2">
                  The burndown chart shows the ideal vs. actual task completion rate.
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li><span className="text-blue-600">Blue line</span>: Ideal burndown (straight line from start to zero)</li>
                  <li><span className="text-green-600">Green line</span>: Actual burndown (real progress)</li>
                  <li>If actual is above ideal, the team is behind schedule</li>
                  <li>If actual is below ideal, the team is ahead of schedule</li>
                </ul>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={burndownData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                label={{ value: 'Tasks Remaining', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px' }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="ideal" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Ideal Burndown"
                dot={{ fill: '#3b82f6', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Actual Burndown"
                dot={{ fill: '#10b981', r: 4 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Sprint Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isOnTrack ? (
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                <div>
                  <p className="font-medium text-green-900">Sprint is on track</p>
                  <p className="text-sm text-green-700 mt-1">
                    The team is meeting or exceeding the ideal burndown rate. Keep up the great work!
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                <div>
                  <p className="font-medium text-yellow-900">Sprint is behind schedule</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    The team has {variance} more task(s) remaining than ideal. Consider reviewing task complexity or team capacity.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="p-4 border rounded-lg">
                <h4 className="text-sm mb-2">Average Daily Velocity</h4>
                <p className="text-2xl">
                  {((burndownData[0].ideal - actualForToday) / burndownData.filter(d => d.actual !== null).length).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">tasks per day</p>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="text-sm mb-2">Projected Completion</h4>
                <p className="text-2xl">
                  {new Date(sprint.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.ceil((new Date(sprint.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
