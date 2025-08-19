# Changelog

All notable changes to BuildAppolis Env-Manager will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/buildappolis/env-manager/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/buildappolis/env-manager/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/buildappolis/env-manager/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/buildappolis/env-manager/compare/v1.0.5...v1.1.0
[1.0.5]: https://github.com/buildappolis/env-manager/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/buildappolis/env-manager/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/buildappolis/env-manager/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/buildappolis/env-manager/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/buildappolis/env-manager/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/buildappolis/env-manager/releases/tag/v1.0.0