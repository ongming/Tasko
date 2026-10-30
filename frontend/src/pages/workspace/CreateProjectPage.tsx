import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Sparkles, ArrowLeft, ChevronRight } from 'lucide-react'
import { projectService } from '@/services/projectService'
import {
  AGILE_METHODS,
  BUSINESS_DOMAINS,
  METHOD_DETAILS,
  generateProjectKey,
  MethodCard,
  MethodDetailsSidebar,
  DomainSelectorGrid,
  ProjectConfigForm,
  AiCreateModal,
  type AgileCardConfig,
  type BusinessDomain,
} from '@/components/create-project'

export const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate()

  // Bước 1 & Bước 2: Phương pháp quản lý dự án được chọn
  const [selectedMethod, setSelectedMethod] = useState<AgileCardConfig | null>(null)

  // Mô hình hoạt động / ngành nghề được chọn trong Bước 2
  const [selectedDomain, setSelectedDomain] = useState<BusinessDomain>(BUSINESS_DOMAINS[0]!)

  // Modal tạo bằng AI (khi bấm nút nhỏ góc trên bên phải)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)

  // Form state
  const [projectName, setProjectName] = useState('')
  const [projectKey, setProjectKey] = useState('')
  const [projectColor, setProjectColor] = useState('bg-indigo-600')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // AI Modal state
  const [aiUploadedFile, setAiUploadedFile] = useState<File | null>(null)
  const [aiPrompt, setAiPrompt] = useState('')

  // Phím Escape để quay lại hoặc đóng nhanh
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAiModalOpen) {
          setIsAiModalOpen(false)
        } else if (selectedMethod) {
          setSelectedMethod(null)
        } else {
          handleClose()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedMethod, isAiModalOpen])

  const handleClose = () => {
    navigate('/workspace/projects')
  }

  // Tự động sinh key chuẩn quốc tế từ tên dự án
  const handleNameChange = (val: string) => {
    setProjectName(val)
    if (error) setError('')
    const key = generateProjectKey(val)
    setProjectKey(key)
  }

  // Chọn mô hình doanh nghiệp trong Bước 2
  const handleSelectDomain = (domain: BusinessDomain) => {
    setSelectedDomain(domain)
    const newName = `${domain.defaultPrefix} ${selectedMethod?.title || 'Project'}`
    setProjectName(newName)
    handleNameChange(newName)
  }

  // Chọn phương pháp ở Bước 1 và chuyển tiếp sang Bước 2
  const handleSelectMethod = (method: AgileCardConfig) => {
    setSelectedMethod(method)
    const initialName = `${selectedDomain.defaultPrefix} ${method.title}`
    setProjectName(initialName)
    handleNameChange(initialName)
  }

  // Submit tạo dự án với thông báo lỗi chi tiết nếu thất bại
  const handleCreateSubmit = async (e: React.FormEvent) => {
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
      // Trích xuất thông điệp lỗi rõ ràng từ response API
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
  }

  return (
    // Full screen 100% không có sidebar, phong cách Jira tinh gọn & chuẩn mực Impeccable
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-y-auto select-none animate-in fade-in duration-150">
      
      {/* 1. TOP BAR CỐ ĐỊNH: Nút X góc trái + Breadcrumb ở giữa + Nút Tạo bằng AI nhỏ ở góc phải */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 sm:px-10 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
        
        {/* Góc trên bên trái: Nút X để đóng & Breadcrumb linh hoạt theo Bước */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 -ml-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="Đóng trang (Esc)"
            aria-label="Đóng trang tạo dự án"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setSelectedMethod(null)}
              className={`transition-colors cursor-pointer focus:outline-none ${
                selectedMethod
                  ? 'text-slate-500 hover:text-slate-900 font-medium'
                  : 'text-slate-400 font-normal'
              }`}
            >
              Mẫu dự án (Project templates)
            </button>
            {selectedMethod && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="font-semibold text-slate-900">
                  {selectedMethod.title}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-slate-500">
                  {selectedDomain.name}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Góc trên bên phải: Nút Tạo bằng AI nhỏ gọn theo yêu cầu */}
        <div>
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-50 to-indigo-50 hover:from-amber-100 hover:to-indigo-100 border border-amber-200/90 text-slate-800 text-xs font-semibold shadow-2xs hover:shadow transition-all cursor-pointer active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-400"
            title="Khởi tạo dự án thông minh bằng AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Tạo bằng AI</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN CONTAINER: Căn giữa thanh lịch, không bị lệch sidebar */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 sm:px-10 py-6 sm:py-10 flex flex-col">
        
        {/* ========================================================
            BƯỚC 1: CHỌN MẪU PHƯƠNG PHÁP QUẢN LÝ (Kanban, Scrum, Scrumban)
            ======================================================== */}
        {!selectedMethod ? (
          <div className="flex flex-col animate-in fade-in duration-200">
            {/* Header Title & Subtitle */}
            <div className="mb-8 text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Dành cho bạn (Made for you)
              </h1>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                Các mẫu dự án được thiết kế chuẩn xác dựa trên cách các đội ngũ tương tự vận hành hiệu quả nhất.
              </p>
            </div>

            {/* LƯỚI 3 THẺ PHƯƠNG PHÁP QUẢN LÝ DỰ ÁN CỐT LÕI (Jira Style) */}
            <div
              role="region"
              aria-label="Danh sách phương pháp quản lý dự án Agile"
              className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7"
            >
              {AGILE_METHODS.map((method) => (
                <MethodCard
                  key={method.id}
                  method={method}
                  onSelect={() => handleSelectMethod(method)}
                />
              ))}
            </div>
          </div>
        ) : (
          /* ========================================================
             BƯỚC 2: TRANG 2 BỐ CỤC (CỘT TRÁI 1/4 & CỘT PHẢI 3/4)
             ======================================================== */
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Vị trí khoanh đỏ: Nút mũi tên quay về Bước 1 */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedMethod(null)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/90 text-slate-700 text-xs font-semibold transition-all cursor-pointer group active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                title="Quay lại danh sách mẫu"
                aria-label="Quay lại danh sách mẫu dự án"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600 group-hover:-translate-x-0.5 transition-transform" />
                <span>Quay lại chọn mẫu dự án</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <span>Bước 2 / 2</span>
                <span className="text-slate-300">•</span>
                <span>Cấu hình mô hình & thông tin dự án</span>
              </div>
            </div>

            {/* 2 BỐ CỤC: TRÁI 1/4 (~280px-320px) & PHẢI 3/4 (flex-1) */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              
              {/* BÊN TRÁI (1/4): Các nhãn mẫu, mô tả tính năng, workflow */}
              <MethodDetailsSidebar
                method={selectedMethod}
                details={METHOD_DETAILS[selectedMethod.id]}
              />

              {/* BÊN PHẢI (3/4): Chọn mô hình doanh nghiệp & Form tạo */}
              <div className="flex-1 w-full flex flex-col gap-6 text-left">
                {/* Lưới 6 mô hình doanh nghiệp */}
                <DomainSelectorGrid
                  domains={BUSINESS_DOMAINS}
                  selectedDomain={selectedDomain}
                  onSelectDomain={handleSelectDomain}
                />

                {/* Khối nhập thông tin cấu hình dự án */}
                <ProjectConfigForm
                  methodTitle={selectedMethod.title}
                  projectName={projectName}
                  projectKey={projectKey}
                  projectColor={projectColor}
                  error={error}
                  isSubmitting={isSubmitting}
                  onProjectNameChange={handleNameChange}
                  onProjectKeyChange={(val) => setProjectKey(val)}
                  onProjectColorChange={(val) => setProjectColor(val)}
                  onSubmit={handleCreateSubmit}
                  onCancel={() => setSelectedMethod(null)}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================
          MODAL TẠO DỰ ÁN BẰNG AI (Khi bấm nút nhỏ góc trên bên phải)
          ======================================================== */}
      <AiCreateModal
        isOpen={isAiModalOpen}
        projectName={projectName}
        aiPrompt={aiPrompt}
        aiUploadedFile={aiUploadedFile}
        onClose={() => setIsAiModalOpen(false)}
        onProjectNameChange={handleNameChange}
        onAiPromptChange={setAiPrompt}
        onFileUpload={setAiUploadedFile}
        onSubmit={() => {
          if (!projectName.trim()) {
            setProjectName('Dự án Phân tích AI')
          }
          setIsAiModalOpen(false)
        }}
      />
    </div>
  )
}

export default CreateProjectPage
