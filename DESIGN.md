# Aether Studio landing page: design system

## The idea
One guided flight. Aiko, rebuilt as a small hovering robot, is on screen the whole way and flies from stop to stop as you scroll. The page is the route; the 3D scene is one fixed canvas behind real HTML.

Mode: Persuade. Dark because the subject is deep space and the product itself opens in a "deep space dark mode".

## Colour
| Token | Value | Use |
|---|---|---|
| `--void` | `#04050b` | page |
| `--panel` | `#0d1020` | app window, speech bubble |
| `--line` / `--line-strong` | `rgb(190 200 255 / .14)` / `.28` | hairlines; borders are drawn with inset shadows |
| `--star` | `#f3f0ea` | headings and primary text |
| `--dust` | `#b1b5cd` | body text |
| `--faint` | `#8387a6` | captions, inactive items |
| `--amber` | `#ffb454` | the one action colour: buttons, active states, chapter names, numbers |
| `--violet` | `#9a7bff` | Aiko's own light and the nebula only, never UI |
| `--coral` | `#ff6a52` | Aiko's eyes and her name on the speech bubble; form errors |

Violet was the old page's everything-colour. Here it belongs to Aiko and the sky; amber is what you click.

## Type
- **Display:** Bricolage Grotesque 600–800, tracking −0.03 to −0.04em, line-height 0.92–1.04. Largest size 6rem.
- **Body:** Geist 400–600, 17px / 1.6, measure under 52ch.
- **Mono:** Geist Mono, only for the app window's title bar and the director prompt recipes (they are literal prompt text).
- Emphasis is weight and colour. No gradient text, no labels above headings.

## Shape
Round world: pill buttons and chips, 14–20px radii on panels and inputs. Shadows are offset and soft; glass blur only on the app window and speech bubble, where it separates them from the moving scene.

## Layout
- 1320px container; gutter `clamp(20px, 5vw, 72px)`; an extra 84px on the left above 1200px for the route rail.
- Copy takes one side, Aiko the other, and they swap sides between stops.
- Features are three pinned chapters (Create, Refine, Keep) of three rows each, not a card grid.

## Aiko
- Modelled by script in Blender (`blender/aiko.py`), exported as `public/models/aiko.glb`, about 950 KB, no rig.
- Named nodes animated in code: `Head`, `Torso`, `HandL`, `HandR`, `Face`, `Core`.
- Carries the original Aiko's features: indigo bob as the helmet, gold clip and collar, teal skirt, red eyes as coral dots.
- Face is a dot-matrix shader with blink, happy, wow and talking states. Her head follows the cursor.
- Gestures: wave, point, present, reach up, think, cover eyes.

## Motion
| Moment | What moves | Timing |
|---|---|---|
| Arrival (the one big entrance) | headline letters rise out of blur while Aiko boots | 1.2s, expo out, 50ms stagger |
| Flight between stops | Aiko's position, scale, lean and gesture; stars rush with scroll speed | damped, follows scroll |
| Numbers | the sentence lights word by word | scrubbed to scroll |
| Studio | app window tilts up; prompt types; picture develops from blur | scrubbed, then 1.4s |
| Chapters | name slides in a mask, rows draw their rule then rise | 0.7s, 70ms stagger; exit 0.3s |
| Director Mode | key light, rim light and nebula relight | 3.2/s damping |
| Launch | fall toward the black hole; headline tracking closes | scrubbed |
| Page change | two-layer iris from the click point | 520ms in-out, 90ms offset |
| Sign in ↔ sign up | pill slides, titles crossfade through blur, name field opens | 0.45s ease out |

Easing: `cubic-bezier(0.16, 1, 0.3, 1)` out, `cubic-bezier(0.65, 0, 0.35, 1)` in-out. Press feedback is `scale(0.97)` in 160ms. Hover styles are gated to hover-capable pointers.

## Fallbacks
`prefers-reduced-motion`, no WebGL, a scene error, or `?flight=off` all switch to a static page: no canvas, no smooth scroll, a rendered still of Aiko, her lines printed in place, chapters stacked.

## References
From the owner's design library. The reference shots are kept locally in `design/refs/` and are not in the repository, because they are other people's work.
- `DL-103 Tribe AI` → one hero element that guides the whole page (avoided: its five canvases)
- `UI-022 Rik Is Watching` → screen-faced robot whose head follows the cursor
- `UI-068 Black Hole Hero` → amber lensed black hole beside quiet left-aligned type
- `UI-040 Through the event horizon` → the route rail and the scroll-to-dive finale
- `DL-070 Shiv Shakti` → lazy 3D chunk with a still fallback
- `DL-065 3D Stack Motion` → chapters that turn in depth on a pinned stage
- `DL-101 COSMOQ` → word-by-word statement and giant footer wordmark (avoided: glow palette, labels over headings, equal tiles)
