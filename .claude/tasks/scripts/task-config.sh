#!/bin/bash

# Task Configuration Manager
# View and modify task system configuration

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
CONFIG_FILE="$PROJECT_ROOT/.claude/tasks/config.json"
CONFIG_READER="$PROJECT_ROOT/.claude/tasks/scripts/config-reader.sh"

# Source config reader
source "$CONFIG_READER"

# Show current configuration
show_config() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📋 Task System Configuration${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ ! -f "$CONFIG_FILE" ]; then
        echo -e "${RED}❌ Configuration file not found${NC}"
        echo "Run: task-config init"
        return 1
    fi
    
    echo -e "${BLUE}Task Documentation:${NC}"
    echo -e "  • Enabled: $(get_config '.taskDocumentation.enabled')"
    echo -e "  • Auto Track Files: $(get_config '.taskDocumentation.autoTrackFiles')"
    echo -e "  • Generate Summaries: $(get_config '.taskDocumentation.generateSummaries')"
    echo -e "  • Claude Assisted: $(get_config '.taskDocumentation.claudeAssisted')"
    echo ""
    
    echo -e "${BLUE}File Tracking:${NC}"
    echo -e "  • Enabled: $(get_config '.fileTracking.enabled')"
    echo -e "  • Track on Edit: $(get_config '.fileTracking.trackOnEdit')"
    echo -e "  • Track on Write: $(get_config '.fileTracking.trackOnWrite')"
    echo -e "  • Track on MultiEdit: $(get_config '.fileTracking.trackOnMultiEdit')"
    echo -e "  • Track on Commit: $(get_config '.fileTracking.trackOnCommit')"
    echo ""
    
    echo -e "${BLUE}Documentation:${NC}"
    echo -e "  • Generate Plans: $(get_config '.documentation.generatePlans')"
    echo -e "  • Generate Summaries: $(get_config '.documentation.generateSummaries')"
    echo -e "  • Use Templates: $(get_config '.documentation.useTemplates')"
    echo ""
    
    echo -e "${BLUE}Changelog:${NC}"
    echo -e "  • Enabled: $(get_config '.changelog.enabled')"
    echo -e "  • Format: $(get_config '.changelog.format')"
    echo -e "  • Include Comparison Links: $(get_config '.changelog.includeComparisonLinks')"
    echo -e "  • Claude Assisted: $(get_config '.changelog.claudeAssisted')"
    echo ""
    
    echo -e "${BLUE}Workflow:${NC}"
    echo -e "  • Max In Progress: $(get_config '.workflow.maxInProgress')"
    echo -e "  • Require Documentation: $(get_config '.workflow.requireDocumentation')"
    echo -e "  • Require File Tracking: $(get_config '.workflow.requireFileTracking')"
}

# Toggle a boolean setting
toggle_setting() {
    local path="$1"
    local current=$(get_config "$path")
    local new_value="true"
    
    if [ "$current" = "true" ]; then
        new_value="false"
    fi
    
    # Update config using jq
    jq "$path = $new_value" "$CONFIG_FILE" > "$CONFIG_FILE.tmp" && mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
    
    echo -e "${GREEN}✅ Updated $path to $new_value${NC}"
}

# Set a value
set_value() {
    local path="$1"
    local value="$2"
    
    # Check if value is a number
    if [[ "$value" =~ ^[0-9]+$ ]]; then
        jq "$path = $value" "$CONFIG_FILE" > "$CONFIG_FILE.tmp" && mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
    else
        jq "$path = \"$value\"" "$CONFIG_FILE" > "$CONFIG_FILE.tmp" && mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
    fi
    
    echo -e "${GREEN}✅ Updated $path to $value${NC}"
}

# Interactive configuration
interactive_config() {
    while true; do
        clear
        show_config
        
        echo -e "${YELLOW}Configuration Options:${NC}"
        echo "  1. Toggle Claude Assistance"
        echo "  2. Toggle File Tracking"
        echo "  3. Toggle Auto-detect Changes"
        echo "  4. Toggle Changelog Generation"
        echo "  5. Set Max In-Progress Tasks"
        echo "  6. Toggle Comparison Links"
        echo "  7. Exit"
        echo ""
        
        read -p "Select option (1-7): " choice
        
        case $choice in
            1)
                toggle_setting ".taskDocumentation.claudeAssisted"
                toggle_setting ".changelog.claudeAssisted"
                ;;
            2)
                toggle_setting ".fileTracking.enabled"
                toggle_setting ".taskDocumentation.autoTrackFiles"
                ;;
            3)
                toggle_setting ".taskDocumentation.autoDetectChanges"
                ;;
            4)
                toggle_setting ".changelog.enabled"
                ;;
            5)
                read -p "Enter max in-progress tasks (1-10): " max_tasks
                if [[ "$max_tasks" =~ ^[1-9]|10$ ]]; then
                    set_value ".workflow.maxInProgress" "$max_tasks"
                else
                    echo -e "${RED}Invalid value. Must be 1-10${NC}"
                fi
                ;;
            6)
                toggle_setting ".changelog.includeComparisonLinks"
                ;;
            7)
                break
                ;;
            *)
                echo -e "${RED}Invalid option${NC}"
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Enable all features
enable_all() {
    echo -e "${CYAN}Enabling all features...${NC}"
    
    jq '.taskDocumentation.enabled = true |
        .taskDocumentation.autoTrackFiles = true |
        .taskDocumentation.generateSummaries = true |
        .taskDocumentation.claudeAssisted = true |
        .fileTracking.enabled = true |
        .documentation.generatePlans = true |
        .documentation.generateSummaries = true |
        .changelog.enabled = true |
        .changelog.claudeAssisted = true' "$CONFIG_FILE" > "$CONFIG_FILE.tmp" && mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
    
    echo -e "${GREEN}✅ All features enabled${NC}"
}

# Disable Claude features
disable_claude() {
    echo -e "${CYAN}Disabling Claude features...${NC}"
    
    jq '.taskDocumentation.claudeAssisted = false |
        .changelog.claudeAssisted = false' "$CONFIG_FILE" > "$CONFIG_FILE.tmp" && mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
    
    echo -e "${GREEN}✅ Claude features disabled${NC}"
}

# Show help
show_help() {
    echo -e "${CYAN}Task Configuration Manager${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  ${GREEN}task-config${NC} <command> [options]"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo -e "  ${GREEN}show${NC}              Show current configuration"
    echo -e "  ${GREEN}interactive${NC}       Interactive configuration menu"
    echo -e "  ${GREEN}enable-all${NC}        Enable all features"
    echo -e "  ${GREEN}disable-claude${NC}    Disable Claude AI features"
    echo -e "  ${GREEN}toggle${NC} <path>     Toggle a boolean setting"
    echo -e "  ${GREEN}set${NC} <path> <val>  Set a configuration value"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  ${GREEN}task-config show${NC}"
    echo -e "  ${GREEN}task-config toggle${NC} .fileTracking.enabled"
    echo -e "  ${GREEN}task-config set${NC} .workflow.maxInProgress 5"
    echo -e "  ${GREEN}task-config interactive${NC}"
}

# Main command handling
case "${1:-show}" in
    show)
        show_config
        ;;
        
    interactive|menu)
        interactive_config
        ;;
        
    enable-all)
        enable_all
        ;;
        
    disable-claude)
        disable_claude
        ;;
        
    toggle)
        shift
        if [ $# -eq 0 ]; then
            echo -e "${RED}❌ Usage: task-config toggle <path>${NC}"
            exit 1
        fi
        toggle_setting "$1"
        ;;
        
    set)
        shift
        if [ $# -lt 2 ]; then
            echo -e "${RED}❌ Usage: task-config set <path> <value>${NC}"
            exit 1
        fi
        set_value "$1" "$2"
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