import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Play, Sparkles, XCircle } from 'lucide-react'

const BADGE_COLORS = {
  A: 'bg-lemon text-ink',
  B: 'bg-sky text-ink',
  C: 'bg-peach text-ink',
  D: 'bg-mint text-ink',
}

export default function VideoQuizOverlay({ quiz, onResume }) {
  const [selectedId, setSelectedId] = useState(null)
  const [wrongIds, setWrongIds] = useState([])
  const [isAnsweredCorrect, setIsAnsweredCorrect] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)

  const correctId = quiz?.correctId || 'D'
  const options = quiz?.options || [
    { id: 'A', label: 'A', value: '5' },
    { id: 'B', label: 'B', value: '7' },
    { id: 'C', label: 'C', value: '9' },
    { id: 'D', label: 'D', value: '12' },
  ]

  const area = quiz?.area || {
    top: '33%',
    left: '17%',
    width: '66%',
    height: '50%',
  }

  const handleSelect = (id) => {
    setSelectedId(id)
    if (id === correctId) {
      setIsAnsweredCorrect(true)
    } else {
      setWrongIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
      setShakeKey((k) => k + 1)
    }
  }

  // Tự động phát tiếp sau 3 giây khi chọn đúng (nếu bé chưa bấm nút Xem tiếp)
  useEffect(() => {
    if (isAnsweredCorrect) {
      const timer = setTimeout(() => {
        onResume()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isAnsweredCorrect, onResume])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        top: area.top || '33%',
        left: area.left || '17%',
        width: area.width || '66%',
        height: area.height || '50%',
      }}
      className="z-30 flex flex-col justify-between select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Lưới 4 đáp án A, B, C, D (2 hàng x 2 cột) */}
      <div className="grid h-full w-full grid-cols-2 gap-3 sm:gap-4 md:gap-5">
        {options.map((opt, idx) => {
          const isSelected = selectedId === opt.id
          const isCorrect = opt.id === correctId && isSelected
          const isWrong = opt.id !== correctId && (isSelected || wrongIds.includes(opt.id))

          const badgeColor = BADGE_COLORS[opt.label] || 'bg-lemon text-ink'

          return (
            <motion.button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt.id)}
              initial={{ opacity: 0, y: 15 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: isCorrect ? [1, 1.06, 1] : 1,
                x: isSelected && isWrong ? [0, -10, 10, -7, 7, -3, 3, 0] : 0,
              }}
              transition={{
                opacity: { delay: 0.15 + idx * 0.1, duration: 0.3 },
                y: { delay: 0.15 + idx * 0.1, duration: 0.3 },
                scale: { duration: 0.35 },
                x: { duration: 0.4 },
              }}
              whileHover={{ scale: isCorrect ? 1.05 : 1.03 }}
              whileTap={{ scale: 0.96 }}
              className={`group relative flex items-center justify-between overflow-hidden rounded-2xl border-3 border-ink px-4 py-2 sm:rounded-3xl sm:border-4 sm:px-6 sm:py-3 transition-colors ${
                isCorrect
                  ? 'bg-mint ring-4 ring-emerald-500 shadow-chunky'
                  : isWrong
                    ? 'bg-rose ring-4 ring-red-400 shadow-chunkySm'
                    : 'bg-white hover:bg-[#FFF9D2] shadow-chunkySm'
              }`}
            >
              {/* Nhãn chữ A, B, C, D */}
              <span
                className={`grid h-8 w-8 place-items-center rounded-xl border-2 border-ink font-display text-base font-extrabold sm:h-11 sm:w-11 sm:rounded-2xl sm:border-3 sm:text-xl ${badgeColor}`}
              >
                {opt.label}
              </span>

              {/* Giá trị đáp án (5, 7, 9, 12) */}
              <span className="flex-1 text-center font-display text-2xl font-black text-ink sm:text-3xl md:text-4xl">
                {opt.value}
              </span>

              {/* Biểu tượng Đúng / Sai */}
              <span className="w-8 text-right sm:w-11">
                {isCorrect && (
                  <CheckCircle2 size={26} className="text-emerald-700 sm:size-8" />
                )}
                {isWrong && isSelected && (
                  <XCircle size={26} className="text-red-700 sm:size-8" />
                )}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Thông báo kết quả và nút Xem tiếp */}
      <div className="relative mt-2 flex min-h-[2.5rem] items-center justify-center sm:mt-3">
        <AnimatePresence mode="wait">
          {isAnsweredCorrect && (
            <motion.div
              key="correct-banner"
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border-3 border-ink bg-lemon px-4 py-1.5 shadow-chunkySm sm:border-4 sm:px-6 sm:py-2"
            >
              <Sparkles size={20} className="text-grape animate-spin" />
              <span className="font-display text-xs font-black text-ink sm:text-base md:text-lg">
                Chính xác! Mặt đồng hồ chia thành 12 phần bằng nhau!
              </span>
              <button
                type="button"
                onClick={onResume}
                className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-mint px-3 py-1 font-display text-xs font-black text-ink shadow-sm transition-transform hover:scale-105 active:scale-95 sm:text-sm"
              >
                <Play size={14} fill="currentColor" /> Xem tiếp
              </button>
            </motion.div>
          )}

          {selectedId && !isAnsweredCorrect && (
            <motion.div
              key={`wrong-banner-${shakeKey}`}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: [0, -6, 6, -4, 4, 0] }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.35 }}
              className="inline-flex items-center gap-2 rounded-full border-3 border-ink bg-rose px-4 py-1.5 shadow-chunkySm sm:border-4 sm:px-5 sm:py-2"
            >
              <XCircle size={20} className="text-red-800" />
              <span className="font-display text-xs font-black text-ink sm:text-sm md:text-base">
                Chưa đúng rồi, bé hãy chọn lại nhé!
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
