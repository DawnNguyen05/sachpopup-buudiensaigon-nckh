import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import Home from './Home'
import Viewer from './Viewer'

const normalizePath = (p) => (p ? (p.startsWith('/') ? p : `/${p}`) : '')

export default function App() {
  const [stories, setStories] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [showOpening, setShowOpening] = useState(false)
  const [error, setError] = useState('')

  const loadStories = useCallback(() => {
    return fetch(`/data/stories.json?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        setStories(data)
        setError('')
        return data
      })
      .catch(() => {
        setError('Không tải được danh sách truyện. Hãy kiểm tra file public/data/stories.json.')
        return []
      })
  }, [])

  useEffect(() => {
    loadStories()
  }, [loadStories])

  const active = stories.find((s) => s.id === activeId)
  const openingSrc = normalizePath(active?.openingVideo)

  const handleOpen = async (id) => {
    const latestStories = await loadStories()
    const story = latestStories.find((s) => s.id === id) || stories.find((s) => s.id === id)
    setActiveId(id)
    setShowOpening(Boolean(story?.openingVideo))
    window.scrollTo(0, 0)
  }

  const handleBack = () => {
    setActiveId(null)
    setShowOpening(false)
    window.scrollTo(0, 0)
  }

  return (
    <MotionConfig reducedMotion="user">
      {active ? (
        <>
          <Viewer key={active.id} story={active} ready={!showOpening} onBack={handleBack} />
          <AnimatePresence>
            {showOpening && openingSrc && (
              <motion.div
                key="opening-video"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-ink"
              >
                <video
                  key={openingSrc}
                  src={openingSrc}
                  className="h-full w-full object-contain"
                  autoPlay
                  playsInline
                  preload="auto"
                  onEnded={() => setShowOpening(false)}
                  onError={() => setShowOpening(false)}
                />
                <button
                  type="button"
                  onClick={() => setShowOpening(false)}
                  className="btn-big fixed bottom-6 right-6 bg-white/90 !px-5 !py-2 !text-base hover:bg-white"
                >
                  Bỏ qua
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <Home stories={stories} error={error} onOpen={handleOpen} />
      )}
    </MotionConfig>
  )
}
