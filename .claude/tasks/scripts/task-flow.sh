#!/bin/bash

# Integrated Task Flow with Full Documentation
# Manages the complete lifecycle: TODO → IN-PROGRESS → COMPLETED → RELEASED

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
CHANGELOG_GEN="$TOOLS_DIR/changelog-gen.sh"
CONFIG_READER="$TOOLS_DIR/config-reader.sh"

# Source config reader
source "$CONFIG_READER"

# Ensure scripts are executable
chmod +x "$TASK_MANAGER" "$FILE_TRACKER" "$TASK_DOC" "$CHANGELOG_GEN" 2>/dev/null

# Add new task with full documentation
add_task() {
    local description="$*"
    
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📝 Adding New Task${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Quick add to TODO
    "$TASK_MANAGER" quick "$description"
    
    # Generate implementation plan with Claude (if enabled)
    if is_enabled ".taskDocumentation.claudeAssisted" && is_enabled ".documentation.generatePlans"; then
        echo ""
        read -p "Generate detailed implementation plan? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${CYAN}Generating plan with Claude...${NC}"
        
        plan=$(claude --print "Create a technical implementation plan for: $description
        
        Include:
        1. Problem Statement (1-2 sentences)
        2. Solution Approach (2-3 sentences)  
        3. Implementation Steps (3-5 numbered steps)
        4. Key Requirements/Dependencies
        5. Acceptance Criteria (2-3 checkable items)
        
        Be concise and technical. Format as markdown." 2>/dev/null || echo "")
        
        if [ ! -z "$plan" ]; then
            echo -e "${GREEN}Implementation Plan:${NC}"
            echo "$plan"
            
            # Save to task notes
            echo ""
            echo -e "${CYAN}Plan will be saved with the task${NC}"
        fi
        fi
    fi
}

# Start working on task
start_task() {
    local pattern="$1"
    
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}🚀 Starting Task${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Move to IN-PROGRESS
    "$TASK_MANAGER" move "$pattern" wip
    
    # Start file tracking (if enabled)
    if is_enabled ".fileTracking.enabled" && is_enabled ".taskDocumentation.autoTrackFiles"; then
        echo ""
        echo -e "${CYAN}Starting file tracking...${NC}"
        "$FILE_TRACKER" start "Task: $pattern"
    fi
    
    # Show tips
    echo ""
    echo -e "${YELLOW}Tips:${NC}"
    echo -e "  • Files will be tracked automatically as you work"
    echo -e "  • Use ${GREEN}task-flow update \"$pattern\"${NC} to update progress"
    echo -e "  • Use ${GREEN}task-flow files${NC} to see modified files"
}

# Update task progress
update_task() {
    local pattern="$1"
    
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📊 Update Progress${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Auto-detect file changes (if enabled)
    if is_enabled ".fileTracking.enabled" && is_enabled ".taskDocumentation.autoDetectChanges"; then
        "$FILE_TRACKER" detect
    fi
    
    # Show current status
    echo ""
    "$FILE_TRACKER" status
    
    # Get progress update
    echo ""
    echo "Progress percentage (0-100):"
    read -r progress
    
    echo "What are you currently working on?"
    read -r current_work
    
    echo "Any blockers? (press Enter if none):"
    read -r blockers
    
    # Generate status update
    update_text="**Status Update** ($(date +'%Y-%m-%d %H:%M'))
- Progress: ${progress}%
- Current: $current_work
- Blockers: ${blockers:-None}"
    
    echo ""
    echo -e "${GREEN}Status updated:${NC}"
    echo "$update_text"
}

# Complete task with full documentation
complete_task() {
    local pattern="$1"
    local force_flag="$2"
    
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}✅ Completing Task${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Run validation before completion
    TASK_VALIDATOR="$TOOLS_DIR/task-validator.sh"
    if [ -f "$TASK_VALIDATOR" ] && [ "$force_flag" != "--force" ]; then
        echo -e "${CYAN}Running pre-completion validation...${NC}"
        if ! "$TASK_VALIDATOR" pre-complete; then
            echo ""
            echo -e "${RED}❌ Validation failed!${NC}"
            echo -e "${YELLOW}Options:${NC}"
            echo "  1. Fix the issues and try again"
            echo "  2. Run 'tm done \"$pattern\" --force' to skip validation"
            echo "  3. Run 'tm validate fix' to attempt auto-fix"
            return 1
        fi
        echo ""
    elif [ "$force_flag" == "--force" ]; then
        echo -e "${YELLOW}⚠️  Skipping validation (--force flag used)${NC}"
        echo ""
    fi
    
    # Auto-detect final changes
    "$FILE_TRACKER" detect
    
    # Generate file summary
    echo -e "${CYAN}File Modification Summary:${NC}"
    "$FILE_TRACKER" summary
    
    # Get completion details
    echo ""
    echo "Brief summary of what was accomplished:"
    read -r summary
    
    echo "Key technical decisions or approaches:"
    read -r technical_notes
    
    echo "How was it tested?"
    read -r testing
    
    echo "Any breaking changes? (y/n):"
    read -n 1 -r breaking
    echo
    
    # Generate completion documentation with Claude (if enabled)
    if is_enabled ".taskDocumentation.claudeAssisted" && is_enabled ".taskDocumentation.generateSummaries"; then
        echo ""
        echo -e "${CYAN}Generating completion documentation...${NC}"
    
    # Get file list from tracker
    files_modified=$("$FILE_TRACKER" summary | grep "^  • " | cut -d' ' -f3- | paste -sd "," -)
    
    completion_prompt="Generate a COMPLETED task documentation for:
    Task: $pattern
    Summary: $summary
    Technical: $technical_notes
    Files Modified: $files_modified
    Testing: $testing
    Breaking Changes: $([[ $breaking =~ ^[Yy]$ ]] && echo "Yes" || echo "No")
    
    Format as structured markdown with sections:
    - Summary
    - Implementation Details
    - Files Changed (with descriptions)
    - Testing Performed
    - Breaking Changes (if any)"
    
    completion_doc=$(claude --print "$completion_prompt" 2>/dev/null || echo "")
    
    if [ ! -z "$completion_doc" ]; then
        echo -e "${GREEN}Completion Documentation:${NC}"
        echo "$completion_doc"
    fi
    fi
    
    # Stop file tracking
    echo ""
    "$FILE_TRACKER" stop
    
    # Move to COMPLETED
    "$TASK_MANAGER" move "$pattern" done
    
    echo ""
    echo -e "${GREEN}✅ Task completed and documented!${NC}"
}

# Show tracked files
show_files() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📁 Files Modified${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    "$FILE_TRACKER" status
}

# Full workflow demo
full_flow() {
    local description="$*"
    
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}🔄 Full Task Workflow${NC}"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Step 1: Add task
    add_task "$description"
    
    echo ""
    read -p "Press Enter to start working on this task..."
    
    # Step 2: Start task
    start_task "$description"
    
    echo ""
    echo -e "${YELLOW}Simulate some work...${NC}"
    echo "You can now make changes to files."
    echo "Files will be tracked automatically."
    echo ""
    read -p "Press Enter when ready to complete the task..."
    
    # Step 3: Complete task
    complete_task "$description"
    
    echo ""
    echo -e "${MAGENTA}Workflow complete!${NC}"
}

# Generate release
prepare_release() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📦 Prepare Release${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Show completed tasks
    echo -e "${CYAN}Completed tasks to release:${NC}"
    "$TASK_MANAGER" list done
    
    # Generate changelog
    echo ""
    read -p "Generate changelog? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        "$CHANGELOG_GEN" claude
    fi
    
    # Move tasks to RELEASED
    echo ""
    read -p "Move tasks to RELEASED? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        "$TOOLS_DIR/release-tasks.sh"
    fi
}

# Show help
show_help() {
    echo -e "${CYAN}Integrated Task Flow with Documentation${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  ${GREEN}task-flow${NC} <command> [options]"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo -e "  ${GREEN}add${NC} <desc>         Add new task with plan"
    echo -e "  ${GREEN}start${NC} <pattern>    Start task with file tracking"
    echo -e "  ${GREEN}update${NC} <pattern>   Update task progress"
    echo -e "  ${GREEN}complete${NC} <pattern> Complete task with summary"
    echo -e "  ${GREEN}files${NC}              Show tracked files"
    echo -e "  ${GREEN}flow${NC} <desc>        Full workflow demo"
    echo -e "  ${GREEN}release${NC}            Prepare release"
    echo ""
    echo -e "${YELLOW}Quick Access:${NC}"
    echo -e "  ${GREEN}list${NC}               List all tasks"
    echo -e "  ${GREEN}wip${NC}                Show in-progress"
    echo -e "  ${GREEN}done${NC}               Show completed"
    echo -e "  ${GREEN}stats${NC}              Show statistics"
    echo ""
    echo -e "${YELLOW}Workflow:${NC}"
    echo -e "  1. ${GREEN}add${NC} - Create task with implementation plan"
    echo -e "  2. ${GREEN}start${NC} - Begin work with file tracking"
    echo -e "  3. ${GREEN}update${NC} - Track progress (optional)"
    echo -e "  4. ${GREEN}complete${NC} - Finish with documentation"
    echo -e "  5. ${GREEN}release${NC} - Generate changelog and release"
    echo ""
    echo -e "${YELLOW}Features:${NC}"
    echo -e "  • Automatic file tracking"
    echo -e "  • Claude-assisted documentation"
    echo -e "  • Progress tracking"
    echo -e "  • Changelog generation"
    echo -e "  • Version comparison links"
}

# Main command handling
case "${1:-help}" in
    add)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: task-flow add <description>${NC}"
            exit 1
        fi
        add_task "$@"
        ;;
        
    start)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: task-flow start <pattern>${NC}"
            exit 1
        fi
        start_task "$1"
        ;;
        
    update)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: task-flow update <pattern>${NC}"
            exit 1
        fi
        update_task "$1"
        ;;
        
    complete|done)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: task-flow complete <pattern>${NC}"
            exit 1
        fi
        complete_task "$1"
        ;;
        
    files)
        show_files
        ;;
        
    flow|demo)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: task-flow flow <description>${NC}"
            exit 1
        fi
        full_flow "$@"
        ;;
        
    release)
        prepare_release
        ;;
        
    # Quick commands
    list|ls)
        "$TASK_MANAGER" list
        ;;
        
    wip|progress)
        "$TASK_MANAGER" list wip
        ;;
        
    done|completed)
        "$TASK_MANAGER" list done
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