// ProjectTasks.tsx
import React, { useState, useEffect } from 'react';
// import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  ArrowLeft,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  Calendar,
  User,
  FolderKanban,
  Target,
  AlertCircle,
  Eye,
  GripVertical,
  List,
  Kanban,
  Clock,
  Loader2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

// Dnd-kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  DropAnimation,
  defaultDropAnimation,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ProjectTask {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  assignee: string;
  assigneeId: number;
  assigned_by: string;
  assigned_by_id: number;
  due_date: string;
  has_publish_date: boolean;
  publish_date: string;
  created_at: string;
  blocker_reason?: string;
}

interface Project {
  id: string;
  name: string;
  client: string;
  manager: string;
  start_date: string;
  end_date: string;
  status: string;
  members: any[];
}

const KANBAN_COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100', status: 'todo' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-50', status: 'in_progress' },
  { id: 'done', title: 'Done', color: 'bg-green-50', status: 'done' },
  { id: 'blocked', title: 'Blockers', color: 'bg-red-50', status: 'blocked' },
];

const TAB_STATUS_OPTIONS = [
  { id: 'all', title: 'All Tasks', status: 'all' },
  { id: 'todo', title: 'To Do', status: 'todo' },
  { id: 'in_progress', title: 'In Progress', status: 'in_progress' },
  { id: 'done', title: 'Done', status: 'done' },
  { id: 'blocked', title: 'Blockers', status: 'blocked' },
];

// Mock data
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce Platform',
    client: 'Retail Corp',
    manager: 'John Doe',
    start_date: '2024-10-15',
    end_date: '2025-01-15',
    status: 'active',
    members: [
      { id: 1, name: 'John Doe', role: 'Manager' },
      { id: 2, name: 'Jane Smith', role: 'Developer' },
      { id: 3, name: 'Mike Johnson', role: 'Designer' },
      { id: 4, name: 'Sarah Wilson', role: 'QA' }
    ]
  }
];

const mockTasks: ProjectTask[] = [
  {
    id: 1,
    title: 'Design user authentication flow',
    description: 'Create wireframes and user stories for login/signup functionality',
    priority: 'high',
    status: 'todo',
    assignee: 'Mike Johnson',
    assigneeId: 3,
    assigned_by: 'John Doe',
    assigned_by_id: 1,
    due_date: '2024-11-15',
    has_publish_date: true,
    publish_date: '2024-11-20',
    created_at: '2024-10-01'
  },
  {
    id: 2,
    title: 'Implement product catalog API',
    description: 'Build REST APIs for product management and search',
    priority: 'high',
    status: 'in_progress',
    assignee: 'Jane Smith',
    assigneeId: 2,
    assigned_by: 'John Doe',
    assigned_by_id: 1,
    due_date: '2024-11-20',
    has_publish_date: false,
    publish_date: '',
    created_at: '2024-10-02'
  },
  {
    id: 3,
    title: 'Setup database schema',
    description: 'Design and implement PostgreSQL database schema',
    priority: 'medium',
    status: 'done',
    assignee: 'John Doe',
    assigneeId: 1,
    assigned_by: 'Jane Smith',
    assigned_by_id: 2,
    due_date: '2024-10-25',
    has_publish_date: false,
    publish_date: '',
    created_at: '2024-09-28'
  },
  {
    id: 4,
    title: 'Payment gateway integration',
    description: 'Waiting for API credentials from finance team',
    priority: 'high',
    status: 'blocked',
    assignee: 'Jane Smith',
    assigneeId: 2,
    assigned_by: 'John Doe',
    assigned_by_id: 1,
    due_date: '2024-12-01',
    has_publish_date: true,
    publish_date: '2024-12-05',
    created_at: '2024-10-05',
    blocker_reason: 'Waiting for API credentials from the finance department. Expected delivery: 2024-11-15'
  }
];

// Custom drop animation
const dropAnimationConfig: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.5,
};

// Sortable Task Card Component
function SortableTaskCard({
  task,
  onTaskClick,
  onEditTask,
  onDeleteClick,
  onStatusChange,
  getPriorityBadge,
  dropdownOpen,
  setDropdownOpen,
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      className="transition-all duration-200"
    >
      <Card 
        className={`cursor-pointer hover:shadow-md transition-all duration-200 h-full flex flex-col ${
          isDragging 
            ? 'shadow-xl ring-2 ring-blue-500 scale-105 z-50' 
            : 'hover:scale-[1.02] hover:shadow-lg'
        }`}
      >
        <CardContent className="p-4 flex-1 flex flex-col" onClick={() => onTaskClick(task)}>
          <div className="space-y-3 flex-1">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2 flex-1">
                <div 
                  className="mt-1 cursor-grab active:cursor-grabbing hover:bg-blue-100 p-1 rounded transition-colors duration-150"
                  {...listeners}
                  onMouseDown={handleMouseDown}
                  title="Drag to move"
                >
                  <GripVertical className="w-4 h-4 text-gray-500 hover:text-blue-600 transition-colors" />
                </div>
                <h4 className="font-medium text-sm leading-tight flex-1">
                  {task.title}
                </h4>
              </div>
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDropdownOpen(dropdownOpen === task.id ? null : task.id);
                  }}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
                
                {dropdownOpen === task.id && (
                  <div 
                    className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border z-50 animate-in fade-in-0 zoom-in-95"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-1">
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => onTaskClick(task)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => onEditTask(task)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                        onClick={() => onDeleteClick(task)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {task.description && (
              <p className="text-xs text-gray-600 line-clamp-2">
                {task.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              {getPriorityBadge(task.priority)}
              <Select
                value={task.status}
                onValueChange={(value) => onStatusChange(task.id, value)}
              >
                <SelectTrigger 
                  className="h-6 text-xs w-24 transition-all hover:bg-gray-50" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KANBAN_COLUMNS.map(col => (
                    <SelectItem key={col.id} value={col.status}>
                      {col.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {task.assignee && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <User className="w-3 h-3" />
                <span>Assigned to: {task.assignee}</span>
              </div>
            )}

            {task.has_publish_date && task.publish_date && (
              <div className="flex items-center gap-2 text-xs text-purple-500">
                <Calendar className="w-3 h-3" />
                <span>Publish: {new Date(task.publish_date).toLocaleDateString()}</span>
              </div>
            )}

            {task.due_date && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
              </div>
            )}

            {task.status === 'blocked' && task.blocker_reason && (
              <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="flex-1">{task.blocker_reason}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Task Card for Drag Overlay
function TaskCardOverlay({ 
  task, 
  getPriorityBadge 
}: { 
  task: ProjectTask; 
  getPriorityBadge: (priority: string) => JSX.Element;
}) {
  return (
    <Card className="cursor-grabbing shadow-xl ring-2 ring-blue-500 scale-105 transition-all duration-200 z-50">
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 flex-1">
              <div className="mt-1 p-1">
                <GripVertical className="w-4 h-4 text-blue-600" />
              </div>
              <h4 className="font-medium text-sm leading-tight flex-1">
                {task.title}
              </h4>
            </div>
          </div>
          
          {task.description && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            {getPriorityBadge(task.priority)}
            <div className="h-6 text-xs w-24 px-2 py-1 bg-white border rounded-md flex items-center justify-center">
              {KANBAN_COLUMNS.find(col => col.status === task.status)?.title || task.status}
            </div>
          </div>

          {task.assignee && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <User className="w-3 h-3" />
              <span>Assigned to: {task.assignee}</span>
            </div>
          )}

          {task.assigned_by && (
            <div className="flex items-center gap-2 text-xs text-blue-500">
              <User className="w-3 h-3" />
              <span>Assigned by: {task.assigned_by}</span>
            </div>
          )}

          {task.has_publish_date && task.publish_date && (
            <div className="flex items-center gap-2 text-xs text-purple-500">
              <Calendar className="w-3 h-3" />
              <span>Publish: {new Date(task.publish_date).toLocaleDateString()}</span>
            </div>
          )}

          {task.due_date && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Sortable Column Component
function SortableColumn({
  column,
  tasks,
  onTaskClick,
  onEditTask,
  onDeleteClick,
  onStatusChange,
  getPriorityBadge,
  dropdownOpen,
  setDropdownOpen,
  onAddTask,
  isOver = false
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="space-y-4 transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{column.title}</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="transition-all duration-200">{tasks.length}</Badge>
          {column.id === 'todo' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 transition-all hover:scale-110"
              onClick={() => onAddTask(column.status)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      <div 
        className={`${column.color} rounded-lg p-4 min-h-[600px] space-y-4 transition-all duration-300 ${
          isOver 
            ? 'ring-4 ring-blue-400 bg-blue-100 scale-[1.02] shadow-lg' 
            : 'hover:shadow-md'
        }`}
      >
        <SortableContext items={tasks.map((task: ProjectTask) => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.length > 0 ? (
            tasks.map((task: ProjectTask) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onTaskClick={onTaskClick}
                onEditTask={onEditTask}
                onDeleteClick={onDeleteClick}
                onStatusChange={onStatusChange}
                getPriorityBadge={getPriorityBadge}
                dropdownOpen={dropdownOpen}
                setDropdownOpen={setDropdownOpen}
              />
            ))
          ) : (
            <div 
              className={`flex flex-col items-center justify-center h-40 text-center p-4 border-2 border-dashed rounded-lg transition-all duration-300 ${
                isOver 
                  ? 'border-blue-400 bg-blue-50 scale-105' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <p className="text-sm text-gray-500 font-medium mb-2 transition-all duration-300">
                {isOver ? 'Drop task here' : `No ${column.title.toLowerCase()} tasks`}
              </p>
              <p className="text-xs text-gray-400 transition-all duration-300">
                {isOver ? 'Release to move task' : 'No tasks in this column'}
              </p>
              {column.id === 'todo' && !isOver && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 transition-all hover:scale-105"
                  onClick={() => onAddTask(column.status)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Task
                </Button>
              )}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}


// List View Task Row Component
function ListViewTaskRow({ 
  task, 
  onTaskClick, 
  onEditTask, 
  onDeleteClick, 
  onStatusChange, 
  getPriorityBadge,
  dropdownOpen,
  setDropdownOpen 
}: any) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <div className="p-4 hover:bg-gray-50 transition-colors duration-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 w-6">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 
                  className="font-medium text-sm truncate cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => onTaskClick(task)}
                >
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-xs text-gray-500 truncate mt-1">
                    {task.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="w-24">
                {getPriorityBadge(task.priority)}
              </div>
              
              <div className="w-32">
                <Select
                  value={task.status}
                  onValueChange={(value) => onStatusChange(task.id, value)}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KANBAN_COLUMNS.map(col => (
                      <SelectItem key={col.id} value={col.status}>
                        {col.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-32 text-sm text-gray-600 truncate">
                {task.assignee}
              </div>
              
              <div className="w-24 text-xs text-gray-500">
                {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
              </div>
              
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDropdownOpen(dropdownOpen === task.id ? null : task.id);
                  }}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
                
                {dropdownOpen === task.id && (
                  <div 
                    className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border z-50 animate-in fade-in-0 zoom-in-95"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-1">
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => onTaskClick(task)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => onEditTask(task)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                        onClick={() => onDeleteClick(task)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {task.status === 'blocked' && task.blocker_reason && (
          <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-2 rounded mt-2">
            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span className="flex-1">{task.blocker_reason}</span>
          </div>
        )}
      </div>
    </div>
  );
}
// Status Accordion Section Component
function StatusAccordionSection({ 
  status, 
  title, 
  tasks, 
  onTaskClick, 
  onEditTask, 
  onDeleteClick, 
  onStatusChange, 
  getPriorityBadge,
  dropdownOpen,
  setDropdownOpen 
}: any) {
  return (
    <Collapsible className="border-b border-gray-200 last:border-b-0 cursor-pointer">
      <CollapsibleTrigger asChild>
        <button className="cursor-pointer flex items-center justify-between w-full px-6 py-4 hover:bg-gray-50 transition-colors text-left">
          <div className="flex items-center justify-between flex-1 pr-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                status === 'todo' ? 'bg-gray-400' :
                status === 'in_progress' ? 'bg-blue-500' :
                status === 'done' ? 'bg-green-500' :
                'bg-red-500'
              }`}></div>
              <span className="font-semibold text-lg">{title}</span>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-sm">
                {tasks.length} task{tasks.length !== 1 ? 's' : ''}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Click to {tasks.length > 0 ? 'expand' : 'view'}</span>
                <ChevronDown className="w-4 h-4 transition-transform duration-200 collapsible-chevron" />
              </div>
            </div>
          </div>
        </button>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        {tasks.length > 0 ? (
          <div className="border-t border-gray-200">
            {/* Table Header */}
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0 w-6">
           
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-gray-500">TASK</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="w-24">
                      <span className="text-xs font-medium text-gray-500">PRIORITY</span>
                    </div>
                    <div className="w-32">
                      <span className="text-xs font-medium text-gray-500">STATUS</span>
                    </div>
                    <div className="w-32">
                      <span className="text-xs font-medium text-gray-500">ASSIGNEE</span>
                    </div>
                    <div className="w-24">
                      <span className="text-xs font-medium text-gray-500">DUE DATE</span>
                    </div>
                    <div className="w-8">
                      <span className="text-xs font-medium text-gray-500">ACTIONS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks List */}
            <div className="divide-y divide-gray-200">
              {tasks.map((task: ProjectTask, index: number) => (
                <ListViewTaskRow
                  key={task.id}
                  task={task}
                  index={index}
                  onTaskClick={onTaskClick}
                  onEditTask={onEditTask}
                  onDeleteClick={onDeleteClick}
                  onStatusChange={onStatusChange}
                  getPriorityBadge={getPriorityBadge}
                  dropdownOpen={dropdownOpen}
                  setDropdownOpen={setDropdownOpen}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center px-6 border-t border-gray-200">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Target className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">No tasks in {title}</h3>
            <p className="text-gray-500 text-sm">
              No tasks are currently in this status.
            </p>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
// List View Component
function ListView({ 
  tasks, 
  activeTab, 
  onTaskClick, 
  onEditTask, 
  onDeleteClick, 
  onStatusChange, 
  getPriorityBadge,
  dropdownOpen,
  setDropdownOpen 
}: any) {
  const filteredTasks = activeTab === 'all' 
    ? tasks 
    : tasks.filter((task: ProjectTask) => task.status === activeTab);

  const getStatusCount = (status: string) => {
    return tasks.filter((task: ProjectTask) => task.status === status).length;
  };

  // Group tasks by status for accordion view
  const tasksByStatus = {
    todo: tasks.filter((task: ProjectTask) => task.status === 'todo'),
    in_progress: tasks.filter((task: ProjectTask) => task.status === 'in_progress'),
    done: tasks.filter((task: ProjectTask) => task.status === 'done'),
    blocked: tasks.filter((task: ProjectTask) => task.status === 'blocked'),
  };

  const statusConfig = [
    { status: 'todo', title: 'To Do', color: 'bg-gray-400' },
    { status: 'in_progress', title: 'In Progress', color: 'bg-blue-500' },
    { status: 'done', title: 'Done', color: 'bg-green-500' },
    { status: 'blocked', title: 'Blockers', color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Status Summary */}
      {/* <div className="grid grid-cols-5 gap-4">
        {TAB_STATUS_OPTIONS.map((tab) => (
          <Card key={tab.id} className={`transition-all duration-200 hover:shadow-md ${
            activeTab === tab.status ? 'ring-2 ring-blue-500' : ''
          }`}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {tab.status === 'all' ? tasks.length : getStatusCount(tab.status)}
              </div>
              <div className="text-sm text-gray-600 mt-1">{tab.title}</div>
            </CardContent>
          </Card>
        ))}
      </div> */}

      {/* Tasks Display */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <List className="w-5 h-5" />
            Tasks List - {TAB_STATUS_OPTIONS.find(tab => tab.status === activeTab)?.title}
          </CardTitle>
          <CardDescription>
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {activeTab === 'all' ? (
            // Collapsible view for All Tasks
            <div className="divide-y divide-gray-200">
              {statusConfig.map((statusInfo) => (
                <StatusAccordionSection
                  key={statusInfo.status}
                  status={statusInfo.status}
                  title={statusInfo.title}
                  tasks={tasksByStatus[statusInfo.status as keyof typeof tasksByStatus]}
                  onTaskClick={onTaskClick}
                  onEditTask={onEditTask}
                  onDeleteClick={onDeleteClick}
                  onStatusChange={onStatusChange}
                  getPriorityBadge={getPriorityBadge}
                  dropdownOpen={dropdownOpen}
                  setDropdownOpen={setDropdownOpen}
                />
              ))}
            </div>
          ) : (
            // Table view for individual status tabs
            <div>
              {/* Table Header */}
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-shrink-0 w-6">
                    
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium text-gray-500">TASK</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="w-24">
                        <span className="text-xs font-medium text-gray-500">PRIORITY</span>
                      </div>
                      <div className="w-32">
                        <span className="text-xs font-medium text-gray-500">STATUS</span>
                      </div>
                      <div className="w-32">
                        <span className="text-xs font-medium text-gray-500">ASSIGNEE</span>
                      </div>
                      <div className="w-24">
                        <span className="text-xs font-medium text-gray-500">DUE DATE</span>
                      </div>
                      <div className="w-8">
                        <span className="text-xs font-medium text-gray-500">ACTIONS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task: ProjectTask, index: number) => (
                    <ListViewTaskRow
                      key={task.id}
                      task={task}
                      index={index}
                      onTaskClick={onTaskClick}
                      onEditTask={onEditTask}
                      onDeleteClick={onDeleteClick}
                      onStatusChange={onStatusChange}
                      getPriorityBadge={getPriorityBadge}
                      dropdownOpen={dropdownOpen}
                      setDropdownOpen={setDropdownOpen}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Target className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                    <p className="text-gray-500 max-w-sm">
                      {activeTab === 'all' 
                        ? 'No tasks have been created for this project yet.' 
                        : `No tasks with status "${TAB_STATUS_OPTIONS.find(tab => tab.status === activeTab)?.title}" found.`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// List View Task Row Component


// Loading Component
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-gray-700">Loading Project Tasks</p>
        <p className="text-sm text-gray-500">Preparing your workspace...</p>
      </div>
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}

export function ProjectTasks() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false);
  const [showTaskDetailDialog, setShowTaskDetailDialog] = useState(false);
  const [showEditTaskDialog, setShowEditTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<ProjectTask | null>(null);
  const [activeTask, setActiveTask] = useState<ProjectTask | null>(null);
  const [activeView, setActiveView] = useState<'kanban' | 'list'>('kanban');
  const [activeTab, setActiveTab] = useState('all');
  const [overColumn, setOverColumn] = useState<string | null>(null);
  const [showBlockConfirmDialog, setShowBlockConfirmDialog] = useState(false);
  const [taskToBlock, setTaskToBlock] = useState<{ taskId: number; newStatus: string } | null>(null);
  const [blockerReason, setBlockerReason] = useState('');

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignee: '',
    due_date: '',
    status: 'todo' as string,
    has_publish_date: false,
    publish_date: '',
  });

  const [editTask, setEditTask] = useState({
    id: 0,
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignee: '',
    due_date: '',
    status: 'todo' as string,
    has_publish_date: false,
    publish_date: '',
    blocker_reason: '',
  });

  // Dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (id) {
      // Simulate API call with delay
      setTimeout(() => {
        const foundProject = mockProjects.find(p => p.id === id);
        if (foundProject) {
          setProject(foundProject);
          setTasks(mockTasks);
        }
        setIsLoading(false);
      }, 100);
    }
  }, [id]);

  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  // Drag and Drop Handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setOverColumn(null);
      return;
    }

    const overId = String(over.id);
    const overColumn = KANBAN_COLUMNS.find(col => col.id === overId);
    
    if (overColumn) {
      setOverColumn(overColumn.id);
    } else {
      // Check if over a task and get its column
      const overTask = tasks.find(t => t.id === over.id);
      if (overTask) {
        const taskColumn = KANBAN_COLUMNS.find(col => col.status === overTask.status);
        setOverColumn(taskColumn?.id || null);
      } else {
        setOverColumn(null);
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setOverColumn(null);
    
    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeTask = tasks.find(task => task.id === active.id);
    const overId = String(over.id);

    // Find the target column
    let targetColumn = KANBAN_COLUMNS.find(col => col.id === overId);
    
    // If dropping on a task, use that task's column
    if (!targetColumn) {
      const overTask = tasks.find(t => t.id === over.id);
      if (overTask) {
        targetColumn = KANBAN_COLUMNS.find(col => col.status === overTask.status);
      }
    }

    if (!activeTask || !targetColumn) {
      setActiveTask(null);
      return;
    }

    if (activeTask.status === targetColumn.status) {
      setActiveTask(null);
      return;
    }

    // Show confirmation dialog when moving to blocked status
    if (targetColumn.status === 'blocked') {
      setTaskToBlock({ taskId: activeTask.id, newStatus: targetColumn.status });
      setShowBlockConfirmDialog(true);
      setActiveTask(null);
      return;
    }

    // For other status changes, proceed directly
    const updatedTasks = tasks.map(task =>
      task.id === activeTask.id ? { ...task, status: targetColumn.status } : task
    );
    setTasks(updatedTasks);

    toast.success(`Task moved to ${targetColumn.title}`);
    setActiveTask(null);
  };

  const handleDragCancel = () => {
    setOverColumn(null);
    setActiveTask(null);
  };

  const handleTaskStatusUpdateWithConfirm = async (taskId: number, newStatus: string) => {
    if (newStatus === 'blocked') {
      setTaskToBlock({ taskId, newStatus });
      setShowBlockConfirmDialog(true);
      return;
    }

    await handleTaskStatusUpdate(taskId, newStatus);
  };

  const handleConfirmBlock = async () => {
    if (!taskToBlock || !blockerReason.trim()) {
      toast.error('Please provide a reason for blocking this task');
      return;
    }

    try {
      const updatedTasks = tasks.map(task =>
        task.id === taskToBlock.taskId 
          ? { ...task, status: taskToBlock.newStatus, blocker_reason: blockerReason }
          : task
      );
      setTasks(updatedTasks);

      toast.success('Task moved to Blockers with reason');
      setShowBlockConfirmDialog(false);
      setTaskToBlock(null);
      setBlockerReason('');
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleTaskStatusUpdate = async (taskId: number, newStatus: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus as any } : task
    );
    setTasks(updatedTasks);
    toast.success('Task status updated');
  };

  const handleTaskClick = (task: ProjectTask) => {
    setSelectedTask(task);
    setShowTaskDetailDialog(true);
  };

  const handleEditTask = (task: ProjectTask) => {
    setSelectedTask(task);
    setEditTask({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      assignee: task.assigneeId.toString(),
      due_date: task.due_date,
      status: task.status,
      has_publish_date: task.has_publish_date,
      publish_date: task.publish_date,
      blocker_reason: task.blocker_reason || ''
    });
    setShowTaskDetailDialog(false);
    setShowEditTaskDialog(true);
  };

  const handleCreateTask = () => {
    if (!newTask.title) {
      toast.error('Please enter task title');
      return;
    }

    const newTaskObj: ProjectTask = {
      id: Math.max(...tasks.map(t => t.id)) + 1,
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      status: newTask.status as any,
      assignee: project?.members.find(m => m.id === parseInt(newTask.assignee))?.name || 'Unassigned',
      assigneeId: parseInt(newTask.assignee),
      assigned_by: 'John Doe', // Default assigned by
      assigned_by_id: 1,
      due_date: newTask.due_date,
      has_publish_date: newTask.has_publish_date,
      publish_date: newTask.publish_date,
      created_at: new Date().toISOString().split('T')[0]
    };

    setTasks(prev => [...prev, newTaskObj]);
    toast.success('Task created successfully');
    setShowCreateTaskDialog(false);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      assignee: '',
      due_date: '',
      status: 'todo',
      has_publish_date: false,
      publish_date: '',
    });
  };

  const handleUpdateTask = () => {
    if (!editTask.title) {
      toast.error('Please enter task title');
      return;
    }

    const updatedTasks = tasks.map(task =>
      task.id === editTask.id
        ? {
            ...task,
            title: editTask.title,
            description: editTask.description,
            priority: editTask.priority,
            status: editTask.status as any,
            assignee: project?.members.find(m => m.id === parseInt(editTask.assignee))?.name || 'Unassigned',
            assigneeId: parseInt(editTask.assignee),
            due_date: editTask.due_date,
            has_publish_date: editTask.has_publish_date,
            publish_date: editTask.publish_date,
            blocker_reason: editTask.blocker_reason
          }
        : task
    );

    setTasks(updatedTasks);
    toast.success('Task updated successfully');
    setShowEditTaskDialog(false);
  };

  const handleDeleteTask = () => {
    if (!taskToDelete) return;

    setTasks(prev => prev.filter(task => task.id !== taskToDelete.id));
    toast.success('Task deleted successfully');
    setShowDeleteConfirmDialog(false);
    setTaskToDelete(null);
  };

  const handleDeleteClick = (task: ProjectTask) => {
    setTaskToDelete(task);
    setShowDeleteConfirmDialog(true);
    setDropdownOpen(null);
  };

  const handleAddTask = (status: string) => {
    setNewTask(prev => ({ ...prev, status }));
    setShowCreateTaskDialog(true);
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={`text-xs transition-all duration-200 ${variants[priority as keyof typeof variants]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!project) {
    return (
      <div className="p-6">
        <p>Project not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/project-grid')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-gray-500">Project Tasks - {activeView === 'kanban' ? 'Kanban View' : 'List View'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button className="gap-2 transition-all hover:scale-105" onClick={() => setShowCreateTaskDialog(true)}>
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Project Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <FolderKanban className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                  {project.status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Team Size</p>
                <p className="text-lg font-semibold">{project.members?.length || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Start Date</p>
                <p className="text-sm">{new Date(project.start_date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">End Date</p>
                <p className="text-sm">{new Date(project.end_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="w-80 border rounded-lg p-1 bg-white">
        <div className="flex">
          <button
            className={`flex-1 cursor-pointer flex items-center justify-center gap-2 py-1.5 px-3 text-sm font-medium rounded-md transition-all duration-200 ${
              activeView === 'kanban' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            onClick={() => setActiveView('kanban')}
          >
            <Kanban className="w-4 h-4" />
            Column View
          </button>
          <button
            className={`flex-1 flex cursor-pointer items-center justify-center gap-2 py-1.5 px-3 text-sm font-medium rounded-md transition-all duration-200 ${
              activeView === 'list' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            onClick={() => setActiveView('list')}
          >
            <List className="w-4 h-4" />
            List View
          </button>
        </div>
      </div>

      {/* Status Tabs for List View */}
      {activeView === 'list' && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            {TAB_STATUS_OPTIONS.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.status}
                className="flex items-center gap-2 transition-all duration-200"
              >
                {tab.title}
                <Badge variant="secondary" className="text-xs">
                  {tab.status === 'all' ? tasks.length : tasks.filter(t => t.status === tab.status).length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            <ListView
              tasks={tasks}
              activeTab={activeTab}
              onTaskClick={handleTaskClick}
              onEditTask={handleEditTask}
              onDeleteClick={handleDeleteClick}
              onStatusChange={handleTaskStatusUpdateWithConfirm}
              getPriorityBadge={getPriorityBadge}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Kanban View */}
      {activeView === 'kanban' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {KANBAN_COLUMNS.map(column => {
              const columnTasks = getTasksByStatus(column.status);
              const isColumnOver = overColumn === column.id;
              
              return (
                <SortableColumn
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                  onTaskClick={handleTaskClick}
                  onEditTask={handleEditTask}
                  onDeleteClick={handleDeleteClick}
                  onStatusChange={handleTaskStatusUpdateWithConfirm}
                  getPriorityBadge={getPriorityBadge}
                  dropdownOpen={dropdownOpen}
                  setDropdownOpen={setDropdownOpen}
                  onAddTask={handleAddTask}
                  isOver={isColumnOver}
                />
              );
            })}
          </div>

          <DragOverlay dropAnimation={dropAnimationConfig}>
            {activeTask ? (
              <TaskCardOverlay 
                task={activeTask} 
                getPriorityBadge={getPriorityBadge} 
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Task Detail Dialog */}
      <Dialog open={showTaskDetailDialog} onOpenChange={setShowTaskDetailDialog}>
        <DialogContent className="max-w-6xl" style={{ maxWidth: '90vw' ,width: '60vw'}}>
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedTask.title}
                </DialogTitle>
                <DialogDescription>
                  Complete task details and project information
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Project Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">Project Information</h3>
                  </div>
                  
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">Project Name</span>
                          <span className="font-semibold text-right">{project.name}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">Client</span>
                          <span className="text-right">{project.client}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">Project Status</span>
                          <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                            {project.status}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">Project Manager</span>
                          <span className="text-right">{project.manager}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">Team Size</span>
                          <span className="text-right">{project.members?.length || 0} members</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">Start Date</span>
                          <span className="text-right">{new Date(project.start_date).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">End Date</span>
                          <span className="text-right">{new Date(project.end_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Task Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-500" />
                    <h3 className="text-lg font-semibold">Task Information</h3>
                  </div>
                  
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      {/* Description */}
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Description</Label>
                        <p className="mt-1 text-sm">
                          {selectedTask.description || 'No description provided'}
                        </p>
                      </div>

                      {/* Priority and Status */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Priority</Label>
                          <div className="mt-1">
                            {getPriorityBadge(selectedTask.priority)}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Status</Label>
                          <div className="mt-1">
                            <Badge variant="outline">
                              {KANBAN_COLUMNS.find(col => col.status === selectedTask.status)?.title}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Assignment Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Assigned To</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{selectedTask.assignee}</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Assigned By</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <User className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-blue-600">{selectedTask.assigned_by}</span>
                          </div>
                        </div>
                      </div>

                      {/* Dates Information */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-500">Dates</Label>
                        <div className="grid grid-cols-2 gap-4">
                          {selectedTask.has_publish_date && selectedTask.publish_date && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-purple-400" />
                              <div>
                                <p className="text-xs text-gray-500">Publish Date</p>
                                <p className="text-sm text-purple-600">
                                  {new Date(selectedTask.publish_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Due Date</p>
                              <p className="text-sm">
                                {selectedTask.due_date 
                                  ? new Date(selectedTask.due_date).toLocaleDateString()
                                  : 'No due date'
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Created Date</p>
                              <p className="text-sm">
                                {new Date(selectedTask.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Blocker Reason */}
                      {selectedTask.status === 'blocked' && selectedTask.blocker_reason && (
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Blocking Reason</Label>
                          <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-red-700">{selectedTask.blocker_reason}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Task Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setShowTaskDetailDialog(false)}
                    >
                      Close
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => {
                        setShowTaskDetailDialog(false);
                        handleEditTask(selectedTask);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Task
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Block Confirmation Dialog */}
      <Dialog open={showBlockConfirmDialog} onOpenChange={setShowBlockConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              Confirm Move to Blockers
            </DialogTitle>
            <DialogDescription>
              Please provide a reason why this task is being blocked. This will help team members understand the issue.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {taskToBlock && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="font-medium text-amber-800">
                  {tasks.find(task => task.id === taskToBlock.taskId)?.title || 'Task'} will be moved to Blockers
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="blocker-reason">Blocking Reason *</Label>
              <Textarea
                id="blocker-reason"
                placeholder="Describe what's blocking this task (e.g., Waiting for API credentials, Design approval pending, etc.)"
                value={blockerReason}
                onChange={(e) => setBlockerReason(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-gray-500">This reason will be visible to all team members.</p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowBlockConfirmDialog(false);
                setTaskToBlock(null);
                setBlockerReason('');
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={handleConfirmBlock}
              disabled={!blockerReason.trim()}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Move to Blockers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={showCreateTaskDialog} onOpenChange={setShowCreateTaskDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Add a new task to this project</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Task Title *</Label>
              <Input
                id="task-title"
                placeholder="e.g., Design user authentication flow"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="transition-all focus:ring-2 focus:ring-blue-600 "
              />
            </div>

            <div>
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                placeholder="Task description and requirements..."
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="transition-all focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-priority">Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setNewTask({ ...newTask, priority: value })
                  }
                >
                  <SelectTrigger id="task-priority" className="transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="task-status">Status</Label>
                <Select
                  value={newTask.status}
                  onValueChange={(value) => setNewTask({ ...newTask, status: value })}
                >
                  <SelectTrigger id="task-status" className="transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KANBAN_COLUMNS.map(column => (
                      <SelectItem key={column.id} value={column.status}>
                        {column.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-assignee">Assign To</Label>
                <Select
                  value={newTask.assignee}
                  onValueChange={(value) => setNewTask({ ...newTask, assignee: value })}
                >
                  <SelectTrigger id="task-assignee" className="transition-all">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {project.members.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="task-due-date">Due Date</Label>
                <Input
                  id="task-due-date"
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  className="transition-all focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Publish Date Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="task-has-publish-date"
                  checked={newTask.has_publish_date}
                  onChange={(e) => setNewTask({ ...newTask, has_publish_date: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="task-has-publish-date" className="cursor-pointer">
                  Set Publish Date
                </Label>
              </div>

              {newTask.has_publish_date && (
                <div>
                  <Label htmlFor="task-publish-date">Publish Date</Label>
                  <Input
                    id="task-publish-date"
                    type="date"
                    value={newTask.publish_date}
                    onChange={(e) => setNewTask({ ...newTask, publish_date: e.target.value })}
                    className="transition-all focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTaskDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={showEditTaskDialog} onOpenChange={setShowEditTaskDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-task-title">Task Title *</Label>
              <Input
                id="edit-task-title"
                value={editTask.title}
                onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                className="transition-all focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <Label htmlFor="edit-task-description">Description</Label>
              <Textarea
                id="edit-task-description"
                value={editTask.description}
                onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                className="transition-all focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-task-priority">Priority</Label>
                <Select
                  value={editTask.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setEditTask({ ...editTask, priority: value })
                  }
                >
                  <SelectTrigger id="edit-task-priority" className="transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-task-status">Status</Label>
                <Select
                  value={editTask.status}
                  onValueChange={(value) => setEditTask({ ...editTask, status: value })}
                >
                  <SelectTrigger id="edit-task-status" className="transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KANBAN_COLUMNS.map(column => (
                      <SelectItem key={column.id} value={column.status}>
                        {column.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-task-assignee">Assign To</Label>
                <Select
                  value={editTask.assignee}
                  onValueChange={(value) => setEditTask({ ...editTask, assignee: value })}
                >
                  <SelectTrigger id="edit-task-assignee" className="transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {project.members.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-task-due-date">Due Date</Label>
                <Input
                  id="edit-task-due-date"
                  type="date"
                  value={editTask.due_date}
                  onChange={(e) => setEditTask({ ...editTask, due_date: e.target.value })}
                  className="transition-all focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Publish Date Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="edit-task-has-publish-date"
                  checked={editTask.has_publish_date}
                  onChange={(e) => setEditTask({ ...editTask, has_publish_date: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="edit-task-has-publish-date" className="cursor-pointer">
                  Set Publish Date
                </Label>
              </div>

              {editTask.has_publish_date && (
                <div>
                  <Label htmlFor="edit-task-publish-date">Publish Date</Label>
                  <Input
                    id="edit-task-publish-date"
                    type="date"
                    value={editTask.publish_date}
                    onChange={(e) => setEditTask({ ...editTask, publish_date: e.target.value })}
                    className="transition-all focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Blocker Reason Section */}
            {editTask.status === 'blocked' && (
              <div>
                <Label htmlFor="edit-task-blocker-reason">Blocking Reason</Label>
                <Textarea
                  id="edit-task-blocker-reason"
                  placeholder="Reason why this task is blocked..."
                  value={editTask.blocker_reason}
                  onChange={(e) => setEditTask({ ...editTask, blocker_reason: e.target.value })}
                  className="transition-all focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditTaskDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTask}>
              Update Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {taskToDelete && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-medium text-red-800">Task: {taskToDelete.title}</p>
                <p className="text-sm text-red-600 mt-1">
                  Assigned to: {taskToDelete.assignee}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteConfirmDialog(false);
                setTaskToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteTask}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}