import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2, Plus, Tag, Trash2, X } from 'lucide-react'
import { projectService } from '@/services/projectService'
import { Select } from '@/components/ui/Select'
import type { CustomField, CustomFieldType } from '@/types/projectConfig'

export interface CustomFieldsSettingsTabProps {
  projectId: string
  customFields: CustomField[]
  onFeedback: (fb: { type: 'success' | 'error'; message: string }) => void
}

export const CustomFieldsSettingsTab: React.FC<CustomFieldsSettingsTabProps> = ({
  projectId,
  customFields,
  onFeedback,
}) => {
  const queryClient = useQueryClient()

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
        return projectService.updateCustomField(projectId, editingCustomField.id, payload)
      }
      return projectService.createCustomField(projectId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-custom-fields'] })
      setIsCustomFieldModalOpen(false)
      onFeedback({ type: 'success', message: 'Lưu trường tùy chỉnh thành công!' })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể lưu trường tùy chỉnh'
      onFeedback({ type: 'error', message: msg })
    },
  })

  const deleteCustomFieldMutation = useMutation({
    mutationFn: (fieldId: string) => projectService.deleteCustomField(projectId, fieldId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-custom-fields'] })
      onFeedback({ type: 'success', message: 'Đã xóa trường tùy chỉnh!' })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể xóa trường tùy chỉnh'
      onFeedback({ type: 'error', message: msg })
    },
  })

  return (
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

      {/* Modal Thêm / Sửa Custom Field */}
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
                <Select
                  value={cfFormFieldType}
                  onChange={(val) => setCfFormFieldType(val as any)}
                  options={[
                    { value: 'TEXT', label: 'Văn bản (TEXT)' },
                    { value: 'NUMBER', label: 'Số nguyên / Thập phân (NUMBER)' },
                    { value: 'DATE', label: 'Ngày tháng (DATE)' },
                    { value: 'SELECT', label: 'Danh sách chọn (SELECT)' },
                  ]}
                />
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

export default CustomFieldsSettingsTab
