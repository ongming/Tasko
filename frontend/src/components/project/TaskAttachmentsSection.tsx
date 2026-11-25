import React, { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Paperclip,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  FileArchive,
  FileSpreadsheet,
  ExternalLink,
  Trash2,
  Loader2,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react'
import {
  attachmentService,
  validateAttachmentFile,
} from '@/services/attachmentService'
import { useAuthStore } from '@/stores/authStore'
import type { TaskAttachmentItem } from '@/types/collaboration'

export interface TaskAttachmentsSectionProps {
  projectId: string
  taskId: string
  isViewer?: boolean
  canModerateAttachments?: boolean
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function isImageAttachment(item: TaskAttachmentItem): boolean {
  return item.resourceType === 'image' || item.mimeType?.startsWith('image/')
}

function renderFileIcon(item: TaskAttachmentItem) {
  const lowerName = item.fileName.toLowerCase()
  if (isImageAttachment(item)) {
    return <ImageIcon className="w-4 h-4 text-indigo-600" />
  }
  if (lowerName.endsWith('.zip')) {
    return <FileArchive className="w-4 h-4 text-amber-600" />
  }
  if (
    lowerName.endsWith('.xls') ||
    lowerName.endsWith('.xlsx') ||
    lowerName.endsWith('.csv')
  ) {
    return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
  }
  return <FileText className="w-4 h-4 text-slate-500" />
}

export const TaskAttachmentsSection: React.FC<TaskAttachmentsSectionProps> = ({
  projectId,
  taskId,
  isViewer = false,
  canModerateAttachments = false,
}) => {
  const currentUser = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const queryKey = ['task-attachments', projectId, taskId] as const

  const {
    data: attachments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => attachmentService.getAttachments(projectId, taskId),
    enabled: Boolean(projectId && taskId),
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      attachmentService.uploadAttachment(projectId, taskId, file),
    onSuccess: async () => {
      setActionError(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      await queryClient.invalidateQueries({ queryKey })
    },
    onError: (err: Error) => {
      setActionError(err.message || 'Không thể tải tệp đính kèm lên')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: string) =>
      attachmentService.deleteAttachment(projectId, taskId, attachmentId),
    onSuccess: async () => {
      setConfirmDeleteId(null)
      setActionError(null)
      await queryClient.invalidateQueries({ queryKey })
    },
    onError: (err: Error) => {
      setActionError(err.message || 'Không thể xóa tệp đính kèm')
    },
  })

  const handleSelectedFile = (file: File | undefined) => {
    if (!file || uploadMutation.isPending) return
    const validationErr = validateAttachmentFile(file)
    if (validationErr) {
      setActionError(validationErr)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }
    setActionError(null)
    uploadMutation.mutate(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSelectedFile(e.target.files?.[0])
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (isViewer) return
    handleSelectedFile(e.dataTransfer.files?.[0])
  }

  return (
    <div className="space-y-3 pt-4 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="w-3.5 h-3.5 text-slate-500" />
          <h3 className="text-xs font-bold text-slate-900">Tệp đính kèm</h3>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {attachments.length}
          </span>
        </div>
      </div>

      {actionError && (
        <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-rose-500 hover:text-rose-800 cursor-pointer shrink-0"
            aria-label="Đóng thông báo lỗi"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Khu vực kéo-thả / chọn tệp (ẩn với VIEWER) */}
      {!isViewer && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploadMutation.isPending && fileInputRef.current?.click()}
          className={`p-3.5 rounded-xl border border-dashed transition-colors cursor-pointer flex items-center justify-center gap-2.5 text-xs ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/70 text-indigo-700'
              : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-indigo-300 text-slate-600'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            className="hidden"
            aria-label="Chọn tệp đính kèm"
          />
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
              <span className="font-medium text-indigo-700">Đang tải tệp lên...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                Kéo thả tệp vào đây hoặc{' '}
                <strong className="text-indigo-600 font-semibold">chọn tệp</strong>{' '}
                <span className="text-slate-400">(tối đa 10 MB)</span>
              </span>
            </>
          )}
        </div>
      )}

      {/* Danh sách tệp đính kèm */}
      {isLoading ? (
        <div className="py-4 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Đang tải tệp đính kèm...</span>
        </div>
      ) : isError ? (
        <div className="p-3 rounded-xl border border-rose-100 bg-rose-50/60 text-xs text-rose-700 flex items-center justify-between gap-2">
          <span>
            {(error as Error)?.message || 'Không thể tải danh sách tệp đính kèm.'}
          </span>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-2.5 py-1 rounded-md bg-white border border-rose-200 text-rose-700 font-semibold hover:bg-rose-50 cursor-pointer shrink-0"
          >
            Thử lại
          </button>
        </div>
      ) : attachments.length === 0 ? (
        <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/40 text-center text-xs text-slate-400 italic">
          Chưa có tệp đính kèm nào.
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((item) => {
            const isUploader = Boolean(currentUser?.id && item.userId === currentUser.id)
            const canDelete =
              !isViewer &&
              Boolean(currentUser?.id) &&
              (isUploader || canModerateAttachments)
            const isConfirming = confirmDeleteId === item.id

            return (
              <div
                key={item.id}
                className="p-2.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {isImageAttachment(item) ? (
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0 block"
                    >
                      <img
                        src={item.fileUrl}
                        alt={item.fileName}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ) : (
                    <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                      {renderFileIcon(item)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-slate-800 hover:text-indigo-600 truncate block"
                      title={item.fileName}
                    >
                      {item.fileName}
                    </a>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                      <span>{formatFileSize(item.fileSize)}</span>
                      {item.uploader?.fullName && (
                        <>
                          <span>•</span>
                          <span className="truncate">{item.uploader.fullName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    aria-label={`Mở tệp ${item.fileName}`}
                    title="Mở / Tải xuống"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {canDelete &&
                    (isConfirming ? (
                      <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg px-2 py-0.5">
                        <span className="text-[11px] text-rose-700 font-medium">Xóa?</span>
                        <button
                          type="button"
                          onClick={() => deleteMutation.mutate(item.id)}
                          disabled={deleteMutation.isPending}
                          className="p-0.5 text-rose-600 hover:text-rose-800 cursor-pointer"
                          aria-label="Xác nhận xóa tệp đính kèm"
                          title="Xác nhận xóa"
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="p-0.5 text-slate-500 hover:text-slate-700 cursor-pointer"
                          aria-label="Hủy xóa tệp đính kèm"
                          title="Hủy"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        aria-label={`Xóa tệp ${item.fileName}`}
                        title="Xóa tệp đính kèm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TaskAttachmentsSection
