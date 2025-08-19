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
    const draft = draftManager.getCurrentDraft()
    const variables = draftManager.getDraftVariables()
    const changes = draftManager.getDraftChanges()

    return new Response(JSON.stringify({ 
      draft,
      variables,
      changes,
      hasDraft: draftManager.hasDraft()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Failed to load draft:', error)
    return new Response(JSON.stringify({ error: 'Failed to load draft' }), {
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
      case 'create':
        const draft = draftManager.createDraft(data.description, data.author)
        return new Response(JSON.stringify({ 
          success: true, 
          draft 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })

      case 'add_variable':
        const variable = {
          name: data.variable.name,
          value: data.variable.value || '',
          category: data.variable.category || 'other',
          description: data.variable.description || '',
          sensitive: data.variable.sensitive || false,
          encrypted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          branch: data.variable.branch
        }
        draftManager.addVariableToDraft(variable, data.variable.changeType || 'create')
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })

      case 'update_variable':
        draftManager.updateDraftVariable(data.name, data.updates)
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })

      case 'remove_variable':
        draftManager.removeDraftVariable(data.name)
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })

      case 'publish':
        const version = await draftManager.publishDraft()
        return new Response(JSON.stringify({ 
          success: true,
          version,
          message: 'Draft published successfully'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })

      case 'discard':
        draftManager.discardDraft()
        return new Response(JSON.stringify({ 
          success: true,
          message: 'Draft discarded'
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
    console.error('Draft operation failed:', error)
    return new Response(JSON.stringify({ 
      error: 'Operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}