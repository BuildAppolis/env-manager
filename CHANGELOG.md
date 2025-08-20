# Changelog

All notable changes to BuildAppolis Env-Manager will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.5.0] - 2025-08-20

### Added
- **Smart Task Management System (tm)**
  - Complete task workflow automation with TODO → IN-PROGRESS → COMPLETED → RELEASED stages
  - Pre-completion validation system with automatic code quality checks
  - Git-aware undo with file reversion capabilities
  - Advanced task search with relevance ranking
  - Complete task movement history and audit trail
  - Automatic file tracking for modified files during tasks
  - AI-assisted documentation generation with Claude integration

- **Pre-Completion Validation System**
  - Automatic code quality checks before task completion
  - Auto-detects typecheck, lint, test commands across project types
  - Supports Node.js, Python, Rust, Go projects
  - Configurable blocking with --force override option
  - Smart 5-minute cache for fast re-validation
  - Auto-fix support for linting issues

- **Git Snapshot System**
  - Automatic git state capture on task movements
  - Smart undo that can revert file changes
  - Conflict detection and backup branches
  - Interactive mode for selective file reversion
  - Preview changes before applying

- **Type-Safe Environment Variable Export**
  - Separate client/server TypeScript interfaces
  - Runtime validation with proper type definitions
  - Export button with preview and save functionality
  - Support for multiple TypeScript export formats

- **Enhanced Variable Management**
  - Advanced sorting and filtering with category grouping
  - Inline variable editing capabilities
  - Visual distinction between client (<) and server (=) variables
  - Smart clipboard import with env.config.ts matching
  - Automatic secret generation (UUID, JWT, API keys, passwords)

### Changed
- Variable cards now show type indicators and category grouping
- Import dialog enhanced with config matching and required variable detection
- Generate button (✨) added to UI for context-aware secret creation

### Fixed
- TypeScript errors with Lucide icon title props
- Missing hasPassword method in database API
- HotReloadManager method calls and event types
- ReloadEvent type correction from 'update' to 'variables_changed'

## [1.4.12] - 2025-08-19

### Fixed
- **Dynamic Port Configuration**: Fixed hardcoded port issue in astro.config.mjs
  - Now reads port from ~/.env-manager/config.json dynamically
  - Supports ENV_MANAGER_PORT environment variable override
  - Falls back to default port 3001 only if config cannot be read
  - Ensures the server uses the port configured via `env-manager port set` command

## [1.4.11] - 2025-08-19

### Added
- **Complete Import/Export System**
  - New ImportExportDialog component with full UI for import/export operations
  - Support for multiple export formats (.env, .env.local, .env.development, .env.production, .env.staging, custom)
  - Download as file or copy to clipboard functionality
  - Intelligent .env file parsing with variable extraction, comment processing, and category detection
  - Auto-detection of sensitive variables (SECRET, KEY, PASSWORD, TOKEN patterns)
  - Visual preview before import with color-coded indicators
  - Batch import with real-time success/error tracking

- **Global Port Management System**
  - New CLI commands: `env-manager port status`, `env-manager port set <port>`, `env-manager port restart`
  - Global port configuration stored in ~/.env-manager/config.json
  - Automatic project configuration updates across all env.config.ts files
  - Smart process management with existing instance detection and termination
  - Port conflict detection with --force override option
  - WebSocket port management (separate HTTP + WS ports)

- **Development Package Swapper Tools**
  - swap-env-manager.sh script for easy switching between npm and local versions
  - env-swap-aliases.sh with quick command aliases (env-local, env-prod, env-status, env-test)
  - Automatic package.json updates and clean package removal/installation
  - Support for multiple projects with path configuration
  - Color-coded status output and comprehensive documentation

### Changed
- Enhanced variables API with PUT method supporting projectPath parameter
- Improved branch detection when projectPath is provided
- Added Import/Export button integration to EnvManager8Bit UI

### Fixed
- PUT method authentication handling in variables API
- Process detection to avoid self-termination in port management
- Proper error handling for import failures
- Branch detection with projectPath parameter

## [1.4.10] - 2025-08-19

### Fixed
- **Critical: Fixed required variables validation for multi-project support**
  - Fixed branch detection in variables API when projectPath is provided
  - Fixed ProjectValidator to accept branch parameter for correct validation
  - Fixed validation error when validation object is not a RegExp
  - Required variables list now correctly updates when adding/deleting variables
  - PROJECT_STATUS API now properly validates against project-specific variables

### Improved
- **Enhanced multi-project environment variable management**
  - Variables API now correctly uses projectPath for branch detection
  - Project status endpoint properly validates project-specific configurations
  - Required variables section only shows truly missing variables
  - Real-time updates when variables are added or removed

### Technical
- Fixed TypeScript type errors in draft system ('none' type added to VariableChange)
- Fixed database getAllMetadata expression always truthy warning
- Added proper type guards for validation functions
- Improved error handling in project status validation

## [1.4.9] - 2025-08-19

### Fixed
- **Fixed login endpoint URL**
  - Changed from `/api/auth/login` to `/api/auth` (correct endpoint)
  - Added proper form wrapper for password field
  - Added autocomplete attribute for better browser support
  - Fixed "Password field is not contained in a form" warning

## [1.4.8] - 2025-08-19

### Fixed
- **CRITICAL: Fixed password authentication mismatch**
  - CLI was using 100,000 PBKDF2 iterations but server was using 10,000
  - This caused all password verifications to fail
  - Passwords now correctly authenticate in the UI
  - Standardized to 100,000 iterations for proper security

### Documentation
- **Added complete uninstall/factory reset instructions**
  - Documented how to completely remove env-manager and all data
  - Added factory reset procedure to reset to defaults
  - Listed all data storage locations for manual cleanup
  - Added troubleshooting section for common issues
  - Included project-specific cleanup instructions

## [1.4.7] - 2025-08-19

### Fixed
- **CRITICAL: Fixed broken password input masking**
  - Password prompt was showing alternating characters (h*e*l*l*o*1*2*3)
  - Completely rewrote password input handling using proper raw mode
  - Now correctly shows asterisks (*) for all typed characters
  - Fixed password not being saved/validated correctly
  - Properly handles backspace and special characters

## [1.4.6] - 2025-08-19

### Fixed
- **Added TypeScript config file support**
  - Added jiti dependency for loading `.ts` config files
  - Fixed "Unknown file extension" error when using env.config.ts
  - Config files now work with both TypeScript and JavaScript
- Resolved config validation issues in projects using TypeScript

## [1.4.5] - 2025-08-19

### Fixed
- **Critical fix for startup crashes when used as npm dependency**
  - Skip unnecessary rebuilds when dist folder exists
  - Use pre-built distribution files from npm package
  - Add `--rebuild` flag for forced rebuilds when needed
- Resolved EISDIR error when trying to read API directories as files
- Fixed build process when running from node_modules

## [1.4.4] - 2025-08-19

### Fixed
- **Complete fix for all import path issues**
  - Fixed all `@/lib/utils` imports to use relative paths
  - Fixed all `@/components/ui` imports in 8bit components
  - Corrected relative path depths for nested components
  - Thoroughly tested build process with global installation
- Resolved all Vite/Rollup module resolution errors
- Ensured compatibility with global npm/pnpm installations

## [1.4.3] - 2025-08-19

### Fixed
- **Critical**: Fixed remaining @/lib/utils imports in UI components
- Resolved all path alias issues for global npm installations
- Complete fix for Vite/Rollup build failures

## [1.4.2] - 2025-08-19

### Fixed
- **Critical**: Fixed import paths in UI components to use relative paths instead of aliases
- **Critical**: Resolved build failures when running from globally installed package
- Fixed Vite/Rollup import resolution issues for global npm installations

## [1.4.1] - 2025-08-19

### Fixed
- Password masking clarification - asterisks display correctly in TTY mode
- Project tooltip now shows full path on hover
- Improved error messages for password setup

### Changed
- Minor UI improvements in ProjectSelector component

## [1.4.0] - 2025-08-19

### Added
- 🎯 **Project Selector UI** - Visual project management interface
  - Live status indicators showing running/stopped projects
  - Git branch display for each project
  - Start/stop/remove project controls
  - Project metadata display (version, description)
- 🔐 **Web-Based Password Management** - Complete password UI
  - First-time setup wizard via web interface
  - Password recovery with recovery phrases
  - Change password functionality
  - Project-specific password support
- 📡 **Project Management API** - RESTful endpoints for project control
  - `/api/projects` - List and manage projects
  - `/api/password` - Password operations (setup, verify, change, recover)
  - Project status checking and control
- 🎨 **Enhanced UI/UX**
  - Page title shows project name and git branch: `projectName[branch] | Env Manager | BuildAppolis`
  - Project info display in CLI (name, version, path)
  - Better env.config.ts/js detection
  - TTY detection for password prompts
- 🔧 **Improved CLI Experience**
  - Global password required once per machine
  - Optional project-specific passwords
  - Current project display in help menu
  - Fixed password setup flow

### Fixed
- Password prompt handling in non-TTY environments
- env.config.ts detection in project directories
- Project registration and port assignment

## [1.3.0] - 2025-08-19

### Added
- 🔥 **Hot-Reload System** - Real-time environment variable updates without server restart
  - WebSocket server for instant notifications
  - Client library with framework integrations (Next.js, Astro, Vue, SvelteKit)
  - Beautiful loading overlay and toast notifications
  - Configurable auto-reload with delay settings
- 🌿 **Branch-Specific Variables** - Different configs for different git branches
  - Auto-detection of current git branch
  - Branch inheritance strategies (inherit, isolate, merge)
  - Environment mapping (dev, staging, prod)
  - CLI commands for branch management
- 📊 **Git Integration** - Complete git information in project status
  - Shows branch, commit, author, dirty status
  - Ahead/behind tracking for remote branches
  - Tag detection at current commit
- 🔄 **Config Migration System** - Automatic config file upgrades
  - Version tracking and migration
  - Backup creation before migration
  - Branch-aware config loading
- 🔑 **Secure Password Storage** - Master password in home directory
  - Credentials stored in `~/.env-manager/credentials.json`
  - Recovery phrase system for forgotten passwords
  - Backward compatibility with project .env files
- 🏢 **Multi-Project Support** - Manage multiple projects simultaneously
  - Project registry with unique ports
  - Custom port configuration per project
  - Project switching and listing
- 📚 **Comprehensive Documentation**
  - Framework Integration Guide
  - Branch Configuration Guide
  - Hot-reload setup instructions

### Changed
- Password storage moved from project `.env` to secure home directory location
- Variables API now supports branch-specific storage
- Project status endpoint includes git information
- Database structure enhanced for hot-reload settings
- CLI enhanced with new commands: `branch`, `branch-list`, `branch-copy`, `configure`, `recover-password`, `projects`

### Fixed
- Build errors with missing imports and CSS dependencies
- Config loading now uses PROJECT_ROOT environment variable
- Password prompt hanging issue in CLI
- Vite alias configuration for proper path resolution
- Project-specific env.config.ts loading

## [1.2.0] - 2025-08-19

### Added
- 

### Changed
- 

### Fixed
- 

## [1.1.0] - 2025-08-19

### Added
- 🎮 Complete 8-bit retro gaming UI theme using 8bitcn-ui components
- 🎨 React-based interactive components with shadcn/ui integration
- 🔒 Custom lock-themed favicon with gradient design
- 📱 Responsive 8-bit styled interface with CRT monitor effects
- ⚡ Tailwind CSS v4 with Vite plugin for improved performance
- 🎵 Sound effect placeholders for user interactions
- 🏷️ Dynamic page titles with project name support
- 🖼️ Animated retro grid background with scanline effects
- 🎯 Press Start 2P font for authentic pixel-art typography

### Changed
- Migrated from Astro components to React components for better interactivity
- Updated to Tailwind CSS v4 with modern CSS-based configuration
- Redesigned entire UI with 8-bit gaming aesthetic
- Improved CLI commands for simpler usage (env-manager instead of npx)
- Enhanced page title structure: [Project] | Env Manager | BuildAppolis

### Fixed
- Astro build configuration for Tailwind v4 compatibility
- TypeScript configuration for React JSX support
- Path aliases for proper module resolution

## [1.0.5] - 2025-08-18

### Added
- 

### Changed
- 

### Fixed
- 

## [1.0.4] - 2025-08-18

### Added
- `DevServerConfig` interface for development server configuration
- `projectVersion` property to ProjectConfig for project versioning
- `envManagerVersion` property to ProjectConfig for version compatibility
- `devServer` property to ProjectConfig for dev server settings
- Export DevServerConfig and CustomValidation types in index.ts

### Fixed
- Missing properties from original env-manager implementation
- Full compatibility with env.config.ts structure

## [1.0.3] - 2025-08-18

### Added
- `example` property to ProjectVariableConfig for showing example values
- `CustomValidation` interface for custom validation functions
- `customValidation` property to ProjectValidation interface

### Fixed
- Missing type exports for CustomValidation interface

## [1.0.2] - 2025-08-18

### Added
- `type` property to ProjectVariableConfig for variable type hints ('url', 'email', 'json', etc.)
- `generate` property for automatic value generation strategies ('uuid', 'crypto', 'password')
- `default` as an alias for `defaultValue` for better compatibility

### Fixed
- TypeScript interface compatibility with env.config.ts usage

## [1.0.1] - 2024-08-18

### Added
- Proper TypeScript type exports in package.json
- Main index.ts file for centralized exports
- Export mappings for better module resolution
- Files field in package.json to control published content

### Fixed
- TypeScript types not being accessible when importing the package
- Module resolution issues with TypeScript projects

### Changed
- Main entry point changed from dist/server/entry.mjs to index.ts
- Added explicit exports field for better ESM support

## [1.0.0] - 2024-08-18

### Added
- Initial release of BuildAppolis Env-Manager
- Web-based UI for managing environment variables
- Encrypted storage using SQLite database
- Snapshot functionality for versioning configurations
- Project validation against env.config.ts requirements
- Docker support with Dockerfile and docker-compose.yml
- Astro-based frontend with TypeScript
- API endpoints for programmatic access
- BuildAppolis custom license for commercial protection
- Export functionality for .env and .env.example files
- Categories and filtering for variable organization
- Password protection for sensitive operations
- Modular component architecture
- Optimized bundle size (14KB JS, 3.6KB gzipped)

### Security
- Sensitive variables are automatically encrypted at rest
- Password-based authentication for access control
- Secure export with password confirmation

[Unreleased]: https://github.com/buildappolis/env-manager/compare/v1.4.12...HEAD
[1.4.12]: https://github.com/buildappolis/env-manager/compare/v1.4.11...v1.4.12
[1.4.11]: https://github.com/buildappolis/env-manager/compare/v1.4.10...v1.4.11
[1.3.0]: https://github.com/buildappolis/env-manager/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/buildappolis/env-manager/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/buildappolis/env-manager/compare/v1.0.5...v1.1.0
[1.0.5]: https://github.com/buildappolis/env-manager/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/buildappolis/env-manager/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/buildappolis/env-manager/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/buildappolis/env-manager/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/buildappolis/env-manager/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/buildappolis/env-manager/releases/tag/v1.0.0