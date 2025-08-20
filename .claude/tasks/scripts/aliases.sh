#!/bin/bash

# Task Management Aliases
# Source this file in your shell to get quick commands
# Add to .bashrc/.zshrc: source /path/to/project/.claude/tasks/aliases.sh

# Get the directory where this script is located
TASK_PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

# Main tm command
alias tm="$TASK_PROJECT_DIR/tm"

# Super quick aliases
alias ta="tm add"           # Task Add
alias ts="tm start"         # Task Start  
alias td="tm done"          # Task Done
alias tw="tm wip"           # Task WIP (what's in progress)
alias tl="tm list"          # Task List
alias tf="tm files"         # Task Files (tracked)
alias tc="tm config"        # Task Config
alias tr="tm release"       # Task Release

# Task status shortcuts
alias todo="tm todo"
alias wip="tm wip"
alias done="tm list done"

# Documentation shortcuts
alias tplan="tm plan"
alias tsummary="tm summary"
alias tchangelog="tm changelog"

# Quick task management
alias tstats="tm stats"
alias tdetect="tm detect"
alias tupdate="tm update"

# Configuration shortcuts
alias tconfig="tm config"
alias tconfig-menu="tm config-menu"

# Print available commands on load
if [ -n "$BASH_VERSION" ] || [ -n "$ZSH_VERSION" ]; then
    echo "Task Management Aliases Loaded!"
    echo "  ta <desc>     - Add task"
    echo "  ts <pattern>  - Start task"
    echo "  td <pattern>  - Done/complete task"
    echo "  tw            - Show WIP"
    echo "  tl            - List all tasks"
    echo "  tm help       - Full help"
fi