import type { APIRoute } from 'astro';
import { getDatabase } from '../../../lib/session.js';

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const database = getDatabase();
    
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Snapshot ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = database.deleteSnapshot(id);
    
    return new Response(JSON.stringify({ success: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Delete snapshot error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete snapshot' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
