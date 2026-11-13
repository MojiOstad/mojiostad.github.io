# Exhibition homepage — production review candidate

Prepared on `codex/exhibition-room-production`, based on prototype commit `0a13e6619a85a7fa39604b37aceabf07b1d8ae3e`.

## Environments

- Production candidate checkout: `/Users/mojiohz/.codex/worktrees/exhibition-room-production/MojiWebsite`.
- Candidate review preview: http://127.0.0.1:5175/ . Run `npm run dev -- --port 5175 --strictPort` from this checkout if it needs restarting.
- Readable, intentionally non-3D view: http://127.0.0.1:5175/?view=stories#object-index . It allows deliberate entry but never auto-loads Three.js.
- Prototype remains in `/Users/mojiohz/Documents/MojiWebsite`, branch `codex/exhibition-room-prototype`, preview http://127.0.0.1:5174/room/ . Its checkout and preview were not modified.
- No push, merge, publication, or live-site settings change is part of this preparation.

## Integrated behavior

The homepage inherits the approved museum-room prototype. Its visible introduction states the Wintor role and current areas of work. Ordinary HTML below the room provides all personal stories, confirmed tool descriptions, selected work, case-study links, current background, and direct contact. Existing portfolio anchors are retained. The prototype route is excluded from the production build; `/room/` continues to name locally hosted artwork assets.

The scene is lazy-loaded. Narrow screens, coarse pointers, reduced motion, and save-data require deliberate entry. No-JavaScript pages retain the poster, native story/tool disclosures, project evidence, metadata and contact links. Initialization failure or context loss returns to a readable fallback. The notebook navigates to and focuses the contact heading. No message submission backend was added.

Keyboard/touch controls mirror carpet movement, toolbox storage, props and project keepsakes. Story selection focuses its heading; repeated actions preserve focus on the replacement control. Native vertical scrolling is the default on touch; the Move objects control opts into dragging, and Escape cancels it. Optional audio only follows interaction and can be muted.

Graphics use bounded demand rendering and pause offscreen or in a hidden tab. Desktop caps device pixel ratio at 1.5; compact mode caps it at 1 and omits bloom. Static floor boards are instanced and compatible rigid siblings are batched. In the same desktop initial scene, diagnostics fell from 697 draw calls before rigid batching to about 367 afterward; this is not a frame-time or power-use benchmark. Geometry, textures, passes, audio, observers and event listeners are released on teardown.

## Evidence and validation

- `npm run build`: production multipage output succeeds.
- `npm run check`: five built pages, metadata, asset references, prototype exclusion, readable content and new/legacy anchors.
- `npm test`: bounded RAF, pause/teardown, eleven-tool storage/re-ejection, and unavailable-WebGL initialization.
- Browser: desktop and 390px mobile layouts; explicit mobile entry; story-only entry; normal/drag touch-action states; toolbox and carpet HTML controls; notebook contact hash/focus; repeated toolbox actions retain connected visible keyboard focus.
- Design detector: no findings. Independent finish review approved the candidate after its one P2 keyboard-focus finding was resolved.

## Remaining review limits

No low-end physical device frame-time or power profiling was performed. Full screen-reader certification and native touch drag testing on real iOS/Android devices remain outside the desktop-browser checks. The cloth remains an approximate bounded simulation. A full-page WebGL screenshot can lose the canvas image when its compositor surface is offscreen; the separate desktop hero and mobile captures show the scene. No runtime blank-room failure was established.

Room artwork provenance remains in `docs/room-assets.md`. The loading/social poster is a crop of the approved prototype screenshot, not new client photography. No new tools or client-impact metrics were inferred.

## Scroll entrance and recorded duck update — 13 November 2026

Opening: centered name, title and role, with quiet scroll/skip links. The identity docks during the first part of a natural 150vh desktop / 120vh compact scroll sequence. The room fades in, rotates through a shallow 18-degree camera path and grows from zoom .55 to exactly the incumbent view at (8,8,14), zoom1. Scrolling upward reverses the sequence. Room interaction waits for completion. Skip computes the actual end position and focuses the canvas. Reduced-motion and story-only views bypass the sequence; save-data retains deliberate scene loading. No wheel or touch scrolling is intercepted.

Four short excerpts from the CC0 field recording ducks1.wav replace the cartoon quack. Each tap selects a random cue other than the preceding one. The mute, pending-playback cancellation and audio resource lifecycle remain intact. Provenance and edit details are in room-assets.md.

Validation: 12 unit/regression tests; production build; five-page link/metadata and audio-asset checks; desktop and mobile opening/resting views, skip to progress1 with canvas focus, reverse to progress0, story-only view and duck playback without browser errors. Independent finish review passed after resolving mobile hint selection and terminal failure fallback guards. Failure recovery and full assistive-technology behavior were reviewed in source; low-end physical device profiling remains unperformed. The design detector reported advisory inherited type/palette documentation gaps, not new material visual findings.
