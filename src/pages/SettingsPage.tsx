import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BellRing,
  Check,
  Cloud,
  CloudCheck,
  Database,
  Download,
  FileDown,
  FileUp,
  Info,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Paintbrush,
  Palette,
  RefreshCw,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trash2,
  Volume2,
} from 'lucide-react'
import AuthModal from '@/components/AuthModal'
import PageHeader from '@/components/PageHeader'
import PinSetupModal from '@/components/PinSetupModal'
import ThemeEditorModal from '@/components/theme-editor/ThemeEditorModal'
import { ROUTES } from '@/constants/app'
import { useAuth } from '@/context/useAuth'
import { useTheme } from '@/context/useTheme'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { usePinLock } from '@/db/usePinLock'
import { useReminder } from '@/db/useReminder'
import { authGetMe, updateCloudReminder } from '@/lib/api'
import { exportBackup, importBackup } from '@/lib/backup'
import {
  getPermission,
  requestPermission,
  showReminderNotification,
  type PermissionState,
} from '@/lib/notify'

const muted = 'text-xs text-[var(--text-muted)]'

export default function SettingsPage() {
  const { loading, settings, save } = useReminder()
  const [permission, setPermission] = useState<PermissionState>(getPermission)
  const [testSent, setTestSent] = useState(false)
  const { canInstall, installed, install, isIos } = useInstallPrompt()

  // Cloud Auth & Sync
  const { user, isSyncing, lastSyncedAt, syncData, logout } = useAuth()
  const { theme, setTheme, setIsEditorOpen, isDark, setIsDark } = useTheme()

  const handleToggleDark = (dark: boolean) => {
    setIsDark(dark)
  }

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null)
  const [emailReminderEnabled, setEmailReminderEnabled] = useState(false)
  const [emailReminderTime, setEmailReminderTime] = useState('21:00')

  // Lấy cài đặt nhắc nhở email từ cloud nếu đã đăng nhập
  useEffect(() => {
    if (user) {
      authGetMe().then((res) => {
        if (res.settings) {
          setEmailReminderEnabled(res.settings.reminderEnabled)
          setEmailReminderTime(res.settings.reminderTime)
        }
      }).catch(() => {})
    }
  }, [user])

  const handleToggleEmailReminder = async () => {
    const nextVal = !emailReminderEnabled
    setEmailReminderEnabled(nextVal)
    try {
      await updateCloudReminder(nextVal, emailReminderTime)
    } catch {
      setEmailReminderEnabled(!nextVal)
      alert('Không thể lưu cài đặt nhắc email lên máy chủ')
    }
  }

  const handleChangeEmailTime = async (time: string) => {
    setEmailReminderTime(time)
    try {
      await updateCloudReminder(emailReminderEnabled, time)
    } catch {
      // bỏ qua
    }
  }

  const handleManualSync = async () => {
    try {
      setSyncFeedback('Đang đồng bộ...')
      const res = await syncData()
      setSyncFeedback(`Thành công! Đã tải về ${res.downloaded} bài, tải lên ${res.uploaded} bài.`)
      setTimeout(() => setSyncFeedback(null), 4000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi đồng bộ'
      setSyncFeedback(`Thất bại: ${msg}`)
    }
  }

  const toggle = async () => {
    if (!settings.enabled) {
      const p = await requestPermission()
      setPermission(p)
      if (p === 'denied') {
        alert(
          'Quyền thông báo đang bị chặn trong trình duyệt của bạn. Hãy bật lại trong cài đặt trang web.',
        )
        return
      }
    }
    await save({ ...settings, enabled: !settings.enabled })
  }

  const changeTime = async (time: string) => {
    await save({ ...settings, time })
  }

  const handleTestNotification = async () => {
    const p = await requestPermission()
    setPermission(p)
    if (p !== 'granted') {
      alert('Vui lòng cấp quyền thông báo để gửi thử.')
      return
    }
    showReminderNotification()
    setTestSent(true)
    setTimeout(() => setTestSent(false), 3000)
  }

  // Mã PIN bảo mật
  const { isPinEnabled, removePin } = usePinLock()
  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [pinSuccessMsg, setPinSuccessMsg] = useState('')

  // Sao lưu JSON
  const [isExporting, setIsExporting] = useState(false)
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleLockNow = () => {
    sessionStorage.removeItem('junhi_unlocked')
    window.location.reload()
  }

  const handleRemovePin = async () => {
    if (window.confirm('Bạn có chắc muốn tắt khóa mã PIN?')) {
      await removePin()
      setPinSuccessMsg('Đã tắt khóa mã PIN')
      setTimeout(() => setPinSuccessMsg(''), 3000)
    }
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      await exportBackup()
    } catch {
      alert('Không thể xuất dữ liệu sao lưu.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setImportStatus('Đang nạp dữ liệu...')
      const res = await importBackup(file)
      setImportStatus(`Đã nhập thành công ${res.count} ngày nhật ký!`)
      setTimeout(() => setImportStatus(null), 4000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi không xác định khi nhập dữ liệu'
      alert(`Nhập dữ liệu thất bại: ${msg}`)
      setImportStatus(null)
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <>
      <PageHeader title="Cài đặt" subtitle="Tuỳ chỉnh đám mây, nhắc nhở & bảo mật" />

      <div className="max-w-2xl space-y-5">
        {/* Tùy chọn Giao diện: Hiện đại vs Retro Win95 MS Paint */}
        <section className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--border)]">
              <Palette size={20} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-[var(--text)]">Chủ đề giao diện (Theme)</h2>
              <p className={muted}>Chọn phong cách hiển thị bạn yêu thích</p>
            </div>
          </div>

          {/* 7. Thẻ chọn theme: Hiện đại, Retro Win95, Tùy chỉnh (Custom) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Chế độ Hiện đại */}
            <button
              type="button"
              onClick={() => setTheme('modern')}
              className={`relative flex flex-col items-start rounded-2xl p-4 text-left transition-all bg-[var(--surface-2)] ${
                theme === 'modern'
                  ? 'border-2 border-[var(--accent)] shadow-sm'
                  : 'border border-[var(--border)] hover:border-[var(--border-strong)]'
              }`}
            >
              {theme === 'modern' && (
                <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold shadow-xs">
                  ✓
                </span>
              )}
              <div className="mb-2 flex size-8 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs">
                <Sparkles size={16} />
              </div>
              <p className="text-sm font-bold text-[var(--text)]">Hiện đại (Modern)</p>
              <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed">
                Giao diện tinh tế, thanh thoát với Dark mode và chuyển động mượt mà.
              </p>
            </button>

            {/* Chế độ Retro Win95 MS Paint */}
            <button
              type="button"
              onClick={() => setTheme('win95')}
              className={`relative flex flex-col items-start rounded-2xl p-4 text-left transition-all bg-[var(--surface-2)] ${
                theme === 'win95'
                  ? 'border-2 border-[var(--accent)] shadow-sm'
                  : 'border border-[var(--border)] hover:border-[var(--border-strong)]'
              }`}
            >
              {theme === 'win95' && (
                <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold shadow-xs">
                  ✓
                </span>
              )}
              <div className="mb-2 flex size-8 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] shadow-xs">
                <span className="text-sm">🎨</span>
              </div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-[var(--text)]">Retro Win95</p>
                <span className="rounded bg-[var(--pastel-butter)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--accent-contrast)]">Y2K</span>
              </div>
              <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed">
                Phong cách Windows 95, bảng màu MS Paint hoài niệm với chú ếch và cá vàng.
              </p>
            </button>

            {/* Chế độ Tùy chỉnh (Custom) */}
            <button
              type="button"
              onClick={() => {
                setTheme('custom')
                setIsEditorOpen(true)
              }}
              className={`relative flex flex-col items-start rounded-2xl p-4 text-left transition-all bg-[var(--surface-2)] ${
                theme === 'custom'
                  ? 'border-2 border-[var(--accent)] shadow-sm'
                  : 'border border-[var(--border)] hover:border-[var(--border-strong)]'
              }`}
            >
              {theme === 'custom' && (
                <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold shadow-xs">
                  ✓
                </span>
              )}
              <div className="mb-2 flex size-8 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs">
                <Paintbrush size={16} />
              </div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-[var(--text)]">Tùy chỉnh (Custom)</p>
                <span className="rounded bg-[var(--accent)]/15 px-1.5 py-0.5 text-[10px] font-bold text-[var(--accent)]">Studio</span>
              </div>
              <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed">
                Tự phối màu, chọn 10+ font chữ, viền bóng và mật độ theo phong cách riêng của bạn.
              </p>
              <span className="mt-2 text-[11px] font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1">
                Mở Studio tùy biến →
              </span>
            </button>
          </div>

          {/* Chế độ Sáng / Tối */}
          <div className="pt-2 border-t border-[var(--border)]">
            <h3 className="text-sm font-semibold mb-2 text-[var(--text)]">Chế độ màu (Sáng / Tối)</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleToggleDark(false)}
                className={`relative flex items-center gap-2.5 rounded-2xl p-3 text-left transition-all bg-[var(--surface-2)] ${
                  !isDark
                    ? 'border-2 border-[var(--accent)] shadow-sm'
                    : 'border border-[var(--border)] hover:border-[var(--border-strong)]'
                }`}
              >
                {!isDark && (
                  <span className="absolute top-2.5 right-2.5 flex size-4 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] text-[10px] font-bold shadow-xs">
                    ✓
                  </span>
                )}
                <span className="text-lg">☀️</span>
                <div>
                  <p className="text-xs font-bold text-[var(--text)]">Kem ấm (Sáng)</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Nền kem dịu mắt</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleToggleDark(true)}
                className={`relative flex items-center gap-2.5 rounded-2xl p-3 text-left transition-all bg-[var(--surface-2)] ${
                  isDark
                    ? 'border-2 border-[var(--accent)] shadow-sm'
                    : 'border border-[var(--border)] hover:border-[var(--border-strong)]'
                }`}
              >
                {isDark && (
                  <span className="absolute top-2.5 right-2.5 flex size-4 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] text-[10px] font-bold shadow-xs">
                    ✓
                  </span>
                )}
                <span className="text-lg">🌙</span>
                <div>
                  <p className="text-xs font-bold text-[var(--text)]">Đêm ấm (Tối)</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Nền nâu đen tĩnh lặng</p>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Mục Tài khoản & Đồng bộ đám mây (MySQL Backend) */}
        <section className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--border)]">
              <Database size={20} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-[var(--text)]">Tài khoản & Đồng bộ đám mây (MySQL)</h2>
              <p className={muted}>Đồng bộ nhật ký giữa các thiết bị và nhận email nhắc nhở</p>
            </div>
            {user ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success)]/15 px-2.5 py-1 text-xs font-semibold text-[var(--success)] border border-[var(--success)]/30">
                <CloudCheck size={14} /> Đã kết nối
              </span>
            ) : (
              <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--text-muted)] border border-[var(--border)]">
                Chưa đăng nhập
              </span>
            )}
          </div>

          {user ? (
            <div className="space-y-3.5 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] p-3.5">
                <div>
                  <p className="text-xs font-semibold text-[var(--text)]">{user.email}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {lastSyncedAt
                      ? `Đồng bộ lần cuối: ${lastSyncedAt.toLocaleTimeString('vi-VN')} ${lastSyncedAt.toLocaleDateString('vi-VN')}`
                      : 'Chưa đồng bộ trong phiên này'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={handleManualSync}
                    className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[var(--border-strong)] bg-[var(--accent)] px-3.5 py-1.5 text-xs font-semibold text-[var(--accent-contrast)] shadow-[1.5px_2px_0px_var(--border-strong)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition-all"
                  >
                    <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                    {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm('Bạn có chắc muốn đăng xuất? Dữ liệu của bạn đã được lưu an toàn trên đám mây.')) {
                        await logout()
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--danger)]/30 bg-[var(--surface-2)] px-3 py-1.5 text-xs font-semibold text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all active:scale-95"
                  >
                    <LogOut size={13} /> Đăng xuất
                  </button>
                </div>
              </div>

              {syncFeedback && (
                <p className="text-xs font-medium text-[var(--success)]">
                  {syncFeedback}
                </p>
              )}

              {/* Tùy chọn Nhận email nhắc hằng ngày */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-[var(--accent)]" />
                    <div>
                      <p className="text-xs font-semibold text-[var(--text)]">Gửi email nhắc nhở hằng ngày</p>
                      <p className="text-[11px] text-[var(--text-muted)]">Tự động gửi email vào hộp thư của bạn qua Cron</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={emailReminderEnabled}
                    onClick={handleToggleEmailReminder}
                    className={`relative h-6 w-11 rounded-full transition-colors border border-[var(--border)] ${
                      emailReminderEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--surface)]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 size-4.5 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-xs transition-transform ${
                        emailReminderEnabled ? 'translate-x-5 bg-white' : ''
                      }`}
                    />
                  </button>
                </div>

                {emailReminderEnabled && (
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                    <label htmlFor="email-reminder-time" className="text-xs text-[var(--text)] font-medium">
                      Giờ gửi email
                    </label>
                    <input
                      id="email-reminder-time"
                      type="time"
                      value={emailReminderTime}
                      onChange={(e) => handleChangeEmailTime(e.target.value)}
                      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs font-semibold text-[var(--text)] outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Khi chưa đăng nhập, dữ liệu của bạn được lưu cục bộ an toàn trong IndexedDB của máy. Đăng nhập để tự động lưu vào MySQL và truy cập từ mọi thiết bị.
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  to={ROUTES.login}
                  className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[var(--border-strong)] bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent-contrast)] shadow-[1.5px_2px_0px_var(--border-strong)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  <Cloud size={15} /> Đăng nhập tài khoản
                </Link>
                <Link
                  to={ROUTES.register}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-xs font-semibold text-[var(--text)] hover:border-[var(--border-strong)] active:scale-95 transition-all"
                >
                  Tạo tài khoản mới
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Mục Bảo mật & Khóa mã PIN */}
        <section className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--border)]">
              <Shield size={20} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-[var(--text)]">Khóa bằng mã PIN</h2>
              <p className={muted}>Bảo vệ quyền riêng tư nhật ký khi người khác mở trình duyệt</p>
            </div>
            {isPinEnabled ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success)]/15 px-2.5 py-1 text-xs font-semibold text-[var(--success)] border border-[var(--success)]/30">
                <ShieldCheck size={14} /> Đang bật
              </span>
            ) : (
              <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--text-muted)] border border-[var(--border)]">
                Chưa bật
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setIsPinModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[var(--border-strong)] bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent-contrast)] shadow-[1.5px_2px_0px_var(--border-strong)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <KeyRound size={15} />
              {isPinEnabled ? 'Đổi mã PIN' : 'Thiết lập mã PIN'}
            </button>

            {isPinEnabled && (
              <>
                <button
                  type="button"
                  onClick={handleLockNow}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2 text-xs font-semibold text-[var(--text)] hover:border-[var(--border-strong)] active:scale-95 transition-all"
                >
                  <Lock size={14} /> Khóa ngay
                </button>
                <button
                  type="button"
                  onClick={handleRemovePin}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--danger)]/30 bg-[var(--surface-2)] px-3.5 py-2 text-xs font-semibold text-[var(--danger)] hover:bg-[var(--danger)]/10 active:scale-95 transition-all"
                >
                  <Trash2 size={14} /> Tắt mã PIN
                </button>
              </>
            )}
          </div>

          {pinSuccessMsg && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--success)]">
              <Check size={14} /> {pinSuccessMsg}
            </p>
          )}

          <p className="text-[11px] text-[var(--text-muted)]">
            Nhật ký là chuyện riêng tư. Khóa bằng mã PIN, không ai khác mở được, kể cả khi người khác cầm máy bạn.
          </p>
        </section>

        {/* Mục Sao lưu & Phục hồi dữ liệu */}
        <section className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--border)]">
              <FileDown size={20} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-[var(--text)]">Sao lưu & Phục hồi dữ liệu</h2>
              <p className={muted}>Xuất / nhập toàn bộ nhật ký ra tập tin JSON an toàn</p>
            </div>
          </div>

          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Dữ liệu được lưu trong trình duyệt của máy bạn. Hãy tải bản sao lưu định kỳ để không bị mất khi xóa lịch sử web hoặc chuyển sang thiết bị khác.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              disabled={isExporting}
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[var(--border-strong)] bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent-contrast)] shadow-[1.5px_2px_0px_var(--border-strong)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition-all"
            >
              <FileDown size={15} />
              {isExporting ? 'Đang xuất...' : 'Xuất dữ liệu (JSON)'}
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-xs font-semibold text-[var(--text)] hover:border-[var(--border-strong)] active:scale-95 transition-all"
            >
              <FileUp size={15} /> Nhập dữ liệu (JSON)
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {importStatus && (
            <div className="flex items-center gap-2 rounded-2xl bg-[var(--success)]/15 border border-[var(--success)]/30 px-3.5 py-2 text-xs font-medium text-[var(--success)]">
              <Check size={14} className="shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}
        </section>

        {/* Mục Nhắc nhở hằng ngày */}
        <section className="card space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--border)]">
              <BellRing size={20} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-[var(--text)]">Nhắc nhở hằng ngày</h2>
              <p className={muted}>Thông báo “Hôm nay bạn thế nào?” để duy trì thói quen</p>
            </div>
            <button
              id="reminder-toggle"
              type="button"
              role="switch"
              aria-checked={settings.enabled}
              aria-label="Bật nhắc nhở hằng ngày"
              disabled={loading}
              onClick={toggle}
              className={`relative h-7 w-12 rounded-full transition-colors border border-[var(--border)] ${
                settings.enabled ? 'bg-[var(--accent)]' : 'bg-[var(--surface)]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 size-5.5 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-xs transition-transform ${
                  settings.enabled ? 'translate-x-5 bg-white' : ''
                }`}
              />
            </button>
          </div>

          {/* Chọn giờ nhắc */}
          <div className="flex items-center justify-between rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] p-3.5">
            <label htmlFor="reminder-time" className="text-sm font-medium text-[var(--text)]">
              Giờ nhắc hằng ngày
            </label>
            <input
              id="reminder-time"
              type="time"
              value={settings.time}
              disabled={!settings.enabled}
              onChange={(e) => changeTime(e.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm font-semibold text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)] disabled:opacity-40"
            />
          </div>

          {/* Ghi chú về việc tab đang mở */}
          <div className="flex items-start gap-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3.5 text-xs leading-relaxed text-[var(--text-muted)]">
            <Info size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" />
            <div>
              <p className="font-semibold text-[var(--text)]">Lưu ý về cơ chế thông báo:</p>
              <p className="mt-0.5">
                Ứng dụng hoạt động độc lập và lưu trữ dữ liệu tại máy.
                Do đó, <strong>thông báo hệ thống của trình duyệt chỉ kích hoạt khi tab trang web đang được mở</strong>. Nếu chưa check-in trong ngày, web sẽ luôn hiển thị banner nhắc nhở nổi bật ở đầu trang mỗi khi bạn mở ứng dụng.
              </p>
            </div>
          </div>

          {/* Tình trạng quyền & Nút gửi thử */}
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs">
              <span className="font-medium text-[var(--text-muted)]">Quyền thông báo: </span>
              {permission === 'granted' && (
                <span className="font-medium text-[var(--success)]">Đã cho phép ✓</span>
              )}
              {permission === 'denied' && (
                <span className="font-medium text-[var(--danger)]">Đang bị chặn trong trình duyệt</span>
              )}
              {permission === 'default' && (
                <span className="text-[var(--text-muted)]">Chưa cấp quyền (sẽ hỏi khi bật nhắc nhở)</span>
              )}
              {permission === 'unsupported' && (
                <span className="text-[var(--text-muted)]">Trình duyệt không hỗ trợ</span>
              )}
            </div>

            <button
              id="reminder-test"
              type="button"
              onClick={handleTestNotification}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2 text-xs font-semibold text-[var(--text)] hover:border-[var(--border-strong)] active:scale-95 transition-all"
            >
              {testSent ? (
                <>
                  <Check size={14} className="text-[var(--success)]" />
                  Đã phát thông báo!
                </>
              ) : (
                <>
                  <Volume2 size={14} />
                  Thử thông báo ngay
                </>
              )}
            </button>
          </div>
        </section>

        {/* Mục Cài đặt PWA lên màn hình chính */}
        <section className="card space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--border)]">
              <Smartphone size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text)]">Cài đặt ứng dụng</h2>
              <p className={muted}>Cài lên màn hình chính để mở nhanh như app native</p>
            </div>
          </div>

          {installed ? (
            <p className="text-xs text-[var(--success)] font-medium">
              ✓ Junhi đã được cài đặt trên thiết bị của bạn.
            </p>
          ) : canInstall ? (
            <button
              id="install-app"
              type="button"
              onClick={install}
              className="flex items-center gap-2 rounded-full border-[1.5px] border-[var(--border-strong)] bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-[var(--accent-contrast)] shadow-[1.5px_2px_0px_var(--border-strong)] transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Download size={15} /> Cài đặt Junhi lên màn hình chính
            </button>
          ) : isIos ? (
            <p className={muted}>
              Trên iPhone/iPad: Chạm vào biểu tượng <strong className="text-[var(--text)]">Chia sẻ (Share)</strong> trên Safari và chọn <strong className="text-[var(--text)]">“Thêm vào MH chính (Add to Home Screen)”</strong>.
            </p>
          ) : (
            <p className={muted}>
              Dùng menu trình duyệt (biểu tượng 3 chấm) và chọn <strong className="text-[var(--text)]">“Cài đặt ứng dụng”</strong> hoặc <strong className="text-[var(--text)]">“Thêm vào màn hình chính”</strong>.
            </p>
          )}

          <p className="text-[11px] text-[var(--text-muted)]">
            Dữ liệu nhật ký được lưu cục bộ an toàn trong IndexedDB của thiết bị, hoàn toàn riêng tư và không tải lên máy chủ ngoài.
          </p>
        </section>
      </div>

      <PinSetupModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => {
          setPinSuccessMsg('Đã thiết lập mã PIN thành công!')
          setTimeout(() => setPinSuccessMsg(''), 3000)
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <ThemeEditorModal />
    </>
  )
}
