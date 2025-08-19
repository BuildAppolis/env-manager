# ENV-MANAGER Package Swapper Scripts

Quick and easy scripts to swap between production npm package and local development version for testing.

## 🚀 Quick Start

### Install Aliases (Recommended)
```bash
# Source the aliases in your current shell
source /home/cory-ubuntu/coding/projects/env-manager/scripts/env-swap-aliases.sh

# Or install permanently to your shell config
source /home/cory-ubuntu/coding/projects/env-manager/scripts/env-swap-aliases.sh
install-env-swap-aliases
```

### Quick Commands (After Installing Aliases)
```bash
# Check current status
env-status

# Switch current project to local testing version
env-local

# Switch current project back to production
env-prod

# Get help
env-help
```

## 📦 Main Script Usage

### Basic Commands
```bash
# Check status of default project (payload-auth-demo)
./swap-env-manager.sh

# Check status of specific project
./swap-env-manager.sh /path/to/project

# Switch to local testing version
./swap-env-manager.sh /path/to/project local

# Switch back to production npm version
./swap-env-manager.sh /path/to/project prod
```

### Examples
```bash
# Switch payload-auth-demo to local version
./swap-env-manager.sh /home/cory-ubuntu/coding/payload-auth-demo local

# Switch current directory to production
./swap-env-manager.sh . prod

# Check status of any project
./swap-env-manager.sh ~/coding/my-project status
```

## 🎯 Project Shortcuts (With Aliases)

```bash
# Quick project switching
env-project payload local    # Switch payload-auth-demo to local
env-project payload prod     # Switch payload-auth-demo to production
env-project env local        # Switch env-manager itself to local
```

## 🧪 Testing Workflow

```bash
# 1. Make changes to env-manager
cd /home/cory-ubuntu/coding/projects/env-manager
# ... edit files ...

# 2. Build the changes
pnpm build

# 3. Switch test project to local version
env-local  # or: ./swap-env-manager.sh . local

# 4. Test your changes
pnpm dev

# 5. When done, switch back to production
env-prod  # or: ./swap-env-manager.sh . prod
```

## 🔄 Test Command

The `env-test` function (available with aliases) automatically:
1. Swaps to local version
2. Runs your test command
3. Swaps back to production when done

```bash
# Test with default command (pnpm dev)
env-test

# Test with custom command
env-test . "pnpm build"
env-test /path/to/project "npm run test"
```

## 📁 Configuration

Default paths are configured in the scripts:
- **Local env-manager:** `/home/cory-ubuntu/coding/projects/env-manager`
- **Default test project:** `/home/cory-ubuntu/coding/payload-auth-demo`

To change defaults, edit the variables at the top of `swap-env-manager.sh`:
```bash
ENV_MANAGER_LOCAL_PATH="/your/path/to/env-manager"
DEFAULT_PROJECT="/your/default/project"
```

## 🎨 Visual Indicators

The script uses color coding for clarity:
- 🟢 **Green:** Production npm version
- 🔵 **Cyan:** Local file version
- 🟡 **Yellow:** Actions in progress
- 🔴 **Red:** Errors

## 💡 Tips

1. **Always rebuild after changes:** When testing local changes, remember to run `pnpm build` in the env-manager directory after making modifications.

2. **Check status first:** Run status before swapping to see what version is currently installed.

3. **Use aliases for speed:** Install the aliases for much faster switching.

4. **Project detection:** The script automatically detects if a project uses env-manager by checking package.json.

## 🐛 Troubleshooting

### "Project path not found"
- Make sure the path exists and is correct
- Use `.` for current directory
- Use full absolute paths for clarity

### "Package not switching"
- Check if pnpm is installed and working
- Ensure you have write permissions to the project
- Try removing node_modules and reinstalling

### "Local changes not reflecting"
- Make sure to run `pnpm build` in env-manager after changes
- Check that the local path is correct
- Verify the link with `pnpm list @buildappolis/env-manager`

## 📝 Notes

- The script uses `pnpm` for package management
- Local version uses `file:` protocol for linking
- Production version installs from npm registry
- All changes are reflected in the project's package.json