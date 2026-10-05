# Scene map & motion plan

One persistent WebGL world sits behind the page (`#world-stage`). The DOM carries
all content; the 3D layer illustrates it. Scroll position is translated into a single
continuous number, `world.g` (station index + blend), which drives the camera, the
Developer Core and each scene's visibility. Nothing in the 3D layer is required to
read or use the site.

## Story

"The developer is the core of a product system." The core is the same object in
every chapter. It travels with the camera and changes role:

| # | Section (DOM)        | Station / 3D                                   | Core role                          | Canvas |
|---|----------------------|------------------------------------------------|------------------------------------|--------|
| 0 | Hero `#home`         | Developer Core + 3 orbit rings (web/server/mobile) with 8 tech nodes | Centerpiece        | 1.0 |
| 1 | Web `#about`         | Exploded 5-layer web stack (UI→Data), code on plates | Engine under the Data layer   | 1.0 |
| 2 | Backend              | Request graph Client→API→Express→MongoDB, Auth, Socket.IO, data pulses | Becomes the Node/Express server node | 1.0 |
| 3 | Mobile               | Browser plane compresses into a phone; Flutter screens + widget cards | Backlight behind the phone | 1.0 |
| 4 | Projects `#projects` | Wide establishing shot, dimmed                 | Drifts aside                       | 0.35 |
| 5 | Stack `#stack`       | Tilted orbit plane under the DOM tech universe | Center = "me"                      | 0.9 |
| 6 | Process              | —                                              | —                                  | 0 (render paused) |
| 7 | Experience `#experience` | —                                          | —                                  | 0 (render paused) |
| 8 | Console              | —                                              | —                                  | 0 → fades in |
| 9 | Contact `#contact`   | Core alone, calm                               | Slows down, outro                  | 1.0 |

World layout: scenes are stacked downward (y = 0, -16, -32, -48, -64, -80); the
camera descends through the "stack", from interface to data to device.

## Motion ownership

- **Three.js (R3F)**: core, rings/nodes, web layers, backend graph, phone, orbit plane,
  grid + sparse dust. One canvas, scenes only `visible` near their station,
  frameloop paused when the canvas is fully faded.
- **GSAP + ScrollTrigger**: hero intro timeline, SplitText line/char reveals,
  section entries (clip, mask, horizontal, perspective), projects horizontal pin
  with `containerAnimation`, process pin with progress, experience line scrub,
  contact outro. Everything is created inside `gsap.matchMedia()` within `useGSAP`.
- **CSS**: hovers, underlines, button press, nav indicator, cursor states.
- **Lenis**: smooth wheel scrolling synced to the GSAP ticker (off with reduced motion).

## Breakpoints & fallbacks

- `desktop` (≥1024px, motion allowed): pins, horizontal projects, scrub, pointer parallax.
- `mobile` (<1024px): no pins; projects/process stack vertically; scenes use centred
  camera offsets with a stage gap under the copy; DPR ≤ 1.25, no antialias, fewer
  particles, no HTML labels in 3D.
- `prefers-reduced-motion`: no intro, no scrub/pins, camera cuts between stations,
  no idle rotation, `frameloop="demand"`, no smooth scroll, no custom cursor.
- No WebGL: canvas is skipped; the page is complete without it.
