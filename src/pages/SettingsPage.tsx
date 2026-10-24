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
  RefreshCw,
  Shield,
  ShieldCheck,
  Smartphone,
  Trash2,
  Volume2,
} from 'lucide-react'
import AuthModal from '@/components/AuthModal'
import PageHeader from '@/components/PageHeader'
import PinSetupModal from '@/components/PinSetupModal'
import { ROUTES } from '@/constants/app'
import { useAuth } from '@/context/useAuth'
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

const muted = 'text-xs text-slate-500 dark:text-slate-400'

export default function SettingsPage() {
  const { loading, settings, save } = useReminder()
  const [permission, setPermission] = useState<PermissionState>(getPermission)
  const [testSent, setTestSent] = useState(false)
  const { canInstall, installed, install, isIos } = useInstallPrompt()

  // Cloud Auth & Sync
  const { user, isSyncing, lastSyncedAt, syncData, logout } = useAuth()
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
      setTimeout(() => setSyncFeedback(null), 4000)
    }
  }

  // Bảo mật PIN
  const { isPinEnabled, removePin } = usePinLock()
  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [pinSuccessMsg, setPinSuccessMsg] = useState('')

  // Sao lưu / Phục hồi
  const [isExporting, setIsExporting] = useState(false)
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const toggle = async () => {
    const nextEnabled = !settings.enabled
    if (nextEnabled && permission !== 'granted') {
      const res = await requestPermission()
      setPermission(res)
      if (res === 'denied') {
        alert('Trình duyệt đang chặn thông báo. Bạn vui lòng bật lại trong phần cài đặt trình duyệt của trang web.')
      }
    }
    await save({ ...settings, enabled: nextEnabled })
  }

  const changeTime = async (time: string) => {
    if (!time) return
    await save({ ...settings, time })
  }

  const handleTestNotification = async () => {
    const success = await showReminderNotification()
    if (success) {
      setTestSent(true)
      setTimeout(() => setTestSent(false), 3000)
    } else {
      const res = await requestPermission()
      setPermission(res)
    }
  }

  const handleLockNow = () => {
    sessionStorage.removeItem('junhi_unlocked')
    window.location.reload()
  }

  const handleRemovePin = async () => {
    if (window.confirm('Bạn có chắc chắn muốn tắt khóa mã PIN?')) {
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
        {/* Mục Tài khoản & Đồng bộ đám mây (MySQL Backend) */}
        <section className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-white/10 dark:text-brand-300">
              <Database size={20} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold">Tài khoản & Đồng bộ đám mây (MySQL)</h2>
              <p className={muted}>Đồng bộ nhật ký giữa các thiết bị và nhận email nhắc nhở</p>
            </div>
            {user ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-400">
                <CloudCheck size={14} /> Đã kết nối
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 dark:bg-white/10 dark:text-slate-400">
                Chưa đăng nhập
              </span>
            )}
          </div>

          {user ? (
            <div className="space-y-3.5 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-brand-50/50 p-3 dark:bg-white/5">
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{user.email}</p>
                  <p className="text-[11px] text-slate-400">
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
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-brand-600 disabled:opacity-50 active:scale-95"
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
                    className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 shadow-2xs hover:bg-rose-50 active:scale-95 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400"
                  >
                    <LogOut size={13} /> Đăng xuất
                  </button>
                </div>
              </div>

              {syncFeedback && (
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {syncFeedback}
                </p>
              )}

              {/* Tùy chọn Nhận email nhắc hằng ngày */}
              <div className="rounded-2xl border border-brand-100 p-3.5 space-y-3 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-brand-500" />
                    <div>
                      <p className="text-xs font-semibold">Gửi email nhắc nhở hằng ngày</p>
                      <p className="text-[11px] text-slate-400">Tự động gửi email vào hộp thư của bạn qua Cron</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={emailReminderEnabled}
                    onClick={handleToggleEmailReminder}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      emailReminderEnabled ? 'bg-brand-500' : 'bg-slate-300 dark:bg-white/20'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${
                        emailReminderEnabled ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>

                {emailReminderEnabled && (
                  <div className="flex items-center justify-between pt-1 border-t border-brand-50 dark:border-white/5">
                    <label htmlFor="email-reminder-time" className="text-xs text-slate-600 dark:text-slate-300">
                      Giờ gửi email
                    </label>
                    <input
                      id="email-reminder-time"
                      type="time"
                      value={emailReminderTime}
                      onChange={(e) => handleChangeEmailTime(e.target.value)}
                      className="rounded-lg border border-brand-200 bg-white px-2.5 py-1 text-xs font-semibold outline-none dark:border-white/20 dark:bg-white/10"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Khi chưa đăng nhập, dữ liệu của bạn được lưu cục bộ an toàn trong IndexedDB của máy. Đăng nhập để tự động lưu vào MySQL và truy cập từ mọi thiết bị.
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  to={ROUTES.login}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-brand-600 active:scale-95"
                >
                  <Cloud size={15} /> Đăng nhập tài khoản
                </Link>
                <Link
                  to={ROUTES.register}
                  className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-4 py-2 text-xs font-semibold text-brand-700 shadow-2xs hover:bg-brand-50 active:scale-95 dark:border-white/15 dark:bg-white/10 dark:text-brand-200 dark:hover:bg-white/15"
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
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-white/10 dark:text-brand-300">
              <Shield size={20} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold">Khóa bằng mã PIN</h2>
              <p className={muted}>Bảo vệ quyền riêng tư nhật ký khi người khác mở trình duyệt</p>
            </div>
            {isPinEnabled ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-400">
                <ShieldCheck size={14} /> Đang bật
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 dark:bg-white/10 dark:text-slate-400">
                Chưa bật
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setIsPinModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-brand-600 active:scale-95"
            >
              <KeyRound size={15} />
              {isPinEnabled ? 'Đổi mã PIN' : 'Thiết lập mã PIN'}
            </button>

            {isPinEnabled && (
              <>
                <button
                  type="button"
                  onClick={handleLockNow}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-white px-3.5 py-2 text-xs font-semibold text-brand-700 shadow-2xs hover:bg-brand-50 active:scale-95 dark:border-white/15 dark:bg-white/10 dark:text-brand-200 dark:hover:bg-white/15"
                >
                  <Lock size={14} /> Khóa ngay
                </button>
                <button
                  type="button"
                  onClick={handleRemovePin}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-xs font-semibold text-rose-600 shadow-2xs hover:bg-rose-50 active:scale-95 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400"
                >
                  <Trash2 size={14} /> Tắt mã PIN
                </button>
              </>
            )}
          </div>

          {pinSuccessMsg && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <Check size={14} /> {pinSuccessMsg}
            </p>
          )}

          <p className="text-[11px] text-slate-400">
            Nhật ký là chuyện riêng tư. Khóa bằng mã PIN, không ai khác mở được, kể cả khi người khác cầm máy bạn.
          </p>
        </section>

        {/* Mục Sao lưu & Phục hồi dữ liệu */}
        <section className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-white/10 dark:text-brand-300">
              <FileDown size={20} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold">Sao lưu & Phục hồi dữ liệu</h2>
              <p className={muted}>Xuất / nhập toàn bộ nhật ký ra tập tin JSON an toàn</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            Dữ liệu được lưu trong trình duyệt của máy bạn. Hãy tải bản sao lưu định kỳ để không bị mất khi xóa lịch sử web hoặc chuyển sang thiết bị khác.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              disabled={isExporting}
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-brand-600 disabled:opacity-50 active:scale-95"
            >
              <FileDown size={15} />
              {isExporting ? 'Đang xuất...' : 'Xuất dữ liệu (JSON)'}
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-3.5 py-2 text-xs font-semibold text-brand-700 shadow-2xs hover:bg-brand-50 active:scale-95 dark:border-white/15 dark:bg-white/10 dark:text-brand-200 dark:hover:bg-white/15"
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
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Check size={14} className="shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}
        </section>

        {/* Mục Nhắc nhở hằng ngày */}
        <section className="card space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-white/10 dark:text-brand-300">
              <BellRing size={20} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold">Nhắc nhở hằng ngày</h2>
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
              className={`relative h-7 w-12 rounded-full transition-colors ${
                settings.enabled ? 'bg-brand-500' : 'bg-slate-300 dark:bg-white/20'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform ${
                  settings.enabled ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          {/* Chọn giờ nhắc */}
          <div className="flex items-center justify-between rounded-2xl bg-brand-50/50 p-3.5 dark:bg-white/5">
            <label htmlFor="reminder-time" className="text-sm font-medium">
              Giờ nhắc hằng ngày
            </label>
            <input
              id="reminder-time"
              type="time"
              value={settings.time}
              disabled={!settings.enabled}
              onChange={(e) => changeTime(e.target.value)}
              className="rounded-xl border border-brand-200 bg-white px-3 py-1.5 text-sm font-semibold outline-none transition-colors focus:border-brand-500 disabled:opacity-40 dark:border-white/20 dark:bg-white/10"
            />
          </div>

          {/* Ghi chú rõ ràng về việc tab đang mở */}
          <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs leading-relaxed text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
            <Info size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-semibold">Lưu ý về cơ chế thông báo:</p>
              <p className="mt-0.5">
                Ứng dụng hoạt động độc lập và lưu trữ dữ liệu tại máy (không có máy chủ/backend).
                Do đó, <strong>thông báo hệ thống của trình duyệt chỉ kích hoạt khi tab trang web đang được mở</strong> (hoặc đang mở ở chế độ nền). Nếu chưa check-in trong ngày, web sẽ luôn hiển thị banner nhắc nhở nổi bật ở đầu trang mỗi khi bạn mở ứng dụng.
              </p>
            </div>
          </div>

          {/* Tình trạng quyền & Nút gửi thử */}
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-300">Quyền thông báo: </span>
              {permission === 'granted' && (
                <span className="font-medium text-emerald-600 dark:text-emerald-400">Đã cho phép ✓</span>
              )}
              {permission === 'denied' && (
                <span className="font-medium text-rose-500">Đang bị chặn trong trình duyệt</span>
              )}
              {permission === 'default' && (
                <span className="text-slate-500">Chưa cấp quyền (sẽ hỏi khi bật nhắc nhở)</span>
              )}
              {permission === 'unsupported' && (
                <span className="text-slate-500">Trình duyệt không hỗ trợ</span>
              )}
            </div>

            <button
              id="reminder-test"
              type="button"
              onClick={handleTestNotification}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-brand-200 bg-white px-3.5 py-2 text-xs font-semibold text-brand-700 shadow-2xs hover:bg-brand-50 active:scale-95 dark:border-white/15 dark:bg-white/10 dark:text-brand-200 dark:hover:bg-white/15"
            >
              {testSent ? (
                <>
                  <Check size={14} className="text-emerald-500" />
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
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-white/10 dark:text-brand-300">
              <Smartphone size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold">Cài đặt ứng dụng</h2>
              <p className={muted}>Cài lên màn hình chính để mở nhanh như app native</p>
            </div>
          </div>

          {installed ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              ✓ Junhi đã được cài đặt trên thiết bị của bạn.
            </p>
          ) : canInstall ? (
            <button
              id="install-app"
              type="button"
              onClick={install}
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95"
            >
              <Download size={15} /> Cài đặt Junhi lên màn hình chính
            </button>
          ) : isIos ? (
            <p className={muted}>
              Trên iPhone/iPad: Chạm vào biểu tượng <strong>Chia sẻ (Share)</strong> trên Safari và chọn <strong>“Thêm vào MH chính (Add to Home Screen)”</strong>.
            </p>
          ) : (
            <p className={muted}>
              Dùng menu trình duyệt (biểu tượng 3 chấm) và chọn <strong>“Cài đặt ứng dụng”</strong> hoặc <strong>“Thêm vào màn hình chính”</strong>.
            </p>
          )}

          <p className="text-[11px] text-slate-400">
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
    </>
  )
}
