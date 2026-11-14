import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { projectService } from '@/services/projectService'
import { workspaceService } from '@/services/workspaceService'
import {
  BUSINESS_DOMAINS,
  METHOD_DETAILS,
  PROJECT_TEMPLATES,
  generateProjectKey,
} from '@/components/create-project'
import type {
  AgileCardConfig,
  BusinessDomain,
  WorkflowStage,
  CustomWorkType,
} from '@/types/createProject'
import type { ProjectTemplate } from '@/types/projectTemplate'

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

export interface CreateProjectActions {
  setStep: (step: CreateProjectStep) => void
  setSelectedMethod: (method: AgileCardConfig | null) => void
  selectMethod: (method: AgileCardConfig) => void
  selectDomain: (domain: BusinessDomain) => void
  selectTemplate: (template: ProjectTemplate) => void
  proceedToFinalStep: () => void
  backToStepOne: () => void
  backToStepTwo: () => void
  handleNameChange: (name: string) => void
  setProjectKey: (key: string) => void
  setProjectColor: (color: string) => void
  handleClose: () => void
  handleCreateSubmit: (e: React.FormEvent) => Promise<void>
  // Tùy biến Workflow & Work Types
  updateWorkflowLabel: (id: string, label: string) => void
  updateWorkflowCategory: (id: string, category: 'TODO' | 'IN_PROGRESS' | 'DONE') => void
  addWorkflowStage: () => void
  removeWorkflowStage: (id: string) => void
  updateWorkTypeLabel: (id: string, label: string) => void
  updateWorkTypeIcon: (id: string, iconKey: string) => void
  addWorkType: () => void
  removeWorkType: (id: string) => void
  resetConfiguration: () => void
  toggleAdvanced: () => void
  // AI Modal Actions
  setIsAiModalOpen: (isOpen: boolean) => void
  setAiPrompt: (prompt: string) => void
  setAiUploadedFile: (file: File | null) => void
  handleAiSubmit: () => void
}

const DEFAULT_WORK_TYPES: CustomWorkType[] = [
  { id: 'module', label: 'Module', iconKey: 'Package', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'task', label: 'Task', iconKey: 'CheckSquare', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'bug', label: 'Bug', iconKey: 'Bug', color: 'bg-rose-100 text-rose-700 border-rose-200' },
]

/**
 * Custom Hook quản lý toàn bộ nghiệp vụ, trạng thái và tác vụ mạng cho trang Tạo dự án
 * Tách biệt hoàn toàn khỏi giao diện (Separation of Concerns).
 * Hỗ trợ luồng 3 bước chuẩn mực:
 * - Bước 1: Chọn phương pháp quản lý (Kanban, Scrum, Scrumban)
 * - Bước 2: Xem chi tiết mẫu & chọn mô hình ngành nghề (Domain)
 * - Bước 3: Thiết lập thông tin dự án cuối cùng (Tên, Key, Màu sắc) & Tùy biến Workflow / Work Types
 */
export function useCreateProject(): { state: CreateProjectState; actions: CreateProjectActions } {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Lấy workspaceId từ URL query param (?workspaceId=...) hoặc tải danh sách workspace của user
  const [workspaceId, setWorkspaceId] = useState<string>(searchParams.get('workspaceId') || '')

  useEffect(() => {
    if (!workspaceId) {
      workspaceService
        .getMyWorkspaces()
        .then((workspaces) => {
          if (workspaces && workspaces.length > 0) {
            setWorkspaceId(workspaces[0].id)
          }
        })
        .catch(() => {})
    }
  }, [workspaceId])

  // 1. Quản lý phân bước (Step Management)
  const [step, setStep] = useState<CreateProjectStep>(1)

  // 2. Trạng thái lựa chọn phương pháp & mô hình
  const [selectedMethod, setSelectedMethod] = useState<AgileCardConfig | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<BusinessDomain>(BUSINESS_DOMAINS[0]!)
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(PROJECT_TEMPLATES[0]!)

  // 3. Trạng thái Form tạo dự án
  const [projectName, setProjectName] = useState('')
  const [projectKey, setProjectKey] = useState('')
  const [projectColor, setProjectColor] = useState('bg-indigo-600')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // 4. Trạng thái Tùy biến nâng cao (Workflow & Work Types)
  const [workflow, setWorkflow] = useState<WorkflowStage[]>([])
  const [workTypes, setWorkTypes] = useState<CustomWorkType[]>(DEFAULT_WORK_TYPES)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  // 5. Trạng thái AI Assistant Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [aiUploadedFile, setAiUploadedFile] = useState<File | null>(null)
  const [aiPrompt, setAiPrompt] = useState('')

  // Điều hướng đóng trang về danh sách dự án
  const handleClose = useCallback(() => {
    navigate('/workspace/projects')
  }, [navigate])

  // Lắng nghe phím Escape cấp độ ứng dụng
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAiModalOpen) {
          setIsAiModalOpen(false)
        } else if (step === 3) {
          setStep(2)
        } else if (step === 2) {
          setStep(1)
          setSelectedMethod(null)
        } else {
          handleClose()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [step, isAiModalOpen, handleClose])

  // Xử lý thay đổi tên dự án & tự động sinh Key quốc tế chuẩn hóa
  const handleNameChange = useCallback(
    (val: string) => {
      setProjectName(val)
      if (error) setError('')
      const key = generateProjectKey(val)
      setProjectKey(key)
    },
    [error],
  )

  // Bước 1 -> Bước 2: Chọn phương pháp
  const selectMethod = useCallback(
    (method: AgileCardConfig) => {
      setSelectedMethod(method)
      const currentTemplate = selectedTemplate || PROJECT_TEMPLATES[0]!
      const initialName = `${currentTemplate.defaultPrefix} ${method.title}`
      setProjectName(initialName)
      handleNameChange(initialName)

      // Khởi tạo Workflow theo template đã chọn
      const initialWorkflow: WorkflowStage[] = currentTemplate.workflow.map((label, idx) => {
        let category: 'TODO' | 'IN_PROGRESS' | 'DONE' = 'IN_PROGRESS'
        if (idx === 0) category = 'TODO'
        else if (idx === currentTemplate.workflow.length - 1) category = 'DONE'

        return {
          id: `wf-${idx}-${Date.now()}`,
          label,
          category,
          color: category === 'TODO' ? '#94a3b8' : category === 'DONE' ? '#10b981' : '#4f46e5',
        }
      })
      setWorkflow(initialWorkflow)

      // Khởi tạo Work Types theo template đã chọn
      const initialWorkTypes: CustomWorkType[] = currentTemplate.workTypes.map((label, idx) => ({
        id: `wt-${idx}-${label.toLowerCase().replace(/\s+/g, '-')}`,
        label,
        iconKey: label.toLowerCase().includes('bug') ? 'Bug' : label.toLowerCase().includes('module') ? 'Package' : 'CheckSquare',
        color: idx === 0 ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200',
      }))
      setWorkTypes(initialWorkTypes)
      setStep(2)
    },
    [selectedTemplate, handleNameChange],
  )

  // Tùy biến Workflow
  const updateWorkflowLabel = useCallback((id: string, label: string) => {
    setWorkflow((prev) => prev.map((item) => (item.id === id ? { ...item, label } : item)))
  }, [])

  const updateWorkflowCategory = useCallback((id: string, category: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    const colorMap = {
      TODO: '#94a3b8',
      IN_PROGRESS: '#4f46e5',
      DONE: '#10b981',
    }
    setWorkflow((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              category,
              color: colorMap[category],
            }
          : item,
      ),
    )
  }, [])

  const addWorkflowStage = useCallback(() => {
    setWorkflow((prev) => [
      ...prev,
      {
        id: `wf-${Date.now()}`,
        label: `Giai đoạn ${prev.length + 1}`,
        category: 'IN_PROGRESS',
        color: '#4f46e5',
      },
    ])
  }, [])

  const removeWorkflowStage = useCallback((id: string) => {
    setWorkflow((prev) => {
      if (prev.length <= 2) return prev // Tối thiểu phải giữ lại 2 trạng thái
      return prev.filter((item) => item.id !== id)
    })
  }, [])

  // Tùy biến Work Types
  const updateWorkTypeLabel = useCallback((id: string, label: string) => {
    setWorkTypes((prev) => prev.map((item) => (item.id === id ? { ...item, label } : item)))
  }, [])

  const updateWorkTypeIcon = useCallback((id: string, iconKey: string) => {
    setWorkTypes((prev) => prev.map((item) => (item.id === id ? { ...item, iconKey } : item)))
  }, [])

  const addWorkType = useCallback(() => {
    setWorkTypes((prev) => [
      ...prev,
      {
        id: `wt-${Date.now()}`,
        label: `Loại mới ${prev.length + 1}`,
        iconKey: 'CheckSquare',
        color: 'bg-slate-100 text-slate-700 border-slate-200',
      },
    ])
  }, [])

  const removeWorkType = useCallback((id: string) => {
    setWorkTypes((prev) => {
      // Giữ lại ít nhất 2 loại công việc và không xóa 'module'
      if (prev.length <= 2 || id === 'module') return prev
      return prev.filter((item) => item.id !== id)
    })
  }, [])

  // Đặt lại cấu hình mặc định (Reset)
  const resetConfiguration = useCallback(() => {
    const currentTemplate = selectedTemplate || PROJECT_TEMPLATES[0]!
    const initialWorkflow: WorkflowStage[] = currentTemplate.workflow.map((label, idx) => ({
      id: `wf-${idx}-${Date.now()}`,
      label,
      color: idx === 0 ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-blue-50 text-blue-700 border-blue-200',
    }))
    setWorkflow(initialWorkflow)

    const initialWorkTypes: CustomWorkType[] = currentTemplate.workTypes.map((label, idx) => ({
      id: `wt-${idx}-${label.toLowerCase().replace(/\s+/g, '-')}`,
      label,
      iconKey: label.toLowerCase().includes('bug') ? 'Bug' : label.toLowerCase().includes('module') ? 'Package' : 'CheckSquare',
      color: idx === 0 ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200',
    }))
    setWorkTypes(initialWorkTypes)
  }, [selectedTemplate])

  const toggleAdvanced = useCallback(() => {
    setIsAdvancedOpen((prev) => !prev)
  }, [])

  // Tại Bước 2: Chọn mẫu mô hình dự án (ProjectTemplate)
  const selectTemplate = useCallback(
    (template: ProjectTemplate) => {
      setSelectedTemplate(template)
      // Cập nhật selectedDomain tương thích
      const matchedDomain = BUSINESS_DOMAINS.find((d) => d.id === template.id) || BUSINESS_DOMAINS[0]!
      setSelectedDomain(matchedDomain)

      const newName = `${template.defaultPrefix} ${selectedMethod?.title || 'Project'}`
      setProjectName(newName)
      handleNameChange(newName)

      // Cập nhật Workflow & WorkTypes tương ứng
      const updatedWorkflow: WorkflowStage[] = template.workflow.map((label, idx) => {
        let category: 'TODO' | 'IN_PROGRESS' | 'DONE' = 'IN_PROGRESS'
        if (idx === 0) category = 'TODO'
        else if (idx === template.workflow.length - 1) category = 'DONE'

        return {
          id: `wf-${idx}-${Date.now()}`,
          label,
          category,
          color: category === 'TODO' ? '#94a3b8' : category === 'DONE' ? '#10b981' : '#4f46e5',
        }
      })
      setWorkflow(updatedWorkflow)

      const updatedWorkTypes: CustomWorkType[] = template.workTypes.map((label, idx) => ({
        id: `wt-${idx}-${label.toLowerCase().replace(/\s+/g, '-')}`,
        label,
        iconKey: label.toLowerCase().includes('bug') ? 'Bug' : label.toLowerCase().includes('module') ? 'Package' : 'CheckSquare',
        color: idx === 0 ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200',
      }))
      setWorkTypes(updatedWorkTypes)
    },
    [selectedMethod, handleNameChange],
  )

  // Giữ lại selectDomain để tương thích ngược nếu cần
  const selectDomain = useCallback(
    (domain: BusinessDomain) => {
      setSelectedDomain(domain)
      const matchedTemplate = PROJECT_TEMPLATES.find((t) => t.id === domain.id)
      if (matchedTemplate) {
        setSelectedTemplate(matchedTemplate)
      }
      const newName = `${domain.defaultPrefix} ${selectedMethod?.title || 'Project'}`
      setProjectName(newName)
      handleNameChange(newName)
    },
    [selectedMethod, handleNameChange],
  )

  // Bước 2 -> Bước 3: Chuyển sang trang thiết lập cuối cùng
  const proceedToFinalStep = useCallback(() => {
    setStep(3)
  }, [])

  // Quay lại Bước 1
  const backToStepOne = useCallback(() => {
    setSelectedMethod(null)
    setStep(1)
  }, [])

  // Quay lại Bước 2
  const backToStepTwo = useCallback(() => {
    setStep(2)
  }, [])

  // Submit tạo dự án qua API
  const handleCreateSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!projectName.trim()) {
        setError('Vui lòng nhập tên dự án')
        return
      }

      if (!workspaceId) {
        setError('Chưa xác định được không gian làm việc. Vui lòng thử lại hoặc chọn một Workspace.')
        return
      }

      try {
        setIsSubmitting(true)
        setError('')

        const payload = {
          name: projectName.trim(),
          key: (projectKey.trim() || 'PROJ').toUpperCase(),
          color: projectColor,
          workspaceId,
          workflow: workflow.map((w) => ({
            label: w.label,
            category: w.category || 'IN_PROGRESS',
            color: w.color,
          })),
          workTypes: workTypes.map((wt) => ({
            label: wt.label,
            icon: wt.iconKey,
            color: wt.color,
          })),
          settings: {
            template_id: selectedTemplate?.id || 'default',
            method_id: selectedMethod?.id || 'kanban',
          },
        }

        console.log('Submitting project creation payload:', payload)

        const newProject = await projectService.createProject(payload)

        // Bắn event để Sidebar và Dashboard tự động làm mới danh sách tức thời
        window.dispatchEvent(new CustomEvent('project-created', { detail: newProject }))

        if (newProject?.id) {
          navigate(`/workspace/board?projectId=${newProject.id}`)
        } else {
          navigate('/workspace/board')
        }
      } catch (err: unknown) {
        console.error('Failed to create project:', err)
        let errorMsg = 'Không thể khởi tạo dự án. Vui lòng thử lại.'
        if (typeof err === 'object' && err !== null) {
          const responseData = (err as { response?: { data?: { message?: string | string[] } } }).response?.data
          if (responseData?.message) {
            errorMsg = Array.isArray(responseData.message)
              ? responseData.message.join(', ')
              : responseData.message
          } else if ('message' in err && typeof (err as { message?: string }).message === 'string') {
            errorMsg = (err as { message: string }).message
          }
        }
        setError(errorMsg)
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      projectName,
      projectKey,
      projectColor,
      workspaceId,
      navigate,
      workflow,
      workTypes,
      selectedTemplate,
      selectedMethod,
    ],
  )

  // Xử lý nộp yêu cầu khởi tạo AI
  const handleAiSubmit = useCallback(() => {
    if (!projectName.trim()) {
      setProjectName('Dự án Phân tích AI')
    }
    setIsAiModalOpen(false)
  }, [projectName])

  return {
    state: {
      step,
      selectedMethod,
      selectedDomain,
      selectedTemplate,
      projectName,
      projectKey,
      projectColor,
      isSubmitting,
      error,
      isAiModalOpen,
      aiUploadedFile,
      aiPrompt,
      workflow,
      workTypes,
      isAdvancedOpen,
    },
    actions: {
      setStep,
      setSelectedMethod,
      selectMethod,
      selectDomain,
      selectTemplate,
      proceedToFinalStep,
      backToStepOne,
      backToStepTwo,
      handleNameChange,
      setProjectKey,
      setProjectColor,
      handleClose,
      handleCreateSubmit,
      updateWorkflowLabel,
      updateWorkflowCategory,
      addWorkflowStage,
      removeWorkflowStage,
      updateWorkTypeLabel,
      updateWorkTypeIcon,
      addWorkType,
      removeWorkType,
      resetConfiguration,
      toggleAdvanced,
      setIsAiModalOpen,
      setAiPrompt,
      setAiUploadedFile,
      handleAiSubmit,
    },
  }
}
