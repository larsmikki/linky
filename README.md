# Linky

A lightweight self-hosted web launcher with a modern desktop-like interface. Place shortcut icons on a grid-based desktop surface, organize them into groups, and access your links from any device.

## Features

- **Desktop-style grid layout** with snap-to-grid positioning
- **Shortcuts** with automatic favicon fetching and local caching
- **Groups** with collapsible containers, custom colors, and titles
- **Context menus** (right-click or long-press on touch) for all actions
- **Arrange mode** for drag-and-drop repositioning
- **Responsive** layout for mobile and desktop
- **Server-side persistence** with SQLite — consistent across devices
- **Manual icon upload** support with fallback letter tiles

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Install all dependencies
npm run setup

# Install root dev dependencies
npm install
```

### Development

```bash
# Start both server (port 3001) and client dev server (port 5173)
npm run dev
```

Open http://localhost:5173 in your browser.

### Production

```bash
# Build everything
npm run build

# Start the production server
npm start
```

Open http://localhost:3001 in your browser.

## Usage

- **Right-click** the desktop background to add shortcuts, groups, or open settings
- **Right-click** a shortcut to edit, change icon, move to group, or delete
- **Right-click** a group to rename, change color, collapse, or delete
- **Long-press** on touch devices for the same context menus
- **Click** any shortcut to open its URL in a new tab
- Enable **Arrange Mode** from the context menu to drag items around the grid

## Project Structure

```
linky/
├── client/          # React + TypeScript frontend (Vite)
│   └── src/
│       ├── components/   # UI components
│       ├── hooks/        # API client
│       └── types/        # TypeScript types
├── server/          # Express + TypeScript backend
│   └── src/
│       ├── db.ts         # SQLite schema and connection
│       ├── favicon.ts    # Favicon fetching and caching
│       ├── routes.ts     # REST API routes
│       └── index.ts      # Server entry point
└── package.json     # Root scripts
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/settings | Get all settings |
| PUT | /api/settings | Update settings |
| GET | /api/shortcuts | List all shortcuts |
| POST | /api/shortcuts | Create shortcut |
| PUT | /api/shortcuts/:id | Update shortcut |
| DELETE | /api/shortcuts/:id | Delete shortcut |
| POST | /api/shortcuts/:id/refresh-favicon | Re-fetch favicon |
| POST | /api/shortcuts/:id/icon | Upload custom icon |
| DELETE | /api/shortcuts/:id/icon | Remove custom icon |
| GET | /api/groups | List all groups |
| POST | /api/groups | Create group |
| PUT | /api/groups/:id | Update group |
| DELETE | /api/groups/:id | Delete group |
| PUT | /api/layout | Batch update positions |
| GET | /api/icons/:filename | Serve cached icon |

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Backend:** Express, TypeScript
- **Database:** SQLite (via better-sqlite3)
- **Icons:** sharp for image processing
