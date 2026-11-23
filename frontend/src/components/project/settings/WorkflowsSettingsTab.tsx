import React, { useState, useEffect, useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Save, X } from 'lucide-react'
import { projectService } from '@/services/projectService'
import { Select } from '@/components/ui/Select'
import type { ProjectStatus, Workflow } from '@/types/projectConfig'

export interface WorkflowsSettingsTabProps {
  projectId: string
  statuses: ProjectStatus[]
  workflows: Workflow[]
  onFeedback: (fb: { type: 'success' | 'error'; message: string }) => void
}

export const WorkflowsSettingsTab: React.FC<WorkflowsSettingsTabProps> = ({
  projectId,
  statuses,
  workflows,
  onFeedback,
}) => {
  const queryClient = useQueryClient()

  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('')
  const [matrixState, setMatrixState] = useState<Record<string, boolean>>({})
  const [isNewWorkflowModalOpen, setIsNewWorkflowModalOpen] = useState(false)
  const [newWorkflowName, setNewWorkflowName] = useState('')

  useEffect(() => {
    if (workflows.length > 0 && !selectedWorkflowId) {
      setSelectedWorkflowId(workflows[0].id)
    }
  }, [workflows, selectedWorkflowId])

  const selectedWorkflow = useMemo(() => {
    return workflows.find((w) => w.id === selectedWorkflowId) || workflows[0] || null
  }, [workflows, selectedWorkflowId])

  useEffect(() => {
    if (selectedWorkflow && selectedWorkflow.transitions) {
      const map: Record<string, boolean> = {}
      for (const t of selectedWorkflow.transitions) {
        map[`${t.fromStatusId}->${t.toStatusId}`] = true
      }
      setMatrixState(map)
    }
  }, [selectedWorkflow])

  const toggleMatrixCell = (fromId: string, toId: string) => {
    if (fromId === toId) return
    const key = `${fromId}->${toId}`
    setMatrixState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const setAllTransitions = (allowed: boolean) => {
    const next: Record<string, boolean> = {}
    statuses.forEach((from) => {
      statuses.forEach((to) => {
        if (from.id !== to.id) {
          next[`${from.id}->${to.id}`] = allowed
        }
      })
    })
    setMatrixState(next)
  }

  const saveTransitionsMutation = useMutation({
    mutationFn: () => {
      if (!selectedWorkflow) return Promise.resolve([])
      const transitionsList: Array<{ fromStatusId: string; toStatusId: string }> = []
      Object.entries(matrixState).forEach(([key, isAllowed]) => {
        if (isAllowed) {
          const [fromStatusId, toStatusId] = key.split('->')
          if (fromStatusId && toStatusId && fromStatusId !== toStatusId) {
            transitionsList.push({ fromStatusId, toStatusId })
          }
        }
      })
      return projectService.updateWorkflowTransitions(
        projectId,
        selectedWorkflow.id,
        transitionsList,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-workflows'] })
      onFeedback({ type: 'success', message: 'Lưu ma trận quy trình thành công!' })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể lưu ma trận quy trình'
      onFeedback({ type: 'error', message: msg })
    },
  })

  const createWorkflowMutation = useMutation({
    mutationFn: () => projectService.createWorkflow(projectId, newWorkflowName.trim()),
    onSuccess: (newWf) => {
      queryClient.invalidateQueries({ queryKey: ['project-workflows'] })
      setIsNewWorkflowModalOpen(false)
      setNewWorkflowName('')
      setSelectedWorkflowId(newWf.id)
      onFeedback({ type: 'success', message: 'Tạo quy trình mới thành công!' })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể tạo quy trình'
      onFeedback({ type: 'error', message: msg })
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Chọn quy trình:</label>
          <Select
            value={selectedWorkflowId}
            onChange={setSelectedWorkflowId}
            className="min-w-[180px]"
            buttonClassName="font-semibold"
            options={workflows.map((wf) => ({
              value: wf.id,
              label: wf.name,
            }))}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsNewWorkflowModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo Workflow mới</span>
          </button>
          <button
            type="button"
            onClick={() => saveTransitionsMutation.mutate()}
            disabled={saveTransitionsMutation.isPending}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {saveTransitionsMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Lưu ma trận chuyển trạng thái</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Đánh dấu tích để cho phép kéo thả thẻ từ cột bên trái (Từ trạng thái) sang cột phía trên (Sang trạng thái).
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAllTransitions(true)}
            className="text-[11px] text-indigo-600 hover:underline cursor-pointer"
          >
            Cho phép tất cả
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setAllTransitions(false)}
            className="text-[11px] text-slate-500 hover:underline cursor-pointer"
          >
            Xóa tất cả
          </button>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white shadow-2xs">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 text-[11px] font-bold">
              <th className="p-3 text-left border-r border-slate-200 w-44">Từ \ Sang trạng thái</th>
              {statuses.map((col) => (
                <th key={col.id} className="p-3 min-w-[100px] border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                    <span>{col.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {statuses.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50">
                <td className="p-3 text-left font-semibold text-slate-800 border-r border-slate-200 bg-slate-50/30">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: row.color }} />
                    <span>{row.name}</span>
                  </div>
                </td>
                {statuses.map((col) => {
                  const isSame = row.id === col.id
                  const isAllowed = !!matrixState[`${row.id}->${col.id}`]

                  return (
                    <td
                      key={col.id}
                      className="p-3 border-r border-slate-100 last:border-r-0 text-center"
                    >
                      {isSame ? (
                        <span className="text-slate-300 font-mono">-</span>
                      ) : (
                        <input
                          type="checkbox"
                          checked={isAllowed}
                          onChange={() => toggleMatrixCell(row.id, col.id)}
                          aria-label={`Cho phép chuyển từ ${row.name} sang ${col.name}`}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Tạo Workflow Mới */}
      {isNewWorkflowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Tạo Workflow mới</h3>
              <button
                type="button"
                onClick={() => setIsNewWorkflowModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tên quy trình</label>
              <input
                type="text"
                placeholder="Ví dụ: Bug Tracking Flow, Simple Flow..."
                value={newWorkflowName}
                onChange={(e) => setNewWorkflowName(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewWorkflowModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => createWorkflowMutation.mutate()}
                disabled={!newWorkflowName.trim() || createWorkflowMutation.isPending}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs disabled:opacity-50"
              >
                {createWorkflowMutation.isPending ? 'Đang tạo...' : 'Tạo quy trình'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkflowsSettingsTab
