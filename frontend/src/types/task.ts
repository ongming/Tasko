export interface Assignee {
  name: string;
  bg: string;
}

export interface Task {
  id: string;
  title: string;
  tag: string;
  tagClass?: string;
  dueDate: string;
  isDone?: boolean;
  assignees: Assignee[];
  type?: 'module' | 'task' | 'bug' | string;
  points?: number;
  status?: string;
  statusColor?: string;
}

export interface Column {
  id: string;
  title: string;
  count: number;
  colorBadge: string;
  countBadgeClass: string;
  wrapperClass: string;
  headerClass: string;
  accentBorder: string;
  quickAddClass: string;
  tasks: Task[];
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TaskCustomFieldValue {
  id: string;
  customFieldId: string;
  name?: string;
  fieldType?: string;
  options?: string[] | null;
  isRequired?: boolean;
  value: any;
}

export interface TaskItem {
  id: string;
  projectId: string;
  sprintId?: string | null;
  sprint?: { id: string; name: string; status: string } | null;
  taskKey: string;
  title: string;
  description?: string | null;
  typeId?: string | null;
  type?: { id: string; name: string; icon: string; color: string } | null;
  statusId: string;
  status?: { id: string; name: string; category: 'TODO' | 'IN_PROGRESS' | 'DONE'; color: string } | null;
  storyPoints?: number | null;
  priority: TaskPriority;
  assigneeId?: string | null;
  assignee?: { id: string; name: string; avatarUrl?: string } | null;
  reporterId?: string | null;
  reporter?: { id: string; name: string; avatarUrl?: string } | null;
  position: number;
  parentTaskId?: string | null;
  parentTask?: { id: string; taskKey: string; title: string } | null;
  subtasks?: TaskItem[];
  estimatedHours?: number | null;
  startDate?: string | null;
  dueDate?: string | null;
  customFields?: TaskCustomFieldValue[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  sprintId?: string | null;
  typeId?: string;
  statusId?: string;
  storyPoints?: number | null;
  priority?: TaskPriority;
  assigneeId?: string;
  position?: number;
  projectId?: string;
  status?: string;
  tag?: string;
  parentTaskId?: string | null;
  estimatedHours?: number | null;
  startDate?: string | null;
  dueDate?: string | null;
  customFields?: Array<{ customFieldId: string; value: any }>;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  sprintId?: string | null;
  typeId?: string;
  statusId?: string;
  storyPoints?: number | null;
  priority?: TaskPriority;
  assigneeId?: string | null;
  position?: number;
  parentTaskId?: string | null;
  estimatedHours?: number | null;
  startDate?: string | null;
  dueDate?: string | null;
  customFields?: Array<{ customFieldId: string; value: any }>;
}

export interface MoveTaskPayload {
  sprintId?: string | null;
  statusId?: string;
  position?: number;
}

export interface TaskFilterParams {
  search?: string;
  sprintId?: string;
  isBacklog?: boolean;
  statusId?: string;
  workTypeId?: string;
  assigneeId?: string;
  priority?: TaskPriority | string;
  sortBy?: 'position' | 'dueDate' | 'priority' | 'createdAt' | string;
  sortOrder?: 'ASC' | 'DESC';
}
