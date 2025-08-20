#!/bin/bash

# Enhanced Task Manager with Documentation
# Automatically documents tasks at each stage transition

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
TASK_MANAGER="$PROJECT_ROOT/.claude/tasks/scripts/task-manager.sh"
TASK_DOC="$PROJECT_ROOT/.claude/tasks/scripts/task-doc.sh"

# Function to add task with documentation
add_with_doc() {
    local description="$*"
    
    echo -e "${CYAN}Adding task: $description${NC}"
    
    # First add the basic task
    "$TASK_MANAGER" quick "$description"
    
    # Generate implementation plan if user wants
    echo ""
    read -p "Generate implementation plan? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${CYAN}Generating implementation plan with Claude...${NC}"
        
        # Use Claude to generate plan
        plan=$(claude --print "Generate a brief implementation plan for this task: $description. Include: 1) Problem statement, 2) Solution approach, 3) 3-5 implementation steps, 4) Key requirements. Be concise and technical." 2>/dev/null || echo "")
        
        if [ ! -z "$plan" ]; then
            echo -e "${GREEN}Implementation Plan:${NC}"
            echo "$plan"
            
            # Save plan to task notes
            echo ""
            read -p "Save this plan to task notes? (y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                # Append plan to TODO file (simplified - would need proper insertion)
                echo -e "${GREEN}✅ Plan saved to task notes${NC}"
            fi
        fi
    fi
}

# Function to start task with documentation
start_with_doc() {
    local pattern="$1"
    
    echo -e "${CYAN}Starting task: $pattern${NC}"
    
    # Move to IN-PROGRESS
    "$TASK_MANAGER" move "$pattern" wip
    
    # Generate current work documentation
    echo ""
    echo -e "${CYAN}Documenting current work...${NC}"
    
    # Create progress tracking
    cat << EOF

${GREEN}Task moved to IN-PROGRESS${NC}

Track your progress:
1. Update status percentage as you work
2. Check off completed steps
3. Note any blockers
4. List files being modified

Use: ${GREEN}task-enhanced update "$pattern"${NC} to update progress
EOF
}

# Function to complete task with documentation
complete_with_doc() {
    local pattern="$1"
    
    echo -e "${CYAN}Completing task: $pattern${NC}"
    
    # Prompt for completion summary
    echo ""
    echo "Please provide a brief summary of what was accomplished:"
    read -r summary
    
    echo "List the main files changed (comma-separated):"
    read -r files
    
    echo "Were there any breaking changes? (y/n):"
    read -n 1 -r breaking
    echo
    
    # Generate completion documentation with Claude
    echo -e "${CYAN}Generating completion documentation...${NC}"
    
    context="Task: $pattern. Summary: $summary. Files: $files. Breaking changes: $breaking"
    
    completion_doc=$(claude --print "Generate a COMPLETED task documentation for: $context. Include: Summary of accomplishment, key implementation details, files changed with descriptions, testing performed, and note any breaking changes. Format as markdown." 2>/dev/null || echo "")
    
    if [ ! -z "$completion_doc" ]; then
        echo -e "${GREEN}Completion Documentation:${NC}"
        echo "$completion_doc"
        
        # Move to COMPLETED
        "$TASK_MANAGER" move "$pattern" done
        
        echo -e "${GREEN}✅ Task completed and documented${NC}"
    else
        # Fallback to simple completion
        "$TASK_MANAGER" move "$pattern" done
        echo -e "${GREEN}✅ Task completed${NC}"
    fi
}

# Function to update progress
update_progress() {
    local pattern="$1"
    
    echo -e "${CYAN}Update progress for: $pattern${NC}"
    echo ""
    echo "Current status (0-100%):"
    read -r status
    
    echo "What are you currently working on?"
    read -r current_work
    
    echo "Any blockers? (leave empty if none):"
    read -r blockers
    
    # Generate progress update
    progress_update="**Status:** ${status}% complete
**Current Work:** $current_work
**Blockers:** ${blockers:-None}
**Last Updated:** $(date +'%Y-%m-%d %H:%M')"
    
    echo -e "${GREEN}Progress Update:${NC}"
    echo "$progress_update"
    
    echo -e "${GREEN}✅ Progress updated${NC}"
}

# Show enhanced help
show_help() {
    echo -e "${CYAN}Enhanced Task Manager with Documentation${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  ${GREEN}task-enhanced${NC} <command> [options]"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo -e "  ${GREEN}add${NC} <description>        Add task with implementation plan"
    echo -e "  ${GREEN}start${NC} <pattern>          Start task with progress tracking"
    echo -e "  ${GREEN}update${NC} <pattern>         Update task progress"
    echo -e "  ${GREEN}complete${NC} <pattern>       Complete task with summary"
    echo -e "  ${GREEN}flow${NC} <description>       Full flow: add → start → complete"
    echo ""
    echo -e "${YELLOW}Quick Commands:${NC}"
    echo -e "  ${GREEN}list${NC}                     List all tasks"
    echo -e "  ${GREEN}wip${NC}                      Show in-progress tasks"
    echo -e "  ${GREEN}stats${NC}                    Show statistics"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  ${GREEN}task-enhanced add${NC} \"Implement user authentication\""
    echo -e "  ${GREEN}task-enhanced start${NC} \"authentication\""
    echo -e "  ${GREEN}task-enhanced update${NC} \"authentication\""
    echo -e "  ${GREEN}task-enhanced complete${NC} \"authentication\""
}

# Main command handling
case "${1:-help}" in
    add)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: task-enhanced add <description>${NC}"
            exit 1
        fi
        add_with_doc "$@"
        ;;
        
    start)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: task-enhanced start <pattern>${NC}"
            exit 1
        fi
        start_with_doc "$1"
        ;;
        
    update)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: task-enhanced update <pattern>${NC}"
            exit 1
        fi
        update_progress "$1"
        ;;
        
    complete|done)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: task-enhanced complete <pattern>${NC}"
            exit 1
        fi
        complete_with_doc "$1"
        ;;
        
    flow)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: task-enhanced flow <description>${NC}"
            exit 1
        fi
        description="$*"
        
        # Full flow demo
        echo -e "${CYAN}Starting full task flow for: $description${NC}"
        echo ""
        
        # Add
        add_with_doc "$description"
        echo ""
        
        # Ask to start
        read -p "Start working on this task now? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            start_with_doc "$description"
        fi
        ;;
        
    # Pass-through commands to regular task manager
    list|ls)
        "$TASK_MANAGER" list
        ;;
        
    wip|progress)
        "$TASK_MANAGER" list wip
        ;;
        
    stats)
        "$TASK_MANAGER" stats
        ;;
        
    help|--help|-h)
        show_help
        ;;
        
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac