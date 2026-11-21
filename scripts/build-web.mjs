// Production web build for GitHub Pages: expo export + PWA tags + SPA fallback.
// Usage: WEB_BASE_URL=/dyngoc-deutsch EXPO_PUBLIC_VAPID_PUBLIC_KEY=... npm run build:web
import { spawnSync } from 'node:child_process';
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';

const base = (process.env.WEB_BASE_URL ?? '').replace(/\/$/, '');

const run = spawnSync('npx', ['expo', 'export', '--platform', 'web', '--clear'], {
  stdio: 'inherit',
  env: process.env,
});
if (run.status !== 0) process.exit(run.status ?? 1);

const tags = [
  `<link rel="manifest" href="${base}/manifest.json">`,
  `<link rel="apple-touch-icon" href="${base}/icons/apple-touch-icon.png">`,
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-title" content="DYNgoc">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="default">',
  '<meta name="theme-color" content="#2F5BD3">',
].join('\n    ');

let html = readFileSync('dist/index.html', 'utf8');
if (!html.includes('rel="manifest"')) html = html.replace('</head>', `    ${tags}\n  </head>`);
// Safe-area insets need viewport-fit=cover when running full screen from the Home Screen.
html = html.replace('<html lang="en">', '<html lang="vi">');
html = html.replace(/(<meta name="viewport" content="[^"]*?)"/, (m, head) =>
  head.includes('viewport-fit') ? m : `${head}, viewport-fit=cover"`,
);
writeFileSync('dist/index.html', html);
// GitHub Pages serves 404.html for unknown paths: deep links like /word/x load the app.
copyFileSync('dist/index.html', 'dist/404.html');

if (!process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY) {
  console.warn(
    '\n⚠️  EXPO_PUBLIC_VAPID_PUBLIC_KEY not set: push notifications disabled in this build.',
  );
}
console.log(`\nWeb build ready in dist/ (base URL "${base || '/'}").`);
