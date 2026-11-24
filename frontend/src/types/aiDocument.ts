import type { TaskPriority } from './task'

export type AiAnalysisStatus = 'UPLOADED' | 'ANALYZING' | 'COMPLETED' | 'APPLIED' | 'FAILED'

export type AiDocumentFileType = 'pdf' | 'docx' | 'md' | 'txt'

export interface AiSuggestedTask {
  tempId: string
  selected: boolean
  title: string
  description: string
  priority: TaskPriority
  storyPoints: number | null
  estimatedHours: number | null
  assigneeId: string | null
  workTypeId: string | null
  sprintId: string | null
  startDate: string | null
  dueDate: string | null
}

export interface AiAnalysisCreator {
  id: string
  fullName: string
  avatarUrl?: string | null
}

export interface AiAnalysisSummary {
  id: string
  fileName: string
  fileType: AiDocumentFileType
  fileSize: number
  status: AiAnalysisStatus
  suggestedTaskCount: number
  appliedTaskCount: number
  errorMessage?: string | null
  createdAt: string
  createdBy?: AiAnalysisCreator | null
}

export interface AiAnalysisDetail extends AiAnalysisSummary {
  extractedTextPreview?: string
  suggestedTasks: AiSuggestedTask[]
}

export interface ConfirmAiTasksPayload {
  defaultSprintId?: string | null
  tasks: AiSuggestedTask[]
}

export interface ConfirmAiTasksResponse {
  analysisId: string
  status: AiAnalysisStatus
  createdCount: number
  createdTaskIds: string[]
}

export interface AiHistoryQueryParams {
  page?: number
  limit?: number
  status?: AiAnalysisStatus
}
