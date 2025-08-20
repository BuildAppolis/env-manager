#!/bin/bash

# Configuration Reader for Task System
# Provides functions to read config.json settings

# Project paths
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
CONFIG_FILE="$PROJECT_ROOT/.claude/tasks/config.json"

# Function to read a config value
get_config() {
    local path="$1"
    local default="$2"
    
    if [ ! -f "$CONFIG_FILE" ]; then
        echo "${default:-true}"
        return
    fi
    
    # Use jq to extract the value
    value=$(jq -r "$path" "$CONFIG_FILE" 2>/dev/null)
    
    if [ "$value" = "null" ] || [ -z "$value" ]; then
        echo "${default:-true}"
    else
        echo "$value"
    fi
}

# Check if a feature is enabled
is_enabled() {
    local feature="$1"
    local value=$(get_config "$feature" "true")
    
    if [ "$value" = "true" ] || [ "$value" = "1" ]; then
        return 0  # true
    else
        return 1  # false
    fi
}

# Export functions for use in other scripts
export -f get_config
export -f is_enabled