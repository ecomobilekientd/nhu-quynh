import { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const COLORS = [
  { bg: '#FFB6C1', text: '#7A1F3D', accent: '#FF6B9D' },
  { bg: '#FFE066', text: '#5C4A00', accent: '#FFC107' },
  { bg: '#A8E6CF', text: '#1B5E3F', accent: '#4CAF50' },
  { bg: '#A0D8F1', text: '#0D47A1', accent: '#2196F3' },
  { bg: '#FFB088', text: '#7A2E0B', accent: '#FF7043' },
  { bg: '#D4B5FA', text: '#3E1F6B', accent: '#9C27B0' },
];

const SLIDE_DURATION = 6000; // ms per slide

export default function Display() {
  const [wishes, setWishes] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const timerRef = useRef(null);
  const prevWishesLen = useRef(0);

  const loadWishes = useCallback(async (silent = false) => {
    try {
      const res = await fetch('/api/wishes');
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data.wishes) ? data.wishes : [];
      if (silent && list.length > prevWishesLen.current) {
        setNewCount(list.length - prevWishesLen.current);
        setTimeout(() => setNewCount(0), 3000);
      }
      prevWishesLen.current = list.length;
      setWishes(list);
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadWishes(false);
  }, [loadWishes]);

  // Realtime polling every 5s
  useEffect(() => {
    const interval = setInterval(() => loadWishes(true), 5000);
    return () => clearInterval(interval);
  }, [loadWishes]);

  // Auto-advance slideshow
  const goTo = useCallback((index, dir = 1) => {
    if (transitioning || wishes.length === 0) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(index);
      setTransitioning(false);
    }, 400);
  }, [transitioning, wishes.length]);

  const next = useCallback(() => {
    if (wishes.length === 0) return;
    goTo((current + 1) % wishes.length, 1);
  }, [current, wishes.length, goTo]);

  const prev = useCallback(() => {
    if (wishes.length === 0) return;
    goTo((current - 1 + wishes.length) % wishes.length, -1);
  }, [current, wishes.length, goTo]);

  useEffect(() => {
    if (!playing || wishes.length <= 1) return;
    timerRef.current = setInterval(next, SLIDE_DURATION);
    return () => clearInterval(timerRef.current);
  }, [playing, next, wishes.length]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === ' ') setPlaying(p => !p);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  const wish = wishes[current];
  const color = wish ? (COLORS[wish.colorIdx] || COLORS[0]) : COLORS[0];

  return (
    <div
      className="min-h-screen w-full flex flex-col relative overflow-hidden select-none"
      style={{ backgroundColor: '#0f0a1e', fontFamily: "'Be Vietnam Pro', sans-serif" }}
    >
      <style>{`
        @keyframes fadeIn   { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeOut  { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-30px); } }
        @keyframes shimmer  { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes floatUp  { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-120px) scale(0.5); opacity: 0; } }
        @keyframes pulse-dot { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.4); opacity: 0.7; } }
        @keyframes progress { from { width: 0%; } to { width: 100%; } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes new-badge { 0% { transform: scale(0) rotate(-10deg); opacity: 0; } 60% { transform: scale(1.15) rotate(5deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }

        .slide-enter { animation: fadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .slide-exit  { animation: fadeOut 0.4s ease-in forwards; }
        .progress-bar { animation: progress ${SLIDE_DURATION}ms linear; }
        .dot-active { animation: pulse-dot 2s ease-in-out infinite; }
      `}</style>

      {/* Ambient background blobs matching card color */}
      <div className="absolute inset-0 transition-all duration-[1500ms]"
           style={{ background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${color.bg}22 0%, transparent 70%)` }} />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[120px] transition-all duration-[2000ms]"
           style={{ backgroundColor: `${color.accent}18` }} />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-[120px] transition-all duration-[2000ms]"
           style={{ backgroundColor: `${color.bg}15` }} />

      {/* TOP BAR */}
      <header className="relative z-20 flex items-center justify-between px-8 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
               style={{ backgroundColor: color.bg, border: `2px solid ${color.accent}` }}>
            <Heart className="w-5 h-5" fill={color.accent} stroke={color.accent} />
          </div>
          <div>
            <p className="text-white font-black text-lg leading-none"
               style={{ fontFamily: "'Bricolage Grotesque'" }}>
              NHƯ QUỲNH
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#ffffff60' }}>
              Farewell wall · {new Date().getFullYear()}
            </p>
          </div>
        </div>

        {/* Counter + new badge */}
        <div className="flex items-center gap-3">
          {newCount > 0 && (
            <div className="px-3 py-1.5 rounded-full text-xs font-black"
                 style={{ backgroundColor: '#FF6B9D', color: '#fff', animation: 'new-badge 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
              +{newCount} lời chúc mới! 🎉
            </div>
          )}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full"
               style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div className="w-2 h-2 rounded-full dot-active" style={{ backgroundColor: '#4ade80' }} />
            <span className="text-white text-sm font-bold">{wishes.length} lời chúc</span>
          </div>
        </div>
      </header>

      {/* MAIN SLIDE AREA */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-8 py-4">
        {loading ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full border-4 border-t-transparent mx-auto mb-4"
                 style={{ borderColor: `${color.accent}40`, borderTopColor: color.accent, animation: 'spin-slow 1s linear infinite' }} />
            <p style={{ color: '#ffffff60', fontStyle: 'italic' }}>Đang tải lời chúc...</p>
          </div>
        ) : wishes.length === 0 ? (
          <div className="text-center max-w-lg">
            <div className="text-8xl mb-6">💌</div>
            <p className="text-white text-3xl font-black mb-3" style={{ fontFamily: "'Bricolage Grotesque'" }}>
              Chưa có lời chúc nào
            </p>
            <p style={{ color: '#ffffff50', fontStyle: 'italic', fontSize: '1.1rem' }}>
              Tự động cập nhật khi có lời chúc mới...
            </p>
          </div>
        ) : wish ? (
          <div className="w-full max-w-4xl mx-auto">
            {/* Card */}
            <div
              key={current}
              className={transitioning ? 'slide-exit' : 'slide-enter'}
              style={{ willChange: 'opacity, transform' }}
            >
              <div className="rounded-3xl p-12 md:p-16 relative overflow-hidden"
                   style={{
                     backgroundColor: color.bg,
                     border: `3px solid ${color.accent}`,
                     boxShadow: `0 0 80px ${color.accent}40, 0 40px 80px rgba(0,0,0,0.5)`,
                   }}>

                {/* Decorative quote mark */}
                <div className="absolute top-6 left-10 text-[8rem] leading-none font-black pointer-events-none select-none"
                     style={{ color: `${color.text}12`, fontFamily: "'Bricolage Grotesque'" }}>
                  "
                </div>

                {/* Wish number badge */}
                <div className="absolute top-6 right-8 px-3 py-1 rounded-full text-xs font-bold"
                     style={{ backgroundColor: `${color.text}15`, color: color.text }}>
                  {current + 1} / {wishes.length}
                </div>

                {/* Message */}
                <p className="relative z-10 font-semibold leading-relaxed mb-10"
                   style={{
                     color: color.text,
                     fontSize: 'clamp(1.4rem, 3.5vw, 2.4rem)',
                     fontStyle: 'italic',
                     lineHeight: 1.5,
                   }}>
                  {wish.message}
                </p>

                {/* Sender */}
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg"
                       style={{ backgroundColor: color.text, color: color.bg }}>
                    {wish.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-black text-lg" style={{ color: color.text, fontFamily: "'Bricolage Grotesque'" }}>
                      {wish.name}
                    </p>
                    <p className="text-xs font-medium" style={{ color: `${color.text}70` }}>
                      {new Date(wish.timestamp).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Heart className="w-7 h-7" fill={color.accent} stroke="none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* PROGRESS BAR */}
      {playing && wishes.length > 1 && (
        <div className="absolute bottom-[100px] left-8 right-8 z-20 h-0.5 rounded-full"
             style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
          <div
            key={`${current}-${playing}`}
            className="h-full rounded-full progress-bar"
            style={{ backgroundColor: color.accent }}
          />
        </div>
      )}

      {/* BOTTOM CONTROLS */}
      <footer className="relative z-20 flex items-center justify-between px-8 pb-8 pt-4">
        {/* Dot indicators */}
        <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
          {wishes.slice(0, 20).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? '24px' : '8px',
                height: '8px',
                backgroundColor: i === current ? color.accent : 'rgba(255,255,255,0.25)',
              }}
            />
          ))}
          {wishes.length > 20 && (
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>+{wishes.length - 20}</span>
          )}
        </div>

        {/* Nav controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={prev}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={() => setPlaying(p => !p)}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{ backgroundColor: color.accent, boxShadow: `0 0 20px ${color.accent}60` }}
          >
            {playing
              ? <Pause className="w-5 h-5 text-white" fill="white" />
              : <Play className="w-5 h-5 text-white" fill="white" />
            }
          </button>

          <button
            onClick={next}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Keyboard hint */}
        <div className="hidden md:flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
          <kbd className="px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>←</kbd>
          <kbd className="px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>→</kbd>
          <span>điều hướng</span>
          <kbd className="px-2 py-0.5 rounded ml-2" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>Space</kbd>
          <span>tạm dừng</span>
        </div>
      </footer>
    </div>
  );
}
