import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  Headphones,
  Music,
  RotateCcw,
  Settings,
  Sparkles,
  Volume1,
  Volume2,
  X,
} from 'lucide-react'

function ToggleSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-ink transition-colors duration-200 ${
        checked ? 'bg-mint' : 'bg-neutral-300'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full border-2 border-ink bg-white shadow-sm transition-transform duration-200 mt-0.5 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

function VolumeSlider({ value, onChange, disabled = false, min = 0, max = 1, step = 0.05 }) {
  return (
    <div className={`flex items-center gap-3 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-3 w-full cursor-pointer appearance-none rounded-full border-2 border-ink bg-lemon accent-grape transition-all"
      />
      <span className="w-12 text-right font-display text-sm font-extrabold text-ink">
        {Math.round(value * 100)}%
      </span>
    </div>
  )
}

export default function SettingsModal({
  isOpen,
  onClose,
  masterVolume,
  setMasterVolume,
  bgmEnabled,
  setBgmEnabled,
  bgmVolume,
  setBgmVolume,
  narratorEnabled,
  setNarratorEnabled,
  narratorVolume,
  setNarratorVolume,
  videoVolume,
  setVideoVolume,
  autoNext,
  setAutoNext,
  playbackSpeed,
  setPlaybackSpeed,
  onReset,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Lớp nền mờ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
          />

          {/* Hộp thoại cài đặt */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2.5rem] border-4 border-ink bg-paper p-6 shadow-chunky text-ink sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b-4 border-ink/15 pb-4">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl border-4 border-ink bg-lemon shadow-chunkySm">
                  <Settings size={26} aria-hidden />
                </span>
                <div>
                  <h2 id="settings-title" className="font-display text-2xl font-extrabold leading-tight">
                    Cài đặt câu chuyện
                  </h2>
                  <p className="text-xs font-semibold text-ink/70">
                    Tùy chỉnh âm lượng & trải nghiệm đọc sách
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng cài đặt"
                className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-rose text-ink shadow-chunkySm transition-transform hover:scale-105 active:translate-y-1 active:shadow-none"
              >
                <X size={22} strokeWidth={3} />
              </button>
            </div>

            {/* Body */}
            <div className="mt-5 space-y-5">
              {/* 1. Âm lượng tổng */}
              <div className="rounded-2xl border-2 border-ink bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2 font-display text-base font-extrabold">
                    <Volume2 size={20} className="text-grape" />
                    Âm lượng tổng
                  </span>
                  <span className="text-xs font-bold text-ink/60">Toàn bộ âm thanh</span>
                </div>
                <VolumeSlider value={masterVolume} onChange={setMasterVolume} />
              </div>

              {/* 2. Nhạc nền (BGM) */}
              <div className="rounded-2xl border-2 border-ink bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2 font-display text-base font-extrabold">
                    <Music size={20} className="text-mint" />
                    Nhạc nền (BGM)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-ink/70">
                      {bgmEnabled ? 'Đang bật' : 'Đang tắt'}
                    </span>
                    <ToggleSwitch
                      checked={bgmEnabled}
                      onChange={setBgmEnabled}
                      label="Bật/Tắt nhạc nền"
                    />
                  </div>
                </div>
                <VolumeSlider
                  value={bgmVolume}
                  onChange={setBgmVolume}
                  disabled={!bgmEnabled}
                />
              </div>

              {/* 3. Giọng đọc người dẫn */}
              <div className="rounded-2xl border-2 border-ink bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2 font-display text-base font-extrabold">
                    <Headphones size={20} className="text-peach" />
                    Giọng đọc dẫn truyện
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-ink/70">
                      {narratorEnabled ? 'Đang bật' : 'Đang tắt'}
                    </span>
                    <ToggleSwitch
                      checked={narratorEnabled}
                      onChange={setNarratorEnabled}
                      label="Bật/Tắt giọng đọc dẫn truyện"
                    />
                  </div>
                </div>
                <VolumeSlider
                  value={narratorVolume}
                  onChange={setNarratorVolume}
                  disabled={!narratorEnabled}
                />
              </div>

              {/* 4. Âm thanh hiệu ứng Video (SFX) */}
              <div className="rounded-2xl border-2 border-ink bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2 font-display text-base font-extrabold">
                    <Volume1 size={20} className="text-sky" />
                    Âm thanh video & hiệu ứng
                  </span>
                  <span className="text-xs font-bold text-ink/60">Tiếng trong video</span>
                </div>
                <VolumeSlider value={videoVolume} onChange={setVideoVolume} />
              </div>

              {/* 5. Tự động lật trang */}
              <div className="flex items-center justify-between rounded-2xl border-2 border-ink bg-white p-4 shadow-sm">
                <div>
                  <span className="font-display text-base font-extrabold">Tự động lật trang</span>
                  <p className="text-xs font-semibold text-ink/60">
                    Tự chuyển sang trang sau khi video kết thúc
                  </p>
                </div>
                <ToggleSwitch
                  checked={autoNext}
                  onChange={setAutoNext}
                  label="Bật/Tắt tự động lật trang"
                />
              </div>

              {/* 6. Tốc độ đọc / phát */}
              <div className="rounded-2xl border-2 border-ink bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-display text-base font-extrabold">Tốc độ phát</span>
                  <span className="text-xs font-bold text-ink/60">Chậm cho bé hoặc chuẩn</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 0.75, label: '0.75x (Chậm)' },
                    { value: 1.0, label: '1.0x (Chuẩn)' },
                    { value: 1.25, label: '1.25x (Nhanh)' },
                  ].map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setPlaybackSpeed(s.value)}
                      className={`rounded-xl border-2 border-ink py-2 font-display text-xs font-extrabold transition-all sm:text-sm ${
                        playbackSpeed === s.value
                          ? 'bg-lemon shadow-chunkySm'
                          : 'bg-paper/70 hover:bg-paper'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="mt-6 flex items-center justify-between gap-3 border-t-4 border-ink/15 pt-4">
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-white px-4 py-2 font-display text-xs font-bold shadow-chunkySm transition-transform hover:scale-105 active:translate-y-0.5 sm:text-sm"
              >
                <RotateCcw size={16} /> Đặt lại mặc định
              </button>

              <button
                type="button"
                onClick={onClose}
                className="btn-big bg-mint !px-6 !py-2.5 !text-base shadow-chunkySm"
              >
                <Check size={20} /> Xong
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
