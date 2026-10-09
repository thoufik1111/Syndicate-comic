# Guardians Syndicate
Setup: `npm i`, copy `.env.example` to `.env`, run `supabase.sql` in Supabase, `npm run dev`. Deploy anywhere static (Vercel/Netlify; add an SPA rewrite to index.html).

## Where to drop your files (no code changes needed)
- Episode pages: `src/episodes/01/` ... `src/episodes/09/`. Name pages so they sort (`001.webp`, `002.webp`...). Optional cover: `cover.webp` in the same folder (else page 1 is the cover). WebP recommended, ~1200px wide.
- Hero / poster: `src/assets/hero.(jpg|webp)`. Social image: `public/og.jpg`.
- Character art: `src/characters/<slug>.webp` (slugs in `src/data.ts`, e.g. `alpha-void.webp`).
- Edit titles/descriptions/character facts in `src/data.ts`. Anything unfilled shows CLASSIFIED.

## Episode charts
Charts sorts episodes by their shared view counts stored in Supabase.
