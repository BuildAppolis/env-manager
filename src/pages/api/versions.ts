import type { APIRoute } from 'astro'
import { getDatabase } from '../../lib/session.js'
import DraftManager from '../../lib/draft-manager.js'

export const GET: APIRoute = async ({ url }) => {
  try {
    const projectPath = url.searchParams.get('projectPath')
    const database = getDatabase(projectPath || undefined)
    
    // Check if authenticated
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const draftManager = new DraftManager(database)
    const versions = draftManager.getVersionHistory()

    return new Response(JSON.stringify({ 
      versions,
      count: versions.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Failed to load versions:', error)
    return new Response(JSON.stringify({ error: 'Failed to load versions' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { projectPath, action, ...data } = await request.json()
    const database = getDatabase(projectPath || undefined)
    
    // Check if authenticated
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const draftManager = new DraftManager(database)

    switch (action) {
      case 'create_version':
        const version = await draftManager.publishDraft()
        return new Response(JSON.stringify({ 
          success: true, 
          version 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })

      case 'compare':
        const { fromId, toId } = data
        const changes = draftManager.compareVersions(fromId, toId)
        return new Response(JSON.stringify({ 
          changes 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
    }

  } catch (error) {
    console.error('Version operation failed:', error)
    return new Response(JSON.stringify({ 
      error: 'Operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}