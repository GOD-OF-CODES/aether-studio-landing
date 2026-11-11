# Aether Studio landing page

A guided flight through Aether Studio with Aiko, the guide robot. Next.js (static export), React Three Fiber, GSAP, Lenis.

## Run
```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # writes ./out, a fully static site
```
`out/` can be served by Firebase Hosting, Vercel or any static host.

## Pages
- `/` the landing page
- `/login/` and `/signup/` one screen in two states

## Connecting sign-in
Copy `.env.example` to `.env.local` and add the Supabase anon key. Until then the forms validate and hand the visitor to the app to finish. See `lib/auth.ts`.

## Editing copy
All text is in `lib/content.ts`. Aiko's lines are in `lines` at the bottom.

## Rebuilding Aiko
```bash
/Applications/Blender.app/Contents/MacOS/Blender -b --python blender/aiko.py -- "$PWD"
cwebp -q 86 public/aiko-still.png -resize 880 0 -o public/aiko-still.webp && rm public/aiko-still.png
```

## Where things are
- `components/Flight.tsx` scroll controller and page motion
- `components/scene/` the 3D scene (Aiko, stars, nebula, planets, black hole)
- `lib/flight.ts` Aiko's pose at each stop
- `DESIGN.md` colours, type, motion and references
- Add `?flight=off` to any URL to see the no-3D fallback
