---
name: Moji Ostad — Exhibition Room
description: A tactile, quietly playful museum room with a restrained, readable portfolio.
colors:
  charcoal: "#191816"
  stage: "#211f1b"
  ivory: "#eee5d6"
  muted: "#bcb4a7"
  reading: "#c9c0b2"
  copper: "#b66e4c"
  focus-blue: "#a6cce5"
  hover-blue: "#bfdded"
  divider: "#51493e"
  quiet-divider: "#39342e"
  walnut: "#795039"
  room-ivory: "#e7d7b8"
  portal-blue: "#75c8ee"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(36px, 4.2vw, 60px)"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-.035em"
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(27px, 3vw, 38px)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-.025em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "14px"
    lineHeight: 1.8
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "13px"
rounded:
  tooltip: "2px"
  control: "3px"
  entry: "4px"
spacing:
  mobile-gutter: "22px"
  desktop-gutter: "56px"
  story-gap: "24px"
components:
  room-entry-button:
    textColor: "{colors.ivory}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
  text-action:
    textColor: "{colors.ivory}"
    typography: "{typography.label}"
  text-action-hover:
    textColor: "{colors.hover-blue}"
  tooltip:
    backgroundColor: "{colors.ivory}"
    textColor: "#211e1a"
    rounded: "{rounded.tooltip}"
    padding: "5px 8px"
---

# Design System: Moji Ostad — Exhibition Room

## Overview

**Creative North Star: "A tactile, quietly playful museum room"**

A tactile, quietly playful museum room for potential clients and collaborators. Warm materials, a fixed elevated view and recognizable personal objects carry the atmosphere; the surrounding interface stays dark, readable and restrained. Interaction reveals the playfulness already approved for this world.

This records the built homepage candidate on `codex/exhibition-room-production`, replacing the former prototype-only design record. The original prototype branch and checkout remain intact; `/room/` is excluded from the production build. The handoff remains historical context, while `index.html`, `src/room.css`, `src/exhibition.js`, `src/exhibition-room.js` and `src/room-loop.js` describe the production implementation.

**Key Characteristics:**
- Warm charcoal and ivory framing walnut, Persian rust red and restrained blue.
- Self-hosted Manrope, light headings and quiet text navigation.
- Object-led discovery supported by native HTML stories, project evidence and direct contact.

## Colors

The normative frontmatter separates the warm HTML interface from recurring room materials. It is an extracted vocabulary, not a new palette.

### Primary

Copper supplies the small name punctuation. Focus blue identifies keyboard focus and the entry control border; hover blue responds to links and buttons. Portal blue belongs to the room's experience object.

### Neutral

Charcoal is the page ground, stage is the canvas host, ivory carries primary text, muted carries supporting labels and reading carries prose. Divider and quiet-divider separate sections without cards. Walnut and room ivory describe recurring scene materials. Persian rust red remains in the woven carpet; coral Shosho and cyan Wintor neon retain their existing artwork and scene lighting, rather than becoming general interface accents.

## Typography

Self-hosted Manrope with a sans-serif fallback is the only interface family. Regular-weight display and section headings keep the room dominant. The name becomes (39px) at the compact breakpoint. Role text moves from (19px) to (15px); portfolio prose moves from (14px) to (13px). Story titles use (23px), compact (21px), with restrained negative tracking. Prose stays within approximately (60–72ch), depending on context. Contact uses a larger email link and a heading scaling to (44px).

## Layout

The header is capped at (1440px), the stage at (1560px), and reading, work and contact at (1328px). Desktop gutters are the frontmatter desktop-gutter token; compact gutters use mobile-gutter. Header identity and navigation share a row; the fixed elevated room occupies a stage with height `clamp(440px, 65vh, 780px)`.

At (700px) and below, the header stacks, the stage becomes (360px), project evidence and about content become single-column, and story controls wrap across the available width. The room remains a contained whole rather than a cropped close-up. Stories use two columns on wider screens and one on compact screens. Thin top dividers and generous vertical space organize the reading sequence.

Deliberate entry applies to narrow screens, coarse pointers, reduced motion and save-data. `?view=stories` opens the native story index without automatically mounting the room. Desktop entry otherwise waits for viewport proximity and an idle opportunity. Normal canvas interaction permits vertical page scrolling; “Move objects” explicitly enables dragging on touch. Keep the (44px) compact control targets and wrapping contact links.

## Elevation & Depth

Depth belongs primarily to the room: modeled thickness, woven carpet and fringe, natural resting angles, warm fill, contact shadows and bounded neon. The portal faces the visitor. HTML stays flat; only the ivory hover tooltip has a small shadow (`0 4px 15px #0004`). The entry overlay uses a translucent charcoal ground.

Desktop rendering caps DPR at (1.5) with bloom; compact rendering caps DPR at (1) without bloom. The lazy room uses demand rendering, bounded at (30fps) desktop and (24fps) compact while awake, pauses when hidden or offscreen, and leaves no scheduled frame once settled. Preserve reduced-motion responses, the explicit motion control and interaction-only sound.

## Shapes

Small radii soften practical surfaces without creating a card system: tooltips, the entry control and project photography, and the entry overlay use the frontmatter radii. The oval portal, rectangular equipment, open-base toolbox, folded trays and fabric carpet retain their approved modeled forms. The notebook remains a page-turn prop; direct contact sits in the HTML.

## Components

- **Navigation:** text links beside the introduction; compact navigation stacks beneath it. Blue hover and a (2px) focus outline with (5px) offset are shared across controls.
- **Entry:** contained poster, status text, bordered entry button and a story link. Loading disables the entry button. Failure restores a readable fallback and opens the story index.
- **Room settings and story actions:** understated text controls with underlines. Sound, motion and touch movement expose pressed state. Object-list controls focus the selected story heading; replacement story actions restore focus to a surviving action or heading. Contact navigation focuses its heading.
- **Native disclosures:** object controls, non-3D stories and toolkit remain ordinary `details`/`summary` elements. The static stories, project evidence and contact remain useful without JavaScript or WebGL.
- **Project evidence:** one photographic case-study link beside a text list, stacking on compact screens. The photograph preserves its approved crop and concise caption; no raised cards.
- **Room objects:** portal opens before subsequent external navigation; powered equipment boots and can restart. Carpet dragging reveals fixed keepsakes, with directional/reset alternatives. Toolbox opening ejects stored tools, with drag and put-in/take-out alternatives. Duck, headset, devices and plants preserve their approved bounded surprises. Keep concise discovery tags and verified tool names.

The supplied desktop and mobile QA images confirm the implemented visual composition. Finish review approved the candidate after action-focus restoration. Real low-end device frame-time measurements and full assistive-technology testing remain unverified; this document does not establish those results or publication status.

## Do's and Don'ts

### Do:
- Do preserve the fixed elevated room, natural object materials and immediately readable name and Wintor role.
- Do keep Shosho and Wintor visible as current connections; GGJG remains past involvement.
- Do preserve keyboard and touch alternatives, visible focus, ordinary page scrolling and readable stories without 3D.
- Do retain real project imagery and factual case-study links.

### Don't:
- Don't reintroduce the rejected editorial world, physical lamps, plaques, tags or banners in the room.
- Don't replace natural undiscovered-object materials with a shared dark mask.
- Don't turn hover tags into persistent signage or make contact depend on the room.
- Don't autoplay audio, add tracking, or imply a contact submission backend exists.
