#!/bin/bash

# Simple task wrapper for AI agents
# Makes task-manager.sh easier to use

SCRIPT_DIR="$(dirname "$0")"
TASK_MANAGER="$SCRIPT_DIR/../tasks/scripts/task-manager.sh"

# If no arguments or help requested
if [ $# -eq 0 ] || [ "$1" = "help" ] || [ "$1" = "-h" ]; then
    echo "Task Management Tool"
    echo "==================="
    echo ""
    echo "Usage: task <command> [args]"
    echo ""
    echo "Quick Commands:"
    echo "  task add <description>     - Quick add (auto-detects priority/category)"
    echo "  task wip                   - Show in-progress tasks"
    echo "  task todo                  - Show TODO list"
    echo "  task done <pattern>        - Mark task as completed"
    echo "  task start <pattern>       - Move task to IN-PROGRESS"
    echo "  task stats                 - Show task statistics"
    echo ""
    echo "Examples:"
    echo "  task add 'Fix login bug'"
    echo "  task start login"
    echo "  task done login"
    echo ""
    exit 0
fi

# Handle shortcuts
case "$1" in
    "add")
        shift
        exec "$TASK_MANAGER" quick "$@"
        ;;
    "wip"|"progress"|"current")
        exec "$TASK_MANAGER" list wip
        ;;
    "todo"|"backlog")
        exec "$TASK_MANAGER" list todo
        ;;
    "done"|"complete"|"finish")
        shift
        exec "$TASK_MANAGER" move "$1" done
        ;;
    "start"|"begin"|"work")
        shift
        exec "$TASK_MANAGER" move "$1" wip
        ;;
    "stats"|"status"|"overview")
        exec "$TASK_MANAGER" stats
        ;;
    *)
        # Pass through to task-manager.sh
        exec "$TASK_MANAGER" "$@"
        ;;
esac