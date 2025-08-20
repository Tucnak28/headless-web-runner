# Headless Web Runner - Claude Instructions

## Project Overview

**Headless Web Runner** is an automated bot system for Czech online casino platforms. It's a TypeScript monorepo that uses headless Chrome browsers to automate gameplay across multiple gambling sites with sophisticated anti-detection measures.

### Core Purpose
- Automates gameplay on 4 Czech gambling platforms (Synottip, Gapa, Fbet, Forbes)
- Manages multiple concurrent bot instances with unique configurations
- Provides real-time monitoring and control through a web interface
- Implements advanced stealth and anti-detection techniques

## Development Workflow Notes

- I am always running npm run dev, so claude doesn't have to do it itself.

## Architecture Overview

### **Backend** (`/backend/`)
- **Express API Server** (port 3001) with WebSocket support
- **BotManager**: Orchestrates multiple bot instances with lifecycle management
- **SynotBot**: Main bot class with Puppeteer automation and stealth features
- **Game Actions**: Platform-specific automation logic and game URL management
- **Real-time Logging**: File-based and memory logging with WebSocket streaming

### **Frontend** (`/frontend/`)
- **Next.js Dashboard**: Real-time bot grid with WebSocket updates
- **BotCard Component**: Individual bot control panel with settings and logs
- **Responsive UI**: TailwindCSS v4 with real-time status updates

### **Key Features**
- **74 Game URLs** across 4 platforms with random selection
- **Ultra Eco Mode**: Extreme resource optimization (CPU throttling, resource blocking)
- **Stealth Measures**: WebGL spoofing, fingerprint masking, Czech locale simulation
- **Human-like Interactions**: Ghost cursor with natural mouse movements
- **Comprehensive Testing**: 55 passing unit tests with Jest

## Development Commands (from root directory)

### Unified Commands
- **Install all dependencies**: `npm run install:all`
- **Build everything**: `npm run build`
- **Run both servers**: `npm run dev` (backend + frontend concurrently)
- **Run all tests**: `npm test` (55 passing unit tests)
- **Run tests with watch**: `npm run test:watch`
- **Run tests with coverage**: `npm run test:coverage`
- **Test backend startup**: `npm run test:backend` (10s timeout)
- **Clean all builds**: `npm run clean`

### Individual Commands
- **Backend only**: `npm run dev:backend` or `npm run build:backend`
- **Frontend only**: `npm run dev:frontend` or `npm run build:frontend`

### Legacy (from subdirectories)
- Backend: `cd backend && npm start` (⚠️ runs indefinitely)
- Frontend: `cd frontend && npm run dev`

## API Endpoints

### Bot Management
- `POST /api/startNewBot` - Create new bot instance
- `POST /api/kill_Bot/:id` - Terminate specific bot
- `POST /api/retrieve_log/:id` - Get bot activity logs

### Bot Control
- `POST /api/toggle_spin/:id` - Start/stop automated gameplay
- `POST /api/apply_settings/:id` - Configure credentials, delay, platform
- `POST /api/toggle_window/:id` - Hide/show browser window
- `POST /api/toggle_Eco/:id` - Enable ultra performance mode

### Testing & Monitoring
- `POST /api/test_stealth/` - Browser fingerprint validation with screenshots

## Bot Automation Workflow

### Initialization
1. Launch headless Chrome with stealth configuration
2. Set random viewport (1920x1080 preferred) and Czech user agent
3. Configure anti-detection measures (WebGL spoofing, locale simulation)
4. Navigate to Wikipedia for initial page setup

### Game Session Loop
1. **Game Selection**: Pick random URL from configured platform (74 total games)
2. **Authentication**: Platform-specific login (API for Fbet, forms for others)
3. **Game Setup**: Access iframe, dismiss dialogs, reduce bet (20 clicks)
4. **Automated Gameplay**: Execute spins with dynamic timing delays
5. **Error Handling**: Retry with different games on failures

### Advanced Features
- **Ultra Eco Mode**: CPU throttling, minimal viewport, resource blocking
- **Stealth Measures**: Fingerprint masking, hardware spoofing, natural interactions
- **Smart Timing**: Dynamic delays based on user configuration (minimum 10s)

## Supported Platforms

1. **Synottip** (`casino.synottip.cz`) - 29 games
2. **Gapa** (`herna.gapagroup.cz`) - 29 games  
3. **Fbet** (`www.fbet.cz`) - 15 games (API authentication)
4. **Forbes** (`www.forbescasino.cz`) - 1 game

## Key Files & Components

### Core Backend Files
- `src/bots/BotManager.ts` - Bot lifecycle management (100% test coverage)
- `src/bots/SynotBot.ts` - Main bot implementation with stealth features
- `src/lib/gameActions.ts` - Game automation and platform-specific logic
- `src/server/routes.ts` - Express API endpoints (77% test coverage)
- `src/server/Server.ts` - HTTP server and WebSocket configuration

### Frontend Components
- `src/components/BotCard.tsx` - Individual bot control interface
- `src/components/AddBotButton.tsx` - New bot creation
- `src/pages/index.tsx` - Main dashboard with real-time updates

### Configuration & Data
- `Data/Games.txt` - Raw game URLs by platform
- `Data/Games_processed.txt` - Formatted URLs for code integration
- `logs/` - Individual bot activity logs (auto-generated)

## Testing Infrastructure

- **Jest Framework**: TypeScript support with comprehensive mocking
- **55 Passing Tests**: BotManager, gameActions, API routes, SynotBot basics
- **Coverage Reports**: HTML/LCOV with detailed metrics
- **Puppeteer Mocking**: Isolated testing without browser dependencies

## Multi-Device Deployment

This project is designed to run across **3 different environments**:

### **Development Environment - Arch Linux** (tucna's main machine)
- **OS**: Arch Linux with HyDE (Hyprland Desktop Environment)
- **Purpose**: Primary development, testing, and debugging
- **Node.js**: LTS version recommended (avoid bus errors with newer versions)
- **Considerations**: 
  - Use `pacman` for system dependencies
  - May need specific Node.js version for frontend compatibility
  - Full development toolchain available

### **Production Environment - Windows** (friend's machine)
- **OS**: Windows (friend's computer)
- **Purpose**: Production deployment and extended runtime operations
- **Considerations**:
  - Cross-platform compatibility ensured via Node.js/npm
  - Windows-specific path handling in log files
  - May need Windows Defender exclusions for Puppeteer
  - Different browser installation paths

### **Edge Deployment - Raspberry Pi 4** (planned)
- **Hardware**: ARM64 architecture, limited resources (4GB/8GB RAM recommended)
- **Purpose**: Low-power, always-on bot operations
- **Critical Considerations**:
  - **Ultra Eco Mode essential** for performance (CPU throttling, resource blocking)
  - ARM64 Puppeteer/Chromium compatibility required
  - Limited memory - careful resource management needed
  - Potential thermal throttling under load
  - Network stability important for gambling platforms
  - Consider headless-only operation (no X11)
- **Raspberry Pi Specific Setup**:
  - Install Chromium: `sudo apt install chromium-browser`
  - Increase GPU memory split: `sudo raspi-config` → Advanced → Memory Split → 128
  - Consider swap file expansion for memory-intensive operations
  - Monitor temperature: `vcgencmd measure_temp`
  - Use `pm2` or similar for process management and auto-restart
  - Recommended: Run maximum 1-2 bots simultaneously due to resource constraints

### **Cross-Platform Compatibility Notes**
- **File Paths**: Project uses `path.join()` for cross-platform compatibility
- **Dependencies**: All major dependencies support Windows/Linux/ARM
- **Browser Automation**: Puppeteer handles platform-specific Chrome/Chromium
- **Environment Variables**: Use `.env` files for platform-specific configurations
- **Performance Scaling**: Ultra Eco Mode crucial for Pi 4, optional for others

## Known Issues & Considerations

- **Arch Linux**: Frontend may have Node.js compatibility issues (bus errors) - use LTS version
- **Windows**: May need antivirus exclusions for Puppeteer browser automation
- **Raspberry Pi 4**: Resource constraints require Ultra Eco Mode and careful memory management
- Backend server runs indefinitely - use timeouts when testing startup
- Complex browser automation requires careful error handling and retries
- Anti-detection measures need periodic updates for effectiveness
- Network stability crucial across all environments for gambling platform connections

## Commit Guidelines
- **NEVER** add Co-Authored-By lines to commits
- Keep commit messages concise and descriptive
- Follow existing commit style (short imperative messages)

## Memories

- Use the Puppeteer MCP for the project

## Security & Anti-Detection

The system implements sophisticated measures to avoid detection:
- **Browser Fingerprinting**: WebGL vendor/renderer spoofing, hardware masking
- **Behavioral Mimicking**: Human-like mouse movements, natural timing variations
- **Geographic Simulation**: Czech Republic locale, timezone, language preferences
- **Resource Management**: Ultra Eco Mode for performance optimization

This is a professional-grade automation system with comprehensive testing, real-time monitoring, and advanced anti-detection capabilities specifically designed for Czech gambling platforms.