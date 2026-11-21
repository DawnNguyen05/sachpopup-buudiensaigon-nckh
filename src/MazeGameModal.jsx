import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, Sparkles, Trophy, X } from 'lucide-react'
import { resolvePath } from './utils/path'

// Âm thanh tiếng bước chân / pop vui tai bằng Web Audio API
function playStepSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(420, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.06)

    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.08)
  } catch {}
}

// Âm thanh chiến thắng khi lá thư đến Bưu điện Sài Gòn
function playWinSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99] // Đô - Mi - Sol - Đô - Mi - Sol
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.09)
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.09)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.22)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + i * 0.09)
      osc.stop(ctx.currentTime + i * 0.09 + 0.25)
    })
  } catch {}
}

// 4 mẫu hoa văn gạch bông / di sản Sài Gòn vẽ sẵn (dự phòng nếu chưa có ảnh PNG)
function DefaultPatternSvg({ type }) {
  if (type === 0) {
    // Hoa văn 1: Hoa Mai vàng bưu điện
    return (
      <svg viewBox="0 0 40 40" className="h-full w-full select-none">
        <rect x="0" y="0" width="40" height="40" fill="#FFF9D2" stroke="#E67E22" strokeWidth="1" />
        <circle cx="20" cy="12" r="5" fill="#F1C40F" />
        <circle cx="28" cy="20" r="5" fill="#F1C40F" />
        <circle cx="20" cy="28" r="5" fill="#F1C40F" />
        <circle cx="12" cy="20" r="5" fill="#F1C40F" />
        <circle cx="20" cy="20" r="4.5" fill="#E74C3C" />
      </svg>
    )
  }
  if (type === 1) {
    // Hoa văn 2: Hoa Sen ngọc bưu chính
    return (
      <svg viewBox="0 0 40 40" className="h-full w-full select-none">
        <rect x="0" y="0" width="40" height="40" fill="#E8F8F5" stroke="#16A085" strokeWidth="1" />
        <path d="M 20 6 C 14 14 14 26 20 34 C 26 26 26 14 20 6 Z" fill="#1ABC9C" />
        <path d="M 6 20 C 14 14 26 14 34 20 C 26 26 14 26 6 20 Z" fill="#48C9B0" opacity="0.8" />
        <circle cx="20" cy="20" r="4" fill="#F39C12" />
      </svg>
    )
  }
  if (type === 2) {
    // Hoa văn 3: Gạch bông cổ điển Sài Gòn
    return (
      <svg viewBox="0 0 40 40" className="h-full w-full select-none">
        <rect x="0" y="0" width="40" height="40" fill="#EBF5FB" stroke="#2980B9" strokeWidth="1" />
        <rect x="12" y="12" width="16" height="16" transform="rotate(45 20 20)" fill="#3498DB" />
        <circle cx="20" cy="20" r="4" fill="#E74C3C" />
        <circle cx="6" cy="6" r="2.5" fill="#2980B9" />
        <circle cx="34" cy="6" r="2.5" fill="#2980B9" />
        <circle cx="6" cy="34" r="2.5" fill="#2980B9" />
        <circle cx="34" cy="34" r="2.5" fill="#2980B9" />
      </svg>
    )
  }
  // Hoa văn 4: Ngôi sao bưu cục di sản
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full select-none">
      <rect x="0" y="0" width="40" height="40" fill="#FDEDEC" stroke="#C0392B" strokeWidth="1" />
      <polygon points="20,7 23,15 32,15 25,21 28,29 20,24 12,29 15,21 8,15 17,15" fill="#E74C3C" />
      <circle cx="20" cy="20" r="3.5" fill="#F1C40F" />
    </svg>
  )
}

// Hình vẽ nhân vật Lá Thư (dự phòng nếu chưa có ảnh PNG)
function DefaultPlayerEnvelope() {
  return (
    <svg viewBox="0 0 60 48" className="h-full w-full drop-shadow-md select-none">
      <rect x="3" y="5" width="54" height="38" rx="7" fill="#BFEBCB" stroke="#3A3157" strokeWidth="3" />
      <path d="M 5 7 L 30 28 L 55 7" fill="none" stroke="#3A3157" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="30" cy="28" r="6" fill="#FFB5C8" stroke="#3A3157" strokeWidth="2" />
    </svg>
  )
}

// Hình vẽ tòa nhà Bưu điện Sài Gòn (dự phòng nếu chưa có ảnh PNG)
function DefaultPostOffice() {
  return (
    <svg viewBox="0 0 110 70" className="h-full w-full drop-shadow-md select-none">
      <rect x="8" y="24" width="94" height="40" rx="4" fill="#FFE58F" stroke="#3A3157" strokeWidth="3" />
      <polygon points="4,24 55,6 106,24" fill="#E74C3C" stroke="#3A3157" strokeWidth="3" strokeLinejoin="round" />
      <path d="M 44 64 L 44 42 Q 55 33 66 42 L 66 64 Z" fill="#3A3157" />
      <circle cx="55" cy="26" r="8" fill="#FFF" stroke="#3A3157" strokeWidth="2" />
      <line x1="55" y1="26" x2="55" y2="22" stroke="#3A3157" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="55" y1="26" x2="59" y2="26" stroke="#3A3157" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="55" y1="6" x2="55" y2="-3" stroke="#3A3157" strokeWidth="2" strokeLinecap="round" />
      <rect x="55" y="-3" width="12" height="8" fill="#E74C3C" />
      <circle cx="61" cy="1" r="1.8" fill="#F1C40F" />
    </svg>
  )
}

// ==========================================
// THIẾT KẾ MÊ CUNG MỚI 19 CỘT x 11 HÀNG:
// - Tỉ lệ 19:11 chuẩn 1x1 cho từng ô vuông
// - Dàn trải đều toàn khung, nhiều ngã rẽ và vòng lặp phong phú
// - Xuất phát: Góc dưới bên trái (1, 9)
// - Đích đến: Tòa nhà Bưu điện Sài Gòn ở giữa bên phải (17, 5)
// ==========================================
const COLS = 19
const ROWS = 11
const START_POS = { x: 1, y: 9 }
const GOAL_POS = { x: 17, y: 5 }

// Danh sách toàn bộ 97 ô đường đi (đảm bảo kết nối 100%, có nhiều ngã rẽ và ngõ cụt thú vị)
const MAZE_ROADS = new Set([
  '1,1', '2,1', '3,1', '4,1', '5,1', '6,1', '7,1', '9,1', '10,1', '11,1', '13,1', '14,1', '15,1', '16,1', '17,1',
  '3,2', '5,2', '7,2', '9,2', '11,2', '13,2', '17,2',
  '1,3', '2,3', '3,3', '5,3', '6,3', '7,3', '8,3', '9,3', '11,3', '12,3', '13,3', '14,3', '15,3', '17,3',
  '1,4', '3,4', '5,4', '7,4', '15,4', '16,4', '17,4',
  '1,5', '3,5', '4,5', '5,5', '7,5', '9,5', '10,5', '11,5', '13,5', '14,5', '15,5', '17,5',
  '1,6', '3,6', '5,6', '7,6', '9,6', '11,6', '17,6',
  '1,7', '2,7', '3,7', '5,7', '6,7', '7,7', '8,7', '9,7', '11,7', '12,7', '13,7', '14,7', '15,7', '16,7', '17,7',
  '1,8', '3,8', '5,8', '9,8', '17,8',
  '1,9', '2,9', '3,9', '5,9', '6,9', '7,9', '8,9', '9,9', '11,9', '12,9', '13,9', '14,9', '15,9', '16,9', '17,9'
])

// Tự động sinh các đoạn đường nối giữa 2 ô liền kề
const ROAD_SEGMENTS = []
const DIRS = [
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
]
MAZE_ROADS.forEach((posStr) => {
  const [x, y] = posStr.split(',').map(Number)
  DIRS.forEach(({ dx, dy }) => {
    const nextKey = `${x + dx},${y + dy}`
    if (MAZE_ROADS.has(nextKey)) {
      ROAD_SEGMENTS.push({ x1: x, y1: y, x2: x + dx, y2: y + dy })
    }
  })
})

// Thuật toán tìm đường ngắn nhất (BFS) để hỗ trợ bé click/chạm vào ô xa
function findPath(fromPos, toPos) {
  const fromKey = `${fromPos.x},${fromPos.y}`
  const toKey = `${toPos.x},${toPos.y}`
  if (fromKey === toKey || !MAZE_ROADS.has(toKey)) return []

  const queue = [fromKey]
  const parent = { [fromKey]: null }
  const visited = new Set([fromKey])

  while (queue.length > 0) {
    const curr = queue.shift()
    if (curr === toKey) break
    const [cx, cy] = curr.split(',').map(Number)
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const nx = cx + dx
      const ny = cy + dy
      const nextKey = `${nx},${ny}`
      if (MAZE_ROADS.has(nextKey) && !visited.has(nextKey)) {
        visited.add(nextKey)
        parent[nextKey] = curr
        queue.push(nextKey)
      }
    }
  }

  if (!parent[toKey]) return []
  const path = []
  let curr = toKey
  while (curr) {
    const [px, py] = curr.split(',').map(Number)
    path.unshift({ x: px, y: py })
    curr = parent[curr]
  }
  return path.slice(1) // Bỏ ô hiện tại
}

export default function MazeGameModal({
  isOpen,
  onClose,
  playerImage,
  destinationImage,
  patternImages = [],
  title = 'Đường đến Bưu điện',
}) {
  const resolvedPlayerImage = resolvePath(playerImage)
  const resolvedDestinationImage = resolvePath(destinationImage)
  const resolvedPatternImages = (patternImages || []).map(resolvePath)

  const [playerPos, setPlayerPos] = useState(START_POS)
  // Ô xuất phát (1, 9) có sẵn hoa văn 1 dưới chân
  const [visited, setVisited] = useState({ [`${START_POS.x},${START_POS.y}`]: 0 })
  const [stepCount, setStepCount] = useState(0)
  const [hasWon, setHasWon] = useState(false)

  const autoMoveTimerRef = useRef(null)
  const touchStartRef = useRef(null)

  // Khởi động lại game
  const resetGame = useCallback(() => {
    if (autoMoveTimerRef.current) {
      clearInterval(autoMoveTimerRef.current)
      autoMoveTimerRef.current = null
    }
    setPlayerPos(START_POS)
    setVisited({ [`${START_POS.x},${START_POS.y}`]: 0 })
    setStepCount(0)
    setHasWon(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      resetGame()
    }
    return () => {
      if (autoMoveTimerRef.current) {
        clearInterval(autoMoveTimerRef.current)
      }
    }
  }, [isOpen, resetGame])

  // Hàm di chuyển nhân vật 1 bước
  const tryMove = useCallback(
    (dx, dy) => {
      if (hasWon) return false
      const nextX = playerPos.x + dx
      const nextY = playerPos.y + dy
      const nextKey = `${nextX},${nextY}`

      if (MAZE_ROADS.has(nextKey)) {
        playStepSound()

        setPlayerPos({ x: nextX, y: nextY })
        setStepCount((prevCount) => {
          const nextCount = prevCount + 1
          setVisited((prevVisited) => {
            // Nếu ô chưa có hoa văn thì gán hoa văn theo chu kỳ 1 -> 2 -> 3 -> 4
            if (prevVisited[nextKey] !== undefined) return prevVisited
            const patternIdx = nextCount % 4
            return { ...prevVisited, [nextKey]: patternIdx }
          })
          return nextCount
        })

        // Kiểm tra về đích Bưu điện Sài Gòn
        if (nextX === GOAL_POS.x && nextY === GOAL_POS.y) {
          setHasWon(true)
          playWinSound()
          if (autoMoveTimerRef.current) {
            clearInterval(autoMoveTimerRef.current)
            autoMoveTimerRef.current = null
          }
        }
        return true
      }
      return false
    },
    [playerPos, hasWon]
  )

  // Xử lý khi click vào bất kỳ ô đường nào trong mê cung
  const handleCellClick = useCallback(
    (targetX, targetY) => {
      if (hasWon) return
      if (autoMoveTimerRef.current) {
        clearInterval(autoMoveTimerRef.current)
        autoMoveTimerRef.current = null
      }

      const dx = targetX - playerPos.x
      const dy = targetY - playerPos.y

      // Nếu click ô liền kề: di chuyển 1 bước ngay lập tức
      if (Math.abs(dx) + Math.abs(dy) === 1) {
        tryMove(dx, dy)
        return
      }

      // Nếu click ô xa hơn: tự động bước từng bước theo đường ngắn nhất
      const path = findPath(playerPos, { x: targetX, y: targetY })
      if (path.length === 0) return

      let index = 0
      autoMoveTimerRef.current = setInterval(() => {
        if (index >= path.length) {
          clearInterval(autoMoveTimerRef.current)
          autoMoveTimerRef.current = null
          return
        }
        const nextCell = path[index]
        setPlayerPos((currentPos) => {
          const stepDx = nextCell.x - currentPos.x
          const stepDy = nextCell.y - currentPos.y
          if (Math.abs(stepDx) + Math.abs(stepDy) === 1) {
            playStepSound()
            setStepCount((prevCount) => {
              const nextCount = prevCount + 1
              const cellKey = `${nextCell.x},${nextCell.y}`
              setVisited((prevVisited) => {
                if (prevVisited[cellKey] !== undefined) return prevVisited
                return { ...prevVisited, [cellKey]: nextCount % 4 }
              })
              return nextCount
            })
            if (nextCell.x === GOAL_POS.x && nextCell.y === GOAL_POS.y) {
              setHasWon(true)
              playWinSound()
              clearInterval(autoMoveTimerRef.current)
              autoMoveTimerRef.current = null
            }
            return nextCell
          }
          return currentPos
        })
        index++
      }, 110)
    },
    [playerPos, hasWon, tryMove]
  )

  // Điều khiển bằng bàn phím (Mũi tên hoặc WASD)
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }
      if (autoMoveTimerRef.current) {
        clearInterval(autoMoveTimerRef.current)
        autoMoveTimerRef.current = null
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        tryMove(0, -1)
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        tryMove(0, 1)
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        tryMove(-1, 0)
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        tryMove(1, 0)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, tryMove])

  // Điều khiển vuốt cảm ứng trên điện thoại / máy tính bảng
  const handleTouchStart = (e) => {
    const t = e.touches[0]
    touchStartRef.current = { x: t.clientX, y: t.clientY }
  }

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStartRef.current.x
    const dy = t.clientY - touchStartRef.current.y
    touchStartRef.current = null

    if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
      if (autoMoveTimerRef.current) {
        clearInterval(autoMoveTimerRef.current)
        autoMoveTimerRef.current = null
      }
      if (Math.abs(dx) > Math.abs(dy)) {
        tryMove(dx > 0 ? 1 : -1, 0)
      } else {
        tryMove(0, dy > 0 ? 1 : -1)
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="absolute inset-0 z-40 flex items-center justify-center overflow-hidden bg-ink/90 backdrop-blur-xs select-none p-2 sm:p-4"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Nút đóng giao diện (✕) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng trò chơi mê cung"
            title="Đóng trò chơi mê cung"
            className="absolute top-3 right-3 z-50 grid h-11 w-11 place-items-center rounded-full border-4 border-ink bg-rose text-ink shadow-chunky transition-transform hover:scale-105 active:translate-y-1 active:shadow-none sm:top-4 sm:right-4 sm:h-12 sm:w-12"
          >
            <X size={26} strokeWidth={3} />
          </button>

          {/* Nút chơi lại từ đầu */}
          <button
            type="button"
            onClick={resetGame}
            aria-label="Chơi lại từ đầu"
            title="Chơi lại từ đầu"
            className="absolute top-3 left-3 z-50 inline-flex items-center gap-1.5 rounded-full border-4 border-ink bg-white px-3.5 py-1.5 font-display text-xs font-black text-ink shadow-chunky transition-transform hover:scale-105 active:translate-y-1 active:shadow-none sm:top-4 sm:left-4 sm:px-4 sm:py-2 sm:text-sm"
          >
            <RotateCcw size={17} /> Chơi lại
          </button>

          {/* Tiêu đề & Đếm số bước đi */}
          <div className="pointer-events-none absolute top-3 left-1/2 z-50 -translate-x-1/2 rounded-full border-2 border-ink bg-lemon px-4 py-1 font-display text-xs font-black text-ink shadow-sm sm:top-4 sm:px-6 sm:py-1.5 sm:text-sm">
            <Sparkles size={16} className="mr-1.5 inline text-grape" />
            Dẫn lá thư đến Bưu điện Sài Gòn nhé! ({stepCount} bước)
          </div>

          {/* Khung Mê Cung Tỉ Lệ Chuẩn 19:11 (Nền vàng pastel y hệt ảnh thiết kế) */}
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-[2.5rem] border-4 border-ink bg-[#FEF3A6] shadow-chunky"
            style={{ aspectRatio: `${COLS} / ${ROWS}` }}
          >
            {/* Lớp vẽ Đường Mê Cung bằng SVG (Nền đường xanh da trời + vạch trắng nét đứt) */}
            <svg
              viewBox={`0 0 ${COLS * 100} ${ROWS * 100}`}
              className="absolute inset-0 h-full w-full pointer-events-none"
            >
              {/* Vẽ thân đường màu xanh #4A9DE8 liền mạch bo tròn tại các góc */}
              {ROAD_SEGMENTS.map((seg, idx) => (
                <line
                  key={`road-bg-${idx}`}
                  x1={seg.x1 * 100 + 50}
                  y1={seg.y1 * 100 + 50}
                  x2={seg.x2 * 100 + 50}
                  y2={seg.y2 * 100 + 50}
                  stroke="#4A9DE8"
                  strokeWidth="100"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {/* Vẽ các đĩa tròn tại mỗi ô đường để đường luôn liền lạc */}
              {Array.from(MAZE_ROADS).map((posKey) => {
                const [x, y] = posKey.split(',').map(Number)
                return (
                  <circle
                    key={`road-circle-${posKey}`}
                    cx={x * 100 + 50}
                    cy={y * 100 + 50}
                    r="50"
                    fill="#4A9DE8"
                  />
                )
              })}

              {/* Vạch kẻ trắng nét đứt chạy dọc chính giữa tim đường */}
              {ROAD_SEGMENTS.map((seg, idx) => (
                <line
                  key={`road-dash-${idx}`}
                  x1={seg.x1 * 100 + 50}
                  y1={seg.y1 * 100 + 50}
                  x2={seg.x2 * 100 + 50}
                  y2={seg.y2 * 100 + 50}
                  stroke="#FFFFFF"
                  strokeWidth="6"
                  strokeDasharray="14 14"
                  strokeLinecap="round"
                />
              ))}
            </svg>

            {/* Lưới các ô đường đi (Kích thước 1x1 chuẩn xác, chạm sát mép nhau không có khoảng hở) */}
            {Array.from(MAZE_ROADS).map((posKey) => {
              const [x, y] = posKey.split(',').map(Number)
              const patternIdx = visited[posKey]
              const hasPattern = patternIdx !== undefined

              return (
                <div
                  key={`cell-${posKey}`}
                  onClick={() => handleCellClick(x, y)}
                  style={{
                    position: 'absolute',
                    left: `${(x / COLS) * 100}%`,
                    top: `${(y / ROWS) * 100}%`,
                    width: `${(100 / COLS)}%`,
                    height: `${(100 / ROWS)}%`,
                  }}
                  className="z-10 grid place-items-center cursor-pointer select-none"
                >
                  {/* Hoa văn kích thước 1x1 sát cạnh nhau hoàn toàn khi bước qua */}
                  {hasPattern && (
                    <motion.div
                      initial={{ scale: 0.6 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.18 }}
                      className="h-full w-full overflow-hidden"
                    >
                      {resolvedPatternImages[patternIdx] ? (
                        <img
                          src={resolvedPatternImages[patternIdx]}
                          alt=""
                          className="h-full w-full object-cover select-none pointer-events-none"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <DefaultPatternSvg type={patternIdx} />
                      )}
                    </motion.div>
                  )}
                </div>
              )}
            )}

            {/* ĐÍCH ĐẾN: TÒA NHÀ BƯU ĐIỆN SÀI GÒN Ở GIỮA PHẢI (17, 5) */}
            {(() => {
              const centerX = ((GOAL_POS.x + 0.5) / COLS) * 100
              const centerY = ((GOAL_POS.y + 0.5) / ROWS) * 100
              return (
                <div
                  style={{
                    position: 'absolute',
                    left: `${centerX}%`,
                    top: `${centerY}%`,
                    transform: 'translate(-50%, -50%)',
                    width: `${(100 / COLS) * 2.5}%`,
                    height: `${(100 / ROWS) * 1.8}%`,
                  }}
                  className="z-20 grid place-items-center pointer-events-none drop-shadow-md"
                >
                  {resolvedDestinationImage ? (
                    <img
                      src={resolvedDestinationImage}
                      alt="Bưu điện Sài Gòn"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <DefaultPostOffice />
                  )}
                </div>
              )
            })()}

            {/* NHÂN VẬT: LÁ THƯ DI CHUYỂN TỪNG Ô */}
            {(() => {
              const leftPercent = (playerPos.x / COLS) * 100
              const topPercent = (playerPos.y / ROWS) * 100
              return (
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                  style={{
                    position: 'absolute',
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    width: `${(100 / COLS)}%`,
                    height: `${(100 / ROWS)}%`,
                  }}
                  className="z-30 grid place-items-center pointer-events-none"
                >
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                    className="h-full w-full scale-110"
                  >
                    {resolvedPlayerImage ? (
                      <img
                        src={resolvedPlayerImage}
                        alt="Lá thư"
                        className="h-full w-full object-contain drop-shadow-md"
                      />
                    ) : (
                      <DefaultPlayerEnvelope />
                    )}
                  </motion.div>
                </motion.div>
              )
            })()}

            {/* Hộp thoại Chúc mừng Chiến Thắng khi về đích */}
            <AnimatePresence>
              {hasWon && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 z-40 flex items-center justify-center bg-ink/65 backdrop-blur-xs p-4"
                >
                  <div className="flex max-w-sm flex-col items-center rounded-3xl border-4 border-ink bg-paper p-6 text-center text-ink shadow-chunky">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl border-4 border-ink bg-lemon shadow-chunkySm">
                      <Trophy size={36} className="text-amber-600 animate-bounce" />
                    </div>
                    <h3 className="mt-3 font-display text-2xl font-black">
                      Xuất Sắc!
                    </h3>
                    <p className="mt-1 font-semibold text-sm">
                      Lá thư đã vượt qua mê cung và đến được Bưu điện Sài Gòn sau{' '}
                      <span className="font-extrabold text-grape">{stepCount}</span> bước đi!
                    </p>
                    <div className="mt-5 flex gap-2">
                      <button
                        type="button"
                        onClick={resetGame}
                        className="btn-big bg-lemon !px-4 !py-2 !text-sm"
                      >
                        <RotateCcw size={16} /> Chơi lại
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="btn-big bg-mint !px-4 !py-2 !text-sm"
                      >
                        Tiếp tục đọc
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
