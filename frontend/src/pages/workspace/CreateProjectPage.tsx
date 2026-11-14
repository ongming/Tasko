import React from 'react'
import { X, Sparkles, ChevronRight } from 'lucide-react'
import { useCreateProject } from '@/hooks/useCreateProject'
import {
  AGILE_METHODS,
  BUSINESS_DOMAINS,
  PROJECT_TEMPLATES,
  METHOD_DETAILS,
  MethodCard,
  MethodDetailsSidebar,
  DomainSelectorGrid,
  ProjectFinalSetupStep,
  AiCreateModal,
} from '@/components/create-project'

/**
 * Pure Presentational View: Trang Tạo Dự Án (CreateProjectPage)
 * Single-Page Multi-Step Wizard chuẩn mực Jira Cloud & Linear:
 * - 1 Page duy nhất quản lý toàn bộ luồng tạo dự án thông qua state trong useCreateProject.
 * - Điều hướng linh hoạt 100% bằng Breadcrumb tương tác trên Top Bar.
 * - Bước 1: Chọn mẫu phương pháp quản lý (Kanban, Scrum, Scrumban)
 * - Bước 2: Xem chi tiết mẫu & chọn mô hình ngành nghề
 * - Bước 3: Thiết lập chuyên sâu Tên dự án, Key, Màu sắc & Bấm Tạo dự án
 */
export const CreateProjectPage: React.FC = () => {
  const { state, actions } = useCreateProject()
  const {
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
  } = state

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-y-auto select-none animate-in fade-in duration-150">
      
      {/* 1. TOP BAR CỐ ĐỊNH: Nút X góc trái + Breadcrumb tương tác nhảy bước + Nút Tạo bằng AI */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 sm:px-10 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
        
        {/* Góc trên bên trái: Nút X để đóng & Breadcrumb tương tác cho phép click nhảy trực tiếp về bước mong muốn */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={actions.handleClose}
            className="p-1.5 -ml-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="Đóng trang (Esc)"
            aria-label="Đóng trang tạo dự án"
          >
            <X className="w-5 h-5" />
          </button>

          <nav aria-label="Breadcrumb điều hướng bước" className="flex items-center gap-1.5 text-xs">
            {/* Chặng 1: Mẫu dự án */}
            <button
              type="button"
              onClick={actions.backToStepOne}
              className={`transition-colors cursor-pointer focus:outline-none ${
                step > 1
                  ? 'text-slate-500 hover:text-indigo-600 hover:underline font-medium'
                  : 'font-semibold text-slate-900'
              }`}
            >
              Mẫu dự án (Project templates)
            </button>

            {/* Chặng 2: Phương pháp & Lĩnh vực */}
            {selectedMethod && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <button
                  type="button"
                  onClick={actions.backToStepTwo}
                  className={`transition-colors cursor-pointer focus:outline-none ${
                    step === 3
                      ? 'text-slate-500 hover:text-indigo-600 hover:underline font-medium'
                      : 'font-semibold text-slate-900'
                  }`}
                  title="Quay lại tùy chỉnh phương pháp này"
                >
                  {selectedMethod.title}
                </button>

                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <button
                  type="button"
                  onClick={step === 3 ? actions.backToStepTwo : undefined}
                  className={`transition-colors focus:outline-none ${
                    step === 3
                      ? 'text-slate-500 hover:text-indigo-600 hover:underline cursor-pointer font-medium'
                      : 'text-slate-700 font-medium cursor-default'
                  }`}
                  title={step === 3 ? "Quay lại chọn mô hình" : undefined}
                >
                  {selectedDomain.name}
                </button>

                {/* Chặng 3: Thiết lập dự án */}
                {step === 3 && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    <span className="font-semibold text-slate-900">
                      Thiết lập dự án
                    </span>
                  </>
                )}
              </>
            )}
          </nav>
        </div>

        {/* Góc trên bên phải: Nút Tạo bằng AI sắc nét, tinh tế chuẩn Impeccable */}
        <div>
          <button
            type="button"
            onClick={() => actions.setIsAiModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs hover:shadow transition-all cursor-pointer active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="Khởi tạo dự án thông minh bằng AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Tạo bằng AI</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN CONTAINER: Căn giữa thanh lịch, không bị lệch sidebar */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 sm:px-10 py-6 sm:py-10 flex flex-col justify-start">
        
        {/* ========================================================
            BƯỚC 1: CHỌN MẪU PHƯƠNG PHÁP QUẢN LÝ (Kanban, Scrum, Scrumban)
            ======================================================== */}
        {step === 1 && (
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
                  onSelect={() => actions.selectMethod(method)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            BƯỚC 2: XEM TRƯỚC MẪU (SIDEBAR TRÁI CÓ NÚT) & CHỌN MÔ HÌNH
            ======================================================== */}
        {step === 2 && selectedMethod && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-2 duration-200">
            {/* Chỉ báo bước tinh gọn (Điều hướng đã được tích hợp 100% trên Breadcrumb) */}
            <div className="flex items-center justify-end pb-2 border-b border-slate-100/80">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <span>Bước 2 / 3</span>
                <span className="text-slate-300">•</span>
                <span>Chọn mô hình phù hợp</span>
              </div>
            </div>

            {/* 2 BỐ CỤC: TRÁI 1/4 (CÓ NÚT Ở DƯỚI) & PHẢI 3/4 (CHỈ CÓ LƯỚI MÔ HÌNH) */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              
              {/* BÊN TRÁI (1/4): Các nhãn mẫu, mô tả tính năng, workflow & NÚT SỬ DỤNG MẪU NÀY */}
              <MethodDetailsSidebar
                method={selectedMethod}
                details={METHOD_DETAILS[selectedMethod.id]}
                selectedTemplate={selectedTemplate}
                onUseTemplate={actions.proceedToFinalStep}
              />

              {/* BÊN PHẢI (3/4): Chỉ chứa lưới 4 mô hình doanh nghiệp thoáng đãng */}
              <div className="flex-1 w-full flex flex-col gap-6 text-left">
                <DomainSelectorGrid
                  templates={PROJECT_TEMPLATES}
                  selectedTemplate={selectedTemplate}
                  onSelectTemplate={actions.selectTemplate}
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            BƯỚC 3: THIẾT LẬP DỰ ÁN CUỐI CÙNG (TÊN, KEY, MÀU SẮC) & TẠO
            ======================================================== */}
        {step === 3 && selectedMethod && (
          <ProjectFinalSetupStep
            method={selectedMethod}
            domain={selectedDomain}
            projectName={projectName}
            projectKey={projectKey}
            projectColor={projectColor}
            error={error}
            isSubmitting={isSubmitting}
            workflow={workflow}
            workTypes={workTypes}
            onProjectNameChange={actions.handleNameChange}
            onProjectKeyChange={actions.setProjectKey}
            onProjectColorChange={actions.setProjectColor}
            onUpdateWorkflowLabel={actions.updateWorkflowLabel}
            onUpdateWorkflowCategory={actions.updateWorkflowCategory}
            onAddWorkflowStage={actions.addWorkflowStage}
            onRemoveWorkflowStage={actions.removeWorkflowStage}
            onUpdateWorkTypeLabel={actions.updateWorkTypeLabel}
            onUpdateWorkTypeIcon={actions.updateWorkTypeIcon}
            onAddWorkType={actions.addWorkType}
            onRemoveWorkType={actions.removeWorkType}
            onResetConfiguration={actions.resetConfiguration}
            onOpenAiModal={() => actions.setIsAiModalOpen(true)}
            onBack={actions.backToStepTwo}
            onSubmit={actions.handleCreateSubmit}
          />
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
        onClose={() => actions.setIsAiModalOpen(false)}
        onProjectNameChange={actions.handleNameChange}
        onAiPromptChange={actions.setAiPrompt}
        onFileUpload={actions.setAiUploadedFile}
        onSubmit={actions.handleAiSubmit}
      />
    </div>
  )
}

export default CreateProjectPage
