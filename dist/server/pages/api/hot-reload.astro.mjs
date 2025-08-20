import { g as getDatabase } from '../../chunks/session_Czm17L6L.mjs';
import { g as getHotReloadManager } from '../../chunks/hot-reload_DH00vsQQ.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async () => {
  try {
    const database = getDatabase();
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const manager = getHotReloadManager();
    const settings = database.getHotReloadSettings?.() || {
      enabled: true,
      autoReload: true,
      reloadDelay: 1e3,
      wsPort: 3002,
      notifyOnly: false
    };
    return new Response(JSON.stringify({
      settings,
      isRunning: manager.isRunning(),
      clientCount: manager.getClientCount()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Get hot-reload settings error:", error);
    return new Response(JSON.stringify({ error: "Failed to get settings" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const POST = async ({ request }) => {
  try {
    const database = getDatabase();
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { action, settings } = await request.json();
    const manager = getHotReloadManager();
    switch (action) {
      case "update_settings":
        database.setHotReloadSettings?.(settings);
        manager.updateConfig(settings);
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
          headers: { "Content-Type": "application/json" }
        });
      case "trigger_reload":
        await manager.triggerReload({
          type: "manual",
          timestamp: Date.now()
        });
        return new Response(JSON.stringify({
          success: true,
          message: "Reload triggered"
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      case "start":
        await manager.start();
        return new Response(JSON.stringify({
          success: true,
          message: "Hot-reload started"
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      case "stop":
        await manager.stop();
        return new Response(JSON.stringify({
          success: true,
          message: "Hot-reload stopped"
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
    }
  } catch (error) {
    console.error("Hot-reload operation error:", error);
    return new Response(JSON.stringify({ error: "Operation failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
