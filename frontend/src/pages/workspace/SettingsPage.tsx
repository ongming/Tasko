import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  User as UserIcon,
  ShieldCheck,
  Camera,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building2,
  KeyRound,
  Mail,
  Sparkles,
  Info,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { userService } from '@/services/userService'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { ApiError } from '@/types/api'

function getInitials(name?: string | null): string {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function SettingsPage() {
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)

  // Tab State
  const [activeTab, setActiveTab] = useState<'profile' | 'workspace'>('profile')

  // Profile Form State
  const [fullName, setFullName] = useState(user?.full_name || user?.fullName || '')
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Avatar Upload State
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }>({})

  // Đồng bộ full_name khi user trong store thay đổi
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || user.fullName || '')
    }
  }, [user])

  // Dọn dẹp avatarPreview object URL khi unmount
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  // ==========================================
  // 1. XỬ LÝ UPLOAD AVATAR
  // ==========================================
  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      setAvatarError(null)
      setAvatarSuccess(null)

      // Kiểm tra loại tệp
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setAvatarError('Định dạng ảnh không hợp lệ. Chỉ chấp nhận JPG, PNG hoặc WEBP.')
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      // Kiểm tra dung lượng (tối đa 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setAvatarError('Kích thước ảnh vượt quá giới hạn 5MB.')
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      // Tạo preview tức thì cho trải nghiệm mượt mà
      const previewUrl = URL.createObjectURL(file)
      setAvatarPreview(previewUrl)
      setIsUploadingAvatar(true)

      try {
        const updatedUser = await userService.uploadAvatar(file)
        updateUser(updatedUser)
        setAvatarSuccess('Cập nhật ảnh đại diện thành công!')
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          setAvatarError(err.message)
        } else {
          setAvatarError('Không thể tải ảnh đại diện lên Cloudinary. Vui lòng thử lại.')
        }
        setAvatarPreview(null)
      } finally {
        setIsUploadingAvatar(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    },
    [updateUser],
  )

  // ==========================================
  // 2. XỬ LÝ CẬP NHẬT HỒ SƠ (QLTK_BM4)
  // ==========================================
  const handleUpdateProfile = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setProfileError(null)
      setProfileSuccess(null)

      const trimmedName = fullName.trim()
      if (!trimmedName) {
        setProfileError('Họ và tên không được để trống.')
        return
      }

      if (trimmedName.length > 100) {
        setProfileError('Họ và tên không được vượt quá 100 ký tự.')
        return
      }

      setIsUpdatingProfile(true)

      try {
        const updatedUser = await userService.updateProfile({ fullName: trimmedName })
        updateUser(updatedUser)
        setProfileSuccess('Cập nhật thông tin hồ sơ thành công!')
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          setProfileError(err.message)
        } else {
          setProfileError('Không thể cập nhật hồ sơ. Vui lòng thử lại sau.')
        }
      } finally {
        setIsUpdatingProfile(false)
      }
    },
    [fullName, updateUser],
  )

  // ==========================================
  // 3. XỬ LÝ ĐỔI MẬT KHẨU (QLTK_BM5)
  // ==========================================
  const handleChangePassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setPasswordError(null)
      setPasswordSuccess(null)
      setFieldErrors({})

      const errors: {
        currentPassword?: string
        newPassword?: string
        confirmPassword?: string
      } = {}

      if (!currentPassword) {
        errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.'
      }

      if (!newPassword) {
        errors.newPassword = 'Vui lòng nhập mật khẩu mới.'
      } else if (newPassword.length < 8) {
        errors.newPassword = 'Mật khẩu mới phải có ít nhất 8 ký tự.'
      } else if (newPassword === currentPassword) {
        errors.newPassword = 'Mật khẩu mới không được trùng với mật khẩu hiện tại.'
      }

      if (!confirmPassword) {
        errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới.'
      } else if (newPassword !== confirmPassword) {
        errors.confirmPassword = 'Mật khẩu xác nhận không khớp.'
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
        return
      }

      setIsChangingPassword(true)

      try {
        const res = await userService.changePassword({
          currentPassword,
          newPassword,
        })
        setPasswordSuccess(res.message || 'Đổi mật khẩu thành công!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          setPasswordError(err.message)
        } else {
          setPasswordError('Đổi mật khẩu thất bại. Vui lòng thử lại.')
        }
      } finally {
        setIsChangingPassword(false)
      }
    },
    [currentPassword, newPassword, confirmPassword],
  )

  // Kiểm tra tài khoản Google chưa có mật khẩu
  const isGoogleAccountWithoutPassword = user?.hasPassword === false
  const isEmailVerified = Boolean(user?.emailVerified ?? user?.is_active ?? user?.isVerified)
  const currentAvatarSrc = avatarPreview || user?.avatar_url || user?.avatarUrl

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Cài đặt tài khoản & Hệ thống
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý thông tin hồ sơ cá nhân, tùy chọn bảo mật và cấu hình không gian làm việc.
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-1 border-b border-slate-200/80">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Hồ sơ & Bảo mật</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('workspace')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'workspace'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Không gian làm việc</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: HỒ SƠ & BẢO MẬT (QLTK_BM4 & QLTK_BM5) */}
      {/* ========================================================= */}
      {activeTab === 'profile' && (
        <div className="flex flex-col gap-6">
          {/* KHỐI 1: THÔNG TIN HỒ SƠ CÁ NHÂN (QLTK_BM4) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-indigo-600" />
                  <span>Thông tin Hồ sơ Cá nhân</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cập nhật ảnh đại diện và họ tên hiển thị trên toàn hệ thống Tasko.
                </p>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-6">
              {/* Alert thông báo cho Hồ sơ */}
              {profileSuccess && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium animate-in fade-in duration-150">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}
              {profileError && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}
              {avatarSuccess && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium animate-in fade-in duration-150">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{avatarSuccess}</span>
                </div>
              )}
              {avatarError && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{avatarError}</span>
                </div>
              )}

              {/* Phần Avatar & Upload */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-xl bg-slate-50/80 border border-slate-200/60">
                <div className="relative group shrink-0">
                  {currentAvatarSrc ? (
                    <img
                      src={currentAvatarSrc}
                      alt={user?.full_name || 'Avatar'}
                      className="w-20 h-20 rounded-2xl object-cover ring-2 ring-white shadow-xs"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-xl flex items-center justify-center ring-2 ring-white shadow-xs">
                      {getInitials(user?.full_name || user?.fullName)}
                    </div>
                  )}

                  {/* Overlay loading khi đang upload */}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 rounded-2xl bg-slate-900/60 flex flex-col items-center justify-center text-white gap-1 backdrop-blur-2xs">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-[10px] font-semibold">Đang tải...</span>
                    </div>
                  )}

                  {/* Nút camera nhỏ trên góc avatar */}
                  {!isUploadingAvatar && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-transform hover:scale-105 cursor-pointer"
                      title="Chọn ảnh đại diện mới"
                      aria-label="Thay đổi ảnh đại diện"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-800">Ảnh đại diện</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Hỗ trợ định dạng JPG, PNG hoặc WEBP dung lượng tối đa 5MB. Ảnh sẽ được tự động căn chỉnh và tối ưu hóa qua Cloudinary.
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={isUploadingAvatar}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
                    >
                      <Camera className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isUploadingAvatar ? 'Đang tải lên...' : 'Tải ảnh mới'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Form cập nhật Họ tên & Email */}
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Ô Email (Disabled) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700">
                        Địa chỉ Email
                      </label>
                      {isEmailVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Đã xác thực</span>
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        readOnly
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed select-none"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Email được dùng để đăng nhập và bảo mật tài khoản. Không thể thay đổi trực tiếp.
                    </p>
                  </div>

                  {/* Ô Họ và tên */}
                  <div className="space-y-1.5">
                    <label htmlFor="user-fullname" className="block text-xs font-semibold text-slate-700">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        id="user-fullname"
                        type="text"
                        required
                        maxLength={100}
                        placeholder="Nhập họ và tên của bạn"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={isUpdatingProfile}
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 rounded-xl text-slate-900 placeholder:text-slate-400 font-medium transition-all outline-none disabled:opacity-60"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Tên này sẽ hiển thị trên các thẻ nhiệm vụ, bình luận và không gian làm việc.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile || fullName.trim() === (user?.full_name || user?.fullName || '')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingProfile ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <span>Lưu thay đổi</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* KHỐI 2: ĐỔI MẬT KHẨU (QLTK_BM5) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Bảo mật & Đổi Mật khẩu</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Đảm bảo tài khoản của bạn được bảo vệ bằng mật khẩu mạnh có ít nhất 8 ký tự.
                </p>
              </div>
            </div>

            <div className="p-6">
              {/* Nếu tài khoản Google OAuth chưa có mật khẩu */}
              {isGoogleAccountWithoutPassword ? (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900">
                  <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-semibold text-amber-950">
                      Tài khoản đăng nhập qua Google OAuth
                    </p>
                    <p className="text-amber-800 mt-0.5">
                      Bạn đang đăng nhập bằng tài khoản Google nên chưa thiết lập mật khẩu riêng cho Tasko. Bạn có thể sử dụng chức năng <span className="font-semibold underline">Quên mật khẩu</span> tại màn hình đăng nhập nếu muốn tạo mật khẩu thủ công.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                  {passwordSuccess && (
                    <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium animate-in fade-in duration-150">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}
                  {passwordError && (
                    <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in duration-150">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  {/* Mật khẩu hiện tại */}
                  <PasswordInput
                    id="current-password"
                    label="Mật khẩu hiện tại"
                    required
                    autoComplete="current-password"
                    placeholder="Nhập mật khẩu hiện tại"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    error={fieldErrors.currentPassword}
                    disabled={isChangingPassword}
                  />

                  {/* Mật khẩu mới */}
                  <PasswordInput
                    id="new-password"
                    label="Mật khẩu mới"
                    required
                    autoComplete="new-password"
                    placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    error={fieldErrors.newPassword}
                    disabled={isChangingPassword}
                  />

                  {/* Xác nhận mật khẩu mới */}
                  <PasswordInput
                    id="confirm-password"
                    label="Xác nhận mật khẩu mới"
                    required
                    autoComplete="new-password"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={fieldErrors.confirmPassword}
                    disabled={isChangingPassword}
                  />

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang cập nhật...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Cập nhật mật khẩu</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: KHÔNG GIAN LÀM VIỆC (WORKSPACE CONFIG) */}
      {/* ========================================================= */}
      {activeTab === 'workspace' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
          <div className="p-6 flex flex-col gap-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Thông tin chung Workspace</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Tên Workspace
                </label>
                <input
                  type="text"
                  defaultValue="Marketing Team"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Mã định danh URL
                </label>
                <input
                  type="text"
                  defaultValue="marketing-team"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Tích hợp Tasko Gemini AI</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tự động gợi ý phân rã User Story và dự báo rủi ro Sprint theo tiến độ thực tế.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Đang kích hoạt
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsPage
