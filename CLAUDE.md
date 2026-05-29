# SEVAKA HRIS — Claude Code Guide

## Project
HRIS (Human Resource Information System) untuk Sevaka, dibangun dengan React 19 + TypeScript + Vite.

## Tech Stack
- **React 19** + **TypeScript** (tsconfig references: tsconfig.app.json + tsconfig.node.json)
- **Vite 8** + `@tailwindcss/vite` plugin
- **Tailwind CSS v4** — gunakan `@import "tailwindcss"` di CSS, bukan `@tailwind base/components/utilities`
- **ShadCN UI** — komponen di `src/components/ui/`, config di `components.json`
- **React Query** (`@tanstack/react-query`) — data fetching & server state
- **Formik + Yup** — form management & validasi
- **Zustand** — client state management
- **lucide-react** — icons untuk komponen baru (ShadCN); komponen lama pakai Lucide CDN via `data-lucide`

## Path Aliases
- `@/` → `src/`
- Contoh: `import { cn } from "@/lib/utils"`

## Struktur Penting
```
src/
  components/
    ui/           ← ShadCN components (generate via npx shadcn@latest add <komponen>)
    screens/
      Dashboard.jsx     ← legacy .jsx
      Employee.jsx      ← legacy .jsx
      Profile.jsx       ← legacy .jsx
      TimeManagement.jsx← legacy .jsx
      SignIn.jsx        ← legacy .jsx
      Inbox.tsx         ← TypeScript, 3-pane inbox
    Topnav.tsx    ← TypeScript, data-driven (PRODUCTS + NOTIFS arrays)
    Sidebar.tsx   ← TypeScript, accordion + expand/collapse
  css/
    tokens.css    ← SEVAKA design tokens (colors, spacing, shadows, typography)
    app.css       ← topnav, sidebar, buttons, cards, chips, tables, auth
    dashboard.css ← dashboard hero, stat cards, sidebar expanded styles
    inbox.css     ← 3-pane inbox layout
    notifications.css ← notif bell popup styles
  lib/
    utils.ts      ← cn() helper dari clsx + tailwind-merge
  hooks/          ← custom React hooks
  index.css       ← Tailwind v4 entry + ShadCN CSS variables
  main.tsx        ← entry point
```

## Konvensi
- File TypeScript: `.tsx` untuk komponen, `.ts` untuk utilities/hooks
- Screen components masih `.jsx` — migrasi ke `.tsx` secara bertahap
- Shell components (Topnav, Sidebar) sudah `.tsx`
- Icons: pakai Lucide CDN (`data-lucide` + `window.lucide.createIcons()`) di semua komponen yang ada
- Gunakan `cn()` dari `@/lib/utils` untuk conditional classnames
- ShadCN components: tambah dengan `npx shadcn@latest add <nama>`

## Catatan Node.js
Node.js **v22.x LTS** diperlukan (Vite 8 butuh >= v20.19 atau >= v22.12).
Gunakan fnm: `FNM_DIR="/c/Users/Theodorus/AppData/Roaming/fnm" fnm use 22`
