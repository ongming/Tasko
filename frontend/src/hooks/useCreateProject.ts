import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { projectService } from '@/services/projectService'
import {
  BUSINESS_DOMAINS,
  generateProjectKey,
} from '@/components/create-project'
import type { AgileCardConfig, BusinessDomain } from '@/types/createProject'

export type CreateProjectStep = 1 | 2 | 3

export interface CreateProjectState {
  step: CreateProjectStep
  selectedMethod: AgileCardConfig | null
  selectedDomain: BusinessDomain
  projectName: string
  projectKey: string
  projectColor: string
  isSubmitting: boolean
  error: string
  isAiModalOpen: boolean
  aiUploadedFile: File | null
  aiPrompt: string
}

export interface CreateProjectActions {
  setStep: (step: CreateProjectStep) => void
  setSelectedMethod: (method: AgileCardConfig | null) => void
  selectMethod: (method: AgileCardConfig) => void
  selectDomain: (domain: BusinessDomain) => void
  proceedToFinalStep: () => void
  backToStepOne: () => void
  backToStepTwo: () => void
  handleNameChange: (name: string) => void
  setProjectKey: (key: string) => void
  setProjectColor: (color: string) => void
  handleClose: () => void
  handleCreateSubmit: (e: React.FormEvent) => Promise<void>
  // AI Modal Actions
  setIsAiModalOpen: (isOpen: boolean) => void
  setAiPrompt: (prompt: string) => void
  setAiUploadedFile: (file: File | null) => void
  handleAiSubmit: () => void
}

/**
 * Custom Hook quản lý toàn bộ nghiệp vụ, trạng thái và tác vụ mạng cho trang Tạo dự án
 * Tách biệt hoàn toàn khỏi giao diện (Separation of Concerns).
 * Hỗ trợ luồng 3 bước chuẩn mực:
 * - Bước 1: Chọn phương pháp quản lý (Kanban, Scrum, Scrumban)
 * - Bước 2: Xem chi tiết mẫu & chọn mô hình ngành nghề (Domain)
 * - Bước 3: Thiết lập thông tin dự án cuối cùng (Tên, Key, Màu sắc) & Tạo
 */
export function useCreateProject(): { state: CreateProjectState; actions: CreateProjectActions } {
  const navigate = useNavigate()

  // 1. Quản lý phân bước (Step Management)
  const [step, setStep] = useState<CreateProjectStep>(1)

  // 2. Trạng thái lựa chọn phương pháp & mô hình
  const [selectedMethod, setSelectedMethod] = useState<AgileCardConfig | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<BusinessDomain>(BUSINESS_DOMAINS[0]!)

  // 3. Trạng thái Form tạo dự án
  const [projectName, setProjectName] = useState('')
  const [projectKey, setProjectKey] = useState('')
  const [projectColor, setProjectColor] = useState('bg-indigo-600')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // 4. Trạng thái AI Assistant Modal
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
      const initialName = `${selectedDomain.defaultPrefix} ${method.title}`
      setProjectName(initialName)
      handleNameChange(initialName)
      setStep(2)
    },
    [selectedDomain, handleNameChange],
  )

  // Tại Bước 2: Chọn mô hình doanh nghiệp
  const selectDomain = useCallback(
    (domain: BusinessDomain) => {
      setSelectedDomain(domain)
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

      try {
        setIsSubmitting(true)
        setError('')

        const newProject = await projectService.createProject({
          name: projectName.trim(),
          key: projectKey.trim() || 'PROJ',
          color: projectColor,
        })

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
    [projectName, projectKey, projectColor, navigate],
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
      projectName,
      projectKey,
      projectColor,
      isSubmitting,
      error,
      isAiModalOpen,
      aiUploadedFile,
      aiPrompt,
    },
    actions: {
      setStep,
      setSelectedMethod,
      selectMethod,
      selectDomain,
      proceedToFinalStep,
      backToStepOne,
      backToStepTwo,
      handleNameChange,
      setProjectKey,
      setProjectColor,
      handleClose,
      handleCreateSubmit,
      setIsAiModalOpen,
      setAiPrompt,
      setAiUploadedFile,
      handleAiSubmit,
    },
  }
}
