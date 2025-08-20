import type { APIRoute } from 'astro'
import { getDatabase } from '../../lib/session.js'
import { SecretGenerator } from '../../lib/secret-generator.js'
import path from 'path'
import fs from 'fs/promises'

export const POST: APIRoute = async ({ request }) => {
  try {
    const database = getDatabase()
    
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { 
      variableName, 
      generationType,
      projectPath 
    } = await request.json()
    
    if (!variableName) {
      return new Response(JSON.stringify({ error: 'Variable name required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    let generateType: 'uuid' | 'crypto' | 'password' | undefined = undefined
    let generatedValue = ''

    // Check if project config specifies generation type
    if (projectPath) {
      const projectRoot = projectPath || process.env.PROJECT_ROOT || path.resolve(process.cwd(), '..')
      const configPath = path.join(projectRoot, 'env.config.ts')
      
      try {
        await fs.access(configPath)
        const configModule = await import(/* @vite-ignore */ configPath)
        const projectConfig = configModule.default
        
        // Find variable config
        for (const [, group] of Object.entries(projectConfig.requirements)) {
          const groupData = group as any
          const varConfig = groupData.variables?.find((v: any) => v.name === variableName)
          
          if (varConfig?.generate) {
            generateType = varConfig.generate
            break
          }
        }
      } catch {
        // Config not found or error loading, continue with manual generation
      }
    }

    // Use explicit generation type if provided, otherwise use config or auto-detect
    const finalGenerationType = generationType || generateType
    
    // Generate the secret
    if (finalGenerationType) {
      switch (finalGenerationType) {
        case 'uuid':
          generatedValue = SecretGenerator.generateUuid()
          break
        case 'crypto':
          generatedValue = SecretGenerator.generateCryptoSecret()
          break
        case 'password':
          generatedValue = SecretGenerator.generatePassword()
          break
        default:
          generatedValue = SecretGenerator.generateByPattern(variableName)
      }
    } else {
      // Auto-detect based on variable name
      generatedValue = SecretGenerator.generateByPattern(variableName)
    }

    return new Response(JSON.stringify({
      success: true,
      value: generatedValue,
      type: finalGenerationType || 'auto'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Generate secret error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to generate secret',
      message: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

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
    const variableNames = url.searchParams.get('variables')?.split(',') || []
    const projectPath = url.searchParams.get('projectPath')
    
    if (variableNames.length === 0) {
      return new Response(JSON.stringify({ error: 'No variables specified' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Load project config to get generation types
    const configMap = new Map<string, 'uuid' | 'crypto' | 'password'>()
    
    if (projectPath) {
      const projectRoot = projectPath || process.env.PROJECT_ROOT || path.resolve(process.cwd(), '..')
      const configPath = path.join(projectRoot, 'env.config.ts')
      
      try {
        await fs.access(configPath)
        const configModule = await import(/* @vite-ignore */ configPath)
        const projectConfig = configModule.default
        
        // Build config map
        for (const [, group] of Object.entries(projectConfig.requirements)) {
          const groupData = group as any
          for (const varConfig of groupData.variables || []) {
            if (varConfig.generate) {
              configMap.set(varConfig.name, varConfig.generate)
            }
          }
        }
      } catch {
        // Config not found, continue without it
      }
    }

    // Generate secrets for all variables
    const results: Record<string, string> = {}
    
    for (const name of variableNames) {
      const generateType = configMap.get(name)
      results[name] = SecretGenerator.generateByPattern(name, generateType)
    }

    return new Response(JSON.stringify({
      success: true,
      values: results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Generate secrets error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to generate secrets',
      message: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}