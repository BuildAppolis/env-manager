#!/bin/bash

# Changelog Generator with Version Comparison Links
# Follows Keep a Changelog format with GitHub comparison links

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
TASKS_DIR="$PROJECT_ROOT/.claude/tasks"
CHANGELOG_FILE="$PROJECT_ROOT/CHANGELOG.md"
PACKAGE_JSON="$PROJECT_ROOT/package.json"
CONFIG_READER="$PROJECT_ROOT/.claude/tasks/scripts/config-reader.sh"

# Source config reader
if [ -f "$CONFIG_READER" ]; then
    source "$CONFIG_READER"
fi

# GitHub repository info (extracted from package.json or git remote)
get_repo_info() {
    # Try to get from package.json
    if [ -f "$PACKAGE_JSON" ]; then
        repo_url=$(grep -o '"repository"[^}]*' "$PACKAGE_JSON" | grep -o 'https://[^"]*' | head -1)
    fi
    
    # Fallback to git remote
    if [ -z "$repo_url" ]; then
        repo_url=$(git remote get-url origin 2>/dev/null | sed 's/\.git$//' | sed 's/git@github.com:/https:\/\/github.com\//')
    fi
    
    echo "$repo_url"
}

# Get current version
get_current_version() {
    if [ -f "$PACKAGE_JSON" ]; then
        version=$(grep '"version"' "$PACKAGE_JSON" | sed -E 's/.*"version": "([^"]+)".*/\1/')
        echo "$version"
    else
        echo "0.0.0"
    fi
}

# Get previous version from CHANGELOG
get_previous_version() {
    if [ -f "$CHANGELOG_FILE" ]; then
        # Extract the most recent version that's not Unreleased
        prev=$(grep -E '^## \[?[0-9]+\.[0-9]+\.[0-9]+' "$CHANGELOG_FILE" | head -1 | sed -E 's/.*\[?([0-9]+\.[0-9]+\.[0-9]+).*/\1/')
        echo "${prev:-0.0.0}"
    else
        echo "0.0.0"
    fi
}

# Categorize changes
categorize_change() {
    local change="$1"
    local category="Uncategorized"
    
    # Check for conventional commit prefixes or keywords
    if [[ "$change" =~ (feat|feature|add|new) ]]; then
        category="Added"
    elif [[ "$change" =~ (fix|bug|patch|repair) ]]; then
        category="Fixed"
    elif [[ "$change" =~ (change|update|improve|enhance) ]]; then
        category="Changed"
    elif [[ "$change" =~ (remove|delete|deprecate) ]]; then
        category="Removed"
    elif [[ "$change" =~ (security|vulnerability|cve) ]]; then
        category="Security"
    elif [[ "$change" =~ (deprecate|deprecated) ]]; then
        category="Deprecated"
    fi
    
    echo "$category"
}

# Parse completed tasks into changelog format
parse_completed_tasks() {
    local completed_file="$TASKS_DIR/COMPLETED.md"
    
    if [ ! -f "$completed_file" ]; then
        echo "No completed tasks found"
        return 1
    fi
    
    # Arrays for different categories
    declare -a added=()
    declare -a changed=()
    declare -a fixed=()
    declare -a removed=()
    declare -a security=()
    declare -a deprecated=()
    
    # Read completed tasks and categorize
    while IFS= read -r line; do
        if [[ "$line" =~ ^###.*\[(.*)\]\ (.+) ]]; then
            icon="${BASH_REMATCH[1]}"
            task="${BASH_REMATCH[2]}"
            
            # Determine category based on icon and content
            case "$icon" in
                "🚀") added+=("$task") ;;
                "🐛") fixed+=("$task") ;;
                "🔧") changed+=("$task") ;;
                "🔒") security+=("$task") ;;
                "⚡") changed+=("$task") ;;
                "📚") changed+=("$task") ;;
                *) 
                    # Fallback to content analysis
                    category=$(categorize_change "$task")
                    case "$category" in
                        "Added") added+=("$task") ;;
                        "Fixed") fixed+=("$task") ;;
                        "Changed") changed+=("$task") ;;
                        "Removed") removed+=("$task") ;;
                        "Security") security+=("$task") ;;
                        "Deprecated") deprecated+=("$task") ;;
                    esac
                    ;;
            esac
        fi
    done < "$completed_file"
    
    # Format output
    local output=""
    
    if [ ${#added[@]} -gt 0 ]; then
        output+="### Added\n"
        for item in "${added[@]}"; do
            output+="- $item\n"
        done
        output+="\n"
    fi
    
    if [ ${#changed[@]} -gt 0 ]; then
        output+="### Changed\n"
        for item in "${changed[@]}"; do
            output+="- $item\n"
        done
        output+="\n"
    fi
    
    if [ ${#deprecated[@]} -gt 0 ]; then
        output+="### Deprecated\n"
        for item in "${deprecated[@]}"; do
            output+="- $item\n"
        done
        output+="\n"
    fi
    
    if [ ${#removed[@]} -gt 0 ]; then
        output+="### Removed\n"
        for item in "${removed[@]}"; do
            output+="- $item\n"
        done
        output+="\n"
    fi
    
    if [ ${#fixed[@]} -gt 0 ]; then
        output+="### Fixed\n"
        for item in "${fixed[@]}"; do
            output+="- $item\n"
        done
        output+="\n"
    fi
    
    if [ ${#security[@]} -gt 0 ]; then
        output+="### Security\n"
        for item in "${security[@]}"; do
            output+="- $item\n"
        done
        output+="\n"
    fi
    
    echo -e "$output"
}

# Generate changelog entry
generate_changelog_entry() {
    local version="$1"
    local date="$2"
    local previous_version="$3"
    local repo_url="$4"
    
    # Header with comparison link
    local entry="## [$version] - $date\n\n"
    
    # Add comparison link if enabled in config
    include_links=$(get_config ".changelog.includeComparisonLinks" "true")
    if [ "$include_links" = "true" ] && [ ! -z "$repo_url" ] && [ "$previous_version" != "0.0.0" ]; then
        entry+="[View changes from v$previous_version](${repo_url}/compare/v${previous_version}...v${version})\n\n"
    fi
    
    # Parse completed tasks
    local changes=$(parse_completed_tasks)
    
    if [ ! -z "$changes" ]; then
        entry+="$changes"
    else
        entry+="### Changed\n- Initial release\n\n"
    fi
    
    echo -e "$entry"
}

# Update or create CHANGELOG.md
update_changelog() {
    local version="$1"
    local entry="$2"
    
    if [ ! -f "$CHANGELOG_FILE" ]; then
        # Create new CHANGELOG
        cat > "$CHANGELOG_FILE" << EOF
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

$entry
EOF
    else
        # Update existing CHANGELOG
        # Insert after Unreleased section
        awk -v entry="$entry" '
        /^## \[Unreleased\]/ {
            print
            print ""
            print entry
            next
        }
        {print}
        ' "$CHANGELOG_FILE" > "$CHANGELOG_FILE.tmp" && mv "$CHANGELOG_FILE.tmp" "$CHANGELOG_FILE"
    fi
}

# Generate comparison links section
generate_links_section() {
    local repo_url="$1"
    local current_version="$2"
    local previous_version="$3"
    
    if [ -z "$repo_url" ]; then
        return
    fi
    
    local links="[Unreleased]: ${repo_url}/compare/v${current_version}...HEAD\n"
    links+="[$current_version]: ${repo_url}/compare/v${previous_version}...v${current_version}"
    
    echo -e "\n$links"
}

# Main function to generate changelog
generate() {
    echo -e "${CYAN}Generating Changelog...${NC}"
    
    # Get repository info
    repo_url=$(get_repo_info)
    echo -e "Repository: ${BLUE}${repo_url:-Not found}${NC}"
    
    # Get versions
    current_version=$(get_current_version)
    previous_version=$(get_previous_version)
    echo -e "Current version: ${GREEN}v$current_version${NC}"
    echo -e "Previous version: ${YELLOW}v$previous_version${NC}"
    
    # Generate changelog entry
    date=$(date +"%Y-%m-%d")
    entry=$(generate_changelog_entry "$current_version" "$date" "$previous_version" "$repo_url")
    
    echo -e "${GREEN}Generated Changelog Entry:${NC}"
    echo -e "$entry"
    
    # Ask to save
    echo ""
    read -p "Save to CHANGELOG.md? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        update_changelog "$current_version" "$entry"
        
        # Add links section if needed
        if [ ! -z "$repo_url" ]; then
            links=$(generate_links_section "$repo_url" "$current_version" "$previous_version")
            echo -e "$links" >> "$CHANGELOG_FILE"
        fi
        
        echo -e "${GREEN}✅ CHANGELOG.md updated${NC}"
    fi
}

# Preview changelog without saving
preview() {
    echo -e "${CYAN}Preview Changelog Entry...${NC}"
    
    repo_url=$(get_repo_info)
    current_version=$(get_current_version)
    previous_version=$(get_previous_version)
    date=$(date +"%Y-%m-%d")
    
    entry=$(generate_changelog_entry "$current_version" "$date" "$previous_version" "$repo_url")
    
    echo -e "$entry"
}

# Generate with Claude assistance
generate_with_claude() {
    # Check if Claude assistance is enabled
    if [ -f "$CONFIG_READER" ]; then
        if ! is_enabled ".changelog.claudeAssisted"; then
            echo -e "${YELLOW}Claude assistance is disabled in config${NC}"
            echo "Use 'changelog-gen generate' for manual generation"
            return 0
        fi
    fi
    
    echo -e "${CYAN}Generating Changelog with Claude...${NC}"
    
    if [ ! -f "$TASKS_DIR/COMPLETED.md" ]; then
        echo -e "${RED}❌ No completed tasks found${NC}"
        exit 1
    fi
    
    # Get completed tasks
    completed=$(cat "$TASKS_DIR/COMPLETED.md")
    
    # Get version info
    current_version=$(get_current_version)
    repo_url=$(get_repo_info)
    
    # Generate with Claude
    prompt="Generate a changelog entry for version $current_version based on these completed tasks. Follow Keep a Changelog format with sections: Added, Changed, Deprecated, Removed, Fixed, Security. Be concise and user-focused. Tasks: $completed"
    
    changelog=$(claude --print "$prompt" 2>/dev/null || echo "")
    
    if [ ! -z "$changelog" ]; then
        echo -e "${GREEN}Claude-Generated Changelog:${NC}"
        echo "$changelog"
        
        # Add version header and comparison link
        date=$(date +"%Y-%m-%d")
        previous_version=$(get_previous_version)
        
        full_entry="## [$current_version] - $date\n\n"
        if [ ! -z "$repo_url" ] && [ "$previous_version" != "0.0.0" ]; then
            full_entry+="[View changes from v$previous_version](${repo_url}/compare/v${previous_version}...v${current_version})\n\n"
        fi
        full_entry+="$changelog"
        
        echo ""
        read -p "Save to CHANGELOG.md? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            update_changelog "$current_version" "$full_entry"
            echo -e "${GREEN}✅ CHANGELOG.md updated${NC}"
        fi
    else
        echo -e "${RED}❌ Failed to generate with Claude${NC}"
    fi
}

# Show help
show_help() {
    echo -e "${CYAN}Changelog Generator${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  ${GREEN}changelog-gen${NC} <command>"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo -e "  ${GREEN}generate${NC}        Generate changelog from completed tasks"
    echo -e "  ${GREEN}preview${NC}         Preview changelog without saving"
    echo -e "  ${GREEN}claude${NC}          Generate with Claude AI assistance"
    echo -e "  ${GREEN}help${NC}            Show this help"
    echo ""
    echo -e "${YELLOW}Features:${NC}"
    echo -e "  • Follows Keep a Changelog format"
    echo -e "  • Generates GitHub comparison links"
    echo -e "  • Categorizes changes automatically"
    echo -e "  • Optional Claude AI assistance"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  ${GREEN}changelog-gen generate${NC}   # Generate and save"
    echo -e "  ${GREEN}changelog-gen preview${NC}    # Preview only"
    echo -e "  ${GREEN}changelog-gen claude${NC}     # Use AI assistance"
}

# Main command handling
case "${1:-help}" in
    generate|gen)
        generate
        ;;
        
    preview)
        preview
        ;;
        
    claude|ai)
        generate_with_claude
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