#!/bin/bash

# =============================================================================
# ENV-MANAGER QUICK SWAP ALIASES
# Add these to your ~/.bashrc or ~/.zshrc for quick access
# =============================================================================

# Main swap script path
export ENV_SWAP_SCRIPT="/home/cory-ubuntu/coding/projects/env-manager/scripts/swap-env-manager.sh"

# Quick swap commands
alias env-swap="$ENV_SWAP_SCRIPT"
alias env-status="$ENV_SWAP_SCRIPT . status"
alias env-local="$ENV_SWAP_SCRIPT . local"
alias env-prod="$ENV_SWAP_SCRIPT . prod"

# Project-specific shortcuts
alias env-swap-payload="$ENV_SWAP_SCRIPT /home/cory-ubuntu/coding/payload-auth-demo"
alias env-local-payload="$ENV_SWAP_SCRIPT /home/cory-ubuntu/coding/payload-auth-demo local"
alias env-prod-payload="$ENV_SWAP_SCRIPT /home/cory-ubuntu/coding/payload-auth-demo prod"

# Helper function for quick project swapping
env-project() {
    local project_name=$1
    local mode=${2:-status}
    
    # Map project names to paths
    case "$project_name" in
        payload|pa|auth)
            $ENV_SWAP_SCRIPT "/home/cory-ubuntu/coding/payload-auth-demo" "$mode"
            ;;
        env|manager|em)
            $ENV_SWAP_SCRIPT "/home/cory-ubuntu/coding/projects/env-manager" "$mode"
            ;;
        *)
            # Try to use as direct path
            if [ -d "$project_name" ]; then
                $ENV_SWAP_SCRIPT "$project_name" "$mode"
            else
                echo "Unknown project: $project_name"
                echo "Available shortcuts: payload, env"
                echo "Or provide full path to project"
            fi
            ;;
    esac
}

# Quick test command - swaps to local, runs command, then swaps back
env-test() {
    local project_path=${1:-.}
    local test_command=${2:-"pnpm dev"}
    
    echo "🧪 Testing with local env-manager..."
    $ENV_SWAP_SCRIPT "$project_path" local
    
    echo ""
    echo "📦 Running: $test_command"
    echo "Press Ctrl+C to stop..."
    
    # Run the test command
    (cd "$project_path" && eval "$test_command")
    
    echo ""
    echo "🔄 Reverting to production..."
    $ENV_SWAP_SCRIPT "$project_path" prod
}

# Installation helper
install-env-swap-aliases() {
    local shell_rc=""
    
    # Detect shell
    if [ -n "$ZSH_VERSION" ]; then
        shell_rc="$HOME/.zshrc"
    elif [ -n "$BASH_VERSION" ]; then
        shell_rc="$HOME/.bashrc"
    else
        echo "Unsupported shell. Please manually add to your shell config."
        return 1
    fi
    
    echo "📝 Adding env-swap aliases to $shell_rc..."
    
    # Check if already installed
    if grep -q "env-swap-aliases.sh" "$shell_rc"; then
        echo "✅ Aliases already installed!"
    else
        echo "" >> "$shell_rc"
        echo "# ENV-MANAGER swap aliases" >> "$shell_rc"
        echo "source /home/cory-ubuntu/coding/projects/env-manager/scripts/env-swap-aliases.sh" >> "$shell_rc"
        echo "✅ Aliases installed! Restart your shell or run: source $shell_rc"
    fi
}

# Show available commands
env-help() {
    echo "🔄 ENV-MANAGER SWAP COMMANDS"
    echo "=============================="
    echo ""
    echo "QUICK COMMANDS (current directory):"
    echo "  env-status         - Check current package status"
    echo "  env-local          - Switch to local testing version"
    echo "  env-prod           - Switch to production version"
    echo ""
    echo "GENERAL COMMAND:"
    echo "  env-swap [path] [mode]  - Swap for any project"
    echo ""
    echo "PROJECT SHORTCUTS:"
    echo "  env-project payload local   - Switch payload-auth-demo to local"
    echo "  env-project env prod        - Switch env-manager to prod"
    echo ""
    echo "TESTING:"
    echo "  env-test           - Test with local version, then revert"
    echo "  env-test . 'npm run build'  - Test specific command"
    echo ""
    echo "INSTALLATION:"
    echo "  install-env-swap-aliases    - Add to shell config"
}

# Print help on source
echo "✨ ENV-SWAP aliases loaded! Type 'env-help' for commands"