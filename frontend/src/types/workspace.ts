import { LucideIcon } from 'lucide-react'

export interface Project {
  id: string;
  name: string;
  count?: number;
  color: string;
  key?: string;
  lead?: string;
  status?: string;
  tasks?: number;
}

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface ProjectViewType {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  isCore: boolean;
  description: string;
}

export interface WorkspaceMember {
  name: string;
  email: string;
  role: string;
  initials: string;
  color: string;
}
