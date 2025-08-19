#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { spawn, exec } from 'child_process'
import { promisify } from 'util'
import os from 'os'

const execAsync = promisify(exec)
const __dirname = dirname(fileURLToPath(import.meta.url))

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
}

// Configuration paths
const ENV_MANAGER_DIR = join(os.homedir(), '.env-manager')
const GLOBAL_CONFIG_PATH = join(ENV_MANAGER_DIR, 'config.json')
const PROJECTS_PATH = join(ENV_MANAGER_DIR, 'projects.json')

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function printHeader() {
  console.log()
  log('╔══════════════════════════════════════════════╗', colors.bright + colors.blue)
  log('║     🔧 ENV-MANAGER PORT CONFIGURATION       ║', colors.bright + colors.blue)
  log('╚══════════════════════════════════════════════╝', colors.bright + colors.blue)
  console.log()
}

// Load or create global config
function loadGlobalConfig() {
  try {
    if (existsSync(GLOBAL_CONFIG_PATH)) {
      return JSON.parse(readFileSync(GLOBAL_CONFIG_PATH, 'utf-8'))
    }
  } catch (error) {
    // Ignore errors, return default
  }
  
  // Default configuration
  return {
    defaultPort: 3001,
    defaultWsPort: 3002,
    ports: {
      http: 3001,
      ws: 3002
    },
    autoRestart: true
  }
}

// Save global config
function saveGlobalConfig(config) {
  if (!existsSync(ENV_MANAGER_DIR)) {
    mkdirSync(ENV_MANAGER_DIR, { recursive: true })
  }
  writeFileSync(GLOBAL_CONFIG_PATH, JSON.stringify(config, null, 2))
}

// Load projects configuration
function loadProjects() {
  try {
    if (existsSync(PROJECTS_PATH)) {
      return JSON.parse(readFileSync(PROJECTS_PATH, 'utf-8'))
    }
  } catch (error) {
    // Ignore errors
  }
  return { projects: {} }
}

// Save projects configuration
function saveProjects(projects) {
  writeFileSync(PROJECTS_PATH, JSON.stringify(projects, null, 2))
}

// Check if port is in use
async function isPortInUse(port) {
  try {
    const { stdout } = await execAsync(`lsof -i :${port} -P -n | grep LISTEN`)
    return stdout.trim().length > 0
  } catch (error) {
    return false
  }
}

// Find env-manager processes
async function findEnvManagerProcesses() {
  try {
    const currentPid = process.pid
    const { stdout } = await execAsync('ps aux | grep -E "env-manager start|astro dev|PORT=[0-9]+.*astro" | grep -v grep | grep -v "env-manager-port.mjs"')
    const lines = stdout.trim().split('\n').filter(Boolean)
    const processes = []
    
    for (const line of lines) {
      const parts = line.split(/\s+/)
      const pid = parseInt(parts[1])
      const command = parts.slice(10).join(' ')
      
      // Skip our own process and parent processes
      if (pid === currentPid) continue
      
      // Check if it's an env-manager server process (not CLI commands)
      if (command.includes('env-manager start') || 
          command.includes('astro dev') || 
          (command.includes('PORT=') && command.includes('astro'))) {
        // Try to extract port from command
        const portMatch = command.match(/PORT=(\d+)/)
        const port = portMatch ? parseInt(portMatch[1]) : null
        
        processes.push({
          pid,
          command: command.substring(0, 100),
          port
        })
      }
    }
    
    return processes
  } catch (error) {
    return []
  }
}

// Kill processes using specific port
async function killProcessOnPort(port) {
  try {
    await execAsync(`lsof -ti :${port} | xargs kill -9 2>/dev/null`)
    return true
  } catch (error) {
    return false
  }
}

// Update all project configs with new port
async function updateProjectPorts(httpPort, wsPort) {
  const projects = loadProjects()
  let updated = 0
  
  for (const [projectPath, project] of Object.entries(projects.projects || {})) {
    project.port = httpPort
    project.wsPort = wsPort
    updated++
    
    // Also update env.config.ts if it exists
    const configPath = join(projectPath, 'env.config.ts')
    if (existsSync(configPath)) {
      try {
        let content = readFileSync(configPath, 'utf-8')
        // Update port in config
        content = content.replace(/port:\s*\d+/g, `port: ${httpPort}`)
        writeFileSync(configPath, content)
        log(`  ✅ Updated ${projectPath}/env.config.ts`, colors.green)
      } catch (error) {
        log(`  ⚠️  Could not update ${configPath}`, colors.yellow)
      }
    }
  }
  
  if (updated > 0) {
    saveProjects(projects)
    log(`  ✅ Updated ${updated} project configuration(s)`, colors.green)
  }
  
  return updated
}

// Start env-manager with new port
async function startEnvManager(port) {
  try {
    log(`\n🚀 Starting env-manager on port ${port}...`, colors.cyan)
    
    // Find the most recently accessed project
    const projects = loadProjects()
    let activeProject = null
    let latestAccess = null
    
    for (const [path, project] of Object.entries(projects.projects || {})) {
      const accessTime = new Date(project.lastAccessed || 0)
      if (!latestAccess || accessTime > latestAccess) {
        latestAccess = accessTime
        activeProject = path
      }
    }
    
    if (activeProject) {
      // Start in the active project directory
      const logDir = join(activeProject, '.env-manager-logs')
      if (!existsSync(logDir)) {
        mkdirSync(logDir, { recursive: true })
      }
      
      const command = `cd "${activeProject}" && PROJECT_ROOT="${activeProject}" PORT=${port} nohup env-manager start > ${logDir}/output.log 2> ${logDir}/error.log & echo $!`
      const { stdout } = await execAsync(command)
      const pid = stdout.trim()
      
      log(`  ✅ Started env-manager (PID: ${pid})`, colors.green)
      log(`  📁 Project: ${activeProject}`, colors.cyan)
      log(`  🌐 Access at: http://localhost:${port}`, colors.blue)
      
      return true
    } else {
      log('  ⚠️  No active project found', colors.yellow)
      log('  Run env-manager in a project directory first', colors.yellow)
      return false
    }
  } catch (error) {
    log(`  ❌ Failed to start: ${error.message}`, colors.red)
    return false
  }
}

// Main command functions
async function getStatus() {
  const config = loadGlobalConfig()
  const projects = loadProjects()
  const processes = await findEnvManagerProcesses()
  
  log('CURRENT CONFIGURATION:', colors.bright)
  log(`  HTTP Port: ${config.ports.http}`, colors.cyan)
  log(`  WebSocket Port: ${config.ports.ws}`, colors.cyan)
  log(`  Auto-restart: ${config.autoRestart ? 'Yes' : 'No'}`, colors.cyan)
  
  if (processes.length > 0) {
    log('\nRUNNING PROCESSES:', colors.bright)
    for (const proc of processes) {
      log(`  PID ${proc.pid}: ${proc.command}`, colors.green)
      if (proc.port) {
        log(`    Port: ${proc.port}`, colors.cyan)
      }
    }
  } else {
    log('\nNo env-manager processes currently running', colors.yellow)
  }
  
  const httpInUse = await isPortInUse(config.ports.http)
  const wsInUse = await isPortInUse(config.ports.ws)
  
  log('\nPORT STATUS:', colors.bright)
  log(`  Port ${config.ports.http}: ${httpInUse ? '🔴 In use' : '🟢 Available'}`)
  log(`  Port ${config.ports.ws}: ${wsInUse ? '🔴 In use' : '🟢 Available'}`)
  
  const projectCount = Object.keys(projects.projects || {}).length
  if (projectCount > 0) {
    log(`\nRegistered projects: ${projectCount}`, colors.cyan)
  }
}

async function setPort(newPort, options = {}) {
  const config = loadGlobalConfig()
  const oldPort = config.ports.http
  const wsPort = options.wsPort || (newPort + 1)
  
  if (newPort === oldPort && wsPort === config.ports.ws) {
    log('Port configuration is already set to these values', colors.yellow)
    return
  }
  
  log(`Changing ports:`, colors.bright)
  log(`  HTTP: ${oldPort} → ${newPort}`, colors.cyan)
  log(`  WebSocket: ${config.ports.ws} → ${wsPort}`, colors.cyan)
  
  // Check if new ports are available
  const httpInUse = await isPortInUse(newPort)
  const wsInUse = await isPortInUse(wsPort)
  
  if (httpInUse || wsInUse) {
    if (!options.force) {
      log('\n⚠️  Warning: Ports are in use:', colors.yellow)
      if (httpInUse) log(`  Port ${newPort} is already in use`, colors.yellow)
      if (wsInUse) log(`  Port ${wsPort} is already in use`, colors.yellow)
      log('\nUse --force to kill existing processes', colors.yellow)
      return
    }
    
    log('\nKilling processes on target ports...', colors.yellow)
    if (httpInUse) await killProcessOnPort(newPort)
    if (wsInUse) await killProcessOnPort(wsPort)
  }
  
  // Find and kill existing env-manager processes
  if (options.restart || config.autoRestart) {
    log('\nStopping existing env-manager processes...', colors.yellow)
    const processes = await findEnvManagerProcesses()
    
    for (const proc of processes) {
      try {
        await execAsync(`kill ${proc.pid} 2>/dev/null`)
        log(`  Stopped PID ${proc.pid}`, colors.green)
      } catch (error) {
        // Process might already be dead
      }
    }
    
    // Also try to kill processes on old ports
    await killProcessOnPort(oldPort)
    await killProcessOnPort(config.ports.ws)
  }
  
  // Update configuration
  config.ports.http = newPort
  config.ports.ws = wsPort
  config.defaultPort = newPort
  config.defaultWsPort = wsPort
  saveGlobalConfig(config)
  
  log('\n✅ Global configuration updated', colors.green)
  
  // Update all project configurations
  log('\nUpdating project configurations...', colors.cyan)
  await updateProjectPorts(newPort, wsPort)
  
  // Restart if requested
  if (options.restart || config.autoRestart) {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait a moment
    await startEnvManager(newPort)
  } else {
    log('\nTo start env-manager with new port:', colors.cyan)
    log(`  PORT=${newPort} env-manager start`, colors.blue)
  }
}

async function restartEnvManager() {
  const config = loadGlobalConfig()
  
  log('Restarting env-manager...', colors.yellow)
  
  // Kill existing processes
  const processes = await findEnvManagerProcesses()
  for (const proc of processes) {
    try {
      await execAsync(`kill ${proc.pid} 2>/dev/null`)
      log(`  Stopped PID ${proc.pid}`, colors.green)
    } catch (error) {
      // Ignore
    }
  }
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Start with configured port
  await startEnvManager(config.ports.http)
}

// Parse command line arguments
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  printHeader()
  
  switch (command) {
    case 'status':
    case undefined:
      await getStatus()
      break
      
    case 'set':
      const port = parseInt(args[1])
      if (!port || port < 1 || port > 65535) {
        log('❌ Invalid port number', colors.red)
        log('\nUsage: env-manager port set <port> [options]', colors.cyan)
        log('  --ws-port <port>  Set WebSocket port (default: port+1)', colors.cyan)
        log('  --force           Kill processes using target ports', colors.cyan)
        log('  --no-restart      Don\'t restart env-manager', colors.cyan)
        break
      }
      
      const options = {
        wsPort: args.includes('--ws-port') ? parseInt(args[args.indexOf('--ws-port') + 1]) : port + 1,
        force: args.includes('--force'),
        restart: !args.includes('--no-restart')
      }
      
      await setPort(port, options)
      break
      
    case 'restart':
      await restartEnvManager()
      break
      
    case 'help':
    case '--help':
    case '-h':
      log('USAGE:', colors.bright)
      log('  env-manager port [command] [options]', colors.cyan)
      log('')
      log('COMMANDS:', colors.bright)
      log('  status              Show current port configuration', colors.cyan)
      log('  set <port>          Change default port', colors.cyan)
      log('  restart             Restart env-manager with current port', colors.cyan)
      log('')
      log('OPTIONS:', colors.bright)
      log('  --ws-port <port>    Set WebSocket port (default: http+1)', colors.cyan)
      log('  --force             Kill processes using target ports', colors.cyan)
      log('  --no-restart        Don\'t auto-restart after port change', colors.cyan)
      log('')
      log('EXAMPLES:', colors.bright)
      log('  env-manager port status', colors.cyan)
      log('  env-manager port set 8080', colors.cyan)
      log('  env-manager port set 3000 --ws-port 3001', colors.cyan)
      log('  env-manager port set 5000 --force', colors.cyan)
      log('  env-manager port restart', colors.cyan)
      break
      
    default:
      log(`❌ Unknown command: ${command}`, colors.red)
      log('Use "env-manager port help" for usage information', colors.cyan)
  }
  
  console.log()
}

// Run the CLI
main().catch(error => {
  log(`\n❌ Error: ${error.message}`, colors.red)
  process.exit(1)
})