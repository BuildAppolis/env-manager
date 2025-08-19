import type { APIRoute } from 'astro'
import { getDatabase } from '../../../lib/session.js'
import DraftManager from '../../../lib/draft-manager.js'

export const POST: APIRoute = async ({ request }) => {
  try {
    const { projectPath, versionId } = await request.json()
    const database = getDatabase(projectPath || undefined)
    
    // Check if authenticated
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const draftManager = new DraftManager(database)
    await draftManager.restoreFromVersion(versionId)

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Version restore initiated. Check your draft for changes.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Version restore failed:', error)
    return new Response(JSON.stringify({ 
      error: 'Restore failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}