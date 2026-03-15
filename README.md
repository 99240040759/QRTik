# QRTik — Event Ticketing & QR Entry System

A full-stack web application for event management with QR-code based entry. Organizers create events; attendees register and receive QR tickets scanned at entry.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 19, Vite, Tailwind CSS v4     |
| Backend   | Express.js, Node.js                 |
| Database  | MongoDB Atlas (Mongoose ODM)        |
| Auth      | JWT (bcryptjs for password hashing) |
| QR System | qrcode.react + html5-qrcode        |

## Project Structure

```
├── src/                          # React frontend
│   ├── components/
│   │   ├── layout/               # App shell (Header, BottomNav)
│   │   ├── tabs/                 # Dashboard tab panels
│   │   │   ├── ExploreTab.jsx    # Browse & register for events
│   │   │   ├── TicketsTab.jsx    # View registered tickets + QR
│   │   │   ├── CreateEventTab.jsx# Create new events
│   │   │   └── ManageEventsTab.jsx# Edit/delete hosted events
│   │   ├── AuthPanel.jsx         # Login / Register form
│   │   ├── Dashboard.jsx         # Tab orchestrator
│   │   ├── ProfileDropdown.jsx   # User profile menu
│   │   └── ScannerCard.jsx       # QR code scanner
│   ├── hooks/
│   │   └── useApi.js             # Fetch wrapper with auth
│   ├── config.js                 # API base URL
│   ├── index.css                 # Global styles & Tailwind
│   ├── App.jsx                   # Root component
│   └── main.jsx                  # Entry point
│
├── server/                       # Express backend
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Register & login logic
│   │   ├── eventsController.js   # CRUD for events
│   │   └── ticketsController.js  # Ticket registration & scanning
│   ├── middleware/
│   │   └── auth.js               # JWT verification middleware
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Event.js              # Event schema
│   │   └── Ticket.js             # Ticket schema
│   ├── routes/
│   │   ├── auth.js               # POST /register, /login
│   │   ├── events.js             # GET/POST/PUT/DELETE /events
│   │   └── tickets.js            # POST /register, /scan, GET /my
│   └── index.js                  # Server entry point
│
├── public/                       # Static assets (favicon, icons)
├── .env                          # Environment variables (not committed)
├── package.json
└── vite.config.js
```

## Setup

```bash
npm install
```

Create a `.env` file:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5001
```

## Running

```bash
npm run dev       # Start frontend (Vite dev server)
npm run server    # Start backend (Express on PORT)
```

## API Endpoints

| Method | Endpoint               | Auth | Description              |
|--------|------------------------|------|--------------------------|
| POST   | /api/auth/register     | No   | Create a new account     |
| POST   | /api/auth/login        | No   | Sign in                  |
| GET    | /api/events            | No   | List all events          |
| POST   | /api/events            | Yes  | Create an event          |
| PUT    | /api/events/:id        | Yes  | Update an event          |
| DELETE | /api/events/:id        | Yes  | Delete an event          |
| GET    | /api/events/:id/summary| No   | Event details + sold count|
| POST   | /api/tickets/register  | Yes  | Register for an event    |
| POST   | /api/tickets/scan      | No   | Scan a ticket QR code    |
| GET    | /api/tickets/my        | Yes  | Get user's tickets       |
