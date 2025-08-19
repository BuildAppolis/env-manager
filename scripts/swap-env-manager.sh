#!/bin/bash

# =============================================================================
# ENV-MANAGER PACKAGE SWAPPER
# Easily swap between production and local testing versions
# =============================================================================

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# Configuration
ENV_MANAGER_LOCAL_PATH="/home/cory-ubuntu/coding/projects/env-manager"
DEFAULT_PROJECT="/home/cory-ubuntu/coding/payload-auth-demo"

# Parse arguments
PROJECT_PATH="${1:-$DEFAULT_PROJECT}"
MODE="${2:-status}"  # status, local, prod

# Function to print colored output
print_color() {
    local color=$1
    shift
    echo -e "${color}$@${RESET}"
}

# Function to print header
print_header() {
    echo
    print_color "$BOLD$BLUE" "╔══════════════════════════════════════════════╗"
    print_color "$BOLD$BLUE" "║     🔄 ENV-MANAGER PACKAGE SWAPPER          ║"
    print_color "$BOLD$BLUE" "╚══════════════════════════════════════════════╝"
    echo
}

# Function to check current status
check_status() {
    local project_path=$1
    local package_json="$project_path/package.json"
    
    if [ ! -f "$package_json" ]; then
        print_color "$RED" "❌ No package.json found in $project_path"
        return 1
    fi
    
    # Check if env-manager is installed
    if grep -q "@buildappolis/env-manager" "$package_json"; then
        # Check if it's using local file or npm version
        if grep -q "\"@buildappolis/env-manager\": \"file:" "$package_json"; then
            local linked_path=$(grep "@buildappolis/env-manager" "$package_json" | sed -n 's/.*"file:\([^"]*\)".*/\1/p')
            print_color "$CYAN" "📦 Currently using: LOCAL VERSION"
            print_color "$CYAN" "   Path: $linked_path"
        else
            local version=$(grep "@buildappolis/env-manager" "$package_json" | sed -n 's/.*"\([0-9.^~]*\)".*/\1/p')
            print_color "$GREEN" "📦 Currently using: NPM VERSION"
            print_color "$GREEN" "   Version: $version"
        fi
    else
        print_color "$YELLOW" "⚠️  @buildappolis/env-manager is not installed"
    fi
}

# Function to swap to local version
swap_to_local() {
    local project_path=$1
    
    print_color "$YELLOW" "🔄 Switching to LOCAL testing version..."
    
    # Change to project directory
    cd "$project_path" || exit 1
    
    # Remove current env-manager
    print_color "$CYAN" "   Removing current package..."
    pnpm remove @buildappolis/env-manager 2>/dev/null || true
    
    # Link local version
    print_color "$CYAN" "   Linking local version..."
    pnpm add "file:$ENV_MANAGER_LOCAL_PATH"
    
    if [ $? -eq 0 ]; then
        print_color "$GREEN" "✅ Successfully switched to LOCAL version!"
        print_color "$GREEN" "   You can now test your local changes"
        echo
        print_color "$YELLOW" "⚠️  Remember to rebuild env-manager when you make changes:"
        print_color "$CYAN" "   cd $ENV_MANAGER_LOCAL_PATH && pnpm build"
    else
        print_color "$RED" "❌ Failed to link local version"
        return 1
    fi
}

# Function to swap to production version
swap_to_prod() {
    local project_path=$1
    
    print_color "$YELLOW" "🔄 Switching to PRODUCTION npm version..."
    
    # Change to project directory
    cd "$project_path" || exit 1
    
    # Remove current env-manager
    print_color "$CYAN" "   Removing current package..."
    pnpm remove @buildappolis/env-manager 2>/dev/null || true
    
    # Install latest from npm
    print_color "$CYAN" "   Installing from npm..."
    pnpm add @buildappolis/env-manager@latest
    
    if [ $? -eq 0 ]; then
        local version=$(grep "@buildappolis/env-manager" package.json | sed -n 's/.*"\([0-9.^~]*\)".*/\1/p')
        print_color "$GREEN" "✅ Successfully switched to PRODUCTION version!"
        print_color "$GREEN" "   Version: $version"
    else
        print_color "$RED" "❌ Failed to install production version"
        return 1
    fi
}

# Function to show usage
show_usage() {
    print_color "$BOLD" "USAGE:"
    echo "  $0 [PROJECT_PATH] [MODE]"
    echo
    print_color "$BOLD" "MODES:"
    echo "  status  - Check current package status (default)"
    echo "  local   - Switch to local testing version"
    echo "  prod    - Switch to production npm version"
    echo
    print_color "$BOLD" "EXAMPLES:"
    echo "  $0                                    # Check status of default project"
    echo "  $0 /path/to/project                   # Check status of specific project"
    echo "  $0 /path/to/project local              # Switch project to local version"
    echo "  $0 /path/to/project prod               # Switch project to production version"
    echo
    print_color "$BOLD" "QUICK COMMANDS:"
    echo "  $0 . local                             # Switch current directory to local"
    echo "  $0 . prod                              # Switch current directory to production"
    echo
    print_color "$BOLD" "DEFAULT PROJECT:"
    print_color "$CYAN" "  $DEFAULT_PROJECT"
    echo
    print_color "$BOLD" "LOCAL ENV-MANAGER PATH:"
    print_color "$CYAN" "  $ENV_MANAGER_LOCAL_PATH"
}

# Main execution
main() {
    print_header
    
    # Check if project path exists
    if [ ! -d "$PROJECT_PATH" ]; then
        print_color "$RED" "❌ Project path not found: $PROJECT_PATH"
        echo
        show_usage
        exit 1
    fi
    
    # Resolve relative paths
    PROJECT_PATH=$(cd "$PROJECT_PATH" && pwd)
    
    print_color "$BOLD" "📁 Project: $PROJECT_PATH"
    echo
    
    case "$MODE" in
        status)
            check_status "$PROJECT_PATH"
            ;;
        local)
            check_status "$PROJECT_PATH"
            echo
            swap_to_local "$PROJECT_PATH"
            echo
            check_status "$PROJECT_PATH"
            ;;
        prod|production)
            check_status "$PROJECT_PATH"
            echo
            swap_to_prod "$PROJECT_PATH"
            echo
            check_status "$PROJECT_PATH"
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            print_color "$RED" "❌ Invalid mode: $MODE"
            echo
            show_usage
            exit 1
            ;;
    esac
    
    echo
}

# Run main function
main