/**
 * Env-Manager Client Library
 * Include this in your app to enable hot-reload capabilities
 */

export interface EnvManagerClientConfig {
  wsPort?: number
  autoReconnect?: boolean
  reconnectDelay?: number
  onReload?: () => void
  onVariablesChanged?: (variables: any) => void
  showNotifications?: boolean
  debug?: boolean
}

export class EnvManagerClient {
  private ws: WebSocket | null = null
  private config: Required<EnvManagerClientConfig>
  private reconnectTimer: NodeJS.Timeout | null = null
  private isConnecting: boolean = false
  private reloadOverlay: HTMLElement | null = null
  
  constructor(config: EnvManagerClientConfig = {}) {
    this.config = {
      wsPort: 3002,
      autoReconnect: true,
      reconnectDelay: 3000,
      onReload: () => window.location.reload(),
      onVariablesChanged: () => {},
      showNotifications: true,
      debug: false,
      ...config
    }
    
    // Auto-connect on instantiation
    this.connect()
    
    // Create reload overlay
    if (typeof window !== 'undefined' && this.config.showNotifications) {
      this.createReloadOverlay()
    }
  }
  
  private createReloadOverlay(): void {
    // Check if overlay already exists
    if (document.getElementById('env-manager-overlay')) return
    
    const overlay = document.createElement('div')
    overlay.id = 'env-manager-overlay'
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 999999;
      font-family: system-ui, -apple-system, sans-serif;
    `
    
    overlay.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        padding: 32px;
        color: white;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        max-width: 400px;
      ">
        <div style="
          width: 60px;
          height: 60px;
          border: 3px solid white;
          border-top-color: transparent;
          border-radius: 50%;
          margin: 0 auto 20px;
          animation: spin 1s linear infinite;
        "></div>
        <h2 style="margin: 0 0 12px; font-size: 24px;">Reloading Environment</h2>
        <p style="margin: 0; opacity: 0.9; font-size: 16px;">
          <span id="env-reload-message">Applying new environment variables...</span>
        </p>
      </div>
      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `
    
    document.body.appendChild(overlay)
    this.reloadOverlay = overlay
  }
  
  private showReloadOverlay(message: string = 'Applying new environment variables...'): void {
    if (this.reloadOverlay) {
      const messageEl = this.reloadOverlay.querySelector('#env-reload-message')
      if (messageEl) {
        messageEl.textContent = message
      }
      this.reloadOverlay.style.display = 'flex'
    }
  }
  
  private hideReloadOverlay(): void {
    if (this.reloadOverlay) {
      this.reloadOverlay.style.display = 'none'
    }
  }
  
  connect(): void {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) return
    
    this.isConnecting = true
    
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = window.location.hostname
      this.ws = new WebSocket(`${protocol}//${host}:${this.config.wsPort}`)
      
      this.ws.onopen = () => {
        this.isConnecting = false
        if (this.config.debug) {
          console.log('[Env-Manager] Connected to hot-reload server')
        }
        this.showToast('Connected to Env-Manager', 'success')
      }
      
      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('[Env-Manager] Failed to parse message:', error)
        }
      }
      
      this.ws.onclose = () => {
        this.isConnecting = false
        if (this.config.debug) {
          console.log('[Env-Manager] Disconnected from hot-reload server')
        }
        
        if (this.config.autoReconnect) {
          this.scheduleReconnect()
        }
      }
      
      this.ws.onerror = (error) => {
        this.isConnecting = false
        if (this.config.debug) {
          console.error('[Env-Manager] WebSocket error:', error)
        }
      }
      
    } catch (error) {
      this.isConnecting = false
      console.error('[Env-Manager] Failed to connect:', error)
      
      if (this.config.autoReconnect) {
        this.scheduleReconnect()
      }
    }
  }
  
  private scheduleReconnect(): void {
    if (this.reconnectTimer) return
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, this.config.reconnectDelay)
  }
  
  private handleMessage(message: any): void {
    if (this.config.debug) {
      console.log('[Env-Manager] Received:', message)
    }
    
    switch (message.type) {
      case 'connected':
        // Initial connection established
        break
        
      case 'reload_pending':
        this.showToast(`Environment reload in ${message.delay}ms...`, 'info')
        break
        
      case 'reload_started':
        this.showReloadOverlay('Reloading environment variables...')
        break
        
      case 'reload_completed':
        this.hideReloadOverlay()
        if (message.success) {
          this.showToast('Environment reloaded successfully', 'success')
          // Trigger actual reload
          setTimeout(() => {
            this.config.onReload()
          }, 500)
        } else {
          this.showToast('Reload failed: ' + message.error, 'error')
        }
        break
        
      case 'reload_notification':
        // Just a notification, app should handle reload
        this.showToast('Environment variables updated', 'info')
        this.config.onVariablesChanged(message.event.details)
        break
        
      case 'variables_changed':
        this.config.onVariablesChanged(message.variables)
        break
    }
  }
  
  private showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    if (!this.config.showNotifications || typeof window === 'undefined') return
    
    const toast = document.createElement('div')
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      z-index: 999998;
      animation: slideIn 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `
    
    const colors = {
      success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      info: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    }
    
    toast.style.background = colors[type]
    toast.textContent = message
    
    const style = document.createElement('style')
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `
    
    document.body.appendChild(style)
    document.body.appendChild(toast)
    
    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse'
      setTimeout(() => {
        document.body.removeChild(toast)
        document.body.removeChild(style)
      }, 300)
    }, 3000)
  }
  
  // Public methods
  
  requestReload(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'reload_request' }))
    }
  }
  
  updateConfig(config: Partial<EnvManagerClientConfig>): void {
    this.config = { ...this.config, ...config }
  }
  
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
  
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Check if auto-init is enabled via meta tag
  const metaTag = document.querySelector('meta[name="env-manager-auto-init"]')
  if (metaTag?.getAttribute('content') === 'true') {
    const client = new EnvManagerClient({
      debug: process.env.NODE_ENV === 'development'
    })
    
    // Make it globally available
    ;(window as any).envManagerClient = client
  }
}

export default EnvManagerClient