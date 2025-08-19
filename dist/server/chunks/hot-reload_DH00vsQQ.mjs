import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
class HotReloadManager extends EventEmitter {
  constructor(config = {}) {
    super();
    this.wss = null;
    this.clients = /* @__PURE__ */ new Set();
    this.reloadTimer = null;
    this.isReloading = false;
    this.config = {
      enabled: true,
      autoReload: true,
      reloadDelay: 1e3,
      port: 3002,
      // Default WebSocket port
      notifyOnly: false,
      ...config
    };
  }
  async start() {
    if (!this.config.enabled) return;
    this.wss = new WebSocketServer({
      port: this.config.port,
      perMessageDeflate: false
    });
    this.wss.on("connection", (ws) => {
      this.clients.add(ws);
      ws.send(JSON.stringify({
        type: "connected",
        config: this.config,
        timestamp: Date.now()
      }));
      ws.on("close", () => {
        this.clients.delete(ws);
      });
      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
        this.clients.delete(ws);
      });
      ws.on("message", async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleClientMessage(message, ws);
        } catch (error) {
          console.error("Failed to handle client message:", error);
        }
      });
    });
    console.log(`Hot-reload WebSocket server started on port ${this.config.port}`);
  }
  async handleClientMessage(message, ws) {
    switch (message.type) {
      case "ping":
        ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
        break;
      case "reload_request":
        await this.triggerReload({ type: "manual", timestamp: Date.now() });
        break;
      case "get_status":
        ws.send(JSON.stringify({
          type: "status",
          isReloading: this.isReloading,
          config: this.config,
          clientCount: this.clients.size,
          timestamp: Date.now()
        }));
        break;
      case "update_config":
        if (message.config) {
          this.updateConfig(message.config);
        }
        break;
    }
  }
  updateConfig(updates) {
    this.config = { ...this.config, ...updates };
    this.broadcast({
      type: "config_updated",
      config: this.config,
      timestamp: Date.now()
    });
  }
  async triggerReload(event) {
    if (!this.config.enabled) return;
    if (this.reloadTimer) {
      clearTimeout(this.reloadTimer);
    }
    this.broadcast({
      type: "reload_pending",
      event,
      delay: this.config.reloadDelay,
      timestamp: Date.now()
    });
    this.reloadTimer = setTimeout(async () => {
      await this.performReload(event);
    }, this.config.reloadDelay);
  }
  async performReload(event) {
    if (this.isReloading) return;
    this.isReloading = true;
    try {
      this.broadcast({
        type: "reload_started",
        event,
        timestamp: Date.now()
      });
      if (!this.config.notifyOnly && this.config.appCommand && this.config.appPath) {
        try {
          await this.killAppProcess();
          await execAsync(this.config.appCommand, {
            cwd: this.config.appPath
          });
          this.broadcast({
            type: "reload_completed",
            success: true,
            event,
            timestamp: Date.now()
          });
        } catch (error) {
          console.error("Failed to reload app:", error);
          this.broadcast({
            type: "reload_completed",
            success: false,
            error: error instanceof Error ? error.message : String(error),
            event,
            timestamp: Date.now()
          });
        }
      } else {
        this.broadcast({
          type: "reload_notification",
          event,
          timestamp: Date.now()
        });
      }
      this.emit("reload", event);
    } finally {
      this.isReloading = false;
    }
  }
  async killAppProcess() {
    if (this.config.appPath) {
      try {
        const { stdout } = await execAsync(`lsof -t -i:3000 || true`);
        if (stdout.trim()) {
          await execAsync(`kill -9 ${stdout.trim()}`);
        }
      } catch (error) {
      }
    }
  }
  broadcast(message) {
    const data = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }
  async stop() {
    if (this.reloadTimer) {
      clearTimeout(this.reloadTimer);
    }
    if (this.wss) {
      this.clients.forEach((client) => {
        client.close();
      });
      this.clients.clear();
      await new Promise((resolve) => {
        this.wss.close(() => resolve());
      });
      this.wss = null;
    }
  }
  getClientCount() {
    return this.clients.size;
  }
  isRunning() {
    return this.wss !== null;
  }
}
let hotReloadInstance = null;
function getHotReloadManager(config) {
  if (!hotReloadInstance) {
    hotReloadInstance = new HotReloadManager(config);
  } else if (config) {
    hotReloadInstance.updateConfig(config);
  }
  return hotReloadInstance;
}

export { getHotReloadManager as g };
