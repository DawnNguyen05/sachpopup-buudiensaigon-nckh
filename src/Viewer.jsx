import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Mail,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import QuizPage from './QuizPage'
import SettingsModal from './SettingsModal'
import StampGameModal from './StampGameModal'
import VideoQuizOverlay from './VideoQuizOverlay'
import MazeGameModal from './MazeGameModal'
import { resolvePath } from './utils/path'

const normalizePath = resolvePath

export default function Viewer({ story, ready = true, onBack }) {
  const total = story.pages.length

  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [ended, setEnded] = useState(false)
  const [failed, setFailed] = useState(false)

  // Cài đặt âm thanh & trải nghiệm (Settings)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [masterVolume, setMasterVolume] = useState(1.0)
  const [bgmEnabled, setBgmEnabled] = useState(true)
  const [bgmVolume, setBgmVolume] = useState(
    typeof story.bgmVolume === 'number' ? story.bgmVolume : 0.35
  )
  const [narratorEnabled, setNarratorEnabled] = useState(true)
  const [narratorVolume, setNarratorVolume] = useState(1.0)
  const [videoVolume, setVideoVolume] = useState(1.0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const [autoNext, setAutoNext] = useState(false)

  // Trạng thái cho nhạc nền (BGM)
  const [bgmStarted, setBgmStarted] = useState(false)
  const bgmAudioRef = useRef(null)
  const bgmSrc = normalizePath(story.bgm || story.pages?.[0]?.bgm || '/audio/bgm.mp3')

  // Trạng thái cho âm thanh người dẫn (MP3 riêng biệt với video)
  const [narratorPlaying, setNarratorPlaying] = useState(false)
  const [narratorFailed, setNarratorFailed] = useState(false)
  const [showAudioHint, setShowAudioHint] = useState(false)
  const audioRef = useRef(null)
  const audioTriggeredRef = useRef(false)

  // Trạng thái cho lá thư bí mật (Hotspot) ở Trang 1
  const [hotspotVisible, setHotspotVisible] = useState(false)
  const [letterOpen, setLetterOpen] = useState(false)
  const [letterFailed, setLetterFailed] = useState(false)
  const letterVideoRef = useRef(null)

  // Trạng thái cho trò chơi Đóng Dấu Mộc (Stamp Game)
  const [stampGameOpen, setStampGameOpen] = useState(false)

  // Trạng thái cho câu hỏi trong video ở Trang 4 (Video Quiz ABCD)
  const [showVideoQuiz, setShowVideoQuiz] = useState(false)
  const [videoQuizSolved, setVideoQuizSolved] = useState(false)

  // Trạng thái cho Mini Game Mê Cung (Maze Game)
  const [mazeButtonVisible, setMazeButtonVisible] = useState(false)
  const [mazeGameOpen, setMazeGameOpen] = useState(false)

  // Trạng thái đệm video khi mạng chậm
  const [videoBuffering, setVideoBuffering] = useState(false)

  const videoRef = useRef(null)
  const page = story.pages[index]
  const nextPage = story.pages[index + 1]
  const isQuiz = page?.type === 'quiz' || Boolean(page?.quiz)
  const videoQuiz = page?.videoQuiz
  const mazeGame = page?.mazeGame
  const videoSrc = normalizePath(page?.video)
  const audioSrc = normalizePath(page?.audio)
  const nextVideoSrc = normalizePath(nextPage?.video)
  const nextAudioSrc = normalizePath(nextPage?.audio)
  const audioStartAt = Number(page?.audioStartAt ?? 0)
  const hotspot = page?.hotspot
  const hotspotVideoSrc = normalizePath(hotspot?.video)
  const stampHotspot = page?.stampHotspot || (page?.hotspot?.type === 'stamp' ? page?.hotspot : null)

  // Âm lượng thực tế áp dụng cho từng nguồn âm thanh
  const effectiveBgmVolume =
    muted || !bgmEnabled
      ? 0
      : Math.min(
          1,
          Math.max(
            0,
            masterVolume * bgmVolume * (letterOpen || stampGameOpen || mazeGameOpen ? 0.3 : 1.0)
          )
        )

  const effectiveNarratorVolume =
    muted || !narratorEnabled ? 0 : Math.min(1, Math.max(0, masterVolume * narratorVolume))

  const effectiveVideoVolume = muted ? 0 : Math.min(1, Math.max(0, masterVolume * videoVolume))

  // Cập nhật âm lượng và tốc độ phát vào các phần tử Media
  useEffect(() => {
    if (bgmAudioRef.current) {
      bgmAudioRef.current.volume = effectiveBgmVolume
    }
  }, [effectiveBgmVolume])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = effectiveNarratorVolume
      audioRef.current.playbackRate = playbackSpeed
    }
  }, [effectiveNarratorVolume, playbackSpeed])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = effectiveVideoVolume
      videoRef.current.playbackRate = playbackSpeed
    }
  }, [effectiveVideoVolume, playbackSpeed])

  useEffect(() => {
    if (letterVideoRef.current) {
      letterVideoRef.current.volume = effectiveVideoVolume
      letterVideoRef.current.playbackRate = playbackSpeed
    }
  }, [effectiveVideoVolume, playbackSpeed, letterOpen])

  // Hàm phát nhạc nền BGM (có xử lý an toàn Autoplay của trình duyệt)
  const startBgm = useCallback(() => {
    const bgm = bgmAudioRef.current
    if (!bgm || !bgmSrc || !bgmEnabled) return Promise.resolve(false)
    bgm.volume = effectiveBgmVolume
    return bgm
      .play()
      .then(() => {
        setBgmStarted(true)
        return true
      })
      .catch(() => false)
  }, [bgmSrc, bgmEnabled, effectiveBgmVolume])

  // Tự động kích hoạt BGM khi vào trang sách, tự động mở khóa ngay trên cú click đầu tiên nếu bị chặn
  useEffect(() => {
    if (!ready || bgmStarted || !bgmEnabled) return

    const tryStart = () => {
      startBgm().then((ok) => {
        if (ok) removeListeners()
      })
    }

    const removeListeners = () => {
      window.removeEventListener('pointerdown', tryStart)
      window.removeEventListener('click', tryStart)
      window.removeEventListener('keydown', tryStart)
    }

    tryStart()

    window.addEventListener('pointerdown', tryStart, { passive: true })
    window.addEventListener('click', tryStart, { passive: true })
    window.addEventListener('keydown', tryStart, { passive: true })

    return removeListeners
  }, [ready, bgmStarted, bgmEnabled, startBgm])

  // Khi người dùng bật/tắt BGM từ Settings
  useEffect(() => {
    const bgm = bgmAudioRef.current
    if (!bgm) return
    if (bgmEnabled && ready && !muted) {
      bgm.volume = effectiveBgmVolume
      bgm.play().then(() => setBgmStarted(true)).catch(() => {})
    } else {
      bgm.pause()
    }
  }, [bgmEnabled, ready, muted, effectiveBgmVolume])

  // Dọn dẹp dừng nhạc nền khi rời trang sách quay về Trang chủ
  useEffect(() => {
    return () => {
      if (bgmAudioRef.current) {
        bgmAudioRef.current.pause()
        bgmAudioRef.current.currentTime = 0
      }
    }
  }, [])

  // Đặt lại cài đặt âm thanh về mặc định
  const handleResetSettings = () => {
    setMasterVolume(1.0)
    setBgmEnabled(true)
    setBgmVolume(typeof story.bgmVolume === 'number' ? story.bgmVolume : 0.35)
    setNarratorEnabled(true)
    setNarratorVolume(1.0)
    setVideoVolume(1.0)
    setPlaybackSpeed(1.0)
    setAutoNext(false)
  }

  // Reset trạng thái khi chuyển trang
  useEffect(() => {
    setEnded(false)
    setFailed(!videoSrc)
    setNarratorPlaying(false)
    setNarratorFailed(false)
    setShowAudioHint(false)
    audioTriggeredRef.current = false

    setLetterOpen(false)
    setLetterFailed(false)
    setStampGameOpen(false)
    setMazeGameOpen(false)
    setShowVideoQuiz(false)
    setVideoQuizSolved(false)
    setVideoBuffering(false)
    // Nếu video chưa có hoặc appearAt <= 0 thì hiện sẵn vùng bấm lá thư / nút mini game để dễ kiểm tra
    setHotspotVisible(!videoSrc || Number(hotspot?.appearAt ?? 0) <= 0)
    setMazeButtonVisible(!videoSrc || Number(mazeGame?.appearAt ?? 0) <= 0)

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [index, videoSrc, hotspot?.appearAt, mazeGame?.appearAt])

  // Hàm phát âm thanh người dẫn (MP3)
  const playNarrator = useCallback(
    (isManual = false) => {
      if (!audioSrc || !narratorEnabled) {
        if (isManual && !audioSrc) setShowAudioHint(true)
        return
      }
      const a = audioRef.current
      if (!a) return
      setShowAudioHint(false)
      a.currentTime = 0
      a.volume = effectiveNarratorVolume
      a.playbackRate = playbackSpeed
      a.play().catch(() => {
        if (isManual) setShowAudioHint(true)
      })
    },
    [audioSrc, narratorEnabled, effectiveNarratorVolume, playbackSpeed]
  )

  // Điều khiển video chính khi vào trang (và tự động khởi động nhạc nền ở trang 1)
  useEffect(() => {
    const v = videoRef.current
    if (!v || isQuiz) return
    if (ready && !letterOpen && !stampGameOpen && !mazeGameOpen) {
      v.play()
        .then(() => {
          if (index === 0 && !bgmStarted) {
            startBgm()
          }
        })
        .catch(() => {})
    } else {
      v.pause()
      if (!ready) v.currentTime = 0
    }
  }, [ready, index, isQuiz, letterOpen, stampGameOpen, mazeGameOpen, bgmStarted, startBgm])

  // Tự động phát MP3 người dẫn ở các trang KHÔNG phải video (ví dụ Trang 3 Quiz) hoặc khi trang chưa có video
  useEffect(() => {
    if (!ready || !audioSrc) return
    if (!isQuiz && videoSrc && !failed) return // Trang có video sẽ kích hoạt theo số giây của video

    const timer = setTimeout(() => {
      if (!audioTriggeredRef.current) {
        audioTriggeredRef.current = true
        playNarrator(false)
      }
    }, Math.max(0, audioStartAt * 1000))

    return () => clearTimeout(timer)
  }, [ready, index, isQuiz, videoSrc, failed, audioSrc, audioStartAt, playNarrator])

  // Theo dõi số giây của video để:
  // 1) Phát MP3 người dẫn đúng số giây (audioStartAt)
  // 2) Hiện vùng bấm lá thư đúng số giây (hotspot.appearAt)
  const handleTimeUpdate = () => {
    const v = videoRef.current
    if (!v) return
    const current = v.currentTime

    if (audioSrc && !audioTriggeredRef.current && current >= audioStartAt) {
      audioTriggeredRef.current = true
      playNarrator(false)
    }

    if (hotspot && !hotspotVisible && current >= Number(hotspot.appearAt ?? 0)) {
      setHotspotVisible(true)
    }

    // Hiện nút "Chơi trò chơi" mê cung tại giây thứ appearAt (mặc định 3.5s)
    if (
      mazeGame &&
      !mazeButtonVisible &&
      current >= (Number(mazeGame.appearAt) || 3.5)
    ) {
      setMazeButtonVisible(true)
    }

    // Dừng video tại giây thứ pauseAt (mặc định 11s) để hiện câu hỏi ABCD
    if (
      videoQuiz &&
      !videoQuizSolved &&
      !showVideoQuiz &&
      current >= (Number(videoQuiz.pauseAt) || 11)
    ) {
      v.pause()
      setShowVideoQuiz(true)
    }
  }

  const handleResumeFromQuiz = useCallback(() => {
    setShowVideoQuiz(false)
    setVideoQuizSolved(true)
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [])

  const go = useCallback((d) => setIndex((i) => Math.min(total - 1, Math.max(0, i + d))), [total])

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v || showVideoQuiz) return
    if (!bgmStarted && bgmEnabled && ready) {
      startBgm()
    }
    if (ended) {
      v.currentTime = 0
      setEnded(false)
      audioTriggeredRef.current = false
      setShowVideoQuiz(false)
      setVideoQuizSolved(false)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      v.play()
    } else if (v.paused) {
      v.play()
    } else {
      v.pause()
    }
  }, [ended, bgmStarted, bgmEnabled, ready, startBgm, showVideoQuiz])

  const toggleMute = () => {
    const nextMuted = !muted
    setMuted(nextMuted)
    if (!nextMuted && !bgmStarted && bgmEnabled && ready) {
      startBgm()
    }
  }

  // Mở / đóng lá thư bí mật ở Trang 1
  const handleOpenLetter = (e) => {
    e.stopPropagation()
    if (videoRef.current) videoRef.current.pause()
    if (audioRef.current) audioRef.current.pause()
    setLetterFailed(!hotspotVideoSrc)
    setLetterOpen(true)
  }

  const handleCloseLetter = (e) => {
    if (e) e.stopPropagation()
    if (letterVideoRef.current) {
      letterVideoRef.current.pause()
    }
    setLetterOpen(false)
  }

  // Phím tắt: ← →, Space và Escape (để đóng lá thư hoặc đóng dấu)
  useEffect(() => {
    if (!ready) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (mazeGameOpen) {
          setMazeGameOpen(false)
          return
        }
        if (stampGameOpen) {
          setStampGameOpen(false)
          return
        }
        if (letterOpen) {
          handleCloseLetter()
          return
        }
        if (isSettingsOpen) {
          setIsSettingsOpen(false)
          return
        }
      }
      if (letterOpen || stampGameOpen || isSettingsOpen || mazeGameOpen) return
      if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === ' ' && e.target === document.body && !isQuiz) {
        e.preventDefault()
        togglePlay()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, togglePlay, ready, isQuiz, letterOpen, stampGameOpen, isSettingsOpen, mazeGameOpen])

  const handleEnded = () => {
    setEnded(true)
    setPlaying(false)
    // Khi video kết thúc, đảm bảo lá thư (nếu có) hiện vùng bấm và MP3 (nếu đặt giây lớn hơn thời lượng video) được phát
    if (hotspot) setHotspotVisible(true)
    if (mazeGame) setMazeButtonVisible(true)
    if (audioSrc && !audioTriggeredRef.current) {
      audioTriggeredRef.current = true
      playNarrator(false)
    }
    if (autoNext && index < total - 1 && !letterOpen) setTimeout(() => go(1), 900)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-14">
      {/* Audio nhạc nền (BGM) phát lặp lại liên tục từ khi video trang 1 bắt đầu */}
      {bgmSrc && (
        <audio
          ref={bgmAudioRef}
          src={bgmSrc}
          loop
          preload="auto"
          muted={muted}
        />
      )}

      {/* Thẻ audio ẩn chuyên phát giọng người dẫn MP3 riêng biệt với âm thanh trong video */}
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="auto"
          muted={muted}
          onPlay={() => setNarratorPlaying(true)}
          onPause={() => setNarratorPlaying(false)}
          onEnded={() => setNarratorPlaying(false)}
          onError={() => {
            setNarratorPlaying(false)
            setNarratorFailed(true)
          }}
        />
      )}

      <div className="flex items-center justify-between py-4">
        <button onClick={onBack} className="btn-big bg-white !px-4 !py-2 !text-base">
          <ArrowLeft size={20} aria-hidden /> Trang chủ
        </button>
        <h1 className="font-display text-xl font-extrabold sm:text-2xl">{story.title}</h1>
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="btn-big bg-lemon !px-4 !py-2 !text-base shadow-chunkySm hover:scale-105 active:translate-y-1"
          aria-label="Cài đặt câu chuyện"
          title="Cài đặt câu chuyện"
        >
          <Settings size={20} aria-hidden /> Cài đặt
        </button>
      </div>

      <div className="relative aspect-video overflow-hidden rounded-[2rem] border-4 border-ink bg-ink shadow-chunky">
        <AnimatePresence mode="wait">
          <motion.div
            key={page.id}
            className="absolute inset-0"
            initial={{ opacity: 0, x: 40, rotateY: -12 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: -40, rotateY: 12 }}
            transition={{ duration: 0.3 }}
            style={{ transformPerspective: 1000 }}
          >
            {isQuiz ? (
              <QuizPage page={page} />
            ) : failed ? (
              <div className="grid h-full place-items-center p-6 text-center" style={{ background: story.color }}>
                <div>
                  <div className="text-7xl">{story.emoji}</div>
                  <p className="mt-3 font-display text-2xl font-bold">Video của trang này chưa có</p>
                  <p className="mt-1 font-semibold">
                    Hãy đặt file vào <code className="rounded bg-white/70 px-1">public{videoSrc || '/videos/trang-1.mp4'}</code>
                  </p>
                </div>
              </div>
            ) : (
              <video
                ref={videoRef}
                src={videoSrc}
                poster={page.poster}
                className="h-full w-full object-contain"
                autoPlay={ready}
                playsInline
                preload="auto"
                muted={muted}
                onTimeUpdate={handleTimeUpdate}
                onWaiting={() => setVideoBuffering(true)}
                onPlaying={() => {
                  setVideoBuffering(false)
                  setPlaying(true)
                  if (index === 0 && !bgmStarted) {
                    startBgm()
                  }
                }}
                onCanPlay={() => setVideoBuffering(false)}
                onPause={() => setPlaying(false)}
                onEnded={handleEnded}
                onError={() => {
                  setFailed(true)
                  setVideoBuffering(false)
                  if (hotspot) setHotspotVisible(true)
                }}
                onClick={togglePlay}
              />
            )}

            {/* Thông báo đang tải video nhẹ nhàng khi mạng yếu / đang đệm */}
            <AnimatePresence>
              {videoBuffering && !failed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-ink/35 backdrop-blur-[2px]"
                >
                  <div className="flex items-center gap-2 rounded-full border-2 border-ink bg-lemon px-4 py-2 font-display text-sm font-black text-ink shadow-chunkySm">
                    <Sparkles size={18} className="animate-spin text-grape" />
                    Đang tải chuyển động...
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Kỹ thuật Tải trước thông minh (Preload): Âm thầm tải video & audio trang tiếp theo để lật trang là phát ngay */}
            {nextVideoSrc && (
              <video
                src={nextVideoSrc}
                preload="auto"
                muted
                playsInline
                className="pointer-events-none hidden"
                style={{ display: 'none' }}
              />
            )}
            {nextAudioSrc && (
              <audio
                src={nextAudioSrc}
                preload="auto"
                muted
                className="hidden"
              />
            )}

            {/* Lớp hiển thị Câu hỏi Trả lời ABCD trong Video (Trang 4) */}
            <AnimatePresence>
              {showVideoQuiz && videoQuiz && (
                <VideoQuizOverlay
                  quiz={videoQuiz}
                  onResume={handleResumeFromQuiz}
                />
              )}
            </AnimatePresence>

            {/* Vùng tương tác bấm vào Lá Thư (Hotspot) ở góc trái dưới Trang 1 */}
            {hotspot && hotspotVisible && !letterOpen && (
              <motion.button
                type="button"
                onClick={handleOpenLetter}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: [1, 1.05, 1] }}
                transition={{
                  opacity: { duration: 0.4 },
                  scale: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
                }}
                style={{
                  left: hotspot.left || '6.5%',
                  top: hotspot.top || '66.5%',
                  width: hotspot.width || '14%',
                  height: hotspot.height || '21.5%',
                  rotate: `${hotspot.rotate ?? -18}deg`,
                }}
                aria-label={hotspot.label || 'Mở lá thư bí mật'}
                title={hotspot.label || 'Bấm vào lá thư để mở nội dung bí mật'}
                className="group absolute z-20 cursor-pointer rounded-xl border-2 border-dashed border-amber-400/80 bg-amber-300/15 shadow-[0_0_20px_rgba(251,191,36,0.45)] transition-all hover:border-solid hover:border-amber-300 hover:bg-amber-300/30"
              >
                <span className="pointer-events-none absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-lemon text-ink shadow-md transition-transform group-hover:scale-110">
                  <Sparkles size={16} />
                </span>
                <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-ink bg-white/95 px-2.5 py-0.5 font-display text-xs font-extrabold text-ink opacity-0 shadow-sm transition-opacity group-hover:opacity-100 sm:text-sm">
                  <Mail size={13} className="mr-1 inline" />
                  Mở thư
                </span>
              </motion.button>
            )}

            {/* Lớp hiển thị Video Mở Lá Thư + Nút dấu X để đóng lá thư */}
            <AnimatePresence>
              {letterOpen && hotspot && (
                <motion.div
                  key="letter-modal"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="absolute inset-0 z-30 flex items-center justify-center bg-ink/90 backdrop-blur-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Nút dấu X đóng lá thư ở góc trên phải */}
                  <button
                    type="button"
                    onClick={handleCloseLetter}
                    aria-label="Đóng lá thư"
                    title="Đóng lá thư"
                    className="absolute top-4 right-4 z-40 grid h-12 w-12 place-items-center rounded-full border-4 border-ink bg-rose text-ink shadow-chunkySm transition-transform hover:scale-105 active:translate-y-1 active:shadow-none"
                  >
                    <X size={28} strokeWidth={3} />
                  </button>

                  {letterFailed ? (
                    <div className="mx-6 max-w-lg rounded-3xl border-4 border-ink bg-paper p-6 text-center text-ink shadow-chunky">
                      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border-4 border-ink bg-lemon">
                        <Mail size={34} />
                      </div>
                      <h3 className="mt-4 font-display text-2xl font-extrabold">
                        Nội dung lá thư bí mật
                      </h3>
                      <p className="mt-2 font-semibold">
                        Để hiện video mở lá thư, bạn hãy đặt file video vào:{' '}
                        <code className="rounded bg-lemon px-1.5 py-0.5 font-bold">
                          public{hotspotVideoSrc || '/videos/mo-la-thu.mp4'}
                        </code>
                      </p>
                    </div>
                  ) : (
                    <video
                      ref={letterVideoRef}
                      src={hotspotVideoSrc}
                      className="h-full w-full object-contain"
                      autoPlay
                      playsInline
                      preload="auto"
                      muted={muted}
                      onError={() => setLetterFailed(true)}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Vùng tương tác bấm vào Con Dấu Mộc (Stamp Hotspot) */}
            {stampHotspot && !stampGameOpen && (
              <motion.button
                type="button"
                onClick={() => {
                  if (videoRef.current) videoRef.current.pause()
                  if (audioRef.current) audioRef.current.pause()
                  setStampGameOpen(true)
                }}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{
                  opacity: 1,
                  scale: [1, 1.08, 1],
                  rotate: [
                    stampHotspot.rotate ?? 12,
                    (stampHotspot.rotate ?? 12) - 6,
                    stampHotspot.rotate ?? 12,
                  ],
                }}
                transition={{
                  opacity: { duration: 0.4 },
                  scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                  rotate: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                }}
                style={{
                  left: stampHotspot.left || '86%',
                  top: stampHotspot.top || '34%',
                  width: stampHotspot.width || '11%',
                  height: stampHotspot.height || '17%',
                }}
                aria-label={stampHotspot.label || 'Bấm để đóng dấu mộc'}
                title={stampHotspot.label || 'Bấm để trải nghiệm đóng dấu mộc'}
                className="group absolute z-20 cursor-pointer rounded-2xl border-2 border-dashed border-amber-500/80 bg-amber-400/20 shadow-[0_0_22px_rgba(245,158,11,0.5)] transition-all hover:border-solid hover:border-amber-400 hover:bg-amber-400/35"
              >
                <span className="pointer-events-none absolute -top-2.5 -right-2.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-lemon text-ink shadow-sm transition-transform group-hover:scale-110">
                  <Sparkles size={14} />
                </span>
                <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-ink bg-white/95 px-2 py-0.5 font-display text-xs font-extrabold text-ink opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                  Đóng dấu
                </span>
              </motion.button>
            )}

            {/* Giao diện tương tác đóng dấu mộc (Stamp Game Modal) */}
            <StampGameModal
              isOpen={stampGameOpen}
              onClose={() => setStampGameOpen(false)}
              videoSrc={stampHotspot?.video}
              bgImage={stampHotspot?.bgImage}
              cursorImage={stampHotspot?.cursorImage}
              stampImages={stampHotspot?.stampImages}
              stampSoundSrc={stampHotspot?.stampSoundSrc}
              title={stampHotspot?.title}
            />

            {/* Nút Popup "Chơi trò chơi" xuất hiện sau 3.5s bên dưới cụm chữ tiêu đề */}
            {mazeGame && mazeButtonVisible && !mazeGameOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: [1, 1.05, 1], y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{
                  opacity: { duration: 0.35 },
                  scale: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
                  y: { type: 'spring', stiffness: 350, damping: 22 },
                }}
                style={{
                  position: 'absolute',
                  top: mazeGame.buttonPosition?.top || '74%',
                  left: mazeGame.buttonPosition?.left || '50%',
                  transform: 'translate(-50%, -50%)',
                }}
                className="z-25"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (videoRef.current) videoRef.current.pause()
                    if (audioRef.current) audioRef.current.pause()
                    setMazeGameOpen(true)
                  }}
                  aria-label={mazeGame.buttonText || 'Chơi trò chơi'}
                  title="Bấm để vào chơi trò chơi mê cung"
                  className="group relative inline-flex items-center gap-2.5 rounded-full border-4 border-ink bg-[#0288D1] px-6 py-3 font-display text-lg font-black text-white shadow-chunky transition-transform hover:scale-105 hover:bg-[#0277BD] active:translate-y-1 active:shadow-none sm:px-8 sm:py-3.5 sm:text-xl"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-ink bg-[#FFD54F] text-ink shadow-sm transition-transform group-hover:rotate-12">
                    <Sparkles size={18} className="text-amber-800" />
                  </span>
                  <span>{mazeGame.buttonText || 'Chơi trò chơi'}</span>
                </button>
              </motion.div>
            )}

            {/* Giao diện trò chơi Mê Cung (Maze Game Modal) */}
            <MazeGameModal
              isOpen={mazeGameOpen}
              onClose={() => setMazeGameOpen(false)}
              playerImage={mazeGame?.playerImage}
              destinationImage={mazeGame?.destinationImage}
              patternImages={mazeGame?.patternImages}
              title={mazeGame?.title}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Các chấm chuyển trang */}
      <div className="mt-5 flex justify-center gap-2" role="tablist" aria-label="Các trang">
        {story.pages.map((p, i) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={i === index}
            aria-label={`Trang ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-4 rounded-full border-2 border-ink transition-all ${
              i === index ? 'w-10 bg-grape' : i < index ? 'w-4 bg-mint' : 'w-4 bg-white'
            }`}
          />
        ))}
      </div>

      {/* Thanh nút điều khiển chính (có nút Nghe lại giọng đọc ở TẤT CẢ các trang) */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button onClick={() => go(-1)} disabled={index === 0} className="btn-big bg-peach" aria-label="Trang trước">
          <ChevronLeft size={26} aria-hidden /> Trước
        </button>

        {!isQuiz && (
          <button
            onClick={togglePlay}
            className="btn-big bg-lemon"
            aria-label={ended ? 'Xem lại video' : playing ? 'Tạm dừng video' : 'Phát video'}
          >
            {ended ? <RotateCcw size={26} aria-hidden /> : playing ? <Pause size={26} aria-hidden /> : <Play size={26} aria-hidden />}
            {ended ? 'Xem lại' : playing ? 'Dừng' : 'Phát'}
          </button>
        )}

        {/* Nút Nghe lại âm thanh người dẫn (MP3) trên tất cả các trang */}
        <button
          type="button"
          onClick={() => playNarrator(true)}
          className={`btn-big ${narratorPlaying ? 'bg-lemon ring-4 ring-grape/40' : 'bg-rose'}`}
          aria-label="Nghe lại âm thanh người dẫn"
        >
          <Headphones size={24} aria-hidden className={narratorPlaying ? 'animate-bounce' : ''} />
          {narratorPlaying ? 'Đang đọc... (Nghe lại)' : 'Nghe lại lời dẫn'}
        </button>

        <button
          onClick={toggleMute}
          className="btn-big bg-sky"
          aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {muted ? <VolumeX size={26} aria-hidden /> : <Volume2 size={26} aria-hidden />}
        </button>

        <button onClick={() => go(1)} disabled={index === total - 1} className="btn-big bg-mint" aria-label="Trang sau">
          Sau <ChevronRight size={26} aria-hidden />
        </button>
      </div>

      {/* Thông báo hướng dẫn nếu chưa bỏ file MP3 vào thư mục public/audio */}
      {(showAudioHint || narratorFailed) && (
        <p className="mt-3 text-center text-sm font-bold text-red-700">
          Chưa tìm thấy file MP3 lời dẫn. Hãy đặt file vào{' '}
          <code className="rounded bg-white px-1.5 py-0.5">
            public{audioSrc || `/audio/trang-${index + 1}.mp3`}
          </code>
        </p>
      )}

      {!isQuiz && (
        <label className="mt-4 flex items-center justify-center gap-2 font-bold">
          <input
            type="checkbox"
            checked={autoNext}
            onChange={(e) => setAutoNext(e.target.checked)}
            className="h-5 w-5 accent-grape"
          />
          Tự động lật trang khi video kết thúc
        </label>
      )}

      <motion.section
        key={page.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-6 rounded-[2rem] border-4 border-ink bg-white p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-extrabold text-grape">
            Trang {index + 1} / {total}
          </p>
        </div>
        <h2 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">{page.title}</h2>
        <p className="mt-1 font-semibold">{page.description}</p>
        {page.narration && (
          <blockquote className="mt-4 rounded-2xl bg-lemon/60 p-4 text-lg font-semibold leading-relaxed">
            “{page.narration}”
          </blockquote>
        )}
      </motion.section>

      {/* Hộp thoại Cài đặt âm thanh & trải nghiệm */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        masterVolume={masterVolume}
        setMasterVolume={setMasterVolume}
        bgmEnabled={bgmEnabled}
        setBgmEnabled={setBgmEnabled}
        bgmVolume={bgmVolume}
        setBgmVolume={setBgmVolume}
        narratorEnabled={narratorEnabled}
        setNarratorEnabled={setNarratorEnabled}
        narratorVolume={narratorVolume}
        setNarratorVolume={setNarratorVolume}
        videoVolume={videoVolume}
        setVideoVolume={setVideoVolume}
        autoNext={autoNext}
        setAutoNext={setAutoNext}
        playbackSpeed={playbackSpeed}
        setPlaybackSpeed={setPlaybackSpeed}
        onReset={handleResetSettings}
      />
    </div>
  )
}
