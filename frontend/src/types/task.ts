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
  type?: 'story' | 'task' | 'bug';
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
