# Task Documentation Workflow

## Quick Reference

### 🎯 Quickest Commands (tm)
```bash
# Ultra-fast workflow with tm command
tm a "Fix login bug"     # Add task with plan
tm s login               # Start (begins file tracking)
tm update login          # Update progress
tm d login               # Done (complete with summary)
tm w                     # Show what's in progress
tm l                     # List all tasks
tm c                     # Show configuration
tm r                     # Release (changelog + version)

# Undo/Skip commands
tm undo                  # Undo last task (auto-detects)
tm undo login            # Move task back one stage
tm undo --with-files     # Undo and revert file changes
tm undo --no-files       # Undo task only, keep files
tm reopen login          # Reopen completed task
tm skip login todo       # Jump to specific stage
tm find login            # Find where task is located

# Smart search & history
tm search bug            # Advanced search with ranking
tm history               # Show task movement history
tm snapshot list         # View git state snapshots
```

### 🚀 Complete Task Workflow
```bash
# Using tm shortcuts
tm a "Implement new feature"      # Add with plan
tm s "new feature"                # Start with file tracking
tm update "new feature"           # Update progress  
tm d "new feature"                # Complete with summary
tm release                        # Generate changelog

# Or using full scripts
.claude/tasks/scripts/task-flow.sh add "Implement new feature"
.claude/tasks/scripts/task-flow.sh start "new feature"
.claude/tasks/scripts/task-flow.sh update "new feature"
.claude/tasks/scripts/task-flow.sh complete "new feature"
.claude/tasks/scripts/task-flow.sh release
```

### 📁 File Tracking
```bash
# Quick commands
tm files                          # Show tracked files
tm track <file> <desc>           # Track manually
tm detect                        # Auto-detect changes

# Full scripts
.claude/tasks/scripts/file-tracker.sh start "Task name"
.claude/tasks/scripts/file-tracker.sh detect
.claude/tasks/scripts/file-tracker.sh status
.claude/tasks/scripts/file-tracker.sh summary
.claude/tasks/scripts/file-tracker.sh stop
```

### 📝 Task Management
```bash
# Quick commands with tm
tm add "Description"             # Quick add
tm wip                          # Show in-progress
tm todo                         # Show TODO list
tm stats                        # Statistics
tm config                       # Show configuration
```

### 📚 Documentation Generation
```bash
# Quick commands
tm plan "Description"            # Generate plan
tm summary                       # Generate summary
tm changelog                     # Generate changelog

# Full scripts
.claude/tasks/scripts/task-doc.sh plan "Description"
.claude/tasks/scripts/task-doc.sh summary "Task" "files"
.claude/tasks/scripts/task-doc.sh changelog
```

### 📦 Release Process
```bash
# Quick release
tm release                       # Full release workflow
tm changelog                     # Generate changelog

# Full scripts
.claude/tasks/scripts/changelog-gen.sh preview      # Preview
.claude/tasks/scripts/changelog-gen.sh claude       # AI-assisted
.claude/tasks/scripts/release-tasks.sh              # Move to RELEASED
```

## Workflow Stages

### 1️⃣ TODO Stage
**When adding a task:**
- Problem statement
- Proposed solution
- Implementation steps
- Requirements
- Acceptance criteria

**Quick:** `tm a "Task description"`  
**Full:** `.claude/tasks/scripts/task-flow.sh add "Task description"`

### 2️⃣ IN-PROGRESS Stage
**When starting work:**
- Automatic file tracking begins
- Progress updates
- Blocker tracking
- Files modified list

**Quick:** `tm s "task pattern"`  
**Full:** `.claude/tasks/scripts/task-flow.sh start "task pattern"`

### 3️⃣ COMPLETED Stage
**When finishing:**
- Summary of accomplishment
- Implementation details
- Files changed with descriptions
- Testing performed
- Breaking changes noted

**Quick:** `tm d "task pattern"`  
**Full:** `.claude/tasks/scripts/task-flow.sh complete "task pattern"`

### 4️⃣ RELEASED Stage
**When releasing:**
- Changelog generation
- Version comparison links
- Categorized changes (Added/Fixed/Changed/Removed)

**Quick:** `tm release` or `tm r`  
**Full:** `.claude/tasks/scripts/task-flow.sh release`

## Pre-Completion Validation

### 🛡️ Automatic Code Quality Checks
Tasks cannot move to COMPLETED without passing validation (configurable):
```bash
# Automatic validation on completion
tm done "task"           # Runs validation first

# Skip validation if needed
tm done "task" --force   # Bypasses validation

# Manual validation
tm validate              # Run checks manually
tm validate fix          # Auto-fix issues
tm validate config       # Configure settings
```

### 🔍 Validation Commands
The system auto-detects available validation based on project type:
- **Node.js**: `typecheck`, `lint`, `test`, `build`
- **Python**: `ruff check`, `mypy`, `pytest`
- **Rust**: `cargo check`, `cargo clippy`
- **Go**: `go vet`, `golangci-lint`

### ⚙️ Configuration
Configure in `.claude/tasks/config.json`:
```json
"validation": {
  "enabled": true,          // Enable/disable validation
  "blockOnError": true,     // Block completion on errors
  "autoFix": false,         // Auto-fix issues
  "includeTests": false,    // Run tests in validation
  "includeBuild": false,    // Run build in validation
  "cacheTimeout": 300       // Cache validity (seconds)
}
```

## Features

### ✨ Automatic Features
- **File Tracking**: Files automatically tracked when modified
- **Claude Integration**: AI-assisted documentation generation
- **Git Hooks**: Post-commit file tracking
- **Changelog Format**: Keep a Changelog standard
- **Version Links**: GitHub comparison URLs
- **Git Snapshots**: Automatic state capture on task movements
- **Smart Undo**: Optionally revert file changes when undoing tasks

### 🔧 Manual Controls
- Progress updates
- Task categorization
- Priority settings
- Custom documentation

## Configuration

### Central Configuration (`.claude/tasks/config.json`)
- All task system settings in one place
- Enable/disable features
- Claude AI assistance toggles
- File tracking preferences
- Changelog generation options

### Configuration Management
```bash
# View current settings
task-config show

# Interactive configuration
task-config interactive

# Toggle specific features
task-config toggle .fileTracking.enabled
task-config set .workflow.maxInProgress 5
```

### Hooks (`.claude/settings.json`)
- PostToolUse hooks track file changes
- PreToolUse hooks for task validation
- Automatic file tracking on Edit/Write operations

### Scripts Location (`.claude/tasks/scripts/`)
All task-related scripts are now in:
- `task-manager.sh` - Core task management
- `task-flow.sh` - Integrated workflow
- `file-tracker.sh` - File modification tracking
- `changelog-gen.sh` - Changelog generation
- `task-config.sh` - Configuration manager
- `config-reader.sh` - Configuration utilities
- `task-validator.sh` - Pre-completion code validation
- `task-snapshot.sh` - Git state snapshots and reversion
- `task-undo.sh` - Smart undo with file reversion
- `task-search.sh` - Advanced task search with ranking
- `task-history.sh` - Task movement history tracking

### Templates (`.claude/templates/`)
- `todo-template.md` - TODO task structure
- `progress-template.md` - IN-PROGRESS updates
- `completed-template.md` - Completion documentation

## Git Snapshot System

### 🔄 Automatic Snapshots
Snapshots are automatically created when tasks move between stages, capturing:
- Current git commit hash
- Modified and staged files
- Uncommitted changes as patches
- Tracked file contents (if file tracking enabled)
- Task metadata and timestamps

### 📸 Snapshot Commands
```bash
# View snapshots
tm snapshot list              # List recent snapshots
tm snapshot preview <id>      # Preview what would be reverted
tm snapshot revert <id>       # Manually revert to snapshot
tm snapshot find <pattern>    # Find snapshots for a task
tm snapshot clean [days]      # Clean old snapshots (default: 30)
```

### 🔙 Smart Undo with File Reversion
```bash
# Simple undo (asks about files interactively)
tm undo

# Undo with automatic file reversion
tm undo --with-files

# Undo task movement only, keep file changes
tm undo --no-files

# Undo specific task with options
tm undo "login bug" --with-files
```

### 🛡️ Safety Features
1. **Conflict Detection**: Warns if files changed since snapshot
2. **Backup Branches**: Creates git backup before reverting
3. **Interactive Mode**: Choose which files to revert
4. **Preview Mode**: See changes before committing

### 📋 Reversion Options
When undoing a task, you have three options:
1. **Full Revert**: Restore files to snapshot state
2. **Task Only**: Move task back, keep current files
3. **Interactive**: Choose specific files to revert

### 💡 Example Workflow
```bash
# Start working on a feature
tm s "new feature"

# Make changes, create files, etc.
# ... work on the feature ...

# Complete the task
tm d "new feature"

# Oops! Something went wrong, need to undo
tm undo --with-files          # Reverts both task and files

# Or preview first
tm snapshot list               # Find the snapshot ID
tm snapshot preview 1755638187 # See what would change
tm snapshot revert 1755638187  # Revert if it looks good
```

## Best Practices

1. **Start Every Task**: Use `task-flow add` for documentation
2. **Track Files**: Always use `task-flow start` to begin tracking
3. **Update Progress**: Regular updates with `task-flow update`
4. **Complete Properly**: Use `task-flow complete` for summaries
5. **Regular Releases**: Generate changelogs for each version

## Example Complete Flow

```bash
# Quick workflow with tm:
tm a "Add user authentication system"    # Add with plan
tm s authentication                      # Start (auto file tracking)
tm update authentication                 # Update progress (optional)
tm d authentication                      # Complete with summary
tm r                                     # Release with changelog

# Or traditional workflow:
.claude/tasks/scripts/task-flow.sh add "Add user authentication system"
.claude/tasks/scripts/task-flow.sh start "authentication"
.claude/tasks/scripts/task-flow.sh update "authentication"
.claude/tasks/scripts/task-flow.sh complete "authentication"
.claude/tasks/scripts/task-flow.sh release
```

## Smart Task Management

### 🔍 Advanced Search
The smart search system ranks results by relevance:
```bash
# Basic search
tm search bug                 # Find all bug-related tasks

# Show all results (default: top 10)
tm search database --all      

# Interactive mode - select from results
tm search login --interactive
```

**Ranking System:**
- Title matches score higher than content matches
- Shows which stage each task is in
- Handles duplicates across stages
- Interactive mode for ambiguous searches

### 📜 Task History
Track all task movements with full audit trail:
```bash
# View recent history
tm history                    # Last 10 movements
tm history 20                 # Last 20 movements

# Search history for specific task
tm history search login       # History of 'login' task
tm history timeline bug       # Full timeline of bug task
```

**History Features:**
- Records who moved what, when, and where
- `.last-task` file always knows the most recent task
- Enables `tm undo` without specifying task name
- Complete audit trail for compliance

### 🎯 Smart Undo
The undo system is context-aware:
```bash
# Undo last action (no pattern needed!)
tm undo

# System automatically:
# - Finds the last task from history
# - Checks for available snapshots
# - Asks about file reversion
# - Handles conflicts gracefully
```

## Troubleshooting

### File Tracking Not Working
```bash
# Check if tracking is active
tm files  # or: .claude/tasks/scripts/file-tracker.sh status

# Manually detect changes
tm detect  # or: .claude/tasks/scripts/file-tracker.sh detect
```

### Claude Not Available
- Scripts will fall back to manual entry
- You can still use templates manually

### Hooks Not Firing
```bash
# Check hook registration
/hooks

# Verify settings.json
cat .claude/settings.json
```

---

*This workflow ensures complete documentation from problem definition to release notes.*