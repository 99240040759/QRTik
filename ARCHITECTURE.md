# QRTik — Architecture & Codebase Reference

This is your personal reference for every file, function, and design decision in the project. Use this to answer any reviewer question confidently.

---

## Folder Structure Explained

```
Mern_Project/
├── src/                          (React frontend — all client code)
│   ├── main.jsx                  (Entry point — mounts React to #root)
│   ├── App.jsx                   (Root component — auth state, routing)
│   ├── config.js                 (API base URL — reads from env or defaults)
│   ├── index.css                 (Global CSS — Tailwind import, custom theme, animations)
│   ├── hooks/
│   │   └── useApi.js             (Custom hook — wraps fetch with auth headers)
│   ├── components/
│   │   ├── AuthPanel.jsx         (Login + Register form)
│   │   ├── Dashboard.jsx         (Tab orchestrator — holds shared state)
│   │   ├── ProfileDropdown.jsx   (User avatar + sign out menu)
│   │   ├── ScannerCard.jsx       (QR scanner — organizer-only with event picker)
│   │   ├── layout/
│   │   │   ├── Header.jsx        (App header — logo + profile)
│   │   │   └── BottomNav.jsx     (Tab bar — 5 navigation tabs)
│   │   └── tabs/
│   │       ├── ExploreTab.jsx    (Browse events as cards + register)
│   │       ├── TicketsTab.jsx    (User's tickets with expandable QR)
│   │       ├── CreateEventTab.jsx(Create event form)
│   │       └── ManageEventsTab.jsx(Edit/delete/complete events)
│
├── server/                       (Express backend)
│   ├── index.js                  (Server entry — cors, json, routes, DB connect)
│   ├── config/
│   │   └── db.js                 (MongoDB connection — single function)
│   ├── models/                   (Mongoose schemas)
│   │   ├── User.js               (name, email, passwordHash)
│   │   ├── Event.js              (title, date, capacity, location, status)
│   │   └── Ticket.js             (eventId, attendeeId, isScanned, scannedAt)
│   ├── controllers/              (Business logic)
│   │   ├── authController.js     (register + login)
│   │   ├── eventsController.js   (CRUD + complete)
│   │   └── ticketsController.js  (register + scan + getMyTickets)
│   ├── middleware/
│   │   └── auth.js               (JWT verification + role check)
│   └── routes/                   (Route definitions)
│       ├── auth.js
│       ├── events.js
│       └── tickets.js
│
├── public/                       (Static assets — favicon, icons)
├── .env                          (MongoDB URI, JWT secret, port)
├── package.json
├── vite.config.js
├── REVIEW.md                     (For reviewers)
└── ARCHITECTURE.md               (This file — for you)
```

---

## File-by-File Breakdown

### Frontend

#### `main.jsx`
**What:** React entry point. Renders `<App>` inside `<StrictMode>`.
**Why StrictMode:** Catches common bugs during development (double-renders effects to find leaks).

#### `App.jsx`
**What:** Root component. Manages authentication state (`user`, `token`).
**Key logic:**
- On mount: reads `pulseEntryAuth` from localStorage to persist login across refreshes
- If `user` exists → shows `Dashboard`, otherwise → shows `AuthPanel`
- `handleLogout()` clears state + localStorage

**Why localStorage key is "pulseEntryAuth":** Project was originally named PulseEntry. It works fine — the key name is arbitrary.

#### `config.js`
**What:** One line: `export const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5001'`
**Why separate file:** centralizes the API URL so every component imports from one place. In production, set `VITE_API_BASE` env var.

#### `index.css`
**What:** Global styles.
**Key parts:**
- `@import "tailwindcss"` — activates Tailwind v4
- `@theme {}` — custom design tokens (colors, fonts, animations)
- `@keyframes fadeIn` — slide-up fade animation used on page load
- `@keyframes pulseSlow` — breathing animation for scanner status dot
- `-webkit-tap-highlight-color: transparent` — removes blue tap highlight on mobile
- `.hide-scrollbar` — hides scrollbar on bottom nav while keeping scroll functional

#### `hooks/useApi.js`
**What:** Custom React hook wrapping `fetch()`.
**Why a hook:** Eliminates repeating auth headers and loading/error state in every component.
**How it works:**
1. Takes `token` as parameter
2. Returns `{ request, loading, error }`
3. `request(path, options)` → adds `Content-Type` + `Authorization` headers → calls fetch → parses JSON → handles errors
4. Sets `loading = true` during request, catches errors into `error` state

#### `components/AuthPanel.jsx`
**What:** Login and register form with toggle between modes.
**Key decisions:**
- Single form handles both modes — toggles UI based on `mode` state
- Auth request is deduplicated: builds endpoint + body based on mode, single fetch call
- On success: saves to both React state AND localStorage (for persistence)
- Shows minimal "Signed In" card if user already exists (edge case from prop drilling)

#### `components/Dashboard.jsx`
**What:** Tab orchestrator — the main logged-in view.
**Why this pattern:** Holds ALL shared state (events, tickets) and API functions. Child tabs receive only what they need via props. This prevents multiple components from making the same API calls.
**Key functions:**
- `loadData()` — fetches events + user tickets in parallel (`Promise.all`)
- `handleRegister(eventId)` — registers for event, reloads data
- `handleCreateEvent(data)` — creates event, switches to Manage tab
- `handleDeleteEvent(id)` — confirmation dialog, then DELETE request
- `handleUpdateEvent(id, data)` — PUT request to update event fields
- `handleCompleteEvent(id)` — PATCH request to mark event as completed
- `myCreatedEvents` — derived state: filters events where organizerId matches current user

#### `components/ProfileDropdown.jsx`
**What:** Avatar button that opens a dropdown with user info + sign out.
**Key pattern:** Uses `useRef` + `useEffect` to detect clicks outside the dropdown and close it. This is a standard React pattern for dismissible popovers.

#### `components/ScannerCard.jsx`
**What:** QR code scanner with 3 views.
**View 1 — Non-organizer:** Info card with 3-step guide encouraging users to create events. Shows when `myCreatedEvents` has no active events.
**View 2 — Event picker:** List of organizer's active events as tappable cards. Each card has a scan icon.
**View 3 — Active scanner:** Camera feed with status indicator (idle → checking → valid/invalid). Has back button to return to event picker.
**Why event-specific:** Organizers may host multiple events simultaneously. Selecting an event first gives context to the scanning.
**Key detail:** Scanner effect re-runs when `selectedEvent` changes (cleanup destroys previous scanner instance).

#### `components/layout/Header.jsx`
**What:** Sticky header with app logo + profile dropdown.
**Why extracted:** Keeps `App.jsx` clean. Header is a visual shell component with no logic.

#### `components/layout/BottomNav.jsx`
**What:** Fixed bottom tab bar with 5 tabs.
**Key pattern:** Tab config is a data array — each tab has `id`, `label`, and `icon` function. This is cleaner than 5 separate button blocks and easier to add/remove tabs.
**Mobile details:**
- `pb-[max(0.5rem,env(safe-area-inset-bottom))]` — respects iPhone notch/home indicator
- `overflow-x-auto` + `hide-scrollbar` — scrollable on very narrow screens
- Active tab gets slightly thicker icon stroke (`2.5` vs `2`)

#### `components/tabs/ExploreTab.jsx`
**What:** Event discovery page showing events as cards.
**Key features:**
- Filters out completed events — only shows active ones
- Each card shows: title, date, time, location, capacity, upcoming/started badge
- Individual "Get Ticket" button per card with per-card loading state
- After registration: shows QR ticket with back button to return to event list
**Why cards instead of dropdown:** Cards show more info at a glance, feel more engaging, and are more natural on mobile.

#### `components/tabs/TicketsTab.jsx`
**What:** List of user's registered tickets.
**Key interaction:** Tapping a ticket expands/collapses the QR code with smooth height animation (`max-h` transition). Only one QR shown at a time.
**Status badges:** "Active" (gray) or "Scanned" (green) based on `ticket.isScanned`.

#### `components/tabs/CreateEventTab.jsx`
**What:** Form to create a new event.
**Fields:** title, datetime-local, capacity (number), location.
**After creation:** Dashboard automatically switches to Manage tab so organizer sees their new event.

#### `components/tabs/ManageEventsTab.jsx`
**What:** Organizer's event management with two sections.
**Active events section:**
- Shows event details + action buttons (edit, complete, delete)
- Edit mode: inline form with back button (replaces the event card)
- Complete button (checkmark icon): marks event as completed after confirmation
**Completed events section:**
- Dimmed appearance, strikethrough title
- No edit/delete actions — completed events are archived
**Why separate sections:** Visual hierarchy makes it clear which events are still live vs. finished.

---

### Backend

#### `server/index.js`
**What:** Express app setup.
**Order matters:**
1. `dotenv.config()` — loads `.env` before anything uses `process.env`
2. `cors()` — allows frontend (different port) to call API
3. `express.json()` — parses JSON request bodies
4. Route mounting — `/api/auth`, `/api/events`, `/api/tickets`
5. `connectDb()` → `app.listen()` — only starts server after DB connects

#### `config/db.js`
**What:** Single function connecting to MongoDB.
`serverSelectionTimeoutMS: 30000` — gives 30 seconds for initial connection (prevents instant failure on slow networks).

#### `models/User.js`
- `passwordHash` not `password` — never stores plaintext
- `unique: true` on email — MongoDB creates a unique index, prevents duplicate accounts
- `timestamps: true` — auto-generates `createdAt` and `updatedAt`

#### `models/Event.js`
- `organizerId` references User — establishes ownership
- `status` has enum validation: only "active" or "completed" allowed
- `default: 'active'` — new events are active by default

#### `models/Ticket.js`
- `eventId` + `attendeeId` — links a ticket to both an event and a user
- `isScanned` — boolean flag for one-time entry verification
- `scannedAt` — timestamp of when the ticket was scanned (null until scanned)

#### `middleware/auth.js`
**`authRequired`:**
1. Extracts token from `Authorization: Bearer <token>` header
2. Verifies JWT signature and expiry
3. Finds user in DB by the `sub` claim
4. Attaches `req.user = { id, role }` for downstream controllers
5. Returns 401 if any step fails

**`requireRole(role)`:** Factory function returning middleware. Checks `req.user.role` — currently unused but available for future role-based access.

#### `controllers/authController.js`
**`createToken(user)`:** Helper function signing a JWT with `sub: user._id` and 2-hour expiry.
**`register`:** Validates fields → checks email uniqueness → hashes password → creates user → returns JWT.
**`login`:** Validates fields → finds by email → compares hash → returns JWT.
**Why separate createToken:** DRY pattern — both register and login need to mint tokens.

#### `controllers/eventsController.js`
**`getEvents`:** Returns all events sorted by date ascending.
**`createEvent`:** Uses `req.user.id` from auth middleware as organizerId (not from request body — prevents spoofing).
**`getEventSummary`:** Returns event + sold ticket count for analytics.
**`deleteEvent`:** Ownership check → deletes event AND all its tickets (cascade).
**`updateEvent`:** Ownership check → partial update (only updates provided fields via `||` fallback).
**`completeEvent`:** Ownership check → sets status to "completed". Idempotent check prevents double-completion.

#### `controllers/ticketsController.js`
**`registerTicket`:**
1. Validates event exists and is active
2. Checks user exists
3. **Duplicate check:** Prevents same user registering twice for same event
4. **Capacity check:** Counts existing tickets vs. event capacity
5. Creates ticket → signs a ticket JWT (contains ticketId + eventId)
6. Returns ticket document + QR token

**`scanTicket`:**
1. Decodes the QR token (ticket JWT)
2. Finds the ticket → finds the event
3. **Completed check:** Rejects if event is completed
4. **Replay check:** Rejects if ticket already scanned
5. Marks as scanned with timestamp

**`getMyTickets`:** Finds all tickets for the current user, enriches each with event details + re-signs a QR token. This is why tickets can be viewed anytime with fresh QR codes.

#### `routes/auth.js`, `events.js`, `tickets.js`
**Route files are intentionally thin** — they only map HTTP methods + paths to controllers and middleware. All logic lives in controllers. This is the standard Express MVC pattern.

**Protected routes** use `authRequired` middleware: POST /events, PUT/DELETE/PATCH /events/:id, POST /tickets/register, GET /tickets/my.
**Public routes:** GET /events (anyone can browse), POST /tickets/scan (scanner doesn't need user auth — it validates the ticket JWT itself).

---

## Design Decisions Quick Reference

| Decision | Reasoning |
|---|---|
| No routing library | Single-page tab app, no URL-based navigation needed |
| Tab state in Dashboard | Centralized data fetching, prevents duplicate API calls |
| JWT for ticket QR codes | Self-contained verification — scanner doesn't need auth, just JWT secret |
| Mobile-first CSS | Target audience uses phones at events, desktop is secondary |
| Organizer-only scanner | Attendees have no reason to scan; reduces confusion |
| Event completion (not deletion) | Preserves ticket history, prevents data loss, enables "past events" view |
| localStorage for auth | Simple persistence — no cookies/sessions needed for SPA |
| Inline edit forms | No separate page/modal — keeps user in context, fewer navigation steps |
| Custom `useApi` hook | Single source for API calls — consistent error handling and auth headers |
| Tailwind utility classes | Co-located styles — no separate CSS files to maintain per component |
