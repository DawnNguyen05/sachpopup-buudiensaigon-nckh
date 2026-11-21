import { BookOpen, Sparkles } from 'lucide-react'

function Hero() {
  return (
    <svg viewBox="0 0 400 300" className="w-full max-w-xl drop-shadow-sm" role="img" aria-label="Cuốn sách mở ra với lâu đài nổi lên">
      <ellipse cx="200" cy="268" rx="170" ry="16" fill="#3A3157" opacity=".12" />
      <path d="M30 230 L200 250 L200 130 L30 110 Z" fill="#FFF" stroke="#3A3157" strokeWidth="6" strokeLinejoin="round" />
      <path d="M370 230 L200 250 L200 130 L370 110 Z" fill="#FFE58F" stroke="#3A3157" strokeWidth="6" strokeLinejoin="round" />
      <g stroke="#3A3157" strokeWidth="6" strokeLinejoin="round">
        <rect x="150" y="90" width="100" height="100" fill="#FFB5C8" />
        <path d="M150 90 L200 40 L250 90 Z" fill="#8E7CC3" />
        <rect x="178" y="140" width="44" height="50" rx="22" fill="#BFE4F6" />
        <rect x="120" y="120" width="34" height="70" fill="#FFCBA9" />
        <path d="M120 120 L137 90 L154 120 Z" fill="#8E7CC3" />
        <rect x="246" y="120" width="34" height="70" fill="#BFEBCB" />
        <path d="M246 120 L263 90 L280 120 Z" fill="#8E7CC3" />
      </g>
      <circle cx="320" cy="60" r="26" fill="#FFE58F" stroke="#3A3157" strokeWidth="6" />
      <circle cx="70" cy="70" r="6" fill="#FFB5C8" /><circle cx="95" cy="40" r="4" fill="#BFEBCB" />
    </svg>
  )
}

export default function Home({ stories, error, onOpen }) {
  const mainStory = stories[0]

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-5 py-10">
      <header className="mb-6 flex items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-2xl border-4 border-ink bg-lemon shadow-chunkySm">
          <BookOpen size={28} aria-hidden />
        </span>
        <span className="font-display text-3xl font-extrabold md:text-4xl">Bưu điện Sài Gòn - Nơi những lá thư cất cánh</span>
      </header>

      <section className="grid items-center gap-10 rounded-[3rem] border-4 border-ink bg-sky px-8 py-14 shadow-chunky md:grid-cols-2 md:px-16 md:py-20">
        <div>
          <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
            <span className="block whitespace-nowrap">Trang sách lật mở</span>
            <span className="block whitespace-nowrap">Bí mật mở ra</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg font-semibold leading-relaxed md:text-xl">
            Sản phẩm số từ ấn phẩm sách tương tác vật lý.
          </p>
          {error && <p className="mt-4 rounded-2xl bg-rose p-4 font-bold">{error}</p>}
          <button
            type="button"
            disabled={!mainStory}
            onClick={() => mainStory && onOpen(mainStory.id)}
            className="btn-big mt-8 bg-lemon !px-9 !py-4 !text-2xl"
          >
            <Sparkles size={26} aria-hidden /> Xem sách
          </button>
        </div>
        <div className="flex justify-center">
          <Hero />
        </div>
      </section>
    </div>
  )
}
