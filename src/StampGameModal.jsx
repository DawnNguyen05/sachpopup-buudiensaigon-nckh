import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, Sparkles, X } from 'lucide-react'
import { resolvePath } from './utils/path'

// Phát âm thanh dập dấu mộc gỗ chân thực bằng Web Audio API (không cần tải thêm file audio)
function playThumpSound(customAudioSrc) {
  if (customAudioSrc) {
    const audio = new Audio(customAudioSrc)
    audio.play().catch(() => {})
    return
  }

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()

    // Âm thanh trầm của đế gỗ dập xuống mặt giấy
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(140, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.08)

    gain.gain.setValueAtTime(0.7, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.1)

    // Tiếng cọ xát nhẹ của mặt cao su vào giấy
    const bufferSize = ctx.sampleRate * 0.04
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.15, ctx.currentTime)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)

    noise.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noise.start()
  } catch {
    // Trình duyệt không hỗ trợ Web Audio
  }
}

// Các mẫu dấu mộc SVG vẽ sẵn cực đẹp (dùng dự phòng nếu bạn chưa import ảnh PNG)
function DefaultStampSvg({ type }) {
  if (type === 0) {
    // Dấu tròn Bưu điện Sài Gòn (đỏ cổ điển)
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full select-none drop-shadow-sm">
        <circle cx="50" cy="50" r="44" fill="none" stroke="#C92A2A" strokeWidth="4" strokeDasharray="6 2" opacity="0.85" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="#C92A2A" strokeWidth="2.5" opacity="0.85" />
        <path id="curveTop" d="M 20,50 A 30,30 0 0,1 80,50" fill="none" />
        <text fill="#C92A2A" fontSize="8" fontWeight="900" letterSpacing="1" opacity="0.9">
          <textPath href="#curveTop" startOffset="50%" textAnchor="middle">
            BƯU ĐIỆN SÀI GÒN
          </textPath>
        </text>
        <circle cx="50" cy="50" r="3" fill="#C92A2A" opacity="0.8" />
        <text x="50" y="54" textAnchor="middle" fill="#C92A2A" fontSize="10" fontWeight="900" opacity="0.9">
          ★ 1891 ★
        </text>
        <path id="curveBot" d="M 80,52 A 30,30 0 0,1 20,52" fill="none" />
        <text fill="#C92A2A" fontSize="7" fontWeight="800" opacity="0.85">
          <textPath href="#curveBot" startOffset="50%" textAnchor="middle">
            VIỆT NAM POST
          </textPath>
        </text>
      </svg>
    )
  }

  if (type === 1) {
    // Dấu sóng bưu chính (lượn sóng đỏ)
    return (
      <svg viewBox="0 0 110 80" className="h-full w-full select-none drop-shadow-sm">
        <circle cx="35" cy="40" r="28" fill="none" stroke="#B02A37" strokeWidth="3" opacity="0.85" />
        <text x="35" y="44" textAnchor="middle" fill="#B02A37" fontSize="11" fontWeight="900" opacity="0.9">
          ĐÃ GỬI
        </text>
        <path d="M 68 25 Q 85 18 102 25 Q 85 32 68 25" stroke="#B02A37" strokeWidth="2.5" fill="none" opacity="0.8" />
        <path d="M 68 40 Q 85 33 102 40 Q 85 47 68 40" stroke="#B02A37" strokeWidth="2.5" fill="none" opacity="0.8" />
        <path d="M 68 55 Q 85 48 102 55 Q 85 62 68 55" stroke="#B02A37" strokeWidth="2.5" fill="none" opacity="0.8" />
      </svg>
    )
  }

  if (type === 2) {
    // Dấu vuông bưu thiếp màu xanh dương
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full select-none drop-shadow-sm">
        <rect x="12" y="12" width="76" height="76" rx="8" fill="none" stroke="#1D4ED8" strokeWidth="3.5" strokeDasharray="5 3" opacity="0.85" />
        <rect x="18" y="18" width="64" height="64" rx="4" fill="none" stroke="#1D4ED8" strokeWidth="2" opacity="0.8" />
        <text x="50" y="44" textAnchor="middle" fill="#1D4ED8" fontSize="11" fontWeight="900" opacity="0.9">
          POSTCARD
        </text>
        <text x="50" y="62" textAnchor="middle" fill="#1D4ED8" fontSize="9" fontWeight="800" opacity="0.85">
          SÀI GÒN
        </text>
      </svg>
    )
  }

  // Dấu ngôi sao bưu cục màu xanh lục
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full select-none drop-shadow-sm">
      <circle cx="50" cy="50" r="42" fill="none" stroke="#047857" strokeWidth="3.5" opacity="0.85" />
      <polygon points="50,22 57,38 74,40 61,52 65,69 50,60 35,69 39,52 26,40 43,38" fill="none" stroke="#047857" strokeWidth="2.5" opacity="0.85" />
      <text x="50" y="82" textAnchor="middle" fill="#047857" fontSize="8" fontWeight="900" opacity="0.9">
        ★ DI SẢN ★
      </text>
    </svg>
  )
}

// Con trỏ chuột hình con dấu mộc bằng gỗ (nếu bạn chưa có ảnh con dấu PNG)
function DefaultStampCursor({ isPressing }) {
  return (
    <div
      className="pointer-events-none transition-transform duration-75"
      style={{
        transform: `translate(-50%, -75%) ${isPressing ? 'scale(0.88) rotate(-8deg)' : 'scale(1) rotate(-15deg)'}`,
      }}
    >
      <svg width="68" height="68" viewBox="0 0 100 100" className="drop-shadow-lg">
        {/* Tay cầm gỗ tròn */}
        <ellipse cx="62" cy="22" rx="16" ry="14" fill="#C88448" stroke="#3A3157" strokeWidth="4" />
        <ellipse cx="64" cy="20" rx="11" ry="8" fill="#E8A96C" />
        {/* Thân cán gỗ */}
        <path d="M 54 32 C 54 44 46 54 42 66 L 56 68 C 60 56 68 46 68 34 Z" fill="#B26C33" stroke="#3A3157" strokeWidth="4" strokeLinejoin="round" />
        {/* Đế gỗ tròn dày */}
        <ellipse cx="40" cy="74" rx="28" ry="12" fill="#E8A96C" stroke="#3A3157" strokeWidth="4" />
        <path d="M 12 74 C 12 83 68 83 68 74 L 68 79 C 68 88 12 88 12 79 Z" fill="#C88448" stroke="#3A3157" strokeWidth="4" />
        {/* Mặt đế cao su màu đỏ */}
        <path d="M 14 79 C 14 87 66 87 66 79 L 66 83 C 66 91 14 91 14 83 Z" fill="#D94848" stroke="#3A3157" strokeWidth="3" />
      </svg>
    </div>
  )
}

export default function StampGameModal({
  isOpen,
  onClose,
  videoSrc,
  bgImage = '/images/quiz-bg.png',
  cursorImage,
  stampImages = [],
  stampSoundSrc,
  title = 'Bé đóng dấu bưu điện',
}) {
  const resolvedBgImage = resolvePath(bgImage)
  const resolvedCursorImage = resolvePath(cursorImage)
  const resolvedVideoSrc = resolvePath(videoSrc)
  const resolvedStampImages = (stampImages || []).map(resolvePath)

  const [stamps, setStamps] = useState([])
  const [mousePos, setMousePos] = useState({ x: -100, y: -100, visible: false })
  const [isPressing, setIsPressing] = useState(false)
  const containerRef = useRef(null)

  // Reset danh sách dấu khi mở modal
  useEffect(() => {
    if (isOpen) {
      setStamps([])
    }
  }, [isOpen])

  // Theo dõi vị trí chuột trong khung
  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      visible: true,
    })
  }

  const handleMouseLeave = () => {
    setMousePos((prev) => ({ ...prev, visible: false }))
  }

  // Đóng dấu khi click chuột vào vùng giấy vàng
  const handleStampClick = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Phát âm thanh dập dấu mộc
    playThumpSound(stampSoundSrc)

    // Chọn ảnh dấu mộc ngẫu nhiên
    let chosenImage = null
    let chosenSvgType = Math.floor(Math.random() * 4)

    if (resolvedStampImages && resolvedStampImages.length > 0) {
      const randIdx = Math.floor(Math.random() * resolvedStampImages.length)
      chosenImage = resolvedStampImages[randIdx]
    }

    const newStamp = {
      id: `${Date.now()}-${Math.random()}`,
      x,
      y,
      image: chosenImage,
      svgType: chosenSvgType,
      rotation: Math.floor(Math.random() * 28 - 14), // Góc xoay ngẫu nhiên từ -14 đến +14 độ
      scale: 0.92 + Math.random() * 0.16, // Kích thước xê dịch nhẹ tự nhiên
    }

    setStamps((prev) => [...prev, newStamp])
  }

  // Xóa toàn bộ dấu để đóng lại
  const handleClear = (e) => {
    e.stopPropagation()
    setStamps([])
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute inset-0 z-40 flex items-center justify-center overflow-hidden bg-ink/90 backdrop-blur-xs select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Nút thoát giao diện (✕) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng giao diện đóng dấu"
            title="Đóng giao diện đóng dấu"
            className="absolute top-4 right-4 z-50 grid h-12 w-12 place-items-center rounded-full border-4 border-ink bg-rose text-ink shadow-chunky transition-transform hover:scale-105 active:translate-y-1 active:shadow-none"
          >
            <X size={28} strokeWidth={3} />
          </button>

          {/* Nút xóa dấu làm lại */}
          <button
            type="button"
            onClick={handleClear}
            aria-label="Xóa hết dấu để đóng lại"
            title="Xóa hết dấu để đóng lại"
            className="absolute top-4 left-4 z-50 inline-flex items-center gap-1.5 rounded-full border-4 border-ink bg-white px-4 py-2 font-display text-sm font-extrabold text-ink shadow-chunky transition-transform hover:scale-105 active:translate-y-1 active:shadow-none"
          >
            <RotateCcw size={18} /> Đóng dấu lại
          </button>

          {/* Dòng chữ hướng dẫn cho bé */}
          <div className="pointer-events-none absolute top-4 left-1/2 z-50 -translate-x-1/2 rounded-full border-2 border-ink bg-lemon/95 px-4 py-1.5 font-display text-xs font-extrabold text-ink shadow-sm sm:text-sm">
            <Sparkles size={16} className="mr-1.5 inline text-grape" />
            Bấm chuột vào trang để dập dấu mộc nhé! ({stamps.length} dấu)
          </div>

          {/* Khung tương tác đóng dấu (vùng màu vàng) */}
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseDown={() => setIsPressing(true)}
            onMouseUp={() => setIsPressing(false)}
            onClick={handleStampClick}
            className="relative h-full w-full cursor-none overflow-hidden bg-[#FBF0A5]"
            style={{
              backgroundImage: resolvedBgImage ? `url(${resolvedBgImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Nếu có video nền của người dùng (tùy chọn) */}
            {resolvedVideoSrc && (
              <video
                src={resolvedVideoSrc}
                autoPlay
                loop
                muted
                playsInline
                className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-90"
              />
            )}

            {/* Các hình ảnh dấu mộc PNG được in lên màn hình khi click */}
            {stamps.map((st) => (
              <motion.div
                key={st.id}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: st.scale, opacity: 0.95 }}
                transition={{ type: 'spring', bounce: 0.5, duration: 0.28 }}
                style={{
                  position: 'absolute',
                  left: st.x,
                  top: st.y,
                  transform: `translate(-50%, -50%) rotate(${st.rotation}deg)`,
                  pointerEvents: 'none',
                }}
                className="h-24 w-24 sm:h-32 sm:w-32"
              >
                {st.image ? (
                  <img
                    src={st.image}
                    alt="Dấu mộc"
                    className="h-full w-full object-contain select-none"
                    onError={(e) => {
                      // Nếu ảnh PNG lỗi thì tự động vẽ dấu SVG thay thế
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <DefaultStampSvg type={st.svgType} />
                )}
              </motion.div>
            ))}

            {/* Con trỏ chuột hình con dấu gỗ di chuyển theo tay bé */}
            {mousePos.visible && (
              <div
                style={{
                  position: 'absolute',
                  left: mousePos.x,
                  top: mousePos.y,
                  pointerEvents: 'none',
                  zIndex: 40,
                }}
              >
                {resolvedCursorImage ? (
                  <img
                    src={resolvedCursorImage}
                    alt=""
                    className="pointer-events-none select-none transition-transform duration-75"
                    style={{
                      width: '72px',
                      height: '72px',
                      transform: `translate(-50%, -75%) ${
                        isPressing ? 'scale(0.88) rotate(-8deg)' : 'scale(1) rotate(-15deg)'
                      }`,
                    }}
                  />
                ) : (
                  <DefaultStampCursor isPressing={isPressing} />
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
