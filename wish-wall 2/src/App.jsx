import { useState, useEffect } from 'react';
import { Heart, Send, Sparkles, Star, Loader2 } from 'lucide-react';

const COLORS = [
  { bg: '#FFB6C1', text: '#7A1F3D', accent: '#FF6B9D', name: 'Pink'  },
  { bg: '#FFE066', text: '#5C4A00', accent: '#FFC107', name: 'Sun'   },
  { bg: '#A8E6CF', text: '#1B5E3F', accent: '#4CAF50', name: 'Mint'  },
  { bg: '#A0D8F1', text: '#0D47A1', accent: '#2196F3', name: 'Sky'   },
  { bg: '#FFB088', text: '#7A2E0B', accent: '#FF7043', name: 'Peach' },
  { bg: '#D4B5FA', text: '#3E1F6B', accent: '#9C27B0', name: 'Lilac' },
];

const EMOJI_FLOATERS = ['💛', '✨', '🌸', '🎈', '⭐', '💌', '🌟', '🎀'];

export default function App() {
  const [wishes, setWishes] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [colorIdx, setColorIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [justAddedKey, setJustAddedKey] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
  loadWishes();
  const interval = setInterval(loadWishes, 3000);
  return () => clearInterval(interval);
}, []);

  const loadWishes = async () => {
    try {
      const res = await fetch('/api/wishes');
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      setWishes(Array.isArray(data.wishes) ? data.wishes : []);
    } catch (e) {
      console.error(e);
      setErrorMsg('Không tải được lời chúc. Thử reload trang nhé!');
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!name.trim() || !message.trim() || submitting) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          message: message.trim(),
          colorIdx,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Gửi thất bại');
      }
      const data = await res.json();
      const newWish = data.wish;
      setWishes(prev => [newWish, ...prev]);
      setJustAddedKey(newWish.key);
      setTimeout(() => setJustAddedKey(null), 2200);
      setName('');
      setMessage('');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    } catch (e) {
      setErrorMsg(e.message || 'Có lỗi khi gửi lời chúc, thử lại nhé!');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = name.trim() && message.trim() && !submitting;
  const currentColor = COLORS[colorIdx];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#FFF6E9', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes float-y { 0%,100% { transform: translateY(0) rotate(var(--r,0deg)); } 50% { transform: translateY(-18px) rotate(calc(var(--r,0deg) + 8deg)); } }
        @keyframes wiggle  { 0%,100% { transform: rotate(-6deg); } 50% { transform: rotate(6deg); } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(24px) rotate(var(--rot, 0deg)); } to { opacity: 1; transform: translateY(0) rotate(var(--rot, 0deg)); } }
        @keyframes pop     { 0% { transform: scale(0.6) rotate(var(--rot, 0deg)); opacity: 0; } 60% { transform: scale(1.06) rotate(var(--rot, 0deg)); opacity: 1; } 100% { transform: scale(1) rotate(var(--rot, 0deg)); } }
        @keyframes confetti{ 0% { transform: translateY(-20vh) rotate(0); opacity: 1; } 100% { transform: translateY(110vh) rotate(900deg); opacity: 0.2; } }
        @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(255,107,157,0.6); } 100% { box-shadow: 0 0 0 18px rgba(255,107,157,0); } }
        @keyframes shine { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

        .dot-bg { background-image: radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1.4px); background-size: 22px 22px; }
        .neo-card { box-shadow: 6px 6px 0 #1a1a1a; transition: all 0.2s ease; }
        .neo-card:focus-within { box-shadow: 8px 8px 0 #1a1a1a; transform: translate(-2px,-2px); }
        .wish-card:hover { transform: translateY(-6px) rotate(0deg) scale(1.03) !important; box-shadow: 8px 12px 28px rgba(0,0,0,0.2); z-index: 10; }
        .btn-go:not(:disabled):hover { transform: translate(-2px,-2px); box-shadow: 8px 8px 0 #FF6B9D, 10px 10px 0 #1a1a1a; }
        .btn-go:not(:disabled):active { transform: translate(2px,2px); box-shadow: 2px 2px 0 #1a1a1a; }
        .pulse-new::before { content:''; position:absolute; inset:0; border-radius:1.25rem; animation: pulse-ring 1.6s ease-out 2; pointer-events:none; }
        .floater { position: absolute; font-size: 2rem; animation: float-y 6s ease-in-out infinite; user-select: none; pointer-events: none; }
      `}</style>

      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-40 blur-3xl" style={{ backgroundColor: '#FFB6C1' }} />
      <div className="absolute top-40 -right-32 w-[28rem] h-[28rem] rounded-full opacity-30 blur-3xl" style={{ backgroundColor: '#A0D8F1' }} />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full opacity-30 blur-3xl" style={{ backgroundColor: '#FFE066' }} />

      {EMOJI_FLOATERS.map((e, i) => (
        <span key={i} className="floater" style={{
          top: `${10 + (i * 11) % 70}%`,
          left: `${(i * 23) % 92}%`,
          animationDelay: `${i * 0.4}s`,
          animationDuration: `${5 + (i % 4)}s`,
          ['--r']: `${(i * 17) % 30 - 15}deg`,
        }}>{e}</span>
      ))}

      <div className="absolute inset-0 dot-bg opacity-50 pointer-events-none" />

      {showConfetti && <Confetti />}

      <div className="relative z-10">
        <header className="pt-14 pb-10 px-6 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
               style={{ backgroundColor: '#1a1a1a', color: '#fff', fontSize: '0.78rem', letterSpacing: '0.18em', fontWeight: 700 }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: '#FFE066' }} />
            FAREWELL · {new Date().getFullYear()}
            <Sparkles className="w-3.5 h-3.5" style={{ color: '#FFE066' }} />
          </div>

          <p style={{ fontFamily: "'Caveat', cursive", fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: '#7A1F3D', transform: 'rotate(-3deg)', display: 'inline-block' }}>
            Gửi lời chúc đến chị
          </p>

          <h1 className="font-black leading-[0.85] my-3" style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: 'clamp(3.2rem, 13vw, 9rem)',
            background: 'linear-gradient(120deg, #FF6B9D 0%, #FF7043 35%, #FFC107 70%, #FF6B9D 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.045em',
            animation: 'shine 6s linear infinite',
          }}>
            NHƯ QUỲNH
          </h1>

          <div className="flex justify-center items-center gap-3 my-4 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{ backgroundColor: '#FFE066', color: '#5C4A00', transform: 'rotate(-2deg)', display: 'inline-block' }}>
              Truyền thông nội bộ
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{ backgroundColor: '#A8E6CF', color: '#1B5E3F', transform: 'rotate(1.5deg)', display: 'inline-block' }}>
              Người được yêu quý
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{ backgroundColor: '#FFB6C1', color: '#7A1F3D', transform: 'rotate(-1deg)', display: 'inline-block' }}>
              Hẹn gặp lại 💛
            </span>
          </div>

          <p className="max-w-2xl mx-auto text-base md:text-lg mt-4" style={{ color: '#3a3a3a', lineHeight: 1.6 }}>
            Cảm ơn chị vì những bản tin, những event, những khoảnh khắc đã kết nối cả công ty lại với nhau. <br/>
            Hãy để mỗi người gửi cho chị một mảnh ghép yêu thương trên hành trình mới nhé!
          </p>

          <div className="mt-7 inline-flex items-center gap-3 px-6 py-3 rounded-full"
               style={{ backgroundColor: '#1a1a1a', color: '#fff', boxShadow: '4px 4px 0 #FF6B9D' }}>
            <Heart className="w-5 h-5" fill="#FF6B9D" stroke="#FF6B9D" />
            <span style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 900, fontSize: '1.4rem' }}>{wishes.length}</span>
            <span style={{ fontWeight: 500 }}>lời chúc đã gửi tới chị</span>
          </div>
        </header>

        <section className="max-w-2xl mx-auto px-6 mb-20">
          <div className="neo-card rounded-3xl p-7 md:p-9 border-[3px] relative"
               style={{ backgroundColor: '#fff', borderColor: '#1a1a1a' }}>
            <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full flex items-center justify-center font-black text-sm border-[3px]"
                 style={{
                   backgroundColor: currentColor.bg, color: currentColor.text, borderColor: '#1a1a1a',
                   transform: 'rotate(12deg)', fontFamily: "'Bricolage Grotesque'",
                   boxShadow: '3px 3px 0 #1a1a1a', animation: 'wiggle 4s ease-in-out infinite',
                 }}>
              YOUR<br/>TURN!
            </div>

            <h2 className="mb-1" style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 900, fontSize: 'clamp(1.5rem,4vw,2rem)' }}>
              Để lại một lời chúc ✨
            </h2>
            <p className="mb-6" style={{ fontFamily: "'Caveat'", fontSize: '1.25rem', color: '#666' }}>
              Một dòng thôi cũng đủ làm chị mỉm cười 🌷
            </p>

            <label className="block mb-4">
              <span className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#666' }}>Tên của bạn</span>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="VD: Minh - Team Marketing"
                maxLength={60}
                className="w-full px-4 py-3 rounded-xl border-[2.5px] text-base focus:outline-none transition"
                style={{ borderColor: '#1a1a1a', backgroundColor: '#FFF8F0', fontFamily: 'inherit' }}
              />
            </label>

            <label className="block mb-5">
              <span className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#666' }}>
                Lời chúc <span className="font-normal normal-case" style={{ color: '#aaa' }}>({message.length}/400)</span>
              </span>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Chúc chị Quỳnh thật nhiều sức khỏe và may mắn ở chặng đường mới..."
                rows={4}
                maxLength={400}
                className="w-full px-4 py-3 rounded-xl border-[2.5px] text-base focus:outline-none resize-none transition"
                style={{ borderColor: '#1a1a1a', backgroundColor: '#FFF8F0', fontFamily: "'Caveat'", fontSize: '1.3rem', lineHeight: 1.4 }}
              />
            </label>

            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider mr-1" style={{ color: '#666' }}>Màu thiệp:</span>
              {COLORS.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setColorIdx(i)}
                  className="w-9 h-9 rounded-full transition-all duration-200 relative"
                  style={{
                    backgroundColor: c.bg,
                    border: '2.5px solid #1a1a1a',
                    transform: colorIdx === i ? 'scale(1.18)' : 'scale(1)',
                    boxShadow: colorIdx === i ? `0 0 0 3px #fff, 0 0 0 5px ${c.accent}` : 'none',
                  }}
                  aria-label={c.name}
                />
              ))}
            </div>

            {errorMsg && (
              <div className="mb-4 px-4 py-3 rounded-xl border-2 text-sm"
                   style={{ backgroundColor: '#FFE5E5', borderColor: '#FF6B6B', color: '#7A1F1F' }}>
                {errorMsg}
              </div>
            )}

            <button
              onClick={submit}
              disabled={!canSubmit}
              className="btn-go w-full py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 border-[3px]"
              style={{
                backgroundColor: canSubmit ? '#1a1a1a' : '#999',
                borderColor: '#1a1a1a',
                color: '#fff',
                boxShadow: canSubmit ? '5px 5px 0 #FF6B9D' : 'none',
                fontFamily: "'Bricolage Grotesque'",
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                letterSpacing: '0.02em',
              }}
            >
              {submitting ? (<><Loader2 className="w-5 h-5 animate-spin" /> Đang gửi...</>) : (<>Gửi lời chúc <Send className="w-5 h-5" /></>)}
            </button>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="text-center mb-10">
            <p style={{ fontFamily: "'Caveat'", fontSize: '1.5rem', color: '#FF6B9D', transform: 'rotate(-2deg)', display: 'inline-block' }}>
              Đọc những lời thương 👇
            </p>
            <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              BỨC TƯỜNG <span style={{ color: '#FF6B9D' }}>YÊU THƯƠNG</span>
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#FF6B9D' }} />
            </div>
          ) : wishes.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border-[3px] border-dashed max-w-xl mx-auto"
                 style={{ borderColor: '#1a1a1a', backgroundColor: '#fff' }}>
              <div className="text-6xl mb-3">💌</div>
              <p style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 900, fontSize: '1.5rem' }}>Chưa có lời chúc nào</p>
              <p style={{ fontFamily: "'Caveat'", fontSize: '1.4rem', color: '#666' }}>Bạn là người đầu tiên đó! 💪</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
              {wishes.map((w, i) => (
                <WishCard key={w.key} wish={w} index={i} isNew={w.key === justAddedKey} />
              ))}
            </div>
          )}
        </section>

        <footer className="text-center pb-10 px-6">
          <div className="inline-flex items-center gap-2" style={{ fontFamily: "'Caveat'", fontSize: '1.3rem', color: '#666' }}>
            Made with <Heart className="w-4 h-4 inline" fill="#FF6B9D" stroke="#FF6B9D" /> bởi đồng nghiệp của chị
          </div>
        </footer>
      </div>
    </div>
  );
}

function WishCard({ wish, index, isNew }) {
  const color = COLORS[wish.colorIdx] || COLORS[0];
  const rotation = wish.rotation || 0;
  const date = new Date(wish.timestamp);
  const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

  return (
    <div
      className="break-inside-avoid relative"
      style={{
        ['--rot']: `${rotation}deg`,
        animation: isNew
          ? `pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both`
          : `fadeUp 0.6s ease-out ${Math.min(index * 0.04, 0.5)}s both`,
      }}
    >
      <div
        className={`wish-card relative p-6 rounded-2xl border-[3px] ${isNew ? 'pulse-new' : ''}`}
        style={{
          backgroundColor: color.bg,
          color: color.text,
          borderColor: '#1a1a1a',
          boxShadow: '5px 7px 0 #1a1a1a',
          transform: `rotate(${rotation}deg)`,
          transition: 'all 0.3s ease',
        }}
      >
        <div className="absolute -top-3 left-1/2 w-20 h-6 opacity-80"
             style={{
               backgroundColor: 'rgba(255,255,255,0.85)',
               backgroundImage: 'repeating-linear-gradient(45deg, transparent 0, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 6px)',
               transform: `translateX(-50%) rotate(${rotation * -1.8}deg)`,
               borderLeft: '1px dashed rgba(0,0,0,0.15)',
               borderRight: '1px dashed rgba(0,0,0,0.15)',
             }} />

        {isNew && (
          <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                style={{ backgroundColor: '#FF6B9D', color: '#fff', border: '2px solid #1a1a1a', transform: 'rotate(8deg)' }}>
            New!
          </span>
        )}

        <p style={{ fontFamily: "'Caveat', cursive", fontSize: '1.45rem', lineHeight: 1.35, fontWeight: 600, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {wish.message}
        </p>

        <div className="mt-5 pt-3 flex items-center justify-between gap-2"
             style={{ borderTop: `2px dashed ${color.text}30` }}>
          <div className="flex items-center gap-1.5 min-w-0">
            <Star className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" />
            <span className="font-bold text-sm truncate" style={{ fontFamily: "'DM Sans'" }}>
              {wish.name}
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 flex-shrink-0">
            {dateStr}
          </span>
        </div>
      </div>
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    left: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)].bg,
    delay: Math.random() * 0.4,
    duration: 2 + Math.random() * 1.8,
    size: 6 + Math.random() * 8,
    rounded: Math.random() > 0.5,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map((p, i) => (
        <div key={i}
             className="absolute"
             style={{
               left: `${p.left}%`,
               top: '-5%',
               width: p.size,
               height: p.size * (p.rounded ? 1 : 1.6),
               backgroundColor: p.color,
               borderRadius: p.rounded ? '50%' : '2px',
               animation: `confetti ${p.duration}s linear ${p.delay}s forwards`,
               border: '1.5px solid #1a1a1a',
             }} />
      ))}
    </div>
  );
}
