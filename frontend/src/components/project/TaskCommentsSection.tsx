import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MessageSquare,
  Send,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react'
import { commentService } from '@/services/commentService'
import { useAuthStore } from '@/stores/authStore'
import type { TaskCommentItem } from '@/types/collaboration'

export interface TaskCommentsSectionProps {
  projectId: string
  taskId: string
  isViewer?: boolean
  canModerateComments?: boolean
}

function formatCommentTime(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return isoDate
  }
}

function getInitials(name?: string | null, email?: string | null): string {
  const source = (name || email || '?').trim()
  return source.slice(0, 1).toUpperCase()
}

export const TaskCommentsSection: React.FC<TaskCommentsSectionProps> = ({
  projectId,
  taskId,
  isViewer = false,
  canModerateComments = false,
}) => {
  const currentUser = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()

  const [newContent, setNewContent] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const queryKey = ['task-comments', projectId, taskId] as const

  const {
    data: comments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => commentService.getComments(projectId, taskId),
    enabled: Boolean(projectId && taskId),
  })

  const createMutation = useMutation({
    mutationFn: (content: string) =>
      commentService.createComment(projectId, taskId, { content }),
    onSuccess: async () => {
      setNewContent('')
      setActionError(null)
      await queryClient.invalidateQueries({ queryKey })
    },
    onError: (err: Error) => {
      setActionError(err.message || 'Không thể gửi bình luận')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      commentService.updateComment(projectId, taskId, commentId, { content }),
    onSuccess: async () => {
      setEditingCommentId(null)
      setEditingContent('')
      setActionError(null)
      await queryClient.invalidateQueries({ queryKey })
    },
    onError: (err: Error) => {
      setActionError(err.message || 'Không thể cập nhật bình luận')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) =>
      commentService.deleteComment(projectId, taskId, commentId),
    onSuccess: async () => {
      setConfirmDeleteId(null)
      setActionError(null)
      await queryClient.invalidateQueries({ queryKey })
    },
    onError: (err: Error) => {
      setActionError(err.message || 'Không thể xóa bình luận')
    },
  })

  const handleSubmitNew = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = newContent.trim()
    if (!trimmed || createMutation.isPending) return
    createMutation.mutate(trimmed)
  }

  const handleStartEdit = (comment: TaskCommentItem) => {
    setConfirmDeleteId(null)
    setActionError(null)
    setEditingCommentId(comment.id)
    setEditingContent(comment.content)
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditingContent('')
  }

  const handleSaveEdit = (commentId: string) => {
    const trimmed = editingContent.trim()
    if (!trimmed || updateMutation.isPending) return
    updateMutation.mutate({ commentId, content: trimmed })
  }

  const handleConfirmDelete = (commentId: string) => {
    if (deleteMutation.isPending) return
    deleteMutation.mutate(commentId)
  }

  return (
    <div className="space-y-3 pt-4 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
          <h3 className="text-xs font-bold text-slate-900">Bình luận</h3>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {comments.length}
          </span>
        </div>
      </div>

      {actionError && (
        <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
            <span className="truncate">{actionError}</span>
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

      {/* Danh sách bình luận */}
      {isLoading ? (
        <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Đang tải bình luận...</span>
        </div>
      ) : isError ? (
        <div className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/60 text-xs text-rose-700 flex items-center justify-between gap-2">
          <span>
            {(error as Error)?.message || 'Không thể tải danh sách bình luận.'}
          </span>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-2.5 py-1 rounded-md bg-white border border-rose-200 text-rose-700 font-semibold hover:bg-rose-50 cursor-pointer shrink-0"
          >
            Thử lại
          </button>
        </div>
      ) : comments.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center text-xs text-slate-400 italic">
          Chưa có bình luận nào. Hãy bắt đầu thảo luận cho công việc này.
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => {
            const isAuthor = Boolean(currentUser?.id && comment.userId === currentUser.id)
            const canEdit = !isViewer && isAuthor
            const canDelete = !isViewer && Boolean(currentUser?.id) && (isAuthor || canModerateComments)
            const isEditing = editingCommentId === comment.id
            const isConfirmingDelete = confirmDeleteId === comment.id
            const authorName =
              comment.author?.fullName || comment.author?.email || 'Người dùng đã xóa'

            return (
              <div
                key={comment.id}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {comment.author?.avatarUrl ? (
                      <img
                        src={comment.author.avatarUrl}
                        alt={authorName}
                        className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {getInitials(comment.author?.fullName, comment.author?.email)}
                      </div>
                    )}
                    <div className="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {authorName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatCommentTime(comment.createdAt)}
                      </span>
                      {comment.isEdited && (
                        <span className="text-[10px] italic text-slate-400">
                          Đã chỉnh sửa
                        </span>
                      )}
                    </div>
                  </div>

                  {(canEdit || canDelete) && !isEditing && (
                    <div className="flex items-center gap-1 shrink-0">
                      {isConfirmingDelete ? (
                        <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg px-2 py-0.5">
                          <span className="text-[11px] text-rose-700 font-medium">Xóa?</span>
                          <button
                            type="button"
                            onClick={() => handleConfirmDelete(comment.id)}
                            disabled={deleteMutation.isPending}
                            className="p-0.5 text-rose-600 hover:text-rose-800 cursor-pointer"
                            aria-label="Xác nhận xóa bình luận"
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
                            aria-label="Hủy xóa bình luận"
                            title="Hủy"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleStartEdit(comment)}
                              className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                              aria-label="Sửa bình luận"
                              title="Chỉnh sửa"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(comment.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              aria-label="Xóa bình luận"
                              title="Xóa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      rows={3}
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                          e.preventDefault()
                          handleSaveEdit(comment.id)
                        } else if (e.key === 'Escape') {
                          e.preventDefault()
                          handleCancelEdit()
                        }
                      }}
                      className="w-full text-xs p-2.5 border border-indigo-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 text-slate-800 bg-white resize-y"
                      aria-label="Chỉnh sửa nội dung bình luận"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(comment.id)}
                        disabled={!editingContent.trim() || updateMutation.isPending}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                      >
                        {updateMutation.isPending && (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        )}
                        <span>Lưu</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap break-words pl-8">
                    {comment.content}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Khung nhập bình luận mới (ẩn với VIEWER) */}
      {!isViewer && (
        <form onSubmit={handleSubmitNew} className="space-y-2 pt-1">
          <textarea
            rows={3}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault()
                handleSubmitNew()
              }
            }}
            placeholder="Viết bình luận... (Nhấn Ctrl+Enter để gửi nhanh)"
            className="w-full text-xs p-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-800 resize-y transition-colors"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-400">
              Ctrl + Enter để gửi nhanh
            </span>
            <button
              type="submit"
              disabled={!newContent.trim() || createMutation.isPending}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Gửi</span>
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default TaskCommentsSection
