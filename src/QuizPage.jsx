import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Sparkles, XCircle } from 'lucide-react'
import { resolvePath } from './utils/path'

const normalizePath = resolvePath

// Cấu hình mặc định theo đúng thiết kế trang 3 (Bưu điện Sài Gòn)
// Bạn có thể bỏ ảnh PNG vào thư mục public/images/ hoặc chỉnh đường dẫn trong public/data/stories.json
const DEFAULT_QUIZ = {
  backgroundImage: '/images/quiz-bg.png',
  questionImage: '/images/quiz-question.png',
  correctId: 'B',
  options: [
    { id: 'A', label: 'A', value: '1890', image: '/images/dap-an-A.png', side: 'left', pillTop: true },
    { id: 'B', label: 'B', value: '1891', image: '/images/dap-an-B.png', side: 'right', pillTop: true },
    { id: 'C', label: 'C', value: '1892', image: '/images/dap-an-C.png', side: 'left', pillTop: false },
    { id: 'D', label: 'D', value: '1893', image: '/images/dap-an-D.png', side: 'right', pillTop: false },
  ],
}

function OptionVisual({ option, status }) {
  const [imgFailed, setImgFailed] = useState(false)
  const imgSrc = normalizePath(option.image)

  // Màu sắc thay đổi khi chọn Đúng (Xanh) hoặc Sai (Đỏ)
  const outerBg =
    status === 'correct'
      ? '#10B981' // Xanh lá tươi khi đúng
      : status === 'wrong'
        ? '#EF4444' // Đỏ khi sai
        : '#14B377' // Xanh lá mặc định theo thiết kế

  const innerBg =
    status === 'correct'
      ? '#D1FAE5'
      : status === 'wrong'
        ? '#FEE2E2'
        : '#F7EF81'

  return (
    <div className="relative w-full overflow-hidden rounded-xl shadow-md transition-colors duration-300">
      {/* Nếu bạn đã bỏ file PNG của đáp án vào public/images/ thì ưu tiên hiện ảnh PNG */}
      {imgSrc && !imgFailed ? (
        <div className="relative">
          <img
            src={imgSrc}
            alt={`Đáp án ${option.label}: ${option.value}`}
            className="block h-auto w-full object-contain select-none"
            onError={() => setImgFailed(true)}
          />
          {status === 'correct' && (
            <div className="absolute inset-0 bg-emerald-500/35 ring-4 ring-inset ring-emerald-500 transition-all" />
          )}
          {status === 'wrong' && (
            <div className="absolute inset-0 bg-red-500/40 ring-4 ring-inset ring-red-500 transition-all" />
          )}
        </div>
      ) : (
        /* Giao diện chuẩn theo mẫu thiết kế nếu chưa gắn file PNG rời */
        <div
          className="relative flex flex-col items-center px-6 pt-2 pb-4 sm:px-9 sm:pt-2.5 sm:pb-5 transition-colors duration-300"
          style={{ backgroundColor: outerBg }}
        >
          <span className="font-body text-xl font-extrabold tracking-wide text-white sm:text-2xl">
            {option.label}
          </span>

          {/* Thanh tròn trang trí hai bên cánh cửa sổ */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 flex h-9 w-3.5 flex-col overflow-hidden rounded-full bg-white/95 sm:h-11 sm:w-4 ${
              option.side === 'left' ? 'left-2 sm:left-3' : 'right-2 sm:right-3'
            }`}
          >
            <span
              className={`h-1/2 w-full rounded-full ${
                option.pillTop ? 'bg-[#F7EF81]' : 'bg-transparent'
              }`}
            />
            <span
              className={`h-1/2 w-full rounded-full ${
                !option.pillTop ? 'bg-[#F7EF81]' : 'bg-transparent'
              }`}
            />
          </div>

          {/* Ô màu vàng chứa năm (1890, 1891, 1892, 1893) */}
          <div
            className="mt-1 flex w-full items-center justify-center py-3 sm:py-4 transition-colors duration-300"
            style={{ backgroundColor: innerBg }}
          >
            <span
              className={`font-display text-2xl font-extrabold sm:text-3xl ${
                status === 'correct'
                  ? 'text-emerald-900'
                  : status === 'wrong'
                    ? 'text-red-900'
                    : 'text-[#111]'
              }`}
            >
              {option.value}
            </span>
          </div>
        </div>
      )}

      {/* Huy hiệu Đúng / Sai ở góc */}
      <AnimatePresence>
        {status === 'correct' && (
          <motion.span
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            className="absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-white text-emerald-600 shadow-md"
          >
            <CheckCircle2 size={22} />
          </motion.span>
        )}
        {status === 'wrong' && (
          <motion.span
            initial={{ scale: 0, rotate: 30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            className="absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-white text-red-600 shadow-md"
          >
            <XCircle size={22} />
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function QuizPage({ page }) {
  const quiz = { ...DEFAULT_QUIZ, ...(page?.quiz || {}) }
  const options = quiz.options || DEFAULT_QUIZ.options
  const correctId = quiz.correctId || 'B'

  const [selectedId, setSelectedId] = useState(null)
  const [wrongIds, setWrongIds] = useState([])
  const [shakeKey, setShakeKey] = useState(0)
  const [bgFailed, setBgFailed] = useState(false)
  const [qImgFailed, setQImgFailed] = useState(false)

  const bgSrc = normalizePath(quiz.backgroundImage)
  const qImgSrc = normalizePath(quiz.questionImage)

  const isCorrect = selectedId === correctId

  const handleSelect = (optionId) => {
    setSelectedId(optionId)
    if (optionId !== correctId) {
      setWrongIds((prev) => (prev.includes(optionId) ? prev : [...prev, optionId]))
      setShakeKey((k) => k + 1)
    }
  }

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#EFF7F0] px-4 py-5 text-[#1A1A1A] select-none sm:px-10 sm:py-8">
      {/* Lớp ảnh nền PNG (nếu bạn đặt file vào public/images/quiz-bg.png) */}
      {bgSrc && !bgFailed && (
        <img
          src={bgSrc}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          onError={() => setBgFailed(true)}
        />
      )}

      {/* Nội dung chính */}
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        {/* 1. Dòng chữ giới thiệu hiện mờ dần từ trên xuống */}
        <motion.p
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          className="max-w-lg text-sm leading-relaxed text-neutral-800 sm:text-lg"
        >
          Tòa Bưu điện khoác chiếc áo <strong className="font-extrabold text-amber-600">màu vàng</strong> rực rỡ này
          <br />
          đã hơn <strong className="font-extrabold text-emerald-700">130 tuổi</strong> rồi đấy!
        </motion.p>

        {/* 2. Câu hỏi chính với hiệu ứng nảy sinh động (hoặc ảnh PNG câu hỏi) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, type: 'spring', bounce: 0.4 }}
          className="mt-3 sm:mt-5"
        >
          {qImgSrc && !qImgFailed ? (
            <img
              src={qImgSrc}
              alt="Câu hỏi: Bưu điện Sài Gòn được xây xong vào năm nào?"
              className="mx-auto max-h-14 w-auto object-contain"
              onError={() => setQImgFailed(true)}
            />
          ) : (
            <motion.h2
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="font-display text-lg font-extrabold tracking-tight text-black sm:text-2xl md:text-[1.65rem]"
            >
              Câu hỏi: Bưu điện Sài Gòn được xây xong vào năm nào?
            </motion.h2>
          )}
        </motion.div>

        {/* 3. Bốn đáp án A, B, C, D lần lượt chồng mờ hiện lên */}
        <div className="mt-4 grid w-full max-w-xl grid-cols-2 gap-3 sm:mt-6 sm:gap-5">
          {options.map((opt, idx) => {
            const isThisSelected = selectedId === opt.id
            const isThisCorrect = opt.id === correctId && isThisSelected
            const isThisWrong = opt.id !== correctId && (isThisSelected || wrongIds.includes(opt.id))
            const status = isThisCorrect ? 'correct' : isThisWrong ? 'wrong' : 'idle'

            return (
              <motion.button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                /* Hiệu ứng lần lượt mờ dần hiện lên (staggered fade-in) */
                initial={{ opacity: 0, y: 24, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: isThisCorrect ? [1, 1.06, 1] : 1,
                  x: isThisSelected && status === 'wrong' ? [0, -10, 10, -8, 8, -4, 4, 0] : 0,
                }}
                transition={{
                  opacity: { duration: 0.55, delay: 0.75 + idx * 0.28, ease: 'easeOut' },
                  y: { duration: 0.55, delay: 0.75 + idx * 0.28, ease: 'easeOut' },
                  scale: { duration: 0.4 },
                  x: { duration: 0.45 },
                }}
                whileHover={{ scale: 1.04, y: -3 }}
                whileTap={{ scale: 0.96 }}
                className={`group relative rounded-xl text-left transition-shadow focus:outline-none ${
                  isThisCorrect
                    ? 'ring-4 ring-emerald-500 shadow-lg shadow-emerald-500/30'
                    : isThisSelected && status === 'wrong'
                      ? 'ring-4 ring-red-500 shadow-lg shadow-red-500/30'
                      : 'hover:shadow-lg'
                }`}
              >
                <OptionVisual key={`${opt.id}-${shakeKey}`} option={opt} status={status} />
              </motion.button>
            )
          })}
        </div>

        {/* 4. Thông báo kết quả: Đúng (Xanh) hoặc Sai (Đỏ, cho chọn lại) */}
        <div className="mt-3 flex min-h-[2.75rem] items-center justify-center sm:mt-5">
          <AnimatePresence mode="wait">
            {selectedId && isCorrect && (
              <motion.div
                key="correct-feedback"
                initial={{ opacity: 0, y: 12, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.9 }}
                transition={{ type: 'spring', bounce: 0.45 }}
                className="inline-flex items-center gap-2 rounded-full border-2 border-emerald-700 bg-emerald-500 px-5 py-2 font-display text-base font-extrabold text-white shadow-md sm:text-xl"
              >
                <Sparkles size={22} className="animate-spin" />
                <span>Chính xác! Bưu điện Sài Gòn hoàn thành năm 1891!</span>
              </motion.div>
            )}

            {selectedId && !isCorrect && (
              <motion.div
                key={`wrong-feedback-${shakeKey}`}
                initial={{ opacity: 0, y: 12, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1, x: [0, -8, 8, -5, 5, 0] }}
                exit={{ opacity: 0, y: -8, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 rounded-full border-2 border-red-800 bg-red-500 px-5 py-2 font-display text-base font-extrabold text-white shadow-md sm:text-xl"
              >
                <XCircle size={22} />
                <span>Sai rồi! Bạn hãy thử chọn lại đáp án khác nhé!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
