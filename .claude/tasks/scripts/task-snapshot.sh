#!/bin/bash

# Task Snapshot Manager
# Captures git state when tasks move and allows reverting changes

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
SNAPSHOTS_DIR="$PROJECT_ROOT/.claude/tasks/.snapshots"
SNAPSHOT_LOG="$SNAPSHOTS_DIR/snapshot.log"

# Ensure snapshot directory exists
mkdir -p "$SNAPSHOTS_DIR"

# Create a snapshot of current git state
create_snapshot() {
    local task_name="$1"
    local stage="$2"
    local action="$3"
    
    # Generate snapshot ID
    local snapshot_id=$(date +%s)
    local snapshot_dir="$SNAPSHOTS_DIR/$snapshot_id"
    
    mkdir -p "$snapshot_dir"
    
    # Save git information
    cd "$PROJECT_ROOT"
    
    # Get current commit hash
    local commit_hash=$(git rev-parse HEAD 2>/dev/null || echo "no-git")
    
    # Get list of modified files
    git status --porcelain > "$snapshot_dir/git-status.txt" 2>/dev/null || true
    
    # Get diff of uncommitted changes
    git diff > "$snapshot_dir/uncommitted.diff" 2>/dev/null || true
    git diff --staged > "$snapshot_dir/staged.diff" 2>/dev/null || true
    
    # Save task information
    cat > "$snapshot_dir/task-info.json" << EOF
{
    "task_name": "$task_name",
    "stage": "$stage",
    "action": "$action",
    "timestamp": "$(date -Iseconds)",
    "commit": "$commit_hash",
    "snapshot_id": "$snapshot_id"
}
EOF
    
    # Save list of files being tracked (if file tracking is active)
    if [ -f "$PROJECT_ROOT/.claude/file-tracking/files-modified.log" ]; then
        cp "$PROJECT_ROOT/.claude/file-tracking/files-modified.log" "$snapshot_dir/tracked-files.log"
    fi
    
    # Log the snapshot
    echo "$snapshot_id|$task_name|$stage|$action|$(date -Iseconds)|$commit_hash" >> "$SNAPSHOT_LOG"
    
    echo "$snapshot_id"
}

# Show what would be reverted
preview_revert() {
    local snapshot_id="$1"
    local snapshot_dir="$SNAPSHOTS_DIR/$snapshot_id"
    
    if [ ! -d "$snapshot_dir" ]; then
        echo -e "${RED}❌ Snapshot $snapshot_id not found${NC}"
        return 1
    fi
    
    echo -e "${CYAN}Snapshot Information:${NC}"
    cat "$snapshot_dir/task-info.json" | jq -r '
        "Task: \(.task_name)",
        "Stage: \(.stage)",
        "Action: \(.action)",
        "Time: \(.timestamp)",
        "Commit: \(.commit)"
    '
    
    echo ""
    echo -e "${CYAN}Files that were modified:${NC}"
    
    # Show files from snapshot
    if [ -f "$snapshot_dir/git-status.txt" ]; then
        cat "$snapshot_dir/git-status.txt" | while read -r line; do
            status=$(echo "$line" | cut -c1-2)
            file=$(echo "$line" | cut -c4-)
            
            case "$status" in
                "M ") echo -e "  ${YELLOW}Modified:${NC} $file" ;;
                "A ") echo -e "  ${GREEN}Added:${NC} $file" ;;
                "D ") echo -e "  ${RED}Deleted:${NC} $file" ;;
                "??") echo -e "  ${BLUE}Untracked:${NC} $file" ;;
                *) echo "  $status $file" ;;
            esac
        done
    fi
    
    # Check current state
    echo ""
    echo -e "${CYAN}Current git state:${NC}"
    cd "$PROJECT_ROOT"
    
    local current_commit=$(git rev-parse HEAD 2>/dev/null || echo "no-git")
    local snapshot_commit=$(cat "$snapshot_dir/task-info.json" | jq -r '.commit')
    
    if [ "$current_commit" != "$snapshot_commit" ]; then
        echo -e "  ${YELLOW}⚠️  Git has moved forward since snapshot${NC}"
        echo "  Snapshot commit: $snapshot_commit"
        echo "  Current commit:  $current_commit"
        
        # Show commits since snapshot
        echo ""
        echo -e "${CYAN}Commits since snapshot:${NC}"
        git log --oneline "$snapshot_commit".."$current_commit" 2>/dev/null | head -5 | sed 's/^/  /'
    else
        echo -e "  ${GREEN}✓ On same commit as snapshot${NC}"
    fi
    
    # Check for conflicts
    echo ""
    echo -e "${CYAN}Checking for potential conflicts:${NC}"
    
    local has_conflicts=false
    
    # Get files modified since snapshot
    if [ -f "$snapshot_dir/tracked-files.log" ]; then
        while IFS='|' read -r timestamp file description; do
            file=$(echo "$file" | xargs)
            if [ -n "$file" ] && [ -f "$PROJECT_ROOT/$file" ]; then
                # Check if file has been modified since snapshot
                if git diff --name-only "$snapshot_commit" -- "$file" 2>/dev/null | grep -q "$file"; then
                    echo -e "  ${YELLOW}⚠️  $file has changes since snapshot${NC}"
                    has_conflicts=true
                fi
            fi
        done < <(grep "^[0-9]" "$snapshot_dir/tracked-files.log")
    fi
    
    if [ "$has_conflicts" = false ]; then
        echo -e "  ${GREEN}✓ No conflicts detected${NC}"
    fi
}

# Revert to a snapshot state
revert_to_snapshot() {
    local snapshot_id="$1"
    local revert_files="${2:-ask}"  # ask, yes, no
    local snapshot_dir="$SNAPSHOTS_DIR/$snapshot_id"
    
    if [ ! -d "$snapshot_dir" ]; then
        echo -e "${RED}❌ Snapshot $snapshot_id not found${NC}"
        return 1
    fi
    
    # Preview first
    preview_revert "$snapshot_id"
    
    echo ""
    echo -e "${YELLOW}Options for reverting:${NC}"
    echo "  1. Revert file changes (git reset to snapshot state)"
    echo "  2. Keep current files (only undo task movement)"
    echo "  3. Interactive (choose which files to revert)"
    echo "  4. Cancel"
    
    if [ "$revert_files" = "ask" ]; then
        read -p "Select option (1-4): " choice
    else
        choice="2"  # Default to keeping files
        if [ "$revert_files" = "yes" ]; then
            choice="1"
        fi
    fi
    
    case "$choice" in
        1)
            echo -e "${YELLOW}Reverting file changes...${NC}"
            cd "$PROJECT_ROOT"
            
            # Create backup branch
            backup_branch="backup-before-revert-$(date +%s)"
            git branch "$backup_branch" 2>/dev/null || true
            echo -e "${GREEN}✓ Created backup branch: $backup_branch${NC}"
            
            # Apply diffs in reverse
            if [ -f "$snapshot_dir/uncommitted.diff" ] && [ -s "$snapshot_dir/uncommitted.diff" ]; then
                echo "Reverting uncommitted changes..."
                git apply -R "$snapshot_dir/uncommitted.diff" 2>/dev/null || {
                    echo -e "${YELLOW}⚠️  Could not auto-revert some changes${NC}"
                    echo "Manual intervention may be required"
                }
            fi
            
            if [ -f "$snapshot_dir/staged.diff" ] && [ -s "$snapshot_dir/staged.diff" ]; then
                echo "Reverting staged changes..."
                git apply -R "$snapshot_dir/staged.diff" 2>/dev/null || true
            fi
            
            echo -e "${GREEN}✅ File changes reverted${NC}"
            echo "Backup saved to branch: $backup_branch"
            ;;
            
        2)
            echo -e "${BLUE}Keeping current file changes${NC}"
            ;;
            
        3)
            echo -e "${CYAN}Interactive revert:${NC}"
            
            # Show each modified file and ask
            if [ -f "$snapshot_dir/tracked-files.log" ]; then
                while IFS='|' read -r timestamp file description; do
                    file=$(echo "$file" | xargs)
                    if [ -n "$file" ] && [ -f "$PROJECT_ROOT/$file" ]; then
                        echo ""
                        echo -e "${CYAN}File: $file${NC}"
                        echo "Description: $description"
                        
                        # Show diff
                        cd "$PROJECT_ROOT"
                        git diff HEAD -- "$file" 2>/dev/null | head -20
                        
                        read -p "Revert this file? (y/n): " -n 1 revert_file
                        echo
                        
                        if [[ $revert_file =~ ^[Yy]$ ]]; then
                            git checkout HEAD -- "$file" 2>/dev/null || echo "Could not revert $file"
                            echo -e "${GREEN}✓ Reverted $file${NC}"
                        else
                            echo -e "${BLUE}Kept $file${NC}"
                        fi
                    fi
                done < <(grep "^[0-9]" "$snapshot_dir/tracked-files.log")
            fi
            ;;
            
        4)
            echo "Cancelled"
            return 1
            ;;
            
        *)
            echo -e "${RED}Invalid option${NC}"
            return 1
            ;;
    esac
    
    # Log the revert
    echo "$(date +%s)|REVERT|$snapshot_id|$choice" >> "$SNAPSHOT_LOG"
    
    echo ""
    echo -e "${GREEN}✅ Revert completed${NC}"
}

# Find snapshot for a task
find_task_snapshot() {
    local task_pattern="$1"
    
    if [ ! -f "$SNAPSHOT_LOG" ]; then
        echo "No snapshots found"
        return 1
    fi
    
    echo -e "${CYAN}Snapshots for task matching '$task_pattern':${NC}"
    echo ""
    
    grep -i "$task_pattern" "$SNAPSHOT_LOG" | tail -10 | while IFS='|' read -r id task stage action timestamp commit; do
        echo -e "${BLUE}[$id]${NC} $task"
        echo "  Stage: $stage, Action: $action"
        echo "  Time: $timestamp"
        echo ""
    done
}

# Clean old snapshots
clean_snapshots() {
    local days="${1:-30}"
    
    echo -e "${CYAN}Cleaning snapshots older than $days days...${NC}"
    
    local cutoff=$(date -d "$days days ago" +%s)
    local count=0
    
    for snapshot_dir in "$SNAPSHOTS_DIR"/*; do
        if [ -d "$snapshot_dir" ]; then
            snapshot_id=$(basename "$snapshot_dir")
            
            # Skip if not a number
            if ! [[ "$snapshot_id" =~ ^[0-9]+$ ]]; then
                continue
            fi
            
            if [ "$snapshot_id" -lt "$cutoff" ]; then
                rm -rf "$snapshot_dir"
                count=$((count + 1))
            fi
        fi
    done
    
    echo -e "${GREEN}✅ Cleaned $count old snapshots${NC}"
}

# Show help
show_help() {
    echo -e "${CYAN}Task Snapshot Manager${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  ${GREEN}task-snapshot${NC} <command> [options]"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo -e "  ${GREEN}create${NC} <task> <stage>     Create snapshot"
    echo -e "  ${GREEN}preview${NC} <id>              Preview what would be reverted"
    echo -e "  ${GREEN}revert${NC} <id>               Revert to snapshot"
    echo -e "  ${GREEN}find${NC} <pattern>            Find snapshots for task"
    echo -e "  ${GREEN}list${NC}                      List recent snapshots"
    echo -e "  ${GREEN}clean${NC} [days]              Clean old snapshots"
    echo ""
    echo -e "${YELLOW}Revert Options:${NC}"
    echo -e "  1. Full revert - Restore files to snapshot state"
    echo -e "  2. Task only - Keep current files"
    echo -e "  3. Interactive - Choose files to revert"
    echo ""
    echo -e "${YELLOW}Safety:${NC}"
    echo -e "  • Creates backup branch before reverting"
    echo -e "  • Shows conflicts before reverting"
    echo -e "  • Interactive mode for selective revert"
}

# Main
case "${1:-help}" in
    create)
        shift
        create_snapshot "$@"
        ;;
        
    preview)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: task-snapshot preview <id>${NC}"
            exit 1
        fi
        preview_revert "$1"
        ;;
        
    revert)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: task-snapshot revert <id>${NC}"
            exit 1
        fi
        revert_to_snapshot "$@"
        ;;
        
    find)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: task-snapshot find <pattern>${NC}"
            exit 1
        fi
        find_task_snapshot "$@"
        ;;
        
    list)
        if [ -f "$SNAPSHOT_LOG" ]; then
            echo -e "${CYAN}Recent Snapshots:${NC}"
            echo ""
            tail -10 "$SNAPSHOT_LOG" | while IFS='|' read -r id task stage action timestamp commit; do
                echo -e "${BLUE}[$id]${NC} $task → $stage ($action)"
            done
        else
            echo "No snapshots found"
        fi
        ;;
        
    clean)
        shift
        clean_snapshots "${1:-30}"
        ;;
        
    help|--help|-h)
        show_help
        ;;
        
    *)
        show_help
        exit 1
        ;;
esac