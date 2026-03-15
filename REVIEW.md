# QRTik — Project Review Document

## 1. Project Overview

**QRTik** is a full-stack event ticketing and QR-code entry verification system. It solves the problem of manual entry management at events by digitizing the entire flow — from event creation to ticket issuance to door-side scanning.

**Core Problem:** Event organizers need a lightweight way to issue verifiable tickets and validate them at the door without paper tickets, manual lists, or expensive third-party services.

**Solution:** A mobile-first web app where organizers create events, attendees register and receive QR-code tickets, and organizers scan those QR codes at the venue entrance for instant verification.

---

## 2. Tech Stack & Library Justification

| Technology | Purpose | Why This Choice |
|---|---|---|
| **React 19** | Frontend UI | Component-based architecture, huge ecosystem, declarative rendering |
| **Vite** | Build tool | Near-instant HMR, fast cold starts (10-100x faster than Webpack), native ESM |
| **Tailwind CSS v4** | Styling | Utility-first approach eliminates context switching, mobile-first by default, no unused CSS in production |
| **Express.js** | Backend framework | Minimal, unopinionated, mature middleware ecosystem, easy to explain and debug |
| **MongoDB + Mongoose** | Database + ODM | Schema flexibility for evolving event data, Mongoose provides validation and type safety on top of MongoDB |
| **JWT (jsonwebtoken)** | Authentication | Stateless authentication — no session storage needed on server, tokens carry their own payload |
| **bcryptjs** | Password hashing | Industry-standard adaptive hashing, resistant to brute-force, pure JS (no native compilation needed) |
| **qrcode.react** | QR generation | React component for rendering QR codes as SVG — clean, scalable, no canvas dependency |
| **html5-qrcode** | QR scanning | Uses device camera for real-time QR scanning, works on mobile browsers without native app |

**Why NOT other choices:**
- **No React Router:** The app is a single-page dashboard with tab navigation — routing would add unnecessary complexity for this scope
- **No Redux/Zustand:** State is localized to components and lifted only where needed. A global store would be over-engineering for this data flow
- **No TypeScript:** Kept vanilla JS for review simplicity — the codebase is small enough that types add friction without proportional benefit
- **No Socket.io:** Real-time updates aren't needed — ticket scanning is a request-response flow

---

## 3. Application Flow

### 3.1 Authentication Flow
```
User opens app → Sees login/register form
  → Register: name + email + password → POST /api/auth/register
      → Server hashes password (bcrypt, 10 rounds)
      → Creates User document in MongoDB
      → Signs JWT with user ID (2-hour expiry)
      → Returns { user, token }
  → Login: email + password → POST /api/auth/login
      → Finds user by email
      → Compares password hash
      → Signs and returns JWT
  → Frontend stores token + user in localStorage
  → All subsequent API calls include: Authorization: Bearer <token>
```

### 3.2 Event Creation Flow (Organizer)
```
Organizer navigates to Create tab
  → Fills title, date/time, capacity, location
  → POST /api/events (with JWT)
      → Middleware verifies JWT, attaches user ID
      → Creates Event document (status: "active")
  → Redirected to Manage tab to see their event
```

### 3.3 Ticket Registration Flow (Attendee)
```
Attendee browses Explore tab → Sees event cards (active only)
  → Clicks "Get Ticket" on an event
  → POST /api/tickets/register (with JWT)
      → Server checks: event exists, not completed, not sold out, not already registered
      → Creates Ticket document
      → Signs a ticket JWT containing { ticketId, eventId }
      → Returns ticket + token
  → Frontend displays QR code (the ticket JWT encoded as QR)
  → Attendee can view their ticket anytime in Tickets tab
```

### 3.4 Ticket Scanning Flow (Organizer at Door)
```
Organizer opens Scan tab → Sees their active events
  → Selects an event → Camera activates
  → Scans attendee's QR code
  → POST /api/tickets/scan
      → Decodes the ticket JWT
      → Finds ticket, checks event not completed
      → Checks if already scanned (prevents re-entry)
      → Marks ticket.isScanned = true, records scannedAt timestamp
      → Returns success/failure status
  → Scanner shows green (valid) / red (invalid/already scanned) feedback
```

### 3.5 Event Completion Flow
```
Organizer goes to Manage tab → Clicks checkmark icon on an event
  → PATCH /api/events/:id/complete (with JWT)
      → Verifies organizer ownership
      → Sets event.status = "completed"
  → Event moves to "Completed" section (dimmed, no edit/delete)
  → Event disappears from: Explore tab, Scanner picker
  → Scanning/registration blocked server-side for this event
```

---

## 4. Security Measures

| Measure | Implementation |
|---|---|
| Password hashing | bcrypt with 10 salt rounds — passwords never stored in plaintext |
| JWT authentication | 2-hour expiry, server validates on every protected route |
| Authorization checks | Organizers can only edit/delete/complete their own events |
| Duplicate prevention | Server prevents registering twice for the same event |
| Scan replay prevention | Tickets can only be scanned once (isScanned flag) |
| Input validation | All required fields validated server-side before database operations |
| Completed event blocking | Both scan and register endpoints reject requests for completed events |

---

## 5. Database Schema

### User
| Field | Type | Notes |
|---|---|---|
| name | String | Required |
| email | String | Required, unique |
| passwordHash | String | bcrypt hash |
| timestamps | Auto | createdAt, updatedAt |

### Event
| Field | Type | Notes |
|---|---|---|
| organizerId | ObjectId → User | Who created it |
| title | String | Required |
| date | Date | Event date/time |
| capacity | Number | Max attendees |
| location | String | Venue |
| status | String | "active" or "completed" |
| timestamps | Auto | createdAt, updatedAt |

### Ticket
| Field | Type | Notes |
|---|---|---|
| eventId | ObjectId → Event | Which event |
| attendeeId | ObjectId → User | Who registered |
| isScanned | Boolean | Entry verification flag |
| scannedAt | Date | When scanned (null if not scanned) |
| timestamps | Auto | createdAt, updatedAt |

---

## 6. API Endpoints

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/register | No | Create account |
| POST | /api/auth/login | No | Sign in |
| GET | /api/events | No | List all events |
| POST | /api/events | Yes | Create event |
| PUT | /api/events/:id | Yes | Update event (owner only) |
| DELETE | /api/events/:id | Yes | Delete event + its tickets |
| PATCH | /api/events/:id/complete | Yes | Mark event completed |
| GET | /api/events/:id/summary | No | Event details + ticket count |
| POST | /api/tickets/register | Yes | Register for event |
| POST | /api/tickets/scan | No | Validate and scan ticket QR |
| GET | /api/tickets/my | Yes | Get user's tickets |

---

## 7. Mobile-First Design Decisions

- **Bottom navigation:** Fixed tab bar with safe-area-inset for notched phones
- **Touch targets:** All buttons are minimum 44px height for thumb-friendly interaction
- **Active feedback:** `active:scale-[0.98]` and `active:translate-y-0.5` for tactile press feedback
- **Responsive breakpoints:** Mobile-first design, `sm:` breakpoints enhance for desktop
- **Safe viewport:** `100svh` for proper mobile viewport, `overscroll-behavior: none` to prevent pull-to-refresh interference
- **Backdrop blur:** Frosted glass header and bottom nav for modern mobile feel
- **Horizontal scroll:** Bottom nav scrolls horizontally on very small screens with hidden scrollbar
