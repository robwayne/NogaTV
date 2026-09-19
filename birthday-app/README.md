# The Tapes

A birthday gift site: a catalogue of every show we've watched together, everything
still ahead of us, a night-by-night schedule, a shuffler that picks what to watch,
and a Letterboxd-style log for rating and commenting on episodes.

## Running it

```bash
cd birthday-app
npm install
npm run dev     # http://localhost:3000
```

## Editing the personal stuff

Everything written lives in **`data/content.ts`** — her name, the shows, the notes,
the top picks, the "what inspires me" section and the closing letter. Search for
`TODO:` to find every spot that still needs your words. Nothing else needs touching.

## What's where

| File | What it does |
| --- | --- |
| `data/content.ts` | All the writing and the seeded shows |
| `lib/store.tsx` | Browser state: shows added on the fly, profiles, log entries, the schedule |
| `lib/recommend.ts` | The shuffler and the "what should we watch next" logic |
| `components/TonightPicker.tsx` | Section 01 — shuffle / recommend |
| `components/Schedule.tsx` | Section 02 — the week planner |
| `components/Library.tsx`, `TapeCard.tsx` | Sections 03/04 — the catalogue, with per-episode logging |
| `components/ActivityFeed.tsx` | Section 05 — the combined log |

## Profiles

No signup. The bar at the top is just "who's watching" — tap a name and anything you
log is attributed to it. Rename either profile with the `rename` link.

Right now everything is stored in the browser's `localStorage`, so the two of you
won't see each other's entries across devices. A Next.js API + database layer is the
next step to make it shared.

## Deploying

Free on Vercel: point it at this repo with `birthday-app` as the root directory.
