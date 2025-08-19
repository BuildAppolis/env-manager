import { WebSocketServer, WebSocket } from 'ws'
import { EventEmitter } from 'events'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface HotReloadConfig {
  enabled: boolean
  autoReload: boolean
  reloadDelay: number // ms delay before reload
  port: number
  appCommand?: string // Command to restart app (e.g., "npm run dev")
  appPath?: string // Path to app directory
  notifyOnly?: boolean // Just notify, don't actually reload
}

export interface ReloadEvent {
  type: 'variables_changed' | 'config_changed' | 'branch_switched' | 'manual'
  timestamp: number
  details?: any
}

export class HotReloadManager extends EventEmitter {
  private wss: WebSocketServer | null = null
  private clients: Set<WebSocket> = new Set()
  private config: HotReloadConfig
  private reloadTimer: NodeJS.Timeout | null = null
  private isReloading: boolean = false
  
  constructor(config: Partial<HotReloadConfig> = {}) {
    super()
    this.config = {
      enabled: true,
      autoReload: true,
      reloadDelay: 1000,
      port: 3002, // Default WebSocket port
      notifyOnly: false,
      ...config
    }
  }
  
  async start(): Promise<void> {
    if (!this.config.enabled) return
    
    this.wss = new WebSocketServer({ 
      port: this.config.port,
      perMessageDeflate: false
    })
    
    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws)
      
      // Send initial connection message
      ws.send(JSON.stringify({
        type: 'connected',
        config: this.config,
        timestamp: Date.now()
      }))
      
      ws.on('close', () => {
        this.clients.delete(ws)
      })
      
      ws.on('error', (error) => {
        console.error('WebSocket error:', error)
        this.clients.delete(ws)
      })
      
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString())
          await this.handleClientMessage(message, ws)
        } catch (error) {
          console.error('Failed to handle client message:', error)
        }
      })
    })
    
    console.log(`Hot-reload WebSocket server started on port ${this.config.port}`)
  }
  
  private async handleClientMessage(message: any, ws: WebSocket): Promise<void> {
    switch (message.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }))
        break
        
      case 'reload_request':
        await this.triggerReload({ type: 'manual', timestamp: Date.now() })
        break
        
      case 'get_status':
        ws.send(JSON.stringify({
          type: 'status',
          isReloading: this.isReloading,
          config: this.config,
          clientCount: this.clients.size,
          timestamp: Date.now()
        }))
        break
        
      case 'update_config':
        if (message.config) {
          this.updateConfig(message.config)
        }
        break
    }
  }
  
  updateConfig(updates: Partial<HotReloadConfig>): void {
    this.config = { ...this.config, ...updates }
    this.broadcast({
      type: 'config_updated',
      config: this.config,
      timestamp: Date.now()
    })
  }
  
  async triggerReload(event: ReloadEvent): Promise<void> {
    if (!this.config.enabled) return
    
    // Clear existing timer
    if (this.reloadTimer) {
      clearTimeout(this.reloadTimer)
    }
    
    // Broadcast loading state
    this.broadcast({
      type: 'reload_pending',
      event,
      delay: this.config.reloadDelay,
      timestamp: Date.now()
    })
    
    // Wait for delay
    this.reloadTimer = setTimeout(async () => {
      await this.performReload(event)
    }, this.config.reloadDelay)
  }
  
  private async performReload(event: ReloadEvent): Promise<void> {
    if (this.isReloading) return
    
    this.isReloading = true
    
    try {
      // Notify clients reload is starting
      this.broadcast({
        type: 'reload_started',
        event,
        timestamp: Date.now()
      })
      
      if (!this.config.notifyOnly && this.config.appCommand && this.config.appPath) {
        // Try to reload the app
        try {
          // First, try to find and kill the existing process
          await this.killAppProcess()
          
          // Start the app again
          await execAsync(this.config.appCommand, {
            cwd: this.config.appPath
          })
          
          this.broadcast({
            type: 'reload_completed',
            success: true,
            event,
            timestamp: Date.now()
          })
        } catch (error) {
          console.error('Failed to reload app:', error)
          
          // Fallback to notify-only mode
          this.broadcast({
            type: 'reload_completed',
            success: false,
            error: error instanceof Error ? error.message : String(error),
            event,
            timestamp: Date.now()
          })
        }
      } else {
        // Notify-only mode
        this.broadcast({
          type: 'reload_notification',
          event,
          timestamp: Date.now()
        })
      }
      
      this.emit('reload', event)
      
    } finally {
      this.isReloading = false
    }
  }
  
  private async killAppProcess(): Promise<void> {
    // Try to find the app process by port
    if (this.config.appPath) {
      try {
        // Find process using the app's default port (usually 3000 for Next.js, etc.)
        const { stdout } = await execAsync(`lsof -t -i:3000 || true`)
        if (stdout.trim()) {
          await execAsync(`kill -9 ${stdout.trim()}`)
        }
      } catch (error) {
        // Ignore errors - process might not exist
      }
    }
  }
  
  broadcast(message: any): void {
    const data = JSON.stringify(message)
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data)
      }
    })
  }
  
  async stop(): Promise<void> {
    if (this.reloadTimer) {
      clearTimeout(this.reloadTimer)
    }
    
    if (this.wss) {
      this.clients.forEach(client => {
        client.close()
      })
      this.clients.clear()
      
      await new Promise<void>((resolve) => {
        this.wss!.close(() => resolve())
      })
      
      this.wss = null
    }
  }
  
  getClientCount(): number {
    return this.clients.size
  }
  
  isRunning(): boolean {
    return this.wss !== null
  }
}

// Singleton instance
let hotReloadInstance: HotReloadManager | null = null

export function getHotReloadManager(config?: Partial<HotReloadConfig>): HotReloadManager {
  if (!hotReloadInstance) {
    hotReloadInstance = new HotReloadManager(config)
  } else if (config) {
    hotReloadInstance.updateConfig(config)
  }
  return hotReloadInstance
}