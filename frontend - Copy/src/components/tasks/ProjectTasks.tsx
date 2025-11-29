// ProjectTasks.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  ArrowLeft,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  Calendar,
  Clock,
  User,
  FolderKanban,
  Target,
  AlertCircle,
  Eye,
  GripVertical,
  ChevronDown,
  ChevronRight,
  List,
  Kanban
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { toast } from 'sonner';
import { projectApi, taskApi, Project as ApiProject, Task, employeeApi, Employee } from '../../services/api';
import { ApiError } from '../../services/api-client';

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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ProjectTasksProps {
  user: any;
}

// Update the ProjectTask interface
interface ProjectTask extends Task {
  assignee_name?: string;
  assignee_id?: number;
  has_publish_date?: boolean;
  publish_date?: string;
}


// Update KANBAN_COLUMNS to match backend status values
const KANBAN_COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100', status: 'todo' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-50', status: 'in_progress' },
  { id: 'done', title: 'Done', color: 'bg-green-50', status: 'done' },
  { id: 'blocked', title: 'Blocked', color: 'bg-red-50', status: 'blocked' },
];

// Tab view status options
const TAB_STATUS_OPTIONS = [
  { id: 'all', title: 'All Tasks', status: 'all' },
  { id: 'todo', title: 'To Do', status: 'todo' },
  { id: 'in_progress', title: 'In Progress', status: 'in_progress' },
  { id: 'blocked', title: 'Blocked', status: 'blocked' },
  { id: 'done', title: 'Done', status: 'done' },
];

// Helper function to map frontend display names to backend status values
const getBackendStatus = (frontendStatus: string): string => {
  const statusMap: { [key: string]: string } = {
    'todo': 'todo',
    'in-progress': 'in_progress',
    'in_progress': 'in_progress',
    'blocked': 'blocked',
    'done': 'done'
  };
  return statusMap[frontendStatus] || frontendStatus;
};

// Helper function to map backend status to frontend display
const getFrontendStatus = (backendStatus: string): string => {
  const statusMap: { [key: string]: string } = {
    'todo': 'todo',
    'in_progress': 'in_progress',
    'blocked': 'blocked',
    'done': 'done'
  };
  return statusMap[backendStatus] || backendStatus;
};

// Helper function to capitalize text
const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Helper function to capitalize display text
const capitalizeDisplayText = (text: string): string => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Custom drop animation
const dropAnimationConfig: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.5,
  keyframe({ transform }) {
    return [
      { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
      { opacity: 0, transform: CSS.Transform.toString(transform.final) },
    ];
  },
};

// Sortable Task Card Component
interface SortableTaskCardProps {
  task: ProjectTask;
  onTaskClick: (task: ProjectTask) => void;
  onEditTask: (task: ProjectTask) => void;
  onDeleteClick: (task: ProjectTask) => void;
  onStatusChange: (taskId: number, newStatus: string) => void;
  getPriorityBadge: (priority: string) => JSX.Element;
  companyUsers: Employee[];
  dropdownOpen: number | null;
  setDropdownOpen: (id: number | null) => void;
  isDragging?: boolean;
}

function SortableTaskCard({
  task,
  onTaskClick,
  onEditTask,
  onDeleteClick,
  onStatusChange,
  getPriorityBadge,
  companyUsers,
  dropdownOpen,
  setDropdownOpen,
  isDragging = false
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.8 : 1,
  };

  const handleViewTask = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen(null);
    onTaskClick(task);
  };

  const handleEditTask = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen(null);
    onEditTask(task);
  };

  const handleDeleteTask = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen(null);
    onDeleteClick(task);
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      className={`transition-all duration-200 ${isSortableDragging ? 'z-50' : ''}`}
    >
      <Card 
        className={`cursor-pointer hover:shadow-md transition-all duration-200 h-full flex flex-col ${
          isSortableDragging 
            ? 'shadow-xl ring-2 ring-blue-500 scale-105' 
            : 'hover:scale-[1.02] hover:shadow-lg'
        } ${isDragging ? 'opacity-30' : ''}`}
        onClick={() => onTaskClick(task)}
      >
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="space-y-3 flex-1">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2 flex-1">
                <div 
                  className="mt-1 cursor-grab active:cursor-grabbing hover:bg-blue-100 p-1 rounded transition-colors duration-150"
                  {...listeners}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  title="Drag to move"
                >
                  <GripVertical className="w-4 h-4 text-gray-500 hover:text-blue-600 transition-colors" />
                </div>
                <h4 className="font-medium text-sm leading-tight flex-1">
                  {capitalizeDisplayText(task.title)}
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
                        onClick={handleViewTask}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={handleEditTask}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                        onClick={handleDeleteTask}
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
                {capitalizeDisplayText(task.description)}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              {getPriorityBadge(task.priority)}
              <Select
                value={task.status}
                onValueChange={(value) => onStatusChange(task.id, value)}
              >
                <SelectTrigger className="h-6 text-xs w-24 transition-all hover:bg-gray-50" onClick={(e) => e.stopPropagation()}>
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

            {task.assigned_to && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <User className="w-3 h-3" />
                <span>{task.assignee_name || 'Unassigned'}</span>
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
                <span> Due: {new Date(task.due_date).toLocaleDateString()}</span>
              </div>
            )}

          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Task Card for Drag Overlay (non-sortable version)
function TaskCardOverlay({ 
  task, 
  getPriorityBadge 
}: { 
  task: ProjectTask; 
  getPriorityBadge: (priority: string) => JSX.Element;
}) {
  return (
    <Card className="cursor-grabbing shadow-xl ring-2 ring-blue-500 scale-105 transition-all duration-200">
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 flex-1">
              <div className="mt-1 p-1">
                <GripVertical className="w-4 h-4 text-blue-600" />
              </div>
              <h4 className="font-medium text-sm leading-tight flex-1">
                {capitalizeDisplayText(task.title)}
              </h4>
            </div>
          </div>
          
          {task.description && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {capitalizeDisplayText(task.description)}
            </p>
          )}
          <div className="flex items-center justify-between">
            {getPriorityBadge(task.priority)}
            <div className="h-6 text-xs w-24 px-2 py-1 bg-white border rounded-md flex items-center justify-center">
              {KANBAN_COLUMNS.find(col => col.status === task.status)?.title || task.status}
            </div>
          </div>

          {task.assigned_to && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <User className="w-3 h-3" />
              <span>{task.assignee_name || 'Unassigned'}</span>
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
interface SortableColumnProps {
  column: typeof KANBAN_COLUMNS[0];
  tasks: ProjectTask[];
  onTaskClick: (task: ProjectTask) => void;
  onEditTask: (task: ProjectTask) => void;
  onDeleteClick: (task: ProjectTask) => void;
  onStatusChange: (taskId: number, newStatus: string) => void;
  getPriorityBadge: (priority: string) => JSX.Element;
  companyUsers: Employee[];
  dropdownOpen: number | null;
  setDropdownOpen: (id: number | null) => void;
  onAddTask: (status: string) => void;
  isOver?: boolean;
}

function SortableColumn({
  column,
  tasks,
  onTaskClick,
  onEditTask,
  onDeleteClick,
  onStatusChange,
  getPriorityBadge,
  companyUsers,
  dropdownOpen,
  setDropdownOpen,
  onAddTask,
  isOver = false
}: SortableColumnProps) {
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

  // Get the appropriate icon for each column
  const getColumnIcon = (columnId: string) => {
    switch (columnId) {
      case 'todo':
        return <Plus className="w-8 h-8 mx-auto" />;
      case 'in_progress':
        return <Clock className="w-8 h-8 mx-auto" />;
      case 'done':
        return <Target className="w-8 h-8 mx-auto" />;
      case 'blocked':
        return <AlertCircle className="w-8 h-8 mx-auto" />;
      default:
        return <Plus className="w-8 h-8 mx-auto" />;
    }
  };

  // Get the empty state message for each column
  const getEmptyStateMessage = (columnId: string) => {
    switch (columnId) {
      case 'todo':
        return 'Create a new task to get started';
      case 'in_progress':
        return 'Move tasks from "To Do" to get started';
      case 'done':
        return 'Complete some tasks to see them here';
      case 'blocked':
        return 'No blocked tasks at the moment';
      default:
        return 'No tasks';
    }
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="space-y-4 transition-all duration-200"
      data-column={column.id}
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
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.length > 0 ? (
            tasks.map(task => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onTaskClick={onTaskClick}
                onEditTask={onEditTask}
                onDeleteClick={onDeleteClick}
                onStatusChange={onStatusChange}
                getPriorityBadge={getPriorityBadge}
                companyUsers={companyUsers}
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
              <div className="text-gray-400 mb-2 transition-all duration-300">
                {getColumnIcon(column.id)}
              </div>
              <p className="text-sm text-gray-500 font-medium mb-2 transition-all duration-300">
                {isOver ? 'Drop task here' : `No ${column.title.toLowerCase()} tasks`}
              </p>
              <p className="text-xs text-gray-400 transition-all duration-300">
                {isOver ? 'Release to move task' : getEmptyStateMessage(column.id)}
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
// Task List Item Component for Tab View
interface TaskListItemProps {
  task: ProjectTask;
  onTaskClick: (task: ProjectTask) => void;
  onEditTask: (task: ProjectTask) => void;
  onDeleteClick: (task: ProjectTask) => void;
  onStatusChange: (taskId: number, newStatus: string) => void;
  getPriorityBadge: (priority: string) => JSX.Element;
  companyUsers: Employee[];
  dropdownOpen: number | null;
  setDropdownOpen: (id: number | null) => void;
}

function TaskListItem({
  task,
  onTaskClick,
  onEditTask,
  onDeleteClick,
  onStatusChange,
  getPriorityBadge,
  companyUsers,
  dropdownOpen,
  setDropdownOpen
}: TaskListItemProps) {
  const handleViewTask = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen(null);
    onTaskClick(task);
  };

  const handleEditTask = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen(null);
    onEditTask(task);
  };

  const handleDeleteTask = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen(null);
    onDeleteClick(task);
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 mt-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 
              className="font-medium text-base mb-2 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => onTaskClick(task)}
            >
              {capitalizeDisplayText(task.title)}
            </h4>
            
            {task.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {capitalizeDisplayText(task.description)}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                {getPriorityBadge(task.priority)}
              </div>
              {task.has_publish_date && task.publish_date && (
  <div className="flex items-center gap-1">
    <Calendar className="w-4 h-4 text-purple-500" />
    <span className="text-purple-600">
      Publish: {new Date(task.publish_date).toLocaleDateString()}
    </span>
  </div>
)}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  Due:
                  {task.due_date 
                    ? new Date(task.due_date).toLocaleDateString()
                    : 'No due date'
                  }
                </span>
              </div>
              
              {task.assigned_to && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{task.assignee_name || 'Unassigned'}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded">
                  {KANBAN_COLUMNS.find(col => col.status === task.status)?.title || task.status}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative flex-shrink-0">
          <Select
            value={task.status}
            onValueChange={(value) => onStatusChange(task.id, value)}
          >
            <SelectTrigger className="h-8 text-sm w-32 transition-all hover:bg-gray-50 mb-2">
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
                  onClick={handleViewTask}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={handleEditTask}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                  onClick={handleDeleteTask}
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
  );
}

// Tab View Component
interface TabViewProps {
  tasks: ProjectTask[];
  onTaskClick: (task: ProjectTask) => void;
  onEditTask: (task: ProjectTask) => void;
  onDeleteClick: (task: ProjectTask) => void;
  onStatusChange: (taskId: number, newStatus: string) => void;
  getPriorityBadge: (priority: string) => JSX.Element;
  companyUsers: Employee[];
  dropdownOpen: number | null;
  setDropdownOpen: (id: number | null) => void;
  activeTab: string;
}

function TabView({
  tasks,
  onTaskClick,
  onEditTask,
  onDeleteClick,
  onStatusChange,
  getPriorityBadge,
  companyUsers,
  dropdownOpen,
  setDropdownOpen,
  activeTab
}: TabViewProps) {
  const filteredTasks = activeTab === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === activeTab);

  const tasksByStatus = TAB_STATUS_OPTIONS
    .filter(option => option.id !== 'all')
    .map(option => ({
      ...option,
      tasks: tasks.filter(task => task.status === option.status),
      count: tasks.filter(task => task.status === option.status).length
    }));

  if (activeTab !== 'all') {
    return (
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <TaskListItem
              key={task.id}
              task={task}
              onTaskClick={onTaskClick}
              onEditTask={onEditTask}
              onDeleteClick={onDeleteClick}
              onStatusChange={onStatusChange}
              getPriorityBadge={getPriorityBadge}
              companyUsers={companyUsers}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
            />
          ))
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <div className="text-gray-400 mb-4">
              <List className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-lg font-medium text-gray-500 mb-2">No tasks found</p>
            <p className="text-sm text-gray-400">
              {activeTab === 'todo' && 'No tasks to do. Create a new task to get started!'}
              {activeTab === 'in_progress' && 'No tasks in progress. Move tasks from "To Do" to get started!'}
              {activeTab === 'done' && 'No completed tasks yet.'}
              {activeTab === 'blocked' && 'No blocked tasks.'}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="space-y-4">
      {tasksByStatus.map((statusGroup) => (
        <AccordionItem key={statusGroup.id} value={statusGroup.id} className="border rounded-lg">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 transition-colors bg-[#f2f2f2] cursor-pointer ">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  statusGroup.id === 'todo' ? 'bg-gray-400' :
                  statusGroup.id === 'in_progress' ? 'bg-blue-500' :
                  statusGroup.id === 'done' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="font-semibold text-lg">{statusGroup.title}</span>
                <Badge variant="secondary" className="ml-2">
                  {statusGroup.count}
                </Badge>
              </div>
             
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-4 mt-2">
            <div className="space-y-3">
              {statusGroup.tasks.length > 0 ? (
                statusGroup.tasks.map(task => (
                  <TaskListItem
                    key={task.id}
                    task={task}
                    onTaskClick={onTaskClick}
                    onEditTask={onEditTask}
                    onDeleteClick={onDeleteClick}
                    onStatusChange={onStatusChange}
                    getPriorityBadge={getPriorityBadge}
                    companyUsers={companyUsers}
                    dropdownOpen={dropdownOpen}
                    setDropdownOpen={setDropdownOpen}
                  />
                ))
              ) : (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <p className="text-gray-500 mb-2">No {statusGroup.title.toLowerCase()} tasks</p>
                  <p className="text-sm text-gray-400">
                    {statusGroup.id === 'todo' && 'Create a new task to get started!'}
                    {statusGroup.id === 'in_progress' && 'Move tasks from "To Do" to get started!'}
                    {statusGroup.id === 'done' && 'Complete some tasks to see them here!'}
                    {statusGroup.id === 'blocked' && 'No blocked tasks at the moment.'}
                  </p>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function ProjectTasks({ user }: ProjectTasksProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ApiProject | null>(null);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [companyUsers, setCompanyUsers] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false);
  const [showTaskDetailDialog, setShowTaskDetailDialog] = useState(false);
  const [showEditTaskDialog, setShowEditTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<ProjectTask | null>(null);
  const [activeTask, setActiveTask] = useState<ProjectTask | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'kanban' | 'list'>('kanban');
  const [activeTab, setActiveTab] = useState('all');
const [showBlockConfirmDialog, setShowBlockConfirmDialog] = useState(false);
const [taskToBlock, setTaskToBlock] = useState<{ taskId: number; newStatus: string } | null>(null);


const handleTaskStatusUpdateWithConfirm = async (taskId: number, newStatus: string) => {
  // Show confirmation dialog only when changing to "blocked" status
  if (newStatus === 'blocked') {
    setTaskToBlock({ taskId, newStatus });
    setShowBlockConfirmDialog(true);
    return;
  }

  // For other status changes, proceed directly
  await handleTaskStatusUpdate(taskId, newStatus);
};

// Add this function to handle confirmed blocking
const handleConfirmBlock = async () => {
  if (!taskToBlock) return;
  
  try {
    const currentTask = tasks.find(task => task.id === taskToBlock.taskId);
    if (!currentTask) {
      toast.error('Task not found');
      return;
    }

    const backendStatus = getBackendStatus(taskToBlock.newStatus);
    const assigneeId = currentTask.assignee_id || currentTask.assigned_to;

    // Update local state immediately for better UX
    const updatedTasks = tasks.map(task =>
      task.id === taskToBlock.taskId ? { ...task, status: taskToBlock.newStatus } : task
    );
    setTasks(updatedTasks);

    await taskApi.update(taskToBlock.taskId, { 
      title: currentTask.title,
      description: currentTask.description,
      priority: currentTask.priority,
      status: backendStatus,
      assigned_to: assigneeId,
      due_date: currentTask.due_date,
      hasPublishDate: currentTask.has_publish_date, // Add this
      publishDate: currentTask.publish_date // Add this
    });
    
    toast.success('Task moved to Blocked');
  } catch (error) {
    // Revert on error
    await fetchProjectTasks();
    if (error instanceof ApiError) {
      toast.error(`Failed to update task: ${error.message}`);
    } else {
      console.error('Task update error:', error);
      toast.error('Failed to update task status');
    }
  } finally {
    setShowBlockConfirmDialog(false);
    setTaskToBlock(null);
  }
};
  // Dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

const [newTask, setNewTask] = useState({
  title: '',
  description: '',
  priority: 'medium' as 'low' | 'medium' | 'high',
  assigned_to: '',
  due_date: '',
  status: 'todo' as string,
  has_publish_date: false, // Add this
  publish_date: '', // Add this
});

// Update the editTask state
const [editTask, setEditTask] = useState({
  id: 0,
  title: '',
  description: '',
  priority: 'medium' as 'low' | 'medium' | 'high',
  assigned_to: '',
  due_date: '',
  status: 'todo' as string,
  has_publish_date: false, // Add this
  publish_date: '', // Add this
});

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
      fetchProjectTasks();
    }
  }, [id]);

  useEffect(() => {
    if (project) {
      fetchCompanyUsers();
    }
  }, [project]);

  const fetchProjectDetails = async () => {
    try {
      const projectData = await projectApi.get(parseInt(id!));
      setProject(projectData);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Failed to load project: ${error.message}`);
      }
      navigate('/tasks/project-grid');
    }
  };

  const fetchProjectTasks = async () => {
    try {
      const tasksData = await taskApi.getProjectTasks(parseInt(id!));
      const mappedTasks = tasksData.map(task => ({
        ...task,
        status: getFrontendStatus(task.status)
      }));
      console.log('Fetched Tasks:', mappedTasks);
      setTasks(mappedTasks);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Failed to load tasks: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanyUsers = async () => {
    try {
      if (project && project.members) {
        const memberIds = project.members.map(member => member.user_id || member.id);
        if (memberIds.length > 0) {
          const users = await employeeApi.list();
          const projectMembers = users.filter(user => 
            memberIds.includes(user.id)
          );
          setCompanyUsers(projectMembers);
        } else {
          setCompanyUsers([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch project members:', error);
      setCompanyUsers([]);
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  // Drag and Drop Handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
    document.body.style.cursor = 'grabbing';
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setOverColumn(null);
      return;
    }

    const overColumnId = KANBAN_COLUMNS.find(col => col.id === over.id)?.id;
    setOverColumn(overColumnId || null);
  };

// Also update the handleDragEnd function
const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event;
  
  document.body.style.cursor = '';
  setOverColumn(null);
  
  if (!over) {
    setActiveTask(null);
    return;
  }

  const activeTask = tasks.find(task => task.id === active.id);
  const overColumn = KANBAN_COLUMNS.find(col => col.id === over.id);

  if (!activeTask || !overColumn) {
    setActiveTask(null);
    return;
  }

  if (activeTask.status === overColumn.status) {
    setActiveTask(null);
    return;
  }

  // Show confirmation dialog when moving to blocked status
  if (overColumn.status === 'blocked') {
    setTaskToBlock({ taskId: activeTask.id, newStatus: overColumn.status });
    setShowBlockConfirmDialog(true);
    setActiveTask(null);
    return;
  }

  // For other status changes, proceed directly
  try {
    const backendStatus = getBackendStatus(overColumn.status);
    const assigneeId = activeTask.assignee_id || activeTask.assigned_to;

    const updatedTasks = tasks.map(task =>
      task.id === activeTask.id ? { ...task, status: overColumn.status } : task
    );
    setTasks(updatedTasks);

    await taskApi.update(activeTask.id, {
      title: activeTask.title,
      description: activeTask.description,
      priority: activeTask.priority,
      status: backendStatus,
      assigned_to: assigneeId,
      due_date: activeTask.due_date,
      hasPublishDate: activeTask.has_publish_date, // Add this
      publishDate: activeTask.publish_date // Add this
    });

    toast.success(`Task moved to ${overColumn.title}`);
  } catch (error) {
    await fetchProjectTasks();
    if (error instanceof ApiError) {
      toast.error(`Failed to move task: ${error.message}`);
    } else {
      console.error('Task move error:', error);
      toast.error('Failed to move task');
    }
  } finally {
    setActiveTask(null);
  }
};
  const handleDragCancel = () => {
    document.body.style.cursor = '';
    setOverColumn(null);
    setActiveTask(null);
  };

 const handleCreateTask = async () => {
  if (!newTask.title) {
    toast.error('Please enter task title');
    return;
  }

  setIsCreatingTask(true);
  try {
    const backendStatus = getBackendStatus(newTask.status);
    
    const taskData = {
      title: newTask.title,
      description: newTask.description || undefined,
      priority: newTask.priority,
      assigned_to: newTask.assigned_to ? parseInt(newTask.assigned_to) : undefined,
      due_date: newTask.due_date || undefined,
      status: backendStatus,
      project_id: parseInt(id!),
      projectId: parseInt(id!),
      hasPublishDate: newTask.has_publish_date, // Use correct field name
      publishDate: newTask.has_publish_date ? newTask.publish_date : undefined, // Use correct field name
    };

    console.log('Creating task with data:', taskData); // Debug log

    await taskApi.create(taskData);
    toast.success('Task created successfully');
    
    await fetchProjectTasks();
    
    setShowCreateTaskDialog(false);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      assigned_to: '',
      due_date: '',
      status: 'todo',
      has_publish_date: false,
      publish_date: ''
    });
  } catch (error) {
    if (error instanceof ApiError) {
      toast.error(`Failed to create task: ${error.message}`);
    } else {
      console.error('Task creation error:', error);
      toast.error('Failed to create task');
    }
  } finally {
    setIsCreatingTask(false);
  }
};

const handleTaskStatusUpdate = async (taskId: number, newStatus: string) => {
  try {
    const currentTask = tasks.find(task => task.id === taskId);
    if (!currentTask) {
      toast.error('Task not found');
      return;
    }

    const backendStatus = getBackendStatus(newStatus);
    const assigneeId = currentTask.assignee_id || currentTask.assigned_to;

    await taskApi.update(taskId, { 
      title: currentTask.title,
      description: currentTask.description,
      priority: currentTask.priority,
      status: backendStatus,
      assigned_to: assigneeId,
      due_date: currentTask.due_date,
      hasPublishDate: currentTask.has_publish_date, // Add this
      publishDate: currentTask.publish_date // Add this
    });
    
    await fetchProjectTasks();
    toast.success('Task status updated');
  } catch (error) {
    if (error instanceof ApiError) {
      toast.error(`Failed to update task: ${error.message}`);
    } else {
      console.error('Task update error:', error);
      toast.error('Failed to update task status');
    }
  }
};

  const handleTaskClick = (task: ProjectTask) => {
    setSelectedTask(task);
    setShowTaskDetailDialog(true);
  };

const handleEditTask = (task: ProjectTask) => {
  setSelectedTask(task);
  
  const formattedDueDate = task.due_date 
    ? new Date(task.due_date).toISOString().split('T')[0]
    : '';

  const formattedPublishDate = task.publish_date 
    ? new Date(task.publish_date).toISOString().split('T')[0]
    : '';

  const assigneeId = task.assignee_id || task.assigned_to;

  setEditTask({
    id: task.id,
    title: task.title,
    description: task.description || '',
    priority: task.priority as 'low' | 'medium' | 'high',
    assigned_to: assigneeId?.toString() || '',
    due_date: formattedDueDate,
    status: task.status,
    has_publish_date: task.has_publish_date || false, // Add this
    publish_date: formattedPublishDate // Add this
  });
  
  setShowTaskDetailDialog(false);
  setShowEditTaskDialog(true);
};
const handleUpdateTask = async () => {
  if (!editTask.title) {
    toast.error('Please enter task title');
    return;
  }

  setIsUpdatingTask(true);
  try {
    const backendStatus = getBackendStatus(editTask.status);
    
    let dueDateValue = editTask.due_date;
    if (dueDateValue) {
      const localDate = new Date(dueDateValue + 'T00:00:00');
      dueDateValue = localDate.toISOString().split('T')[0];
    }

    let publishDateValue = editTask.publish_date;
    if (publishDateValue && editTask.has_publish_date) {
      const localDate = new Date(publishDateValue + 'T00:00:00');
      publishDateValue = localDate.toISOString().split('T')[0];
    }

    const taskData = {
      title: editTask.title,
      description: editTask.description || undefined,
      priority: editTask.priority,
      assigned_to: editTask.assigned_to && editTask.assigned_to !== "unassigned" ? parseInt(editTask.assigned_to) : undefined,
      due_date: dueDateValue || undefined,
      status: backendStatus,
      hasPublishDate: editTask.has_publish_date, // Use correct field name
      publishDate: editTask.has_publish_date ? publishDateValue : undefined, // Use correct field name
    };

    console.log('Updating task with data:', taskData); // Debug log

    await taskApi.update(editTask.id, taskData);
    toast.success('Task updated successfully');
    
    await fetchProjectTasks();
    
    setShowEditTaskDialog(false);
    setEditTask({
      id: 0,
      title: '',
      description: '',
      priority: 'medium',
      assigned_to: '',
      due_date: '',
      status: 'todo',
      has_publish_date: false,
      publish_date: ''
    });
  } catch (error) {
    if (error instanceof ApiError) {
      toast.error(`Failed to update task: ${error.message}`);
    } else {
      console.error('Task update error:', error);
      toast.error('Failed to update task');
    }
  } finally {
    setIsUpdatingTask(false);
  }
};

  const handleDeleteClick = (task: ProjectTask) => {
    setTaskToDelete(task);
    setShowDeleteConfirmDialog(true);
    setDropdownOpen(null);
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      await taskApi.delete(taskToDelete.id);
      toast.success('Task deleted successfully');
      setTasks(prev => prev.filter(task => task.id !== taskToDelete.id));
      setShowDeleteConfirmDialog(false);
      setTaskToDelete(null);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Failed to delete task: ${error.message}`);
      } else {
        console.error('Task deletion error:', error);
        toast.error('Failed to delete task');
      }
      await fetchProjectTasks();
    }
  };

  const handleViewTask = (task: ProjectTask) => {
    setSelectedTask(task);
    setShowEditTaskDialog(false);
    setShowTaskDetailDialog(true);
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
        {capitalize(priority)}
      </Badge>
    );
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Target className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <Target className="w-4 h-4 text-green-500" />;
      default:
        return <Target className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusDisplayName = (status: string) => {
    const column = KANBAN_COLUMNS.find(col => col.status === status);
    return column ? column.title : status;
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <p>Loading project details...</p>
      </div>
    );
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
          <Button variant="outline" size="icon" onClick={() => navigate('/tasks/project-grid')}>
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
      

   <div className="w-80 border rounded-lg p-1 bg-white">
      <div className="flex">
        <button
          className={`flex-1 flex items-center cursor-pointer justify-center gap-2 py-1.5 px-3 text-sm font-medium rounded-md transition-all duration-200 ${
            activeView === 'kanban' 
              ? 'bg-black text-white shadow-sm' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          onClick={() => setActiveView('kanban')}
        >
          <Kanban className="w-4 h-4" />
          Column View
        </button>
        <button
          className={`flex-1 flex items-center justify-center cursor-pointer gap-2 py-1.5 px-3 text-sm font-medium rounded-md transition-all duration-200 ${
            activeView === 'list' 
              ? 'bg-black text-white shadow-sm' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          onClick={() => setActiveView('list')}
        >
          <List className="w-4 h-4" />
          List View
        </button>
      </div>
    </div>
           
    {/* View Content */}
    {activeView === 'kanban' ? (
      /* Kanban Board with Dnd-kit */
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
                onStatusChange={handleTaskStatusUpdateWithConfirm} // Updated to use new function
                getPriorityBadge={getPriorityBadge}
                companyUsers={companyUsers}
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
    ) : (
      /* List/Tab View */
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              {TAB_STATUS_OPTIONS.map(option => (
                <TabsTrigger 
                  key={option.id} 
                  value={option.id}
                  className="flex items-center gap-2"
                >
                  {option.title}
                  <Badge variant="secondary" className="ml-1">
                    {option.id === 'all' ? tasks.length : getTasksByStatus(option.status).length}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-4">
              <TabView
                tasks={tasks}
                onTaskClick={handleTaskClick}
                onEditTask={handleEditTask}
                onDeleteClick={handleDeleteClick}
                onStatusChange={handleTaskStatusUpdateWithConfirm} // Updated to use new function
                getPriorityBadge={getPriorityBadge}
                companyUsers={companyUsers}
                dropdownOpen={dropdownOpen}
                setDropdownOpen={setDropdownOpen}
                activeTab={activeTab}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    )}

    {/* Block Confirmation Dialog */}

<Dialog open={showBlockConfirmDialog} onOpenChange={setShowBlockConfirmDialog}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2 text-amber-600">
        <AlertCircle className="w-5 h-5" />
        Confirm Block Task
      </DialogTitle>
      <DialogDescription>
        Are you sure you want to block this task? This indicates there are issues preventing progress.
      </DialogDescription>
    </DialogHeader>

    <div className="py-4">
      {taskToBlock && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="font-medium text-amber-800">
            {tasks.find(task => task.id === taskToBlock.taskId)?.title || 'Task'} will be moved to Blocked status
          </p>
          <p className="text-sm text-amber-600 mt-2">
            Consider adding a comment explaining what's blocking this task.
          </p>
        </div>
      )}
    </div>

    <DialogFooter>
      <Button 
        variant="outline" 
        onClick={() => {
          setShowBlockConfirmDialog(false);
          setTaskToBlock(null);
        }}
      >
        Cancel
      </Button>
      <Button 
        variant="default" 
        onClick={handleConfirmBlock}
        className="bg-amber-600 hover:bg-amber-700"
      >
        <AlertCircle className="w-4 h-4 mr-2" />
        Block Task
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

    {/* Add Task Dialog */}
      {/* Create Task Dialog */}
      <Dialog open={showCreateTaskDialog} onOpenChange={setShowCreateTaskDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to this project
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Task Title *</Label>
              <Input
                id="task-title"
                placeholder="e.g., Design user authentication flow"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="mt-1 transition-all focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                placeholder="Task description and requirements..."
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="mt-1 transition-all focus:ring-2 focus:ring-blue-500"
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
                  <SelectTrigger id="task-priority" className="mt-1 transition-all">
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
                  <SelectTrigger id="task-status" className="mt-1 transition-all">
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
                  value={newTask.assigned_to}
                  onValueChange={(value) => setNewTask({ ...newTask, assigned_to: value })}
                >
                  <SelectTrigger id="task-assignee" className="mt-1 transition-all">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {companyUsers.map((user) => (
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
                  className="mt-1 transition-all focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
{/* Add this section to the Create Task Dialog */}
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
        className="mt-1 transition-all focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )}
</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTaskDialog(false)} disabled={isCreatingTask}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask} disabled={isCreatingTask}>
              {isCreatingTask ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={showEditTaskDialog} onOpenChange={setShowEditTaskDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update task details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-task-title">Task Title *</Label>
              <Input
                id="edit-task-title"
                placeholder="e.g., Design user authentication flow"
                value={editTask.title}
                onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                className="mt-1 transition-all focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <Label htmlFor="edit-task-description">Description</Label>
              <Textarea
                id="edit-task-description"
                placeholder="Task description and requirements..."
                value={editTask.description}
                onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                className="mt-1 transition-all focus:ring-2 focus:ring-blue-500"
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
                  <SelectTrigger id="edit-task-priority" className="mt-1 transition-all">
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
                  <SelectTrigger id="edit-task-status" className="mt-1 transition-all">
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
                  value={editTask.assigned_to || "unassigned"}
                  onValueChange={(value) => {
                    setEditTask({ ...editTask, assigned_to: value === "unassigned" ? "" : value });
                    console.log('Selected assignee value:', value);
                  }}
                >
                  <SelectTrigger id="edit-task-assignee" className="mt-1 transition-all">
                    <SelectValue>
                      {editTask.assigned_to 
                        ? companyUsers.find(user => user.id.toString() === editTask.assigned_to)?.name || 'Select assignee'
                        : 'Unassigned'
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {companyUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!editTask.assigned_to && (
                  <p className="text-xs text-gray-500 mt-1">Currently unassigned</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-task-due-date">Due Date</Label>
                <Input
                  id="edit-task-due-date"
                  type="date"
                  value={editTask.due_date}
                  onChange={(e) => setEditTask({ ...editTask, due_date: e.target.value })}
                  className="mt-1 transition-all focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
{/* Add this section to the Edit Task Dialog */}
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
        className="mt-1 transition-all focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )}
</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditTaskDialog(false)} disabled={isUpdatingTask}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTask} disabled={isUpdatingTask}>
              {isUpdatingTask ? 'Updating...' : 'Update Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Detail Dialog */}
      <Dialog open={showTaskDetailDialog} onOpenChange={setShowTaskDetailDialog}>
        <DialogContent className="max-w-2xl">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getPriorityIcon(selectedTask.priority)}
                  {selectedTask.title}
                </DialogTitle>
                <DialogDescription>
                  Task details and information
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Project Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Project Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Project Name</p>
                      <p className="font-semibold">{project.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Project Status</p>
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Project Manager</p>
                      <p>{project.manager_name || 'Not assigned'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Team Size</p>
                      <p>{project.members?.length || 0} members</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Start Date</p>
                      <p>{new Date(project.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">End Date</p>
                      <p>{new Date(project.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Task Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Task Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p className="mt-1">{selectedTask.description || 'No description provided'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Priority</p>
                        <div className="mt-1">
                          {getPriorityBadge(selectedTask.priority)}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <Badge variant="outline" className="mt-1">
                          {getStatusDisplayName(selectedTask.status)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Assignee</p>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{selectedTask.assignee_name || 'Unassigned'}</span>
                        </div>
                      </div>
                      {selectedTask.has_publish_date && selectedTask.publish_date && (
  <div>
    <p className="text-sm font-medium text-gray-500">Publish Date</p>
    <div className="flex items-center gap-2 mt-1">
      <Calendar className="w-4 h-4 text-purple-400" />
      <span className="text-purple-600">
        {new Date(selectedTask.publish_date).toLocaleDateString()}
      </span>
    </div>
  </div>
)}

                    

                       <div className="grid grid-cols-2 gap-4">

                      <div>
                        <p className="text-sm font-medium text-gray-500">Due Date</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>
                            {selectedTask.due_date 
                              ? new Date(selectedTask.due_date).toLocaleDateString()
                              : 'No due date'
                            }
                          </span>
                        </div>


                      </div>

                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">Created</p>
                      <p>{new Date(selectedTask.created_at).toLocaleDateString()}</p>
                    </div>
                       </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowTaskDetailDialog(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setShowTaskDetailDialog(false);
                  handleEditTask(selectedTask);
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Task
                </Button>
              </DialogFooter>
            </>
          )}
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
                {taskToDelete.assignee_name && (
                  <p className="text-sm text-red-600 mt-1">
                    Assigned to: {taskToDelete.assignee_name}
                  </p>
                )}
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