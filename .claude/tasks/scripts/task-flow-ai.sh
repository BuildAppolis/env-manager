#!/bin/bash

# AI-Friendly Task Flow Script
# Improved version with better non-interactive support

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
TOOLS_DIR="$PROJECT_ROOT/.claude/tasks/scripts"
TASKS_DIR="$PROJECT_ROOT/.claude/tasks"

# Tool scripts
TASK_MANAGER="$TOOLS_DIR/task-manager.sh"
FILE_TRACKER="$TOOLS_DIR/file-tracker.sh"
TASK_DOC="$TOOLS_DIR/task-doc.sh"
TASK_VALIDATOR="$TOOLS_DIR/task-validator.sh"

# Function to check if input is coming from pipe/redirect
is_interactive() {
    [ -t 0 ]
}

# Quick complete - for AI/CLI usage
quick_complete() {
    local pattern="$1"
    local summary="${2:-Task completed}"
    local force_flag="$3"
    
    # Handle --force flag
    if [[ "$summary" == "--force" ]]; then
        force_flag="--force"
        summary="Task completed"
    fi
    
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}✅ Quick Complete: $pattern${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Skip validation if already done recently or force flag
    if [ "$force_flag" != "--force" ] && [ -f "$TASK_VALIDATOR" ]; then
        # Check if validation cache exists and is recent (< 5 min)
        if [ -f "$TASKS_DIR/.validation-cache" ]; then
            local cache_age=$(( $(date +%s) - $(stat -c %Y "$TASKS_DIR/.validation-cache" 2>/dev/null || echo 0) ))
            if [ $cache_age -gt 300 ]; then
                echo -e "${CYAN}Running validation...${NC}"
                if ! "$TASK_VALIDATOR" pre-complete; then
                    echo -e "${RED}❌ Validation failed!${NC}"
                    echo "Use --force to skip validation"
                    return 1
                fi
            else
                echo -e "${GREEN}✓ Using cached validation (${cache_age}s old)${NC}"
            fi
        else
            echo -e "${CYAN}Running validation...${NC}"
            if ! "$TASK_VALIDATOR" pre-complete; then
                echo -e "${RED}❌ Validation failed!${NC}"
                echo "Use --force to skip validation"
                return 1
            fi
        fi
    fi
    
    # Stop file tracking if active
    "$FILE_TRACKER" stop 2>/dev/null || true
    
    # Move task to completed with summary
    echo -e "${CYAN}Summary:${NC} $summary"
    
    # Move the task
    "$TASK_MANAGER" move "$pattern" done "$force_flag"
    
    echo -e "${GREEN}✅ Task completed successfully${NC}"
}

# Interactive complete - original behavior
interactive_complete() {
    local pattern="$1"
    local force_flag="$2"
    
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}✅ Interactive Complete: $pattern${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Validation (only once)
    if [ "$force_flag" != "--force" ] && [ -f "$TASK_VALIDATOR" ]; then
        echo -e "${CYAN}Running validation...${NC}"
        if ! "$TASK_VALIDATOR" pre-complete; then
            echo -e "${RED}❌ Validation failed!${NC}"
            return 1
        fi
    fi
    
    # File summary
    echo -e "${CYAN}File Modification Summary:${NC}"
    "$FILE_TRACKER" summary
    
    # Get details interactively
    echo ""
    read -p "Summary: " summary
    read -p "Technical notes (optional): " technical
    read -p "Testing performed (optional): " testing
    read -p "Breaking changes? (y/N): " -n 1 breaking
    echo
    
    # Stop tracking
    "$FILE_TRACKER" stop 2>/dev/null || true
    
    # Move task
    "$TASK_MANAGER" move "$pattern" done "$force_flag"
    
    # Log details if provided
    if [ -n "$technical" ] || [ -n "$testing" ]; then
        echo -e "${CYAN}Details logged:${NC}"
        [ -n "$technical" ] && echo "  Technical: $technical"
        [ -n "$testing" ] && echo "  Testing: $testing"
        [ "$breaking" = "y" ] && echo "  ⚠️  Breaking changes: YES"
    fi
    
    echo -e "${GREEN}✅ Task completed${NC}"
}

# Smart complete - detects mode based on input
smart_complete() {
    local pattern="$1"
    shift
    
    # If we have a summary argument or stdin is not a terminal, use quick mode
    if [ $# -gt 0 ] || ! is_interactive; then
        # Check if input is from pipe
        if ! is_interactive && [ $# -eq 0 ]; then
            # Read summary from stdin
            local summary
            read -r summary
            quick_complete "$pattern" "$summary" "$@"
        else
            # Use provided arguments
            quick_complete "$pattern" "$@"
        fi
    else
        # Interactive mode
        interactive_complete "$pattern" "$@"
    fi
}

# Start task with file tracking
start_task() {
    local pattern="$1"
    
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}🚀 Starting Task${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Move task to IN-PROGRESS
    "$TASK_MANAGER" move "$pattern" wip
    
    # Start file tracking
    "$FILE_TRACKER" start "$pattern"
    
    echo -e "${GREEN}✅ Task started with file tracking${NC}"
}

# Add task - simplified
add_task() {
    local description="$*"
    
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📝 Adding Task${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    "$TASK_MANAGER" quick "$description"
    
    echo -e "${GREEN}✅ Task added${NC}"
}

# Update task progress
update_task() {
    local pattern="$1"
    local update="${2:-Progress update}"
    
    echo -e "${CYAN}📝 Updating: $pattern${NC}"
    echo -e "${BLUE}Update: $update${NC}"
    
    # Detect changes if file tracking is active
    "$FILE_TRACKER" detect 2>/dev/null || true
    
    echo -e "${GREEN}✅ Progress updated${NC}"
}

# Help text
show_help() {
    echo -e "${CYAN}AI-Friendly Task Flow${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  ${GREEN}task-flow-ai${NC} <command> [options]"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo -e "  ${GREEN}add${NC} <description>         Add new task"
    echo -e "  ${GREEN}start${NC} <pattern>           Start task with tracking"
    echo -e "  ${GREEN}update${NC} <pattern> [text]   Update progress"
    echo -e "  ${GREEN}complete${NC} <pattern> [summary] [--force]"
    echo -e "                            Complete task (auto-detects mode)"
    echo -e "  ${GREEN}quick${NC} <pattern> <summary> Quick complete without prompts"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  # Quick complete with summary"
    echo -e "  task-flow-ai complete 'login' 'Fixed login bug'"
    echo -e "  "
    echo -e "  # Pipe summary"
    echo -e "  echo 'Fixed critical security issue' | task-flow-ai complete 'security'"
    echo -e "  "
    echo -e "  # Interactive mode (no arguments)"
    echo -e "  task-flow-ai complete 'feature'"
    echo -e "  "
    echo -e "  # Force completion (skip validation)"
    echo -e "  task-flow-ai complete 'task' --force"
}

# Main command handling
case "${1:-help}" in
    add)
        shift
        add_task "$@"
        ;;
    
    start)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}Usage: task-flow-ai start <pattern>${NC}"
            exit 1
        fi
        start_task "$1"
        ;;
    
    update)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}Usage: task-flow-ai update <pattern> [message]${NC}"
            exit 1
        fi
        update_task "$@"
        ;;
    
    complete|done)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}Usage: task-flow-ai complete <pattern> [summary] [--force]${NC}"
            exit 1
        fi
        smart_complete "$@"
        ;;
    
    quick)
        shift
        if [ $# -lt 2 ]; then
            echo -e "${RED}Usage: task-flow-ai quick <pattern> <summary>${NC}"
            exit 1
        fi
        quick_complete "$@"
        ;;
    
    help|--help|-h|*)
        show_help
        ;;
esac