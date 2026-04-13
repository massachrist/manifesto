import { useRef, useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import {
  motion,
  AnimatePresence,
  useInView,
  useScroll,
  useTransform,
} from 'framer-motion'

// ══════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════
const WA = 'https://wa.me/5511XXXXXXXXX?text=Oi!%20Quero%20reservar%20uma%20mesa.'

const GENRES = [
  'ROCK', 'METAL', 'PUNK', 'BLUES', 'GRUNGE',
  'HARDCORE', 'THRASH', 'CLASSIC ROCK', 'HEAVY METAL', 'INDIE ROCK',
]

const NAV = [
  { to: '/programacao',     label: 'Programação' },
  { to: '/cardapio',        label: 'Cardápio' },
  { to: '/eventos',         label: 'Eventos' },
  { to: '/aniversariantes', label: 'Aniversariantes' },
  { to: '/galeria',         label: 'Galeria' },
  { to: '/contato',         label: 'Contato' },
]

// ══════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════
type ShowStatus = 'featured' | 'available' | 'last' | 'free'
interface Show {
  id: number
  weekday: string
  day: number
  month: string
  time: string
  name: string
  desc: string
  genre: string
  price: number
  status: ShowStatus
}

// ══════════════════════════════════════════════════════════
// DATA — troque por dados reais ou fetch de API
// ══════════════════════════════════════════════════════════
const SHOWS: Show[] = [
  {
    id: 1, weekday: 'SEX', day: 18, month: 'ABR', time: '22H',
    name: 'SEPULTURA TRIBUTE FEST',
    desc: 'A brutalidade de Beneath The Remains ao vivo. A melhor banda tributo de SP no palco do Manifesto.',
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
    desc: 'O underground paulistano reunido em uma noite de punk e hardcore raiz.',
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
// UTILITIES
// ══════════════════════════════════════════════════════════
function cx(...cls: (string | false | null | undefined)[]) {
  return cls.filter(Boolean).join(' ')
}

// ══════════════════════════════════════════════════════════
// REVEAL WRAPPER
// ══════════════════════════════════════════════════════════
function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.72, delay, ease: [0.22, 0.68, 0, 1.1] }}
    >
      {children}
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════
// SECTION HEADER
// ══════════════════════════════════════════════════════════
function SectionHeader({
  num,
  tag,
  title,
  className,
}: {
  num: string
  tag: string
  title: string
  className?: string
}) {
  return (
    <div className={cx('mb-12 md:mb-16', className)}>
      <div className="flex items-center gap-3 mb-5">
        <span className="font-mono text-brand text-[10px] tracking-[.3em]">// {num}</span>
        <div className="h-px w-10 bg-brand/40" />
        <span className="font-mono text-muted text-[10px] tracking-[.28em] uppercase">{tag}</span>
      </div>
      <h2
        className="font-display text-warm leading-none"
        style={{ fontSize: 'clamp(44px,7vw,86px)' }}
      >
        {title}
      </h2>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// STATUS BADGE
// ══════════════════════════════════════════════════════════
function Badge({ status }: { status: ShowStatus }) {
  const cfg: Record<ShowStatus, { label: string; cls: string }> = {
    featured:  { label: 'EM BREVE',        cls: 'bg-brand text-white' },
    available: { label: 'DISPONÍVEL',      cls: 'border border-amber/50 text-amber' },
    last:      { label: 'ÚLTIMOS',         cls: 'border border-warm/20 text-warm/40' },
    free:      { label: 'ENTRADA FRANCA',  cls: 'border border-green-500/40 text-green-400' },
  }
  const { label, cls } = cfg[status]
  return (
    <span className={cx('font-mono text-[9px] tracking-[.22em] px-2.5 py-1 shrink-0', cls)}>
      {label}
    </span>
  )
}

// ══════════════════════════════════════════════════════════
// SHOW CARD
// ══════════════════════════════════════════════════════════
function ShowCard({ show, featured = false }: { show: Show; featured?: boolean }) {
  const pad = featured ? 'p-7' : 'p-5'
  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className="relative border border-border bg-surface overflow-hidden flex flex-col h-full group"
      aria-label={`Show: ${show.name}`}
    >
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
           style={{ background: 'radial-gradient(circle at 50% 0%, rgba(200,16,46,.06) 0%, transparent 60%)' }} />

      {/* Date + badge */}
      <div className={cx('flex items-start justify-between', pad, 'pb-0')}>
        <div>
          <div className="font-mono text-muted text-[9px] tracking-[.25em] mb-0.5">{show.weekday}</div>
          <div
            className="font-display text-warm leading-none"
            style={{ fontSize: featured ? '68px' : '52px' }}
          >
            {show.day}
          </div>
          <div className="font-mono text-muted text-[9px] tracking-[.2em]">
            {show.month} · {show.time}
          </div>
        </div>
        <Badge status={show.status} />
      </div>

      {/* Perforation divider */}
      <div className={cx('mx-5 my-4 border-t border-dashed border-border/70', featured && 'mx-7')} />

      {/* Body */}
      <div className={cx('flex flex-col flex-1', featured ? 'px-7' : 'px-5')}>
        <div className="font-mono text-muted text-[9px] tracking-[.22em] mb-2">{show.genre}</div>
        <h3
          className="font-display text-warm leading-none mb-3"
          style={{ fontSize: featured ? 'clamp(26px,3vw,44px)' : '26px' }}
        >
          {show.name}
        </h3>
        {featured && (
          <p className="font-body text-muted text-sm leading-relaxed flex-1 mb-5">{show.desc}</p>
        )}
      </div>

      {/* Price + CTA */}
      <div className={cx('mt-auto border-t border-border flex items-center justify-between', pad)}>
        <div>
          <div className="font-mono text-muted text-[8px] tracking-[.2em] mb-0.5">A PARTIR DE</div>
          {show.status === 'free'
            ? <span className="font-display text-green-400 text-3xl leading-none">GRÁTIS</span>
            : <span className="font-display text-amber text-3xl leading-none">R$ {show.price}</span>
          }
        </div>
        <motion.a
          href="/programacao"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={cx(
            'font-mono text-[10px] tracking-[.2em] uppercase px-5 py-3 transition-colors',
            show.status === 'free'
              ? 'border border-border text-muted hover:border-warm/30 hover:text-warm'
              : 'bg-brand text-white hover:bg-brand/85',
          )}
        >
          {show.status === 'free' ? 'VER MAIS' : 'COMPRAR'}
        </motion.a>
      </div>

      {/* Ghost number */}
      <div className="absolute bottom-2 right-3 font-display text-[72px] text-white/[0.03] leading-none select-none pointer-events-none">
        {String(show.id).padStart(2, '0')}
      </div>
    </motion.article>
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

  // Close menu on route change
  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    const fn = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      if (y > 80) setHidden(y > last.current)
      else setHidden(false)
      last.current = y
    }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* ── Header bar ── */}
      <motion.header
        animate={{ y: hidden ? '-100%' : '0%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cx(
          'fixed top-0 inset-x-0 z-50 transition-colors duration-300',
          scrolled
            ? 'bg-[#040404]/92 backdrop-blur-sm border-b border-border'
            : 'bg-transparent',
        )}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 md:h-[68px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="Manifesto Bar — Início">
            <div className="w-9 h-9 bg-brand flex items-center justify-center" aria-hidden="true">
              <span className="font-display text-white text-[22px] leading-none">M</span>
            </div>
            <div className="leading-none hidden sm:block">
              <div className="font-display text-warm text-[17px] tracking-wider leading-none">MANIFESTO</div>
              <div className="font-mono text-[#3A3A3A] text-[8px] tracking-[.38em] uppercase">BAR · SP · 1994</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Navegação principal">
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={cx(
                  'font-mono text-[10px] tracking-[.15em] uppercase transition-colors',
                  pathname === to ? 'text-warm' : 'text-muted hover:text-warm',
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-2">
            <a
              href={WA}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] tracking-[.18em] uppercase text-green-400 border border-green-500/30 px-4 py-2.5 hover:border-green-500/70 transition-colors flex items-center gap-2"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
              Mesa
            </a>
            <Link
              to="/programacao"
              className="font-mono text-[10px] tracking-[.18em] uppercase bg-brand text-white px-4 py-2.5 hover:bg-brand/85 transition-colors"
            >
              Ingressos
            </Link>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setOpen(v => !v)}
            className="lg:hidden p-2 flex flex-col gap-[5px]"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="block w-6 h-0.5 bg-warm origin-center"
                animate={
                  i === 0 ? { rotate: open ? 45 : 0, y: open ? 7 : 0 } :
                  i === 1 ? { opacity: open ? 0 : 1, scaleX: open ? 0 : 1 } :
                            { rotate: open ? -45 : 0, y: open ? -7 : 0 }
                }
              />
            ))}
          </button>
        </div>
      </motion.header>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.42, ease: [0.22, 0.68, 0, 1] }}
            className="fixed inset-0 z-40 bg-[#040404] flex flex-col pt-20 px-6 pb-10 overflow-auto"
            role="dialog"
            aria-label="Menu de navegação"
          >
            {/* Ghost M */}
            <div
              className="absolute -bottom-10 -right-8 font-display leading-none select-none pointer-events-none"
              style={{ fontSize: '55vw', color: 'rgba(255,255,255,0.025)' }}
              aria-hidden="true"
            >
              M
            </div>

            <nav className="flex flex-col flex-1 relative z-10">
              {NAV.map(({ to, label }, i) => (
                <motion.div
                  key={to}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 + 0.1 }}
                >
                  <Link
                    to={to}
                    className="font-display text-warm py-3.5 border-b border-border/40 hover:text-brand transition-colors flex items-center justify-between group"
                    style={{ fontSize: 'clamp(32px,8vw,52px)' }}
                  >
                    {label}
                    <span className="font-mono text-[10px] text-muted tracking-widest group-hover:text-brand transition-colors">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-3 mt-8 relative z-10"
            >
              <a
                href={WA}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-center py-4 border border-green-500/40 text-green-400 tracking-[.2em] uppercase hover:border-green-400 transition-colors"
              >
                Reservar Mesa via WhatsApp
              </a>
              <Link
                to="/programacao"
                className="font-mono text-xs text-center py-4 bg-brand text-white tracking-[.2em] uppercase hover:bg-brand/85 transition-colors"
              >
                Comprar Ingresso
              </Link>
            </motion.div>

            <div className="mt-6 font-mono text-[9px] text-[#2A2A2A] tracking-[.3em] text-center relative z-10">
              MANIFESTO BAR · SÃO PAULO · DESDE 1994
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
  const year = new Date().getFullYear()
  return (
    <footer className="bg-[#040404] border-t border-border" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-6" aria-label="Manifesto Bar">
              <div className="w-11 h-11 bg-brand flex items-center justify-center shrink-0">
                <span className="font-display text-white text-2xl leading-none">M</span>
              </div>
              <div className="leading-none">
                <div className="font-display text-warm text-xl">MANIFESTO</div>
                <div className="font-mono text-[#3A3A3A] text-[8px] tracking-[.38em] uppercase">BAR · SP · 1994</div>
              </div>
            </Link>
            <p className="font-body text-muted text-sm leading-relaxed mb-6">
              O Templo do Rock de São Paulo. Desde 1994, mantendo o volume alto e a cerveja gelada.
            </p>
            <div className="flex gap-2" aria-label="Redes sociais">
              {['IG', 'FB', 'YT', 'SP'].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-9 h-9 border border-border hover:border-brand hover:text-brand text-muted font-mono text-[9px] flex items-center justify-center transition-all"
                  aria-label={s === 'IG' ? 'Instagram' : s === 'FB' ? 'Facebook' : s === 'YT' ? 'YouTube' : 'Spotify'}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-mono text-[9px] tracking-[.28em] uppercase text-muted mb-5">Links Rápidos</h3>
            <ul className="space-y-3">
              {NAV.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="font-body text-muted hover:text-warm text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-mono text-[9px] tracking-[.28em] uppercase text-muted mb-5">Contato</h3>
            <ul className="space-y-4 font-body text-muted text-sm">
              <li>
                <address className="not-italic leading-relaxed">
                  Rua [Endereço], 000<br />
                  [Bairro], São Paulo — SP
                </address>
              </li>
              <li>
                <a href="tel:+5511XXXXXXXXX" className="hover:text-warm transition-colors">(11) XXXX-XXXX</a>
              </li>
              <li>
                <a href="mailto:contato@manifestobar.com.br" className="hover:text-warm transition-colors break-all">
                  contato@manifestobar.com.br
                </a>
              </li>
              <li className="leading-relaxed">
                Ter–Sex: 18h–2h<br />Sáb–Dom: 16h–3h
              </li>
            </ul>
          </div>

          {/* Map */}
          <div>
            <h3 className="font-mono text-[9px] tracking-[.28em] uppercase text-muted mb-5">Como Chegar</h3>
            {/* Substitua pelo iframe real: <iframe src="https://maps.google.com/maps?..." */}
            <div
              className="h-[170px] bg-surface border border-border flex items-center justify-center mb-3"
              role="img"
              aria-label="Mapa — substitua pelo iframe do Google Maps"
            >
              <div className="text-center px-4">
                <div className="font-mono text-[#2A2A2A] text-[9px] tracking-[.2em] uppercase leading-loose">
                  {'<iframe>'}
                  <br />Google Maps
                  <br />aqui
                </div>
              </div>
            </div>
            <a
              href="https://maps.google.com/?q=Manifesto+Bar+São+Paulo"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-brand text-[9px] tracking-[.2em] uppercase hover:text-warm transition-colors flex items-center gap-1.5"
            >
              Abrir no Google Maps
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-[#2E2E2E] text-[9px] tracking-[.22em]">
            © 1994–{year} MANIFESTO BAR · TODOS OS DIREITOS RESERVADOS
          </p>
          <div className="flex gap-5">
            <a href="#" className="font-mono text-[#2E2E2E] hover:text-muted text-[9px] tracking-wider transition-colors">Privacidade</a>
            <a href="#" className="font-mono text-[#2E2E2E] hover:text-muted text-[9px] tracking-wider transition-colors">Termos</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ══════════════════════════════════════════════════════════
// PAGE — HOME
// ══════════════════════════════════════════════════════════

/* ── Hero ── */
function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const contentY  = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const contentOp = useTransform(scrollYProgress, [0, 0.65], [1, 0])

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden"
      aria-label="Hero — Manifesto Bar"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[#040404]" />

      {/* Animated red glow */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.14, 0.2, 0.14] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-[40%] -translate-x-1/2 -translate-y-[55%] w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: '#C8102E', filter: 'blur(140px)' }}
        aria-hidden="true"
      />

      {/* Vertical rule lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-[18%] w-px h-full bg-gradient-to-b from-transparent via-border to-transparent" />
        <div className="absolute top-0 right-[35%] w-px h-full bg-gradient-to-b from-transparent via-border/40 to-transparent" />
        <div className="absolute top-0 left-[20%] w-px h-full bg-gradient-to-b from-transparent via-border/25 to-transparent hidden lg:block" />
      </div>

      {/* Ghost year */}
      <div
        className="absolute bottom-0 right-0 font-display text-warm select-none pointer-events-none translate-y-[12%] translate-x-[5%]"
        style={{ fontSize: '22vw', color: 'rgba(240,237,232,0.028)' }}
        aria-hidden="true"
      >
        1994
      </div>

      {/* Red diagonal bar */}
      <div
        className="absolute top-0 right-[18%] w-[3px] h-full bg-brand/25 hidden lg:block"
        aria-hidden="true"
      />

      {/* Content */}
      <motion.div
        style={{ y: contentY, opacity: contentOp }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20 w-full"
      >
        {/* Tag line */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="flex items-center gap-3 mb-7"
        >
          <div className="w-8 h-px bg-brand" />
          <span className="font-mono text-brand text-[9px] tracking-[.35em] uppercase">O Templo do Rock</span>
          <div className="w-8 h-px bg-brand/30" />
          <span className="font-mono text-muted text-[9px] tracking-[.3em] uppercase">São Paulo</span>
        </motion.div>

        {/* Main headline */}
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: '105%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.82, ease: [0.22, 0.68, 0, 1] }}
            className="font-display text-warm leading-[.86]"
            style={{ fontSize: 'clamp(78px, 13.5vw, 158px)' }}
          >
            MANI
            <span className="text-brand">FESTO</span>
          </motion.h1>
        </div>

        {/* Sub headline row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex items-center gap-5 mt-2 mb-8"
        >
          <span className="font-mono text-muted text-xs tracking-[.38em] uppercase">BAR</span>
          <div className="h-px flex-1 max-w-[180px] bg-gradient-to-r from-border to-transparent" />
          <span className="font-mono text-muted text-xs tracking-[.32em] uppercase">Desde 1994</span>
        </motion.div>

        {/* Descriptor */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.65 }}
          className="font-body text-muted max-w-[420px] mb-10 leading-relaxed"
          style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.12rem)' }}
        >
          Shows ao vivo. Cerveja gelada.<br />
          A maior casa de rock de São Paulo que nunca apagou o amplificador.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.56, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Link
            to="/programacao"
            className="font-mono text-xs tracking-[.2em] uppercase bg-brand text-white px-8 py-4 hover:bg-brand/85 transition-colors text-center inline-flex items-center justify-center gap-2"
          >
            <ArrowIcon className="w-4 h-4" />
            Ver Programação
          </Link>
          <Link
            to="/cardapio"
            className="font-mono text-xs tracking-[.2em] uppercase border border-border text-muted px-8 py-4 hover:border-warm/30 hover:text-warm transition-colors text-center"
          >
            Ver Cardápio
          </Link>
        </motion.div>

        {/* Mini stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.82 }}
          className="flex gap-8 mt-14 pt-8 border-t border-border/40"
        >
          {[
            { v: '30+', l: 'Anos de rock' },
            { v: '5K+', l: 'Shows realizados' },
            { v: '300', l: 'Capacidade' },
          ].map(({ v, l }) => (
            <div key={l}>
              <div className="font-display text-warm text-3xl leading-none">{v}</div>
              <div className="font-mono text-muted text-[8px] tracking-[.25em] uppercase mt-1">{l}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" aria-hidden="true">
        <span className="font-mono text-[8px] text-[#2A2A2A] tracking-[.35em] uppercase">Role</span>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-8 bg-gradient-to-b from-border to-transparent"
        />
      </div>
    </section>
  )
}

/* ── Marquee ── */
function Marquee() {
  const doubled = [...GENRES, ...GENRES, ...GENRES]
  return (
    <div className="bg-brand py-3 overflow-hidden" aria-hidden="true">
      <motion.div
        animate={{ x: '-33.33%' }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        className="flex whitespace-nowrap will-change-transform"
      >
        {doubled.map((g, i) => (
          <span key={i} className="flex items-center shrink-0">
            <span className="font-display text-white text-xl tracking-[.22em] px-6">{g}</span>
            <span className="font-display text-white/25 text-base px-1">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}

/* ── Upcoming Shows ── */
function Shows() {
  const [featured, ...rest] = SHOWS
  return (
    <section className="py-20 md:py-28 bg-[#040404]" aria-labelledby="shows-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <SectionHeader num="01" tag="Na grade" title="PRÓXIMOS SHOWS" className="mb-0" />
            <Link
              to="/programacao"
              className="font-mono text-[10px] tracking-[.22em] uppercase text-brand border border-brand/30 px-5 py-2.5 hover:border-brand transition-colors self-start flex items-center gap-2 shrink-0"
            >
              Programação completa <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          {/* Grid: featured left (row-span-2) + 2 right top + 1 right bottom (col-span-2) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3" style={{ gridAutoRows: 'auto' }}>
            {/* Featured */}
            <div className="md:row-span-2">
              <ShowCard show={featured} featured />
            </div>
            {/* Rest[0] and Rest[1] */}
            <ShowCard show={rest[0]} />
            <ShowCard show={rest[1]} />
            {/* Rest[2] spans 2 cols */}
            <div className="md:col-span-2">
              <ShowCard show={rest[2]} />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-4 flex items-center gap-3 border border-brand/20 bg-brand/[0.04] px-5 py-3.5">
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-brand rounded-full shrink-0"
            />
            <p className="font-mono text-[10px] text-warm/60 tracking-wide">
              <span className="text-warm font-semibold">Atenção:</span>{' '}
              Shows de fim de semana costumam esgotar na antevéspera.{' '}
              <Link to="/programacao" className="text-brand underline underline-offset-2 hover:no-underline">
                Garanta seu lugar agora.
              </Link>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ── Experience ── */
function Experience() {
  const pillars = [
    {
      num: '01',
      icon: <MusicIcon className="w-5 h-5" />,
      title: 'PALCO DE VERDADE',
      desc: 'Sistema de som profissional, iluminação de palco e estrutura que respeita tanto a banda quanto o público. Aqui, show é show de verdade.',
    },
    {
      num: '02',
      icon: <BeerIcon className="w-5 h-5" />,
      title: 'CARDÁPIO ROCK',
      desc: 'Chopps artesanais, drinques com nome de banda e petiscos que sustentam a noite. Pensado pra combinar com o volume lá em cima.',
    },
    {
      num: '03',
      icon: <PeopleIcon className="w-5 h-5" />,
      title: 'TRIBO DO ROCK',
      desc: 'Trinta anos de história, fãs de verdade e uma comunidade que cresce a cada show. Você não vai sozinho — vai pra casa.',
    },
  ]

  return (
    <section className="py-20 md:py-28 bg-[#070707] border-y border-border" aria-labelledby="exp-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal>
          <SectionHeader num="02" tag="Por que o Manifesto" title="A EXPERIÊNCIA" />
        </Reveal>

        {/* Pillars — gap-px with bg-border creates 1px dividers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {pillars.map((p, i) => (
            <Reveal key={p.num} delay={i * 0.07}>
              <motion.div
                whileHover={{ backgroundColor: 'rgba(200,16,46,0.03)' }}
                className="bg-[#070707] p-8 md:p-10 group h-full"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="w-10 h-10 border border-brand/25 flex items-center justify-center text-brand group-hover:bg-brand group-hover:border-brand group-hover:text-white transition-all duration-300">
                    {p.icon}
                  </div>
                  <span className="font-display text-white/[0.04] text-6xl leading-none select-none">{p.num}</span>
                </div>
                <h3 className="font-display text-warm text-2xl leading-none mb-4">{p.title}</h3>
                <p className="font-body text-muted text-sm leading-relaxed">{p.desc}</p>
                <div className="mt-8 h-px bg-brand w-0 group-hover:w-full transition-all duration-500 ease-out" />
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Quick Actions ── */
function QuickActions() {
  type Color = 'red' | 'amber' | 'green' | 'gray'
  const actions: Array<{ href: string; external?: boolean; color: Color; title: string; desc: string; cta: string; icon: React.ReactNode }> = [
    { href: '/programacao', color: 'red',   title: 'PROGRAMAÇÃO',  desc: 'Todos os shows, datas e ingressos.', cta: 'Ver agenda',      icon: <CalIcon className="w-8 h-8" /> },
    { href: '/cardapio',    color: 'amber', title: 'CARDÁPIO',     desc: 'Chopps, drinques e petiscos autorais.', cta: 'Ver cardápio',  icon: <BeerIcon className="w-8 h-8" /> },
    { href: WA, external: true, color: 'green', title: 'RESERVAR MESA', desc: 'Via WhatsApp. Rápido, sem burocracia.', cta: 'Reservar agora', icon: <WhatsAppIcon className="w-8 h-8" /> },
    { href: '/eventos',     color: 'gray',  title: 'EVENTOS',      desc: 'Corporativos, festas e comemorações.', cta: 'Saiba mais',     icon: <BuildingIcon className="w-8 h-8" /> },
  ]

  const hoverBorder: Record<Color, string> = {
    red:   'group-hover:border-brand/60',
    amber: 'group-hover:border-amber/60',
    green: 'group-hover:border-green-500/60',
    gray:  'group-hover:border-white/20',
  }
  const ctaColor: Record<Color, string> = {
    red:   'text-brand',
    amber: 'text-amber',
    green: 'text-green-400',
    gray:  'text-muted group-hover:text-warm',
  }
  const iconColor: Record<Color, string> = {
    red:   'text-brand',
    amber: 'text-amber',
    green: 'text-green-400',
    gray:  'text-muted',
  }

  return (
    <section className="py-20 md:py-28 bg-[#040404]" aria-labelledby="actions-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal>
          <SectionHeader num="03" tag="O que você quer fazer" title="VAI FUNDO" />
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map((a, i) => {
            const content = (
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.18 }}
                className={cx(
                  'group border border-border bg-surface p-7 flex flex-col gap-5 h-full transition-colors duration-200 cursor-pointer',
                  hoverBorder[a.color],
                )}
              >
                <div className={cx('transition-colors', iconColor[a.color])}>{a.icon}</div>
                <div className="flex-1">
                  <div className="font-display text-warm text-2xl leading-none mb-2">{a.title}</div>
                  <p className="font-body text-muted text-sm">{a.desc}</p>
                </div>
                <div className={cx(
                  'flex items-center gap-2 font-mono text-[10px] tracking-[.2em] uppercase transition-all duration-200 group-hover:translate-x-1',
                  ctaColor[a.color],
                )}>
                  {a.cta} <ArrowRightIcon className="w-3 h-3" />
                </div>
              </motion.div>
            )

            return (
              <Reveal key={a.title} delay={i * 0.06}>
                {a.external
                  ? <a href={a.href} target="_blank" rel="noopener noreferrer" aria-label={a.title}>{content}</a>
                  : <Link to={a.href} aria-label={a.title}>{content}</Link>
                }
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ── Stats ── */
function Stats() {
  const stats = [
    { v: '30', s: '+', l: 'Anos de história' },
    { v: '5K', s: '+', l: 'Shows realizados' },
    { v: '300', s: '',  l: 'Capacidade' },
    { v: '30', s: '+', l: 'Shows por mês' },
  ]
  return (
    <section className="bg-brand" aria-label="Estatísticas do Manifesto Bar">
      <Reveal>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/20">
            {stats.map(({ v, s, l }) => (
              <div key={l} className="px-8 py-12 md:py-16 text-center">
                <div
                  className="font-display text-white leading-none mb-2"
                  style={{ fontSize: 'clamp(52px, 8vw, 78px)' }}
                >
                  {v}<span className="text-white/50">{s}</span>
                </div>
                <div className="font-mono text-white/45 text-[9px] tracking-[.25em] uppercase">{l}</div>
              </div>
            ))}
          </div>
          <div className="px-6 py-12 border-t border-white/20 text-center">
            <blockquote
              className="font-display text-white/88 leading-tight max-w-3xl mx-auto"
              style={{ fontSize: 'clamp(24px, 4vw, 42px)' }}
            >
              "O Manifesto não é uma balada. É um estado de espírito."
            </blockquote>
            <cite className="font-mono text-white/25 text-[9px] tracking-[.28em] uppercase mt-4 block not-italic">
              — A Tribo do Manifesto
            </cite>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

/* ── Gallery Teaser ── */
function Gallery() {
  const cells = [
    { cls: 'md:col-span-2 md:row-span-2', from: '#2A0808', to: '#0E0E0E', n: '01' },
    { cls: '',                             from: '#121220', to: '#0A0A0A', n: '02' },
    { cls: '',                             from: '#0C1812', to: '#0A0A0A', n: '03' },
    { cls: '',                             from: '#1A1505', to: '#0A0A0A', n: '04' },
    { cls: '',                             from: '#10090F', to: '#0A0A0A', n: '05' },
  ]

  return (
    <section className="py-20 md:py-28 bg-[#040404]" aria-labelledby="gallery-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <SectionHeader num="04" tag="Momentos do palco" title="GALERIA" className="mb-0" />
            <Link
              to="/galeria"
              className="font-mono text-[10px] tracking-[.22em] uppercase text-brand border border-brand/30 px-5 py-2.5 hover:border-brand transition-colors self-start flex items-center gap-2 shrink-0"
            >
              Ver galeria completa <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2" style={{ gridAutoRows: '185px' }}>
            {cells.map(({ cls, from, to, n }) => (
              <motion.div
                key={n}
                whileHover={{ scale: 1.015 }}
                transition={{ duration: 0.18 }}
                className={cx('relative overflow-hidden cursor-pointer group', cls)}
                style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                role="img"
                aria-label={`Foto ${n} — substitua por <img> real em /src/assets/`}
              >
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-brand/75 opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex items-center justify-center">
                  <span className="font-display text-white text-xl tracking-[.3em]">VER</span>
                </div>
                {/* Number */}
                <div className="absolute bottom-2 right-3 font-display text-white/[0.07] text-5xl leading-none select-none">
                  {n}
                </div>
                {/* Placeholder label */}
                <div className="absolute top-2.5 left-3 font-mono text-[8px] text-white/15 tracking-[.2em] uppercase">
                  Foto real aqui
                </div>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ── Final CTA ── */
function FinalCTA() {
  return (
    <section
      className="relative py-28 md:py-44 bg-[#070707] overflow-hidden border-t border-border"
      aria-label="Chamada final para ação"
    >
      {/* Ambient glow */}
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none translate-x-1/2 translate-y-1/3"
        style={{ background: 'rgba(200,16,46,0.07)', filter: 'blur(90px)' }}
        aria-hidden="true"
      />
      <div
        className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{ background: 'rgba(200,16,46,0.04)', filter: 'blur(70px)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <Reveal>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-12 bg-brand" />
            <span className="font-mono text-brand text-[9px] tracking-[.35em] uppercase">O próximo show é</span>
            <div className="h-px w-12 bg-brand" />
          </div>

          <h2
            className="font-display text-warm leading-[.87] mb-7"
            style={{ fontSize: 'clamp(62px, 11vw, 118px)' }}
          >
            NO SEU<br />
            <span className="text-brand">CALENDÁRIO</span>
          </h2>

          <p className="font-body text-muted text-lg mb-10 max-w-sm mx-auto leading-relaxed">
            Shows esgotam rápido. Garantir seu lugar no Manifesto é a melhor decisão da semana.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/programacao"
              className="font-mono text-xs tracking-[.22em] uppercase bg-brand text-white px-10 py-5 hover:bg-brand/85 transition-colors inline-flex items-center justify-center gap-2.5"
            >
              <ArrowIcon className="w-4 h-4" />
              Garantir Meu Ingresso
            </Link>
            <a
              href={WA}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs tracking-[.22em] uppercase border border-green-500/35 text-green-400 px-10 py-5 hover:border-green-400/70 transition-colors inline-flex items-center justify-center gap-2.5"
            >
              <WhatsAppIcon className="w-4 h-4" />
              Reservar Mesa
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ── Home assembled ── */
function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Shows />
      <Experience />
      <QuickActions />
      <Stats />
      <Gallery />
      <FinalCTA />
    </>
  )
}

// ══════════════════════════════════════════════════════════
// STUB PAGES — substituir por páginas reais no futuro
// ══════════════════════════════════════════════════════════
function StubPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="text-center px-4">
        <div className="font-mono text-brand text-[10px] tracking-[.3em] uppercase mb-4">// Em construção</div>
        <h1
          className="font-display text-warm leading-none mb-6"
          style={{ fontSize: 'clamp(52px, 8vw, 86px)' }}
        >
          {title.toUpperCase()}
        </h1>
        <p className="font-body text-muted mb-8 max-w-sm mx-auto">
          Essa página está sendo construída. Em breve vai estar aqui, fera.
        </p>
        <Link
          to="/"
          className="font-mono text-[10px] tracking-[.22em] uppercase text-brand border border-brand/30 px-6 py-3 hover:border-brand transition-colors inline-flex items-center gap-2"
        >
          <ArrowRightIcon className="w-3 h-3 rotate-180" /> Voltar ao início
        </Link>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// ICON COMPONENTS
// ══════════════════════════════════════════════════════════
function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
  )
}
function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  )
}
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.18-.008-.381-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}
function MusicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.952 1.651a.75.75 0 01.298.599V16.303a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.403-4.909l2.311-.66a1.5 1.5 0 001.088-1.442V6.994l-9 2.572v9.737a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.402-4.909l2.31-.66a1.5 1.5 0 001.088-1.442V5.25a.75.75 0 01.544-.721l10.5-3a.75.75 0 01.658.122z" />
    </svg>
  )
}
function BeerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M15 1.784l-.796.796a1.125 1.125 0 101.591 0L15 1.784zM12 1.784l-.796.796a1.125 1.125 0 101.591 0L12 1.784zM9 1.784l-.796.796a1.125 1.125 0 101.591 0L9 1.784zM9.75 7.547c.498-.02.998-.035 1.5-.042V6.75a.75.75 0 011.5 0v.755c.502.007 1.002.02 1.5.042V6.75a.75.75 0 011.5 0v.88l.307.022c1.55.117 2.693 1.427 2.693 2.946v1.018a62.182 62.182 0 00-13.5 0v-1.018c0-1.519 1.143-2.829 2.693-2.946l.307-.022v-.88a.75.75 0 011.5 0v.797zM4.5 19.061V12.75a62.11 62.11 0 0115 0v6.311c0 1.405-1.013 2.601-2.416 2.831a54.57 54.57 0 01-10.168 0C5.513 21.662 4.5 20.466 4.5 19.06z" />
    </svg>
  )
}
function PeopleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
      <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
    </svg>
  )
}
function CalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
    </svg>
  )
}
function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 000 1.5v16.5h-.75a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5h-.75V3.75a.75.75 0 000-1.5h-15zM9 6a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm-.75 3.75A.75.75 0 019 9h1.5a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM9 12a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm3.75-5.25A.75.75 0 0113.5 6H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM13.5 9a.75.75 0 000 1.5H15A.75.75 0 0015 9h-1.5zm-.75 3.75a.75.75 0 01.75-.75H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM9 19.5v-2.25a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-4.5A.75.75 0 019 19.5z" clipRule="evenodd" />
    </svg>
  )
}

// ══════════════════════════════════════════════════════════
// APP ROOT
// ══════════════════════════════════════════════════════════
export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/"                element={<Home />} />
          <Route path="/programacao"     element={<StubPage title="Programação" />} />
          <Route path="/cardapio"        element={<StubPage title="Cardápio" />} />
          <Route path="/eventos"         element={<StubPage title="Eventos" />} />
          <Route path="/aniversariantes" element={<StubPage title="Aniversariantes" />} />
          <Route path="/galeria"         element={<StubPage title="Galeria" />} />
          <Route path="/contato"         element={<StubPage title="Contato" />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

/*
════════════════════════════════════════════════════
  MANIFESTO BAR — DESIGN SYSTEM REFERENCE
════════════════════════════════════════════════════

  CORES
  ─────
  #040404  bg-base
  #070707  bg-alt (seções alternadas)
  #141414  surface (cards)
  #1E1E1E  elevate
  #252525  border
  #C8102E  brand (vermelho)
  #E8961A  amber (preços)
  #F0EDE8  warm (texto principal)
  #5A5A5A  muted (texto secundário)
  #25D366  whatsapp green

  TIPOGRAFIA
  ──────────
  Anton             → font-display (heroes, big numbers)
  IBM Plex Mono     → font-mono (labels, nav, dates, badges)
  Outfit            → font-body / default (body text)

  PLACEHOLDERS PARA SUBSTITUIR
  ─────────────────────────────
  • WA_NUMBER         → número real do WhatsApp (linha 13)
  • SHOWS[]           → dados reais ou fetch de API
  • Rua [Endereço]    → endereço real no Footer
  • Google Maps iframe → no Footer (div.map-ph)
  • Socials hrefs     → URLs reais
  • Galeria cells     → <img src="..." loading="lazy" alt="...">

  PÁGINAS — PRÓXIMOS PASSOS
  ─────────────────────────
  Substituir <StubPage> por componentes reais:
  /programacao     → página com lista de shows + filtros
  /cardapio        → cardápio interativo
  /eventos         → página de eventos corporativos
  /aniversariantes → pacotes para aniversariantes
  /galeria         → galeria com lightbox
  /contato         → formulário + mapa

════════════════════════════════════════════════════
*/
