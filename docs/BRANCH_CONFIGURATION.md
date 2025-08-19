# 🌿 Branch-Specific Environment Configuration

BuildAppolis Env-Manager supports sophisticated branch-specific environment variable management, allowing you to maintain different configurations for different git branches.

## Table of Contents
- [Overview](#overview)
- [Basic Configuration](#basic-configuration)
- [Branch Strategies](#branch-strategies)
- [Environment Mapping](#environment-mapping)
- [CLI Commands](#cli-commands)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

## Overview

Branch-specific variables allow you to:
- Maintain different API endpoints for feature branches
- Use staging databases for development branches
- Automatically switch configurations when changing branches
- Deploy branch-specific builds with proper environment variables

## Basic Configuration

### Enable Branch Support

Add branch configuration to your `env.config.ts`:

```typescript
// env.config.ts
export default {
  projectName: 'My App',
  version: '1.1.0', // Required for migrations
  
  // Branch configuration
  branches: {
    enabled: true,
    strategy: 'inherit', // How to handle branch variables
    main: 'main', // Your main branch name
    
    // Map branches to environments
    environments: {
      development: ['dev', 'develop', 'feature/*'],
      staging: ['staging', 'release/*', 'hotfix/*'],
      production: ['main', 'master', 'prod']
    }
  },
  
  // Base requirements (apply to all branches by default)
  requirements: {
    database: {
      required: true,
      variables: [
        {
          name: 'DATABASE_URL',
          description: 'Database connection string',
          sensitive: true
        }
      ]
    }
  },
  
  // Branch-specific requirements (optional)
  branchRequirements: {
    'staging': {
      database: {
        variables: [
          {
            name: 'DATABASE_URL',
            default: 'postgresql://staging-db:5432/myapp_staging'
          }
        ]
      }
    },
    'feature/*': {
      api: {
        variables: [
          {
            name: 'API_URL',
            default: 'http://localhost:3000/api'
          }
        ]
      }
    }
  }
}
```

## Branch Strategies

### 1. Inherit Strategy (Default)
Branch-specific variables override base variables with the same name:

```typescript
branches: {
  strategy: 'inherit'
}
```

- Base variables are used as defaults
- Branch variables override matching base variables
- Non-conflicting variables are merged

### 2. Isolate Strategy
Each branch has completely separate variables:

```typescript
branches: {
  strategy: 'isolate'
}
```

- Branches don't share any variables
- Each branch must define all required variables
- No fallback to base configuration

### 3. Merge Strategy
All variables are combined:

```typescript
branches: {
  strategy: 'merge'
}
```

- Base and branch variables are combined
- Duplicates are allowed (last wins)
- Useful for additive configurations

## Environment Mapping

Map git branches to deployment environments:

```typescript
branches: {
  environments: {
    // Development environment for feature work
    development: [
      'dev',
      'develop', 
      'feature/*',     // All feature branches
      'bugfix/*'       // All bugfix branches
    ],
    
    // Staging for pre-production testing
    staging: [
      'staging',
      'release/*',     // Release candidates
      'hotfix/*',      // Emergency fixes
      'rc-*'           // Release candidate branches
    ],
    
    // Production branches
    production: [
      'main',
      'master',
      'prod',
      'production'
    ]
  }
}
```

## CLI Commands

### View Current Branch
```bash
# Show current branch and variable count
env-manager branch

# Output:
# 📌 Current Branch:
#    feature/user-auth
# 📦 Variables on branch 'feature/user-auth':
#    12 variables configured
```

### List All Branches
```bash
# Show all branches with variable indicators
env-manager branch-list

# Output:
# 🌿 Git Branches:
#   ● main [has variables]
#     staging [has variables]
#     feature/user-auth [has variables]
#     feature/payment
#     develop
```

### Copy Variables Between Branches
```bash
# Copy all variables from main to staging
env-manager branch-copy main staging

# Copy from current to new feature branch
git checkout -b feature/new-feature
env-manager branch-copy main feature/new-feature
```

### Branch-Specific Variable Management
```bash
# Set variable for current branch
env-manager set DATABASE_URL "postgresql://dev-db:5432/myapp"

# Set variable for specific branch
env-manager set DATABASE_URL "postgresql://staging-db:5432/myapp" --branch staging

# Export branch-specific .env
env-manager export --branch staging
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy Branch

on:
  push:
    branches: ['main', 'staging', 'develop']

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Env-Manager
        run: |
          npm install -g @buildappolis/env-manager
          env-manager init
      
      - name: Configure Branch Variables
        run: |
          # Auto-detects branch from git
          env-manager branch
          
          # Load branch-specific secrets
          if [[ "${{ github.ref_name }}" == "main" ]]; then
            env-manager set DATABASE_URL "${{ secrets.PROD_DATABASE_URL }}"
            env-manager set API_KEY "${{ secrets.PROD_API_KEY }}"
          elif [[ "${{ github.ref_name }}" == "staging" ]]; then
            env-manager set DATABASE_URL "${{ secrets.STAGING_DATABASE_URL }}"
            env-manager set API_KEY "${{ secrets.STAGING_API_KEY }}"
          fi
      
      - name: Export and Deploy
        run: |
          # Export branch-specific .env
          env-manager export --type env
          
          # Deploy with branch-specific config
          npm run deploy
```

### Vercel/Netlify Integration

```javascript
// vercel.json or netlify.toml build command
{
  "buildCommand": "env-manager export --branch $VERCEL_GIT_COMMIT_REF && npm run build"
}
```

### Docker Integration

```dockerfile
# Dockerfile
FROM node:18

# Install env-manager
RUN npm install -g @buildappolis/env-manager

# Copy project files
COPY . /app
WORKDIR /app

# Set branch from build arg
ARG GIT_BRANCH=main
ENV GIT_BRANCH=$GIT_BRANCH

# Export branch-specific variables
RUN env-manager export --branch $GIT_BRANCH --type env

# Build application
RUN npm run build

CMD ["npm", "start"]
```

Build with branch:
```bash
docker build --build-arg GIT_BRANCH=staging -t myapp:staging .
```

## Best Practices

### 1. Branch Naming Conventions
Use consistent branch naming for automatic environment detection:

```
main           → production
staging        → staging
develop        → development
feature/*      → development
release/*      → staging
hotfix/*       → staging
```

### 2. Variable Inheritance Pattern
Structure variables for efficient inheritance:

```typescript
// Base configuration (env.config.ts)
requirements: {
  api: {
    variables: [
      {
        name: 'API_TIMEOUT',
        default: '30000' // Default for all branches
      }
    ]
  }
}

// Branch overrides
branchRequirements: {
  'production': {
    api: {
      variables: [
        {
          name: 'API_TIMEOUT',
          default: '10000' // Faster timeout for production
        }
      ]
    }
  }
}
```

### 3. Secrets Management
Keep sensitive branch-specific values secure:

```typescript
// Don't commit branch secrets
branchRequirements: {
  'production': {
    auth: {
      variables: [
        {
          name: 'JWT_SECRET',
          sensitive: true,
          generate: () => crypto.randomBytes(64).toString('hex')
          // Value set via UI or CLI, not in config
        }
      ]
    }
  }
}
```

### 4. Migration Strategy
When adding branch support to existing projects:

1. Start with 'inherit' strategy
2. Move common variables to base requirements
3. Add branch-specific overrides gradually
4. Test thoroughly before switching strategies

### 5. Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Copy variables from main
env-manager branch-copy main feature/new-feature

# 3. Modify for development
env-manager set API_URL "http://localhost:3000"

# 4. Work on feature
npm run dev

# 5. Before merging, test with production variables
env-manager branch-copy main feature/new-feature
npm run test
```

## Automatic Branch Detection

Env-Manager automatically detects branch changes and updates configurations:

```bash
# Switch branch
git checkout staging

# Env-manager auto-detects and loads staging variables
env-manager start
# Now using staging branch configuration
```

## Deployment Scenarios

### Multi-Environment Deployment

```typescript
// env.config.ts
deployment: {
  autoExport: true,
  branchSpecific: true,
  environments: {
    production: {
      branch: 'main',
      exportPath: '.env.production',
      variables: {
        NODE_ENV: 'production',
        LOG_LEVEL: 'error'
      }
    },
    staging: {
      branch: 'staging',
      exportPath: '.env.staging',
      variables: {
        NODE_ENV: 'staging',
        LOG_LEVEL: 'info'
      }
    }
  }
}
```

### Preview Deployments

For Vercel/Netlify preview deployments:

```bash
# Auto-generate preview environment
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
PREVIEW_URL="https://${BRANCH_NAME}.preview.myapp.com"

env-manager set NEXT_PUBLIC_URL "$PREVIEW_URL"
env-manager export --branch "$BRANCH_NAME"
```

## Troubleshooting

### Variables Not Switching with Branch

1. Check branch detection:
```bash
env-manager branch
```

2. Verify branch configuration:
```bash
cat env.config.ts | grep -A 10 "branches:"
```

3. Force refresh:
```bash
env-manager start --refresh
```

### Merge Conflicts in Variables

When branches have conflicting variables:

```bash
# View both sets
env-manager branch-list

# Manually resolve
env-manager set CONFLICTED_VAR "resolved-value" --branch target-branch
```

### CI/CD Branch Detection

Ensure git information is available:

```bash
# GitHub Actions
echo "Branch: ${{ github.ref_name }}"

# GitLab CI
echo "Branch: $CI_COMMIT_BRANCH"

# Jenkins
echo "Branch: $GIT_BRANCH"

# Generic
echo "Branch: $(git rev-parse --abbrev-ref HEAD)"
```

## License

BuildAppolis Env-Manager - See [LICENSE](../LICENSE) for details.