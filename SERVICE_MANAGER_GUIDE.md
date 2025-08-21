# 🎛️ Service Manager - Interactive Menu Guide

## What is this?
The Service Manager gives you full control over the Headless Web Runner services. You can start/stop backend and frontend independently, perfect for when you only need the bot API without the web dashboard.

## 🚀 Quick Start

### Windows
Double-click **`menu.bat`** - No installation needed!

### Linux/Arch
Run **`./menu.sh`** in terminal

## 📋 Menu Options

```
========================================
   Headless Web Runner - Service Manager  
========================================

Current Status:
  [1] Backend  : RUNNING (PID: 12345)
  [2] Frontend : STOPPED

Actions:
  [3] Toggle Backend      ← Start/Stop backend only
  [4] Toggle Frontend     ← Start/Stop frontend only  
  [5] Start Both Services ← Quick start everything
  [6] Stop All Services   ← Emergency stop all
  [7] View Backend Logs   ← Debug problems
  [8] Open Dashboard      ← Launch web interface
  [9] Install Dependencies← First-time setup
  [0] Exit               ← Quit manager
```

## 🎯 Common Use Cases

### Backend Only (No Web Interface)
**Perfect for: API usage, headless operation, resource saving**
1. Run `menu.bat` (Windows) or `./menu.sh` (Linux)
2. Press `3` to start backend
3. Backend runs on http://localhost:3001
4. Use API endpoints directly

### Full Setup (Backend + Frontend)
**Perfect for: Visual monitoring, bot management**
1. Run menu script
2. Press `5` to start both services
3. Dashboard opens automatically at http://localhost:3000

### Development Mode
**Perfect for: Code changes, debugging**
1. Start backend only (`3`)
2. Start frontend separately for hot-reload
3. View logs (`7`) for troubleshooting

## 📊 Service Status Colors

### Windows (menu.bat)
- **Backend: RUNNING (PID: 12345)** - Service active
- **Frontend: STOPPED** - Service not running

### Linux (menu.sh)
- **Backend: 🟢RUNNING (PID: 12345)** - Service active
- **Frontend: 🔴STOPPED** - Service not running

## ⚙️ Advanced Features

### Process Management
- **PID Tracking**: Each service's process ID is stored
- **Auto-Detection**: Menu automatically detects if services crashed
- **Clean Shutdown**: Properly terminates processes on exit
- **Log Files**: Separate logs for backend and frontend

### File Structure Created
```
headless-web-runner/
├── pids/
│   ├── backend.pid     ← Backend process ID
│   └── frontend.pid    ← Frontend process ID
├── logs/
│   ├── backend-output.log   ← Backend console output
│   └── frontend-output.log  ← Frontend console output
├── menu.bat           ← Windows menu
└── menu.sh            ← Linux menu
```

## 🔧 Troubleshooting

### Service Won't Start
1. Press `7` to view logs
2. Check if ports 3000/3001 are busy
3. Press `9` to reinstall dependencies
4. Try `quick-fix.bat` for common issues

### Process Stuck/Zombie
1. Press `6` to stop all services
2. Wait 10 seconds
3. Check Task Manager (Windows) or `ps aux` (Linux)
4. Manually kill if needed: `taskkill /pid 12345` or `kill 12345`

### Menu Not Responding
- **Windows**: Press `Ctrl+C` to force quit
- **Linux**: Press `Ctrl+C` to force quit
- Check if background processes are still running

## 🛠️ API Usage (Backend Only)

When running backend only, you can use these endpoints:

```bash
# Start new bot
curl -X POST http://localhost:3001/api/startNewBot

# Get bot status
curl http://localhost:3001/api/bots

# Control bot
curl -X POST http://localhost:3001/api/toggle_spin/bot_id
```

## ⚡ Performance Tips

### Resource Saving (Backend Only)
- **Memory Usage**: ~200MB vs ~400MB (both services)
- **CPU Usage**: 50% less without frontend
- **Perfect for**: Production, Raspberry Pi, low-power systems

### Development Workflow
1. **Code Backend**: Start backend only for API testing
2. **UI Changes**: Start both for visual feedback
3. **Debug Mode**: Use log viewer (`7`) frequently

## 🔐 Security Notes

- **Local Only**: Services bind to localhost (127.0.0.1)
- **No External Access**: Not accessible from other computers
- **Process Isolation**: Each service runs independently
- **Clean Shutdown**: Menu ensures proper cleanup on exit

---

## 💡 Pro Tips

- **Use `3` and `4`** for granular control
- **Press `7` regularly** to monitor service health  
- **Backend takes ~3 seconds** to fully start
- **Frontend takes ~5 seconds** for Next.js compilation
- **Logs are persistent** - check them after crashes
- **PID files auto-clean** when processes die

*This interactive menu gives you professional-grade service management for the Headless Web Runner system.*