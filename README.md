# My English World

Personal mobile-first English Learning Dashboard.
Pinterest × fashion magazine × London / NYC / LA.

Open `index.html` or publish via GitHub Pages.

## Publish

1. Push all files to `https://github.com/natalianata6277/english-dashboard`
2. Repo Settings → Pages → Deploy from branch → `main` / root
3. Open `https://natalianata6277.github.io/english-dashboard/`
4. iPhone Safari → Share → Add to Home Screen

All paths are relative (`./`) so the `/english-dashboard/` sub-path works.

## Images — Global Library

Drop files into:

```
assets/images/image-01.jpg
assets/images/image-02.jpg
...
image-50.jpg
```

No code changes needed. The app auto-discovers `image-01 … image-50`
(`.jpg` / `.jpeg` / `.png` / `.webp`) and picks a random one each visit.
One image can appear on any screen. No hard binding page ↔ image.
If no images exist, the app shows a CSS editorial gradient — still beautiful.

## Data

Everything in `localStorage` key `english-world-v1`.
Settings → Export / Import JSON to back up.

## Structure

- `index.html` — shell + all screens (hash router, no build step)
- `styles.css` — editorial mobile-first system
- `app.js` — store, router, image service, all features
- `manifest.json` — PWA standalone
- `sw.js` — offline cache
- `assets/images/` — global image library
- `assets/icons/` — app icons (SVG placeholders, replace with your PNGs)
