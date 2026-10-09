import { useEffect } from 'react'
const U = import.meta.env.VITE_SUPABASE_URL as string | undefined, K = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const live = !!U && !!K
const H = { apikey: K ?? '', Authorization: `Bearer ${K}`, 'Content-Type': 'application/json' }
export const fmt = (n: number) => n.toLocaleString('en-US')
export async function getViews(): Promise<Record<number, number>> {
  if (!live) return {}
  try { const r: { episode: number; views: number }[] = await (await fetch(`${U}/rest/v1/episode_views?select=*`, { headers: H })).json(); return Object.fromEntries(r.map(x => [x.episode, +x.views])) } catch { return {} }
}
// One count per browser per episode per 6 hours; refreshes don't inflate.
export async function hit(ep: number): Promise<number | null> {
  if (!live) return null
  const k = `gs-view-${ep}`, last = +(localStorage.getItem(k) ?? 0)
  if (Date.now() - last < 21600000) return null
  try { const v = await (await fetch(`${U}/rest/v1/rpc/increment_view`, { method: 'POST', headers: H, body: JSON.stringify({ ep }) })).json(); localStorage.setItem(k, String(Date.now())); return +v } catch { return null }
}
export type Note = { id: string; name: string; body: string; created_at: string }
export async function getNotes(): Promise<Note[]> {
  if (!live) return []
  try { return await (await fetch(`${U}/rest/v1/feedback?select=id,name,body,created_at&approved=eq.true&order=created_at.desc&limit=30`, { headers: H })).json() } catch { return [] }
}
export async function postNote(name: string, body: string) {
  const r = await fetch(`${U}/rest/v1/feedback`, { method: 'POST', headers: { ...H, Prefer: 'return=minimal' }, body: JSON.stringify({ name, body }) })
  if (!r.ok) throw new Error()
}
export function useMeta(title: string, desc: string) {
  useEffect(() => {
    document.title = `${title} — Guardians Syndicate`
    document.querySelector('meta[name=description]')?.setAttribute('content', desc)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title)
    let c = document.querySelector('link[rel=canonical]') as HTMLLinkElement | null
    if (!c) { c = document.createElement('link'); c.rel = 'canonical'; document.head.appendChild(c) }
    c.href = (import.meta.env.VITE_SITE_URL ?? location.origin) + location.pathname
  }, [title, desc])
}
