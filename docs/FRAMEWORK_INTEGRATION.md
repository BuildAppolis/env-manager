# 🚀 Framework Integration Guide

This guide shows how to integrate BuildAppolis Env-Manager with popular frameworks.

## Table of Contents
- [Next.js](#nextjs)
- [Astro](#astro)
- [Vue/Nuxt](#vuenuxt)
- [SvelteKit](#sveltekit)
- [Remix](#remix)
- [Express/Node.js](#expressnodejs)

## Prerequisites

First, install and initialize env-manager in your project:

```bash
# Install globally
npm install -g @buildappolis/env-manager

# Initialize in your project
cd your-project
env-manager init

# Set up your master password
env-manager setup-password
```

## Next.js

### 1. Create your env.config.ts

```typescript
// env.config.ts
export default {
  projectName: 'My Next.js App',
  projectVersion: '1.0.0',
  requirements: {
    database: {
      required: true,
      variables: [
        {
          name: 'DATABASE_URL',
          description: 'PostgreSQL connection string',
          sensitive: true,
          validation: (value: string) => value.startsWith('postgresql://'),
        },
      ],
    },
    auth: {
      required: true,
      variables: [
        {
          name: 'NEXTAUTH_URL',
          description: 'NextAuth URL',
          default: 'http://localhost:3000',
        },
        {
          name: 'NEXTAUTH_SECRET',
          description: 'NextAuth secret key',
          sensitive: true,
          generate: () => require('crypto').randomBytes(32).toString('hex'),
        },
      ],
    },
    api: {
      required: false,
      variables: [
        {
          name: 'NEXT_PUBLIC_API_URL',
          description: 'Public API endpoint',
          default: 'http://localhost:3000/api',
        },
      ],
    },
  },
}
```

### 2. Update your package.json scripts

```json
{
  "scripts": {
    "dev": "env-manager start & next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

### 3. Access variables in your app

```typescript
// app/api/route.ts
export async function GET() {
  const dbUrl = process.env.DATABASE_URL
  // Variables are automatically loaded from env-manager
}

// app/page.tsx
export default function Page() {
  // Public variables are available client-side
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  return <div>API: {apiUrl}</div>
}
```

## Astro

### 1. Create your env.config.ts

```typescript
// env.config.ts
export default {
  projectName: 'My Astro Site',
  projectVersion: '1.0.0',
  requirements: {
    contentful: {
      required: true,
      variables: [
        {
          name: 'CONTENTFUL_SPACE_ID',
          description: 'Contentful Space ID',
        },
        {
          name: 'CONTENTFUL_ACCESS_TOKEN',
          description: 'Contentful Access Token',
          sensitive: true,
        },
        {
          name: 'PUBLIC_SITE_URL',
          description: 'Public site URL',
          default: 'http://localhost:4321',
        },
      ],
    },
  },
}
```

### 2. Update astro.config.mjs

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config'

// Env-manager variables are loaded automatically
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL,
  integrations: [
    // your integrations
  ],
})
```

### 3. Use in your components

```astro
---
// src/pages/index.astro
const spaceId = import.meta.env.CONTENTFUL_SPACE_ID
const siteUrl = import.meta.env.PUBLIC_SITE_URL
---

<html>
  <body>
    <h1>Site: {siteUrl}</h1>
  </body>
</html>
```

## Vue/Nuxt

### Nuxt 3 Integration

#### 1. Create env.config.ts

```typescript
// env.config.ts
export default {
  projectName: 'My Nuxt App',
  projectVersion: '1.0.0',
  requirements: {
    app: {
      required: true,
      variables: [
        {
          name: 'NUXT_PUBLIC_API_BASE',
          description: 'API base URL',
          default: 'http://localhost:3000',
        },
        {
          name: 'NUXT_API_SECRET',
          description: 'API secret key',
          sensitive: true,
        },
      ],
    },
    database: {
      required: true,
      variables: [
        {
          name: 'DATABASE_URL',
          description: 'Database connection string',
          sensitive: true,
        },
      ],
    },
  },
}
```

#### 2. Update nuxt.config.ts

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // Private variables (server-side only)
    apiSecret: process.env.NUXT_API_SECRET,
    databaseUrl: process.env.DATABASE_URL,
    
    // Public variables (available client-side)
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
    },
  },
})
```

#### 3. Use in your app

```vue
<script setup>
// pages/index.vue
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

// Server-side only
const { data } = await $fetch('/api/data')
</script>
```

```typescript
// server/api/data.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const dbUrl = config.databaseUrl // Server-side only
  
  // Your API logic here
})
```

### Vue 3 (Vite) Integration

```typescript
// env.config.ts
export default {
  projectName: 'My Vue App',
  requirements: {
    app: {
      required: true,
      variables: [
        {
          name: 'VITE_API_URL',
          description: 'API endpoint',
          default: 'http://localhost:3000/api',
        },
        {
          name: 'VITE_APP_TITLE',
          description: 'App title',
          default: 'My Vue App',
        },
      ],
    },
  },
}
```

## SvelteKit

### 1. Create env.config.ts

```typescript
// env.config.ts
export default {
  projectName: 'My SvelteKit App',
  projectVersion: '1.0.0',
  requirements: {
    auth: {
      required: true,
      variables: [
        {
          name: 'AUTH_SECRET',
          description: 'Auth secret key',
          sensitive: true,
          generate: () => crypto.randomUUID(),
        },
        {
          name: 'PUBLIC_AUTH_URL',
          description: 'Public auth URL',
          default: 'http://localhost:5173',
        },
      ],
    },
    database: {
      required: true,
      variables: [
        {
          name: 'DATABASE_URL',
          description: 'Database connection',
          sensitive: true,
        },
      ],
    },
  },
}
```

### 2. Use in your app

```typescript
// src/hooks.server.ts
import { AUTH_SECRET } from '$env/static/private'
import { PUBLIC_AUTH_URL } from '$env/static/public'

// Server-side variables
console.log(AUTH_SECRET)

// src/routes/+page.svelte
<script>
  import { PUBLIC_AUTH_URL } from '$env/static/public'
  // Public variables available client-side
</script>
```

## Remix

### 1. Create env.config.ts

```typescript
// env.config.ts
export default {
  projectName: 'My Remix App',
  projectVersion: '1.0.0',
  requirements: {
    sessions: {
      required: true,
      variables: [
        {
          name: 'SESSION_SECRET',
          description: 'Session secret',
          sensitive: true,
          minLength: 32,
        },
      ],
    },
    api: {
      required: false,
      variables: [
        {
          name: 'API_KEY',
          description: 'External API key',
          sensitive: true,
        },
      ],
    },
  },
}
```

### 2. Use in loaders/actions

```typescript
// app/routes/_index.tsx
export async function loader() {
  // Access env variables server-side
  const apiKey = process.env.API_KEY
  
  return json({ 
    data: await fetchData(apiKey) 
  })
}
```

## Express/Node.js

### 1. Create env.config.ts

```typescript
// env.config.ts
export default {
  projectName: 'My Express API',
  projectVersion: '1.0.0',
  requirements: {
    server: {
      required: true,
      variables: [
        {
          name: 'PORT',
          description: 'Server port',
          default: '3000',
          validation: (value: string) => !isNaN(parseInt(value)),
        },
        {
          name: 'NODE_ENV',
          description: 'Node environment',
          default: 'development',
          validation: (value: string) => 
            ['development', 'production', 'test'].includes(value),
        },
      ],
    },
    database: {
      required: true,
      variables: [
        {
          name: 'DB_HOST',
          description: 'Database host',
          default: 'localhost',
        },
        {
          name: 'DB_PORT',
          description: 'Database port',
          default: '5432',
        },
        {
          name: 'DB_NAME',
          description: 'Database name',
        },
        {
          name: 'DB_USER',
          description: 'Database user',
        },
        {
          name: 'DB_PASSWORD',
          description: 'Database password',
          sensitive: true,
        },
      ],
    },
    jwt: {
      required: true,
      variables: [
        {
          name: 'JWT_SECRET',
          description: 'JWT signing secret',
          sensitive: true,
          generate: () => require('crypto').randomBytes(64).toString('hex'),
        },
        {
          name: 'JWT_EXPIRY',
          description: 'JWT expiry time',
          default: '7d',
        },
      ],
    },
  },
}
```

### 2. Initialize in your app

```javascript
// server.js
const express = require('express')
const app = express()

// Env-manager loads variables automatically
const PORT = process.env.PORT || 3000
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

## Best Practices

### 1. Security
- Never commit `.env` files to version control
- Always mark sensitive variables with `sensitive: true`
- Use the `generate` function for secrets and keys
- Store recovery phrases securely

### 2. Development Workflow
```bash
# Start env-manager with your dev server
npm run dev  # This starts both env-manager and your app

# Or run them separately
env-manager start  # In one terminal
npm run dev       # In another terminal
```

### 3. Production Deployment
For production, you typically want to:
1. Export variables to `.env` for deployment
2. Or use env-manager in production with proper security

```bash
# Export for production
env-manager export --type env

# This creates a .env file with all your variables
# Deploy this file securely to your production environment
```

### 4. CI/CD Integration
```yaml
# .github/workflows/deploy.yml
steps:
  - uses: actions/checkout@v2
  
  - name: Setup env-manager
    run: |
      npm install -g @buildappolis/env-manager
      env-manager init
      
  - name: Configure environment
    run: |
      # Load variables from secrets or secure storage
      env-manager set DATABASE_URL ${{ secrets.DATABASE_URL }}
      env-manager set API_KEY ${{ secrets.API_KEY }}
      
  - name: Build application
    run: npm run build
```

## Troubleshooting

### Variables not loading?
1. Ensure env-manager is running: `env-manager status`
2. Check your `env.config.ts` is properly configured
3. Verify variables are set in the UI: `http://localhost:3001`

### Port conflicts?
Env-manager uses port 3001 by default. Each project gets its own port:
```bash
env-manager projects  # List all projects and their ports
```

### Need help?
- Visit [BuildAppolis Documentation](https://docs.buildappolis.com)
- Check [GitHub Issues](https://github.com/buildappolis/env-manager/issues)
- Contact support@buildappolis.com

## License
BuildAppolis Env-Manager - See [LICENSE](../LICENSE) for details.