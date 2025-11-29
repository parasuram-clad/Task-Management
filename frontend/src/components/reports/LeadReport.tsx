import { useState } from 'react';
import {
  Users2,
  Download,
  Filter,
  TrendingUp,
  DollarSign,
  Target,
  PhoneCall
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { User } from '../../App';

interface LeadReportProps {
  user: User;
}

const leadsByStatus = [
  { name: 'Open', value: 25, color: '#3b82f6' },
  { name: 'Qualified', value: 15, color: '#8b5cf6' },
  { name: 'Converted', value: 8, color: '#10b981' },
  { name: 'Lost', value: 12, color: '#6b7280' },
];

const leadsBySource = [
  { source: 'Website', count: 18, value: 85000 },
  { source: 'Referral', count: 12, value: 120000 },
  { source: 'LinkedIn', count: 10, value: 95000 },
  { source: 'Cold Outreach', count: 8, value: 45000 },
  { source: 'Trade Show', count: 6, value: 75000 },
  { source: 'Partner', count: 6, value: 60000 },
];

const monthlyTrend = [
  { month: 'Jul', leads: 8, converted: 2, value: 45000 },
  { month: 'Aug', leads: 12, converted: 3, value: 68000 },
  { month: 'Sep', leads: 10, converted: 2, value: 52000 },
  { month: 'Oct', leads: 15, converted: 4, value: 95000 },
  { month: 'Nov', leads: 18, converted: 5, value: 125000 },
];

const topPerformers = [
  { name: 'Sarah Johnson', leads: 25, converted: 8, value: 285000, conversionRate: 32 },
  { name: 'Mike Wilson', leads: 20, converted: 6, value: 195000, conversionRate: 30 },
  { name: 'John Doe', leads: 18, converted: 5, value: 175000, conversionRate: 28 },
  { name: 'Emily Davis', leads: 15, converted: 4, value: 145000, conversionRate: 27 },
];

const conversionFunnel = [
  { stage: 'Open', count: 100, percentage: 100 },
  { stage: 'Qualified', count: 60, percentage: 60 },
  { stage: 'Proposal', count: 35, percentage: 35 },
  { stage: 'Converted', count: 20, percentage: 20 },
];

export function LeadReport({ user }: LeadReportProps) {
  const [dateRange, setDateRange] = useState('this-month');
  const [sourceFilter, setSourceFilter] = useState('all');

  const totalLeads = leadsByStatus.reduce((sum, item) => sum + item.value, 0);
  const totalValue = leadsBySource.reduce((sum, item) => sum + item.value, 0);
  const convertedLeads = leadsByStatus.find(s => s.name === 'Converted')?.value || 0;
  const conversionRate = Math.round((convertedLeads / totalLeads) * 100);

  const handleExport = () => {
    console.log('Exporting lead report...');
  };

  return (
    <div className="p-6 space-y-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <Users2 className="w-8 h-8 text-primary" />
            Lead Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Sales pipeline and lead conversion analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="this-quarter">This Quarter</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Users2 className="w-4 h-4" />
              Total Leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{totalLeads}</p>
            <p className="text-xs text-green-600 mt-1">+12% vs last month</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Conversion Rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{conversionRate}%</p>
            <p className="text-xs text-green-600 mt-1">+3% vs last month</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Pipeline Value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">${(totalValue / 1000).toFixed(0)}K</p>
            <p className="text-xs text-green-600 mt-1">+18% vs last month</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-indigo-500">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4" />
              Avg Response Time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">4.2h</p>
            <p className="text-xs text-red-600 mt-1">+0.5h vs last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Lead Generation Trend</CardTitle>
            <CardDescription>Monthly lead count and conversions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="leads" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} name="Total Leads" />
                <Area type="monotone" dataKey="converted" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.8} name="Converted" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pipeline Value Trend */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Pipeline Value Trend</CardTitle>
            <CardDescription>Monthly pipeline value</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} name="Value ($)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Status Distribution */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Lead Status Distribution</CardTitle>
            <CardDescription>Breakdown by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leadsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {leadsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Source Performance */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Lead Source Performance</CardTitle>
            <CardDescription>Leads and value by source</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leadsBySource}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="count" fill="#6366f1" name="Count" />
                <Bar yAxisId="right" dataKey="value" fill="#10b981" name="Value ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>Lead progression through sales stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conversionFunnel.map((stage, index) => (
              <div key={stage.stage}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{stage.stage}</span>
                  <span className="text-sm text-muted-foreground">
                    {stage.count} leads ({stage.percentage}%)
                  </span>
                </div>
                <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
                  <div
                    className={`h-full flex items-center justify-center transition-all ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-purple-500' :
                      index === 2 ? 'bg-orange-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${stage.percentage}%` }}
                  >
                    <span className="text-sm text-white font-medium">{stage.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>Lead owners by performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Owner</TableHead>
                  <TableHead>Total Leads</TableHead>
                  <TableHead>Converted</TableHead>
                  <TableHead>Pipeline Value</TableHead>
                  <TableHead>Conversion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPerformers.map(performer => (
                  <TableRow key={performer.name}>
                    <TableCell className="font-medium">{performer.name}</TableCell>
                    <TableCell>{performer.leads}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{performer.converted}</Badge>
                    </TableCell>
                    <TableCell>${performer.value.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${performer.conversionRate}%` }}
                          />
                        </div>
                        <span className="text-sm">{performer.conversionRate}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
