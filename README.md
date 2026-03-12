# RDream Admin Panel

A full-stack admin panel built with **React + Vite** (frontend) and **Express.js** (backend API).

## Tech Stack

- **Frontend:** React 19, Vite 6, React Router DOM v7, Redux Toolkit, TanStack Query, Tailwind/SCSS
- **Backend:** Express.js (handles FCM push notifications and cron jobs)
- **Language:** TypeScript + JavaScript (ES Modules)

## Getting Started

### Install dependencies

```bash
npm install
```

### Development

Starts both the Vite dev server (port 3003) and the Express API server (port 3004) concurrently:

```bash
npm run dev
```

Open [http://localhost:3003](http://localhost:3003) in your browser.

### Production Build

```bash
npm run build   # TypeScript check + Vite build → dist/
npm start       # Express server serves SPA + API on port 3004
```

## Project Structure

```
app/              # Page-level React components (lazy-loaded by React Router)
components/       # Shared UI components
context/          # React context providers (CountryContext, SearchContext)
store/            # Redux store, slices, TanStack Query client
src/              # Entry point (main.tsx, App.tsx with all routes)
server.js         # Express backend (FCM notifications, close-reminder cron)
public/           # Static assets
uploads/          # Uploaded images (runtime)
```

## Environment Variables

Create a `.env` file in the project root:

```env
# Vite frontend (prefix with VITE_ to expose to browser)
VITE_API_URL=https://game.rrdream.in
VITE_API_BASE_URL=https://game.rrdream.in/api/

# Express backend
SERVER_PORT=3004
FIREBASE_SERVICE_ACCOUNT_FILENAME=rrdream-4d72e-firebase-adminsdk-fbsvc-879335a36d.json
FIREBASE_SERVICE_ACCOUNT_PATH=   # optional override for absolute path
FCM_BROADCAST_TOPIC=all-users
FCM_ANDROID_PACKAGE_NAME=com.rr.dream
FCM_REMINDER_CRON_SECRET=        # bearer token for /api/notifications/close-reminders
FCM_REMINDER_API_BEARER_TOKEN=   # bearer token for game API calls
FCM_REMINDER_MINUTES=5
FCM_REMINDER_WINDOW_SECONDS=75
FCM_REMINDER_TIMEZONE_OFFSET_MINUTES=330
```

## Branch Strategy

| Branch | Contents | Status |
|--------|----------|--------|
| `migrate-to-react-vite` | React + Vite codebase | ✅ Active — **target for the React app** |
| `main` | Was Next.js; will become React+Vite after PR #3 merges | ⏳ Pending merge |
| `copilot/delete-other-branches` | PR branch — complete migration of all pages from `main` to React+Vite | 🔀 Open PR → `main` |

### What is PR #3?

PR #3 (`copilot/delete-other-branches` → `main`) contains the **complete, final React+Vite migration**:
- All 27 admin pages updated with the latest business logic (server-side pagination, debounced search)
- `Header.tsx` rebuilt with a working Logout button
- Store improvements: cache settings, 429 error handling, pagination params
- All Next.js artefacts removed (`next.config.ts`, `app/layout.tsx`, `app/api/`)

### ⚠️ Where is the latest complete code right now?

The **complete migration** lives on `copilot/delete-other-branches` (= the PR branch).

`migrate-to-react-vite` is **32 files behind** — it is missing the page updates migrated from `main`.

### What to do

**Option A — Merge PR #3 into `main` (recommended)**
```
main ← copilot/delete-other-branches   (PR #3)
```
After merging, `main` permanently holds the complete React+Vite app.
Then bring `migrate-to-react-vite` up to date:
```bash
git checkout migrate-to-react-vite
git merge main --ff-only   # or: git reset --hard main
git push origin migrate-to-react-vite
```

**Option B — Do NOT close the PR without merging**
If you close PR #3 without merging, the 32 updated files only exist on the temporary
`copilot/delete-other-branches` branch. Deleting that branch would permanently lose the work.

## API Routes (Express)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/notifications/send` | Send FCM push notification (supports multipart image upload) |
| GET/POST | `/api/notifications/close-reminders` | Cron endpoint — sends reminders for games closing soon |
