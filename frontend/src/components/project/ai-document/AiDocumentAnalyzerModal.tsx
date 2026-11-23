import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { X, Sparkles, History, FileUp, Loader2 } from 'lucide-react'
import { aiDocumentService } from '@/services/aiDocumentService'
import { projectService } from '@/services/projectService'
import { sprintService } from '@/services/sprintService'
import { useAuthStore } from '@/stores/authStore'
import { AiUploadStep, type UploadProgressPhase } from './AiUploadStep'
import { AiSuggestionsReviewTable } from './AiSuggestionsReviewTable'
import { AiHistoryTab } from './AiHistoryTab'
import type { AiAnalysisDetail, AiSuggestedTask } from '@/types/aiDocument'
import type { ProjectMember } from '@/types/member'
import type { ProjectWorkType } from '@/types/projectConfig'
import type { Sprint } from '@/types/sprint'

export interface AiDocumentAnalyzerModalProps {
  isOpen: boolean
  onClose: () => void
  projectIdOrKey: string
  members?: ProjectMember[]
  workTypes?: ProjectWorkType[]
  sprints?: Sprint[]
  isViewer?: boolean
  onTasksCreated?: () => void
}

type ModalTab = 'analyze' | 'history'

export const AiDocumentAnalyzerModal: React.FC<AiDocumentAnalyzerModalProps> = ({
  isOpen,
  onClose,
  projectIdOrKey,
  members: membersProp,
  workTypes: workTypesProp,
  sprints: sprintsProp,
  isViewer: isViewerProp,
  onTasksCreated,
}) => {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((state) => state.user)

  const [activeTab, setActiveTab] = useState<ModalTab>(isViewerProp ? 'history' : 'analyze')
  const [phase, setPhase] = useState<UploadProgressPhase>('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [currentAnalysis, setCurrentAnalysis] = useState<AiAnalysisDetail | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  const lastAttemptRef = useRef<{ file: File; hint: string } | null>(null)

  // Tải tự động metadata nếu view cha chưa truyền xuống
  const { data: fetchedMembers = [] } = useQuery<ProjectMember[]>({
    queryKey: ['project-members', projectIdOrKey],
    queryFn: () =>
      projectService.getProjectMembers
        ? projectService.getProjectMembers(projectIdOrKey).catch(() => [])
        : Promise.resolve([]),
    enabled: isOpen && Boolean(projectIdOrKey) && membersProp === undefined,
  })

  const { data: fetchedWorkTypes = [] } = useQuery<ProjectWorkType[]>({
    queryKey: ['project-work-types', projectIdOrKey],
    queryFn: () =>
      projectService.getProjectWorkTypes
        ? projectService.getProjectWorkTypes(projectIdOrKey).catch(() => [])
        : Promise.resolve([]),
    enabled: isOpen && Boolean(projectIdOrKey) && workTypesProp === undefined,
  })

  const { data: fetchedSprints = [] } = useQuery<Sprint[]>({
    queryKey: ['project-sprints', projectIdOrKey],
    queryFn: () =>
      sprintService.getSprints
        ? sprintService.getSprints(projectIdOrKey).catch(() => [])
        : Promise.resolve([]),
    enabled: isOpen && Boolean(projectIdOrKey) && sprintsProp === undefined,
  })

  const members = membersProp ?? fetchedMembers
  const workTypes = workTypesProp ?? fetchedWorkTypes
  const sprints = sprintsProp ?? fetchedSprints

  const isViewer = useMemo(() => {
    if (typeof isViewerProp === 'boolean') return isViewerProp
    if (!currentUser || members.length === 0) return false
    const matched = members.find(
      (m) => m.userId === currentUser.id || m.user?.id === currentUser.id,
    )
    return matched?.role?.name?.toUpperCase() === 'VIEWER'
  }, [isViewerProp, currentUser, members])

  const {
    data: historyItems = [],
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ['ai-document-history', projectIdOrKey],
    queryFn: () => aiDocumentService.getHistory(projectIdOrKey),
    enabled: isOpen && Boolean(projectIdOrKey),
  })

  useEffect(() => {
    if (isOpen) {
      setActiveTab(isViewer ? 'history' : 'analyze')
      setUploadError(null)
      setPhase('idle')
    } else {
      setCurrentAnalysis(null)
    }
  }, [isOpen, isViewer])

  if (!isOpen) return null

  const handleUploadAndAnalyze = async (file: File, hint: string) => {
    lastAttemptRef.current = { file, hint }
    setUploadError(null)
    setPhase('uploading')

    try {
      const uploaded = await aiDocumentService.uploadDocument(projectIdOrKey, file)
      setPhase('analyzing')
      const analyzed = await aiDocumentService.analyzeDocument(projectIdOrKey, uploaded.id, hint)
      setCurrentAnalysis(analyzed)
      setPhase('idle')
      await queryClient.invalidateQueries({ queryKey: ['ai-document-history', projectIdOrKey] })
    } catch (err) {
      setPhase('error')
      setUploadError(
        err instanceof Error ? err.message : 'Đã xảy ra lỗi trong quá trình phân tích tài liệu.',
      )
    }
  }

  const handleRetry = async () => {
    if (!lastAttemptRef.current) return
    await handleUploadAndAnalyze(lastAttemptRef.current.file, lastAttemptRef.current.hint)
  }

  const handleSelectHistoryItem = async (analysisId: string) => {
    setIsLoadingDetail(true)
    setActiveTab('analyze')
    try {
      const detail = await aiDocumentService.getAnalysisDetail(projectIdOrKey, analysisId)
      setCurrentAnalysis(detail)
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Không thể tải chi tiết phiên phân tích.',
      )
      setCurrentAnalysis(null)
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const handleSaveDraft = async (tasks: AiSuggestedTask[]) => {
    if (!currentAnalysis) return
    setIsSavingDraft(true)
    try {
      const updated = await aiDocumentService.updateSuggestions(
        projectIdOrKey,
        currentAnalysis.id,
        tasks,
      )
      setCurrentAnalysis(updated)
      await queryClient.invalidateQueries({ queryKey: ['ai-document-history', projectIdOrKey] })
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleConfirmTasks = async (tasks: AiSuggestedTask[], defaultSprintId: string | null) => {
    if (!currentAnalysis) return
    setIsConfirming(true)
    try {
      const result = await aiDocumentService.confirmTasks(projectIdOrKey, currentAnalysis.id, {
        defaultSprintId,
        tasks,
      })
      setCurrentAnalysis((prev) =>
        prev
          ? {
              ...prev,
              status: result.status,
              appliedTaskCount: result.createdCount,
              suggestedTasks: tasks,
            }
          : prev,
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['project-tasks', projectIdOrKey] }),
        queryClient.invalidateQueries({ queryKey: ['project-sprints', projectIdOrKey] }),
        queryClient.invalidateQueries({ queryKey: ['tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['ai-document-history', projectIdOrKey] }),
      ])
      onTasksCreated?.()
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-doc-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-gradient-to-r from-indigo-50/70 via-white to-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2
                id="ai-doc-modal-title"
                className="text-sm sm:text-base font-bold text-slate-900 truncate"
              >
                AI Phân tích tài liệu & Tạo công việc tự động
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Tải lên tài liệu nghiệp vụ để AI tách đầu việc, duyệt lại trước khi đưa vào Backlog/Sprint
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại AI phân tích tài liệu"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thanh chuyển 2 tab */}
        <div className="px-5 pt-2.5 border-b border-slate-100 flex items-center gap-1 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('analyze')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'analyze'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Phân tích tài liệu</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('history')
              void refetchHistory()
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Lịch sử phân tích</span>
            {historyItems.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                {historyItems.length}
              </span>
            )}
          </button>
        </div>

        {/* Nội dung chính */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'history' ? (
            <AiHistoryTab
              items={historyItems}
              isLoading={isLoadingHistory}
              isViewer={isViewer}
              onSelectAnalysis={handleSelectHistoryItem}
            />
          ) : isLoadingDetail ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <span>Đang tải chi tiết phiên phân tích...</span>
            </div>
          ) : currentAnalysis ? (
            <AiSuggestionsReviewTable
              key={currentAnalysis.id}
              analysis={currentAnalysis}
              members={members}
              workTypes={workTypes}
              sprints={sprints}
              isViewer={isViewer}
              isSavingDraft={isSavingDraft}
              isConfirming={isConfirming}
              onSaveDraft={handleSaveDraft}
              onConfirm={handleConfirmTasks}
              onBackToUpload={() => {
                setCurrentAnalysis(null)
                setUploadError(null)
                setPhase('idle')
              }}
            />
          ) : (
            <AiUploadStep
              isViewer={isViewer}
              phase={phase}
              errorMessage={uploadError}
              onSubmit={handleUploadAndAnalyze}
              onRetry={handleRetry}
              onClearError={() => setUploadError(null)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default AiDocumentAnalyzerModal
