# Nalar Labs Landing Page — Production Readiness & Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take the Figma-Make-generated `nalar-landing-v1` mockup to a deployable production state, fix the globe's rotation-speed bug, add a camera fly-into-the-globe interaction, and align the Services section (and a new Refer-a-Client section) with `business_plan.md`.

**Architecture:** Single-page React 18 + Vite 6 + Tailwind 4 app. All page sections live in one file, `src/app/App.tsx` — this plan follows that existing convention rather than introducing a new file-per-section structure, since no functional requirement demands it. The 3D globe is a `three.js` scene driven by a GSAP ticker, mounted imperatively inside a `useEffect`. New capability (camera fly-in) is added via `forwardRef` + `useImperativeHandle` so a sibling button component can command the Three.js scene without lifting the whole scene into React state.

**Tech Stack:** React 18.3, Vite 6, TypeScript 5, Tailwind CSS 4, GSAP 3 (+ ScrollTrigger), three.js 0.185, lucide-react icons.

## Global Constraints

- Node.js >= 18.18; package manager is **npm** (not pnpm — `pnpm-workspace.yaml` currently restricts installs to `os: linux`, which breaks local installs on the developer's Mac, and pnpm is not installed locally; the file is removed in Task 2).
- No test framework exists in this repo and none is requested by the user. Verification for every task is: `npx tsc --noEmit` (typecheck), `npm run build` (production build succeeds), and a manual check in the running dev server (via the preview tool) for any task that changes visible/interactive behavior. Do not introduce a test framework as part of this plan.
- Never display the hourly rates ($20–$50/hr, $30–$100/hr) or the referral commission percentages (30%, 10%) anywhere in UI copy — the user confirmed these are secret. Business-plan content must be paraphrased without numbers.
- Business-plan alignment is scoped to exactly three things, per explicit user decision: (1) the **Services** section must cover business-plan sections 5 and 6, (2) a new **Refer a Client** section must be added below Services with a clear CTA, and (3) a new **Core Values** section (business-plan section 4) must be added directly below the Stats bar. The Hero, Stats bar, Team section, and the globe's fake portfolio/client cards are explicitly **out of scope** — do not modify their content in this plan.
- Preserve the existing visual language for all new/changed UI: `font-['Instrument_Serif',serif]` for headings, the `#fafaf8` / `#0d0d0d` / `#f2f0eb` palette already in use, uppercase-tracked micro-labels (`text-[0.7rem] font-semibold tracking-[0.28em] uppercase text-muted-foreground`), and GSAP `gsap.context(...)` + `ScrollTrigger` entrance animations matching sibling sections.
- Every step that shows a "Modify" target references exact line numbers from the file as it exists at the *start of this plan*. If a prior task in this plan already changed the file, use the line numbers as they exist after that prior task's edit (each step's code block is self-sufficient — match by the shown surrounding code, not blindly by line number).

---

## Deployment Method Comparison (for Task 12)

Researched up front so Task 12 just needs to implement the chosen configs:

| Platform | Setup effort | Free tier | Custom domain + HTTPS | Notes |
|---|---|---|---|---|
| **Netlify** (recommended) | Lowest — reads `netlify.toml` | Yes | Yes, automatic | Git-connected deploys on every push, generous free tier, easiest setup |
| **Vercel** | Lowest — auto-detects Vite | Yes | Yes, automatic | Git-connected deploys on every push, preview URL per PR |
| **Cloudflare Pages** | Low — dashboard only | Yes, unlimited bandwidth | Yes, automatic | Fastest edge network; no CLI config file needed |
| **GitHub Pages** | Medium — needs `base` path change in `vite.config.ts` | Yes | Yes (via CNAME) | Only worth it to avoid a third-party host |
| **Static host (S3+CloudFront, Nginx, etc.)** | Highest | Depends | Manual | Full control, most ops overhead |

This is a fully static build (`dist/` — plain HTML/CSS/JS, no server code, no client-side router), so it can be hosted anywhere that serves static files. Task 12 documents all five and ships ready-to-use config files for Netlify and Vercel (the two lowest-effort, git-connected options), plus the Cloudflare Pages dashboard steps.

---

## Task 1: Initialize git and capture the baseline

**Files:**
- Create: `.gitignore`

**Interfaces:** None (repo setup only).

- [ ] **Step 1: Confirm there's no existing repo to clobber**

Run: `git status` from `nalar-landing-v1/`
Expected: `fatal: not a git repository` (confirms it's safe to `git init` fresh — this was already checked during planning).

- [ ] **Step 2: Create `.gitignore`**

```
node_modules
dist
.DS_Store
*.local
```

- [ ] **Step 3: Initialize the repo and commit the current state as a baseline**

```bash
git init -b main
git add -A
git commit -m "chore: baseline import of Figma Make export"
```

This baseline commit exists so every later task in this plan produces a reviewable diff.

- [ ] **Step 4: Connect the GitHub remote**

```bash
git remote add origin https://github.com/Nalar-Labs/landing.git
```

Do not push yet — the first push happens in Task 13 after QA passes, so the public repo never contains a known-broken state. (If the remote already has commits — e.g. a README created via the GitHub UI — Task 13's push will be rejected; resolve then with `git pull --rebase origin main` before pushing.)

---

## Task 2: Fix package.json and add TypeScript config

**Files:**
- Modify: `package.json` (full rewrite)
- Create: `tsconfig.json`
- Delete: `pnpm-workspace.yaml`

**Interfaces:** None (tooling only). Produces `npm run build`, `npm run dev`, `npm run preview`, `npm run typecheck` scripts that later tasks rely on.

**Context:** The current `package.json` has two production-readiness bugs: (1) `react`/`react-dom` are declared as `peerDependenciesMeta.optional: true`, which means a plain `npm install` will **not** install them — the site would fail to build outside the Figma Make sandbox that normally provides them; (2) it lists ~50 dependencies (MUI, Radix, recharts, embla-carousel, react-router, etc.) that `src/app/App.tsx` and `src/main.tsx` never import — confirmed by grepping the whole `src/` tree for each package name and finding zero matches outside their own unused `src/app/components/ui/*` definitions (deleted in Task 3). There is also no `typescript`, `@types/react`, or `@types/react-dom` dependency at all, so `.tsx` files can't currently be type-checked.

- [ ] **Step 1: Replace `package.json`**

```json
{
  "name": "nalar-labs-landing",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "engines": {
    "node": ">=18.18.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "gsap": "^3.15.0",
    "lucide-react": "0.487.0",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "three": "^0.185.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "4.1.12",
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/three": "^0.185.0",
    "@vitejs/plugin-react": "4.7.0",
    "tailwindcss": "4.1.12",
    "tw-animate-css": "1.3.8",
    "typescript": "^5.7.2",
    "vite": "6.3.5"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "types": ["vite/client", "node"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src", "vite.config.ts"]
}
```

Note: `@types/node`, `"types": [..., "node"]`, and `esModuleInterop` are all load-bearing — `vite.config.ts` does `import path from 'path'` (a CJS default-import that errors without `esModuleInterop`) and uses the Node global `__dirname` (invisible to `tsc` without the `node` types entry). Without these three, `npm run typecheck` fails at Task 4.

- [ ] **Step 3: Delete `pnpm-workspace.yaml`**

```bash
rm pnpm-workspace.yaml
```

Its `supportedArchitectures.os: [linux]` restriction would block `pnpm install` on macOS/Windows dev machines. Since the project now uses npm (Step 1's scripts), the file serves no purpose.

- [ ] **Step 4: Commit**

```bash
git add package.json tsconfig.json pnpm-workspace.yaml
git commit -m "chore: fix package.json (real react deps, prune unused packages) and add tsconfig"
```

(`git add` on a deleted file stages the deletion.)

---

## Task 3: Delete unused scaffolding

**Files:**
- Delete: `src/app/components/ui/` (48 files — shadcn components, none imported by `App.tsx` or `main.tsx`)
- Delete: `src/app/components/figma/ImageWithFallback.tsx` (unused)
- Delete: `src/imports/` (536 KB — unused `MacBookPro141` Figma import + its PNG asset)
- Delete: `src/styles/globals.css` (0 bytes, dead import)
- Delete: `default_shadcn_theme.css` (repo root — Figma Make reference file, imported nowhere)
- Modify: `src/styles/index.css`
- Modify: `vite.config.ts`

**Interfaces:** None — none of this code is referenced anywhere else (verified via `grep -rl` across `src/` for each import path before writing this plan).

- [ ] **Step 1: Delete the unused directories/files**

```bash
rm -rf src/app/components/ui
rm -rf src/app/components/figma
rm -rf src/imports
rm src/styles/globals.css
rm default_shadcn_theme.css
```

- [ ] **Step 2: Remove the dead `globals.css` import from `src/styles/index.css`**

Current content:
```css
@import './fonts.css';
@import './tailwind.css';
@import './theme.css';
```

Replace with:
```css
@import './tailwind.css';
@import './theme.css';
```

(`fonts.css`'s import is also dropped here — Task 5 moves font loading into `index.html` via a `<link>` tag and deletes `fonts.css`.)

- [ ] **Step 3: Remove the now-dead `figma:asset` resolver from `vite.config.ts`**

Current content:
```ts
import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
```

Replace with:
```ts
import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
```

`src/imports/` (the only consumer of `figma:asset/` imports) was deleted in Step 1, so the resolver has no remaining caller.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: delete unused shadcn scaffolding, dead CSS import, and figma asset resolver"
```

---

## Task 4: Verify install and build

**Files:** None — verification only.

**Interfaces:** Confirms the scripts from Task 2 actually work before building features on top of them.

- [ ] **Step 1: Install dependencies**

Run: `npm install` from `nalar-landing-v1/`
Expected: Installs cleanly, no `ERESOLVE` errors, `node_modules` created.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: Exits 0 with no errors. (If `App.tsx` surfaces strict-mode errors, e.g. implicit `any`, fix them in place before continuing — the file was written without a `tsconfig.json` present, so this is the first time it's been checked.)

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: Exits 0, produces `dist/index.html` and `dist/assets/*`.

- [ ] **Step 4: Smoke-test the dev server**

Run: `npm run dev` and open the printed local URL in a browser (or use the preview tool).
Expected: Page loads, hero renders, globe spins with portfolio card textures loading in.

No commit needed for this task (no file changes) unless Step 2 required fixes — if so:
```bash
git add -A
git commit -m "fix: resolve typecheck errors surfaced by new tsconfig"
```

---

## Task 5: index.html metadata, favicon, and font loading

**Files:**
- Modify: `index.html`
- Create: `public/favicon.svg`
- Delete: `src/styles/fonts.css`
- Modify: `README.md`

**Interfaces:** None.

**Context:** Current `index.html` has a placeholder Figma title (`Create interactive landing page`), a description about "a 3D interactive spinning globe" that isn't Nalar Labs copy, and `<meta name="robots" content="noindex, nofollow" />` — which would stop search engines from indexing the site if shipped as-is. There's also no favicon, and the Google Fonts `@import` inside `fonts.css` is render-blocking (the browser must download and parse the CSS before it can discover and start the font request) versus a `<link>` tag in `<head>`, which the browser can start fetching immediately in parallel with everything else.

- [ ] **Step 1: Create `public/favicon.svg`**

```bash
mkdir -p public
```

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0d0d0d"/>
  <text x="32" y="45" font-family="Georgia, 'Times New Roman', serif" font-size="34" font-style="italic" fill="#fafaf8" text-anchor="middle">N</text>
</svg>
```

- [ ] **Step 2: Replace `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nalar Labs — AI Implementation Consulting</title>
    <meta
      name="description"
      content="Nalar Labs helps small and mid-sized businesses build software and AI infrastructure they actually own — from strategy through implementation and team training."
    />
    <meta name="robots" content="index, follow" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Nalar Labs — AI Implementation Consulting" />
    <meta
      property="og:description"
      content="Software and AI infrastructure you actually own — from strategy through implementation and team training."
    />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="Nalar Labs — AI Implementation Consulting" />
    <meta
      name="twitter:description"
      content="Software and AI infrastructure you actually own — from strategy through implementation and team training."
    />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preconnect" href="https://images.unsplash.com" />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:ital,opsz,wght@0,14..32,300..700;1,14..32,300..700&display=swap"
    />
    <style>
      html, body { height: 100%; margin: 0; }
      #root { height: 100%; }
    </style>
  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Delete the now-redundant `src/styles/fonts.css`**

```bash
rm src/styles/fonts.css
```

(Its single `@import` line was already dropped from `src/styles/index.css` in Task 3 Step 2; the font is now loaded via the `<link>` tag above instead.)

- [ ] **Step 4: Replace `README.md`**

(Outer fence is 4 backticks because the README itself contains 3-backtick blocks — write the file with the inner content exactly as shown.)

````md
# Nalar Labs — Landing Page

Marketing landing page for Nalar Labs, an AI implementation consulting studio. Built with React, Vite, Tailwind CSS, GSAP, and Three.js (the portfolio globe in the hero).

Repository: https://github.com/Nalar-Labs/landing

## Requirements

- Node.js >= 18.18

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build   # type-checks then builds to dist/
npm run preview # serve the production build locally
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for a comparison of hosting options (Netlify, Vercel, Cloudflare Pages, GitHub Pages, plain static hosting) and step-by-step instructions.
````

- [ ] **Step 5: Verify and commit**

Run: `npm run build`
Expected: Still exits 0.

```bash
git add -A
git commit -m "feat: production metadata, favicon, non-blocking font loading"
```

---

## Task 6: Add an error boundary

**Files:**
- Create: `src/app/components/ErrorBoundary.tsx`
- Modify: `src/main.tsx`

**Interfaces:**
- Produces: `ErrorBoundary` — a React class component accepting `{ children: ReactNode }`, used by `main.tsx`.

**Context:** Currently, any uncaught render error anywhere on the page (including inside the `three.js` globe effect) blanks the entire app to a white screen with no recovery path. A top-level error boundary contains that to a readable fallback instead.

- [ ] **Step 1: Create `src/app/components/ErrorBoundary.tsx`**

```tsx
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Nalar Labs site crashed:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#fafaf8] px-6 text-center">
          <div>
            <h1 className="font-['Instrument_Serif',serif] text-3xl mb-3 text-foreground">
              Something went wrong
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              Please refresh the page. If the problem continues, email{" "}
              <a href="mailto:hello@nalarlabs.com" className="underline">
                hello@nalarlabs.com
              </a>
              .
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-foreground text-background px-6 py-3 text-sm font-semibold uppercase tracking-widest"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

- [ ] **Step 2: Wire it into `src/main.tsx`**

Current content:
```tsx
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

Replace with:
```tsx
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { ErrorBoundary } from "./app/components/ErrorBoundary.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run build`
Expected: Both exit 0.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add top-level error boundary"
```

---

## Task 7: Fix the globe's rotation-speed bug, add reduced-motion support, WebGL fallback, and an imperative enter/exit API

**Files:**
- Modify: `src/app/App.tsx` (the `Globe` function, currently lines 79–224)

**Interfaces:**
- Produces: `GlobeHandle` interface (`{ enter: () => void; exit: () => void }`) and `Globe` becomes `forwardRef<GlobeHandle>(...)`. Task 8 consumes both — it renders `<Globe ref={globeRef} />` and calls `globeRef.current?.enter()` / `.exit()`.

**Context — the rotation bug:** GSAP's `ticker.add(callback)` invokes the callback with `(time, deltaTime, frame, elapsed)` where **`deltaTime` is in milliseconds**, not seconds (confirmed against GSAP's own docs). The current code does:
```ts
const ROT_SPEED = (Math.PI * 2) / 38; // radians / second
const autoRotate = (_: number, dt: number) => {
  if (!dragging) glob.rotation.y += ROT_SPEED * dt;
};
```
`dt` here is milliseconds, so the globe actually completes a full rotation roughly every **38 milliseconds** instead of every 38 seconds — about 1000× faster than intended. That's the "spinning very fast" bug. The fix divides `dt` by 1000, and this task also lengthens the intended rotation period so the result reads as calm and ambient rather than merely "correct."

- [ ] **Step 1: Replace the `Globe` function (current lines 79–224) with the version below**

This single replacement does five things: (a) fixes the millisecond/second bug, (b) slows the rotation to a 140-second period, (c) skips rotation and entrance animation when the user has `prefers-reduced-motion: reduce`, (d) shows a plain-text fallback instead of a blank canvas when WebGL isn't available, and (e) exposes `enter`/`exit` via `forwardRef` for Task 8's button.

```tsx
/* ─── Globe camera presets ──────────────────────────────────── */
const OUTSIDE_CAMERA = { x: 0, y: 1.6, z: 7.8, fov: 48 };
const INSIDE_CAMERA = { x: 0, y: 0, z: 0, fov: 86 };
const ROTATION_PERIOD_SECONDS = 140; // full revolution every 140s — slow, ambient drift
const ROT_SPEED = (Math.PI * 2) / ROTATION_PERIOD_SECONDS; // radians / second

export interface GlobeHandle {
  enter: () => void;
  exit: () => void;
}

/* ─── Globe component ───────────────────────────────────────── */
const Globe = forwardRef<GlobeHandle>(function Globe(_props, ref) {
  const mountRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [supported] = useState(() => {
    try {
      const canvas = document.createElement("canvas");
      return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
    } catch {
      return false;
    }
  });

  /* overwrite: "auto" kills any in-flight camera tween targeting the same
     properties, so rapid enter/exit clicks can't leave two tweens fighting */
  useImperativeHandle(ref, () => ({
    enter: () => {
      const camera = cameraRef.current;
      if (!camera) return;
      gsap.to(camera.position, {
        x: INSIDE_CAMERA.x,
        y: INSIDE_CAMERA.y,
        z: INSIDE_CAMERA.z,
        duration: 2.2,
        ease: "power3.inOut",
        overwrite: "auto",
      });
      gsap.to(camera, {
        fov: INSIDE_CAMERA.fov,
        duration: 2.2,
        ease: "power3.inOut",
        overwrite: "auto",
        onUpdate: () => camera.updateProjectionMatrix(),
      });
    },
    exit: () => {
      const camera = cameraRef.current;
      if (!camera) return;
      gsap.to(camera.position, {
        x: OUTSIDE_CAMERA.x,
        y: OUTSIDE_CAMERA.y,
        z: OUTSIDE_CAMERA.z,
        duration: 1.8,
        ease: "power3.inOut",
        overwrite: "auto",
      });
      gsap.to(camera, {
        fov: OUTSIDE_CAMERA.fov,
        duration: 1.8,
        ease: "power3.inOut",
        overwrite: "auto",
        onUpdate: () => camera.updateProjectionMatrix(),
      });
    },
  }));

  useEffect(() => {
    if (!supported) return;
    const el = mountRef.current;
    if (!el) return;

    const W = el.clientWidth;
    const H = el.clientHeight;

    /* Scene */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(OUTSIDE_CAMERA.fov, W / H, 0.01, 100);
    camera.position.set(OUTSIDE_CAMERA.x, OUTSIDE_CAMERA.y, OUTSIDE_CAMERA.z);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0, 0);
    el.appendChild(renderer.domElement);

    /* Globe group */
    const glob = new THREE.Group();
    scene.add(glob);

    /* Subtle wireframe lattice */
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x222222,
      wireframe: true,
      transparent: true,
      opacity: 0.045,
    });
    glob.add(new THREE.Mesh(new THREE.SphereGeometry(SPHERE_R, 30, 18), wireMat));

    /* Image cards */
    const loader = new THREE.TextureLoader();
    const pts = fibPoints(PORTFOLIO.length);

    PORTFOLIO.forEach((item, i) => {
      const pos = pts[i];
      const url = `https://images.unsplash.com/photo-${item.img}?w=420&h=280&fit=crop&auto=format`;

      const placeCard = (tex?: THREE.Texture) => {
        const mat = tex
          ? new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
          : new THREE.MeshBasicMaterial({
              color: new THREE.Color().setHSL((i / PORTFOLIO.length) * 0.85, 0.45, 0.62),
              side: THREE.DoubleSide,
            });

        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(CARD_W, CARD_H), mat);
        mesh.position.copy(pos);
        mesh.lookAt(pos.clone().multiplyScalar(2));
        mesh.rotateZ(TILT_OFFSETS[i % TILT_OFFSETS.length]);

        glob.add(mesh);
      };

      loader.load(
        url,
        (tex) => { tex.colorSpace = THREE.SRGBColorSpace; placeCard(tex); },
        undefined,
        () => placeCard(),
      );
    });

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* GSAP ticker for smooth, frame-rate-independent auto-rotation.
       NOTE: gsap.ticker's deltaTime callback argument is in MILLISECONDS, not seconds —
       dividing by 1000 here is what actually makes ROT_SPEED (rad/sec) correct. */
    let dragging = false;
    const autoRotate = (_: number, dt: number) => {
      if (!dragging && !prefersReducedMotion) glob.rotation.y += ROT_SPEED * (dt / 1000);
    };
    gsap.ticker.add(autoRotate);

    /* Globe entrance */
    if (!prefersReducedMotion) {
      gsap.from(glob.scale, { x: 0.72, y: 0.72, z: 0.72, duration: 1.6, ease: "power3.out", delay: 0.3 });
    }

    /* Render loop */
    let raf: number;
    const tick = () => { raf = requestAnimationFrame(tick); renderer.render(scene, camera); };
    tick();

    /* Pointer drag */
    let ox = 0, oy = 0;
    const onPD = (e: PointerEvent) => {
      dragging = true;
      ox = e.clientX; oy = e.clientY;
      renderer.domElement.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };

    const onPM = (e: PointerEvent) => {
      if (!dragging) return;
      glob.rotation.y += (e.clientX - ox) * 0.006;
      glob.rotation.x = Math.max(-0.65, Math.min(0.65, glob.rotation.x + (e.clientY - oy) * 0.003));
      ox = e.clientX; oy = e.clientY;
    };

    const onPU = () => {
      dragging = false;
      el.style.cursor = "grab";
      gsap.to(glob.rotation, { x: 0, duration: 1.2, ease: "power2.out" });
    };

    renderer.domElement.addEventListener("pointerdown", onPD);
    renderer.domElement.addEventListener("pointermove", onPM);
    renderer.domElement.addEventListener("pointerup", onPU);
    renderer.domElement.addEventListener("pointerleave", onPU);

    /* Resize */
    const onResize = () => {
      const nW = el.clientWidth, nH = el.clientHeight;
      renderer.setSize(nW, nH);
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      gsap.ticker.remove(autoRotate);
      renderer.domElement.removeEventListener("pointerdown", onPD);
      renderer.domElement.removeEventListener("pointermove", onPM);
      renderer.domElement.removeEventListener("pointerup", onPU);
      renderer.domElement.removeEventListener("pointerleave", onPU);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      cameraRef.current = null;
    };
  }, [supported]);

  if (!supported) {
    return (
      <div className="w-full h-[720px] flex items-center justify-center text-muted-foreground text-sm">
        3D preview isn't supported in this browser.
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="w-full h-[720px] select-none"
      style={{ cursor: "grab" }}
    />
  );
});
```

- [ ] **Step 2: Add the new React imports it needs**

Current top of file:
```tsx
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
```

Replace with:
```tsx
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import * as THREE from "three";
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: Exits 0.

- [ ] **Step 4: Manually verify the rotation speed in the browser**

Run: `npm run dev`, open the page, scroll to the globe, and watch it for ~10 seconds.
Expected: Visible, slow, ambient rotation (a full revolution takes well over a minute) — not a fast spin.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "fix: correct GSAP deltaTime unit bug causing 1000x-too-fast globe rotation; add reduced-motion and WebGL fallback; expose enter/exit ref API"
```

---

## Task 8: "Step inside the globe" button

**Files:**
- Modify: `src/app/App.tsx` (the `GlobeSection` function, currently lines 359–385)

**Interfaces:**
- Consumes: `GlobeHandle` and `Globe` from Task 7 (`ref.current.enter()`, `ref.current.exit()`).

**Context:** This is the camera fly-in interaction requested by the user, modeled on the referenced sphere-gallery site: clicking a button smoothly moves the camera from outside the globe to its exact center (`INSIDE_CAMERA`, set up in Task 7) with a widened field of view, so the viewer appears to be standing inside a slowly rotating sphere of floating cards. A second click (or Escape) reverses the animation.

- [ ] **Step 1: Replace the `GlobeSection` function (current lines 359–385)**

Current content:
```tsx
function GlobeSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".globe-label", {
        opacity: 0,
        y: 12,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 85%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="globe" ref={ref} className="relative -mt-2 overflow-hidden">
      <p className="globe-label text-center text-[0.68rem] font-semibold tracking-[0.3em] uppercase text-muted-foreground mb-1 pt-2">
        Drag to explore · {PORTFOLIO.length} projects worldwide
      </p>
      <Globe />
      {/* Fade-out gradient at bottom to suggest depth */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#fafaf8] to-transparent" />
    </section>
  );
}
```

Replace with:
```tsx
function GlobeSection() {
  const ref = useRef<HTMLElement>(null);
  const globeRef = useRef<GlobeHandle>(null);
  const [inside, setInside] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".globe-label", {
        opacity: 0,
        y: 12,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 85%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!inside) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        globeRef.current?.exit();
        setInside(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inside]);

  const toggleImmersive = () => {
    if (inside) {
      globeRef.current?.exit();
    } else {
      globeRef.current?.enter();
    }
    setInside((v) => !v);
  };

  return (
    <section id="globe" ref={ref} className="relative -mt-2 overflow-hidden">
      <p className="globe-label text-center text-[0.68rem] font-semibold tracking-[0.3em] uppercase text-muted-foreground mb-1 pt-2">
        {inside ? "Press Exit or Esc to return" : `Drag to explore · ${PORTFOLIO.length} projects worldwide`}
      </p>
      <div className="flex justify-center mt-4 mb-2">
        <button
          type="button"
          onClick={toggleImmersive}
          aria-pressed={inside}
          className="group inline-flex items-center gap-2.5 border border-foreground/20 px-7 py-3 text-[0.78rem] font-semibold tracking-widest uppercase hover:border-foreground/60 hover:bg-foreground hover:text-background transition-all duration-300"
        >
          {inside ? "Exit the globe" : "Step inside the globe"}
        </button>
      </div>
      <Globe ref={globeRef} />
      {/* Fade-out gradient at bottom to suggest depth */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#fafaf8] to-transparent" />
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: Exits 0 (confirms `GlobeHandle` and the `ref` prop on `Globe` line up with Task 7's `forwardRef` signature).

- [ ] **Step 3: Manually verify in the browser**

Run: `npm run dev`, scroll to the globe, click "Step inside the globe".
Expected: Camera smoothly flies to the center of the sphere over ~2 seconds, field of view widens, and you're now surrounded by the rotating cards. Click "Exit the globe" (or press Escape): camera flies back out to the original framing. Dragging still works in both states.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add step-inside-the-globe camera fly-in interaction"
```

---

## Task 9: Rewrite the Services section to match business_plan.md sections 5 and 6

**Files:**
- Modify: `src/app/App.tsx` (the `SERVICES` data, currently lines 40–47, and the `ServicesSection` function, currently lines 424–471)

**Interfaces:** None new — `ServicesSection` remains a self-contained function used by `App()`.

**Context:** The current `SERVICES` array ("AI Product Design", "Brand Identity", "UX Research", etc.) is generic agency filler unrelated to Nalar Labs. Per `business_plan.md`, section 5 ("Services") has two groups — **Consulting Service** (AI Strategy & Implementation Roadmap, Vibe-to-Production, Technical Cost Optimisation) and **End-to-End Implementation Service** (Internal Tool Building, External Product Development, Agentic Deployment) — and section 6 ("Our Approach") is a three-step process (Discovery & Scoping, Project Execution, Training & Handoff). Per the Global Constraints, none of the dollar rates are included.

- [ ] **Step 1: Replace the `SERVICES` data block (current lines 40–47)**

Current content:
```tsx
const SERVICES = [
  { icon: Layers, name: "AI Product Design", desc: "Craft intuitive AI-native experiences from zero to launch." },
  { icon: Code2, name: "Engineering & Dev", desc: "Full-stack AI systems designed to perform and scale." },
  { icon: Palette, name: "Brand Identity", desc: "Visual systems built to resonate in the AI era." },
  { icon: Microscope, name: "UX Research", desc: "Evidence-based design that puts real users first." },
  { icon: Cpu, name: "AI Integration", desc: "Embedding intelligence into your existing workflows." },
  { icon: FlaskConical, name: "Design Systems", desc: "Scalable, composable component architectures." },
];
```

Replace with:
```tsx
const SERVICE_GROUPS = [
  {
    label: "Consulting Service",
    blurb: "Advisory engagements to help you think clearly about your technology decisions before committing to a build.",
    items: [
      {
        icon: Compass,
        name: "AI Strategy & Implementation Roadmap",
        desc: "Plan where AI fits in your business, what to build, in what order, and how to measure success.",
      },
      {
        icon: Sparkles,
        name: "Vibe-to-Production",
        desc: "Turn vibecoded or prototype projects into clean, production-ready applications.",
      },
      {
        icon: Gauge,
        name: "Technical Cost Optimisation",
        desc: "Audit your current systems and recommend ways to reduce infrastructure, tooling, and operational costs.",
      },
    ],
  },
  {
    label: "End-to-End Implementation Service",
    blurb: "Hands-on build engagements where we design, develop, and deploy — from first line of code to live in production. We also train you to maintain your own systems once we're done.",
    items: [
      {
        icon: Layers,
        name: "Internal Tool Building",
        desc: "Migrate your team off paid SaaS subscriptions and replace them with custom in-house tools you own.",
      },
      {
        icon: Code2,
        name: "External Product Development",
        desc: "Build customer-facing products architected to scale to millions of users.",
      },
      {
        icon: Cpu,
        name: "Agentic Deployment",
        desc: "Design and deploy AI agents that automate workflows across your business.",
      },
    ],
  },
];

const APPROACH_STEPS = [
  {
    step: "01",
    title: "Discovery & Scoping",
    desc: "Three structured sessions before any paid work begins: an intro call for problem discovery and fit (free), a solution presentation with our recommended approach and rough scope (free), and a project planning session covering detailed scope, timeline, and contract (paid).",
  },
  {
    step: "02",
    title: "Project Execution",
    desc: "We build in focused sprints with regular check-ins. All deliverables are documented, versioned, and handed over — nothing lives only in our heads or on our machines. We use open tools wherever possible so you're never dependent on a proprietary stack we control.",
  },
  {
    step: "03",
    title: "Training & Handoff",
    desc: "Every engagement ends with a structured training phase. We document what was built, run hands-on sessions with your team, and create internal guides so your people can maintain and extend the work without us. An ongoing retainer is available if you'd like continued support.",
  },
];
```

- [ ] **Step 2: Update the `lucide-react` icon import**

Current content (line 5):
```tsx
import { ArrowRight, Menu, X, Layers, Code2, Palette, Cpu, FlaskConical, Microscope } from "lucide-react";
```

Replace with:
```tsx
import { ArrowRight, Menu, X, Layers, Code2, Cpu, Compass, Sparkles, Gauge, Share2 } from "lucide-react";
```

(`Palette`, `FlaskConical`, and `Microscope` are dropped — they were only used by the old `SERVICES` array. `Share2` is added here for Task 10's Refer-a-Client section, so this import only needs to change once.)

- [ ] **Step 3: Replace the `ServicesSection` function (current lines 424–471)**

Current content:
```tsx
function ServicesSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".svc-card", {
        opacity: 0,
        y: 30,
        duration: 0.72,
        ease: "power2.out",
        stagger: 0.08,
        scrollTrigger: { trigger: ref.current, start: "top 78%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="services" ref={ref} className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-18">
          <p className="text-[0.7rem] font-semibold tracking-[0.28em] uppercase text-muted-foreground mb-4">
            What we do
          </p>
          <h2 className="font-['Instrument_Serif',serif] text-[clamp(2rem,4vw,3.6rem)] leading-[1.1] max-w-lg">
            Services built for the intelligence age
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {SERVICES.map((s) => (
            <div
              key={s.name}
              className="svc-card group bg-[#fafaf8] p-9 hover:bg-white transition-colors duration-200"
            >
              <s.icon size={20} className="text-muted-foreground mb-7" strokeWidth={1.5} />
              <h3 className="font-['Instrument_Serif',serif] text-xl mb-3 text-foreground">{s.name}</h3>
              <p className="text-[0.83rem] text-muted-foreground leading-relaxed">{s.desc}</p>
              <div className="mt-7 flex items-center gap-2 text-[0.78rem] font-semibold tracking-wide opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all duration-200">
                Learn more <ArrowRight size={13} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Replace with:
```tsx
function ServicesSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".svc-card", {
        opacity: 0,
        y: 30,
        duration: 0.72,
        ease: "power2.out",
        stagger: 0.08,
        scrollTrigger: { trigger: ref.current, start: "top 78%" },
      });
      gsap.from(".approach-step", {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ".approach-steps", start: "top 82%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="services" ref={ref} className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-18">
          <p className="text-[0.7rem] font-semibold tracking-[0.28em] uppercase text-muted-foreground mb-4">
            What we do
          </p>
          <h2 className="font-['Instrument_Serif',serif] text-[clamp(2rem,4vw,3.6rem)] leading-[1.1] max-w-lg">
            Two ways to work with us
          </h2>
        </div>

        {SERVICE_GROUPS.map((group) => (
          <div key={group.label} className="mb-16 last:mb-0">
            <h3 className="font-['Instrument_Serif',serif] text-2xl mb-2 text-foreground">{group.label}</h3>
            <p className="text-[0.85rem] text-muted-foreground max-w-2xl mb-8 leading-relaxed">{group.blurb}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border">
              {group.items.map((s) => (
                <div
                  key={s.name}
                  className="svc-card group bg-[#fafaf8] p-9 hover:bg-white transition-colors duration-200"
                >
                  <s.icon size={20} className="text-muted-foreground mb-7" strokeWidth={1.5} />
                  <h4 className="font-['Instrument_Serif',serif] text-xl mb-3 text-foreground">{s.name}</h4>
                  <p className="text-[0.83rem] text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-24">
          <p className="text-[0.7rem] font-semibold tracking-[0.28em] uppercase text-muted-foreground mb-4">
            How we work
          </p>
          <h3 className="font-['Instrument_Serif',serif] text-[clamp(1.7rem,3vw,2.6rem)] leading-[1.15] max-w-lg mb-12">
            Our approach
          </h3>
          <div className="approach-steps grid grid-cols-1 md:grid-cols-3 gap-10">
            {APPROACH_STEPS.map((s) => (
              <div key={s.step} className="approach-step">
                <span className="font-['Instrument_Serif',serif] text-3xl text-muted-foreground/50">{s.step}</span>
                <h4 className="font-['Instrument_Serif',serif] text-xl mt-3 mb-2.5 text-foreground">{s.title}</h4>
                <p className="text-[0.83rem] text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: Exits 0.

- [ ] **Step 5: Manually verify in the browser**

Run: `npm run dev`, scroll to `#services`.
Expected: Two labeled groups ("Consulting Service", "End-to-End Implementation Service") each with 3 cards, no dollar figures anywhere, followed by a 3-step "Our approach" row (Discovery & Scoping / Project Execution / Training & Handoff).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: rewrite Services section to match business plan sections 5 and 6"
```

---

## Task 10: Add the "Refer a Client" section

**Files:**
- Modify: `src/app/App.tsx` (new `ReferSection` function; modify `Nav`'s `links` array, currently around line 241; modify `App()`, currently lines 580–593)

**Interfaces:**
- Produces: `ReferSection` function component, rendered by `App()` directly after `<ServicesSection />`.

**Context:** Business plan section 7 describes a referral commission (percentages omitted per the Global Constraints) paid on total project value when a referred lead signs. This section gives that program a visible home with a `mailto:` CTA — the site has no backend/form handling, so a `mailto:` link (matching the existing `ContactSection`'s pattern) is the right mechanism, not a new form.

- [ ] **Step 1: Add the `ReferSection` function directly after `ServicesSection`'s closing brace**

```tsx
/* ─── Refer a client ───────────────────────────────────────── */
function ReferSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".refer-item", {
        opacity: 0,
        y: 26,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ref.current, start: "top 80%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="refer" ref={ref} className="py-28 px-6 bg-[#f2f0eb]">
      <div className="max-w-4xl mx-auto text-center">
        <p className="refer-item inline-flex items-center gap-1.5 text-[0.7rem] font-semibold tracking-[0.28em] uppercase text-muted-foreground mb-5">
          <Share2 size={13} strokeWidth={2} />
          Refer a client
        </p>
        <h2 className="refer-item font-['Instrument_Serif',serif] text-[clamp(2rem,4vw,3.4rem)] leading-[1.12] max-w-2xl mx-auto mb-6">
          Know a business that needs a technical partner? Send them our way.
        </h2>
        <p className="refer-item text-[0.9rem] text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
          If you introduce us to a business and we go on to sign a project with them, you earn a commission on
          the total project value.
        </p>
        <a
          href="mailto:hello@nalarlabs.com?subject=Client%20referral"
          className="refer-item group inline-flex items-center gap-2.5 bg-foreground text-background px-9 py-4 text-[0.82rem] font-semibold tracking-widest uppercase hover:opacity-80 transition-opacity"
        >
          Refer a client
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add a nav link so the section is discoverable**

Current content (inside `Nav`):
```tsx
  const links = [
    { label: "Portfolio", href: "#globe" },
    { label: "Services", href: "#services" },
    { label: "Team", href: "#team" },
  ];
```

Replace with:
```tsx
  const links = [
    { label: "Portfolio", href: "#globe" },
    { label: "Services", href: "#services" },
    { label: "Refer a Client", href: "#refer" },
    { label: "Team", href: "#team" },
  ];
```

- [ ] **Step 3: Render the section in `App()`**

Current content:
```tsx
export default function App() {
  return (
    <main className="bg-[#fafaf8] min-h-screen overflow-x-hidden">
      <Nav />
      <HeroSection />
      <GlobeSection />
      <StatsBar />
      <ServicesSection />
      <TeamSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
```

Replace with:
```tsx
export default function App() {
  return (
    <main className="bg-[#fafaf8] min-h-screen overflow-x-hidden">
      <Nav />
      <HeroSection />
      <GlobeSection />
      <StatsBar />
      <ServicesSection />
      <ReferSection />
      <TeamSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: Exits 0.

- [ ] **Step 5: Manually verify in the browser**

Run: `npm run dev`.
Expected: "Refer a Client" appears in the nav pill and scrolls to a new section directly below Services; the section has a clear CTA button that opens a pre-addressed email; no percentages/rates appear anywhere in its copy.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Refer a Client section with mailto CTA"
```

---

## Task 11: Add the "Core Values" section below the Stats bar

**Files:**
- Modify: `src/app/App.tsx` (new `VALUES` data after the `APPROACH_STEPS` array from Task 9; new `ValuesSection` function directly after `StatsBar`'s closing brace; modify `App()` as it exists after Task 10)

**Interfaces:**
- Produces: `ValuesSection` function component, rendered by `App()` directly after `<StatsBar />`.

**Context:** Business plan section 4 ("Core Values & Differentiators") holds the most differentiated copy in the plan — the open-source default, the anti-lock-in stance ("our goal is a client who no longer needs us for the basics"), and the "we believe in your business" respect for the client's existing traction. None of it is on the site. This section puts all three beliefs directly below the Stats bar, in the site's editorial serif voice. Placement rationale: the stats bar makes claims; this section explains what the firm actually stands for, so they read as a pair. The Stats bar itself is not modified (per Global Constraints).

- [ ] **Step 1: Add the `VALUES` data array directly after the `APPROACH_STEPS` array (added in Task 9)**

```tsx
const VALUES = [
  {
    title: "Open source is awesome",
    desc: "SaaS tools rent you access to code you'll never own. Open-source alternatives are often better, always yours, and free forever. Our default is open source — and we'll show you what that unlocks.",
  },
  {
    title: "Vendor lock-in is evil",
    desc: "We don't write contracts designed to keep you dependent on us. We build your team's capability so you can handle the basics yourselves — freeing us to work on your tougher, more interesting challenges together.",
  },
  {
    title: "Your business is already working",
    desc: "If you're at a stage where you can invest in technology, you already have a working business. You don't need us to validate it. You need the right infrastructure to scale it — and that's exactly what we focus on.",
  },
];
```

- [ ] **Step 2: Add the `ValuesSection` function directly after `StatsBar`'s closing brace**

```tsx
/* ─── Core values ───────────────────────────────────────────── */
function ValuesSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".value-item", {
        opacity: 0,
        y: 30,
        duration: 0.85,
        ease: "power2.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ref.current, start: "top 78%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="values" ref={ref} className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <p className="text-[0.7rem] font-semibold tracking-[0.28em] uppercase text-muted-foreground mb-4">
            What we believe
          </p>
          <h2 className="font-['Instrument_Serif',serif] text-[clamp(2rem,4vw,3.6rem)] leading-[1.1] max-w-xl">
            Three beliefs behind every engagement
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
          {VALUES.map((v) => (
            <div key={v.title} className="value-item border-t border-foreground/15 pt-7">
              <h3 className="font-['Instrument_Serif',serif] italic text-2xl mb-3.5 text-foreground">
                {v.title}
              </h3>
              <p className="text-[0.85rem] text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Render the section in `App()` directly after `<StatsBar />`**

Current content (as it exists after Task 10):
```tsx
export default function App() {
  return (
    <main className="bg-[#fafaf8] min-h-screen overflow-x-hidden">
      <Nav />
      <HeroSection />
      <GlobeSection />
      <StatsBar />
      <ServicesSection />
      <ReferSection />
      <TeamSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
```

Replace with:
```tsx
export default function App() {
  return (
    <main className="bg-[#fafaf8] min-h-screen overflow-x-hidden">
      <Nav />
      <HeroSection />
      <GlobeSection />
      <StatsBar />
      <ValuesSection />
      <ServicesSection />
      <ReferSection />
      <TeamSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: Exits 0.

- [ ] **Step 5: Manually verify in the browser**

Run: `npm run dev`, scroll past the stats bar.
Expected: A "What we believe" section appears between the stats bar and Services, with three columns — "Open source is awesome", "Vendor lock-in is evil", "Your business is already working" — each with a thin top rule, italic serif heading, and muted body copy. Entrance animation staggers in on scroll, matching sibling sections.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Core Values section from business plan section 4"
```

---

## Task 12: Deployment documentation and config

**Files:**
- Create: `DEPLOYMENT.md`
- Create: `netlify.toml`
- Create: `vercel.json`

**Interfaces:** None.

- [ ] **Step 1: Create `netlify.toml`**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

- [ ] **Step 2: Create `vercel.json`**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

- [ ] **Step 3: Create `DEPLOYMENT.md`**

```md
# Deployment

`npm run build` produces a fully static `dist/` folder (HTML, JS, CSS — no server-side code, no client-side router). It can be hosted anywhere that serves static files.

## Comparison

| Platform | Setup effort | Free tier | Custom domain + HTTPS | Notes |
|---|---|---|---|---|
| **Netlify** (recommended) | Lowest — reads `netlify.toml` | Yes | Yes, automatic | Git-connected deploys on every push, generous free tier, easiest setup |
| **Vercel** | Lowest — auto-detects Vite via `vercel.json` | Yes | Yes, automatic | Git-connected deploys on every push, preview URL per PR |
| **Cloudflare Pages** | Low — dashboard only | Yes, unlimited bandwidth | Yes, automatic | Fastest edge network |
| **GitHub Pages** | Medium — needs a `base` path change in `vite.config.ts` | Yes | Yes (via CNAME) | Only worth it to avoid a third-party host |
| **Static host (S3+CloudFront, Nginx, etc.)** | Highest | Depends | Manual | Full control, most ops overhead |

## Option A — Netlify (recommended)

1. Ensure the repo is pushed to https://github.com/Nalar-Labs/landing.
2. Go to app.netlify.com → Add new site → Import an existing project.
3. Select the `Nalar-Labs/landing` repo.
4. Netlify reads `netlify.toml` automatically. Click Deploy.
5. Add a custom domain under Site settings → Domain management once live.

CLI alternative: `npx netlify-cli login`, then `npx netlify-cli deploy --prod`.

## Option B — Vercel

1. Ensure the repo is pushed to https://github.com/Nalar-Labs/landing.
2. Go to vercel.com → New Project → import the repo.
3. Select the `Nalar-Labs/landing` repo.
4. Vercel reads `vercel.json` (build command `npm run build`, output `dist`) automatically. Click Deploy.
5. Add a custom domain under Project → Settings → Domains once live.

CLI alternative: `npx vercel login`, then `npx vercel --prod` from the project root.

## Option C — Cloudflare Pages

1. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.
2. Select the `Nalar-Labs/landing` repo from GitHub. Build command: `npm run build`. Output directory: `dist`.
3. Deploy.

## Option D — GitHub Pages

GitHub Pages could serve from `https://nalar-labs.github.io/landing/` unless you attach a custom domain. Custom domain setup requires adding a CNAME file to the repo. Only worth it if you specifically want to avoid a third-party host — Netlify/Vercel/Cloudflare are simpler and faster for this project.

## Option E — Any static file host (S3 + CloudFront, Nginx, etc.)

1. Run `npm run build`.
2. Upload the contents of `dist/` to your bucket/server.
3. Point the web server's document root at that folder. No server-side routing rules are needed — this is a single-page site with only anchor-link navigation, no client-side router.
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "docs: add deployment guide and Netlify/Vercel config"
```

---

## Task 13: Final QA pass

**Files:** None — verification only.

**Interfaces:** None.

- [ ] **Step 1: Clean install and build**

```bash
rm -rf node_modules dist
npm install
npm run build
```

Expected: Both exit 0.

- [ ] **Step 2: Preview the production build**

Run: `npm run preview`, open the printed URL.
Expected: Site loads with no console errors.

- [ ] **Step 3: Manual walkthrough checklist**

Using the running preview (or dev server), confirm each of the following:

- [ ] Browser tab shows "Nalar Labs — AI Implementation Consulting" and the dark "N" favicon.
- [ ] Globe rotates slowly and ambiently (full revolution takes well over a minute) when untouched.
- [ ] Dragging the globe still rotates it manually and releases smoothly.
- [ ] "Step inside the globe" button flies the camera to the center of the sphere with a widened field of view; "Exit the globe" (and Escape) flies it back out.
- [ ] Core Values section appears directly below the stats bar with three beliefs ("Open source is awesome", "Vendor lock-in is evil", "Your business is already working").
- [ ] Services section shows exactly two groups — "Consulting Service" and "End-to-End Implementation Service" — each with 3 items, followed by a 3-step "Our approach" row. No dollar amounts or hourly rates appear anywhere.
- [ ] "Refer a Client" section appears directly below Services, has a working `mailto:` CTA button, and mentions no percentages.
- [ ] Nav pill includes a working "Refer a Client" link that scrolls to the new section.
- [ ] Resize the browser to mobile width (or use device emulation): nav collapses to the hamburger menu, all sections remain readable, globe canvas resizes without distortion.
- [ ] No errors or warnings in the browser console during the whole walkthrough.

- [ ] **Step 4: Final commit (only if Step 3 required fixes)**

```bash
git add -A
git commit -m "fix: address issues found in final QA pass"
```

- [ ] **Step 5: Push to GitHub**

```bash
git push -u origin main
```

Expected: All commits land on https://github.com/Nalar-Labs/landing. (If the remote already has commits from the GitHub UI, run `git pull --rebase origin main` first, re-run `npm run build` to confirm nothing broke, then push.) The repo is now ready to connect to Netlify per `DEPLOYMENT.md` Option A.
