// Renders every page in /pages in a headless browser and saves a static
// snapshot to /thumbnails, so the gallery can show images instead of running
// dozens of live pages at once.
//
// Usage:
//   npm run thumbnails            # only (re)render new or changed pages
//   npm run thumbnails -- --force # re-render everything
//   npm run thumbnails -- "DitherLab.html"   # re-render specific pages
//
// Pages are keyed by a hash of their HTML, stored in thumbnails/manifest.json.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

const PAGES_DIR = path.join(__dirname, 'pages');
const THUMBS_DIR = path.join(__dirname, 'thumbnails');
const MANIFEST_FILE = path.join(THUMBS_DIR, 'manifest.json');

// Must match the preview aspect ratio in index.html (1440 / 900).
const VIEWPORT = { width: 1440, height: 900 };
const SCALE = 2 / 3;              // -> 960x600 images, sharp enough for retina cards
const JPEG_QUALITY = 78;
const NETWORK_IDLE_TIMEOUT_MS = 10000;
const SETTLE_MS = 1500;           // let intro animations / fonts / WebGL settle
const CONCURRENCY = 4;

function thumbnailName(filename) {
    const slug = filename
        .replace(/\.html$/i, '')
        .normalize('NFKD')
        .replace(/[^A-Za-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();
    const hash = crypto.createHash('sha1').update(filename).digest('hex').slice(0, 6);
    return `${slug}-${hash}.jpg`;
}

function hashFile(filepath) {
    return crypto.createHash('sha1').update(fs.readFileSync(filepath)).digest('hex');
}

function readManifest() {
    try {
        return JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf-8'));
    } catch {
        return {};
    }
}

async function capture(context, filename) {
    const page = await context.newPage();
    try {
        await page.goto(pathToFileURL(path.join(PAGES_DIR, filename)).href, { waitUntil: 'load', timeout: 30000 });
        await page.waitForLoadState('networkidle', { timeout: NETWORK_IDLE_TIMEOUT_MS }).catch(() => {});
        await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
        // Glide the pointer in so pointer-driven pages (canvas ripples etc.) show something.
        await page.mouse.move(VIEWPORT.width * 0.3, VIEWPORT.height * 0.35);
        await page.mouse.move(VIEWPORT.width / 2, VIEWPORT.height / 2, { steps: 12 });
        await page.waitForTimeout(SETTLE_MS);
        await page.screenshot({
            path: path.join(THUMBS_DIR, thumbnailName(filename)),
            type: 'jpeg',
            quality: JPEG_QUALITY,
        });
    } finally {
        await page.close();
    }
}

async function main() {
    const args = process.argv.slice(2);
    const force = args.includes('--force');
    const only = args.filter(a => !a.startsWith('--'));

    fs.mkdirSync(THUMBS_DIR, { recursive: true });
    const files = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.html')).sort();
    const previous = readManifest();
    const manifest = {};
    const todo = [];

    for (const filename of files) {
        const hash = hashFile(path.join(PAGES_DIR, filename));
        const thumb = thumbnailName(filename);
        const upToDate = previous[filename]?.hash === hash && fs.existsSync(path.join(THUMBS_DIR, thumb));
        manifest[filename] = { hash, thumbnail: thumb };
        if (force || (only.length ? only.includes(filename) : !upToDate)) todo.push(filename);
    }

    // Remove snapshots of pages that no longer exist.
    const keep = new Set(Object.values(manifest).map(m => m.thumbnail));
    for (const f of fs.readdirSync(THUMBS_DIR)) {
        if (f.endsWith('.jpg') && !keep.has(f)) {
            fs.unlinkSync(path.join(THUMBS_DIR, f));
            console.log(`removed  ${f}`);
        }
    }

    if (todo.length) {
        const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
        const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: SCALE });
        const failed = [];

        const queue = [...todo];
        await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
            while (queue.length) {
                const filename = queue.shift();
                try {
                    await capture(context, filename);
                    console.log(`captured ${filename}`);
                } catch (err) {
                    failed.push(filename);
                    // Keep the old snapshot (if any) and retry on the next run.
                    manifest[filename].hash = previous[filename]?.hash ?? null;
                    console.error(`FAILED   ${filename}: ${err.message.split('\n')[0]}`);
                }
            }
        }));

        await browser.close();
        if (failed.length) process.exitCode = 1;
    }

    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 4) + '\n');
    console.log(`${todo.length} captured, ${files.length - todo.length} up to date`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
