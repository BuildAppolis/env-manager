#!/bin/bash

# Task Manager - Project-wide command wrapper
# Provides short commands for task management

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Script paths
SCRIPTS_DIR="$(dirname "$0")/.claude/tasks/scripts"
TOOLS_DIR="$(dirname "$0")/.claude/tools"

# Ensure scripts are executable
chmod +x "$SCRIPTS_DIR"/*.sh 2>/dev/null

# Show help
show_help() {
    echo -e "${CYAN}Task Manager (tm) - Quick Commands${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  ${GREEN}tm${NC} <command> [options]"
    echo ""
    echo -e "${YELLOW}Task Commands:${NC}"
    echo -e "  ${GREEN}add${NC} <desc>         Add new task with plan"
    echo -e "  ${GREEN}start${NC} <pattern>    Start task (begins file tracking)"
    echo -e "  ${GREEN}update${NC} <pattern>   Update task progress"
    echo -e "  ${GREEN}done${NC} <pattern>     Complete task with summary"
    echo -e "  ${GREEN}undo${NC} <pattern>     Move task back one stage"
    echo -e "  ${GREEN}reopen${NC} <pattern>   Reopen completed task"
    echo -e "  ${GREEN}skip${NC} <pat> <stage> Skip to specific stage"
    echo -e "  ${GREEN}list${NC}               List all tasks"
    echo -e "  ${GREEN}wip${NC}                Show in-progress tasks"
    echo -e "  ${GREEN}todo${NC}               Show TODO tasks"
    echo -e "  ${GREEN}stats${NC}              Show statistics"
    echo ""
    echo -e "${YELLOW}File Tracking:${NC}"
    echo -e "  ${GREEN}files${NC}              Show tracked files"
    echo -e "  ${GREEN}track${NC} <file>       Track a file manually"
    echo -e "  ${GREEN}detect${NC}             Auto-detect file changes"
    echo ""
    echo -e "${YELLOW}Documentation:${NC}"
    echo -e "  ${GREEN}plan${NC} <desc>        Generate implementation plan"
    echo -e "  ${GREEN}summary${NC}            Generate task summary"
    echo -e "  ${GREEN}changelog${NC}          Generate changelog"
    echo -e "  ${GREEN}release${NC}            Prepare release"
    echo ""
    echo -e "${YELLOW}Configuration:${NC}"
    echo -e "  ${GREEN}config${NC}             Show configuration"
    echo -e "  ${GREEN}config-menu${NC}        Interactive config menu"
    echo -e "  ${GREEN}enable-all${NC}         Enable all features"
    echo -e "  ${GREEN}disable-claude${NC}     Disable AI features"
    echo ""
    echo -e "${YELLOW}Shortcuts:${NC}"
    echo -e "  ${GREEN}a${NC} = add       ${GREEN}s${NC} = start     ${GREEN}d${NC} = done"
    echo -e "  ${GREEN}l${NC} = list      ${GREEN}w${NC} = wip       ${GREEN}f${NC} = files"
    echo -e "  ${GREEN}c${NC} = config    ${GREEN}r${NC} = release   ${GREEN}u${NC} = undo"
    echo -e ""
    echo -e "${YELLOW}Smart Features:${NC}"
    echo -e "  ${GREEN}tm validate${NC}        Run code validation checks"
    echo -e "  ${GREEN}tm validate fix${NC}    Auto-fix validation issues"
    echo -e "  ${GREEN}tm undo${NC}            Undo last task movement"
    echo -e "  ${GREEN}tm undo --with-files${NC}  Undo with file reversion"
    echo -e "  ${GREEN}tm snapshot list${NC}   View git state snapshots"
    echo -e "  ${GREEN}tm search bug${NC}      Advanced search with ranking"
    echo -e "  ${GREEN}tm history${NC}         Show task movement history"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  ${GREEN}tm a${NC} \"Fix login bug\"      # Add task"
    echo -e "  ${GREEN}tm s${NC} login                # Start task"
    echo -e "  ${GREEN}tm d${NC} login                # Complete task"
    echo -e "  ${GREEN}tm w${NC}                      # Show what's in progress"
}

# Main command handling
case "${1:-help}" in
    # Task management
    add|a)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: tm add <description>${NC}"
            exit 1
        fi
        "$SCRIPTS_DIR/task-flow.sh" add "$@"
        ;;
        
    start|s)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: tm start <pattern>${NC}"
            exit 1
        fi
        "$SCRIPTS_DIR/task-flow.sh" start "$1"
        ;;
        
    update|u)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: tm update <pattern>${NC}"
            exit 1
        fi
        "$SCRIPTS_DIR/task-flow.sh" update "$1"
        ;;
        
    done|complete|d)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: tm done <pattern> [--force]${NC}"
            exit 1
        fi
        "$SCRIPTS_DIR/task-flow.sh" complete "$@"
        ;;
        
    # Quick task listing
    list|ls|l)
        "$SCRIPTS_DIR/task-manager.sh" list
        ;;
        
    wip|progress|w)
        "$SCRIPTS_DIR/task-manager.sh" list wip
        ;;
        
    todo|t)
        "$SCRIPTS_DIR/task-manager.sh" list todo
        ;;
        
    stats)
        "$SCRIPTS_DIR/task-manager.sh" stats
        ;;
        
    # File tracking
    files|f)
        "$SCRIPTS_DIR/file-tracker.sh" status
        ;;
        
    track)
        shift
        if [ $# -lt 2 ]; then
            echo -e "${RED}❌ Usage: tm track <file> <description>${NC}"
            exit 1
        fi
        "$SCRIPTS_DIR/file-tracker.sh" track "$1" "${@:2}"
        ;;
        
    detect)
        "$SCRIPTS_DIR/file-tracker.sh" detect
        ;;
        
    # Documentation
    plan|p)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: tm plan <description>${NC}"
            exit 1
        fi
        "$SCRIPTS_DIR/task-doc.sh" plan "$@"
        ;;
        
    summary)
        "$SCRIPTS_DIR/file-tracker.sh" summary
        ;;
        
    changelog)
        "$SCRIPTS_DIR/changelog-gen.sh" claude
        ;;
        
    release|r)
        "$SCRIPTS_DIR/task-flow.sh" release
        ;;
        
    # Configuration
    config|c)
        "$SCRIPTS_DIR/task-config.sh" show
        ;;
        
    config-menu|cm)
        "$SCRIPTS_DIR/task-config.sh" interactive
        ;;
        
    enable-all)
        "$SCRIPTS_DIR/task-config.sh" enable-all
        ;;
        
    disable-claude)
        "$SCRIPTS_DIR/task-config.sh" disable-claude
        ;;
        
    # Undo/Move commands
    undo|back|u)
        shift
        # Allow undo without pattern (uses last task)
        # Support --with-files and --no-files options
        "$SCRIPTS_DIR/task-undo.sh" undo "$@"
        ;;
        
    reopen|restart)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: tm reopen <pattern>${NC}"
            exit 1
        fi
        "$SCRIPTS_DIR/task-undo.sh" reopen "$@"
        ;;
        
    skip|jump)
        shift
        if [ $# -lt 2 ]; then
            echo -e "${RED}❌ Usage: tm skip <pattern> <stage>${NC}"
            echo "Stages: future, todo, in-progress, completed, released"
            exit 1
        fi
        "$SCRIPTS_DIR/task-undo.sh" skip "$1" "$2"
        ;;
        
    find|where)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: tm find <pattern>${NC}"
            exit 1
        fi
        "$SCRIPTS_DIR/task-undo.sh" find "$@"
        ;;
        
    # Validation management
    validate|validation|val|v)
        shift
        if [ $# -eq 0 ]; then
            "$SCRIPTS_DIR/task-validator.sh" check
        else
            "$SCRIPTS_DIR/task-validator.sh" "$@"
        fi
        ;;
        
    # Snapshot management
    snapshot|snap)
        shift
        if [ $# -eq 0 ]; then
            "$SCRIPTS_DIR/task-snapshot.sh" help
        else
            "$SCRIPTS_DIR/task-snapshot.sh" "$@"
        fi
        ;;
        
    # Advanced search
    search)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: tm search <pattern> [--all|--interactive]${NC}"
            exit 1
        fi
        "$SCRIPTS_DIR/task-search.sh" "$@"
        ;;
        
    # History commands
    history|hist)
        shift
        "$SCRIPTS_DIR/task-history.sh" ${1:-show} ${@:2}
        ;;
        
    # Full workflow
    flow)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: tm flow <description>${NC}"
            exit 1
        fi
        "$SCRIPTS_DIR/task-flow.sh" flow "$@"
        ;;
        
    # Help
    help|h|--help|-h)
        show_help
        ;;
        
    *)
        # Try to pass through to task-manager for other commands
        if [ -n "$1" ]; then
            # Check if it might be a quick add
            if [[ ! "$1" =~ ^- ]]; then
                # Assume it's a task description for quick add
                "$SCRIPTS_DIR/task-manager.sh" quick "$@"
            else
                echo -e "${RED}❌ Unknown command: $1${NC}"
                show_help
                exit 1
            fi
        else
            show_help
        fi
        ;;
esac