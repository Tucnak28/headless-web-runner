#!/bin/bash

# Colors for better UI
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Initialize variables
backend_pid=""
frontend_pid=""
backend_status="STOPPED"
frontend_status="STOPPED"

# Create necessary directories
mkdir -p pids logs

check_services() {
    # Check backend
    if [ -f "pids/backend.pid" ]; then
        backend_pid=$(cat "pids/backend.pid" 2>/dev/null)
        if [ -n "$backend_pid" ] && ps -p "$backend_pid" > /dev/null 2>&1; then
            backend_status="${GREEN}RUNNING${NC} (PID: $backend_pid)"
        else
            backend_status="${RED}STOPPED${NC}"
            rm -f "pids/backend.pid"
            backend_pid=""
        fi
    else
        backend_status="${RED}STOPPED${NC}"
        backend_pid=""
    fi

    # Check frontend
    if [ -f "pids/frontend.pid" ]; then
        frontend_pid=$(cat "pids/frontend.pid" 2>/dev/null)
        if [ -n "$frontend_pid" ] && ps -p "$frontend_pid" > /dev/null 2>&1; then
            frontend_status="${GREEN}RUNNING${NC} (PID: $frontend_pid)"
        else
            frontend_status="${RED}STOPPED${NC}"
            rm -f "pids/frontend.pid"
            frontend_pid=""
        fi
    else
        frontend_status="${RED}STOPPED${NC}"
        frontend_pid=""
    fi
}

show_menu() {
    clear
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}   Headless Web Runner - Service Manager${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    check_services
    echo "Current Status:"
    echo -e "  [1] Backend  : $backend_status"
    echo -e "  [2] Frontend : $frontend_status"
    echo ""
    echo "Actions:"
    echo "  [3] Toggle Backend"
    echo "  [4] Toggle Frontend"
    echo "  [5] Start Both Services"
    echo "  [6] Stop All Services"
    echo "  [7] View Backend Logs"
    echo "  [8] Open Dashboard (if running)"
    echo "  [9] Install Dependencies"
    echo "  [U] Update Project from Git"
    echo "  [0] Exit"
    echo ""
    read -p "Select option (0-9, U): " choice
}

show_backend_info() {
    clear
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}          Backend Information${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo "Service: Headless Web Runner Backend"
    echo "Port: 3001"
    echo "URL: http://localhost:3001"
    echo -e "Status: $backend_status"
    echo ""
    if [ -z "$backend_pid" ]; then
        echo "Backend is not running."
        echo "This service manages bot instances and provides the API."
    else
        echo "Backend is running with PID: $backend_pid"
        echo "API endpoints are available at http://localhost:3001/api/"
    fi
    echo ""
    read -p "Press Enter to return to main menu..."
}

show_frontend_info() {
    clear
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}         Frontend Information${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo "Service: Next.js Dashboard"
    echo "Port: 3000"
    echo "URL: http://localhost:3000"
    echo -e "Status: $frontend_status"
    echo ""
    if [ -z "$frontend_pid" ]; then
        echo "Frontend is not running."
        echo "This provides the web dashboard for bot management."
    else
        echo "Frontend is running with PID: $frontend_pid"
        echo "Dashboard is accessible at http://localhost:3000"
    fi
    echo ""
    read -p "Press Enter to return to main menu..."
}

start_backend() {
    echo -e "${YELLOW}Starting backend service...${NC}"
    cd backend
    nohup npm start > ../logs/backend-output.log 2>&1 &
    echo $! > ../pids/backend.pid
    cd ..
    sleep 3
    echo -e "${GREEN}Backend service started.${NC}"
    read -p "Press Enter to continue..."
}

stop_backend() {
    echo -e "${YELLOW}Stopping backend service...${NC}"
    if [ -z "$backend_pid" ]; then
        echo "Backend is not running."
    else
        kill "$backend_pid" 2>/dev/null
        rm -f "pids/backend.pid"
        echo -e "${GREEN}Backend service stopped.${NC}"
    fi
    read -p "Press Enter to continue..."
}

start_frontend() {
    echo -e "${YELLOW}Starting frontend service...${NC}"
    cd frontend
    nohup npm run dev > ../logs/frontend-output.log 2>&1 &
    echo $! > ../pids/frontend.pid
    cd ..
    sleep 5
    echo -e "${GREEN}Frontend service started.${NC}"
    echo "Dashboard will be available at http://localhost:3000"
    read -p "Press Enter to continue..."
}

stop_frontend() {
    echo -e "${YELLOW}Stopping frontend service...${NC}"
    if [ -z "$frontend_pid" ]; then
        echo "Frontend is not running."
    else
        kill "$frontend_pid" 2>/dev/null
        rm -f "pids/frontend.pid"
        echo -e "${GREEN}Frontend service stopped.${NC}"
    fi
    read -p "Press Enter to continue..."
}

toggle_backend() {
    if [ -z "$backend_pid" ]; then
        start_backend
    else
        stop_backend
    fi
}

toggle_frontend() {
    if [ -z "$frontend_pid" ]; then
        start_frontend
    else
        stop_frontend
    fi
}

start_both() {
    echo -e "${YELLOW}Starting both services...${NC}"
    start_backend
    sleep 2
    start_frontend
    echo ""
    echo "Both services are starting up..."
    echo "Backend: http://localhost:3001"
    echo "Frontend: http://localhost:3000"
    sleep 3
    if command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:3000 &
    fi
}

stop_all() {
    echo -e "${YELLOW}Stopping all services...${NC}"
    stop_backend
    stop_frontend
    echo -e "${GREEN}All services stopped.${NC}"
    read -p "Press Enter to continue..."
}

view_logs() {
    clear
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}             Service Logs${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    
    if [ -f "logs/backend-output.log" ]; then
        echo -e "${YELLOW}=== Backend Log (last 20 lines) ===${NC}"
        tail -20 "logs/backend-output.log"
        echo ""
    else
        echo "No backend log file found."
        echo ""
    fi

    if [ -f "logs/frontend-output.log" ]; then
        echo -e "${YELLOW}=== Frontend Log (last 20 lines) ===${NC}"
        tail -20 "logs/frontend-output.log"
        echo ""
    else
        echo "No frontend log file found."
        echo ""
    fi
    
    read -p "Press Enter to continue..."
}

open_dashboard() {
    if [ -z "$frontend_pid" ]; then
        echo -e "${RED}Frontend is not running. Please start it first.${NC}"
        read -p "Press Enter to continue..."
    else
        echo -e "${GREEN}Opening dashboard in browser...${NC}"
        if command -v xdg-open &> /dev/null; then
            xdg-open http://localhost:3000
        elif command -v gnome-open &> /dev/null; then
            gnome-open http://localhost:3000
        else
            echo "Please open http://localhost:3000 in your browser manually."
        fi
    fi
}

install_deps() {
    clear
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}       Installing Dependencies${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo "This will install all required packages..."
    echo ""
    npm run install:all
    echo ""
    echo -e "${GREEN}Dependencies installation complete!${NC}"
    read -p "Press Enter to continue..."
}

update_project() {
    clear
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}        Update Project from Git${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""

    # Check if git is available
    if ! command -v git &> /dev/null; then
        echo -e "${RED}ERROR: Git is not installed!${NC}"
        echo "Please install Git:"
        echo "- Ubuntu/Debian: sudo apt install git"
        echo "- Arch Linux: sudo pacman -S git"
        echo "- Or download from: https://git-scm.com/"
        read -p "Press Enter to continue..."
        return
    fi

    # Check if we're in a git repository
    if ! git rev-parse --git-dir &> /dev/null; then
        echo -e "${RED}ERROR: This is not a Git repository!${NC}"
        echo "Make sure you're in the correct project folder."
        read -p "Press Enter to continue..."
        return
    fi

    # Stop all services before updating
    echo -e "${YELLOW}Stopping all services before update...${NC}"
    stop_all

    # Show current status
    echo "Current version:"
    git log -1 --oneline
    echo ""

    # Fetch latest changes
    echo -e "${YELLOW}Fetching latest changes from remote...${NC}"
    if ! git fetch origin; then
        echo -e "${RED}ERROR: Failed to fetch from remote repository.${NC}"
        echo "Check your internet connection and git credentials."
        read -p "Press Enter to continue..."
        return
    fi

    # Check if updates available
    update_count=$(git rev-list HEAD...origin/main --count 2>/dev/null || echo "0")
    if [ "$update_count" = "0" ]; then
        echo -e "${GREEN}No updates available. You're up to date!${NC}"
        read -p "Press Enter to continue..."
        return
    fi

    # Show available updates
    echo -e "${YELLOW}$update_count update(s) available:${NC}"
    git log HEAD..origin/main --oneline
    echo ""

    # Confirm update
    read -p "Do you want to update? This will pull latest changes (y/n): " update_confirm
    if [[ ! $update_confirm =~ ^[Yy]$ ]]; then
        echo "Update cancelled."
        read -p "Press Enter to continue..."
        return
    fi

    # Backup current changes (if any)
    has_stash=false
    if ! git diff --quiet; then
        echo -e "${YELLOW}You have uncommitted changes. Creating backup...${NC}"
        git stash push -m "Auto-backup before update"
        has_stash=true
    fi

    # Pull latest changes
    echo -e "${YELLOW}Pulling latest changes...${NC}"
    if ! git pull origin main; then
        echo -e "${RED}ERROR: Git pull failed!${NC}"
        if [ "$has_stash" = true ]; then
            echo "Restoring your changes..."
            git stash pop
        fi
        read -p "Press Enter to continue..."
        return
    fi

    # Check if package.json files changed
    if git diff HEAD~$update_count --name-only | grep -q "package.json"; then
        echo -e "${YELLOW}Package.json files changed. Updating dependencies...${NC}"
        if npm run install:all; then
            echo -e "${GREEN}Dependencies updated successfully!${NC}"
        else
            echo -e "${RED}WARNING: Dependency installation failed!${NC}"
            echo "You may need to run 'Install Dependencies' manually."
        fi
    else
        echo "No dependency changes detected. Skipping npm install."
    fi

    # Restore stashed changes if any
    if [ "$has_stash" = true ]; then
        echo -e "${YELLOW}Restoring your previous changes...${NC}"
        if ! git stash pop; then
            echo -e "${RED}WARNING: Could not restore all changes automatically.${NC}"
            echo "Check 'git status' for conflicts."
        fi
    fi

    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}        Update Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo "Updated from:"
    git log -1 --oneline HEAD~$update_count
    echo "To:"
    git log -1 --oneline HEAD
    echo ""
    echo -e "${BLUE}You can now restart your services.${NC}"
    read -p "Press Enter to continue..."
}

# Main loop
while true; do
    show_menu
    
    case $choice in
        1) show_backend_info ;;
        2) show_frontend_info ;;
        3) toggle_backend ;;
        4) toggle_frontend ;;
        5) start_both ;;
        6) stop_all ;;
        7) view_logs ;;
        8) open_dashboard ;;
        9) install_deps ;;
        [Uu]) update_project ;;
        0) 
            echo ""
            read -p "Do you want to stop all running services before exiting? (y/n): " stop_choice
            if [[ $stop_choice =~ ^[Yy]$ ]]; then
                stop_all
                echo "All services stopped."
            fi
            echo ""
            echo "Goodbye!"
            sleep 2
            exit 0
            ;;
        *) 
            echo -e "${RED}Invalid option. Press Enter to continue...${NC}"
            read
            ;;
    esac
done