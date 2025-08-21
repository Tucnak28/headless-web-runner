# 🤖 Headless Web Runner - Easy Start Guide

## What is this?
This is an automated bot system that can play on Czech gambling websites. It runs in your web browser automatically and has a dashboard to control everything.

## 📋 Requirements
- **Windows 10/11** (recommended for your setup)
- **Internet connection**
- **Google Chrome** (will be installed automatically if missing)

## 🚀 Quick Start (Windows)

### Step 1: Install Node.js
1. Go to https://nodejs.org/
2. Download the **LTS version** (green button)
3. Run the installer and follow the steps
4. **Restart your computer** after installation

### Step 2: Download the Project
1. Get the project folder from your friend
2. Put it somewhere easy to find (like Desktop or Documents)

### Step 3: Start the Bot System
1. **Double-click `start.bat`** in the project folder
2. A black window will open and install everything automatically
3. Your web browser will open to: http://localhost:3000
4. **Done!** You now see the bot dashboard

## 🎮 Using the Dashboard

### Creating Your First Bot
1. Click **"Add New Bot"** (blue button)
2. Fill in your casino login details:
   - **Username**: Your casino username
   - **Password**: Your casino password  
   - **Platform**: Choose your casino (Synottip, Gapa, etc.)
   - **Spin Delay**: How fast to play (10+ seconds recommended)
3. Click **"Start Bot"**

### Bot Controls
- **▶️ Start/Stop**: Begin or pause automatic playing
- **👁️ Show/Hide**: Show or hide the bot's browser window  
- **⚡ Eco Mode**: Use less computer resources (slower but safer)
- **💀 Kill Bot**: Completely stop and remove the bot
- **📋 View Logs**: See what the bot is doing

### Bot Status Colors
- **🟢 Green**: Bot is working normally
- **🟡 Yellow**: Bot is starting up or paused
- **🔴 Red**: Bot has a problem or is stopped

## ⚠️ Important Tips

### Safety First
- **Start with small bets** - the bot will try to reduce bets automatically
- **Don't run too many bots** - start with 1-2 to test
- **Monitor the bots** - check the logs regularly
- **Have backup funds** - only gamble what you can afford to lose

### Performance Tips
- **Close other programs** while running bots
- **Use Eco Mode** if your computer is slow
- **Don't run more than 3-4 bots** on most computers
- **Check internet connection** - bots need stable internet

### If Something Goes Wrong
1. **Bot won't start**: Check your login details
2. **Computer is slow**: Enable Eco Mode or run fewer bots
3. **Browser crashes**: Kill the bot and start a new one
4. **Can't access website**: Check if the casino site is working

## 🔧 Troubleshooting

### "Node.js not found" Error
- Install Node.js from https://nodejs.org/
- Restart your computer
- Try running `start.bat` again

### "Port already in use" Error
- Close the black window (Ctrl+C)
- Wait 10 seconds
- Run `start.bat` again

### Bot Gets Stuck
- Click **"Kill Bot"** (skull button)
- Wait a few seconds
- Create a new bot

### Browser Won't Open
- Manually go to: http://localhost:3000
- Make sure Windows Firewall isn't blocking it

## 📞 Getting Help

If you have problems:
1. **Check the bot logs** - they show what went wrong
2. **Try restarting** - kill all bots and run `start.bat` again
3. **Contact your friend** - they can help debug technical issues

## 🛡️ Security Notes

- **Keep your login details private** - they're only stored locally
- **Don't share screenshots** with login details visible
- **Use strong passwords** for your casino accounts
- **Log out of casinos** when not using bots

---

## For Technical Users

### Manual Commands
- **Install dependencies**: `npm run install:all`
- **Start backend only**: `npm run dev:backend`
- **Start frontend only**: `npm run dev:frontend`
- **Run tests**: `npm test`

### Configuration Files
- Bot logs: `backend/logs/`
- Game URLs: `backend/Data/Games.txt`
- Settings: Stored in memory, not files

### Ports Used
- Backend API: http://localhost:3001
- Frontend Dashboard: http://localhost:3000
- WebSocket: Same as backend (3001)

---

*This guide was created to help non-technical users get started quickly and safely.*