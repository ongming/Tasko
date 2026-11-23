import React from 'react'
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Sparkles,
  User as UserIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { AiAnalysisStatus, AiAnalysisSummary } from '@/types/aiDocument'

export interface AiHistoryTabProps {
  items: AiAnalysisSummary[]
  isLoading: boolean
  isViewer?: boolean
  onSelectAnalysis: (analysisId: string) => void
}

const STATUS_BADGE_MAP: Record<AiAnalysisStatus, { label: string; className: string }> = {
  UPLOADED: {
    label: 'Đã tải lên',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  ANALYZING: {
    label: 'Đang phân tích',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  COMPLETED: {
    label: 'Chờ duyệt',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  APPLIED: {
    label: 'Đã áp dụng',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  FAILED: {
    label: 'Thất bại',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
}

function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export const AiHistoryTab: React.FC<AiHistoryTabProps> = ({
  items,
  isLoading,
  isViewer = false,
  onSelectAnalysis,
}) => {
  if (isLoading) {
    return (
      <div className="py-14 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
        <span>Đang tải lịch sử phân tích tài liệu...</span>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="py-14 flex flex-col items-center justify-center text-center gap-2.5 text-slate-500">
        <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700">Chưa có lịch sử phân tích nào</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Tải lên tài liệu đặc tả (.pdf, .docx, .md, .txt) để AI tự động trích xuất công việc.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const badge = STATUS_BADGE_MAP[item.status]
        return (
          <div
            key={item.id}
            className="rounded-xl border border-slate-200 bg-white hover:border-indigo-200/80 transition-all p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {item.fileName}
                  </h4>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    .{item.fileType}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1.5 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <UserIcon className="w-3 h-3 text-slate-400" />
                    {item.createdBy?.fullName || 'Thành viên dự án'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {formatDateTime(item.createdAt)}
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Đề xuất: {item.suggestedTaskCount} • Đã tạo: {item.appliedTaskCount}
                  </span>
                </div>

                {item.status === 'FAILED' && item.errorMessage && (
                  <p className="mt-1.5 text-[11px] text-rose-600 inline-flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.errorMessage}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <Button
                variant="secondary"
                size="xs"
                leftIcon={<Eye className="w-3.5 h-3.5" />}
                disabled={item.status === 'FAILED' || item.status === 'ANALYZING'}
                onClick={() => onSelectAnalysis(item.id)}
              >
                {isViewer || item.status === 'APPLIED' ? 'Xem chi tiết' : 'Xem / Duyệt lại'}
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AiHistoryTab
