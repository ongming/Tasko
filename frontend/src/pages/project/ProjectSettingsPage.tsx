import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Settings,
  Columns,
  Layers,
  GitCommit,
  FormInput,
  Save,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  X,
  HelpCircle,
  Kanban,
  ListTodo,
  CheckSquare,
  Bug,
  Package,
  Bookmark,
  Shield,
  Tag,
} from 'lucide-react'
import { projectService } from '@/services/projectService'
import type {
  ProjectStatus,
  ProjectWorkType,
  Workflow,
  CustomField,
  CustomFieldType,
} from '@/types/projectConfig'
import type { Project } from '@/types/workspace'

type SettingsTab = 'general' | 'statuses' | 'work-types' | 'workflows' | 'custom-fields'

export function ProjectSettingsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { workspaceSlug, projectKey } = useParams<{ workspaceSlug?: string; projectKey?: string }>()
  const [searchParams] = useSearchParams()
  const projectParam = projectKey || searchParams.get('project') || searchParams.get('projectId') || ''

  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // 1. Tải chi tiết Dự án
  const { data: project, isLoading: isLoadingProject } = useQuery<Project>({
    queryKey: ['project', projectParam],
    queryFn: () => projectService.getProjectById(projectParam),
    enabled: !!projectParam,
  })

  // 2. Tải danh sách Statuses
  const { data: statuses = [], isLoading: isLoadingStatuses } = useQuery<ProjectStatus[]>({
    queryKey: ['project-statuses', project?.id || projectParam],
    queryFn: () => projectService.getProjectStatuses(project?.id || projectParam),
    enabled: !!(project?.id || projectParam),
  })

  // 3. Tải danh sách WorkTypes
  const { data: workTypes = [], isLoading: isLoadingWorkTypes } = useQuery<ProjectWorkType[]>({
    queryKey: ['project-work-types', project?.id || projectParam],
    queryFn: () => projectService.getProjectWorkTypes(project?.id || projectParam),
    enabled: !!(project?.id || projectParam),
  })

  // 4. Tải danh sách Workflows
  const { data: workflows = [], isLoading: isLoadingWorkflows } = useQuery<Workflow[]>({
    queryKey: ['project-workflows', project?.id || projectParam],
    queryFn: () => projectService.getWorkflows(project?.id || projectParam),
    enabled: !!(project?.id || projectParam),
  })

  // 5. Tải danh sách CustomFields
  const { data: customFields = [], isLoading: isLoadingCustomFields } = useQuery<CustomField[]>({
    queryKey: ['project-custom-fields', project?.id || projectParam],
    queryFn: () => projectService.getCustomFields(project?.id || projectParam),
    enabled: !!(project?.id || projectParam),
  })

  // ==========================================
  // TAB 1: THÔNG TIN CHUNG (GENERAL)
  // ==========================================
  const [generalName, setGeneralName] = useState('')
  const [generalDescription, setGeneralDescription] = useState('')
  const [generalStartDate, setGeneralStartDate] = useState('')
  const [generalEndDate, setGeneralEndDate] = useState('')
  const [generalMethodology, setGeneralMethodology] = useState<'KANBAN' | 'SCRUM' | 'SCRUMBAN'>('KANBAN')

  // Modal Xóa Dự án
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteConfirmationKey, setDeleteConfirmationKey] = useState('')

  useEffect(() => {
    if (project) {
      setGeneralName(project.name || '')
      setGeneralDescription(project.description || '')
      setGeneralStartDate(project.startDate ? project.startDate.split('T')[0] : '')
      setGeneralEndDate(project.endDate ? project.endDate.split('T')[0] : '')
      setGeneralMethodology(
        (project.methodology as 'KANBAN' | 'SCRUM' | 'SCRUMBAN') ||
          (project.settings?.method_id === 'scrum'
            ? 'SCRUM'
            : project.settings?.method_id === 'scrumban'
            ? 'SCRUMBAN'
            : 'KANBAN'),
      )
    }
  }, [project])

  const updateGeneralMutation = useMutation({
    mutationFn: () =>
      projectService.updateProjectSettings(project?.id || projectParam, {
        name: generalName,
        description: generalDescription,
        startDate: generalStartDate || null,
        endDate: generalEndDate || null,
        methodology: generalMethodology,
        settings: {
          ...project?.settings,
          method_id: generalMethodology.toLowerCase(),
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectParam] })
      setFeedback({ type: 'success', message: 'Cập nhật thông tin dự án thành công!' })
      setTimeout(() => setFeedback(null), 3000)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể lưu cài đặt'
      setFeedback({ type: 'error', message: msg })
    },
  })

  const deleteProjectMutation = useMutation({
    mutationFn: () => projectService.deleteProject(project?.id || projectParam),
    onSuccess: () => {
      setIsDeleteModalOpen(false)
      const redirectUrl = workspaceSlug ? `/${workspaceSlug}/projects` : '/workspace/projects'
      navigate(redirectUrl, { replace: true })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể xóa dự án'
      setFeedback({ type: 'error', message: msg })
    },
  })

  // ==========================================
  // TAB 2: CỘT TRẠNG THÁI & WIP LIMIT (STATUSES)
  // ==========================================
  const [editingStatus, setEditingStatus] = useState<ProjectStatus | null>(null)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [statusFormName, setStatusFormName] = useState('')
  const [statusFormCategory, setStatusFormCategory] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO')
  const [statusFormColor, setStatusFormColor] = useState('#94a3b8')
  const [statusFormWipLimit, setStatusFormWipLimit] = useState<string>('')

  // Modal Xóa Status (Fallback)
  const [deletingStatus, setDeletingStatus] = useState<ProjectStatus | null>(null)
  const [fallbackStatusId, setFallbackStatusId] = useState('')

  const handleOpenStatusModal = (status?: ProjectStatus) => {
    if (status) {
      setEditingStatus(status)
      setStatusFormName(status.name)
      setStatusFormCategory(status.category)
      setStatusFormColor(status.color)
      setStatusFormWipLimit(status.wipLimit ? String(status.wipLimit) : '')
    } else {
      setEditingStatus(null)
      setStatusFormName('')
      setStatusFormCategory('TODO')
      setStatusFormColor('#94a3b8')
      setStatusFormWipLimit('')
    }
    setIsStatusModalOpen(true)
  }

  const saveStatusMutation = useMutation({
    mutationFn: () => {
      const wip = statusFormWipLimit.trim() ? parseInt(statusFormWipLimit, 10) : null
      if (editingStatus) {
        return projectService.updateStatus(project?.id || projectParam, editingStatus.id, {
          name: statusFormName,
          category: statusFormCategory,
          color: statusFormColor,
          wipLimit: wip,
        })
      }
      return projectService.createStatus(project?.id || projectParam, {
        name: statusFormName,
        category: statusFormCategory,
        color: statusFormColor,
        wipLimit: wip,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-statuses'] })
      setIsStatusModalOpen(false)
      setFeedback({ type: 'success', message: 'Lưu trạng thái thành công!' })
      setTimeout(() => setFeedback(null), 3000)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể lưu trạng thái'
      setFeedback({ type: 'error', message: msg })
    },
  })

  const deleteStatusMutation = useMutation({
    mutationFn: () => {
      if (!deletingStatus) return Promise.resolve(null as any)
      return projectService.deleteStatus(
        project?.id || projectParam,
        deletingStatus.id,
        fallbackStatusId || undefined,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-statuses'] })
      setDeletingStatus(null)
      setFallbackStatusId('')
      setFeedback({ type: 'success', message: 'Đã xóa trạng thái!' })
      setTimeout(() => setFeedback(null), 3000)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể xóa trạng thái'
      setFeedback({ type: 'error', message: msg })
    },
  })

  // ==========================================
  // TAB 3: LOẠI CÔNG VIỆC (WORK TYPES)
  // ==========================================
  const [editingWorkType, setEditingWorkType] = useState<ProjectWorkType | null>(null)
  const [isWorkTypeModalOpen, setIsWorkTypeModalOpen] = useState(false)
  const [wtFormName, setWtFormName] = useState('')
  const [wtFormIcon, setWtFormIcon] = useState('CheckSquare')
  const [wtFormColor, setWtFormColor] = useState('bg-blue-100 text-blue-700')
  const [wtFormIsSubtask, setWtFormIsSubtask] = useState(false)
  const [wtFormWorkflowId, setWtFormWorkflowId] = useState<string>('')

  // Modal Xóa WorkType (Fallback)
  const [deletingWorkType, setDeletingWorkType] = useState<ProjectWorkType | null>(null)
  const [fallbackWorkTypeId, setFallbackWorkTypeId] = useState('')

  const handleOpenWorkTypeModal = (wt?: ProjectWorkType) => {
    if (wt) {
      setEditingWorkType(wt)
      setWtFormName(wt.name)
      setWtFormIcon(wt.icon || 'CheckSquare')
      setWtFormColor(wt.color || 'bg-blue-100 text-blue-700')
      setWtFormIsSubtask(wt.isSubtask ?? false)
      setWtFormWorkflowId(wt.workflowId || '')
    } else {
      setEditingWorkType(null)
      setWtFormName('')
      setWtFormIcon('CheckSquare')
      setWtFormColor('bg-blue-100 text-blue-700')
      setWtFormIsSubtask(false)
      setWtFormWorkflowId(workflows[0]?.id || '')
    }
    setIsWorkTypeModalOpen(true)
  }

  const saveWorkTypeMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: wtFormName,
        icon: wtFormIcon,
        color: wtFormColor,
        isSubtask: wtFormIsSubtask,
        workflowId: wtFormWorkflowId || undefined,
      }
      if (editingWorkType) {
        return projectService.updateWorkType(
          project?.id || projectParam,
          editingWorkType.id,
          payload,
        )
      }
      return projectService.createWorkType(project?.id || projectParam, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-work-types'] })
      setIsWorkTypeModalOpen(false)
      setFeedback({ type: 'success', message: 'Lưu loại công việc thành công!' })
      setTimeout(() => setFeedback(null), 3000)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể lưu loại công việc'
      setFeedback({ type: 'error', message: msg })
    },
  })

  const deleteWorkTypeMutation = useMutation({
    mutationFn: () => {
      if (!deletingWorkType) return Promise.resolve(null as any)
      return projectService.deleteWorkType(
        project?.id || projectParam,
        deletingWorkType.id,
        fallbackWorkTypeId || undefined,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-work-types'] })
      setDeletingWorkType(null)
      setFallbackWorkTypeId('')
      setFeedback({ type: 'success', message: 'Đã xóa loại công việc!' })
      setTimeout(() => setFeedback(null), 3000)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể xóa loại công việc'
      setFeedback({ type: 'error', message: msg })
    },
  })

  // ==========================================
  // TAB 4: WORKFLOWS & TRANSITION MATRIX
  // ==========================================
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('')
  const [matrixState, setMatrixState] = useState<Record<string, boolean>>({}) // key: `${fromId}->${toId}`
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

  // Khởi tạo ma trận từ transitions của workflow đã chọn
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
        project?.id || projectParam,
        selectedWorkflow.id,
        transitionsList,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-workflows'] })
      setFeedback({ type: 'success', message: 'Lưu ma trận quy trình thành công!' })
      setTimeout(() => setFeedback(null), 3000)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể lưu ma trận quy trình'
      setFeedback({ type: 'error', message: msg })
    },
  })

  const createWorkflowMutation = useMutation({
    mutationFn: () =>
      projectService.createWorkflow(project?.id || projectParam, newWorkflowName.trim()),
    onSuccess: (newWf) => {
      queryClient.invalidateQueries({ queryKey: ['project-workflows'] })
      setIsNewWorkflowModalOpen(false)
      setNewWorkflowName('')
      setSelectedWorkflowId(newWf.id)
      setFeedback({ type: 'success', message: 'Tạo quy trình mới thành công!' })
      setTimeout(() => setFeedback(null), 3000)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể tạo quy trình'
      setFeedback({ type: 'error', message: msg })
    },
  })

  // ==========================================
  // TAB 5: TRƯỜNG TÙY CHỈNH (CUSTOM FIELDS)
  // ==========================================
  const [editingCustomField, setEditingCustomField] = useState<CustomField | null>(null)
  const [isCustomFieldModalOpen, setIsCustomFieldModalOpen] = useState(false)
  const [cfFormName, setCfFormName] = useState('')
  const [cfFormFieldType, setCfFormFieldType] = useState<CustomFieldType>('TEXT')
  const [cfFormOptions, setCfFormOptions] = useState<string>('')
  const [cfFormIsRequired, setCfFormIsRequired] = useState(false)

  const handleOpenCustomFieldModal = (cf?: CustomField) => {
    if (cf) {
      setEditingCustomField(cf)
      setCfFormName(cf.name)
      setCfFormFieldType(cf.fieldType)
      setCfFormOptions(cf.options ? cf.options.join(', ') : '')
      setCfFormIsRequired(cf.isRequired)
    } else {
      setEditingCustomField(null)
      setCfFormName('')
      setCfFormFieldType('TEXT')
      setCfFormOptions('')
      setCfFormIsRequired(false)
    }
    setIsCustomFieldModalOpen(true)
  }

  const saveCustomFieldMutation = useMutation({
    mutationFn: () => {
      const parsedOptions =
        cfFormFieldType === 'SELECT'
          ? cfFormOptions
              .split(',')
              .map((o) => o.trim())
              .filter(Boolean)
          : undefined

      const payload = {
        name: cfFormName,
        fieldType: cfFormFieldType,
        options: parsedOptions,
        isRequired: cfFormIsRequired,
      }

      if (editingCustomField) {
        return projectService.updateCustomField(
          project?.id || projectParam,
          editingCustomField.id,
          payload,
        )
      }
      return projectService.createCustomField(project?.id || projectParam, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-custom-fields'] })
      setIsCustomFieldModalOpen(false)
      setFeedback({ type: 'success', message: 'Lưu trường tùy chỉnh thành công!' })
      setTimeout(() => setFeedback(null), 3000)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể lưu trường tùy chỉnh'
      setFeedback({ type: 'error', message: msg })
    },
  })

  const deleteCustomFieldMutation = useMutation({
    mutationFn: (fieldId: string) =>
      projectService.deleteCustomField(project?.id || projectParam, fieldId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-custom-fields'] })
      setFeedback({ type: 'success', message: 'Đã xóa trường tùy chỉnh!' })
      setTimeout(() => setFeedback(null), 3000)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể xóa trường tùy chỉnh'
      setFeedback({ type: 'error', message: msg })
    },
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

      {/* Thông báo Feedback (Thành công / Thất bại) */}
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
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all cursor-pointer ${
            activeTab === 'general'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Thông tin chung</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('statuses')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all cursor-pointer ${
            activeTab === 'statuses'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Columns className="w-4 h-4" />
          <span>Cột trạng thái & WIP</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('work-types')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all cursor-pointer ${
            activeTab === 'work-types'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Loại công việc</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('workflows')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all cursor-pointer ${
            activeTab === 'workflows'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <GitCommit className="w-4 h-4" />
          <span>Luồng quy trình</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('custom-fields')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all cursor-pointer ${
            activeTab === 'custom-fields'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <FormInput className="w-4 h-4" />
          <span>Trường tùy chỉnh</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: THÔNG TIN CHUNG (GENERAL)                          */}
      {/* ========================================================= */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Thông tin cơ bản
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên dự án</label>
                <input
                  type="text"
                  value={generalName}
                  onChange={(e) => setGeneralName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mã dự án (Key)</label>
                <input
                  type="text"
                  disabled
                  value={project?.key || ''}
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 text-slate-400 font-mono rounded-lg cursor-not-allowed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả dự án</label>
                <textarea
                  rows={3}
                  value={generalDescription}
                  onChange={(e) => setGeneralDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  placeholder="Nhập mục tiêu và phạm vi của dự án..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày bắt đầu</label>
                <input
                  type="date"
                  value={generalStartDate}
                  onChange={(e) => setGeneralStartDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày kết thúc dự kiến</label>
                <input
                  type="date"
                  value={generalEndDate}
                  onChange={(e) => setGeneralEndDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Chuyển đổi phương pháp quản lý (Methodology) */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Phương pháp quản lý (Methodology)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'KANBAN',
                    title: 'Kanban',
                    desc: 'Luồng công việc liên tục, trực quan hóa trên bảng và tối ưu WIP.',
                    icon: Kanban,
                  },
                  {
                    id: 'SCRUM',
                    title: 'Scrum',
                    desc: 'Lập kế hoạch theo Sprint định kỳ, Backlog và ước lượng điểm số.',
                    icon: ListTodo,
                  },
                  {
                    id: 'SCRUMBAN',
                    title: 'Scrumban',
                    desc: 'Kết hợp linh hoạt giữa giới hạn WIP của Kanban và chu kỳ Sprint của Scrum.',
                    icon: Columns,
                  },
                ].map((item) => {
                  const Icon = item.icon
                  const isSelected = generalMethodology === item.id

                  return (
                    <div
                      key={item.id}
                      onClick={() => setGeneralMethodology(item.id as any)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                    </div>
                  )
                })}
              </div>
              <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-slate-400 shrink-0" />
                <span>Việc chuyển đổi phương pháp quản lý sẽ không làm mất dữ liệu công việc hiện có.</span>
              </p>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => updateGeneralMutation.mutate()}
                disabled={updateGeneralMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {updateGeneralMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </div>

          {/* Vùng nguy hiểm (Danger Zone) */}
          <div className="bg-rose-50/50 rounded-xl border border-rose-200 p-5 space-y-3">
            <h2 className="text-sm font-bold text-rose-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Vùng nguy hiểm</span>
            </h2>
            <p className="text-xs text-rose-700 leading-relaxed">
              Xóa dự án sẽ chuyển toàn bộ công việc và cấu hình của dự án vào trạng thái lưu trữ. Chỉ có
              Chủ sở hữu hoặc Quản trị viên Không gian làm việc mới có quyền thực hiện.
            </p>
            <div>
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmationKey('')
                  setIsDeleteModalOpen(true)
                }}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
              >
                Xóa dự án này
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CỘT TRẠNG THÁI & WIP LIMIT (STATUSES)              */}
      {/* ========================================================= */}
      {activeTab === 'statuses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Quản lý các cột trạng thái và áp đặt giới hạn công việc đang xử lý (WIP Limit) để tránh tắc nghẽn.
            </p>
            <button
              type="button"
              onClick={() => handleOpenStatusModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm cột trạng thái</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            {statuses.map((status) => (
              <div
                key={status.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: status.color || '#94a3b8' }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{status.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {status.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      WIP Limit: {status.wipLimit ? <strong>{status.wipLimit} thẻ</strong> : 'Không giới hạn'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenStatusModal(status)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    title="Chỉnh sửa cột"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingStatus(status)
                      const other = statuses.find((s) => s.id !== status.id)
                      setFallbackStatusId(other?.id || '')
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Xóa cột"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: LOẠI CÔNG VIỆC (WORK TYPES)                        */}
      {/* ========================================================= */}
      {activeTab === 'work-types' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Cấu hình các phân loại công việc và gán quy trình chuyển đổi trạng thái riêng cho từng loại.
            </p>
            <button
              type="button"
              onClick={() => handleOpenWorkTypeModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm loại công việc</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            {workTypes.map((wt) => {
              const assignedWorkflow = workflows.find((w) => w.id === wt.workflowId)

              return (
                <div
                  key={wt.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                      {wt.name.toLowerCase().includes('bug') ? (
                        <Bug className="w-4 h-4 text-rose-600" />
                      ) : wt.name.toLowerCase().includes('module') ? (
                        <Package className="w-4 h-4 text-purple-600" />
                      ) : (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{wt.name}</span>
                        {wt.isSubtask && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            Subtask
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Quy trình áp dụng:{' '}
                        <strong className="text-indigo-600">
                          {assignedWorkflow ? assignedWorkflow.name : 'Chưa gán (Mặc định)'}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenWorkTypeModal(wt)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Chỉnh sửa loại công việc"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeletingWorkType(wt)
                        const other = workTypes.find((w) => w.id !== wt.id)
                        setFallbackWorkTypeId(other?.id || '')
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa loại công việc"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: WORKFLOWS & TRANSITION MATRIX                      */}
      {/* ========================================================= */}
      {activeTab === 'workflows' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">Chọn quy trình:</label>
              <select
                value={selectedWorkflowId}
                onChange={(e) => setSelectedWorkflowId(e.target.value)}
                className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {workflows.map((wf) => (
                  <option key={wf.id} value={wf.id}>
                    {wf.name}
                  </option>
                ))}
              </select>
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

          {/* Ma trận chuyển trạng thái (Transition Matrix Grid) */}
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
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: TRƯỜNG TÙY CHỈNH (CUSTOM FIELDS)                   */}
      {/* ========================================================= */}
      {activeTab === 'custom-fields' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Thêm các trường thông tin bổ sung cho công việc (văn bản, số, ngày tháng, danh sách lựa chọn).
            </p>
            <button
              type="button"
              onClick={() => handleOpenCustomFieldModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm trường tùy chỉnh</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            {customFields.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Chưa có trường tùy chỉnh nào trong dự án. Nhấn nút phía trên để tạo trường mới.
              </div>
            ) : (
              customFields.map((cf) => (
                <div
                  key={cf.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{cf.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                          {cf.fieldType}
                        </span>
                        {cf.isRequired && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                            Bắt buộc
                          </span>
                        )}
                      </div>
                      {cf.options && cf.options.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {cf.options.map((opt, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded"
                            >
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenCustomFieldModal(cf)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Chỉnh sửa trường"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCustomFieldMutation.mutate(cf.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa trường"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: XÁC NHẬN XÓA DỰ ÁN (PROJECT KEY CHECK)          */}
      {/* ========================================================= */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Xác nhận xóa dự án</h3>
                <p className="text-xs text-slate-500">Hành động này sẽ xóa dự án khỏi hệ thống.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Để xác nhận, vui lòng nhập chính xác mã dự án{' '}
              <strong className="text-rose-600 font-mono px-1 py-0.5 bg-rose-50 rounded">
                {project?.key}
              </strong>{' '}
              vào ô bên dưới:
            </p>

            <input
              type="text"
              placeholder={`Nhập mã "${project?.key}" để xác nhận...`}
              value={deleteConfirmationKey}
              onChange={(e) => setDeleteConfirmationKey(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-rose-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => deleteProjectMutation.mutate()}
                disabled={
                  deleteConfirmationKey.trim().toUpperCase() !== project?.key?.toUpperCase() ||
                  deleteProjectMutation.isPending
                }
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-2xs cursor-pointer disabled:opacity-40"
              >
                {deleteProjectMutation.isPending ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: THÊM / SỬA STATUS                                */}
      {/* ========================================================= */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingStatus ? 'Chỉnh sửa cột trạng thái' : 'Thêm cột trạng thái mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên cột trạng thái</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đang kiểm thử, Hoàn thành..."
                  value={statusFormName}
                  onChange={(e) => setStatusFormName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nhóm trạng thái</label>
                <select
                  value={statusFormCategory}
                  onChange={(e) => setStatusFormCategory(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="TODO">Cần làm (TODO)</option>
                  <option value="IN_PROGRESS">Đang làm (IN_PROGRESS)</option>
                  <option value="DONE">Hoàn thành (DONE)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Màu sắc nhận diện</label>
                <input
                  type="color"
                  value={statusFormColor}
                  onChange={(e) => setStatusFormColor(e.target.value)}
                  className="w-12 h-8 p-1 border border-slate-200 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Giới hạn số thẻ tối đa (WIP Limit)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Để trống nếu không giới hạn"
                  value={statusFormWipLimit}
                  onChange={(e) => setStatusFormWipLimit(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => saveStatusMutation.mutate()}
                disabled={!statusFormName.trim() || saveStatusMutation.isPending}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs disabled:opacity-50"
              >
                {saveStatusMutation.isPending ? 'Đang lưu...' : 'Lưu cột'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: XÓA STATUS (FALLBACK CHỌN CỘT THAY THẾ)          */}
      {/* ========================================================= */}
      {deletingStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Xóa cột "{deletingStatus.name}"?</h3>
                <p className="text-xs text-slate-500">Chuyển các công việc sang cột thay thế trước khi xóa.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chọn cột thay thế cho các thẻ hiện có:
              </label>
              <select
                value={fallbackStatusId}
                onChange={(e) => setFallbackStatusId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="">-- Chọn cột thay thế --</option>
                {statuses
                  .filter((s) => s.id !== deletingStatus.id)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingStatus(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => deleteStatusMutation.mutate()}
                disabled={deleteStatusMutation.isPending}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-2xs"
              >
                {deleteStatusMutation.isPending ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: THÊM / SỬA WORK TYPE                             */}
      {/* ========================================================= */}
      {isWorkTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingWorkType ? 'Chỉnh sửa loại công việc' : 'Thêm loại công việc mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsWorkTypeModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên loại công việc</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Task, Bug, Story, Spike..."
                  value={wtFormName}
                  onChange={(e) => setWtFormName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Biểu tượng (Icon)</label>
                <select
                  value={wtFormIcon}
                  onChange={(e) => setWtFormIcon(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="CheckSquare">CheckSquare (Task chuẩn)</option>
                  <option value="Bug">Bug (Lỗi phần mềm)</option>
                  <option value="Package">Package (Module / Gói việc)</option>
                  <option value="Bookmark">Bookmark (Story)</option>
                  <option value="Shield">Shield (Bảo mật / Cải tiến)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quy trình áp dụng</label>
                <select
                  value={wtFormWorkflowId}
                  onChange={(e) => setWtFormWorkflowId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="">-- Quy trình mặc định --</option>
                  {workflows.map((wf) => (
                    <option key={wf.id} value={wf.id}>
                      {wf.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="subtask-checkbox"
                  checked={wtFormIsSubtask}
                  onChange={(e) => setWtFormIsSubtask(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                />
                <label htmlFor="subtask-checkbox" className="text-xs text-slate-700 cursor-pointer">
                  Đây là loại công việc con (Subtask)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsWorkTypeModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => saveWorkTypeMutation.mutate()}
                disabled={!wtFormName.trim() || saveWorkTypeMutation.isPending}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs disabled:opacity-50"
              >
                {saveWorkTypeMutation.isPending ? 'Đang lưu...' : 'Lưu loại công việc'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: XÓA WORK TYPE (FALLBACK)                         */}
      {/* ========================================================= */}
      {deletingWorkType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Xóa loại công việc "{deletingWorkType.name}"?
                </h3>
                <p className="text-xs text-slate-500">Chuyển các task hiện tại sang loại công việc khác.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chọn loại công việc thay thế:
              </label>
              <select
                value={fallbackWorkTypeId}
                onChange={(e) => setFallbackWorkTypeId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="">-- Chọn loại thay thế --</option>
                {workTypes
                  .filter((w) => w.id !== deletingWorkType.id)
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingWorkType(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => deleteWorkTypeMutation.mutate()}
                disabled={deleteWorkTypeMutation.isPending}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-2xs"
              >
                {deleteWorkTypeMutation.isPending ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: TẠO WORKFLOW MỚI                                 */}
      {/* ========================================================= */}
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

      {/* ========================================================= */}
      {/* MODAL 7: THÊM / SỬA CUSTOM FIELD                          */}
      {/* ========================================================= */}
      {isCustomFieldModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingCustomField ? 'Chỉnh sửa trường tùy chỉnh' : 'Thêm trường tùy chỉnh mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCustomFieldModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên trường</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Mức độ nghiêm trọng, Ngày phát hành..."
                  value={cfFormName}
                  onChange={(e) => setCfFormName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kiểu dữ liệu</label>
                <select
                  value={cfFormFieldType}
                  onChange={(e) => setCfFormFieldType(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="TEXT">Văn bản (TEXT)</option>
                  <option value="NUMBER">Số nguyên / Thập phân (NUMBER)</option>
                  <option value="DATE">Ngày tháng (DATE)</option>
                  <option value="SELECT">Danh sách chọn (SELECT)</option>
                </select>
              </div>

              {cfFormFieldType === 'SELECT' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Các lựa chọn (phân tách bởi dấu phẩy)
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Rất cao, Cao, Bình thường, Thấp"
                    value={cfFormOptions}
                    onChange={(e) => setCfFormOptions(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="cf-required-checkbox"
                  checked={cfFormIsRequired}
                  onChange={(e) => setCfFormIsRequired(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                />
                <label htmlFor="cf-required-checkbox" className="text-xs text-slate-700 cursor-pointer">
                  Bắt buộc nhập khi tạo công việc (Required)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCustomFieldModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => saveCustomFieldMutation.mutate()}
                disabled={!cfFormName.trim() || saveCustomFieldMutation.isPending}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs disabled:opacity-50"
              >
                {saveCustomFieldMutation.isPending ? 'Đang lưu...' : 'Lưu trường'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectSettingsPage
