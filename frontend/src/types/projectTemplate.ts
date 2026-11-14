import React from 'react'

export type ProjectTemplateId = 'default' | 'software' | 'marketing' | 'sales'

export interface ProjectTemplate {
  id: ProjectTemplateId
  name: string
  badge: string
  description: string
  tags: string[]
  workTypes: string[]
  workflow: string[]
  icon: React.ComponentType<{ className?: string }>
  defaultPrefix: string
}
