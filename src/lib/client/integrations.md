# Framework Integration for Hot-Reload

## Next.js Integration

### 1. Install the client
```bash
npm install @buildappolis/env-manager-client
```

### 2. Add to your app

#### App Router (app/layout.tsx)
```tsx
import { EnvManagerClient } from '@buildappolis/env-manager-client'

// Initialize in root layout
if (process.env.NODE_ENV === 'development') {
  new EnvManagerClient({
    wsPort: 3002,
    onReload: () => {
      // Next.js fast refresh
      if (window.next?.router) {
        window.next.router.reload()
      } else {
        window.location.reload()
      }
    }
  })
}
```

#### Pages Router (_app.tsx)
```tsx
import { useEffect } from 'react'
import { EnvManagerClient } from '@buildappolis/env-manager-client'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const client = new EnvManagerClient({
        wsPort: 3002,
        onVariablesChanged: () => {
          // Trigger Next.js fast refresh
          window.location.reload()
        }
      })
      
      return () => client.disconnect()
    }
  }, [])
  
  return <Component {...pageProps} />
}
```

### 3. Add meta tag (optional)
```html
<!-- pages/_document.tsx or app/head.tsx -->
<meta name="env-manager-auto-init" content="true" />
```

## Astro Integration

### In your base layout
```astro
---
// src/layouts/BaseLayout.astro
---
<html>
  <head>
    <meta name="env-manager-auto-init" content="true" />
    {import.meta.env.DEV && (
      <script>
        import { EnvManagerClient } from '@buildappolis/env-manager-client'
        new EnvManagerClient({
          wsPort: 3002,
          onReload: () => {
            // Astro HMR will handle this
            window.location.reload()
          }
        })
      </script>
    )}
  </head>
</html>
```

## Vue/Nuxt Integration

### Nuxt 3 Plugin
```ts
// plugins/env-manager.client.ts
import { EnvManagerClient } from '@buildappolis/env-manager-client'

export default defineNuxtPlugin(() => {
  if (process.dev) {
    const client = new EnvManagerClient({
      wsPort: 3002,
      onVariablesChanged: () => {
        // Nuxt will handle HMR
        refreshNuxtData()
      }
    })
    
    return {
      provide: {
        envManager: client
      }
    }
  }
})
```

### Vue 3
```ts
// main.ts
import { createApp } from 'vue'
import { EnvManagerClient } from '@buildappolis/env-manager-client'

const app = createApp(App)

if (import.meta.env.DEV) {
  const envManager = new EnvManagerClient({
    wsPort: 3002
  })
  
  app.config.globalProperties.$envManager = envManager
}
```

## SvelteKit Integration

```ts
// app.html
<script>
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    import('@buildappolis/env-manager-client').then(({ EnvManagerClient }) => {
      window.envManager = new EnvManagerClient({
        wsPort: 3002,
        onReload: () => {
          // SvelteKit will handle HMR
          window.location.reload()
        }
      })
    })
  }
</script>
```

## Express/Node.js Integration

For backend applications, use the Node.js client:

```js
// server.js
const { EnvManagerClient } = require('@buildappolis/env-manager-client/node')

if (process.env.NODE_ENV === 'development') {
  const client = new EnvManagerClient({
    wsPort: 3002,
    onVariablesChanged: () => {
      // Restart server or reload config
      console.log('Environment variables changed, reloading...')
      process.exit(0) // Let PM2/nodemon restart
    }
  })
}
```

## Custom Integration

For any framework, you can use the client directly:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Auto-initialize -->
  <meta name="env-manager-auto-init" content="true" />
</head>
<body>
  <!-- Or manual initialization -->
  <script type="module">
    import { EnvManagerClient } from '@buildappolis/env-manager-client'
    
    const client = new EnvManagerClient({
      wsPort: 3002,
      showNotifications: true,
      onReload: () => {
        console.log('Reloading due to env changes...')
        window.location.reload()
      },
      onVariablesChanged: (vars) => {
        console.log('Variables updated:', vars)
        // Custom handling
      }
    })
    
    // Manual reload trigger
    document.getElementById('reload-btn')?.addEventListener('click', () => {
      client.requestReload()
    })
  </script>
</body>
</html>
```

## Configuration Options

```typescript
interface EnvManagerClientConfig {
  wsPort?: number           // WebSocket port (default: 3002)
  autoReconnect?: boolean    // Auto-reconnect on disconnect (default: true)
  reconnectDelay?: number    // Reconnect delay in ms (default: 3000)
  onReload?: () => void     // Custom reload handler
  onVariablesChanged?: (variables: any) => void // Variable change handler
  showNotifications?: boolean // Show UI notifications (default: true)
  debug?: boolean           // Debug logging (default: false)
}
```

## API Methods

```typescript
class EnvManagerClient {
  connect(): void           // Connect to WebSocket server
  disconnect(): void        // Disconnect from server
  requestReload(): void     // Manually trigger reload
  updateConfig(config): void // Update client configuration
  isConnected(): boolean    // Check connection status
}
```