#!/bin/bash

# File Tracking System for Tasks
# Tracks all files modified during task implementation

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
TRACKING_DIR="$PROJECT_ROOT/.claude/file-tracking"
CURRENT_TASK_FILE="$TRACKING_DIR/current-task.txt"
FILES_LOG="$TRACKING_DIR/files-modified.log"
CONFIG_READER="$PROJECT_ROOT/.claude/tasks/scripts/config-reader.sh"

# Source config reader
if [ -f "$CONFIG_READER" ]; then
    source "$CONFIG_READER"
fi

# Ensure directories exist
mkdir -p "$TRACKING_DIR"

# Start tracking for a task
start_tracking() {
    local task_name="$1"
    
    # Check if file tracking is enabled
    if [ -f "$CONFIG_READER" ]; then
        if ! is_enabled ".fileTracking.enabled"; then
            echo -e "${YELLOW}File tracking is disabled in config${NC}"
            return 0
        fi
    fi
    
    echo -e "${CYAN}Starting file tracking for: $task_name${NC}"
    
    # Save current task
    echo "$task_name" > "$CURRENT_TASK_FILE"
    
    # Initialize files log for this task
    echo "# Files Modified for: $task_name" > "$FILES_LOG"
    echo "# Started: $(date +'%Y-%m-%d %H:%M:%S')" >> "$FILES_LOG"
    echo "---" >> "$FILES_LOG"
    
    # Take initial snapshot of git status
    if git status --porcelain > "$TRACKING_DIR/initial-status.txt" 2>/dev/null; then
        echo -e "${GREEN}✅ File tracking started${NC}"
        echo "Initial git status captured"
    fi
}

# Add file to tracking
track_file() {
    local file_path="$1"
    local description="$2"
    
    if [ ! -f "$CURRENT_TASK_FILE" ]; then
        echo -e "${RED}❌ No active task tracking${NC}"
        echo "Start tracking with: file-tracker start <task-name>"
        return 1
    fi
    
    # Add to log with timestamp
    echo "$(date +'%Y-%m-%d %H:%M:%S') | $file_path | $description" >> "$FILES_LOG"
    echo -e "${GREEN}✅ Tracked: $file_path${NC}"
}

# Auto-detect modified files
detect_changes() {
    if [ ! -f "$CURRENT_TASK_FILE" ]; then
        echo -e "${RED}❌ No active task tracking${NC}"
        return 1
    fi
    
    echo -e "${CYAN}Detecting file changes...${NC}"
    
    # Get current git status
    git status --porcelain > "$TRACKING_DIR/current-status.txt" 2>/dev/null
    
    # Compare with initial or last snapshot
    if [ -f "$TRACKING_DIR/initial-status.txt" ]; then
        # Find new or modified files
        while IFS= read -r line; do
            if [[ "$line" =~ ^[AM].(.+)$ ]]; then
                file="${BASH_REMATCH[1]}"
                file=$(echo "$file" | xargs)  # Trim whitespace
                
                # Check if already tracked
                if ! grep -q "$file" "$FILES_LOG" 2>/dev/null; then
                    echo "$(date +'%Y-%m-%d %H:%M:%S') | $file | Auto-detected change" >> "$FILES_LOG"
                    echo -e "  ${GREEN}+${NC} $file"
                fi
            fi
        done < "$TRACKING_DIR/current-status.txt"
    fi
    
    # Update snapshot
    cp "$TRACKING_DIR/current-status.txt" "$TRACKING_DIR/initial-status.txt"
}

# Show current tracking status
show_status() {
    if [ ! -f "$CURRENT_TASK_FILE" ]; then
        echo -e "${YELLOW}No active task tracking${NC}"
        return
    fi
    
    local task_name=$(cat "$CURRENT_TASK_FILE")
    echo -e "${CYAN}Current Task: $task_name${NC}"
    echo ""
    
    if [ -f "$FILES_LOG" ]; then
        echo -e "${BLUE}Files Modified:${NC}"
        grep "^[0-9]" "$FILES_LOG" | while IFS='|' read -r timestamp file description; do
            file=$(echo "$file" | xargs)
            description=$(echo "$description" | xargs)
            echo -e "  ${GREEN}•${NC} $file - $description"
        done
    else
        echo "No files tracked yet"
    fi
}

# Generate summary for task completion
generate_summary() {
    if [ ! -f "$CURRENT_TASK_FILE" ]; then
        echo -e "${RED}❌ No active task tracking${NC}"
        return 1
    fi
    
    local task_name=$(cat "$CURRENT_TASK_FILE")
    
    echo -e "${CYAN}File Modification Summary for: $task_name${NC}"
    echo ""
    
    # Auto-detect any final changes
    detect_changes > /dev/null 2>&1
    
    # Count total files
    local file_count=$(grep "^[0-9]" "$FILES_LOG" 2>/dev/null | wc -l)
    echo -e "${BLUE}Total files modified: $file_count${NC}"
    echo ""
    
    # Group files by extension
    echo -e "${BLUE}Files by type:${NC}"
    grep "^[0-9]" "$FILES_LOG" 2>/dev/null | cut -d'|' -f2 | xargs -I {} basename {} | \
        sed 's/.*\.//' | sort | uniq -c | while read count ext; do
        echo -e "  • .$ext: $count file(s)"
    done
    echo ""
    
    # List all files with descriptions
    echo -e "${BLUE}Detailed changes:${NC}"
    grep "^[0-9]" "$FILES_LOG" 2>/dev/null | while IFS='|' read -r timestamp file description; do
        file=$(echo "$file" | xargs)
        description=$(echo "$description" | xargs)
        echo -e "  • ${GREEN}$file${NC}"
        echo -e "    $description"
    done
    
    # Generate markdown summary
    echo ""
    echo -e "${YELLOW}Markdown Summary:${NC}"
    echo '```markdown'
    echo "**Files Changed:**"
    grep "^[0-9]" "$FILES_LOG" 2>/dev/null | while IFS='|' read -r timestamp file description; do
        file=$(echo "$file" | xargs)
        description=$(echo "$description" | xargs)
        echo "- \`$file\` - $description"
    done
    echo '```'
}

# Stop tracking and archive
stop_tracking() {
    if [ ! -f "$CURRENT_TASK_FILE" ]; then
        echo -e "${YELLOW}No active task tracking${NC}"
        return
    fi
    
    local task_name=$(cat "$CURRENT_TASK_FILE")
    
    # Generate final summary
    generate_summary
    
    # Archive the tracking data
    local archive_name="$TRACKING_DIR/archive/$(date +'%Y%m%d_%H%M%S')_${task_name//[^a-zA-Z0-9]/_}.log"
    mkdir -p "$TRACKING_DIR/archive"
    cp "$FILES_LOG" "$archive_name"
    
    # Clean up
    rm -f "$CURRENT_TASK_FILE" "$FILES_LOG" "$TRACKING_DIR/initial-status.txt" "$TRACKING_DIR/current-status.txt"
    
    echo ""
    echo -e "${GREEN}✅ Tracking stopped and archived to:${NC}"
    echo "   $archive_name"
}

# Integration with git hooks
setup_git_hook() {
    echo -e "${CYAN}Setting up git post-commit hook...${NC}"
    
    local hook_file="$PROJECT_ROOT/.git/hooks/post-commit"
    
    cat > "$hook_file" << 'EOF'
#!/bin/bash
# Auto-track file changes for active tasks

TRACKING_SCRIPT="$(git rev-parse --show-toplevel)/.claude/tasks/scripts/file-tracker.sh"

if [ -f "$TRACKING_SCRIPT" ]; then
    # Get list of files in this commit
    files=$(git diff-tree --no-commit-id --name-only -r HEAD)
    
    for file in $files; do
        "$TRACKING_SCRIPT" track "$file" "Committed in $(git rev-parse --short HEAD)"
    done
fi
EOF
    
    chmod +x "$hook_file"
    echo -e "${GREEN}✅ Git hook installed${NC}"
    echo "Files will be automatically tracked on commit"
}

# Show help
show_help() {
    echo -e "${CYAN}File Tracking System${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  ${GREEN}file-tracker${NC} <command> [options]"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo -e "  ${GREEN}start${NC} <task>       Start tracking for a task"
    echo -e "  ${GREEN}track${NC} <file> <desc> Add file to tracking"
    echo -e "  ${GREEN}detect${NC}             Auto-detect changed files"
    echo -e "  ${GREEN}status${NC}             Show current tracking status"
    echo -e "  ${GREEN}summary${NC}            Generate modification summary"
    echo -e "  ${GREEN}stop${NC}               Stop tracking and archive"
    echo -e "  ${GREEN}setup-hook${NC}         Setup git integration"
    echo ""
    echo -e "${YELLOW}Workflow:${NC}"
    echo -e "  1. Start tracking when beginning a task"
    echo -e "  2. Files are tracked automatically or manually"
    echo -e "  3. Generate summary when completing task"
    echo -e "  4. Stop tracking to archive the data"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  ${GREEN}file-tracker start${NC} \"Add user authentication\""
    echo -e "  ${GREEN}file-tracker track${NC} \"src/auth.ts\" \"Added auth logic\""
    echo -e "  ${GREEN}file-tracker detect${NC}"
    echo -e "  ${GREEN}file-tracker summary${NC}"
}

# Main command handling
case "${1:-help}" in
    start)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: file-tracker start <task-name>${NC}"
            exit 1
        fi
        start_tracking "$*"
        ;;
        
    track)
        shift
        if [ $# -lt 2 ]; then
            echo -e "${RED}❌ Usage: file-tracker track <file> <description>${NC}"
            exit 1
        fi
        track_file "$1" "${@:2}"
        ;;
        
    detect)
        detect_changes
        ;;
        
    status)
        show_status
        ;;
        
    summary)
        generate_summary
        ;;
        
    stop)
        stop_tracking
        ;;
        
    setup-hook)
        setup_git_hook
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