# Linky

A lightweight self-hosted web launcher. Organize your bookmarks into a drag-and-drop grid with collapsible groups, auto-fetched favicons, and a clean desktop-like interface.

![Linky screenshot](screenshot.png)

---

## Quick Start

### Docker (recommended)

```bash
docker run -d \
  --name linky \
  -p 3020:3020 \
  -v linky-data:/app/data \
  --restart unless-stopped \
  larsmikki/linky:latest
```

Open http://localhost:3020

### Docker Compose

```bash
curl -O https://raw.githubusercontent.com/larsmikki/linky/main/docker-compose.yml
docker compose up -d
```

Open http://localhost:3020

---

## Usage

- **Right-click** the background to add shortcuts or groups
- **Right-click** a shortcut or group to edit, move, or delete
- **Long-press** on touch devices works the same way
- Enable **Arrange Mode** from the context menu to drag items around the grid

---

## Features

- Grid layout with drag-and-drop repositioning
- Auto-fetched favicons with local caching
- Collapsible groups with custom colors
- Manual icon upload with fallback letter tiles
- Import / export for backup and migration
- Responsive — works on mobile and desktop
- Data persisted in SQLite, consistent across devices

---

## Data Persistence

Data is stored in a Docker volume (`linky-data`) at `/app/data` inside the container. To back up, export via the settings menu or copy the volume contents.

---

## Configuration

| Environment variable | Default | Description |
|---|---|---|
| `PORT` | `3020` | Port the server listens on |
| `DATA_DIR` | `/app/data` | Directory for database and icon cache |
| `ALLOWED_ORIGINS` | `http://localhost:3020` | Comma-separated allowed CORS origins |

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Backend:** Express, TypeScript
- **Database:** SQLite (via sql.js)
- **Icons:** Sharp for image processing
