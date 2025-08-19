import type { APIRoute } from 'astro'
import { readFileSync } from 'fs'
import { join } from 'path'

// Read version from package.json
let version = '1.4.9'
try {
  const packagePath = join(process.cwd(), 'package.json')
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'))
  version = packageJson.version
} catch (error) {
  console.error('Failed to read package.json version:', error)
}

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    status: 'ok',
    service: 'BuildAppolis Env-Manager',
    version,
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}