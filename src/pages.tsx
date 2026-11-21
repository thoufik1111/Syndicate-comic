import { useEffect, useRef, useState, FormEvent } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { episodes, volumeTwoEpisodes, episodeAssets, volumes, characters, charArt, Char } from './data'
import heroBg from './assets/hero.png'
import cityBg from './assets/city-bg.jpeg'
import guardiansLineup from '../Guardians shitout.jpeg'
import universeMap from '../Syndicate universe worldmap.jpeg'
import { getViews, hit, fmt, getNotes, postNote, Note, live, useMeta } from './lib'

const CLS = 'Classified'
function useViews() { const [v, s] = useState<Record<number, number>>({}); useEffect(() => { getViews().then(s) }, []); return [v, s] as const }
function Reveal({ children }: { children: React.ReactNode }) {
  const r = useRef<HTMLDivElement>(null)
  useEffect(() => { const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { r.current?.classList.add('in'); o.disconnect() } }, { threshold: .2 }); r.current && o.observe(r.current); return () => o.disconnect() }, [])
  return <div ref={r} className="rv">{children}</div>
}
const Img = ({ src, alt, ratio = '2/3' }: { src?: string; alt: string; ratio?: string }) =>
  src ? <img src={src} alt={alt} loading="lazy" decoding="async" style={{ aspectRatio: ratio }} /> : <div className="ph" style={{ aspectRatio: ratio }}><span>Artwork pending</span></div>
const Views = ({ n }: { n?: number }) => <span className="views">{n === undefined ? '— views' : `${fmt(n)} views`}</span>
function useEpSparks() {
  return (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const canvas = document.createElement('canvas')
    canvas.width = rect.width; canvas.height = rect.height
    canvas.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;pointer-events:none;z-index:50`
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')!
    type P = {x:number;y:number;vx:number;vy:number;life:number;max:number;r:number}
    const pts: P[] = Array.from({length:18},()=>({x:rect.width*(.2+Math.random()*.6),y:rect.height,vx:(Math.random()-0.5)*2.5,vy:-(1.5+Math.random()*3),life:0,max:40+Math.random()*30,r:.8+Math.random()*1.6}))
    let raf=0
    const draw=()=>{
      ctx.clearRect(0,0,rect.width,rect.height)
      let alive=false
      pts.forEach((p: P) => {p.x+=p.vx;p.y+=p.vy;p.vy+=.04;p.life++
        const t=p.life/p.max,op=t<.2?t/.2:1-((t-.2)/.8)
        if(op>0){alive=true;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`hsla(${32+Math.random()*20},100%,70%,${op*.5})`;ctx.fill()}
      })
      if(alive)raf=requestAnimationFrame(draw);else canvas.remove()
    }
    draw()
    setTimeout(()=>{cancelAnimationFrame(raf);canvas.remove()},2000)
  }
}

export function Home() {
  useMeta('Home', 'Guardians Syndicate is an original comic universe. Volumes I and II, 18 episodes, are complete and free to read.')
  const [views] = useViews(), total = Object.values(views).reduce((a, b) => a + b, 0), bg = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const f = () => bg.current && (bg.current.style.transform = `translate3d(0,${Math.min(scrollY, 900) * .18}px,0) scale(1.08)`)
    addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f)
  }, [])
  return <>
    <section className="hero">
      <div className="hero-bg" ref={bg}>
        <img src={heroBg} alt="" aria-hidden="true" className="hero-img" />
      </div>
      <div className="hero-in">
        <p className="label">Vol. 01–02 / Guardians Archive / 2026</p>
        <h1 className="mega">Guardians<br /><span className="glow">Syndicate</span></h1>
        <p className="tag">A world doesn't need heroes.<br />Until it has monsters.</p>
        <div className="row"><Link className="btn" to="/volume/2">Read Volumes</Link><Link className="btn ghost" to="/universe">Explore the universe</Link></div>
      </div>
    </section>
    <section className="sec intro"><Reveal>
      <h2 className="huge">Every hero has an origin.<br />Every villain has a reason.<br />Every war leaves <span className="glow">something behind.</span></h2>
      <p className="lede">Guardians Syndicate is an original comic universe. Volumes I and II, 18 episodes in total, are complete and free to read here.</p>
    </Reveal>
      <dl className="stats">
        {[['18', 'Episodes'], ['06', 'Guardians'], ['02', 'Volumes'], ['02', 'Universe']].map(([n, l]) => <div key={l}><dt>{n}</dt><dd>{l}</dd></div>)}
      </dl>
      {live && total > 0 && <p className="label">{fmt(total)} total reads across Volumes I &amp; II</p>}
    </section>
    <section className="sec"><Reveal><h2 className="huge">The <span className="glow">Saga</span></h2></Reveal>
      <div className="saga">
        {volumes.map(v => v.n === 1
          ? <Link key={v.n} to="/volume/1" className="vol vol1"><img src={guardiansLineup} alt="" aria-hidden="true" className="vol1-poster" /><span className="label">Volume I · Complete</span><b className="big">{v.name}</b><span>{v.note} — read now →</span></Link>
          : v.n === 2
            ? <Link key={v.n} to="/volume/2" className="vol vol2"><img src={heroBg} alt="" aria-hidden="true" className="vol2-poster" /><span className="label">Volume II · Complete</span><b className="big">{v.name}</b><span>{v.note} — read now →</span></Link>
          : <div key={v.n} className="vol veil vol-classified"><span className="label">Volume {v.n}</span><b className="big">{v.status}</b><span>Coming soon</span></div>)}
      </div>
    </section>
    <section className="sec"><Reveal><h2 className="huge">The <span className="glow">Spinoff</span></h2></Reveal>
      <div className="spinoff">
        <div className="vol veil spinoff-card"><span className="label">Spinoff</span><b className="big">{CLS}</b><span>Coming soon</span></div>
      </div>
    </section>
    <section className="sec"><Reveal><h2 className="huge">The <span className="glow">Guardians</span></h2></Reveal>
      <div className="strip scroll" aria-label="Guardians">
        <div className="strip-track">
          {[...characters.filter(c => c.kind === 'guardian'), ...characters.filter(c => c.kind === 'guardian')].map((c, i) => (
            <div key={i} className="strip-item" style={{flex:'0 0 clamp(11rem,19vw,17rem)'}}>
              <Link className="character-card" to={`/universe/${c.slug}`}><Img src={charArt(c.slug)} alt={`${c.name} artwork`} ratio="3/4" /><b>{c.name}</b>{c.alias && <small>{c.alias}</small>}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
    <Feedback />
    <Status />
  </>
}

export function Status() {
  return <section className="sec status"><Reveal><h2 className="huge">The story is only <span className="glow">beginning.</span></h2></Reveal>
    <ol>{volumes.map(v => <li key={v.n}><span className="label">Volume {v.n}</span><b className="big">{v.status}</b></li>)}</ol></section>
}

export function Volume() {
  const { v } = useParams(); const [views, setViews] = useViews(), epSparks = useEpSparks()
  const isVolumeTwo = v === '2'
  useMeta(isVolumeTwo ? 'Volume II — A Hollow Triumph' : 'Volume I — The Beginning', isVolumeTwo
    ? 'Read all nine complete episodes of A Hollow Triumph, Volume II of Guardians Syndicate.'
    : 'Read all nine episodes of Guardians Syndicate Volume I: The Beginning.')
  if (v !== '1' && !isVolumeTwo) return <section className="sec page"><h1 className="mega">Volume {v}</h1><p className="lede">{CLS}. Nothing is public yet.</p></section>
  const total = Object.values(views).reduce((a, b) => a + b, 0)
  const volumeTwoTotal = volumeTwoEpisodes.reduce((sum, episode) => sum + (views[episode.n] ?? 0), 0)
  const title = isVolumeTwo ? 'A Hollow Triumph' : 'The Beginning'
  return <section className="sec page">
    <nav className="volume-switch" aria-label="Choose a volume">
      <Link to="/volume/1" className={!isVolumeTwo ? 'active' : ''} aria-current={!isVolumeTwo ? 'page' : undefined}>Volume I</Link>
      <Link to="/volume/2" className={isVolumeTwo ? 'active' : ''} aria-current={isVolumeTwo ? 'page' : undefined}>Volume II</Link>
    </nav>
    <p className="label">{isVolumeTwo ? 'Volume II · Complete' : 'Volume I · Complete'}</p>
    <h1 className="mega">{isVolumeTwo ? <><span className="vol2-title-line">A Hollow</span><br /><span className="glow">Triumph</span></> : <>The<br /><span className="glow">Beginning</span></>}</h1>
    {live && <p className="views">{fmt(isVolumeTwo ? volumeTwoTotal : total)} total views</p>}
    {isVolumeTwo
      ? <div className="eps">{volumeTwoEpisodes.map((e, i) => {
        const card = <>
          <div className="frame">{e.poster
            ? <Img src={e.poster} alt={`${e.title} poster`} ratio="2/3" />
            : <div className="ep-coming-placeholder" aria-hidden="true" />}</div>
          <div className="meta"><span className="num">{String(i + 1).padStart(2, '0')}</span>
            <h2>{e.ready ? e.title : 'Coming soon'}</h2>
            {e.ready && <><Views n={views[e.n] ?? 0} /><span className="more">Read episode →</span></>}
          </div>
        </>
        return e.ready
          ? <a key={e.n} href={e.pdf} target="_blank" rel="noopener noreferrer" className={`ep e${i % 3}`} onMouseEnter={epSparks} onClick={() => {
            void hit(e.n).then(count => {
              if (count !== null) setViews(current => ({ ...current, [e.n]: count }))
            })
          }}>{card}</a>
          : <article key={e.n} className={`ep e${i % 3} ep-locked`} aria-label={`Episode ${i + 1}, coming soon`}>{card}</article>
      })}</div>
      : <div className="eps">{episodes.map((e, i) => {
      const card = <>
        <div className="frame"><img src={e.poster} alt={`${e.title} poster`} className="ep-poster" loading={i === 0 ? 'eager' : 'lazy'} decoding="async" /></div>
        <div className="meta"><span className="num">{String(e.n).padStart(2, '0')}</span><h2>{e.title}</h2>
          {e.desc && <p>{e.desc}</p>}<Views n={views[e.n]} /><span className="more">Read episode →</span></div>
      </>
      return e.pdf
        ? <a key={e.n} href={e.pdf} target="_blank" rel="noopener noreferrer" className={`ep e${i % 3}`} onMouseEnter={epSparks} onClick={() => { void hit(e.n) }}>{card}</a>
        : <Link key={e.n} to={`/read/${e.n}`} className={`ep e${i % 3}`} onMouseEnter={epSparks}>{card}</Link>
      })}</div>}
    {!isVolumeTwo && <Feedback />}
  </section>
}

export function Reader() {
  const n = +(useParams().ep ?? 0), e = episodes.find(x => x.n === n)
  const { pages, cover } = episodeAssets(n), [views, setViews] = useState<number>(), [pct, setPct] = useState(0), key = `gs-pos-${n}`
  useMeta(e ? `${e.title} — Volume I` : 'Episode', `Read ${e?.title ?? 'this episode'} of Guardians Syndicate, Volume I.`)
  useEffect(() => { hit(n).finally(() => getViews().then(m => setViews(m[n]))) }, [n])
  useEffect(() => {
    const y = +(localStorage.getItem(key) ?? 0); if (y > 300) setTimeout(() => scrollTo({ top: y }), 300)
    const f = () => { const h = document.documentElement.scrollHeight - innerHeight; setPct(h > 0 ? scrollY / h : 0); localStorage.setItem(key, String(Math.round(scrollY))) }
    addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f)
  }, [key])
  if (!e) return <Navigate to="/volume/1" replace />
  const nav = <nav className="rnav" aria-label="Episode navigation">
    {n > 1 ? <Link to={`/read/${n - 1}`}>← Previous</Link> : <span />}<Link to="/volume/1">Episode list</Link>
    {n < episodes.length ? <Link to={`/read/${n + 1}`}>Next →</Link> : <span />}</nav>
  return <article className="reader">
    <div className="bar" style={{ transform: `scaleX(${pct})` }} role="progressbar" aria-valuenow={Math.round(pct * 100)} aria-label="Reading progress" />
    <header className="rhead"><p className="label">Volume I · Episode {String(n).padStart(2, '0')}</p><h1 className="mega">{e.title}</h1><Views n={views} />
      {cover && pages[0] !== cover && <img src={cover} alt={`${e.title} cover`} />}</header>
    {pages.length === 0 && <p className="lede center">Pages not uploaded yet. Add images to <code>src/episodes/{String(n).padStart(2, '0')}/</code>.</p>}
    <div className="pages">{pages.map((p, i) => <img key={p} src={p} alt={`${e.title}, page ${i + 1} of ${pages.length}`} loading={i < 2 ? 'eager' : 'lazy'} decoding="async" style={{ minHeight: '40vh' }} />)}</div>
    {nav}<Feedback />
  </article>
}

export function Universe() {
  useMeta('The Universe', 'Dossiers on the Guardians and villains of Guardians Syndicate.')
  const grp = (k: Char['kind'], t: string) => <>
    <h2 className="huge">{t}</h2>
    <ul className="strip wrap">{characters.filter(c => c.kind === k).map(c => <li key={c.slug}><Link className="character-card" to={`/universe/${c.slug}`}><Img src={charArt(c.slug)} alt={`${c.name} artwork`} ratio="3/4" /><b>{c.name}</b>{c.alias && <small>{c.alias}</small>}</Link></li>)}</ul></>
  return <section className="sec page universe-page">
    <img src={cityBg} aria-hidden="true" className="universe-bg" alt="" />
    <p className="label">Encyclopedia</p><h1 className="mega">The<br /><span className="glow">Universe</span></h1>
    {grp('guardian', 'Guardians')}{grp('villain', 'Villains')}
    <p className="label">People · Locations · Events — archive opens with Volume II</p>
  </section>
}

const inspiredBy: Record<string, string> = {
  'alpha-void': 'Thoufik', 'atom-girl': 'Darunima', 'queen': 'Keerthiga',
  'shape-shifter': 'Lakshumipathy', 'rampage': 'Ragul', 'extinct': 'Karthikeyan',
  'hazard': 'Lokesh', 'bossmode': 'Rahul D', 'chilltank': 'Hari',
  'foul-play': 'Madhavan', 'professor-proto': 'Praveen',
}
export function Dossier() {
  const c = characters.find(x => x.slug === useParams().slug)
  useMeta(c?.name ?? 'Dossier', `Dossier: ${c?.name ?? ''} from Guardians Syndicate.`)
  if (!c) return <Navigate to="/universe" replace />
  const rows: [string, string | undefined][] = [['Alias', c.alias], ['Real name', c.realName], ['Role', c.role], ['Origin', c.origin], ['Abilities', c.abilities], ['Affiliations', c.affiliations], ['First appearance', c.first]]
  const credit = inspiredBy[c.slug]
  return <section className="sec page dossier">
    <div className="dossier-art">
      <Img src={charArt(c.slug)} alt={`${c.name} artwork`} ratio="3/4" />
      {credit && <p className="credit">inspired by {credit}</p>}
    </div>
    <div><p className="label">{c.kind === 'guardian' ? 'Guardian' : 'Villain'} dossier</p><h1 className="mega">{c.name}</h1>
      {c.desc && <p className="lede" style={{marginBottom:'2rem'}}>{c.desc}</p>}
      <dl>{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd className={v && v !== 'Unknown' ? '' : 'cls'}>{v && v !== 'Unknown' ? v : CLS}</dd></div>)}</dl>
      <Link className="btn ghost" to="/universe">All characters</Link></div></section>
}

export function Charts() {
  const [views] = useViews()
  useMeta('Episode Charts', 'See the top 10 most-read episodes across Volumes I and II of Guardians Syndicate.')
  const rankedEpisodes = [
    ...episodes.map(episode => ({ episode, volume: 'Volume I' })),
    ...volumeTwoEpisodes.filter(episode => episode.ready).map(episode => ({ episode, volume: 'Volume II' })),
  ].sort((a, b) => (views[b.episode.n] ?? 0) - (views[a.episode.n] ?? 0) || a.episode.n - b.episode.n).slice(0, 10)

  return <section className="sec page charts-page">
    <p className="label">Volumes I &amp; II · Top 10 most read</p>
    <h1 className="mega">Episode<br /><span className="glow">Charts</span></h1>
    <p className="lede">The community’s most-read episodes, ranked by reader views.</p>
    <div className="episode-charts-wrap">
      <ol className="episode-charts" aria-label="Episodes ranked by views">
        {rankedEpisodes.map(({ episode, volume }, index) => {
          const isVolumeTwo = volume === 'Volume II'
          const episodeNumber = episode.n > 10 ? episode.n - 10 : episode.n
          const label = `Read ${volume}, episode ${episodeNumber}: ${episode.title}`
          const readLink = (children: React.ReactNode, className?: string) => isVolumeTwo
            ? <a href={episode.pdf} target="_blank" rel="noopener noreferrer" aria-label={label} className={className} onClick={() => { void hit(episode.n) }}>{children}</a>
            : <Link to={`/read/${episode.n}`} aria-label={label} className={className}>{children}</Link>
          return (
            <li key={episode.n}>
              <span className="charts-rank">{String(index + 1).padStart(2, '0')}</span>
              {readLink(<img src={episode.poster} alt="" loading="lazy" decoding="async" />, 'charts-poster')}
              <span className="label">{volume} · Episode {String(episodeNumber).padStart(2, '0')}</span>
              <h2>{readLink(episode.title)}</h2>
              <strong>{fmt(views[episode.n] ?? 0)}<span> views</span></strong>
            </li>
          )
        })}
      </ol>
    </div>
  </section>
}

type MapCity = 'ashton' | 'dark-city'
function InteractiveWorldMap({ city, interactive = false }: { city?: MapCity; interactive?: boolean }) {
  const [focus, setFocus] = useState<MapCity | null>(null)
  const surface = useRef<HTMLDivElement>(null)
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || !surface.current) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - .5
    const y = (event.clientY - bounds.top) / bounds.height - .5
    surface.current.style.setProperty('--map-rotate-x', `${-y * 5}deg`)
    surface.current.style.setProperty('--map-rotate-y', `${x * 5}deg`)
  }
  const resetPointer = () => {
    surface.current?.style.setProperty('--map-rotate-x', '0deg')
    surface.current?.style.setProperty('--map-rotate-y', '0deg')
  }
  const zoom = city ?? focus
  const cityLabel = zoom === 'ashton' ? 'Ashton' : 'Dark City'
  return <div
    className={`world-map ${interactive ? 'world-map-interactive' : ''} ${city ? `world-map-focus world-map-${city}` : ''} ${zoom ? `world-map-zoom-${zoom}` : ''}`}
  >
    <div className="world-map-viewport" onPointerMove={onPointerMove} onPointerLeave={resetPointer} onPointerCancel={resetPointer}>
      <div className="world-map-surface" ref={surface}>
        <img className="world-map-image" src={universeMap} alt="Syndicate Universe world map, showing its continents, countries and numbered cities." />
        {zoom && <svg className="world-map-boundary" viewBox="0 0 1743 1080" aria-hidden="true">
          {zoom === 'ashton'
            ? <>
              <path className="world-map-boundary-depth" transform="translate(0 7)" d="M 419 341 C 426 338 433 338 440 340 L 454 341 C 463 339 472 336 480 334 L 487 339 L 484 346 C 479 351 472 354 466 358 C 458 362 451 367 443 371 L 432 374 C 426 372 421 368 419 362 C 418 355 418 348 419 341 Z" />
              <path className="world-map-boundary-line" d="M 419 341 C 426 338 433 338 440 340 L 454 341 C 463 339 472 336 480 334 L 487 339 L 484 346 C 479 351 472 354 466 358 C 458 362 451 367 443 371 L 432 374 C 426 372 421 368 419 362 C 418 355 418 348 419 341 Z" />
            </>
            : <>
              <path className="world-map-boundary-depth" transform="translate(0 7)" d="M 506 282 C 511 280 515 276 520 275 C 526 276 530 279 535 277 C 540 278 543 283 548 286 C 551 291 556 293 560 298 L 562 306 C 564 312 570 316 570 322 C 567 326 562 329 560 334 C 559 341 564 348 561 353 C 557 356 551 353 547 349 C 543 343 542 336 538 331 C 535 327 531 327 527 331 C 521 335 515 339 508 340 C 501 340 496 337 491 334 C 487 331 483 326 480 321 C 478 316 482 312 486 308 C 490 304 491 298 495 294 C 498 289 502 286 506 282 Z" />
              <path className="world-map-boundary-line" d="M 506 282 C 511 280 515 276 520 275 C 526 276 530 279 535 277 C 540 278 543 283 548 286 C 551 291 556 293 560 298 L 562 306 C 564 312 570 316 570 322 C 567 326 562 329 560 334 C 559 341 564 348 561 353 C 557 356 551 353 547 349 C 543 343 542 336 538 331 C 535 327 531 327 527 331 C 521 335 515 339 508 340 C 501 340 496 337 491 334 C 487 331 483 326 480 321 C 478 316 482 312 486 308 C 490 304 491 298 495 294 C 498 289 502 286 506 282 Z" />
            </>}
        </svg>}
        {interactive && <>
          <button className={`world-map-pin world-map-pin-ashton ${focus === 'ashton' ? 'active' : ''}`} type="button" aria-label="Zoom to Ashton, city 1" aria-pressed={focus === 'ashton'} onClick={() => setFocus(focus === 'ashton' ? null : 'ashton')}><span>1</span></button>
          <button className={`world-map-pin world-map-pin-dark-city ${focus === 'dark-city' ? 'active' : ''}`} type="button" aria-label="Zoom to Dark City, city 2" aria-pressed={focus === 'dark-city'} onClick={() => setFocus(focus === 'dark-city' ? null : 'dark-city')}><span>2</span></button>
        </>}
      </div>
    </div>
    {interactive && <div className="world-map-caption" aria-live="polite">
      <span>{zoom ? `${cityLabel} · City ${zoom === 'ashton' ? '01' : '02'}` : 'World map · Select city 01 or 02 to explore'}</span>
      {zoom && <button type="button" onClick={() => setFocus(null)}>World view</button>}
    </div>}
    {city && <span className="world-map-focus-label">{city === 'ashton' ? '01 / ASHTON' : '02 / DARK CITY'}</span>}
  </div>
}

export function About() {
  useMeta('About Story Book', 'Discover the story, characters and world behind Story Book and the Guardians Syndicate.')
  return <section className="sec page about-page">
    <header className="about-hero">
      <img src={guardiansLineup} alt="" aria-hidden="true" className="about-hero-img" />
      <p className="label">The world behind Guardians Syndicate</p>
      <h1 className="mega">Story<br /><span className="glow">Book</span></h1>
      <p className="about-deck">An original superhero universe, built from characters created with friends—and a story that keeps growing.</p>
      <a className="about-scroll" href="#about-origin">The story behind the story <span aria-hidden="true">↓</span></a>
    </header>

    <div className="about-copy">
      <section className="about-origin" id="about-origin">
        <p className="label">It started with an idea</p>
        <div>
          <h2 className="huge">What if our characters had a world of their own?</h2>
          <p>I have always been fascinated by superhero stories. Marvel, The Boys and Invincible inspired me—not just with heroes and action, but with worlds shaped by consequences, complicated people, personal conflict and choices that echo beyond a single battle.</p>
          <p>I wanted to make something original, built around characters my friends and I had created. In 2025, I began designing those characters and building their world. Around two months ago, I decided to turn that idea into a comic—writing scenes and dialogue, planning episodes, designing characters, creating artwork, editing panels and connecting storylines.</p>
          <p>There was no big studio or production team—just an idea, a lot of experimentation and the motivation to keep building. Story Book grew from that process.</p>
        </div>
      </section>

      <section className="about-growth">
        <div>
          <p className="label">From characters to a universe</p>
          <h2 className="huge">Every episode is a chance to <span className="glow">grow.</span></h2>
          <p>Creating Story Book improved more than the story. Each episode became a chance to learn, experiment, make mistakes and improve the next one.</p>
        </div>
        <ul className="about-skills" aria-label="Creative skills developed">
          {['Creative writing', 'Character development', 'Visual storytelling', 'Digital editing', 'Design', 'World-building', 'Story structure', 'Productivity', 'Experimentation'].map(skill => <li key={skill}>{skill}</li>)}
        </ul>
      </section>

      <section className="about-world">
        <div className="about-section-heading">
          <p className="label">The world of Story Book</p>
          <h2 className="huge">Superhumans are part of <span className="glow">society.</span></h2>
          <p>Governments, organizations, cities, criminals and ordinary people all have to adapt to a world where extraordinary power is real. At its center, two very different forces are on a collision course.</p>
        </div>
        <InteractiveWorldMap interactive />
        <div className="about-cities">
          <article className="about-city about-ashton">
            <span className="about-index">01 / THE CITY OF HEROES</span>
            <h3>Ashton</h3>
            <InteractiveWorldMap city="ashton" />
            <p>Home of the Guardians Syndicate. The team responds to superhuman threats, stops dangerous criminals and protects people when ordinary authorities cannot.</p>
            <p>But protecting a city is more complicated than defeating an attacker. Every battle can affect thousands, every decision has consequences, and the Guardians—powerful as they are—are people with their own beliefs, conflicts and limits.</p>
          </article>
          <article className="about-city about-dark-city">
            <span className="about-index">02 / BEYOND THE REACH OF LAW</span>
            <h3>Dark City</h3>
            <InteractiveWorldMap city="dark-city" />
            <p>A place shaped by criminals, mutants and dangerous individuals beyond the Guardians’ control. Dark City is the territory of the Chaos Syndicate, led by Bossmode.</p>
            <p>Here, power determines authority. Chaos has its own plans, experiments and alliances—and its actions reach further than the city. What the Guardians see on the surface may be only part of something much larger.</p>
          </article>
        </div>
      </section>

      <section className="about-syndicates">
        <article>
          <p className="label">The protectors / Ashton</p>
          <h2 className="huge">Guardians<br /><span className="glow">Syndicate</span></h2>
          <p>Led by Alpha Void, the team brings together powerful people to protect others from threats beyond ordinary human capabilities. Each Guardian brings different abilities, personalities and ideas about what it means to be a hero.</p>
          <ul className="about-roster" aria-label="The Guardians">
            {['Alpha Void', 'Queen', 'Atom Girl', 'Shape Shifter', 'Rampage', 'Hazard', 'Extinct'].map((name, index) => <li key={name}><span>0{index + 1}</span>{name}</li>)}
          </ul>
          <p>Some believe in absolute restraint; others are willing to make difficult choices. Some carry burdens they rarely discuss, and some are still working out who they want to become. Story Book asks what happens when people with such different beliefs have to stand together.</p>
        </article>
        <article>
          <p className="label">The opposition / Dark City</p>
          <h2 className="huge">Chaos<br /><span className="glow">Syndicate</span></h2>
          <p>Led by Bossmode, the Chaos Syndicate operates primarily from Dark City. It manipulates, experiments, attacks and exploits the weaknesses of the world around it.</p>
          <p>Chaos is more than a group of villains waiting for another fight. Its members have plans, and some connect to things the Guardians do not yet know exist.</p>
          <Link className="about-text-link" to="/universe/bossmode">Explore Bossmode’s dossier <span aria-hidden="true">→</span></Link>
        </article>
      </section>

      <section className="about-volumes">
        <div className="about-section-heading">
          <p className="label">The story so far</p>
          <h2 className="huge">Two volumes.<br />A world in motion.</h2>
        </div>
        <article className="about-volume">
          <div className="about-volume-no">01</div>
          <div>
            <p className="label">A hero. A team. A mystery. / Discovery</p>
            <h3>Volume I — The Beginning</h3>
            <p>Nine episodes introduce the Guardians and their growing conflict with Chaos. What looks like a series of confrontations with dangerous criminals slowly reveals links between seemingly unrelated incidents. New questions emerge about the origins of certain threats, and the line between coincidence and conspiracy begins to blur.</p>
            <p>As Alpha Void becomes increasingly tied to the mystery, the Guardians discover the world, one another and the forces working behind the scenes—and begin to realize how little they understand.</p>
            <Link className="about-text-link" to="/volume/1">Read Volume I <span aria-hidden="true">→</span></Link>
          </div>
        </article>
        <article className="about-volume">
          <div className="about-volume-no">02</div>
          <div>
            <p className="label">Mysteries revealed / Ideology tested</p>
            <h3>Volume II — A Hollow Triumph</h3>
            <p>The Syndicate mystery begins to unfold, and the truth behind the Cosmic Key is finally identified. A new team led by Foulplay forms against Ashton. Hauntings, losses, the past, returning powers and long-buried throwbacks challenge the Guardians—and force them to question how their ideology is changing.</p>
            <ul className="about-volume-topics">
              <li><b>The Syndicate mystery</b><span>The organization’s hidden truth begins to surface.</span></li>
              <li><b>The Cosmic Key</b><span>The mystery surrounding the key is finally identified.</span></li>
              <li><b>A new team</b><span>Foulplay leads a team rising against Ashton.</span></li>
              <li><b>Hauntings &amp; loss</b><span>The past returns, bringing loss and old powers back into play.</span></li>
              <li><b>Changing ideals</b><span>Throwbacks and hard choices challenge what the Guardians believe.</span></li>
            </ul>
            <Link className="about-text-link" to="/volume/2">Read Volume II <span aria-hidden="true">→</span></Link>
          </div>
        </article>
      </section>

      <section className="about-longform">
        <p className="label">But this is only the beginning</p>
        <h2 className="huge">A long-form universe.<br /><span className="glow">Consequences that last.</span></h2>
        <p>Story Book is designed to grow beyond one villain, one battle or one city. Every volume changes the world a little. Characters grow, relationships evolve, mysteries appear, and choices made now can matter much later. The story will gradually expand from a superhero conflict in one city into something much larger—but those answers belong to the story itself.</p>
        <p className="about-last-line">For now, there is only one thing you need to know:<br /><strong>The story has already begun.</strong></p>
      </section>

      <section className="about-why">
        <p className="label">Why Story Book exists</p>
        <h2 className="huge">Inspired by others.<br /><span className="glow">Made its own.</span></h2>
        <p>Story Book isn't an attempt to recreate Marvel, The Boys or Invincible. They inspired me to start, but Story Book became its own thing as I kept creating. The characters came from ideas shared with friends. The world grew from those characters, and the story grew from the world.</p>
        <p>Each episode is a record of an idea changing through experimentation, mistakes, improvements and new ideas—from character sketches, to designs, to scenes, to full episodes, to an entire universe.</p>
        <div className="about-journey" aria-label="The Story Book creative journey">
          <span>Character sketches</span><i aria-hidden="true">→</i><span>Designs</span><i aria-hidden="true">→</i><span>Scenes</span><i aria-hidden="true">→</i><span>Episodes</span><i aria-hidden="true">→</i><span>A universe</span>
        </div>
      </section>

      <div className="about-cta">
        <p className="label">Enter the world</p>
        <h2 className="huge">The next chapter<br />is waiting.</h2>
        <Link className="btn" to="/volume/1">Read Volume I</Link>
      </div>
    </div>
  </section>
}

export function Feedback() {
  const [notes, setNotes] = useState<Note[]>([]), [msg, setMsg] = useState('')
  useEffect(() => { getNotes().then(setNotes) }, [])
  async function submit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault(); const f = new FormData(ev.currentTarget)
    if (f.get('website')) return
    const last = +(localStorage.getItem('gs-fb') ?? 0)
    if (Date.now() - last < 60000) return setMsg('Please wait a minute before posting again.')
    const name = String(f.get('name')).trim().slice(0, 40), body = String(f.get('body')).trim().slice(0, 600)
    if (!name || body.length < 3) return setMsg('Add a name and a few words.')
    if (!live) return setMsg('Feedback opens once the database is connected.')
    try { await postNote(name, body); localStorage.setItem('gs-fb', String(Date.now())); setNotes(await getNotes()); ev.currentTarget.reset(); setMsg('Posted. Thank you.') } catch { setMsg('Could not post. Try again.') }
  }
  return <section className="sec fb"><Reveal><h2 className="huge">From the <span className="glow">readers</span></h2></Reveal>
    <div className="fb-grid">
      <form onSubmit={submit}><label>Display name<input name="name" maxLength={40} autoComplete="nickname" required /></label>
        <label>Your opinion<textarea name="body" maxLength={600} rows={4} required /></label>
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp" />
        <button className="btn">Post feedback</button><p role="status" className="label">{msg}</p></form>
      <ul>{notes.length === 0 && <li className="lede">Be the first reader to leave a note.</li>}
        {notes.map(n => <li key={n.id}><blockquote>{n.body}</blockquote><cite>{n.name}</cite></li>)}</ul></div></section>
}
