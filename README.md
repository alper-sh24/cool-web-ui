# Cool Web UI - Design Gallery

A gallery of UI design experiments and prototypes.

## Structure

```
/
├── index.html              # Main gallery (works with GitHub Pages)
├── generate-pages.js       # Builds pages-data.js from /pages (+ thumbnails)
├── generate-thumbnails.js  # Renders a static snapshot of each page (Playwright)
├── pages-data.js           # Auto-generated page metadata
├── thumbnails/             # Auto-generated page snapshots + manifest.json
└── pages/                  # Individual design HTML files
    ├── Devtool Features.html
    ├── Identity Matrix Visualization.html
    └── ...
```

## Adding New Pages

1. Add your HTML file to the `/pages/` directory
2. Commit and push (or open a PR)

The **Thumbnails** GitHub Action renders snapshots for new or changed pages,
regenerates `pages-data.js`, and commits both back to the branch.
Run it manually from the Actions tab with **force** to re-render every page.

To build locally instead:

```bash
npm install
npx playwright install chromium
npm run build          # snapshots for new/changed pages + pages-data.js
npm run thumbnails -- --force            # re-render everything
npm run thumbnails -- "DitherLab.html"   # re-render specific pages
```

If you only want to refresh titles without snapshots, `node generate-pages.js` needs no dependencies.

## GitHub Pages

The gallery is ready for GitHub Pages deployment:
- Set Source to `main` branch
- `index.html` at root is served automatically
- All paths are relative - works without configuration

## Development

The gallery uses Alpine.js for interactivity and follows the "blocky" design language from the source pages.

### Previews

Each card shows a static snapshot of its page (rendered at a 1440×900 viewport), so the
gallery itself runs no page code while idle. Hovering a card (or focusing it with the
keyboard) swaps in a live iframe of the page; only one live preview exists at a time and
it is destroyed when the pointer leaves. On touch devices a tap opens the page directly.

### Shortcuts

- `/` focus the filter
- `←` / `→` previous / next page while previewing
- `Esc` back to the gallery

Pages are deep-linkable via the URL hash, e.g. `index.html#DitherLab.html`.
