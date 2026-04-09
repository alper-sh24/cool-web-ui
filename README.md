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
