#!/bin/bash

# Hook script to automatically track file changes
# Triggered on Edit, MultiEdit, and Write tool usage

# Get config reader
CONFIG_READER="$(dirname "$0")/../tasks/scripts/config-reader.sh"
if [ -f "$CONFIG_READER" ]; then
    source "$CONFIG_READER"
    
    # Check if auto tracking is enabled
    if ! is_enabled ".fileTracking.enabled" || ! is_enabled ".taskDocumentation.autoTrackFiles"; then
        exit 0
    fi
fi

# Get input from Claude
input=$(cat)

# Extract tool name and file path
tool_name=$(echo "$input" | jq -r '.tool_name')
file_path=$(echo "$input" | jq -r '.tool_input.file_path // ""')

# Only process if we have a file path
if [ ! -z "$file_path" ] && [ "$file_path" != "null" ]; then
    # Get the file tracker script
    TRACKER="$(dirname "$0")/../tasks/scripts/file-tracker.sh"
    
    # Check if tracking is active
    if [ -f "$(dirname "$0")/../file-tracking/current-task.txt" ]; then
        # Check if specific tool tracking is enabled
        case "$tool_name" in
            "Write")
                if [ -f "$CONFIG_READER" ] && ! is_enabled ".fileTracking.trackOnWrite"; then
                    exit 0
                fi
                description="Created new file"
                ;;
            "Edit")
                if [ -f "$CONFIG_READER" ] && ! is_enabled ".fileTracking.trackOnEdit"; then
                    exit 0
                fi
                description="Modified file"
                ;;
            "MultiEdit")
                if [ -f "$CONFIG_READER" ] && ! is_enabled ".fileTracking.trackOnMultiEdit"; then
                    exit 0
                fi
                description="Multiple edits"
                ;;
            *)
                description="Changed via $tool_name"
                ;;
        esac
        
        # Track the file
        "$TRACKER" track "$file_path" "$description" > /dev/null 2>&1
    fi
fi

# Always exit 0 to not block the tool
exit 0