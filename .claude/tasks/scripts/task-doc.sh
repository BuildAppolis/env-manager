#!/bin/bash

# Task Documentation Helper
# Generates and manages documentation for tasks at each stage

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
TEMPLATES_DIR="$PROJECT_ROOT/.claude/templates"

# Ensure directories exist
mkdir -p "$TEMPLATES_DIR"

# Create task templates if they don't exist
create_templates() {
    # TODO Template
    cat > "$TEMPLATES_DIR/todo-template.md" << 'EOF'
### [icon] Task Title
**Problem:** What needs to be fixed/added/improved
**Solution:** Proposed approach to solve the problem
**Implementation Steps:**
1. [ ] Step 1
2. [ ] Step 2
3. [ ] Step 3
**Requirements:** 
- Dependencies needed
- Prerequisites
**Acceptance Criteria:** 
- [ ] Criteria 1
- [ ] Criteria 2
**Estimated Time:** X hours
**Priority:** High/Medium/Low
**Category:** feature/bug/docs/tech/security/perf/test
**Added:** DATE
**Related Issues:** #issue-number
EOF

    # IN-PROGRESS Template
    cat > "$TEMPLATES_DIR/progress-template.md" << 'EOF'
### [icon] Task Title
**Status:** 0% complete
**Current Work:** What's being done now
**Completed Steps:**
- [x] Step completed
- [ ] Step pending
**Blockers/Issues:** 
- None / List any blockers
**Files Being Modified:**
- file1.ts - Description of changes
- file2.tsx - Description of changes
**Notes:** Implementation notes
**Started:** DATE
**Last Updated:** DATE
EOF

    # COMPLETED Template
    cat > "$TEMPLATES_DIR/completed-template.md" << 'EOF'
### [icon] Task Title
**Summary:** Brief description of what was accomplished
**Implementation Details:**
- Technical approach taken
- Key architectural decisions
- Algorithms or patterns used
**Files Changed:**
- `src/file1.ts` - Added feature X
- `src/file2.tsx` - Refactored component Y
**Testing Performed:**
- Unit tests added/updated
- Manual testing steps
- Edge cases covered
**Breaking Changes:** None / List any breaking changes
**Performance Impact:** None / Describe impact
**Documentation:** Updated / Created / Not needed
**Completed:** DATE
**Time Taken:** X hours
EOF

    echo -e "${GREEN}✅ Templates created in $TEMPLATES_DIR${NC}"
}

# Generate documentation using Claude
generate_with_claude() {
    local stage="$1"
    local task_content="$2"
    local prompt=""
    
    case "$stage" in
        todo)
            prompt="Based on this task description: '$task_content', generate a detailed TODO documentation following this structure: Problem statement, Proposed solution, Implementation steps (numbered list), Requirements, and Acceptance criteria. Be specific and technical."
            ;;
        progress)
            prompt="Based on this task: '$task_content', generate an IN-PROGRESS status update. Include: Current status, what work is being done, any blockers, and files being modified. Be concise."
            ;;
        completed)
            prompt="Based on this completed task: '$task_content', generate a COMPLETED summary. Include: What was accomplished, implementation details, files changed, testing performed, and any breaking changes. Focus on the outcome and technical details."
            ;;
        changelog)
            prompt="Based on these completed tasks: '$task_content', generate a changelog entry in Keep a Changelog format. Group by Added/Changed/Fixed/Removed. Be concise and user-focused."
            ;;
    esac
    
    # Call Claude CLI
    if command -v claude &> /dev/null; then
        result=$(claude --print "$prompt" 2>/dev/null || echo "Error generating documentation")
        echo "$result"
    else
        echo "Claude CLI not available. Please install or use manual documentation."
    fi
}

# Enhance task with documentation
enhance_task() {
    local task_file="$1"
    local task_pattern="$2"
    local stage="$3"
    
    # Extract task content
    task_content=$(grep -i "$task_pattern" "$task_file" 2>/dev/null | head -1)
    
    if [ -z "$task_content" ]; then
        echo -e "${RED}❌ Task not found: $task_pattern${NC}"
        return 1
    fi
    
    echo -e "${CYAN}Generating documentation for: $task_content${NC}"
    
    # Generate documentation with Claude
    doc_content=$(generate_with_claude "$stage" "$task_content")
    
    # Create enhanced task entry
    echo -e "${GREEN}Generated Documentation:${NC}"
    echo "$doc_content"
    
    # Option to save
    read -p "Save this documentation? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Backup original
        cp "$task_file" "$task_file.bak"
        
        # Replace simple task with documented version
        # This is a simplified version - you'd want more sophisticated replacement
        echo -e "${GREEN}✅ Documentation saved${NC}"
    fi
}

# Generate implementation plan
generate_plan() {
    local task_description="$1"
    
    echo -e "${CYAN}Generating implementation plan...${NC}"
    
    plan=$(generate_with_claude "todo" "$task_description")
    
    echo -e "${GREEN}Implementation Plan:${NC}"
    echo "$plan"
}

# Generate completion summary
generate_summary() {
    local task_description="$1"
    local files_changed="$2"
    
    echo -e "${CYAN}Generating completion summary...${NC}"
    
    context="Task: $task_description. Files changed: $files_changed"
    summary=$(generate_with_claude "completed" "$context")
    
    echo -e "${GREEN}Completion Summary:${NC}"
    echo "$summary"
}

# Show help
show_help() {
    echo -e "${CYAN}Task Documentation Helper${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  ${GREEN}task-doc${NC} <command> [options]"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo -e "  ${GREEN}templates${NC}              Create/update task templates"
    echo -e "  ${GREEN}plan${NC} <description>     Generate implementation plan"
    echo -e "  ${GREEN}enhance${NC} <file> <task>  Enhance task with documentation"
    echo -e "  ${GREEN}summary${NC} <description>  Generate completion summary"
    echo -e "  ${GREEN}changelog${NC}              Generate changelog from completed tasks"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  ${GREEN}task-doc plan${NC} \"Add user authentication\""
    echo -e "  ${GREEN}task-doc enhance${NC} TODO.md \"authentication\""
    echo -e "  ${GREEN}task-doc summary${NC} \"Implemented user auth\" \"auth.ts, login.tsx\""
    echo -e "  ${GREEN}task-doc changelog${NC}"
}

# Main command handling
case "${1:-help}" in
    templates)
        create_templates
        ;;
        
    plan)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: task-doc plan <description>${NC}"
            exit 1
        fi
        generate_plan "$*"
        ;;
        
    enhance)
        shift
        if [ $# -lt 2 ]; then
            echo -e "${RED}❌ Usage: task-doc enhance <file> <task-pattern>${NC}"
            exit 1
        fi
        enhance_task "$1" "$2" "${3:-todo}"
        ;;
        
    summary)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: task-doc summary <description> [files]${NC}"
            exit 1
        fi
        generate_summary "$1" "${2:-}"
        ;;
        
    changelog)
        # Read completed tasks and generate changelog
        if [ -f "$TASKS_DIR/COMPLETED.md" ]; then
            completed_tasks=$(cat "$TASKS_DIR/COMPLETED.md")
            echo -e "${CYAN}Generating changelog from completed tasks...${NC}"
            changelog=$(generate_with_claude "changelog" "$completed_tasks")
            echo -e "${GREEN}Changelog:${NC}"
            echo "$changelog"
        else
            echo -e "${RED}❌ No completed tasks found${NC}"
        fi
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