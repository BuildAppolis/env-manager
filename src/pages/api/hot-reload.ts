import type { APIRoute } from 'astro';
import { getDatabase } from '../../lib/session.js';
import { getHotReloadManager } from '../../lib/hot-reload.js';
import type { HotReloadSettings } from '../../types.js';

export const GET: APIRoute = async () => {
  try {
    const database = getDatabase();
    
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const manager = getHotReloadManager();
    
    // Get current settings from database
    const settings = database.getHotReloadSettings?.() || {
      enabled: true,
      autoReload: true,
      reloadDelay: 1000,
      wsPort: 3002,
      notifyOnly: false
    };
    
    return new Response(JSON.stringify({
      settings,
      isRunning: manager.isRunning(),
      clientCount: manager.getClientCount()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Get hot-reload settings error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get settings' }), {
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

    const { action, settings } = await request.json();
    const manager = getHotReloadManager();
    
    switch (action) {
      case 'update_settings':
        // Update settings in database
        database.setHotReloadSettings?.(settings);
        
        // Update manager config
        manager.updateConfig(settings);
        
        // Start/stop based on enabled setting
        if (settings.enabled && !manager.isRunning()) {
          await manager.start();
        } else if (!settings.enabled && manager.isRunning()) {
          await manager.stop();
        }
        
        return new Response(JSON.stringify({ 
          success: true,
          settings
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      case 'trigger_reload':
        await manager.triggerReload({
          type: 'manual',
          timestamp: Date.now()
        });
        
        return new Response(JSON.stringify({ 
          success: true,
          message: 'Reload triggered'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      case 'start':
        await manager.start();
        return new Response(JSON.stringify({ 
          success: true,
          message: 'Hot-reload started'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      case 'stop':
        await manager.stop();
        return new Response(JSON.stringify({ 
          success: true,
          message: 'Hot-reload stopped'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
    
  } catch (error) {
    console.error('Hot-reload operation error:', error);
    return new Response(JSON.stringify({ error: 'Operation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};