import React, { useState, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Settings,
  Columns,
  Layers,
  GitCommit,
  FormInput,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  X,
} from 'lucide-react'
import { projectService } from '@/services/projectService'
import type { ProjectStatus, ProjectWorkType, Workflow, CustomField } from '@/types/projectConfig'
import type { Project } from '@/types/workspace'
import { GeneralSettingsTab } from '@/components/project/settings/GeneralSettingsTab'
import { StatusesSettingsTab } from '@/components/project/settings/StatusesSettingsTab'
import { WorkTypesSettingsTab } from '@/components/project/settings/WorkTypesSettingsTab'
import { WorkflowsSettingsTab } from '@/components/project/settings/WorkflowsSettingsTab'
import { CustomFieldsSettingsTab } from '@/components/project/settings/CustomFieldsSettingsTab'

type SettingsTab = 'general' | 'statuses' | 'work-types' | 'workflows' | 'custom-fields'

const TABS: Array<{ id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'general', label: 'Thông tin chung', icon: Settings },
  { id: 'statuses', label: 'Cột trạng thái & WIP', icon: Columns },
  { id: 'work-types', label: 'Loại công việc', icon: Layers },
  { id: 'workflows', label: 'Luồng quy trình', icon: GitCommit },
  { id: 'custom-fields', label: 'Trường tùy chỉnh', icon: FormInput },
]

export function ProjectSettingsPage() {
  const { workspaceSlug, projectKey } = useParams<{ workspaceSlug?: string; projectKey?: string }>()
  const [searchParams] = useSearchParams()
  const projectParam = projectKey || searchParams.get('project') || searchParams.get('projectId') || ''

  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleFeedback = useCallback((fb: { type: 'success' | 'error'; message: string }) => {
    setFeedback(fb)
    if (fb.type === 'success') {
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [])

  const { data: project, isLoading: isLoadingProject } = useQuery<Project>({
    queryKey: ['project', projectParam],
    queryFn: () => projectService.getProjectById(projectParam),
    enabled: !!projectParam,
  })

  const projectId = project?.id || projectParam

  const { data: statuses = [] } = useQuery<ProjectStatus[]>({
    queryKey: ['project-statuses', projectId],
    queryFn: () => projectService.getProjectStatuses(projectId),
    enabled: !!projectId,
  })

  const { data: workTypes = [] } = useQuery<ProjectWorkType[]>({
    queryKey: ['project-work-types', projectId],
    queryFn: () => projectService.getProjectWorkTypes(projectId),
    enabled: !!projectId,
  })

  const { data: workflows = [] } = useQuery<Workflow[]>({
    queryKey: ['project-workflows', projectId],
    queryFn: () => projectService.getWorkflows(projectId),
    enabled: !!projectId,
  })

  const { data: customFields = [] } = useQuery<CustomField[]>({
    queryKey: ['project-custom-fields', projectId],
    queryFn: () => projectService.getCustomFields(projectId),
    enabled: !!projectId,
  })

  if (isLoadingProject) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-xs gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
        <span>Đang tải cấu hình dự án...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl pb-16 animate-in fade-in duration-150">
      {/* 1. Header Cài đặt */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <span>Cài đặt dự án</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý thông tin chung, quy trình công việc, trạng thái thẻ và trường dữ liệu cho{' '}
            <strong className="text-slate-700">{project?.name}</strong> ({project?.key})
          </p>
        </div>
      </div>

      {/* Thông báo Feedback */}
      {feedback && (
        <div
          className={`px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 hover:opacity-80 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Menu Navigation giữa 5 Tab */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto scrollbar-none pb-px">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* 3. Nội dung từng Tab */}
      {activeTab === 'general' && (
        <GeneralSettingsTab
          project={project}
          projectParam={projectParam}
          workspaceSlug={workspaceSlug}
          onFeedback={handleFeedback}
        />
      )}

      {activeTab === 'statuses' && (
        <StatusesSettingsTab
          projectId={projectId}
          statuses={statuses}
          onFeedback={handleFeedback}
        />
      )}

      {activeTab === 'work-types' && (
        <WorkTypesSettingsTab
          projectId={projectId}
          workTypes={workTypes}
          workflows={workflows}
          onFeedback={handleFeedback}
        />
      )}

      {activeTab === 'workflows' && (
        <WorkflowsSettingsTab
          projectId={projectId}
          statuses={statuses}
          workflows={workflows}
          onFeedback={handleFeedback}
        />
      )}

      {activeTab === 'custom-fields' && (
        <CustomFieldsSettingsTab
          projectId={projectId}
          customFields={customFields}
          onFeedback={handleFeedback}
        />
      )}
    </div>
  )
}

export default ProjectSettingsPage
