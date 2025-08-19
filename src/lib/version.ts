import { readFileSync } from 'fs'
import { join } from 'path'

interface VersionInfo {
  version: string;
  environment: 'development' | 'production' | 'local';
  isPublished: boolean;
  buildDate?: string;
}

export function getVersionInfo(): VersionInfo {
  let version = '1.4.9'
  let environment: 'development' | 'production' | 'local' = 'production'
  let isPublished = false
  
  try {
    const packagePath = join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'))
    version = packageJson.version
    
    // Check if running from global install (published)
    if (process.cwd().includes('node_modules/@buildappolis/env-manager')) {
      isPublished = true
      environment = 'production'
    } else if (process.env.NODE_ENV === 'development' || process.cwd().includes('/coding/projects/env-manager')) {
      isPublished = false
      environment = 'development'
    } else {
      // Local build but not development
      isPublished = false
      environment = 'local'
    }
  } catch (error) {
    console.error('Failed to read version info:', error)
  }
  
  return {
    version,
    environment,
    isPublished,
    buildDate: new Date().toISOString()
  }
}

export const VERSION = getVersionInfo().version