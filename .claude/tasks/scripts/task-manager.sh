#!/bin/bash

# Task Manager for Env-Manager Project
# Manages tasks across FUTURE, TODO, IN-PROGRESS, and COMPLETED stages
# Integrates with UPDATES/1CHANGES-QUEUE.md

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Project paths
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
TASKS_DIR="$PROJECT_ROOT/.claude/tasks"
UPDATES_DIR="$PROJECT_ROOT/UPDATES"
CHANGES_QUEUE="$UPDATES_DIR/1CHANGES-QUEUE.md"
TASK_HISTORY="$PROJECT_ROOT/.claude/tasks/scripts/task-history.sh"

# Source history functions if available
if [ -f "$TASK_HISTORY" ]; then
    source "$TASK_HISTORY"
fi

# Task files
FUTURE_FILE="$TASKS_DIR/FUTURE.md"
TODO_FILE="$TASKS_DIR/TODO.md"
IN_PROGRESS_FILE="$TASKS_DIR/IN-PROGRESS.md"
COMPLETED_FILE="$TASKS_DIR/COMPLETED.md"
RELEASED_FILE="$TASKS_DIR/RELEASED.md"

# Ensure directories exist
mkdir -p "$TASKS_DIR"
mkdir -p "$UPDATES_DIR"

# Functions
print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📋 Env-Manager Task Management${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

add_task() {
    local stage="$1"
    local category="$2"
    local priority="$3"
    local description="$4"
    
    # Map stage
    case "$stage" in
        future|idea|someday) 
            target_file="$FUTURE_FILE"
            stage_name="FUTURE"
            ;;
        todo|backlog|planned) 
            target_file="$TODO_FILE"
            stage_name="TODO"
            ;;
        wip|progress|active) 
            target_file="$IN_PROGRESS_FILE"
            stage_name="IN-PROGRESS"
            ;;
        done|completed|finished) 
            target_file="$COMPLETED_FILE"
            stage_name="COMPLETED"
            ;;
        *) 
            target_file="$TODO_FILE"
            stage_name="TODO"
            ;;
    esac
    
    # Map category icons
    case "$category" in
        feature|feat) icon="🚀"; category_name="Features" ;;
        bug|fix) icon="🐛"; category_name="Bugs" ;;
        docs|doc) icon="📚"; category_name="Docs" ;;
        tech|debt|refactor) icon="🔧"; category_name="Tech Debt" ;;
        idea) icon="💡"; category_name="Ideas" ;;
        ui|ux) icon="🎨"; category_name="UI/UX" ;;
        security|sec) icon="🔒"; category_name="Security" ;;
        perf|performance) icon="⚡"; category_name="Performance" ;;
        test) icon="🧪"; category_name="Testing" ;;
        *) icon="📌"; category_name="General" ;;
    esac
    
    # Map priority for TODO items
    priority_section=""
    if [ "$stage_name" = "TODO" ]; then
        case "$priority" in
            high|1|urgent|critical) priority_section="High Priority" ;;
            medium|med|2|normal) priority_section="Medium Priority" ;;
            low|3|minor|trivial) priority_section="Low Priority" ;;
            *) priority_section="Medium Priority" ;;
        esac
    fi
    
    # Get current date
    date_added=$(date +"%Y-%m-%d")
    
    # Create task entry
    task_entry="### [$icon] $description
**Category:** $category_name  
**Priority:** ${priority^}  
**Added:** $date_added  
"
    
    # Add to appropriate section
    if [ "$stage_name" = "TODO" ]; then
        # Add to priority section in TODO
        awk -v task="$task_entry" -v section="## $priority_section" '
        $0 ~ section {
            print
            print ""
            print task
            next
        }
        {print}
        ' "$target_file" > "$target_file.tmp" && mv "$target_file.tmp" "$target_file"
    else
        # Add after the stage header
        awk -v task="$task_entry" '
        /^---$/ && !found {
            print task
            print ""
            found=1
        }
        {print}
        ' "$target_file" > "$target_file.tmp" && mv "$target_file.tmp" "$target_file"
    fi
    
    # Update last modified date
    sed -i "s/\*Last Updated:.*/\*Last Updated: $(date +'%Y-%m-%d')\*/" "$target_file"
    
    echo -e "${GREEN}✅ Task added to $stage_name${NC}"
    echo -e "   Category: $icon $category_name"
    echo -e "   Priority: ${priority^}"
    echo -e "   Description: $description"
    
    # Log to history if available
    if [ -f "$TASK_HISTORY" ]; then
        log_movement "ADD" "$description" "" "$stage_name"
    fi
}

list_tasks() {
    local filter="$1"
    
    print_header
    echo ""
    
    # Function to extract tasks from a file
    extract_tasks() {
        local file="$1"
        local stage="$2"
        local color="$3"
        
        if [ -f "$file" ]; then
            grep "^###" "$file" 2>/dev/null | while read -r line; do
                task="${line#### }"
                echo -e "  ${color}[$stage]${NC} $task"
            done
        fi
    }
    
    if [ -z "$filter" ] || [[ "$filter" == "all" ]]; then
        echo -e "${MAGENTA}🔮 FUTURE:${NC}"
        extract_tasks "$FUTURE_FILE" "FUTURE" "$MAGENTA"
        echo ""
        
        echo -e "${YELLOW}📝 TODO:${NC}"
        extract_tasks "$TODO_FILE" "TODO" "$YELLOW"
        echo ""
        
        echo -e "${BLUE}🚧 IN-PROGRESS:${NC}"
        extract_tasks "$IN_PROGRESS_FILE" "WIP" "$BLUE"
        echo ""
        
        echo -e "${GREEN}✅ COMPLETED:${NC}"
        extract_tasks "$COMPLETED_FILE" "DONE" "$GREEN"
    else
        # Filter specific stage
        case "$filter" in
            future) extract_tasks "$FUTURE_FILE" "FUTURE" "$MAGENTA" ;;
            todo) extract_tasks "$TODO_FILE" "TODO" "$YELLOW" ;;
            wip|progress) extract_tasks "$IN_PROGRESS_FILE" "WIP" "$BLUE" ;;
            done|completed) extract_tasks "$COMPLETED_FILE" "DONE" "$GREEN" ;;
            *)
                # Search across all files
                echo -e "${CYAN}Search results for '$filter':${NC}"
                for file in "$FUTURE_FILE" "$TODO_FILE" "$IN_PROGRESS_FILE" "$COMPLETED_FILE"; do
                    if [ -f "$file" ]; then
                        grep -i "$filter" "$file" 2>/dev/null | grep "^###" | while read -r line; do
                            echo -e "  ${line#### }"
                        done
                    fi
                done
                ;;
        esac
    fi
}

move_task() {
    local pattern="$1"
    local to_stage="$2"
    
    # Determine target file
    case "$to_stage" in
        future) target_file="$FUTURE_FILE"; stage_name="FUTURE" ;;
        todo) target_file="$TODO_FILE"; stage_name="TODO" ;;
        wip|progress) target_file="$IN_PROGRESS_FILE"; stage_name="IN-PROGRESS" ;;
        done|completed) target_file="$COMPLETED_FILE"; stage_name="COMPLETED" ;;
        released) target_file="$RELEASED_FILE"; stage_name="RELEASED" ;;
        queue) 
            # Special case: move to CHANGES-QUEUE
            move_to_queue "$pattern"
            return
            ;;
        *)
            echo -e "${RED}❌ Invalid stage: $to_stage${NC}"
            echo "Valid stages: future, todo, wip/progress, done/completed, released, queue"
            return 1
            ;;
    esac
    
    # Find and move the task
    task_found=false
    for source_file in "$FUTURE_FILE" "$TODO_FILE" "$IN_PROGRESS_FILE" "$COMPLETED_FILE" "$RELEASED_FILE"; do
        if [ -f "$source_file" ] && [ "$source_file" != "$target_file" ]; then
            # Extract task matching pattern
            task_content=$(awk -v pattern="$pattern" '
            BEGIN {found=0; content=""}
            tolower($0) ~ tolower(pattern) && /^###/ {found=1}
            found && /^###/ && tolower($0) !~ tolower(pattern) {found=0}
            found {content = content $0 "\n"}
            END {print content}
            ' "$source_file")
            
            if [ ! -z "$task_content" ]; then
                task_found=true
                
                # Remove from source
                awk -v pattern="$pattern" '
                BEGIN {skip=0}
                tolower($0) ~ tolower(pattern) && /^###/ {skip=1; next}
                skip && /^###/ {skip=0}
                !skip {print}
                ' "$source_file" > "$source_file.tmp" && mv "$source_file.tmp" "$source_file"
                
                # Run validation if moving to COMPLETED
                if [[ "$to_stage" == "done" || "$to_stage" == "completed" ]]; then
                    TASK_VALIDATOR="$PROJECT_ROOT/.claude/tasks/scripts/task-validator.sh"
                    if [ -f "$TASK_VALIDATOR" ]; then
                        # Check for force flag
                        if [[ "$3" != "--force" ]]; then
                            echo -e "${CYAN}Running pre-completion validation...${NC}"
                            if ! "$TASK_VALIDATOR" pre-complete; then
                                echo -e "${RED}❌ Validation failed. Task not moved.${NC}"
                                echo -e "${YELLOW}Use 'tm move \"$pattern\" done --force' to skip validation${NC}"
                                
                                # Restore task to source file
                                echo "$task_content" >> "$source_file"
                                return 1
                            fi
                        else
                            echo -e "${YELLOW}⚠️  Skipping validation (--force flag used)${NC}"
                        fi
                    fi
                fi
                
                # Add to target
                echo "$task_content" >> "$target_file"
                
                # Create snapshot before moving (if snapshot script exists)
                if [ -f "$PROJECT_ROOT/.claude/tasks/scripts/task-snapshot.sh" ]; then
                    local task_name=$(echo "$task_content" | grep "^###" | head -1 | sed 's/### //' | sed 's/ .*//')
                    local from_stage=$(basename "$source_file" .md)
                    "$PROJECT_ROOT/.claude/tasks/scripts/task-snapshot.sh" create "$task_name" "$from_stage" "move-to-$stage_name" > /dev/null 2>&1 || true
                fi
                
                # Update dates
                sed -i "s/\*Last Updated:.*/\*Last Updated: $(date +'%Y-%m-%d')\*/" "$source_file"
                sed -i "s/\*Last Updated:.*/\*Last Updated: $(date +'%Y-%m-%d')\*/" "$target_file"
                
                echo -e "${GREEN}✅ Task moved to $stage_name${NC}"
                
                # Log to history if available
                if [ -f "$TASK_HISTORY" ]; then
                    # Extract clean task name from the content
                    task_name=$(echo "$task_content" | grep "^###" | head -1 | sed 's/### \[.*\] //')
                    source_stage=$(basename "$source_file" .md)
                    log_movement "MOVE" "$task_name" "$source_stage" "$stage_name"
                fi
                
                break
            fi
        fi
    done
    
    if [ "$task_found" = false ]; then
        echo -e "${RED}❌ Task not found: $pattern${NC}"
    fi
}

move_to_queue() {
    local pattern="$1"
    
    # Find task in any file
    task_content=""
    for file in "$TODO_FILE" "$IN_PROGRESS_FILE"; do
        if [ -f "$file" ]; then
            temp_content=$(awk -v pattern="$pattern" '
            BEGIN {found=0}
            tolower($0) ~ tolower(pattern) && /^###/ {found=1}
            found && /^###/ && tolower($0) !~ tolower(pattern) {found=0}
            found {print}
            ' "$file")
            
            if [ ! -z "$temp_content" ]; then
                task_content="$temp_content"
                break
            fi
        fi
    done
    
    if [ -z "$task_content" ]; then
        echo -e "${RED}❌ Task not found in TODO or IN-PROGRESS${NC}"
        return 1
    fi
    
    # Extract description
    description=$(echo "$task_content" | head -1 | sed 's/^### \[.*\] //')
    
    # Add to CHANGES-QUEUE.md
    if ! grep -q "^### Next Steps & Future Enhancements" "$CHANGES_QUEUE" 2>/dev/null; then
        echo -e "\n### Next Steps & Future Enhancements\n" >> "$CHANGES_QUEUE"
    fi
    
    echo "- **$description**" >> "$CHANGES_QUEUE"
    
    echo -e "${GREEN}✅ Task moved to CHANGES-QUEUE.md${NC}"
    echo -e "   Task: $description"
}

quick_add() {
    local input="$*"
    
    # Detect stage
    stage="todo"
    if [[ "$input" =~ (future|someday|maybe|idea|explore) ]]; then
        stage="future"
    elif [[ "$input" =~ (now|urgent|immediately|asap) ]]; then
        stage="wip"
    fi
    
    # Detect priority
    priority="medium"
    if [[ "$input" =~ (urgent|high|important|critical|asap) ]]; then
        priority="high"
    elif [[ "$input" =~ (low|minor|sometime|trivial) ]]; then
        priority="low"
    fi
    
    # Detect category
    category="feature"
    if [[ "$input" =~ (bug|fix|broken|error|issue) ]]; then
        category="bug"
    elif [[ "$input" =~ (doc|document|readme|guide) ]]; then
        category="docs"
    elif [[ "$input" =~ (ui|ux|design|interface|style) ]]; then
        category="ui"
    elif [[ "$input" =~ (idea|maybe|consider|explore) ]]; then
        category="idea"
    elif [[ "$input" =~ (refactor|cleanup|tech.?debt|optimize) ]]; then
        category="tech"
    elif [[ "$input" =~ (security|vulnerability|auth|permission) ]]; then
        category="security"
    elif [[ "$input" =~ (perf|performance|speed|optimize) ]]; then
        category="perf"
    elif [[ "$input" =~ (test|testing|spec|coverage) ]]; then
        category="test"
    fi
    
    add_task "$stage" "$category" "$priority" "$input"
}

show_stats() {
    print_header
    echo ""
    echo -e "${CYAN}📊 Task Statistics:${NC}"
    echo ""
    
    # Count tasks in each stage
    count_tasks() {
        local file="$1"
        if [ -f "$file" ]; then
            # Use head -1 to ensure we only get one line
            local count=$(grep -c "^###" "$file" 2>/dev/null | head -1 || echo "0")
            echo "$count"
        else
            echo "0"
        fi
    }
    
    future_count=$(count_tasks "$FUTURE_FILE")
    todo_count=$(count_tasks "$TODO_FILE")
    wip_count=$(count_tasks "$IN_PROGRESS_FILE")
    done_count=$(count_tasks "$COMPLETED_FILE")
    
    echo -e "  🔮 Future: ${MAGENTA}$future_count${NC}"
    echo -e "  📝 Todo: ${YELLOW}$todo_count${NC}"
    echo -e "  🚧 In Progress: ${BLUE}$wip_count${NC}"
    echo -e "  ✅ Completed: ${GREEN}$done_count${NC}"
    echo ""
    echo -e "  📊 Total: $((future_count + todo_count + wip_count + done_count))"
    
    # Show priority breakdown for TODO
    if [ -f "$TODO_FILE" ]; then
        echo ""
        echo -e "${CYAN}Priority Breakdown (TODO):${NC}"
        high=$(awk '/## High Priority/,/## Medium Priority/' "$TODO_FILE" | grep -c "^###" 2>/dev/null || echo 0)
        medium=$(awk '/## Medium Priority/,/## Low Priority/' "$TODO_FILE" | grep -c "^###" 2>/dev/null || echo 0)
        low=$(awk '/## Low Priority/,/---/' "$TODO_FILE" | grep -c "^###" 2>/dev/null || echo 0)
        echo -e "  🔴 High: $high"
        echo -e "  🟡 Medium: $medium"
        echo -e "  🟢 Low: $low"
    fi
}

show_help() {
    print_header
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  ${GREEN}task${NC} <command> [options]"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo -e "  ${GREEN}add${NC} <stage> <category> <priority> <desc>  Add task to stage"
    echo -e "  ${GREEN}quick${NC} <description>                        Quick add with auto-detection"
    echo -e "  ${GREEN}list${NC} [stage|filter]                        List tasks"
    echo -e "  ${GREEN}move${NC} <pattern> <to_stage>                  Move task between stages"
    echo -e "  ${GREEN}stats${NC}                                      Show statistics"
    echo -e "  ${GREEN}edit${NC} <stage>                               Edit stage file"
    echo ""
    echo -e "${YELLOW}Stages:${NC}"
    echo -e "  future    - Long-term ideas and concepts"
    echo -e "  todo      - Backlog of planned tasks"
    echo -e "  wip       - Currently in progress"
    echo -e "  done      - Completed tasks"
    echo -e "  queue     - Move to CHANGES-QUEUE.md"
    echo ""
    echo -e "${YELLOW}Categories:${NC}"
    echo -e "  feature, bug, docs, tech, idea, ui, security, perf, test"
    echo ""
    echo -e "${YELLOW}Priorities:${NC}"
    echo -e "  high/urgent, medium/normal, low/minor"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  ${GREEN}task add todo feature high${NC} \"Add dark mode\""
    echo -e "  ${GREEN}task quick${NC} \"Fix login bug\""
    echo -e "  ${GREEN}task move${NC} \"dark mode\" wip"
    echo -e "  ${GREEN}task list${NC} todo"
    echo -e "  ${GREEN}task stats${NC}"
}

# Main command handling
case "${1:-help}" in
    add)
        shift
        if [ $# -lt 4 ]; then
            echo -e "${RED}❌ Usage: task add <stage> <category> <priority> <description>${NC}"
            exit 1
        fi
        add_task "$1" "$2" "$3" "${@:4}"
        ;;
        
    quick|q)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: task quick <description>${NC}"
            exit 1
        fi
        quick_add "$@"
        ;;
        
    list|ls)
        shift
        list_tasks "$1"
        ;;
        
    move|mv)
        shift
        if [ $# -lt 2 ]; then
            echo -e "${RED}❌ Usage: task move <pattern> <to_stage>${NC}"
            exit 1
        fi
        move_task "$1" "$2"
        ;;
        
    stats|stat)
        show_stats
        ;;
        
    edit)
        shift
        case "$1" in
            future) ${EDITOR:-nano} "$FUTURE_FILE" ;;
            todo) ${EDITOR:-nano} "$TODO_FILE" ;;
            wip|progress) ${EDITOR:-nano} "$IN_PROGRESS_FILE" ;;
            done|completed) ${EDITOR:-nano} "$COMPLETED_FILE" ;;
            *) 
                echo "Specify stage: future, todo, wip, done"
                exit 1
                ;;
        esac
        ;;
        
    help|--help|-h)
        show_help
        ;;
        
    *)
        # If no command, assume quick add
        if [ $# -gt 0 ]; then
            quick_add "$@"
        else
            show_help
        fi
        ;;
esac