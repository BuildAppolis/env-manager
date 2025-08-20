#!/bin/bash

# Task Validation System
# Ensures code quality checks pass before completing tasks

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
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TASKS_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$(dirname "$TASKS_DIR")")"
CONFIG_FILE="$TASKS_DIR/config.json"
VALIDATION_CACHE="$TASKS_DIR/.validation-cache"
VALIDATION_LOG="$TASKS_DIR/.validation-log"

# Ensure directories exist
mkdir -p "$TASKS_DIR"

# Load configuration
VALIDATION_ENABLED=true
BLOCK_ON_ERROR=true
AUTO_FIX=false

if [ -f "$CONFIG_FILE" ]; then
    VALIDATION_ENABLED=$(jq -r '.validation.enabled // true' "$CONFIG_FILE" 2>/dev/null || echo "true")
    BLOCK_ON_ERROR=$(jq -r '.validation.blockOnError // true' "$CONFIG_FILE" 2>/dev/null || echo "true")
    AUTO_FIX=$(jq -r '.validation.autoFix // false' "$CONFIG_FILE" 2>/dev/null || echo "false")
fi

# Function to detect project type and available commands
detect_project_commands() {
    local commands=()
    
    # Check for Node.js project
    if [ -f "$PROJECT_ROOT/package.json" ]; then
        # Check package manager
        if [ -f "$PROJECT_ROOT/pnpm-lock.yaml" ]; then
            PKG_MANAGER="pnpm"
        elif [ -f "$PROJECT_ROOT/yarn.lock" ]; then
            PKG_MANAGER="yarn"
        else
            PKG_MANAGER="npm"
        fi
        
        # Check for available scripts
        if grep -q '"lint"' "$PROJECT_ROOT/package.json"; then
            commands+=("$PKG_MANAGER run lint")
        fi
        
        if grep -q '"type-check"' "$PROJECT_ROOT/package.json"; then
            commands+=("$PKG_MANAGER run type-check")
        elif grep -q '"typecheck"' "$PROJECT_ROOT/package.json"; then
            commands+=("$PKG_MANAGER run typecheck")
        elif grep -q '"tsc"' "$PROJECT_ROOT/package.json"; then
            commands+=("$PKG_MANAGER run tsc")
        fi
        
        if grep -q '"test"' "$PROJECT_ROOT/package.json" && [ "$1" == "include-tests" ]; then
            commands+=("$PKG_MANAGER run test")
        fi
        
        if grep -q '"build"' "$PROJECT_ROOT/package.json" && [ "$1" == "include-build" ]; then
            commands+=("$PKG_MANAGER run build")
        fi
    fi
    
    # Check for Python project
    if [ -f "$PROJECT_ROOT/pyproject.toml" ] || [ -f "$PROJECT_ROOT/setup.py" ]; then
        # Check for ruff
        if command -v ruff &> /dev/null; then
            commands+=("ruff check .")
        elif [ -f "$PROJECT_ROOT/.ruff.toml" ]; then
            commands+=("python -m ruff check .")
        fi
        
        # Check for mypy
        if [ -f "$PROJECT_ROOT/mypy.ini" ] || [ -f "$PROJECT_ROOT/setup.cfg" ]; then
            if command -v mypy &> /dev/null; then
                commands+=("mypy .")
            fi
        fi
        
        # Check for pytest
        if [ -d "$PROJECT_ROOT/tests" ] && [ "$1" == "include-tests" ]; then
            if command -v pytest &> /dev/null; then
                commands+=("pytest")
            fi
        fi
    fi
    
    # Check for Rust project
    if [ -f "$PROJECT_ROOT/Cargo.toml" ]; then
        commands+=("cargo check")
        commands+=("cargo clippy -- -D warnings")
        
        if [ "$1" == "include-tests" ]; then
            commands+=("cargo test")
        fi
    fi
    
    # Check for Go project
    if [ -f "$PROJECT_ROOT/go.mod" ]; then
        commands+=("go vet ./...")
        commands+=("golangci-lint run")
        
        if [ "$1" == "include-tests" ]; then
            commands+=("go test ./...")
        fi
    fi
    
    printf '%s\n' "${commands[@]}"
}

# Function to run validation checks
run_validation() {
    local mode="${1:-pre-complete}"  # pre-complete, manual, ci
    local fix="${2:-false}"
    
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}🔍 Running Task Validation${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Detect available commands
    local commands=()
    mapfile -t commands < <(detect_project_commands)
    
    if [ ${#commands[@]} -eq 0 ]; then
        echo -e "${YELLOW}⚠️  No validation commands found${NC}"
        echo "Add lint/typecheck scripts to package.json or configure validation"
        return 0
    fi
    
    echo -e "${BLUE}Found ${#commands[@]} validation command(s):${NC}"
    for cmd in "${commands[@]}"; do
        echo "  • $cmd"
    done
    echo ""
    
    # Track results
    local has_errors=false
    local error_count=0
    local warning_count=0
    local validation_results=()
    
    # Run each validation command
    for cmd in "${commands[@]}"; do
        echo -e "${CYAN}Running: $cmd${NC}"
        
        # Create temp file for output
        local temp_output=$(mktemp)
        
        # Run command and capture output
        if (cd "$PROJECT_ROOT" && eval "$cmd" > "$temp_output" 2>&1); then
            echo -e "${GREEN}✓ $cmd passed${NC}"
            validation_results+=("✓ $cmd")
        else
            local exit_code=$?
            echo -e "${RED}✗ $cmd failed (exit code: $exit_code)${NC}"
            
            # Show error output
            if [ -s "$temp_output" ]; then
                echo -e "${YELLOW}Output:${NC}"
                head -n 20 "$temp_output" | sed 's/^/  /'
                
                # Count errors/warnings
                local err_cnt=$(grep -ciE "(error|ERROR)" "$temp_output" 2>/dev/null || echo 0)
                local warn_cnt=$(grep -ciE "(warning|WARN)" "$temp_output" 2>/dev/null || echo 0)
                error_count=$((error_count + err_cnt))
                warning_count=$((warning_count + warn_cnt))
                
                if [ $(wc -l < "$temp_output") -gt 20 ]; then
                    echo "  ... (truncated, $(wc -l < "$temp_output") total lines)"
                fi
            fi
            
            validation_results+=("✗ $cmd (exit: $exit_code)")
            has_errors=true
            
            # Try auto-fix if enabled
            if [ "$fix" == "true" ] || [ "$AUTO_FIX" == "true" ]; then
                echo -e "${YELLOW}Attempting auto-fix...${NC}"
                
                # Determine fix command
                local fix_cmd=""
                if [[ "$cmd" == *"lint"* ]]; then
                    fix_cmd="${cmd} --fix"
                elif [[ "$cmd" == *"ruff"* ]]; then
                    fix_cmd="$cmd --fix"
                fi
                
                if [ -n "$fix_cmd" ]; then
                    echo -e "${CYAN}Running: $fix_cmd${NC}"
                    if (cd "$PROJECT_ROOT" && eval "$fix_cmd" > /dev/null 2>&1); then
                        echo -e "${GREEN}✓ Auto-fix applied${NC}"
                        
                        # Re-run original command
                        if (cd "$PROJECT_ROOT" && eval "$cmd" > /dev/null 2>&1); then
                            echo -e "${GREEN}✓ $cmd now passes after fix${NC}"
                            has_errors=false
                        fi
                    fi
                fi
            fi
        fi
        
        rm -f "$temp_output"
        echo ""
    done
    
    # Log results
    {
        echo "$(date -Iseconds) | Mode: $mode"
        printf '%s\n' "${validation_results[@]}"
        echo "Errors: $error_count, Warnings: $warning_count"
        echo "---"
    } >> "$VALIDATION_LOG"
    
    # Summary
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    if [ "$has_errors" == "false" ]; then
        echo -e "${GREEN}✅ All validation checks passed!${NC}"
        
        # Cache successful validation
        date +%s > "$VALIDATION_CACHE"
        
        return 0
    else
        echo -e "${RED}❌ Validation failed!${NC}"
        echo -e "${YELLOW}Summary:${NC}"
        echo "  • Errors: $error_count"
        echo "  • Warnings: $warning_count"
        echo ""
        
        if [ "$mode" == "pre-complete" ] && [ "$BLOCK_ON_ERROR" == "true" ]; then
            echo -e "${RED}Cannot complete task with validation errors${NC}"
            echo ""
            echo -e "${YELLOW}Options:${NC}"
            echo "  1. Fix the errors and try again"
            echo "  2. Run with --fix to attempt auto-fix"
            echo "  3. Use --force to skip validation (not recommended)"
            echo "  4. Disable validation in config"
            
            return 1
        else
            echo -e "${YELLOW}⚠️  Continuing despite validation errors${NC}"
            return 0
        fi
    fi
}

# Function to check if validation is needed
needs_validation() {
    # Check if validation is enabled
    if [ "$VALIDATION_ENABLED" != "true" ]; then
        return 1
    fi
    
    # Check cache (valid for 5 minutes)
    if [ -f "$VALIDATION_CACHE" ]; then
        local cache_time=$(cat "$VALIDATION_CACHE")
        local current_time=$(date +%s)
        local age=$((current_time - cache_time))
        
        if [ $age -lt 300 ]; then
            echo -e "${GREEN}✓ Using cached validation (${age}s old)${NC}"
            return 1
        fi
    fi
    
    return 0
}

# Function to configure validation
configure_validation() {
    echo -e "${CYAN}Task Validation Configuration${NC}"
    echo ""
    
    # Current settings
    echo -e "${BLUE}Current Settings:${NC}"
    echo "  Validation Enabled: $VALIDATION_ENABLED"
    echo "  Block on Error: $BLOCK_ON_ERROR"
    echo "  Auto-Fix: $AUTO_FIX"
    echo ""
    
    # Menu
    echo -e "${YELLOW}Options:${NC}"
    echo "  1. Toggle validation (currently: $VALIDATION_ENABLED)"
    echo "  2. Toggle blocking (currently: $BLOCK_ON_ERROR)"
    echo "  3. Toggle auto-fix (currently: $AUTO_FIX)"
    echo "  4. Clear validation cache"
    echo "  5. View validation log"
    echo "  6. Exit"
    
    read -p "Choice [1-6]: " choice
    
    case $choice in
        1)
            if [ "$VALIDATION_ENABLED" == "true" ]; then
                jq '.validation.enabled = false' "$CONFIG_FILE" > "$CONFIG_FILE.tmp" && mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
                echo -e "${GREEN}✓ Validation disabled${NC}"
            else
                jq '.validation.enabled = true' "$CONFIG_FILE" > "$CONFIG_FILE.tmp" && mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
                echo -e "${GREEN}✓ Validation enabled${NC}"
            fi
            ;;
        2)
            if [ "$BLOCK_ON_ERROR" == "true" ]; then
                jq '.validation.blockOnError = false' "$CONFIG_FILE" > "$CONFIG_FILE.tmp" && mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
                echo -e "${GREEN}✓ Blocking disabled${NC}"
            else
                jq '.validation.blockOnError = true' "$CONFIG_FILE" > "$CONFIG_FILE.tmp" && mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
                echo -e "${GREEN}✓ Blocking enabled${NC}"
            fi
            ;;
        3)
            if [ "$AUTO_FIX" == "true" ]; then
                jq '.validation.autoFix = false' "$CONFIG_FILE" > "$CONFIG_FILE.tmp" && mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
                echo -e "${GREEN}✓ Auto-fix disabled${NC}"
            else
                jq '.validation.autoFix = true' "$CONFIG_FILE" > "$CONFIG_FILE.tmp" && mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
                echo -e "${GREEN}✓ Auto-fix enabled${NC}"
            fi
            ;;
        4)
            rm -f "$VALIDATION_CACHE"
            echo -e "${GREEN}✓ Cache cleared${NC}"
            ;;
        5)
            if [ -f "$VALIDATION_LOG" ]; then
                tail -n 50 "$VALIDATION_LOG"
            else
                echo "No validation log found"
            fi
            ;;
        6)
            exit 0
            ;;
    esac
}

# Main command handler
case "${1:-}" in
    check|validate)
        run_validation "${2:-manual}" "${3:-false}"
        ;;
    
    pre-complete)
        if needs_validation; then
            run_validation "pre-complete" "$2"
        fi
        ;;
    
    fix)
        run_validation "manual" "true"
        ;;
    
    config|configure)
        configure_validation
        ;;
    
    status)
        echo -e "${CYAN}Validation Status${NC}"
        echo ""
        
        if [ "$VALIDATION_ENABLED" == "true" ]; then
            echo -e "${GREEN}✓ Validation is enabled${NC}"
        else
            echo -e "${YELLOW}⚠ Validation is disabled${NC}"
        fi
        
        if [ -f "$VALIDATION_CACHE" ]; then
            local cache_time=$(cat "$VALIDATION_CACHE")
            local current_time=$(date +%s)
            local age=$((current_time - cache_time))
            echo "Last successful validation: ${age}s ago"
        fi
        
        # Show available commands
        echo ""
        echo -e "${BLUE}Available validation commands:${NC}"
        mapfile -t commands < <(detect_project_commands)
        for cmd in "${commands[@]}"; do
            echo "  • $cmd"
        done
        ;;
    
    detect)
        detect_project_commands "$2"
        ;;
    
    help|--help|-h|*)
        echo -e "${CYAN}Task Validation System${NC}"
        echo ""
        echo -e "${YELLOW}Usage:${NC}"
        echo -e "  ${GREEN}task-validator${NC} <command> [options]"
        echo ""
        echo -e "${YELLOW}Commands:${NC}"
        echo -e "  ${GREEN}check${NC}              Run validation checks"
        echo -e "  ${GREEN}pre-complete${NC}       Pre-completion validation"
        echo -e "  ${GREEN}fix${NC}                Run with auto-fix"
        echo -e "  ${GREEN}config${NC}             Configure validation"
        echo -e "  ${GREEN}status${NC}             Show validation status"
        echo -e "  ${GREEN}detect${NC}             Detect available commands"
        echo ""
        echo -e "${YELLOW}Options:${NC}"
        echo -e "  --fix              Attempt to auto-fix issues"
        echo -e "  --force            Skip validation (with warning)"
        echo ""
        echo -e "${YELLOW}Examples:${NC}"
        echo -e "  task-validator check"
        echo -e "  task-validator fix"
        echo -e "  task-validator pre-complete"
        exit 1
        ;;
esac