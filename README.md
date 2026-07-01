# PRAX Website

Marketing site for PRAX — the creative output system. Dark "living console" style:
PRAX electric blue on deep space, a Refik-style particle flow field in the hero, and
REX as a scroll-driven particle orb that swims left↔right across the page narrating
each section (waypoints declared via `data-rex` / `data-rex-y` on sections).

## Run

Double-click `DEV.bat`, or:

```
npm install
npm run dev
```

## Stack

- Vite + React + TypeScript
- Lenis (smooth scroll) + GSAP ScrollTrigger (reveals + scroll-scrubbed context score ring)
- Canvas 2D for both effects (`src/fx/FlowField.tsx`, `src/fx/RexOrb.tsx`) — no GPU risk

## Deploy

`npm run build` → static `dist/`, ready for Vercel.
