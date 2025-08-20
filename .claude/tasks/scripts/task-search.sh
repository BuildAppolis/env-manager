#!/bin/bash

# Advanced Task Search
# Provides intelligent search with ranking and unique identification

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

# Task files
TASK_FILES=(
    "$TASKS_DIR/FUTURE.md"
    "$TASKS_DIR/TODO.md"
    "$TASKS_DIR/IN-PROGRESS.md"
    "$TASKS_DIR/COMPLETED.md"
    "$TASKS_DIR/RELEASED.md"
)

# Search for tasks with ranking
search_tasks() {
    local pattern="$1"
    local show_all="${2:-false}"
    
    # Temporary file for results
    local results_file="/tmp/task_search_$$.txt"
    > "$results_file"
    
    # Search each file
    for file in "${TASK_FILES[@]}"; do
        if [ -f "$file" ]; then
            stage=$(basename "$file" .md)
            
            # Get task blocks that match
            awk -v pattern="$pattern" -v stage="$stage" '
            BEGIN { 
                IGNORECASE = 1
                in_task = 0
                task_content = ""
                task_title = ""
                match_score = 0
            }
            /^###/ {
                # Process previous task if it matched
                if (in_task && match_score > 0) {
                    print match_score "|" stage "|" task_title "|" task_content
                }
                # Start new task
                in_task = 1
                task_title = $0
                task_content = $0 "\n"
                # Score based on title match
                if (index(tolower($0), tolower(pattern))) {
                    match_score = 10  # High score for title match
                } else {
                    match_score = 0
                }
            }
            in_task && !/^###/ {
                task_content = task_content $0 "\n"
                # Score based on content match
                if (index(tolower($0), tolower(pattern))) {
                    match_score = match_score + 1
                }
            }
            END {
                # Process last task
                if (in_task && match_score > 0) {
                    print match_score "|" stage "|" task_title "|" task_content
                }
            }
            ' "$file" >> "$results_file"
        fi
    done
    
    # Sort by score and display
    local count=0
    local max_results=10
    
    if [ "$show_all" = "true" ]; then
        max_results=9999
    fi
    
    if [ -s "$results_file" ]; then
        echo -e "${CYAN}Search Results for '${pattern}':${NC}"
        echo ""
        
        # Sort by score (descending) and process
        sort -t'|' -k1 -rn "$results_file" | while IFS='|' read -r score stage title content; do
            count=$((count + 1))
            
            if [ $count -gt $max_results ]; then
                local remaining=$(($(wc -l < "$results_file") - max_results))
                echo ""
                echo -e "${YELLOW}... and $remaining more results. Use --all to see all.${NC}"
                break
            fi
            
            # Color based on stage
            case "$stage" in
                "FUTURE") stage_color=$MAGENTA ;;
                "TODO") stage_color=$YELLOW ;;
                "IN-PROGRESS") stage_color=$BLUE ;;
                "COMPLETED") stage_color=$GREEN ;;
                "RELEASED") stage_color=$CYAN ;;
                *) stage_color=$NC ;;
            esac
            
            # Display result with number for selection
            echo -e "${BLUE}[$count]${NC} ${stage_color}$stage${NC} $title"
            
            # Show matching context (first matching line)
            echo "$content" | grep -i "$pattern" | head -1 | sed 's/^/    /' || true
            echo ""
        done
        
        # Save results for selection
        sort -t'|' -k1 -rn "$results_file" | head -$max_results > "${results_file}.sorted"
        
        # Return the results file for interactive selection
        echo "${results_file}.sorted"
    else
        echo -e "${RED}No tasks found matching '$pattern'${NC}"
        rm -f "$results_file"
        return 1
    fi
}

# Interactive search with selection
interactive_search() {
    local pattern="$1"
    
    # Perform search
    local results_file=$(search_tasks "$pattern" false | tail -1)
    
    if [ ! -f "$results_file" ]; then
        return 1
    fi
    
    echo ""
    echo -e "${YELLOW}Select a task by number (or 0 to cancel):${NC}"
    read -p "> " selection
    
    if [ "$selection" = "0" ] || [ -z "$selection" ]; then
        echo "Cancelled"
        rm -f "$results_file"
        return 1
    fi
    
    # Get the selected task
    local selected_line=$(sed -n "${selection}p" "$results_file")
    
    if [ -z "$selected_line" ]; then
        echo -e "${RED}Invalid selection${NC}"
        rm -f "$results_file"
        return 1
    fi
    
    # Extract task details
    local stage=$(echo "$selected_line" | cut -d'|' -f2)
    local title=$(echo "$selected_line" | cut -d'|' -f3 | sed 's/^### //')
    
    echo ""
    echo -e "${GREEN}Selected:${NC} $title"
    echo -e "${GREEN}Stage:${NC} $stage"
    echo ""
    echo -e "${YELLOW}What would you like to do?${NC}"
    echo "  1. Move to another stage"
    echo "  2. View full details"
    echo "  3. Edit task"
    echo "  4. Cancel"
    
    read -p "> " action
    
    case "$action" in
        1)
            echo "Move to which stage? (future/todo/wip/done/released)"
            read -p "> " target_stage
            # Extract a unique pattern from the title
            local task_pattern=$(echo "$title" | cut -d' ' -f1-5)
            "$PROJECT_ROOT/.claude/tasks/scripts/task-manager.sh" move "$task_pattern" "$target_stage"
            ;;
        2)
            echo ""
            echo -e "${CYAN}Full Task Details:${NC}"
            echo "$selected_line" | cut -d'|' -f4-
            ;;
        3)
            # Open the file for editing
            local file="$TASKS_DIR/${stage}.md"
            ${EDITOR:-nano} "$file"
            ;;
        4)
            echo "Cancelled"
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            ;;
    esac
    
    rm -f "$results_file"
}

# Generate unique task ID based on title and timestamp
generate_task_id() {
    local title="$1"
    local timestamp=$(date +%s)
    local short_title=$(echo "$title" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | cut -c1-20)
    echo "${short_title}-${timestamp:(-6)}"
}

# Find exact task by ID or unique pattern
find_exact_task() {
    local identifier="$1"
    
    for file in "${TASK_FILES[@]}"; do
        if [ -f "$file" ]; then
            stage=$(basename "$file" .md)
            
            # Try to find exact match in title
            if grep -q "### .*$identifier" "$file"; then
                echo "FOUND|$stage|$file"
                return 0
            fi
        fi
    done
    
    echo "NOT_FOUND||"
    return 1
}

# Show help
show_help() {
    echo -e "${CYAN}Advanced Task Search${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  ${GREEN}task-search${NC} <pattern> [options]"
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo -e "  --all         Show all results (default: 10)"
    echo -e "  --interactive Interactive mode with selection"
    echo -e "  --exact       Find exact match only"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  task-search database           # Search for 'database'"
    echo -e "  task-search login --all        # Show all matches"
    echo -e "  task-search bug --interactive  # Select from results"
    echo ""
    echo -e "${YELLOW}Search Ranking:${NC}"
    echo -e "  • Title matches score highest (10 points)"
    echo -e "  • Content matches score lower (1 point each)"
    echo -e "  • Results sorted by relevance"
}

# Main
case "${1:-help}" in
    --help|help|-h)
        show_help
        ;;
    *)
        pattern="$1"
        shift
        
        if [ -z "$pattern" ]; then
            echo -e "${RED}❌ Please provide a search pattern${NC}"
            show_help
            exit 1
        fi
        
        # Parse options
        show_all=false
        interactive=false
        exact=false
        
        for arg in "$@"; do
            case "$arg" in
                --all) show_all=true ;;
                --interactive|-i) interactive=true ;;
                --exact) exact=true ;;
            esac
        done
        
        if [ "$interactive" = "true" ]; then
            interactive_search "$pattern"
        elif [ "$exact" = "true" ]; then
            result=$(find_exact_task "$pattern")
            if [ $? -eq 0 ]; then
                stage=$(echo "$result" | cut -d'|' -f2)
                echo -e "${GREEN}✓ Found in $stage${NC}"
            else
                echo -e "${RED}✗ Not found${NC}"
            fi
        else
            search_tasks "$pattern" "$show_all" | head -n -1  # Remove the filename from output
        fi
        ;;
esac