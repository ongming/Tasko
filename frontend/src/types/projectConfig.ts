export type CustomFieldType = 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT'

export interface WorkflowTransition {
  id?: string
  workflowId?: string
  fromStatusId: string
  toStatusId: string
  conditions?: Record<string, any>
  fromStatus?: { id: string; name: string }
  toStatus?: { id: string; name: string }
}

export interface Workflow {
  id: string
  projectId: string
  name: string
  transitions?: WorkflowTransition[]
  createdAt?: string
  updatedAt?: string
}

export interface CustomField {
  id: string
  projectId: string
  name: string
  fieldType: CustomFieldType
  options?: string[] | null
  isRequired: boolean
  position: number
  createdAt?: string
  updatedAt?: string
}

export interface CustomFieldValue {
  id: string
  taskId: string
  customFieldId: string
  value: any
  customField?: CustomField
}

export interface ProjectStatus {
  id: string
  project_id: string
  name: string
  category: 'TODO' | 'IN_PROGRESS' | 'DONE'
  color: string
  position: number
  is_default: boolean
  wipLimit?: number | null
}

export interface ProjectWorkType {
  id: string
  project_id: string
  name: string
  icon: string
  color: string
  is_default: boolean
  isSubtask?: boolean
  workflowId?: string | null
  workflow?: Workflow | null
}

export interface CreateStatusPayload {
  name: string
  category: 'TODO' | 'IN_PROGRESS' | 'DONE'
  color?: string
  position?: number
  wipLimit?: number | null
}

export interface UpdateStatusPayload {
  name?: string
  category?: 'TODO' | 'IN_PROGRESS' | 'DONE'
  color?: string
  position?: number
  wipLimit?: number | null
}

export interface CreateWorkTypePayload {
  name: string
  icon?: string
  color?: string
  isSubtask?: boolean
  workflowId?: string
}

export interface UpdateWorkTypePayload {
  name?: string
  icon?: string
  color?: string
  isSubtask?: boolean
  workflowId?: string | null
}

export interface CreateCustomFieldPayload {
  name: string
  fieldType: CustomFieldType
  options?: string[]
  isRequired?: boolean
  position?: number
}

export interface UpdateCustomFieldPayload {
  name?: string
  fieldType?: CustomFieldType
  options?: string[]
  isRequired?: boolean
  position?: number
}

export interface UpdateProjectSettingsPayload {
  name?: string
  description?: string
  startDate?: string | null
  endDate?: string | null
  methodology?: 'SCRUM' | 'KANBAN' | 'SCRUMBAN'
  settings?: Record<string, any>
}
