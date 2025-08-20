# Env-Manager Project Instructions for Claude

## CRITICAL: Task Checking System

**BEFORE STARTING ANY WORK**: Always check the current tasks to ensure you're working on the right thing.

### Task Check Commands (Run These First!)
```bash
# Check what's currently being worked on
.claude/task-manager.sh list wip

# Check the TODO list for next tasks
.claude/task-manager.sh list todo

# See all tasks overview
.claude/task-manager.sh stats
```

## Quick Task Commands

### Project Command: `tm` (Task Manager)
Located at project root, provides short commands for all task operations:

**Quick Usage:**
```bash
# Single letter shortcuts
tm a "Fix login bug"    # Add task with plan
tm s login              # Start task (begins file tracking)
tm d login              # Done/complete task with summary
tm w                    # Show what's in progress (WIP)
tm l                    # List all tasks
tm c                    # Show configuration

# Undo/Move commands
tm undo                 # Smart undo - auto-detects last task
tm undo login           # Move task back one stage
tm undo --with-files    # Undo and revert file changes
tm undo --no-files      # Undo task only, keep files
tm reopen login         # Reopen completed task
tm skip login todo      # Skip to specific stage
tm find login           # Find where task is

# Smart features
tm search bug           # Advanced search with ranking
tm history              # Task movement history
tm snapshot list        # View git state snapshots

# Other commands
tm update login         # Update progress
tm files               # Show tracked files
tm changelog           # Generate changelog
tm release             # Prepare release
```

### Even Shorter Aliases
Source `.claude/tasks/scripts/aliases.sh` for ultra-short commands:
```bash
ta "Fix bug"    # Task Add
ts bug          # Task Start
td bug          # Task Done
tw              # Task WIP
tl              # Task List
```

## Task Management Workflow

### Task Stages
1. **FUTURE** (`.claude/tasks/FUTURE.md`) - Ideas and someday/maybe items
2. **TODO** (`.claude/tasks/TODO.md`) - Planned work, prioritized backlog
3. **IN-PROGRESS** (`.claude/tasks/IN-PROGRESS.md`) - Currently active (max 1-3 items)
4. **COMPLETED** (`.claude/tasks/COMPLETED.md`) - Done but not released
5. **RELEASED** (`.claude/tasks/RELEASED.md`) - Released in a version

### Configuration
All settings in `.claude/tasks/config.json`:
- Enable/disable features
- Claude AI assistance
- File tracking preferences
- Changelog options

### Scripts Location
All task scripts in `.claude/tasks/scripts/`:
- `task-manager.sh` - Core task management
- `task-flow.sh` - Integrated workflow with documentation
- `file-tracker.sh` - Automatic file modification tracking
- `changelog-gen.sh` - Changelog generation
- `task-config.sh` - Configuration manager
- `task-snapshot.sh` - Git state snapshots and reversion
- `task-undo.sh` - Smart undo with file reversion
- `task-search.sh` - Advanced task search with ranking
- `task-history.sh` - Task movement history tracking

### When User Mentions Future Work

**Keywords to watch for:**
- "do this later", "in the future", "someday", "add to backlog"
- "we should", "it would be nice", "consider", "maybe"
- "todo", "remember to", "don't forget"

**Action:** Immediately capture using task manager:
```bash
# Quick add (auto-detects stage/priority/category)
.claude/task-manager.sh quick "[exact user description]"

# Or specific add
.claude/task-manager.sh add [stage] [category] [priority] "[description]"
```

### Before Starting Any Task

1. **Check IN-PROGRESS tasks**:
   ```bash
   tm w  # or: .claude/tasks/scripts/task-manager.sh list wip
   ```
   - If empty → Check TODO list
   - If has tasks → Continue working on those

2. **Pick from TODO if needed**:
   ```bash
   tm todo  # or: .claude/tasks/scripts/task-manager.sh list todo
   ```
   - Start with High Priority items
   - Move to IN-PROGRESS when starting:
   ```bash
   tm s "[task pattern]"  # or: .claude/tasks/scripts/task-manager.sh move "[task pattern]" wip
   ```

3. **When completing a task**:
   ```bash
   tm d "[task pattern]"  # or: .claude/tasks/scripts/task-manager.sh move "[task pattern]" done
   ```

## Task Categories & Auto-Detection

The system auto-detects based on keywords:

| Category | Keywords | Icon |
|----------|----------|------|
| feature | feature, add, implement | 🚀 |
| bug | bug, fix, broken, error | 🐛 |
| docs | doc, document, readme | 📚 |
| tech | refactor, cleanup, debt | 🔧 |
| idea | idea, maybe, consider | 💡 |
| ui | ui, ux, design, interface | 🎨 |
| security | security, auth, permission | 🔒 |
| perf | performance, speed, optimize | ⚡ |
| test | test, testing, spec | 🧪 |

## Priority Detection

| Priority | Keywords | Indicator |
|----------|----------|-----------|
| High | urgent, critical, asap, important | 🔴 |
| Medium | normal, standard | 🟡 |
| Low | minor, trivial, sometime | 🟢 |

## Stage Detection

| Stage | Keywords | Destination |
|-------|----------|-------------|
| FUTURE | future, someday, maybe, idea | `.claude/tasks/FUTURE.md` |
| TODO | todo, planned, backlog | `.claude/tasks/TODO.md` |
| IN-PROGRESS | now, urgent, immediately | `.claude/tasks/IN-PROGRESS.md` |

## Task Manager Commands Reference

```bash
# Adding tasks
.claude/task-manager.sh quick "Fix login bug"                    # Auto-detect everything
.claude/task-manager.sh add todo bug high "Fix memory leak"      # Specific placement

# Viewing tasks
.claude/task-manager.sh list                # All tasks
.claude/task-manager.sh list todo          # TODO only
.claude/task-manager.sh list wip           # IN-PROGRESS only
.claude/task-manager.sh stats              # Statistics overview

# Moving tasks
.claude/task-manager.sh move "login" wip   # Move to IN-PROGRESS
.claude/task-manager.sh move "login" done  # Mark as COMPLETED
.claude/task-manager.sh move "login" queue # Move to CHANGES-QUEUE

# Editing
.claude/task-manager.sh edit todo          # Open TODO file in editor
```

## Response Templates

### When adding a task:
```
✅ Added to [STAGE]
Category: [icon] [category]
Priority: [level]
Description: [task]

Current stats: X in TODO, Y in progress
```

### When user asks "what should I work on?":
```
Let me check the current tasks...

[Run: .claude/task-manager.sh list wip]
[Run: .claude/task-manager.sh list todo]

Based on the task list:
- Currently in progress: [list]
- High priority TODO: [list]

Recommendation: [specific task to work on]
```

### When starting work:
```
Starting work on: [task description]

[Run: .claude/task-manager.sh move "[task]" wip]

✅ Moved to IN-PROGRESS
Let's begin by...
```

## Integration with Release Process

### When user says "compile and bump":
1. Check COMPLETED tasks: `.claude/task-manager.sh list done`
2. Move completed items to `.claude/tasks/RELEASED.md`
3. Update changelog and version based on completed work
4. Run release process: `pnpm release:[type]`
5. Sync and publish to npm

## Project-Specific Commands

### Version Management
```bash
# Switch between local and production
env-manager version local      # Use local development
env-manager version production # Use npm package
env-manager version status     # Check current version
```

### Release Process
```bash
pnpm release:patch  # Bug fixes
pnpm release:minor  # New features
pnpm release:major  # Breaking changes
```

## Smart Task Management Features

### ✅ Pre-Completion Validation
Automatic code quality checks before completing tasks:
- **Auto-detects** available validation commands (typecheck, lint, tests)
- **Blocks completion** if validation fails (configurable)
- **Cache system** for fast repeated validations (5 min cache)
- **Auto-fix** support for linting issues

```bash
tm validate              # Run validation checks
tm validate fix          # Auto-fix issues
tm validate config       # Configure settings
tm validate status       # Check status

# Force completion without validation
tm done "task" --force
```

**Validation Features:**
- Supports npm/pnpm/yarn, Python, Rust, Go projects
- Configurable blocking behavior
- Optional test/build inclusion
- Smart caching to avoid redundant checks

### 🔄 Git Snapshot System
Automatic git state capture on task movements:
- Captures uncommitted changes, staged files, and diffs
- Tracks file contents for modified files
- Creates backup branches before reversion
- Conflict detection and preview mode

### 🔙 Smart Undo with File Reversion
```bash
tm undo                  # Auto-detects last task from history
tm undo --with-files     # Reverts both task and file changes
tm undo --no-files       # Moves task only, keeps files
```

**Reversion Options:**
1. Full revert - Restore files to snapshot state
2. Task only - Keep current files
3. Interactive - Choose specific files to revert

### 🔍 Advanced Search
Intelligent task search with ranking:
```bash
tm search bug            # Ranked results by relevance
tm search --interactive  # Pick from results menu
tm search --all         # Show all matches (default: top 10)
```

### 📜 Task History & Tracking
Complete audit trail of all movements:
```bash
tm history              # Recent task movements
tm history search login # History of specific task
```
- Enables `tm undo` without pattern
- `.last-task` file tracks most recent action
- Full timeline for any task

### 📸 Snapshot Management
```bash
tm snapshot list        # View recent snapshots
tm snapshot preview <id> # Preview changes
tm snapshot revert <id>  # Manual reversion
tm snapshot clean 7     # Clean old snapshots
```

## Important Rules

1. **ALWAYS** check tasks before starting work
2. **NEVER** have more than 3 tasks in IN-PROGRESS
3. **CAPTURE** every "do later" mention immediately
4. **MOVE** tasks through stages as work progresses
5. **CHECK** TODO list when IN-PROGRESS is empty
6. **PRIORITIZE** High priority items first
7. **USE SNAPSHOTS** for safe task/file reversion

## Task Flow Diagram

```
FUTURE → TODO → IN-PROGRESS → COMPLETED → RELEASED
   ↓       ↓         ↓            ↓           ↓
[Ideas] [Planned] [Active]   [Done]   → [Version Bump] → [npm publish]
```

---

*This file instructs Claude on task management and workflow for the env-manager project.*
*Always check tasks before starting any work!*