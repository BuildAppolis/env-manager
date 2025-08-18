import fs from 'fs/promises'
import path from 'path'
import readline from 'readline'
import { spawn } from 'child_process'
import http from 'http'
import type { ProjectConfig } from './types.js'

interface EnvManagerStatus {
  running: boolean
  authenticated: boolean
  port: number
}

class EnvLoader {
  private envManagerPort: number
  private envManagerUrl: string

  constructor() {
    this.envManagerPort = 3001
    this.envManagerUrl = `http://localhost:${this.envManagerPort}`
  }

  async checkEnvManagerRunning(): Promise<boolean> {
    return new Promise((resolve) => {
      const req = http.get(this.envManagerUrl, (res) => {
        resolve(res.statusCode === 200)
      })
      
      req.on('error', () => {
        resolve(false)
      })
      
      req.setTimeout(2000, () => {
        req.destroy()
        resolve(false)
      })
    })
  }

  async checkAuthentication(): Promise<boolean> {
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: this.envManagerPort,
        path: '/api/auth',
        method: 'GET'
      }

      const req = http.request(options, (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          try {
            const response = JSON.parse(data)
            resolve(response.authenticated === true)
          } catch {
            resolve(false)
          }
        })
      })

      req.on('error', () => {
        resolve(false)
      })

      req.setTimeout(2000, () => {
        req.destroy()
        resolve(false)
      })

      req.end()
    })
  }

  async authenticate(password: string): Promise<boolean> {
    return new Promise((resolve) => {
      const postData = JSON.stringify({ password })
      
      const options = {
        hostname: 'localhost',
        port: this.envManagerPort,
        path: '/api/auth',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }

      const req = http.request(options, (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          try {
            const response = JSON.parse(data)
            resolve(response.success === true)
          } catch {
            resolve(false)
          }
        })
      })

      req.on('error', () => {
        resolve(false)
      })

      req.setTimeout(5000, () => {
        req.destroy()
        resolve(false)
      })

      req.write(postData)
      req.end()
    })
  }

  async promptForPassword(): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    return new Promise((resolve) => {
      rl.question('🔐 Enter environment manager password: ', (password) => {
        rl.close()
        resolve(password)
      })
    })
  }

  async startEnvManager(): Promise<boolean> {
    console.log('🚀 Starting environment manager...')
    
    return new Promise((resolve) => {
      const envManager = spawn('npm', ['run', 'dev'], {
        cwd: path.join(__dirname),
        stdio: 'pipe',
        detached: true
      })

      let startupTimeout: NodeJS.Timeout
      let resolved = false

      const checkStartup = async () => {
        if (resolved) return
        
        const running = await this.checkEnvManagerRunning()
        if (running) {
          resolved = true
          clearTimeout(startupTimeout)
          console.log('✅ Environment manager started successfully')
          resolve(true)
        }
      }

      // Check every 500ms for startup
      const checkInterval = setInterval(checkStartup, 500)

      // Timeout after 30 seconds
      startupTimeout = setTimeout(() => {
        if (!resolved) {
          resolved = true
          clearInterval(checkInterval)
          envManager.kill()
          console.log('❌ Environment manager failed to start within 30 seconds')
          resolve(false)
        }
      }, 30000)

      envManager.on('error', (error) => {
        if (!resolved) {
          resolved = true
          clearInterval(checkInterval)
          clearTimeout(startupTimeout)
          console.error('❌ Failed to start environment manager:', error.message)
          resolve(false)
        }
      })

      // Start checking after a brief delay
      setTimeout(checkStartup, 2000)
    })
  }

  async registerRequiredVariables(configPath: string): Promise<boolean> {
    try {
      // Import the config file
      const configModule = await import(/* @vite-ignore */ configPath)
      const config: ProjectConfig = configModule.default

      const postData = JSON.stringify({ config })
      
      const options = {
        hostname: 'localhost',
        port: this.envManagerPort,
        path: '/api/project/register',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }

      return new Promise((resolve) => {
        const req = http.request(options, (res) => {
          let data = ''
          res.on('data', (chunk) => {
            data += chunk
          })
          res.on('end', () => {
            try {
              const response = JSON.parse(data)
              resolve(response.success === true)
            } catch {
              resolve(false)
            }
          })
        })

        req.on('error', () => {
          resolve(false)
        })

        req.setTimeout(5000, () => {
          req.destroy()
          resolve(false)
        })

        req.write(postData)
        req.end()
      })
    } catch (error) {
      console.error('Failed to register required variables:', error)
      return false
    }
  }

  async generateEnvFiles(): Promise<boolean> {
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: this.envManagerPort,
        path: '/api/project/generate-env',
        method: 'POST'
      }

      const req = http.request(options, (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          try {
            const response = JSON.parse(data)
            resolve(response.success === true)
          } catch {
            resolve(false)
          }
        })
      })

      req.on('error', () => {
        resolve(false)
      })

      req.setTimeout(10000, () => {
        req.destroy()
        resolve(false)
      })

      req.end()
    })
  }

  async ensureEnvironmentReady(): Promise<boolean> {
    console.log('🔧 Checking environment manager status...')
    
    // Check if environment manager is running
    const isRunning = await this.checkEnvManagerRunning()
    
    if (!isRunning) {
      console.log('⚠️  Environment manager not running')
      const started = await this.startEnvManager()
      if (!started) {
        console.log('❌ Failed to start environment manager')
        return false
      }
    }

    // Check authentication
    const isAuthenticated = await this.checkAuthentication()
    
    if (!isAuthenticated) {
      console.log('🔐 Authentication required')
      
      let attempts = 0
      const maxAttempts = 3
      
      while (attempts < maxAttempts) {
        const password = await this.promptForPassword()
        const authSuccess = await this.authenticate(password)
        
        if (authSuccess) {
          console.log('✅ Authentication successful')
          break
        } else {
          attempts++
          console.log(`❌ Authentication failed (${attempts}/${maxAttempts})`)
          
          if (attempts >= maxAttempts) {
            console.log('🚫 Maximum authentication attempts exceeded')
            return false
          }
        }
      }
    } else {
      console.log('✅ Already authenticated')
    }

    // Register required variables from project config
    const projectRoot = process.cwd()
    const configPath = path.join(projectRoot, 'env.config.ts')
    
    try {
      await fs.access(configPath)
      console.log('📋 Registering project requirements...')
      
      const registered = await this.registerRequiredVariables(configPath)
      if (!registered) {
        console.log('⚠️  Failed to register project requirements')
      }
    } catch {
      console.log('⚠️  No env.config.ts found, skipping project registration')
    }

    // Generate environment files
    console.log('📝 Generating environment files...')
    const generated = await this.generateEnvFiles()
    
    if (generated) {
      console.log('✅ Environment files generated successfully')
    } else {
      console.log('⚠️  Failed to generate environment files')
    }

    console.log('🎉 Environment setup complete!')
    return true
  }
}

export default EnvLoader
