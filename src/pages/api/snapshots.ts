import type { APIRoute } from 'astro';
import { getDatabase } from '../../lib/session.js';

export const GET: APIRoute = async () => {
  try {
    const database = getDatabase();
    
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const snapshots = database.getSnapshots();
    return new Response(JSON.stringify(snapshots), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get snapshots error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get snapshots' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const database = getDatabase();
    
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { name, description } = await request.json();
    const snapshot = database.createSnapshot(name, description);
    
    return new Response(JSON.stringify(snapshot), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Create snapshot error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create snapshot' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
