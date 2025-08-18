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

    const variables = database.getAllVariables();
    return new Response(JSON.stringify(variables), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get variables error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get variables' }), {
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

    const variable = await request.json();
    const result = database.setVariable(variable.name, variable.value, variable);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Set variable error:', error);
    return new Response(JSON.stringify({ error: 'Failed to set variable' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const database = getDatabase();
    
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const variable = await request.json();
    const result = database.updateVariable(variable.name, variable.value, variable);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update variable error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update variable' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const database = getDatabase();
    
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { name } = await request.json();
    const result = database.deleteVariable(name);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Delete variable error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete variable' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
