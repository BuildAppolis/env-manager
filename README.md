# 🔧 BuildAppolis Env-Manager

<div align="center">
  <img src="https://www.buildappolis.com/logo.png" alt="BuildAppolis Logo" width="200"/>
  
  **Enterprise-Grade Environment Variable Management System**
  
  [![License](https://img.shields.io/badge/license-BuildAppolis-blue.svg)](LICENSE)
  [![Website](https://img.shields.io/badge/website-buildappolis.com-green.svg)](https://www.buildappolis.com)
</div>

## 📋 Overview

BuildAppolis Env-Manager is a powerful, secure environment variable management system designed for modern applications. It provides encrypted storage, version control, snapshots, and validation for your environment configurations.

## ✨ Features

- 🔐 **Encrypted Storage** - Sensitive variables are encrypted at rest
- 🔑 **Secure Password** - Master password stored securely in user home directory
- 🔓 **Password Recovery** - Recovery phrase system for forgotten passwords
- 🌿 **Branch-Specific Variables** - Different configs for different git branches
- 📊 **Git Integration** - Shows branch info, commit status, and more
- 🔄 **Auto-Migration** - Automatic config file migrations on updates
- 📸 **Snapshots** - Create and restore configuration snapshots
- ✅ **Validation** - Validate requirements against project configurations
- 🎯 **Type-Safe** - Full TypeScript support
- 🌐 **Web UI** - Beautiful, responsive management interface
- 📦 **Export/Import** - Generate .env files with proper formatting
- 🏢 **Multi-Project** - Support for multiple project configurations
- 🚀 **Framework Support** - Works with Next.js, Astro, Vue, Nuxt, SvelteKit, and more

## 📝 Latest Updates

### v1.4.11 (2025-08-19)
- **Import/Export System**: Complete environment variable import/export with multiple formats (.env, .env.local, etc.)
- **Port Management**: Global port configuration with CLI commands for easy port switching
- **Dev Tools**: Package swapping utilities for seamless development/testing workflow
- **Multi-Project Fixes**: Critical validation fixes for multi-project support
- **Enhanced APIs**: Improved variables API with better branch detection and validation

### v1.4.10 (2025-08-19)
- **Critical Fix**: Resolved required variables validation for multi-project environments
- **Improved Validation**: Fixed branch detection and type guards for validation functions
- **Real-time Updates**: Required variables now update correctly when adding/deleting

## 📄 License

This software is licensed under the BuildAppolis License. Key points:

- ✅ **Free for personal/educational use**
- ✅ **Open source contributions welcome**
- ⚠️ **Commercial use requires license or cloud service**
- ❌ **Cannot redistribute as your own product**
- ❌ **Cannot remove BuildAppolis attribution**

See [LICENSE](LICENSE) for full terms.

## 🚀 Quick Start

### Install Globally (Recommended)

```bash
# Install env-manager globally
npm install -g @buildappolis/env-manager

# Now you can use env-manager command directly!
env-manager init

# This will:
# 1. Create env.config.ts template
# 2. Set up your password securely
# 3. Configure .env settings

# Start the service
env-manager start

# Open the UI
env-manager open
```

### Alternative: Use NPX (No Install)

```bash
# Run without installing
npx @buildappolis/env-manager init
```

### CLI Commands

Once installed globally, you can use these commands:

```bash
# Initialize project with env-manager
env-manager init

# Set or change master password
env-manager setup-password

# Recover password using recovery phrase
env-manager recover-password

# Start the service
env-manager start
env-manager start --project /path/to/project  # Start specific project

# List all registered projects
env-manager projects

# Check service status
env-manager status

# Open UI in browser
env-manager open

# Show help
env-manager --help
```

Access the UI at `http://localhost:3001`

## 🔄 Uninstall / Factory Reset

### Complete Uninstall (Remove Everything)

To completely remove env-manager and all its data:

```bash
# 1. Uninstall the package
npm uninstall -g @buildappolis/env-manager
# or
pnpm uninstall -g @buildappolis/env-manager

# 2. Remove all configuration and data files
rm -rf ~/.env-manager/            # Global config and passwords
rm -rf ~/.env-manager-registry/   # Project registry
rm -rf ~/.env-manager-data/       # Database files
```

### Factory Reset (Keep Package, Remove Data)

To reset env-manager to factory defaults without uninstalling:

```bash
# Remove all configuration files but keep the package
rm -rf ~/.env-manager/
rm -rf ~/.env-manager-registry/
rm -rf ~/.env-manager-data/

# You'll need to set up password again
env-manager setup-password
```

### Project-Specific Cleanup

To remove env-manager from a specific project:

```bash
# In your project directory
rm -f env.config.ts               # Remove config file
rm -f env.config.js               # Remove compiled config (if exists)
rm -rf .env-manager/              # Remove project-specific data
rm -rf .env-manager-logs/         # Remove log files

# If installed as dependency
npm uninstall @buildappolis/env-manager
# or
pnpm uninstall @buildappolis/env-manager
```

### Data Locations

Env-Manager stores data in the following locations:

| Data Type | Location | Purpose |
|-----------|----------|---------|
| Global Password | `~/.env-manager/credentials.json` | Master password and recovery phrase |
| Project Registry | `~/.env-manager-registry/registry.json` | List of all registered projects |
| Project Databases | `~/.env-manager-data/` | SQLite databases for each project |
| Project Logs | `<project>/.env-manager-logs/` | Runtime logs for each project |
| Project Config | `<project>/env.config.ts` | Project-specific configuration |

### Troubleshooting

If you're having issues:

1. **Password not working**: Try factory reset above
2. **Port conflicts**: Kill any running env-manager processes:
   ```bash
   pkill -f "env-manager"
   lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9
   ```
3. **Corrupted database**: Remove project database:
   ```bash
   rm -rf ~/.env-manager-data/<project-name>.db
   ```

## 🎯 Framework Integration

Env-Manager works seamlessly with all major frameworks. See our comprehensive [Framework Integration Guide](docs/FRAMEWORK_INTEGRATION.md) for detailed examples with:

- **Next.js** - Full support for server and client variables
- **Astro** - Perfect for static sites and SSR
- **Vue/Nuxt** - Runtime config integration
- **SvelteKit** - Environment variable management
- **Remix** - Server-side variable handling
- **Express/Node.js** - Traditional Node.js apps

Quick example with Next.js:
```bash
# Initialize in your Next.js project
env-manager init

# Start both env-manager and Next.js dev server
npm run dev  # Add "env-manager start &" to your dev script
```

### Integration with Your Project

```javascript
// env.config.ts in your project root
export default {
  projectName: 'My App',
  envManager: {
    enabled: true,
    url: 'http://localhost:3001',
    apiKey: process.env.ENV_MANAGER_API_KEY
  },
  requirements: {
    database: {
      required: true,
      variables: [
        { name: 'DATABASE_URL', required: true, sensitive: true },
        { name: 'DB_POOL_SIZE', required: false, default: '10' }
      ]
    }
  }
}
```

## 🐳 Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t buildappolis/env-manager .
docker run -p 3001:3001 -v $(pwd)/data:/app/data buildappolis/env-manager
```

## 🔧 Configuration

### Environment Variables

```bash
# Server Configuration
PORT=3001
HOST=0.0.0.0

# Security
ENV_MANAGER_PASSWORD=your-secure-password
ENCRYPTION_KEY=your-32-char-encryption-key

# Database
DATABASE_PATH=./data/env-manager.db

# Features
ENABLE_SNAPSHOTS=true
ENABLE_EXPORT=true
ENABLE_API=true
```

### Project Configuration

Create an `env.config.ts` in your project root:

```typescript
import type { EnvConfig } from '@buildappolis/env-manager'

export default {
  projectName: 'Your Project',
  projectVersion: '1.0.0',
  requirements: {
    core: {
      required: true,
      variables: [
        {
          name: 'NODE_ENV',
          required: true,
          validation: /^(development|staging|production)$/,
          description: 'Application environment'
        }
      ]
    }
  }
} satisfies EnvConfig
```

## 🏢 Commercial Use

For commercial use, you have two options:

### 1. Cloud Service (Recommended)
Use our managed cloud service at [www.buildappolis.com](https://www.buildappolis.com)
- No infrastructure management
- Automatic updates
- Premium support
- Team collaboration features

### 2. Commercial License
Purchase a commercial license for self-hosting:
- Full source code access
- Priority support
- Custom features
- White-label options (Enterprise)

Contact: [license@buildappolis.com](mailto:license@buildappolis.com)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

By contributing, you agree that your contributions will be licensed under the same license.

## 📚 Documentation

Full documentation is available at [docs.buildappolis.com/env-manager](https://docs.buildappolis.com/env-manager)

## 🛟 Support

- **Community**: [GitHub Issues](https://github.com/buildappolis/env-manager/issues)
- **Commercial**: [support@buildappolis.com](mailto:support@buildappolis.com)
- **Website**: [www.buildappolis.com](https://www.buildappolis.com)

## 🙏 Attribution

Built with ❤️ by [BuildAppolis](https://www.buildappolis.com)

---

<div align="center">
  <strong>BuildAppolis - Building Better Applications</strong>
  <br>
  <a href="https://www.buildappolis.com">Website</a> •
  <a href="https://github.com/buildappolis">GitHub</a> •
  <a href="https://twitter.com/buildappolis">Twitter</a>
</div>