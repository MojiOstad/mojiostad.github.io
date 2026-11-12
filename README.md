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
