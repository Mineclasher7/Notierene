# Notierene

Notierene is a lightweight note-taking application that can run in the browser or as a cross-platform desktop app (Electron). It provides user authentication, room-based note creation, and a small Node.js backend using PostgreSQL for persistence.

Key features
- User signup / login with session handling
- Create, view, edit and delete notes organized by rooms
- Web front-end (React/Next.js) and a packaged Electron desktop client
- Small Node.js backend with SQLite for easy local persistence

Repository layout
- `backend/` — Node.js server, database schema (`notieren.sql`), and API endpoints
- `front/` — Next.js app (TypeScript) used as the modern web frontend
- `frontend/` — Legacy React frontend (Create React App build output included)
- `electron/` — Electron wrapper and preload scripts for desktop packaging

Getting started (development)

Prerequisites
- Node.js (16+) and npm

Run the backend

```bash
cd backend
npm install
npm run dev    # or `node server.js` to start the server
```

Run the modern frontend (Next.js)

```bash
cd front
npm install
npm run dev    # starts Next.js dev server on http://localhost:3000 by default
```

Run the Electron app (desktop)

```bash
cd electron
npm install
npm run start  # or run the packaged app after building
```

Database
- The repository includes `backend/notieren.sql` with the initial schema. The backend uses PostgreSQL for persistence; configure the connection in `backend/db.js` or via the `DATABASE_URL` environment variable.

Postgres setup (local)

```bash
# create a database
createdb notierene_dev
# apply schema
psql notierene_dev < backend/notieren.sql
```

Common env vars
- `DATABASE_URL=postgres://user:password@localhost:5432/notierene_dev`

Building and packaging
- Follow each subfolder's `package.json` scripts. For Electron packaging, build the frontend bundle first (from `front` or `frontend` as appropriate) and then run the packaging script in `electron`.

Notes and troubleshooting
- If ports conflict, update the port configuration in `backend/server.js` and the frontend `axios` base URL (`front/src` or `front/config.js`).
- The repo contains both a modern Next.js frontend (`front/`) and a legacy `frontend/` build — choose the one you want to run or package.


