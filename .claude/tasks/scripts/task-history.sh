#!/bin/bash

# Task History Manager
# Tracks all task movements and provides smart undo

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Project paths
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
TASKS_DIR="$PROJECT_ROOT/.claude/tasks"
HISTORY_FILE="$TASKS_DIR/.task-history.log"
LAST_TASK_FILE="$TASKS_DIR/.last-task"

# Ensure history file exists
touch "$HISTORY_FILE" 2>/dev/null || true

# Log a task movement
log_movement() {
    local action="$1"
    local task="$2"
    local from_stage="$3"
    local to_stage="$4"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Log to history
    echo "$timestamp|$action|$task|$from_stage|$to_stage" >> "$HISTORY_FILE"
    
    # Update last task
    echo "$task|$to_stage" > "$LAST_TASK_FILE"
}

# Get the last modified task
get_last_task() {
    if [ -f "$LAST_TASK_FILE" ]; then
        cat "$LAST_TASK_FILE" | cut -d'|' -f1
    else
        # Fallback to history file
        tail -1 "$HISTORY_FILE" 2>/dev/null | cut -d'|' -f3
    fi
}

# Get recent history
get_recent_history() {
    local limit="${1:-10}"
    
    if [ ! -f "$HISTORY_FILE" ]; then
        echo "No history found"
        return
    fi
    
    echo -e "${CYAN}Recent Task Movements:${NC}"
    echo ""
    
    tail -"$limit" "$HISTORY_FILE" | tac | while IFS='|' read -r timestamp action task from_stage to_stage; do
        case "$action" in
            "ADD")
                echo -e "${GREEN}+ $timestamp${NC} Added \"$task\" to $to_stage"
                ;;
            "MOVE")
                echo -e "${BLUE}→ $timestamp${NC} Moved \"$task\" from $from_stage to $to_stage"
                ;;
            "DELETE")
                echo -e "${RED}✗ $timestamp${NC} Deleted \"$task\" from $from_stage"
                ;;
            *)
                echo "  $timestamp $action \"$task\""
                ;;
        esac
    done
}

# Search history for a task
search_history() {
    local pattern="$1"
    
    if [ ! -f "$HISTORY_FILE" ]; then
        echo "No history found"
        return
    fi
    
    echo -e "${CYAN}History for tasks matching '$pattern':${NC}"
    echo ""
    
    grep -i "$pattern" "$HISTORY_FILE" | tail -20 | while IFS='|' read -r timestamp action task from_stage to_stage; do
        echo "$timestamp: $action \"$task\" ($from_stage → $to_stage)"
    done
}

# Show task timeline
show_timeline() {
    local task_pattern="$1"
    
    echo -e "${CYAN}Task Timeline for '$task_pattern':${NC}"
    echo ""
    
    grep -i "$task_pattern" "$HISTORY_FILE" | while IFS='|' read -r timestamp action task from_stage to_stage; do
        case "$to_stage" in
            "FUTURE") color=$MAGENTA ;;
            "TODO") color=$YELLOW ;;
            "IN-PROGRESS") color=$BLUE ;;
            "COMPLETED") color=$GREEN ;;
            "RELEASED") color=$CYAN ;;
            *) color=$NC ;;
        esac
        echo -e "$timestamp ${color}→ $to_stage${NC} ($action)"
    done
}

# Clean old history (keep last N entries)
clean_history() {
    local keep="${1:-1000}"
    
    if [ -f "$HISTORY_FILE" ]; then
        tail -"$keep" "$HISTORY_FILE" > "$HISTORY_FILE.tmp"
        mv "$HISTORY_FILE.tmp" "$HISTORY_FILE"
        echo -e "${GREEN}✅ History cleaned, kept last $keep entries${NC}"
    fi
}

# Export functions for use by other scripts
export -f log_movement
export -f get_last_task

# If called directly
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    case "${1:-show}" in
        log)
            shift
            log_movement "$@"
            ;;
        last)
            get_last_task
            ;;
        show|recent)
            shift
            get_recent_history "${1:-10}"
            ;;
        search)
            shift
            if [ $# -eq 0 ]; then
                echo -e "${RED}❌ Usage: task-history search <pattern>${NC}"
                exit 1
            fi
            search_history "$@"
            ;;
        timeline)
            shift
            if [ $# -eq 0 ]; then
                echo -e "${RED}❌ Usage: task-history timeline <pattern>${NC}"
                exit 1
            fi
            show_timeline "$@"
            ;;
        clean)
            shift
            clean_history "${1:-1000}"
            ;;
        *)
            echo -e "${CYAN}Task History Manager${NC}"
            echo ""
            echo "Usage: task-history <command> [options]"
            echo ""
            echo "Commands:"
            echo "  show [N]        Show last N movements (default: 10)"
            echo "  last            Get last modified task"
            echo "  search <pat>    Search history for pattern"
            echo "  timeline <pat>  Show task timeline"
            echo "  clean [N]       Keep only last N entries"
            ;;
    esac
fi