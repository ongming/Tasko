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

export interface TaskItem {
  id: string;
  projectId: string;
  sprintId?: string | null;
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
  position: number;
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
  dueDate?: string;
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
}

export interface MoveTaskPayload {
  sprintId?: string | null;
  statusId?: string;
  position?: number;
}
