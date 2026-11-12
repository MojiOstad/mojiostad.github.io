# Moji Ostad portfolio
Static HTML, CSS and JavaScript, built with Vite. Three.js is loaded only for the optional interactive homepage sculpture.

## Develop
Node 22 or newer. Run `npm ci`, then `npm run dev`.

## Verify and build
Run `npm run build` and `npm run check`. Run `npm run preview` for the production preview.

## Content
Homepage: `index.html`. Case studies: `work/*/index.html`. Styles and interaction: `src/`. Public assets: `public/`. Internal content provenance: `docs/content-sources.md`.

## Publish
Push to main to build and deploy with GitHub Actions. GitHub Pages source must be GitHub Actions, and the repository must be named `mojiostad.github.io`. No server or secrets are required. The previous website commit remains in Git history; roll back by reverting the redesign commit and restoring the corresponding Pages source if needed.

## Exhibition-room production candidate

The homepage now integrates the approved room with native HTML stories, project evidence, and contact. The design prototype remains on `codex/exhibition-room-prototype` in its original checkout; do not repurpose that environment for production edits.

This candidate uses `codex/exhibition-room-production` in a separate managed worktree. Use `npm run dev -- --port 5175 --strictPort` for review; the prototype owns port 5174. `?view=stories` provides an intentionally non-3D entry. Run `npm run build`, `npm run check`, and `npm test` before release. The production build excludes the prototype `/room/` HTML route while retaining its artwork assets.

See `docs/production-room-review.md` for implementation details, checks, and remaining device-testing limits. Publication requires a separate user instruction; this preparation does not change main or the live website.
