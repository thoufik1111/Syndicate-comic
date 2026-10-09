import { StrictMode, useEffect, useState, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, NavLink, Link, useLocation } from 'react-router-dom'
import { Home, Volume, Reader, Universe, Dossier, Charts, About } from './pages'
import './styles.css'

function Sparks() {
  const c = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = c.current!; const ctx = canvas.getContext('2d')!
    let W = 0, H = 0, raf = 0
    const resize = () => { W = canvas.width = innerWidth; H = canvas.height = innerHeight }
    resize(); addEventListener('resize', resize)
    type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; hue: number }
    const sparks: Spark[] = []
    const spawn = () => {
      const count = 6 + Math.floor(Math.random() * 6)
      for (let i = 0; i < count; i++) {
        const fromRight = Math.random() > 0.5
        sparks.push({
          x: fromRight ? W * 0.7 + Math.random() * W * 0.3 : Math.random() * W * 0.3,
          y: H * 0.3 + Math.random() * H * 0.5,
          vx: fromRight ? -(0.6 + Math.random() * 1.2) : 0.6 + Math.random() * 1.2,
          vy: -(0.1 + Math.random() * 0.5),
          life: 0,
          max: 120 + Math.random() * 180,
          r: 0.8 + Math.random() * 1.4,
          hue: 28 + Math.random() * 22,
        })
      }
    }
    spawn()
    const interval = setInterval(spawn, 4500 + Math.random() * 1000)
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        s.x += s.vx; s.y += s.vy; s.life++
        s.vx += (Math.random() - 0.48) * 0.06
        s.vy -= 0.004
        const t = s.life / s.max
        const op = t < 0.15 ? t / 0.15 : t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${s.hue},100%,72%,${op * 0.38})`
        ctx.fill()
        if (s.life > s.max) sparks.splice(i, 1)
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); clearInterval(interval); removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={c} id="sparks" aria-hidden="true" />
}

function Shell() {
  const [solid, setSolid] = useState(false), [open, setOpen] = useState(false), { pathname } = useLocation()
  useEffect(() => { const f = () => setSolid(scrollY > 40); f(); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f) }, [])
  useEffect(() => { setOpen(false); scrollTo(0, 0) }, [pathname])
  const links: [string, string][] = [['/', 'Home'], ['/volume/1', 'Read'], ['/universe', 'Universe'], ['/charts', 'Charts'], ['/about', 'About']]
  return <>
    <Sparks />
    <a className="skip" href="#main">Skip to content</a>
    <header className={`nav ${solid || open ? 'solid' : ''}`}>
      <Link to="/" className="logo">Guardians Syndicate</Link>
      <nav className={open ? 'open' : ''} aria-label="Primary">
        {links.map(([to, t]) => <NavLink key={to} to={to} end={to === '/'}>{t}</NavLink>)}
        <Link to="/volume/1" className="cta-s">Read Volume I →</Link>
      </nav>
      <button className="burger" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}><i /><i /></button>
    </header>
    <main id="main" key={pathname.startsWith('/read') ? 'r' : pathname}>
      <Routes>
        <Route path="/" element={<Home />} /><Route path="/volume/:v" element={<Volume />} />
        <Route path="/read/:ep" element={<Reader />} /><Route path="/universe" element={<Universe />} />
        <Route path="/universe/:slug" element={<Dossier />} /><Route path="/charts" element={<Charts />} /><Route path="/leaderboard" element={<Charts />} /><Route path="/reviews" element={<Charts />} /><Route path="/archive" element={<Charts />} />
        <Route path="/about" element={<About />} /><Route path="*" element={<About />} />
      </Routes>
    </main>
    <footer className="foot">
      <h2 className="mega">Guardians<br /><span className="glow">Syndicate</span></h2>
      <p className="label">An original comic universe</p>
      <ul>{links.slice(1).map(([to, t]) => <li key={to}><Link to={to}>{t}</Link></li>)}</ul>
      <Link to="/volume/1" className="mega-link">The story continues →</Link>
      <a className="footer-contact" href="https://linktr.ee/mohammedthoufik" target="_blank" rel="noopener noreferrer">Contact me · Linktree ↗</a>
      <small>© {new Date().getFullYear()} Guardians Syndicate. All rights reserved.</small>
    </footer>
  </>
}
createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><Shell /></BrowserRouter></StrictMode>)
