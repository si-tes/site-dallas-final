import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useProducts } from '../../hooks/useProducts';
import { useNavigate } from 'react-router';

/* ─────────────────────────────────────────
   LIGAS (mapeamento para IDs do JSON)
───────────────────────────────────────── */
const leagues = [
  { id: 'premier-league', name: 'Premier League', country: 'Inglaterra', logo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'la-liga',        name: 'La Liga',         country: 'Espanha',    logo: '🇪🇸' },
  { id: 'serie-a',        name: 'Serie A',          country: 'Itália',     logo: '🇮🇹' },
  { id: 'bundesliga',     name: 'Bundesliga',       country: 'Alemanha',   logo: '🇩🇪' },
  { id: 'ligue-1',        name: 'Ligue 1',          country: 'França',     logo: '🇫🇷' },
  { id: 'brasileirao',    name: 'Brasileirão',      country: 'Brasil',     logo: '🇧🇷' },
  { id: 'outros',         name: 'Outros Clubes',   country: 'Mundiais',   logo: '🌎' },
  { id: 'selecoes',       name: 'Seleções',        country: 'Nacionais',  logo: '🌍' },
];

/* Função auxiliar: retorna os produtos de uma liga */
function getLeagueProducts(leagueId: string): YupooProduct[] {
  const data = yupooData[leagueId];
  return data ? data.products : [];
}

/* ─────────────────────────────────────────
   TIPOS
───────────────────────────────────────── */
type Step = 'leagues' | 'teams';


/* ─────────────────────────────────────────
   CARROSSEL FIFA
───────────────────────────────────────── */
interface CarouselItem {
  id: string;
  label: string;
  sublabel?: string;
  emoji?: string;
  image?: string;
  extra?: string;
}

interface FifaCarouselProps {
  items: CarouselItem[];
  onSelect: (id: string) => void;
}

function FifaCarousel({ items, onSelect }: FifaCarouselProps) {
  const [active, setActive] = useState(0);
  const startX = useRef<number | null>(null);

  const move = useCallback((dir: number) => {
    setActive(prev => Math.min(Math.max(prev + dir, 0), items.length - 1));
  }, [items.length]);

  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) move(dx < 0 ? 1 : -1);
    startX.current = null;
  };
  const onMouseDown  = (e: React.MouseEvent) => { startX.current = e.clientX; };
  const onMouseUp    = (e: React.MouseEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 40) move(dx < 0 ? 1 : -1);
    startX.current = null;
  };

  const offset = active * -1; // used logically
  void offset;

  return (
    <div className="fifa-carousel-root" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
      {/* arrow left */}
      {active > 0 && (
        <button className="fifa-arrow fifa-arrow-left" onClick={() => move(-1)} aria-label="Anterior">‹</button>
      )}
      {/* track */}
      <div className="fifa-track">
        {items.map((item, i) => {
          const rel = i - active;  // -2 -1 0 1 2
          const isActive = rel === 0;
          const isAdjacent = Math.abs(rel) === 1;
          const isVisible = Math.abs(rel) <= 2;
          if (!isVisible) return null;

          return (
            <motion.div
              key={item.id}
              className={`fifa-card ${isActive ? 'fifa-card--active' : ''} ${isAdjacent ? 'fifa-card--adjacent' : ''}`}
              animate={{
                x: `${rel * 72}%`,
                scale: isActive ? 1 : isAdjacent ? 0.78 : 0.62,
                opacity: isActive ? 1 : isAdjacent ? 0.55 : 0.25,
                zIndex: isActive ? 10 : isAdjacent ? 5 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={() => {
                if (isActive) onSelect(item.id);
                else setActive(i);
              }}
            >
              {item.image ? (
                <div className="fifa-card__img-wrap">
                  <img src={item.image} alt={item.label} className="fifa-card__img" />
                  {item.extra && <span className="fifa-card__badge">{item.extra}</span>}
                </div>
              ) : (
                <div className="fifa-card__emoji-wrap">
                  {item.emoji && <span className="fifa-card__emoji">{item.emoji}</span>}
                </div>
              )}
              <div className="fifa-card__info">
                <p className="fifa-card__name">{item.label}</p>
                {item.sublabel && <p className="fifa-card__sub">{item.sublabel}</p>}
              </div>
              {isActive && (
                <motion.div
                  className="fifa-card__tap-hint"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Toque para selecionar
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
      {/* arrow right */}
      {active < items.length - 1 && (
        <button className="fifa-arrow fifa-arrow-right" onClick={() => move(1)} aria-label="Próximo">›</button>
      )}
      {/* dots */}
      <div className="fifa-dots">
        {items.map((_, i) => (
          <button key={i} className={`fifa-dot ${i === active ? 'fifa-dot--active' : ''}`} onClick={() => setActive(i)} aria-label={`Item ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SCREEN WRAPPER  (slide lateral)
───────────────────────────────────────── */
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function CatalogSection() {
  const [step, setStep]           = useState<Step>('leagues');
  const [direction, setDirection] = useState(1);
  const [selectedLeague, setLeague] = useState<typeof leagues[0] | null>(null);

  const go = (nextStep: Step, dir: number) => {
    setDirection(dir);
    setStep(nextStep);
  };

  const handleLeagueSelect = (id: string) => {
    const league = leagues.find(l => l.id === id)!;
    setLeague(league);
    go('teams', 1);
  };

  const handleBack = () => {
    if (step === 'teams') { setLeague(null); go('leagues', -1); }
  };

  /* ── Step: league items */
  const leagueItems: CarouselItem[] = leagues.map(l => ({
    id: l.id, label: l.name, sublabel: l.country, emoji: l.logo,
  }));

  /* ── Step: team items (vêm do products.json real!) */
  const teamProducts: YupooProduct[] = selectedLeague
    ? getLeagueProducts(selectedLeague.id)
    : [];

  const teamItems: CarouselItem[] = teamProducts.map((p, i) => ({
    id: String(i),
    label: p.name,
    sublabel: p.price ?? 'Ver preço',
    image: p.image,
    extra: p.link,
  }));

  /* ── Breadcrumb label */
  const breadcrumb =
    step === 'leagues' ? 'Escolha a Liga' :
    `${selectedLeague?.logo} ${selectedLeague?.name}`;

  return (
    <>
      {/* ── Inline styles (self-contained, não polui outros componentes) */}
      <style>{`
        /* ─── Section wrapper ─── */
        .fifa-section {
          position: relative;
          overflow: hidden;
          background: #ffffff;
          padding: 0;
        }

        /* ─── Header da seção ─── */
        .fifa-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 20px 0;
        }
        .fifa-section-title {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #000;
        }
        .fifa-back-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #000;
          background: none;
          border: 1.5px solid #000;
          border-radius: 6px;
          padding: 6px 14px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .fifa-back-btn:hover { background: #000; color: #fff; }

        /* ─── Breadcrumb ─── */
        .fifa-breadcrumb {
          padding: 10px 20px 0;
          font-size: 18px;
          font-weight: 900;
          letter-spacing: -0.01em;
          color: #000;
        }
        .fifa-step-indicator {
          display: flex;
          gap: 6px;
          padding: 8px 20px 0;
        }
        .fifa-step-pip {
          height: 3px;
          border-radius: 2px;
          flex: 1;
          background: #e0e0e0;
          transition: background 0.4s;
        }
        .fifa-step-pip--done   { background: #000; }
        .fifa-step-pip--active { background: #000; }

        /* ─── Slide area ─── */
        .fifa-slide-wrap {
          position: relative;
          height: 480px;
          overflow: hidden;
          margin-top: 16px;
        }

        /* ─── Carousel root ─── */
        .fifa-carousel-root {
          position: relative;
          width: 100%;
          height: 420px;
          display: flex;
          align-items: center;
          justify-content: center;
          touch-action: pan-y;
          user-select: none;
        }

        /* ─── FIFA Card ─── */
        .fifa-card {
          position: absolute;
          width: 200px;
          background: #fff;
          border: 2px solid #000;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transform-origin: center;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          transition: box-shadow 0.3s;
        }
        .fifa-card--active {
          border-color: #000;
          box-shadow: 0 12px 40px rgba(0,0,0,0.22);
        }
        .fifa-card--adjacent { border-color: #ccc; }

        .fifa-card__img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 3/4;
          overflow: hidden;
          background: #f5f5f5;
        }
        .fifa-card__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s;
        }
        .fifa-card--active .fifa-card__img { transform: scale(1.04); }
        .fifa-card__badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #000;
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 4px;
        }

        .fifa-card__emoji-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 140px;
          background: #f5f5f5;
        }
        .fifa-card__emoji { font-size: 56px; line-height: 1; }

        .fifa-card__info {
          padding: 12px 14px 10px;
          background: #fff;
        }
        .fifa-card__name {
          font-size: 13px;
          font-weight: 800;
          color: #000;
          line-height: 1.3;
          margin: 0 0 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .fifa-card__sub {
          font-size: 12px;
          font-weight: 600;
          color: #555;
          margin: 0;
        }
        .fifa-card--active .fifa-card__sub { color: #000; font-weight: 700; }

        .fifa-card__tap-hint {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #fff;
          background: #000;
          text-align: center;
          padding: 7px 0;
        }

        /* ─── Arrows ─── */
        .fifa-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          transition: transform 0.15s;
        }
        .fifa-arrow:active { transform: translateY(-50%) scale(0.92); }
        .fifa-arrow-left  { left: 8px; }
        .fifa-arrow-right { right: 8px; }

        /* ─── Dots ─── */
        .fifa-dots {
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 5px;
        }
        .fifa-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #ccc;
          border: none;
          cursor: pointer;
          transition: background 0.2s, width 0.2s;
          padding: 0;
        }
        .fifa-dot--active { background: #000; width: 18px; border-radius: 3px; }

        /* ─── Shirt list (step 3) ─── */
        .fifa-shirt-list {
          padding: 0 20px 32px;
        }
        .fifa-shirt-card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: #fff;
          border: 2px solid #000;
          border-radius: 14px;
          padding: 14px;
          margin-bottom: 14px;
          cursor: pointer;
          text-decoration: none;
          transition: box-shadow 0.2s, transform 0.15s;
        }
        .fifa-shirt-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.15); transform: translateY(-2px); }
        .fifa-shirt-card__img {
          width: 80px; height: 80px;
          object-fit: cover;
          border-radius: 10px;
          background: #f0f0f0;
          flex-shrink: 0;
        }
        .fifa-shirt-card__info { flex: 1; min-width: 0; }
        .fifa-shirt-card__type {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #fff;
          background: #000;
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          margin-bottom: 6px;
        }
        .fifa-shirt-card__name {
          font-size: 15px;
          font-weight: 800;
          color: #000;
          margin: 0 0 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .fifa-shirt-card__price {
          font-size: 16px;
          font-weight: 900;
          color: #000;
          margin: 0;
        }
        .fifa-shirt-card__arrow {
          font-size: 22px;
          color: #000;
          flex-shrink: 0;
        }

        /* ─── Responsive ─── */
        @media (max-width: 400px) {
          .fifa-card { width: 170px; }
        }
      `}</style>

      {/* ─── SECTION ─── */}
      <section className="fifa-section" id="catalogo">

        {/* Header */}
        <div className="fifa-section-header">
          <span className="fifa-section-title">Catálogo de Camisas</span>
          {step !== 'leagues' && (
            <button className="fifa-back-btn" onClick={handleBack}>‹ Voltar</button>
          )}
        </div>

        {/* Breadcrumb */}
        <div className="fifa-breadcrumb">{breadcrumb}</div>

        {/* Step indicator */}
        <div className="fifa-step-indicator">
          {(['leagues', 'teams'] as Step[]).map((s, i) => {
            const idx = ['leagues', 'teams'].indexOf(step);
            return (
              <div key={s} className={`fifa-step-pip ${i < idx ? 'fifa-step-pip--done' : i === idx ? 'fifa-step-pip--active' : ''}`} />
            );
          })}
        </div>

        {/* Slides */}
        <AnimatePresence mode="wait" custom={direction}>
          {/* ── STEP 1: Ligas ── */}
          {step === 'leagues' && (
            <motion.div
              key="leagues"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="fifa-slide-wrap">
                <FifaCarousel items={leagueItems} onSelect={handleLeagueSelect} />
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Times/Produtos Yupoo ── */}
          {step === 'teams' && (
            <motion.div
              key="teams"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="fifa-slide-wrap">
                <FifaCarousel
                  items={teamItems}
                  onSelect={(id) => {
                    const idx = parseInt(id);
                    const product = teamProducts[idx];
                    if (product?.link) {
                      window.open(product.link, '_blank', 'noopener,noreferrer');
                    }
                  }}
                />
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </section>
    </>
  );
}
