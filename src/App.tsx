import {
  lazy,
  Suspense,
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useInView } from 'framer-motion'

// ══════════════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════════════
const WA = 'https://wa.me/5511XXXXXXXXX?text=Oi!%20Quero%20reservar%20uma%20mesa.'

// ══════════════════════════════════════════════════════════
// LAZY ROUTES
// ══════════════════════════════════════════════════════════
const StubPage = lazy(() => Promise.resolve({ default: StubPageComp }))

// ══════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════
type ShowStatus = 'featured' | 'available' | 'last' | 'free'
interface Show {
  id: number; weekday: string; day: number; month: string; time: string
  name: string; desc: string; genre: string; price: number; status: ShowStatus
}

// ══════════════════════════════════════════════════════════
// DATA
// ══════════════════════════════════════════════════════════
const NAV = [
  { to: '/programacao',     label: 'Programação' },
  { to: '/cardapio',        label: 'Cardápio' },
  { to: '/eventos',         label: 'Eventos' },
  { to: '/aniversariantes', label: 'Aniversariantes' },
  { to: '/galeria',         label: 'Galeria' },
  { to: '/contato',         label: 'Contato' },
]

const GENRES = [
  'ROCK', '✦', 'METAL', '✦', 'PUNK', '✦', 'BLUES', '✦',
  'GRUNGE', '✦', 'HARDCORE', '✦', 'THRASH', '✦', 'CLASSIC ROCK', '✦',
]

const SHOWS: Show[] = [
  {
    id: 1, weekday: 'SEX', day: 18, month: 'ABR', time: '22H',
    name: 'SEPULTURA TRIBUTE FEST',
    desc: 'A brutalidade de Beneath The Remains ao vivo. Uma noite histórica no Manifesto.',
    genre: 'METAL · THRASH', price: 40, status: 'featured',
  },
  {
    id: 2, weekday: 'SÁB', day: 19, month: 'ABR', time: '21H',
    name: 'CLASSIC ROCK NIGHT',
    desc: 'Zeppelin, Purple, Sabbath. A noite que você esperou a semana toda.',
    genre: 'ROCK CLÁSSICO', price: 30, status: 'available',
  },
  {
    id: 3, weekday: 'DOM', day: 20, month: 'ABR', time: '19H',
    name: 'PUNK NOT DEAD',
    desc: 'O underground paulistano numa noite de punk e hardcore raiz.',
    genre: 'PUNK · HARDCORE', price: 25, status: 'last',
  },
  {
    id: 4, weekday: 'QUI', day: 24, month: 'ABR', time: '21H30',
    name: 'BLUES & WHISKY NIGHT',
    desc: 'O lado mais quente do Manifesto. Blues raiz e drinques autorais.',
    genre: 'BLUES', price: 0, status: 'free',
  },
]

// ══════════════════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════════════════
function cx(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(' ') }

// ══════════════════════════════════════════════════════════
// REVEAL — CSS transition + useInView (sem framer-motion)
// ══════════════════════════════════════════════════════════
function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const seen = useInView(ref, { once: true, margin: '-50px' })
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: seen ? 1 : 0,
        transform: seen ? 'translateY(0)' : 'translateY(22px)',
        transition: `opacity 0.65s ${delay}s cubic-bezier(.22,.68,0,1.1), transform 0.65s ${delay}s cubic-bezier(.22,.68,0,1.1)`,
      }}
    >
      {children}
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// SECTION HEADER
// ══════════════════════════════════════════════════════════
function SectionHeader({ idx, tag, title, className }: { idx: string; tag: string; title: string; className?: string }) {
  return (
    <div className={cx('mb-12', className)}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-brand font-sans text-[10px] tracking-[.35em] font-semibold">{idx}</span>
        <div className="h-px w-8 bg-brand/40" />
        <span className="text-muted font-sans text-[10px] tracking-[.3em] uppercase font-medium">{tag}</span>
      </div>
      <h2 className="font-display text-chalk leading-none" style={{ fontSize: 'clamp(44px,7vw,82px)' }}>
        {title}
      </h2>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// BADGE
// ══════════════════════════════════════════════════════════
function Badge({ status }: { status: ShowStatus }) {
  const map: Record<ShowStatus, { label: string; cls: string }> = {
    featured:  { label: 'EM BREVE',       cls: 'bg-brand text-chalk' },
    available: { label: 'DISPONÍVEL',     cls: 'border border-amber/50 text-amber' },
    last:      { label: 'ÚLTIMOS',        cls: 'border border-chalk/20 text-chalk/40' },
    free:      { label: 'ENTRADA FRANCA', cls: 'border border-teal/60 text-teal' },
  }
  const { label, cls } = map[status]
  return (
    <span className={cx('font-sans text-[9px] tracking-[.22em] font-semibold px-2.5 py-1 shrink-0', cls)}>
      {label}
    </span>
  )
}

// ══════════════════════════════════════════════════════════
// SHOW CARD
// ══════════════════════════════════════════════════════════
function ShowCard({ show, featured = false }: { show: Show; featured?: boolean }) {
  const p = featured ? 'p-7' : 'p-5'
  const isFree = show.status === 'free'
  return (
    <article
      className="relative border border-border bg-surface overflow-hidden flex flex-col h-full group transition-all duration-200 hover:-translate-y-1 hover:border-brand/50 hover:shadow-[0_0_24px_rgba(152,33,33,.1)]"
      aria-label={`Show: ${show.name}`}
    >
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent" />

      <div className={cx('flex items-start justify-between', p, 'pb-0')}>
        <div>
          <div className="font-sans text-muted text-[9px] tracking-[.28em] font-semibold mb-0.5">{show.weekday}</div>
          <div className="font-display text-chalk leading-none" style={{ fontSize: featured ? '66px' : '50px' }}>
            {show.day}
          </div>
          <div className="font-sans text-muted text-[9px] tracking-[.2em]">{show.month} · {show.time}</div>
        </div>
        <Badge status={show.status} />
      </div>

      <div className={cx('my-4 border-t border-dashed border-border', featured ? 'mx-7' : 'mx-5')} />

      <div className={cx('flex flex-col flex-1', featured ? 'px-7' : 'px-5')}>
        <div className="font-sans text-muted text-[9px] tracking-[.22em] font-medium mb-2">{show.genre}</div>
        <h3 className="font-display text-chalk leading-none mb-3" style={{ fontSize: featured ? 'clamp(26px,3vw,42px)' : '25px' }}>
          {show.name}
        </h3>
        {featured && <p className="font-sans text-muted text-sm leading-relaxed flex-1 mb-5">{show.desc}</p>}
      </div>

      <div className={cx('mt-auto border-t border-border flex items-center justify-between', p)}>
        <div>
          <div className="font-sans text-muted text-[8px] tracking-[.2em] mb-0.5 font-medium">A PARTIR DE</div>
          {isFree
            ? <span className="font-display text-teal text-3xl leading-none">GRÁTIS</span>
            : <span className="font-display text-amber text-3xl leading-none">R$ {show.price}</span>
          }
        </div>
        <a href="/programacao"
           className={cx('font-sans text-[10px] tracking-[.18em] font-semibold uppercase px-5 py-2.5 transition-colors',
             isFree
               ? 'border border-border text-muted hover:border-teal/50 hover:text-teal'
               : 'bg-brand text-chalk hover:bg-[#7a1a1a]',
           )}>
          {isFree ? 'VER MAIS' : 'COMPRAR'}
        </a>
      </div>

      <div className="absolute bottom-2 right-3 font-display text-chalk/[.03] text-[70px] leading-none select-none pointer-events-none">
        {String(show.id).padStart(2, '0')}
      </div>
    </article>
  )
}

// ══════════════════════════════════════════════════════════
// HEADER
// ══════════════════════════════════════════════════════════
function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const last = useRef(0)
  const { pathname } = useLocation()

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : '' }, [open])

  const onScroll = useCallback(() => {
    const y = window.scrollY
    setScrolled(y > 20)
    if (y > 80) setHidden(y > last.current + 4)
    else setHidden(false)
    last.current = y
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [onScroll])

  return (
    <>
      <header
        className={cx(
          'fixed top-0 inset-x-0 z-50 transition-all duration-300',
          scrolled ? 'bg-ink/94 backdrop-blur-sm border-b border-border' : 'bg-transparent',
          hidden ? '-translate-y-full' : 'translate-y-0',
        )}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 md:h-[68px]">
          <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="Manifesto Bar — Início">
            {/* Substitua por <img src="/logo.svg" alt="Manifesto Bar" className="h-10" /> */}
            <div className="w-10 h-10 bg-brand flex items-center justify-center shrink-0" aria-hidden="true">
              <span className="font-display text-chalk text-[22px] leading-none">M</span>
            </div>
            <div className="leading-none hidden sm:block">
              <div className="font-display text-chalk text-[18px] tracking-widest leading-none">MANIFESTO</div>
              <div className="font-sans text-muted text-[8px] tracking-[.38em] font-semibold uppercase">BAR · SP · 1994</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7" aria-label="Navegação principal">
            {NAV.map(({ to, label }) => (
              <Link key={to} to={to}
                    className={cx('font-sans text-[10px] tracking-[.18em] font-semibold uppercase transition-colors hover-line',
                      pathname === to ? 'text-chalk' : 'text-muted hover:text-chalk')}>
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <a href={WA} target="_blank" rel="noopener noreferrer"
               className="font-sans text-[10px] tracking-[.18em] font-semibold uppercase text-teal border border-teal/35 px-4 py-2.5 hover:border-teal/70 hover:bg-teal/5 transition-all flex items-center gap-1.5">
              <WaIcon className="w-3.5 h-3.5" /> Mesa
            </a>
            <Link to="/programacao"
                  className="font-sans text-[10px] tracking-[.18em] font-semibold uppercase bg-brand text-chalk px-4 py-2.5 hover:bg-[#7a1a1a] transition-colors">
              Ingressos
            </Link>
          </div>

          <button onClick={() => setOpen(v => !v)}
                  className="lg:hidden p-2 flex flex-col gap-[5px] shrink-0"
                  aria-label={open ? 'Fechar menu' : 'Abrir menu'}
                  aria-expanded={open}>
            {[0, 1, 2].map(i => (
              <span key={i} className="block w-6 h-0.5 bg-chalk origin-center transition-all duration-250"
                    style={
                      i === 0 ? { transform: open ? 'rotate(45deg) translateY(7px)' : 'none' } :
                      i === 1 ? { opacity: open ? 0 : 1 } :
                                 { transform: open ? 'rotate(-45deg) translateY(-7px)' : 'none' }
                    } />
            ))}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.38, ease: [0.22, 0.68, 0, 1] }}
            className="fixed inset-0 z-40 bg-ink flex flex-col pt-20 px-6 pb-10 overflow-auto"
            role="dialog" aria-label="Menu">
            <div className="absolute -bottom-8 -right-6 font-display leading-none select-none pointer-events-none"
                 style={{ fontSize: '52vw', color: 'rgba(250,250,250,.03)' }} aria-hidden="true">M</div>

            <nav className="flex flex-col flex-1 relative z-10">
              {NAV.map(({ to, label }, i) => (
                <motion.div key={to} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.055 + 0.08 }}>
                  <Link to={to}
                        className="font-display text-chalk py-3.5 border-b border-border/40 hover:text-brand transition-colors flex items-center justify-between group"
                        style={{ fontSize: 'clamp(30px,8vw,50px)' }}>
                    {label}
                    <span className="font-sans text-[10px] text-muted tracking-widest font-semibold group-hover:text-brand transition-colors">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="flex flex-col gap-3 mt-8 relative z-10">
              <a href={WA} target="_blank" rel="noopener noreferrer"
                 className="font-sans text-xs text-center py-4 border border-teal/40 text-teal tracking-[.18em] font-semibold uppercase hover:bg-teal/5 transition-colors">
                Reservar Mesa via WhatsApp
              </a>
              <Link to="/programacao"
                    className="font-sans text-xs text-center py-4 bg-brand text-chalk tracking-[.18em] font-semibold uppercase hover:bg-[#7a1a1a] transition-colors">
                Comprar Ingresso
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ══════════════════════════════════════════════════════════
// FOOTER
// ══════════════════════════════════════════════════════════
function Footer() {
  return (
    <footer className="bg-[#111] border-t border-border" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-3 mb-5" aria-label="Manifesto Bar">
              <div className="w-10 h-10 bg-brand flex items-center justify-center shrink-0">
                <span className="font-display text-chalk text-2xl leading-none">M</span>
              </div>
              <div>
                <div className="font-display text-chalk text-[18px]">MANIFESTO</div>
                <div className="font-sans text-muted text-[8px] tracking-[.35em] font-semibold uppercase">BAR · SP · 1994</div>
              </div>
            </Link>
            <p className="font-sans text-muted text-sm leading-relaxed mb-5">
              O Templo do Rock de São Paulo. Desde 1994, mantendo o volume alto e a cerveja gelada.
            </p>
            <div className="flex gap-2">
              {['IG', 'FB', 'YT', 'SP'].map(s => (
                <a key={s} href="#"
                   className="w-9 h-9 border border-border hover:border-brand hover:text-brand text-muted font-sans text-[8px] font-semibold flex items-center justify-center transition-all"
                   aria-label={s}>{s}</a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-sans text-[9px] tracking-[.28em] font-semibold uppercase text-muted mb-5">Links Rápidos</h3>
            <ul className="space-y-2.5">
              {NAV.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="font-sans text-muted hover:text-chalk text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-[9px] tracking-[.28em] font-semibold uppercase text-muted mb-5">Contato</h3>
            <ul className="space-y-3 font-sans text-muted text-sm">
              <li><address className="not-italic leading-relaxed">Rua [Endereço], 000<br />[Bairro], São Paulo — SP</address></li>
              <li><a href="tel:+5511XXXXXXXXX" className="hover:text-chalk transition-colors">(11) XXXX-XXXX</a></li>
              <li><a href="mailto:contato@manifestobar.com.br" className="hover:text-chalk transition-colors break-all">contato@manifestobar.com.br</a></li>
              <li className="leading-relaxed">Ter–Sex: 18h–2h<br />Sáb–Dom: 16h–3h</li>
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-[9px] tracking-[.28em] font-semibold uppercase text-muted mb-5">Como Chegar</h3>
            <div className="h-[160px] bg-surface border border-border flex items-center justify-center mb-3"
                 role="img" aria-label="Mapa — adicione o iframe do Google Maps">
              <span className="font-sans text-[#2A2A2A] text-[9px] tracking-[.2em] uppercase">Google Maps aqui</span>
            </div>
            <a href="https://maps.google.com/?q=Manifesto+Bar+São+Paulo"
               target="_blank" rel="noopener noreferrer"
               className="font-sans text-brand text-[9px] tracking-[.18em] font-semibold uppercase hover:text-chalk transition-colors flex items-center gap-1.5">
              Abrir no Google Maps <ArrowRightIcon className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-sans text-[#2e2e2e] text-[9px] tracking-[.22em] font-medium">
            © 1994–{new Date().getFullYear()} MANIFESTO BAR · TODOS OS DIREITOS RESERVADOS
          </p>
          <div className="flex gap-5">
            {['Privacidade', 'Termos'].map(t => (
              <a key={t} href="#" className="font-sans text-[#2e2e2e] hover:text-muted text-[9px] tracking-wider font-medium transition-colors">{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

// ══════════════════════════════════════════════════════════
// HOME — SECTIONS
// ══════════════════════════════════════════════════════════
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-ink" aria-label="Hero">
      {/* Static ambient glow — sem animation loop */}
      <div className="absolute top-[40%] left-[38%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
           style={{ background: '#982121', filter: 'blur(160px)', opacity: 0.11 }} aria-hidden="true" />

      {/* Grid lines */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-[20%] w-px h-full bg-gradient-to-b from-transparent via-border to-transparent opacity-50" />
        <div className="absolute top-0 left-[18%] w-px h-full bg-gradient-to-b from-transparent via-border/30 to-transparent hidden lg:block" />
      </div>

      {/* Ghost 1994 */}
      <div className="absolute bottom-0 right-0 font-display select-none pointer-events-none translate-y-[12%]"
           style={{ fontSize: '22vw', color: 'rgba(250,250,250,.028)' }} aria-hidden="true">
        1994
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20 w-full">

        <div className="flex items-center gap-3 mb-7 reveal-anim" style={{ animationDelay: '0s' }}>
          <div className="w-8 h-px bg-brand" />
          <span className="font-sans text-brand text-[9px] tracking-[.38em] font-semibold uppercase">O Templo do Rock</span>
          <div className="w-8 h-px bg-brand/30" />
          <span className="font-sans text-muted text-[9px] tracking-[.32em] uppercase font-medium">São Paulo</span>
        </div>

        <h1 className="font-display text-chalk leading-[.87] reveal-anim"
            style={{ fontSize: 'clamp(80px,13.5vw,160px)', animationDelay: '.07s' }}>
          MANI<span className="text-brand">FESTO</span>
        </h1>

        <div className="flex items-center gap-5 mt-2 mb-7 reveal-anim" style={{ animationDelay: '.13s' }}>
          <span className="font-sans text-muted text-xs tracking-[.38em] font-semibold uppercase">BAR</span>
          <div className="h-px w-28 bg-gradient-to-r from-border to-transparent" />
          <span className="font-sans text-muted text-xs tracking-[.32em] uppercase font-medium">Desde 1994</span>
        </div>

        <p className="font-sans text-muted leading-relaxed mb-10 reveal-anim"
           style={{ fontSize: 'clamp(.95rem,1.8vw,1.1rem)', maxWidth: 400, animationDelay: '.2s' }}>
          Shows ao vivo. Cerveja gelada.<br />
          A maior casa de rock de São Paulo que nunca apagou o amplificador.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 reveal-anim" style={{ animationDelay: '.28s' }}>
          <Link to="/programacao"
                className="font-sans text-xs tracking-[.2em] font-semibold uppercase bg-brand text-chalk px-8 py-4 hover:bg-[#7a1a1a] transition-colors text-center inline-flex items-center justify-center gap-2">
            <ArrowIcon className="w-4 h-4" /> Ver Programação
          </Link>
          <Link to="/cardapio"
                className="font-sans text-xs tracking-[.2em] font-semibold uppercase border border-border text-muted px-8 py-4 hover:border-chalk/30 hover:text-chalk transition-colors text-center">
            Ver Cardápio
          </Link>
        </div>

        <div className="flex gap-8 mt-14 pt-8 border-t border-border/40 reveal-anim" style={{ animationDelay: '.38s' }}>
          {[{ v: '30+', l: 'Anos de rock' }, { v: '5K+', l: 'Shows realizados' }, { v: '300', l: 'Capacidade' }].map(({ v, l }) => (
            <div key={l}>
              <div className="font-display text-chalk text-3xl leading-none">{v}</div>
              <div className="font-sans text-muted text-[8px] tracking-[.25em] font-medium uppercase mt-1">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" aria-hidden="true">
        <span className="font-sans text-[8px] text-border tracking-[.35em] uppercase font-medium">Role</span>
        <div className="w-px h-8 bg-gradient-to-b from-border to-transparent animate-bounce" />
      </div>
    </section>
  )
}

/* ── Marquee — CSS puro ── */
function Marquee() {
  const items = [...GENRES, ...GENRES]
  return (
    <div className="bg-brand py-3 overflow-hidden" aria-hidden="true">
      <div className="marquee-track">
        {items.map((g, i) => (
          <span key={i}
                className={cx('shrink-0 px-5 font-display',
                  g === '✦' ? 'text-[#7a1a1a] text-sm' : 'text-chalk text-xl tracking-[.22em]')}>
            {g}
          </span>
        ))}
      </div>
    </div>
  )
}

function Shows() {
  const [featured, ...rest] = SHOWS
  return (
    <section className="py-20 md:py-28 bg-ink" aria-labelledby="shows-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10">
            <SectionHeader idx="01" tag="Na grade" title="PRÓXIMOS SHOWS" className="mb-0" />
            <Link to="/programacao"
                  className="font-sans text-[10px] tracking-[.22em] font-semibold uppercase text-brand border border-brand/30 px-5 py-2.5 hover:border-brand transition-colors self-start flex items-center gap-2 shrink-0">
              Programação completa <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:row-span-2"><ShowCard show={featured} featured /></div>
            <ShowCard show={rest[0]} />
            <ShowCard show={rest[1]} />
            <div className="md:col-span-2"><ShowCard show={rest[2]} /></div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-4 flex items-center gap-3 border border-brand/20 bg-brand/[.04] px-5 py-3.5">
            <span className="w-1.5 h-1.5 bg-brand rounded-full shrink-0 animate-pulse" />
            <p className="font-sans text-[10px] text-chalk/60 tracking-wide">
              <span className="text-chalk font-semibold">Atenção:</span>{' '}
              Shows de fim de semana costumam esgotar na antevéspera.{' '}
              <Link to="/programacao" className="text-brand underline underline-offset-2 hover:no-underline">Garanta seu lugar.</Link>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Experience() {
  const pillars = [
    { n: '01', title: 'PALCO DE VERDADE', desc: 'Sistema de som profissional, iluminação de palco e estrutura que respeita tanto a banda quanto o público.' },
    { n: '02', title: 'CARDÁPIO ROCK',    desc: 'Chopps artesanais, drinques com nome de banda e petiscos que sustentam a noite toda.' },
    { n: '03', title: 'TRIBO DO ROCK',    desc: 'Trinta anos de história e uma comunidade que cresce a cada show. Você não vai sozinho — vai pra casa.' },
  ]
  return (
    <section className="py-20 md:py-28 bg-[#141414] border-y border-border" aria-labelledby="exp-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal><SectionHeader idx="02" tag="Por que o Manifesto" title="A EXPERIÊNCIA" /></Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {pillars.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.06}>
              <div className="bg-[#141414] p-8 md:p-10 group h-full hover:bg-brand/[.03] transition-colors duration-300">
                <div className="flex items-start justify-between mb-8">
                  <div className="w-10 h-10 border border-brand/25 flex items-center justify-center text-brand group-hover:bg-brand group-hover:border-brand group-hover:text-chalk transition-all duration-300">
                    <span className="font-sans text-[10px] tracking-widest font-semibold">{p.n}</span>
                  </div>
                  <span className="font-display text-chalk/[.04] text-6xl leading-none select-none">{p.n}</span>
                </div>
                <h3 className="font-display text-chalk text-2xl leading-none mb-4">{p.title}</h3>
                <p className="font-sans text-muted text-sm leading-relaxed">{p.desc}</p>
                <div className="mt-8 h-px bg-brand w-0 group-hover:w-full transition-all duration-500 ease-out" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function QuickActions() {
  type Color = 'red' | 'amber' | 'teal' | 'gray'
  const actions: Array<{ href: string; ext?: boolean; color: Color; title: string; desc: string; cta: string }> = [
    { href: '/programacao', color: 'red',   title: 'PROGRAMAÇÃO',   desc: 'Todos os shows, datas e ingressos.', cta: 'Ver agenda' },
    { href: '/cardapio',    color: 'amber', title: 'CARDÁPIO',      desc: 'Chopps, drinques e petiscos autorais.', cta: 'Ver cardápio' },
    { href: WA, ext: true,  color: 'teal',  title: 'RESERVAR MESA', desc: 'Via WhatsApp. Rápido, sem burocracia.', cta: 'Reservar agora' },
    { href: '/eventos',     color: 'gray',  title: 'EVENTOS',       desc: 'Corporativos, festas e comemorações.', cta: 'Saiba mais' },
  ]
  const hover: Record<Color, string> = { red: 'hover:border-brand/60', amber: 'hover:border-amber/60', teal: 'hover:border-teal/60', gray: 'hover:border-chalk/20' }
  const accent: Record<Color, string> = { red: 'text-brand', amber: 'text-amber', teal: 'text-teal', gray: 'text-muted group-hover:text-chalk' }

  return (
    <section className="py-20 md:py-28 bg-ink" aria-labelledby="actions-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal><SectionHeader idx="03" tag="O que você quer fazer" title="VAI FUNDO" /></Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map((a, i) => {
            const inner = (
              <div className={cx('group border border-border bg-surface p-7 flex flex-col gap-4 h-full transition-all duration-200 hover:-translate-y-1 cursor-pointer', hover[a.color])}>
                <div>
                  <div className="font-display text-chalk text-2xl leading-none mb-1.5">{a.title}</div>
                  <p className="font-sans text-muted text-sm">{a.desc}</p>
                </div>
                <div className={cx('flex items-center gap-2 font-sans text-[10px] tracking-[.2em] font-semibold uppercase mt-auto transition-transform duration-200 group-hover:translate-x-1', accent[a.color])}>
                  {a.cta} <ArrowRightIcon className="w-3 h-3" />
                </div>
              </div>
            )
            return (
              <Reveal key={a.title} delay={i * 0.055}>
                {a.ext ? <a href={a.href} target="_blank" rel="noopener noreferrer">{inner}</a> : <Link to={a.href}>{inner}</Link>}
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Stats() {
  const stats = [{ v: '30', s: '+', l: 'Anos de história' }, { v: '5K', s: '+', l: 'Shows realizados' }, { v: '300', s: '', l: 'Capacidade' }, { v: '30', s: '+', l: 'Shows por mês' }]
  return (
    <section className="bg-brand" aria-label="Estatísticas">
      <Reveal>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-chalk/20">
            {stats.map(({ v, s, l }) => (
              <div key={l} className="px-8 py-12 md:py-16 text-center">
                <div className="font-display text-chalk leading-none mb-2" style={{ fontSize: 'clamp(52px,8vw,76px)' }}>
                  {v}<span className="text-chalk/40">{s}</span>
                </div>
                <div className="font-sans text-chalk/40 text-[9px] tracking-[.25em] font-semibold uppercase">{l}</div>
              </div>
            ))}
          </div>
          <div className="px-6 py-12 border-t border-chalk/20 text-center">
            <blockquote className="font-display text-chalk/88 leading-tight max-w-3xl mx-auto" style={{ fontSize: 'clamp(22px,4vw,40px)' }}>
              "O Manifesto não é uma balada. É um estado de espírito."
            </blockquote>
            <cite className="font-sans text-chalk/25 text-[9px] tracking-[.28em] font-medium uppercase mt-4 block not-italic">
              — A Tribo do Manifesto
            </cite>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function Gallery() {
  const cells = [
    { cls: 'md:col-span-2 md:row-span-2', n: '01', grad: 'from-[#2A0808] to-[#0e0e0e]' },
    { cls: '', n: '02', grad: 'from-[#001520] to-[#0a0a0a]' },
    { cls: '', n: '03', grad: 'from-[#0c1812] to-[#0a0a0a]' },
    { cls: '', n: '04', grad: 'from-[#1a1505] to-[#0a0a0a]' },
    { cls: '', n: '05', grad: 'from-[#10090f] to-[#0a0a0a]' },
  ]
  return (
    <section className="py-20 md:py-28 bg-ink" aria-labelledby="gallery-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10">
            <SectionHeader idx="04" tag="Momentos do palco" title="GALERIA" className="mb-0" />
            <Link to="/galeria"
                  className="font-sans text-[10px] tracking-[.22em] font-semibold uppercase text-brand border border-brand/30 px-5 py-2.5 hover:border-brand transition-colors self-start flex items-center gap-2 shrink-0">
              Ver galeria <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2" style={{ gridAutoRows: '185px' }}>
            {cells.map(({ cls, n, grad }) => (
              <div key={n} className={cx('relative overflow-hidden cursor-pointer group bg-gradient-to-br', grad, cls)}
                   role="img" aria-label={`Foto ${n}`}>
                <div className="absolute inset-0 bg-brand/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <span className="font-display text-chalk text-xl tracking-[.3em]">VER</span>
                </div>
                <div className="absolute bottom-2 right-3 font-display text-chalk/[.06] text-5xl leading-none select-none">{n}</div>
                <div className="absolute top-2.5 left-3 font-sans text-[8px] text-chalk/10 tracking-[.2em] uppercase font-medium">img real aqui</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="relative py-28 md:py-40 bg-[#111] overflow-hidden border-t border-border" aria-label="CTA final">
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] rounded-full pointer-events-none translate-x-1/2 translate-y-1/3"
           style={{ background: 'rgba(152,33,33,.07)', filter: 'blur(90px)' }} aria-hidden="true" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <Reveal>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-10 bg-brand" />
            <span className="font-sans text-brand text-[9px] tracking-[.38em] font-semibold uppercase">O próximo show é</span>
            <div className="h-px w-10 bg-brand" />
          </div>
          <h2 className="font-display text-chalk leading-[.87] mb-7" style={{ fontSize: 'clamp(58px,11vw,116px)' }}>
            NO SEU<br /><span className="text-brand">CALENDÁRIO</span>
          </h2>
          <p className="font-sans text-muted text-base mb-10 max-w-sm mx-auto leading-relaxed">
            Shows esgotam rápido. Garantir seu lugar no Manifesto é a melhor decisão da semana.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/programacao"
                  className="font-sans text-xs tracking-[.22em] font-semibold uppercase bg-brand text-chalk px-10 py-4 hover:bg-[#7a1a1a] transition-colors inline-flex items-center justify-center gap-2.5">
              <ArrowIcon className="w-4 h-4" /> Garantir Meu Ingresso
            </Link>
            <a href={WA} target="_blank" rel="noopener noreferrer"
               className="font-sans text-xs tracking-[.22em] font-semibold uppercase border border-teal/40 text-teal px-10 py-4 hover:border-teal/70 hover:bg-teal/5 transition-colors inline-flex items-center justify-center gap-2.5">
              <WaIcon className="w-4 h-4" /> Reservar Mesa
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Home() {
  return <>
    <Hero /><Marquee /><Shows /><Experience /><QuickActions /><Stats /><Gallery /><FinalCTA />
  </>
}

// ══════════════════════════════════════════════════════════
// STUB PAGE
// ══════════════════════════════════════════════════════════
function StubPageComp({ title }: { title: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="text-center px-4">
        <div className="font-sans text-brand text-[10px] tracking-[.3em] font-semibold uppercase mb-4">// Em construção</div>
        <h1 className="font-display text-chalk leading-none mb-6" style={{ fontSize: 'clamp(52px,8vw,86px)' }}>
          {title.toUpperCase()}
        </h1>
        <p className="font-sans text-muted mb-8 max-w-sm mx-auto text-sm leading-relaxed">Essa página está sendo construída. Já vem, fera.</p>
        <Link to="/"
              className="font-sans text-[10px] tracking-[.22em] font-semibold uppercase text-brand border border-brand/30 px-6 py-3 hover:border-brand transition-colors inline-flex items-center gap-2">
          <ArrowRightIcon className="w-3 h-3 rotate-180" /> Voltar ao início
        </Link>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// ICONS
// ══════════════════════════════════════════════════════════
function ArrowIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
}
function ArrowRightIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
}
function WaIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.18-.008-.381-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
}

// ══════════════════════════════════════════════════════════
// APP ROOT
// ══════════════════════════════════════════════════════════
export default function App() {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <Routes>
            <Route path="/"                element={<Home />} />
            <Route path="/programacao"     element={<StubPage title="Programação" />} />
            <Route path="/cardapio"        element={<StubPage title="Cardápio" />} />
            <Route path="/eventos"         element={<StubPage title="Eventos" />} />
            <Route path="/aniversariantes" element={<StubPage title="Aniversariantes" />} />
            <Route path="/galeria"         element={<StubPage title="Galeria" />} />
            <Route path="/contato"         element={<StubPage title="Contato" />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  )
}

/*
══════════════════════════════════════════════════════
  MANIFESTO BAR — DESIGN SYSTEM (brandbook v1)
══════════════════════════════════════════════════════
  CORES BRANDBOOK
  ────────────────
  #1b1b1b  ink     fundo principal (70%)
  #982121  brand   vermelho
  #00455a  teal    azul petróleo
  #dd9a32  amber   dourado
  #fafafa  chalk   branco (10%)

  FONTES BRANDBOOK
  ─────────────────
  Machine Regular   → display (self-hoste em /public/fonts/)
  Gotham Medium     → subtítulos (self-hoste)
  Gotham Book       → textos corridos (self-hoste)

  SUBSTITUIÇÕES DE DEV
  ─────────────────────
  Bebas Neue  ≈ Machine Regular
  Montserrat  ≈ Gotham

  PERFORMANCE — O QUE FOI OTIMIZADO
  ────────────────────────────────────
  ✓ Marquee 100% CSS (keyframe, sem framer-motion)
  ✓ Hero sem useScroll/parallax
  ✓ Reveal via CSS transition + useInView (sem motion.div)
  ✓ Glow hero estático (sem animation loop)
  ✓ AnimatePresence apenas no menu mobile
  ✓ Hamburger: CSS transform nativo
  ✓ Rotas lazy via Suspense

  PARA AUTO-HOSPEDAR FONTES DO BRANDBOOK
  ────────────────────────────────────────
  1. Adicionar arquivos em /public/fonts/
  2. Descomentar @font-face em index.css
  3. tailwind.config.ts: display: ['"Machine"', ...]
══════════════════════════════════════════════════════
*/
