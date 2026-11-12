# Exhibition room: production implementation handoff

## Isolation and scope

The user asked this design chat to polish the room, keep the test environment on a separate branch, and ask the original implementation chat to prepare the update.

- Prototype branch: `codex/exhibition-room-prototype`.
- Prototype checkout: `/Users/mojiohz/Documents/MojiWebsite`.
- Local route: `http://127.0.0.1:5174/room/`.
- Current production homepage and case-study source are preserved. The prototype remains a separate `/room/` entry with `noindex`.
- Implement the production version in a separate worktree and branch. Do not switch or modify this shared prototype checkout, remove its preview, or repurpose its branch.
- Prepare a reviewable production update. This handoff does not authorize publication, merge, or changing the live site.

## Selected visual direction

A tactile, quietly playful museum room for potential clients and collaborators. Warm charcoal, ivory, walnut, Persian rust red, restrained blue, coral Shosho and cyan Wintor neon. Fixed elevated camera. Keep the visible Moji Ostad name, current Wintor role and introduction immediately readable.

The new room replaces the rejected editorial design. Do not carry over that old visual direction as design authority. Keep the professional story and verified project evidence.

## Latest polish requirements implemented in the prototype

- Cantilever toolbox moved beneath the Shosho and Wintor lights, with forward ejection so tools stay in the room.
- Portal photograph uses aspect-preserving, centered cover cropping, including while the oval opens. First click opens; later clicks visit `https://www.wintor.com/` in a new tab.
- Stand-mounted binocular VR headset with two lenses, cushion and curved straps replaces the original block model.
- Small hover tags: headset `VR`, phone/tablet `AR app`, duck `duck`; plants and server show no tag. Other main objects use concise labels. Tools retain their names.
- Project icons exposed beneath the carpet show `Glass Garden`, `Northern Farm`, or `Tactics` on hover, rather than inheriting `Iran`. The carpet itself keeps `Iran`; GGJG keeps its own identity.
- Notebook click turns the page, then navigates to a real `#contact` section and focuses its heading. Direct contact navigation remains available. There is no submission backend.

## Preserve the approved interactions

- Server, laptop and desktop start off. Click starts a short boot sequence; further clicks restart it.
- Carpet can be grabbed anywhere and dragged. A small position-based cloth grid provides friction, local lifting, lag, settling and floor bounds. Fixed keepsakes underneath include GGJG and three older projects.
- Modern toolbox unfolds two trays on connecting arms. Each opening shakes and ejects every stored tool. Icons left outside stay outside; returned tools ride the trays when closed. Tools can be dragged, returned to highlighted drop targets, or managed using the tool list.
- Approved tools: Svelte, Azure, Unity, Codex, Python, Plesk, C#, Git, GitHub Actions, Vite, npm. Codex uses a generic terminal token, not a claimed official logo. Additional tool claims need evidence; do not infer Docker/Kubernetes use.
- Duck click gives a small squash and synthesized quack; no autoplay audio, with a mute control.
- Headset click briefly glitches the room without flashing. Reduced motion uses a still response.
- Phone and tablet remain stationary and toggle their screens on/off.
- Small plant and duck share a left-wall stand beneath an abstract print. A tall floor plant remains. Foliage click drops one random yellowing leaf; pot click regrows lost leaves.
- Keyboard/touch alternatives, reduced-motion behaviour, and pausing when hidden/offscreen remain important.

## Source map

- `room/index.html`: prototype shell, HTML exploration controls, contact section.
- `src/room.js`: scene orchestration, object stories, raycasting, power states, portal, contact flow.
- `src/room-props.js`: workspace, headset, plants, duck, devices.
- `src/room-toolbox.js`: tool catalogue, layered toolbox, pickup/drop/storage/ejection.
- `src/room-carpet.js`: woven visible geometry, underside, edges, fringe.
- `src/room-cloth.js`: lightweight cloth grid and coverage checks.
- `src/room.css`: prototype layout, compact tags, contact styling.
- `public/room/`: locally served tool/brand/project assets.
- `docs/room-assets.md` and `docs/content-sources.md`: provenance and factual limits.

## Factual boundaries

Moji Ostad is a developer and experience designer. Wintor began with Unity and experience design, expanding from early 2026 into backend, web, production analytics/support and infrastructure. Azure, AI and VR learning continues. Shosho is a current work affiliation. GGJG is former volunteering/organization, not a current affiliation. Local AI for museum experiences is ongoing exploration, not deployed museum AI. Spell Shosho with only the initial S capitalized in authored text; preserve official logo artwork and exact paths.

## Production work still required

This is a design prototype, not a production-readiness claim. Integrate the room into the homepage while retaining real work evidence, directly reachable contact and useful case-study links. Preserve ordinary HTML content, existing inbound anchors and SEO metadata; replace prototype `noindex` only on the production surface. Provide meaningful no-JavaScript / no-WebGL content and error fallbacks.

Review performance on real desktop/mobile viewports: lazy-load 3D, bound GPU resolution and postprocessing, reduce draw calls, pause unused animation and dispose resources. The cloth is an approximate lightweight simulation, not a full self-collision/furniture physics engine. Review layout at the toolbox's new position, tool drop affordances, touch scrolling and keyboard interaction. The current link-check script covers the five incumbent pages; extend validation to the production room/homepage and new contact anchors.

Verification already performed includes builds and incumbent link checks; desktop/mobile visual checks; real mouse pickup/drop into a tray; repeat ejection, storage and fold-state checks for all eleven tools; direct carpet dragging, bounded cloth deformation and reset; portal navigation to Wintor; aspect-ratio calculation; and notebook `#contact` navigation with focus transfer. Recheck these after production integration.
