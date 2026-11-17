import React from 'react'
import type { ProjectTemplate } from './projectTemplate'

export type AgileMethod = 'kanban' | 'scrum' | 'scrumban'

export interface AgileCardConfig {
  id: AgileMethod
  title: string
  badge: string
  badgeClass: string
  description: string
  featureText: string
  icon: React.ReactNode
}

export interface BusinessDomain {
  id: string
  name: string
  badge: string
  badgeColor: string
  icon: React.ReactNode
  description: string
  tags: string[]
  defaultPrefix: string
}

export interface WorkflowStage {
  id: string
  label: string
  color: string
  category?: 'TODO' | 'IN_PROGRESS' | 'DONE'
}

export interface CustomWorkType {
  id: string
  label: string
  iconKey: string
  color: string
}

export interface MethodDetails {
  features: string[]
  workflow: { label: string; color: string }[]
  issueTypes: { label: string; color: string }[]
}

export type CreateProjectStep = 1 | 2 | 3

export interface CreateProjectState {
  step: CreateProjectStep
  selectedMethod: AgileCardConfig | null
  selectedDomain: BusinessDomain
  selectedTemplate: ProjectTemplate | null
  projectName: string
  projectKey: string
  projectColor: string
  isSubmitting: boolean
  error: string
  isAiModalOpen: boolean
  aiUploadedFile: File | null
  aiPrompt: string
  // Tùy biến nâng cao Bước 3: Workflow & Work Types
  workflow: WorkflowStage[]
  workTypes: CustomWorkType[]
  isAdvancedOpen: boolean
}
