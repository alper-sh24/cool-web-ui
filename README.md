# Cool Web UI - Design Gallery

A gallery of UI design experiments and prototypes.

## Structure

```
/
├── index.html              # Main gallery (works with GitHub Pages)
├── generate-pages.js       # Build script - run after adding new pages
├── pages-data.js           # Auto-generated page metadata
└── pages/                  # Individual design HTML files
    ├── Devtool Features.html
    ├── Identity Matrix Visualization.html
    └── ...
```

## Adding New Pages

1. Add your HTML file to the `/pages/` directory
2. Run the build script:
   ```bash
   node generate-pages.js
   ```
3. Commit and push

## GitHub Pages

The gallery is ready for GitHub Pages deployment:
- Set Source to `main` branch
- `index.html` at root is served automatically
- All paths are relative - works without configuration

## Development

The gallery uses Alpine.js for interactivity and follows the "blocky" design language from the source pages.

### Live previews

Each card shows a live, scaled-down iframe of its page (rendered at a 1440×900 viewport).
To keep the gallery light, previews are driven by visibility:

- an iframe is only created when its card is within ~1 screen of the viewport,
- loads are queued (max 3 at a time) so fast scrolling doesn't start dozens of pages,
- iframes that scroll far away are destroyed after a short grace period,
- all thumbnails are torn down while a page is open full-screen.

Previews can be switched off with the **Live previews** toggle (remembered per browser, and off by default when the browser requests data saving).

### Shortcuts

- `/` focus the filter
- `←` / `→` previous / next page while previewing
- `Esc` back to the gallery

Pages are deep-linkable via the URL hash, e.g. `index.html#DitherLab.html`.
