#!/bin/bash

# Task Undo/Downgrade Management
# Move tasks backwards through stages or skip steps

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Project paths
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
TASKS_DIR="$PROJECT_ROOT/.claude/tasks"
TASK_MANAGER="$PROJECT_ROOT/.claude/tasks/scripts/task-manager.sh"
FILE_TRACKER="$PROJECT_ROOT/.claude/tasks/scripts/file-tracker.sh"
TASK_HISTORY="$PROJECT_ROOT/.claude/tasks/scripts/task-history.sh"
TASK_SEARCH="$PROJECT_ROOT/.claude/tasks/scripts/task-search.sh"

# Source history functions if available
if [ -f "$TASK_HISTORY" ]; then
    source "$TASK_HISTORY"
fi

# Task files
FUTURE_FILE="$TASKS_DIR/FUTURE.md"
TODO_FILE="$TASKS_DIR/TODO.md"
IN_PROGRESS_FILE="$TASKS_DIR/IN-PROGRESS.md"
COMPLETED_FILE="$TASKS_DIR/COMPLETED.md"
RELEASED_FILE="$TASKS_DIR/RELEASED.md"

# Find which stage a task is in
find_task_stage() {
    local pattern="$1"
    
    for stage in "RELEASED" "COMPLETED" "IN-PROGRESS" "TODO" "FUTURE"; do
        local file="${TASKS_DIR}/${stage}.md"
        if [ -f "$file" ] && grep -qi "$pattern" "$file"; then
            echo "$stage"
            return 0
        fi
    done
    
    echo "NOT_FOUND"
    return 1
}

# Get previous stage in workflow
get_previous_stage() {
    local current="$1"
    
    case "$current" in
        "RELEASED")
            echo "COMPLETED"
            ;;
        "COMPLETED")
            echo "IN-PROGRESS"
            ;;
        "IN-PROGRESS")
            echo "TODO"
            ;;
        "TODO")
            echo "FUTURE"
            ;;
        "FUTURE")
            echo "FUTURE"  # Can't go back further
            ;;
        *)
            echo "UNKNOWN"
            ;;
    esac
}

# Get next stage in workflow
get_next_stage() {
    local current="$1"
    
    case "$current" in
        "FUTURE")
            echo "TODO"
            ;;
        "TODO")
            echo "IN-PROGRESS"
            ;;
        "IN-PROGRESS")
            echo "COMPLETED"
            ;;
        "COMPLETED")
            echo "RELEASED"
            ;;
        "RELEASED")
            echo "RELEASED"  # Can't go forward further
            ;;
        *)
            echo "UNKNOWN"
            ;;
    esac
}

# Move task backwards (undo)
undo_task() {
    local pattern="${1:-}"
    local revert_files="${2:-ask}"  # ask, yes, no
    
    # If no pattern provided, use last task from history
    if [ -z "$pattern" ] && [ -f "$TASK_HISTORY" ]; then
        pattern=$(get_last_task)
        if [ -z "$pattern" ]; then
            echo -e "${RED}❌ No recent task found in history${NC}"
            echo "Specify a task pattern or perform a task action first"
            return 1
        fi
        echo -e "${CYAN}Using last task from history: $pattern${NC}"
    elif [ -z "$pattern" ]; then
        echo -e "${RED}❌ Usage: tm undo [pattern] [--with-files|--no-files]${NC}"
        echo "Pattern is optional if you have recent task history"
        return 1
    fi
    
    # Parse file revert option
    if [[ "$2" == "--with-files" ]]; then
        revert_files="yes"
    elif [[ "$2" == "--no-files" ]]; then
        revert_files="no"
    fi
    
    echo -e "${CYAN}Finding task: $pattern${NC}"
    
    # Find current stage
    current_stage=$(find_task_stage "$pattern")
    
    if [ "$current_stage" = "NOT_FOUND" ]; then
        echo -e "${RED}❌ Task not found: $pattern${NC}"
        return 1
    fi
    
    echo -e "${BLUE}Current stage: $current_stage${NC}"
    
    # Check for available snapshots
    TASK_SNAPSHOT="$PROJECT_ROOT/.claude/tasks/scripts/task-snapshot.sh"
    if [ -f "$TASK_SNAPSHOT" ]; then
        # Find recent snapshots for this task
        snapshot_id=$("$TASK_SNAPSHOT" find "$pattern" 2>/dev/null | grep "^\[" | head -1 | sed 's/\[\([0-9]*\)\].*/\1/')
        
        if [ -n "$snapshot_id" ]; then
            echo -e "${CYAN}Found snapshot: $snapshot_id${NC}"
            
            # Ask about file reversion if not specified
            if [ "$revert_files" = "ask" ]; then
                echo ""
                echo -e "${YELLOW}Do you want to revert file changes as well?${NC}"
                echo "  1) Yes - Revert files to snapshot state"
                echo "  2) No - Just move the task"
                echo "  3) Preview - See what would be reverted"
                read -p "Choice [1-3]: " choice
                
                case $choice in
                    1) revert_files="yes" ;;
                    2) revert_files="no" ;;
                    3) 
                        "$TASK_SNAPSHOT" preview "$snapshot_id"
                        echo ""
                        echo -e "${YELLOW}Proceed with file reversion?${NC}"
                        read -p "(y/n): " -n 1 proceed
                        echo
                        if [[ $proceed =~ ^[Yy]$ ]]; then
                            revert_files="yes"
                        else
                            revert_files="no"
                        fi
                        ;;
                    *) revert_files="no" ;;
                esac
            fi
            
            # Revert files if requested
            if [ "$revert_files" = "yes" ]; then
                echo -e "${CYAN}Reverting file changes...${NC}"
                "$TASK_SNAPSHOT" revert "$snapshot_id" "$revert_files"
            fi
        fi
    fi
    
    # Get previous stage
    previous_stage=$(get_previous_stage "$current_stage")
    
    if [ "$previous_stage" = "$current_stage" ]; then
        echo -e "${YELLOW}⚠️  Task is already at the earliest stage (FUTURE)${NC}"
        return 0
    fi
    
    # Map to task-manager.sh stage names
    case "$previous_stage" in
        "FUTURE") target="future" ;;
        "TODO") target="todo" ;;
        "IN-PROGRESS") target="wip" ;;
        "COMPLETED") target="done" ;;
        "RELEASED") target="released" ;;
    esac
    
    echo -e "${CYAN}Moving from $current_stage → $previous_stage${NC}"
    
    # Use task-manager to move
    "$TASK_MANAGER" move "$pattern" "$target"
    
    # If moving from IN-PROGRESS, stop file tracking
    if [ "$current_stage" = "IN-PROGRESS" ] && [ -f "$PROJECT_ROOT/.claude/file-tracking/current-task.txt" ]; then
        echo -e "${YELLOW}Stopping file tracking...${NC}"
        "$FILE_TRACKER" stop 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✅ Task moved back to $previous_stage${NC}"
}

# Skip to a specific stage
skip_to_stage() {
    local pattern="$1"
    local target_stage="$2"
    
    echo -e "${CYAN}Finding task: $pattern${NC}"
    
    # Find current stage
    current_stage=$(find_task_stage "$pattern")
    
    if [ "$current_stage" = "NOT_FOUND" ]; then
        echo -e "${RED}❌ Task not found: $pattern${NC}"
        return 1
    fi
    
    echo -e "${BLUE}Current stage: $current_stage${NC}"
    echo -e "${BLUE}Target stage: $target_stage${NC}"
    
    # Map to task-manager.sh stage names
    case "$(echo "$target_stage" | tr '[:lower:]' '[:upper:]')" in
        "FUTURE") target="future" ;;
        "TODO") target="todo" ;;
        "IN-PROGRESS"|"WIP"|"PROGRESS") target="wip" ;;
        "COMPLETED"|"DONE") target="done" ;;
        "RELEASED") target="released" ;;
        *)
            echo -e "${RED}❌ Invalid stage: $target_stage${NC}"
            echo "Valid stages: future, todo, in-progress/wip, completed/done, released"
            return 1
            ;;
    esac
    
    # Check if skipping forward or backward
    if [ "$current_stage" = "$(echo "$target_stage" | tr '[:lower:]' '[:upper:]')" ]; then
        echo -e "${YELLOW}⚠️  Task is already in $target_stage${NC}"
        return 0
    fi
    
    echo -e "${CYAN}Moving from $current_stage → $target_stage${NC}"
    
    # Use task-manager to move
    "$TASK_MANAGER" move "$pattern" "$target"
    
    # Handle file tracking
    if [ "$target" = "wip" ] && [ ! -f "$PROJECT_ROOT/.claude/file-tracking/current-task.txt" ]; then
        echo -e "${CYAN}Starting file tracking...${NC}"
        "$FILE_TRACKER" start "Task: $pattern" 2>/dev/null || true
    elif [ "$current_stage" = "IN-PROGRESS" ] && [ "$target" != "wip" ]; then
        echo -e "${YELLOW}Stopping file tracking...${NC}"
        "$FILE_TRACKER" stop 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✅ Task moved to $target_stage${NC}"
}

# Reopen a completed task
reopen_task() {
    local pattern="$1"
    
    echo -e "${CYAN}Reopening task: $pattern${NC}"
    
    # Find current stage
    current_stage=$(find_task_stage "$pattern")
    
    if [ "$current_stage" = "NOT_FOUND" ]; then
        echo -e "${RED}❌ Task not found: $pattern${NC}"
        return 1
    fi
    
    if [ "$current_stage" = "IN-PROGRESS" ] || [ "$current_stage" = "TODO" ]; then
        echo -e "${YELLOW}⚠️  Task is not completed (currently in $current_stage)${NC}"
        return 0
    fi
    
    echo -e "${CYAN}Moving from $current_stage → IN-PROGRESS${NC}"
    
    # Move to IN-PROGRESS
    "$TASK_MANAGER" move "$pattern" "wip"
    
    # Start file tracking
    echo -e "${CYAN}Restarting file tracking...${NC}"
    "$FILE_TRACKER" start "Reopened: $pattern" 2>/dev/null || true
    
    echo -e "${GREEN}✅ Task reopened and moved to IN-PROGRESS${NC}"
}

# Show task history/location
show_task_location() {
    local pattern="$1"
    
    echo -e "${CYAN}Searching for task: $pattern${NC}"
    echo ""
    
    found=false
    
    for stage in "FUTURE" "TODO" "IN-PROGRESS" "COMPLETED" "RELEASED"; do
        local file="${TASKS_DIR}/${stage}.md"
        if [ -f "$file" ]; then
            if grep -qi "$pattern" "$file"; then
                found=true
                echo -e "${GREEN}✓ Found in $stage:${NC}"
                grep -i "$pattern" "$file" | head -3
                echo ""
            fi
        fi
    done
    
    if [ "$found" = false ]; then
        echo -e "${RED}❌ Task not found in any stage${NC}"
        return 1
    fi
}

# Interactive undo menu
interactive_undo() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📋 Task Undo/Move Menu${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Show current tasks by stage
    echo -e "${BLUE}Current Tasks:${NC}"
    echo ""
    
    if [ -f "$IN_PROGRESS_FILE" ]; then
        echo -e "${YELLOW}IN-PROGRESS:${NC}"
        grep "^###" "$IN_PROGRESS_FILE" 2>/dev/null | sed 's/### /  - /' || echo "  (none)"
    fi
    
    if [ -f "$COMPLETED_FILE" ]; then
        echo -e "${GREEN}COMPLETED:${NC}"
        grep "^###" "$COMPLETED_FILE" 2>/dev/null | head -5 | sed 's/### /  - /' || echo "  (none)"
    fi
    
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo "  1. Undo last move (move task back one stage)"
    echo "  2. Reopen completed task"
    echo "  3. Skip to specific stage"
    echo "  4. Find task location"
    echo "  5. Exit"
    echo ""
    
    read -p "Select option (1-5): " choice
    
    case $choice in
        1)
            read -p "Enter task pattern to undo: " pattern
            undo_task "$pattern"
            ;;
        2)
            read -p "Enter completed task pattern to reopen: " pattern
            reopen_task "$pattern"
            ;;
        3)
            read -p "Enter task pattern: " pattern
            echo "Stages: future, todo, in-progress, completed, released"
            read -p "Enter target stage: " stage
            skip_to_stage "$pattern" "$stage"
            ;;
        4)
            read -p "Enter task pattern to find: " pattern
            show_task_location "$pattern"
            ;;
        5)
            echo "Exiting..."
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            ;;
    esac
}

# Show help
show_help() {
    echo -e "${CYAN}Task Undo/Downgrade Manager${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  ${GREEN}task-undo${NC} <command> [options]"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo -e "  ${GREEN}undo${NC} <pattern>           Move task back one stage"
    echo -e "  ${GREEN}back${NC} <pattern>           Same as undo"
    echo -e "  ${GREEN}reopen${NC} <pattern>         Reopen completed task"
    echo -e "  ${GREEN}skip${NC} <pattern> <stage>   Skip to specific stage"
    echo -e "  ${GREEN}find${NC} <pattern>           Find task location"
    echo -e "  ${GREEN}menu${NC}                     Interactive menu"
    echo ""
    echo -e "${YELLOW}Stages:${NC}"
    echo -e "  future → todo → in-progress → completed → released"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  ${GREEN}task-undo undo${NC} \"login bug\"     # Move back one stage"
    echo -e "  ${GREEN}task-undo reopen${NC} \"feature\"     # Reopen completed task"
    echo -e "  ${GREEN}task-undo skip${NC} \"api\" todo      # Move directly to TODO"
    echo -e "  ${GREEN}task-undo find${NC} \"database\"      # Find where task is"
    echo ""
    echo -e "${YELLOW}Stage Flow:${NC}"
    echo -e "  FUTURE ← TODO ← IN-PROGRESS ← COMPLETED ← RELEASED"
    echo -e "     ↓       ↓         ↓            ↓           ↓"
    echo -e "  [Ideas] [Planned] [Active]    [Done]    [Published]"
}

# Main command handling
case "${1:-help}" in
    undo|back)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: task-undo undo <pattern>${NC}"
            exit 1
        fi
        undo_task "$@"
        ;;
        
    reopen|restart)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: task-undo reopen <pattern>${NC}"
            exit 1
        fi
        reopen_task "$@"
        ;;
        
    skip|jump|move)
        shift
        if [ $# -lt 2 ]; then
            echo -e "${RED}❌ Usage: task-undo skip <pattern> <stage>${NC}"
            echo "Stages: future, todo, in-progress, completed, released"
            exit 1
        fi
        skip_to_stage "$1" "$2"
        ;;
        
    find|locate|where)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: task-undo find <pattern>${NC}"
            exit 1
        fi
        show_task_location "$@"
        ;;
        
    menu|interactive)
        interactive_undo
        ;;
        
    help|--help|-h)
        show_help
        ;;
        
    *)
        # If no command, try to undo the given pattern
        if [ $# -gt 0 ]; then
            undo_task "$@"
        else
            show_help
        fi
        ;;
esac