import type { APIRoute } from 'astro'
import { getDatabase } from '../../lib/session.js'
import { TypeExporter } from '../../lib/type-exporter.js'
import path from 'path'
import fs from 'fs/promises'

export const GET: APIRoute = async ({ request }) => {
  try {
    const database = getDatabase()
    
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const url = new URL(request.url)
    const projectPath = url.searchParams.get('projectPath')
    const format = url.searchParams.get('format') || 'typescript' // typescript, global, or both
    
    // Load project config
    const projectRoot = projectPath || process.env.PROJECT_ROOT || path.resolve(process.cwd(), '..')
    const configPath = path.join(projectRoot, 'env.config.ts')
    
    try {
      // Check if config exists
      await fs.access(configPath)
    } catch {
      return new Response(JSON.stringify({ 
        error: 'No env.config.ts found in project root' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Import the config
    const configModule = await import(/* @vite-ignore */ configPath)
    const projectConfig = configModule.default
    
    // Get all variables
    const variables = database.getAllVariables()
    
    // Create type exporter
    const exporter = new TypeExporter(projectConfig, variables)
    
    let content = ''
    let filename = ''
    
    switch (format) {
      case 'global':
        content = exporter.generateGlobalTypes()
        filename = 'env.d.ts'
        break
      case 'both':
        // Generate both files as a zip or tar
        const types = exporter.generateTypes()
        const globalTypes = exporter.generateGlobalTypes()
        
        // For simplicity, return them concatenated with a separator
        content = `// ===== env.types.ts =====\n${types}\n\n// ===== env.d.ts =====\n${globalTypes}`
        filename = 'env-types.ts'
        break
      case 'typescript':
      default:
        content = exporter.generateTypes()
        filename = 'env.types.ts'
        break
    }
    
    return new Response(JSON.stringify({
      content,
      filename,
      format
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Export types error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to export types',
      message: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const database = getDatabase()
    
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { projectPath, outputDir } = await request.json()
    
    // Load project config
    const projectRoot = projectPath || process.env.PROJECT_ROOT || path.resolve(process.cwd(), '..')
    const configPath = path.join(projectRoot, 'env.config.ts')
    
    // Import the config
    const configModule = await import(/* @vite-ignore */ configPath)
    const projectConfig = configModule.default
    
    // Get all variables
    const variables = database.getAllVariables()
    
    // Create type exporter
    const exporter = new TypeExporter(projectConfig, variables)
    
    // Export to files
    const targetDir = outputDir || path.join(projectRoot, 'src', 'types')
    await exporter.exportToFiles(targetDir)
    
    return new Response(JSON.stringify({
      success: true,
      outputDir: targetDir,
      files: ['env.types.ts', 'env.d.ts']
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Export types error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to export types',
      message: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}