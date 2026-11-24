import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import { projectService } from '@/services/projectService'
import { Button } from '@/components/ui/Button'
import type { ProjectStatus, Workflow } from '@/types/projectConfig'
import type { Project } from '@/types/workspace'
import {
  computeAutoLayoutPositions,
  draftMapToTransitionPayload,
  getTransitionKey,
  sortStatusesForWorkflow,
  transitionsToDraftMap,
  type DraftTransition,
  type WorkflowLayoutMap,
  type WorkflowNodePosition,
} from '@/utils/workflowLayout'
import { WorkflowDiagramCanvas } from './workflow/WorkflowDiagramCanvas'

export interface WorkflowsSettingsTabProps {
  projectId: string
  project?: Project
  statuses: ProjectStatus[]
  workflows: Workflow[]
  isLoadingWorkflows?: boolean
  onFeedback: (fb: { type: 'success' | 'error'; message: string }) => void
}

export const WorkflowsSettingsTab: React.FC<WorkflowsSettingsTabProps> = ({
  projectId,
  project,
  statuses,
  workflows,
  isLoadingWorkflows = false,
  onFeedback,
}) => {
  const queryClient = useQueryClient()

  const activeWorkflow = workflows[0] || null
  const [draftMap, setDraftMap] = useState<Record<string, DraftTransition>>({})
  const [nodePositions, setNodePositions] = useState<WorkflowLayoutMap>({})
  const [hasLayoutEdited, setHasLayoutEdited] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const lastSyncedWorkflowIdRef = useRef<string | null>(null)

  // Nạp transitions và layout đã lưu của quy trình duy nhất trong dự án (không ghi đè khi người dùng đang sửa)
  useEffect(() => {
    const currentWorkflowId = activeWorkflow?.id ?? null
    const workflowChanged = lastSyncedWorkflowIdRef.current !== currentWorkflowId
    if (isDirty && !workflowChanged) {
      return
    }

    lastSyncedWorkflowIdRef.current = currentWorkflowId
    setDraftMap(transitionsToDraftMap(activeWorkflow?.transitions))

    const savedLayouts = project?.settings?.workflowLayouts as
      | Record<string, WorkflowLayoutMap>
      | undefined
    const wfSavedLayout = activeWorkflow ? savedLayouts?.[activeWorkflow.id] : undefined

    if (wfSavedLayout && Object.keys(wfSavedLayout).length > 0) {
      setNodePositions({
        ...computeAutoLayoutPositions(statuses),
        ...wfSavedLayout,
      })
    } else {
      setNodePositions(computeAutoLayoutPositions(statuses))
    }

    setHasLayoutEdited(false)
    setIsDirty(false)
  }, [activeWorkflow, statuses, project?.settings?.workflowLayouts, isDirty])

  const handleAddOrUpdateTransition = useCallback((transition: DraftTransition) => {
    if (transition.fromStatusId === transition.toStatusId) return
    const key = getTransitionKey(transition.fromStatusId, transition.toStatusId)
    setDraftMap((prev) => ({
      ...prev,
      [key]: transition,
    }))
    setIsDirty(true)
  }, [])

  const handleRemoveTransition = useCallback((key: string) => {
    setDraftMap((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
    setIsDirty(true)
  }, [])

  const handlePositionChange = useCallback((statusId: string, pos: WorkflowNodePosition) => {
    setNodePositions((prev) => ({
      ...prev,
      [statusId]: pos,
    }))
    setHasLayoutEdited(true)
    setIsDirty(true)
  }, [])

  const handleResetAutoLayout = useCallback(() => {
    setNodePositions(computeAutoLayoutPositions(statuses))
    setHasLayoutEdited(true)
    setIsDirty(true)
  }, [statuses])

  const handleApplySequentialFlow = useCallback(() => {
    const ordered = sortStatusesForWorkflow(statuses)
    const next: Record<string, DraftTransition> = {}
    for (let i = 0; i < ordered.length - 1; i++) {
      const from = ordered[i]
      const to = ordered[i + 1]
      const key = getTransitionKey(from.id, to.id)
      next[key] = {
        fromStatusId: from.id,
        toStatusId: to.id,
      }
    }
    setDraftMap(next)
    setIsDirty(true)
  }, [statuses])

  const handleAllowAll = useCallback(() => {
    const next: Record<string, DraftTransition> = {}
    statuses.forEach((from) => {
      statuses.forEach((to) => {
        if (from.id !== to.id) {
          const key = getTransitionKey(from.id, to.id)
          next[key] = draftMap[key] || {
            fromStatusId: from.id,
            toStatusId: to.id,
          }
        }
      })
    })
    setDraftMap(next)
    setIsDirty(true)
  }, [statuses, draftMap])

  const handleClearAll = useCallback(() => {
    setDraftMap({})
    setIsDirty(true)
  }, [])

  const saveTransitionsMutation = useMutation({
    mutationFn: async () => {
      let targetWorkflow = activeWorkflow
      if (!targetWorkflow) {
        targetWorkflow = await projectService.createWorkflow(projectId, 'Default Workflow')
      }

      const transitionsPayload = draftMapToTransitionPayload(draftMap)
      const savedTransitions = await projectService.updateWorkflowTransitions(
        projectId,
        targetWorkflow.id,
        transitionsPayload,
      )

      let updatedProject: Project | undefined
      if (hasLayoutEdited && project) {
        const existingLayouts =
          (project.settings?.workflowLayouts as Record<string, WorkflowLayoutMap> | undefined) || {}
        updatedProject = await projectService.updateProjectSettings(projectId, {
          settings: {
            ...(project.settings || {}),
            workflowLayouts: {
              ...existingLayouts,
              [targetWorkflow.id]: nodePositions,
            },
          },
        })
      }

      return { targetWorkflow, savedTransitions, updatedProject }
    },
    onSuccess: async ({ targetWorkflow, savedTransitions, updatedProject }) => {
      const updatedWorkflow: Workflow = {
        ...targetWorkflow,
        transitions: savedTransitions,
      }

      queryClient.setQueryData<Workflow[]>(['project-workflows', projectId], (prev) => {
        if (!prev || prev.length === 0) return [updatedWorkflow]
        const exists = prev.some((wf) => wf.id === updatedWorkflow.id)
        return exists
          ? prev.map((wf) => (wf.id === updatedWorkflow.id ? updatedWorkflow : wf))
          : [updatedWorkflow, ...prev]
      })

      if (updatedProject) {
        queryClient.setQueriesData<Project>({ queryKey: ['project'] }, (prev) =>
          prev && prev.id === updatedProject.id ? updatedProject : prev,
        )
      }

      setIsDirty(false)
      setHasLayoutEdited(false)
      onFeedback({ type: 'success', message: 'Lưu sơ đồ quy trình thành công!' })

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['project-workflows'] }),
        queryClient.invalidateQueries({ queryKey: ['project'] }),
      ])
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể lưu quy trình'
      onFeedback({ type: 'error', message: msg })
    },
  })

  const activeTransitionsCount = Object.keys(draftMap).length

  return (
    <div className="space-y-4">
      {/* 1. Thanh điều khiển & Lưu quy trình */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <span className="text-[11px] font-mono text-slate-400">
          {statuses.length} trạng thái • {activeTransitionsCount} luồng chuyển tiếp
        </span>

        <div className="flex items-center gap-2 flex-wrap">
          {isDirty && (
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md">
              Chưa lưu thay đổi
            </span>
          )}

          <Button
            variant="primary"
            size="sm"
            disabled={isLoadingWorkflows}
            loading={saveTransitionsMutation.isPending}
            leftIcon={<Save className="w-3.5 h-3.5" />}
            onClick={() => saveTransitionsMutation.mutate()}
          >
            <span>Lưu quy trình</span>
          </Button>
        </div>
      </div>

      {/* 2. Bảng vẽ sơ đồ quy trình */}
      <WorkflowDiagramCanvas
        statuses={statuses}
        draftMap={draftMap}
        nodePositions={nodePositions}
        onPositionChange={handlePositionChange}
        onResetAutoLayout={handleResetAutoLayout}
        onAddOrUpdateTransition={handleAddOrUpdateTransition}
        onRemoveTransition={handleRemoveTransition}
        onApplySequentialFlow={handleApplySequentialFlow}
        onAllowAll={handleAllowAll}
        onClearAll={handleClearAll}
      />
    </div>
  )
}

export default WorkflowsSettingsTab
