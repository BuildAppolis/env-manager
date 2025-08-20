# 🚀 Framework Integration Guide

This guide shows how to integrate BuildAppolis Env-Manager with popular frameworks.

## 🎨 TypeScript Integration - The Power of Typed Environment Variables

One of Env-Manager's most powerful features is **automatic TypeScript type generation** for your environment variables. This provides:

- ✅ **Full IntelliSense** - Autocomplete for all your env vars
- ✅ **Type Safety** - TypeScript knows if a var is string, number, or boolean
- ✅ **Client/Server Separation** - Separate typed exports prevent leaking server secrets to client
- ✅ **Validation Functions** - Runtime validation that throws if required vars are missing
- ✅ **Zero Config** - Just run `env-manager generate-types` and import!

### Quick Example

```typescript
// Instead of this (no type safety):
const apiUrl = process.env.NEXT_PUBLIC_API_URL  // string | undefined
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000  // manual parsing

// You get this (full type safety):
import { clientEnv, serverEnv } from './env.types'

const apiUrl = clientEnv.NEXT_PUBLIC_API_URL  // string (TypeScript knows!)
const port = serverEnv.PORT                   // number (already parsed!)
```

### How It Works

1. Define your variables with types in `env.config.ts`
2. Run `env-manager generate-types`
3. Import and use your typed variables!

The generated types automatically:
- Separate client/server variables based on naming patterns (NEXT_PUBLIC_, VITE_, etc.)
- Parse number and boolean types
- Mark optional variables with TypeScript's optional operator
- Provide validation functions for runtime checks

## Table of Contents
- [TypeScript Integration](#typescript-integration---the-power-of-typed-environment-variables)
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
          type: 'url',  // Will be typed as string
          description: 'PostgreSQL connection string',
          sensitive: true,
          required: true,
        },
        {
          name: 'DB_POOL_SIZE',
          type: 'number',  // Will be typed as number
          description: 'Database connection pool size',
          default: '10',
        },
      ],
    },
    auth: {
      required: true,
      variables: [
        {
          name: 'NEXTAUTH_URL',
          type: 'url',
          description: 'NextAuth URL',
          default: 'http://localhost:3000',
        },
        {
          name: 'NEXTAUTH_SECRET',
          type: 'string',
          description: 'NextAuth secret key',
          sensitive: true,
          required: true,
        },
      ],
    },
    api: {
      required: false,
      variables: [
        {
          name: 'NEXT_PUBLIC_API_URL',
          type: 'url',
          description: 'Public API endpoint',
          default: 'http://localhost:3000/api',
        },
        {
          name: 'NEXT_PUBLIC_APP_NAME',
          type: 'string',
          description: 'Application name',
          default: 'My App',
        },
      ],
    },
  },
}
```

### 2. Generate TypeScript types

```bash
# Generate typed exports for your environment variables
env-manager generate-types

# This creates:
# - env.types.ts    - Typed exports with interfaces and runtime objects
# - env.d.ts        - Global type declarations for process.env
```

### 3. Update your package.json scripts

```json
{
  "scripts": {
    "dev": "env-manager start & next dev",
    "build": "env-manager generate-types && next build",
    "start": "next start",
    "types": "env-manager generate-types"
  }
}
```

### 4. Use typed variables in your app

#### Server Components (App Router)
```typescript
// app/api/auth/route.ts
import { serverEnv, validateServerEnv } from '@/env.types'

export async function GET() {
  // Validate on startup (throws if required vars missing)
  validateServerEnv()
  
  // Full type safety - TypeScript knows these types!
  const dbUrl = serverEnv.DATABASE_URL         // string
  const poolSize = serverEnv.DB_POOL_SIZE      // number
  const authSecret = serverEnv.NEXTAUTH_SECRET // string
  
  // Connect to database with typed config
  const pool = createPool(dbUrl, { max: poolSize })
  
  return Response.json({ status: 'authenticated' })
}
```

#### Client Components
```typescript
// app/components/ApiClient.tsx
'use client'

import { clientEnv, validateClientEnv } from '@/env.types'

export function ApiClient() {
  // Only client-safe variables are available
  const apiUrl = clientEnv.NEXT_PUBLIC_API_URL         // string
  const appName = clientEnv.NEXT_PUBLIC_APP_NAME || 'App' // string | undefined
  
  // TypeScript will error if you try to access server vars!
  // const secret = clientEnv.DATABASE_URL // ❌ ERROR: Property doesn't exist
  
  return (
    <div>
      <h1>{appName}</h1>
      <p>API: {apiUrl}</p>
    </div>
  )
}
```

#### Pages Router
```typescript
// pages/api/data.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { serverEnv, getEnv } from '@/env.types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Use typed getter function
  const dbUrl = getEnv('DATABASE_URL')     // TypeScript knows it's a string!
  const poolSize = getEnv('DB_POOL_SIZE')  // TypeScript knows it's a number!
  
  // Or use the serverEnv object
  const authUrl = serverEnv.NEXTAUTH_URL
  
  res.status(200).json({ success: true })
}
```

#### Middleware
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { serverEnv } from '@/env.types'

export function middleware(request: NextRequest) {
  // Type-safe environment variables in middleware
  const authSecret = serverEnv.NEXTAUTH_SECRET
  const authUrl = serverEnv.NEXTAUTH_URL
  
  // Your middleware logic with typed vars
  return NextResponse.next()
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
          type: 'string',
          description: 'Contentful Space ID',
          required: true,
        },
        {
          name: 'CONTENTFUL_ACCESS_TOKEN',
          type: 'string',
          description: 'Contentful Access Token',
          sensitive: true,
          required: true,
        },
        {
          name: 'ASTRO_PUBLIC_SITE_URL',  // Note: ASTRO_PUBLIC_ prefix for client vars
          type: 'url',
          description: 'Public site URL',
          default: 'http://localhost:4321',
        },
        {
          name: 'ASTRO_PUBLIC_API_ENDPOINT',
          type: 'url',
          description: 'Public API endpoint',
          default: 'http://localhost:4321/api',
        },
      ],
    },
    server: {
      required: true,
      variables: [
        {
          name: 'DATABASE_URL',
          type: 'url',
          description: 'Database connection',
          sensitive: true,
          required: true,
        },
        {
          name: 'CACHE_TTL',
          type: 'number',
          description: 'Cache TTL in seconds',
          default: '3600',
        },
      ],
    },
  },
}
```

### 2. Generate TypeScript types

```bash
# Generate typed exports
env-manager generate-types
```

### 3. Update astro.config.mjs

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config'
import { clientEnv } from './env.types'

// Use typed client variables
export default defineConfig({
  site: clientEnv.ASTRO_PUBLIC_SITE_URL,
  integrations: [
    // your integrations
  ],
})
```

### 4. Use typed variables in your components

#### Server-side (Astro Components)
```astro
---
// src/pages/index.astro
import { serverEnv, clientEnv, validateEnv } from '../../env.types'

// Validate environment on startup
validateEnv()

// Server-side variables (only available in frontmatter)
const spaceId = serverEnv.CONTENTFUL_SPACE_ID      // string
const accessToken = serverEnv.CONTENTFUL_ACCESS_TOKEN // string
const cacheTtl = serverEnv.CACHE_TTL               // number

// Fetch data with typed config
const content = await fetchContentful(spaceId, accessToken, {
  cache: cacheTtl
})

// Client variables available everywhere
const siteUrl = clientEnv.ASTRO_PUBLIC_SITE_URL
---

<html>
  <body>
    <h1>Site: {siteUrl}</h1>
    <!-- Client vars can be used in templates -->
  </body>
</html>
```

#### API Routes
```typescript
// src/pages/api/data.ts
import type { APIRoute } from 'astro'
import { serverEnv, validateServerEnv } from '../../../env.types'

export const GET: APIRoute = async ({ params, request }) => {
  // Validate server environment
  validateServerEnv()
  
  // Use typed server variables
  const dbUrl = serverEnv.DATABASE_URL       // string
  const cacheTtl = serverEnv.CACHE_TTL       // number
  
  // Your API logic with typed vars
  const data = await fetchFromDB(dbUrl)
  
  return new Response(
    JSON.stringify(data),
    {
      headers: {
        'Cache-Control': `max-age=${cacheTtl}`
      }
    }
  )
}
```

#### Client-side Scripts
```astro
---
// src/components/ApiClient.astro
---

<script>
  // Import client-only variables in client scripts
  import { clientEnv } from '../../env.types'
  
  // TypeScript knows these are strings!
  const apiEndpoint = clientEnv.ASTRO_PUBLIC_API_ENDPOINT
  const siteUrl = clientEnv.ASTRO_PUBLIC_SITE_URL
  
  // Make API calls with typed config
  fetch(apiEndpoint + '/data')
    .then(res => res.json())
    .then(data => console.log(data))
</script>
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