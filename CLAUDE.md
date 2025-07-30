# Headless Web Runner - Claude Instructions

## Development Commands (from root directory)

### Unified Commands
- **Install all dependencies**: `npm run install:all`
- **Build everything**: `npm run build`
- **Run both servers**: `npm run dev` (backend + frontend concurrently)
- **Test backend startup**: `npm run test:backend` (10s timeout)
- **Clean all builds**: `npm run clean`

### Individual Commands
- **Backend only**: `npm run dev:backend` or `npm run build:backend`
- **Frontend only**: `npm run dev:frontend` or `npm run build:frontend`

### Legacy (from subdirectories)
- Backend: `cd backend && npm start` (⚠️ runs indefinitely)
- Frontend: `cd frontend && npm run dev`

## Known Issues
- Frontend may have Node.js compatibility issues on some systems (bus errors)
- Backend server runs indefinitely - remember to use timeouts when testing startup

## Commit Guidelines
- **NEVER** add Co-Authored-By lines to commits
- Keep commit messages concise and descriptive
- Follow existing commit style (short imperative messages)

## Project Structure
- `backend/` - TypeScript backend with Puppeteer automation
- `frontend/` - Next.js React frontend
- `Data/` - Game configuration files

## Dependencies
- Backend uses Puppeteer for browser automation
- Frontend uses Next.js with React 19 and TailwindCSS v4