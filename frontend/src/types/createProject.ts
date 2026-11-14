import React from 'react'

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
