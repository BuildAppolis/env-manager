#!/usr/bin/env node

import { program } from 'commander'
import fs from 'fs'
import path from 'path'
import { createHash, randomBytes, pbkdf2Sync } from 'crypto'
import { fileURLToPath } from 'url'
import readline from 'readline'
import { spawn } from 'child_process'
import os from 'os'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'))

// Project registry file path
const registryPath = path.join(os.homedir(), '.env-manager', 'projects.json')
const registryDir = path.dirname(registryPath)

// ANSI color codes
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

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

// Project registry functions
function loadProjectRegistry() {
  try {
    if (!fs.existsSync(registryPath)) {
      return { projects: {}, activeProject: null }
    }
    return JSON.parse(fs.readFileSync(registryPath, 'utf-8'))
  } catch (error) {
    return { projects: {}, activeProject: null }
  }
}

function saveProjectRegistry(registry) {
  try {
    if (!fs.existsSync(registryDir)) {
      fs.mkdirSync(registryDir, { recursive: true })
    }
    fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2))
  } catch (error) {
    console.error('Failed to save project registry:', error)
  }
}

function registerProject(projectPath, projectName, customPort) {
  const registry = loadProjectRegistry()
  const absolutePath = path.resolve(projectPath)
  
  // Auto-detect project name from package.json or directory name
  let name = projectName
  if (!name) {
    const pkgPath = path.join(absolutePath, 'package.json')
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
        name = pkg.name || path.basename(absolutePath)
      } catch {
        name = path.basename(absolutePath)
      }
    } else {
      name = path.basename(absolutePath)
    }
  }
  
  // Use custom port or auto-assign
  let port = customPort
  if (!port) {
    // Check if project already has a port
    if (registry.projects[absolutePath]) {
      port = registry.projects[absolutePath].port
    } else {
      // Find next available port
      const usedPorts = Object.values(registry.projects).map(p => p.port)
      port = 3001
      while (usedPorts.includes(port)) {
        port++
      }
    }
  }
  
  registry.projects[absolutePath] = {
    name,
    path: absolutePath,
    port,
    wsPort: port + 1, // WebSocket port is always port + 1
    lastAccessed: new Date().toISOString(),
    hotReload: {
      enabled: true,
      autoReload: true,
      reloadDelay: 1000
    }
  }
  
  saveProjectRegistry(registry)
  return registry.projects[absolutePath]
}

function getProjectForPath(projectPath) {
  const registry = loadProjectRegistry()
  const absolutePath = path.resolve(projectPath)
  return registry.projects[absolutePath]
}

async function promptPassword(message) {
  // Check if stdin is a TTY
  if (!process.stdin.isTTY) {
    // For non-TTY environments, use standard readline
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
      rl.question(message, (answer) => {
        rl.close()
        resolve(answer)
      })
    })
  }
  
  // For TTY environments, properly hide the input
  return new Promise((resolve) => {
    let password = ''
    process.stdout.write(message)
    
    // Save original settings
    const wasRaw = process.stdin.isRaw
    
    // Set raw mode to capture characters one by one
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    
    const onData = (char) => {
      // Handle special characters
      switch (char) {
        case '\r':  // Enter
        case '\n':
        case '\u0004':  // Ctrl+D
          // Cleanup and return password
          process.stdin.removeListener('data', onData)
          process.stdin.setRawMode(wasRaw)
          process.stdin.pause()
          process.stdout.write('\n')
          resolve(password)
          break
          
        case '\u0003':  // Ctrl+C
          // Exit on Ctrl+C
          process.stdin.removeListener('data', onData)
          process.stdin.setRawMode(wasRaw)
          process.stdin.pause()
          process.stdout.write('\n')
          process.exit(1)
          break
          
        case '\u007f':  // Backspace (DEL)
        case '\b':      // Backspace
        case '\x08':    // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1)
            // Move cursor back, write space, move back again
            process.stdout.write('\b \b')
          }
          break
          
        default:
          // Normal character - add to password and show asterisk
          if (char && char.charCodeAt(0) >= 32) {  // Printable characters only
            password += char
            process.stdout.write('*')
          }
          break
      }
    }
    
    process.stdin.on('data', onData)
  })
}

// Store credentials securely in user home directory
function getCredentialsPath() {
  return path.join(os.homedir(), '.env-manager', 'credentials.json')
}

function loadCredentials() {
  try {
    const credPath = getCredentialsPath()
    if (fs.existsSync(credPath)) {
      return JSON.parse(fs.readFileSync(credPath, 'utf-8'))
    }
  } catch (error) {
    console.error('Failed to load credentials:', error)
  }
  return null
}

function saveCredentials(credentials) {
  try {
    const credPath = getCredentialsPath()
    const credDir = path.dirname(credPath)
    
    if (!fs.existsSync(credDir)) {
      fs.mkdirSync(credDir, { recursive: true })
    }
    
    fs.writeFileSync(credPath, JSON.stringify(credentials, null, 2))
    // Set restrictive permissions (owner read/write only)
    fs.chmodSync(credPath, 0o600)
    return true
  } catch (error) {
    console.error('Failed to save credentials:', error)
    return false
  }
}

function hashPassword(password, salt) {
  return pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
}

function generateRecoveryPhrase() {
  const words = [
    'alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot',
    'golf', 'hotel', 'india', 'juliet', 'kilo', 'lima',
    'mike', 'november', 'oscar', 'papa', 'quebec', 'romeo',
    'sierra', 'tango', 'uniform', 'victor', 'whiskey', 'zulu'
  ]
  
  const phrase = []
  for (let i = 0; i < 4; i++) {
    phrase.push(words[Math.floor(Math.random() * words.length)])
  }
  phrase.push(Math.floor(Math.random() * 9999).toString().padStart(4, '0'))
  
  return phrase.join('-')
}

async function setupGlobalPassword(silent = false) {
  // Check if global credentials already exist
  const existingCreds = loadCredentials()
  
  if (existingCreds) {
    if (!silent) {
      log('✅ Global password already configured', colors.green)
      log(`   Created: ${new Date(existingCreds.createdAt).toLocaleDateString()}`, colors.reset)
    }
    return true
  }
  
  log('🔐 BuildAppolis Env-Manager - Global Password Setup', colors.bright + colors.blue)
  log('━'.repeat(50), colors.blue)
  console.log()
  log('Please set a master password for Env-Manager:', colors.cyan)
  log('(This password will be used for all projects)', colors.reset)
  console.log()
  
  const password = await promptPassword('Password: ')
  
  if (!password || password.length < 6) {
    log('❌ Password must be at least 6 characters', colors.red)
    return false
  }
  
  const confirmPassword = await promptPassword('Confirm password: ')
  
  if (password !== confirmPassword) {
    log('❌ Passwords do not match', colors.red)
    return false
  }
  
  // Generate secure credentials
  const salt = randomBytes(32).toString('hex')
  const passwordHash = hashPassword(password, salt)
  const encryptionKey = randomBytes(32).toString('hex')
  const recoveryPhrase = generateRecoveryPhrase()
  const recoveryHash = createHash('sha256').update(recoveryPhrase).digest('hex')
  
  const credentials = {
    passwordHash,
    salt,
    encryptionKey,
    recoveryHash,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  }
  
  // Save credentials securely
  if (!saveCredentials(credentials)) {
    log('❌ Failed to save credentials', colors.red)
    return false
  }
  
  console.log()
  log('✅ Password configured successfully!', colors.green)
  log('━'.repeat(50), colors.blue)
  console.log()
  log('🔑 IMPORTANT - Save your recovery phrase:', colors.bright + colors.yellow)
  log('━'.repeat(50), colors.yellow)
  log(recoveryPhrase, colors.bright + colors.cyan)
  log('━'.repeat(50), colors.yellow)
  log('⚠️  Write this down and store it safely!', colors.yellow)
  log('   You\'ll need it if you forget your password', colors.reset)
  console.log()
  return true
}

async function setupProjectPassword() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  const answer = await new Promise(resolve => {
    rl.question('\nDo you want to set a project-specific password? (y/N): ', resolve)
  })
  rl.close()
  
  if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
    return null
  }
  
  log('\n🔒 Setting project-specific password', colors.cyan)
  const password = await promptPassword('Project password: ')
  
  if (!password || password.length < 6) {
    log('❌ Password must be at least 6 characters', colors.red)
    return null
  }
  
  const confirmPassword = await promptPassword('Confirm password: ')
  
  if (password !== confirmPassword) {
    log('❌ Passwords do not match', colors.red)
    return null
  }
  
  // Generate project-specific credentials
  const salt = randomBytes(32).toString('hex')
  const passwordHash = hashPassword(password, salt)
  
  log('✅ Project password set successfully!', colors.green)
  return { passwordHash, salt }
}

async function initProject() {
  const projectPath = process.cwd()
  const packageJsonPath = path.join(projectPath, 'package.json')
  let projectName = path.basename(projectPath)
  let projectVersion = '1.0.0'
  
  // Try to read project info from package.json
  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
      projectName = pkg.name || projectName
      projectVersion = pkg.version || projectVersion
    } catch {}
  }
  
  // Display header with project info
  log('🚀 BuildAppolis Env-Manager - Project Setup', colors.bright + colors.blue)
  log('━'.repeat(50), colors.blue)
  console.log()
  log('📦 Project Information:', colors.cyan)
  log(`   Name: ${projectName}`, colors.reset)
  log(`   Version: ${projectVersion}`, colors.reset)
  log(`   Path: ${projectPath}`, colors.reset)
  log(`   Env-Manager: v${packageJson.version}`, colors.reset)
  console.log()
  
  // Check and setup global password first
  const hasGlobalPassword = await setupGlobalPassword(true)
  if (!hasGlobalPassword) {
    process.exit(1)
  }
  
  // Create env.config.ts template
  const configPath = path.join(projectPath, 'env.config.ts')
  
  if (fs.existsSync(configPath)) {
    log('✅ env.config.ts already exists', colors.green)
  } else {
    const configTemplate = `// Environment Configuration
// Generated by BuildAppolis Env-Manager

import type { ProjectConfig } from '@buildappolis/env-manager'

const config: ProjectConfig = {
  projectName: '${projectName}',
  projectVersion: '${projectVersion}',
  envManagerVersion: '^${packageJson.version}',
  
  requirements: {
    // Example: Database configuration
    database: {
      name: 'Database',
      required: true,
      variables: [
        {
          name: 'DATABASE_URL',
          type: 'url',
          sensitive: true,
          description: 'Database connection string',
          example: 'postgresql://user:pass@localhost:5432/dbname'
        }
      ]
    },
    
    // Add more requirement groups as needed
  },
  
  validation: {
    requiredGroups: ['database']
  },
  
  devServer: {
    blockUntilReady: true,
    showProgress: true,
    autoGenerate: true,
    validateOnStart: true
  }
}

export default config
`
    
    fs.writeFileSync(configPath, configTemplate)
    log('✅ Created env.config.ts template', colors.green)
  }
  
  // Create .env.example if not exists
  const envExamplePath = path.join(process.cwd(), '.env.example')
  
  if (!fs.existsSync(envExamplePath)) {
    const envExampleContent = `# BuildAppolis Env-Manager Configuration
ENV_MANAGER_ENABLED=true
ENV_MANAGER_URL=http://localhost:3001
ENV_MANAGER_PASSWORD=your-secure-password

# Your environment variables will be added here
`
    
    fs.writeFileSync(envExamplePath, envExampleContent)
    log('✅ Created .env.example template', colors.green)
  }
  
  // Optional project-specific password
  const projectPassword = await setupProjectPassword()
  
  // Register project in registry
  const projectInfo = registerProject(projectPath, projectName)
  
  // Save project password if set
  if (projectPassword) {
    const registry = loadProjectRegistry()
    registry.projects[path.resolve(projectPath)].projectPassword = projectPassword
    saveProjectRegistry(registry)
  }
  log(`✅ Project registered: ${projectInfo.name}`, colors.green)
  log(`   Port assigned: ${projectInfo.port}`, colors.reset)
  
  log('✅ Project initialized successfully!', colors.green)
  console.log()
  log('Next steps:', colors.cyan)
  log('1. Edit env.config.ts to define your environment requirements', colors.reset)
  log('2. Run "npx env-manager start" to start the service', colors.reset)
  log(`3. Open http://localhost:${projectInfo.port} to configure variables`, colors.reset)
  console.log()
}

async function startService(options = {}) {
  const projectRoot = options.project || process.cwd()
  const absolutePath = path.resolve(projectRoot)
  
  // Get project info from package.json
  const packageJsonPath = path.join(absolutePath, 'package.json')
  let projectName = path.basename(absolutePath)
  let projectVersion = '1.0.0'
  
  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
      projectName = pkg.name || projectName
      projectVersion = pkg.version || projectVersion
    } catch {}
  }
  
  // Get or register project
  let projectInfo = getProjectForPath(absolutePath)
  if (!projectInfo) {
    log('📝 Registering new project...', colors.cyan)
    projectInfo = registerProject(absolutePath, projectName)
  }
  
  // Update last accessed time
  const registry = loadProjectRegistry()
  registry.projects[absolutePath].lastAccessed = new Date().toISOString()
  registry.activeProject = absolutePath
  saveProjectRegistry(registry)
  
  // Display project header
  console.log()
  log('╔' + '═'.repeat(48) + '╗', colors.bright + colors.blue)
  log('║' + `     🔧 ${projectName}`.padEnd(48) + '║', colors.bright + colors.blue)
  log('╚' + '═'.repeat(48) + '╝', colors.bright + colors.blue)
  console.log()
  log('📦 Project Details:', colors.cyan)
  log(`   Name: ${projectName}`, colors.reset)
  log(`   Version: ${projectVersion}`, colors.reset)
  log(`   Path: ${projectInfo.path}`, colors.reset)
  log(`   Port: ${projectInfo.port}`, colors.reset)
  log(`   Env-Manager: v${packageJson.version}`, colors.reset)
  console.log()
  
  const envManagerPath = path.join(__dirname, '..')
  
  // Check for env.config.ts or env.config.js
  const configTsPath = path.join(absolutePath, 'env.config.ts')
  const configJsPath = path.join(absolutePath, 'env.config.js')
  const configExists = fs.existsSync(configTsPath) || fs.existsSync(configJsPath)
  
  if (configExists) {
    log('✅ Found env.config.' + (fs.existsSync(configTsPath) ? 'ts' : 'js'), colors.green)
  } else {
    log('⚠️  No env.config.ts found in project directory', colors.yellow)
    log('   Run "npx env-manager init" to create one', colors.reset)
    console.log()
  }
  
  // Check if dist folder exists or rebuild is requested
  const distPath = path.join(envManagerPath, 'dist')
  if (!fs.existsSync(distPath) || options.rebuild) {
    log('⚠️  Distribution files not found. Building...', colors.yellow)
    const buildProcess = spawn('npm', ['run', 'build'], {
      cwd: envManagerPath,
      stdio: 'inherit',
      env: {
        ...process.env,
        PROJECT_ROOT: projectRoot
      }
    })
    
    await new Promise((resolve, reject) => {
      buildProcess.on('close', (code) => {
        if (code === 0) resolve()
        else reject(new Error(`Build failed with code ${code}`))
      })
    })
  }
  
  // Start the server
  log('🚀 Starting server...', colors.cyan)
  const serverProcess = spawn('npm', ['start'], {
    cwd: envManagerPath,
    stdio: 'inherit',
    env: {
      ...process.env,
      PROJECT_ROOT: projectRoot
    }
  })
  
  serverProcess.on('close', (code) => {
    process.exit(code)
  })
  
  process.on('SIGINT', () => {
    serverProcess.kill('SIGINT')
    process.exit(0)
  })
}

async function showStatus() {
  try {
    const response = await fetch('http://localhost:3001/api/health')
    if (response.ok) {
      const data = await response.json()
      log('✅ Env-Manager is running', colors.green)
      log(`   Version: ${data.version}`, colors.reset)
      log(`   URL: http://localhost:3001`, colors.blue)
    } else {
      log('⭕ Env-Manager is not running', colors.yellow)
    }
  } catch (error) {
    log('⭕ Env-Manager is not running', colors.yellow)
    log('   Run "npx env-manager start" to start the service', colors.reset)
  }
}

// Setup CLI commands
program
  .name('env-manager')
  .description('BuildAppolis Env-Manager CLI')
  .version(packageJson.version)

program
  .command('init')
  .description('Initialize env-manager in your project')
  .action(initProject)

// Password recovery function
async function recoverPassword() {
  log('🔓 BuildAppolis Env-Manager - Password Recovery', colors.bright + colors.blue)
  log('━'.repeat(50), colors.blue)
  console.log()
  
  const credentials = loadCredentials()
  
  if (!credentials) {
    log('❌ No password configured yet', colors.red)
    log('   Run "npx env-manager setup-password" first', colors.reset)
    process.exit(1)
  }
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  const recoveryPhrase = await new Promise(resolve => {
    rl.question('Enter your recovery phrase: ', resolve)
  })
  rl.close()
  
  const recoveryHash = createHash('sha256').update(recoveryPhrase).digest('hex')
  
  if (recoveryHash !== credentials.recoveryHash) {
    log('❌ Invalid recovery phrase', colors.red)
    process.exit(1)
  }
  
  log('✅ Recovery phrase verified!', colors.green)
  console.log()
  
  const newPassword = await promptPassword('Enter new password: ')
  
  if (!newPassword || newPassword.length < 6) {
    log('❌ Password must be at least 6 characters', colors.red)
    process.exit(1)
  }
  
  const confirmPassword = await promptPassword('Confirm new password: ')
  
  if (newPassword !== confirmPassword) {
    log('❌ Passwords do not match', colors.red)
    process.exit(1)
  }
  
  // Generate new credentials
  const salt = randomBytes(32).toString('hex')
  const passwordHash = hashPassword(newPassword, salt)
  const newRecoveryPhrase = generateRecoveryPhrase()
  const newRecoveryHash = createHash('sha256').update(newRecoveryPhrase).digest('hex')
  
  credentials.passwordHash = passwordHash
  credentials.salt = salt
  credentials.recoveryHash = newRecoveryHash
  credentials.lastModified = new Date().toISOString()
  
  if (!saveCredentials(credentials)) {
    log('❌ Failed to save new password', colors.red)
    process.exit(1)
  }
  
  console.log()
  log('✅ Password reset successfully!', colors.green)
  log('━'.repeat(50), colors.blue)
  console.log()
  log('🔑 NEW recovery phrase:', colors.bright + colors.yellow)
  log('━'.repeat(50), colors.yellow)
  log(newRecoveryPhrase, colors.bright + colors.cyan)
  log('━'.repeat(50), colors.yellow)
  log('⚠️  Save this new recovery phrase!', colors.yellow)
  console.log()
}

// List registered projects
function listProjects() {
  const registry = loadProjectRegistry()
  
  log('📁 Registered Projects', colors.bright + colors.blue)
  log('━'.repeat(50), colors.blue)
  console.log()
  
  if (Object.keys(registry.projects).length === 0) {
    log('No projects registered yet', colors.yellow)
    log('Run "npx env-manager init" in a project directory', colors.reset)
    return
  }
  
  const active = registry.activeProject
  
  for (const [path, project] of Object.entries(registry.projects)) {
    const isActive = path === active
    const marker = isActive ? '● ' : '  '
    const color = isActive ? colors.green : colors.reset
    
    log(`${marker}${project.name}`, color)
    log(`  Path: ${project.path}`, colors.reset)
    log(`  Port: ${project.port}`, colors.reset)
    log(`  Last accessed: ${new Date(project.lastAccessed).toLocaleDateString()}`, colors.reset)
    console.log()
  }
}

program
  .command('setup-password')
  .description('Set or change the global master password')
  .action(() => setupGlobalPassword(false))

program
  .command('recover-password')
  .description('Recover password using recovery phrase')
  .action(recoverPassword)

program
  .command('projects')
  .description('List all registered projects')
  .action(listProjects)

program
  .command('configure')
  .description('Configure project settings')
  .option('--port <port>', 'Set custom port for this project')
  .option('--ws-port <port>', 'Set WebSocket port for hot-reload')
  .option('--auto-reload <enabled>', 'Enable/disable auto-reload (true/false)')
  .option('--reload-delay <ms>', 'Delay before reload in milliseconds')
  .action(async (options) => {
    const projectPath = process.cwd()
    const registry = loadProjectRegistry()
    const absolutePath = path.resolve(projectPath)
    
    if (!registry.projects[absolutePath]) {
      log('❌ Project not registered', colors.red)
      log('   Run "env-manager init" first', colors.reset)
      return
    }
    
    const project = registry.projects[absolutePath]
    
    if (options.port) {
      project.port = parseInt(options.port, 10)
      log(`✅ Port set to ${project.port}`, colors.green)
    }
    
    if (options.wsPort) {
      project.wsPort = parseInt(options.wsPort, 10)
      log(`✅ WebSocket port set to ${project.wsPort}`, colors.green)
    }
    
    if (options.autoReload !== undefined) {
      project.hotReload = project.hotReload || {}
      project.hotReload.autoReload = options.autoReload === 'true'
      log(`✅ Auto-reload ${project.hotReload.autoReload ? 'enabled' : 'disabled'}`, colors.green)
    }
    
    if (options.reloadDelay) {
      project.hotReload = project.hotReload || {}
      project.hotReload.reloadDelay = parseInt(options.reloadDelay, 10)
      log(`✅ Reload delay set to ${project.hotReload.reloadDelay}ms`, colors.green)
    }
    
    saveProjectRegistry(registry)
    
    log('', colors.reset)
    log('📋 Current Configuration:', colors.cyan)
    log(`   Name: ${project.name}`, colors.reset)
    log(`   Port: ${project.port}`, colors.reset)
    log(`   WebSocket Port: ${project.wsPort || project.port + 1}`, colors.reset)
    log(`   Auto-reload: ${project.hotReload?.autoReload !== false}`, colors.reset)
    log(`   Reload Delay: ${project.hotReload?.reloadDelay || 1000}ms`, colors.reset)
  })

program
  .command('start')
  .description('Start the env-manager service')
  .option('-p, --project <path>', 'Project directory path')
  .option('--rebuild', 'Force rebuild before starting')
  .action(startService)

program
  .command('status')
  .description('Check if env-manager is running')
  .action(showStatus)

program
  .command('open')
  .description('Open env-manager in your browser')
  .action(() => {
    import('open').then(({ default: open }) => {
      open('http://localhost:3001')
    }).catch(() => {
      log('Please open http://localhost:3001 in your browser', colors.cyan)
    })
  })

// Branch management commands
program
  .command('branch')
  .description('Show current branch and variables')
  .action(async () => {
    try {
      const { exec } = await import('child_process')
      const { promisify } = await import('util')
      const execAsync = promisify(exec)
      
      const { stdout: branch } = await execAsync('git rev-parse --abbrev-ref HEAD')
      const currentBranch = branch.trim()
      
      log('📌 Current Branch:', colors.cyan)
      log(`   ${currentBranch}`, colors.bright + colors.green)
      console.log()
      
      // Check for branch-specific variables
      const response = await fetch(`http://localhost:3001/api/variables?branch=${currentBranch}`)
      if (response.ok) {
        const data = await response.json()
        log(`📦 Variables on branch '${currentBranch}':`, colors.cyan)
        log(`   ${data.variables.length} variables configured`, colors.reset)
      }
    } catch (error) {
      log('❌ Error getting branch info', colors.red)
      log('   Make sure you are in a git repository', colors.reset)
    }
  })

program
  .command('branch-list')
  .description('List all branches with variables')
  .action(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/branches')
      if (response.ok) {
        const data = await response.json()
        
        log('🌿 Git Branches:', colors.cyan)
        data.gitBranches.forEach(branch => {
          const isCurrent = branch === data.current
          const hasVars = data.dbBranches.includes(branch)
          const marker = isCurrent ? '● ' : '  '
          const varMarker = hasVars ? ' [has variables]' : ''
          const color = isCurrent ? colors.green : colors.reset
          
          log(`${marker}${branch}${varMarker}`, color)
        })
      } else {
        log('⚠️  Env-Manager is not running', colors.yellow)
        log('   Run "env-manager start" first', colors.reset)
      }
    } catch (error) {
      log('❌ Failed to get branches', colors.red)
    }
  })

program
  .command('branch-copy <source> <target>')
  .description('Copy variables from one branch to another')
  .action(async (source, target) => {
    try {
      const response = await fetch('http://localhost:3001/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'copy',
          sourceBranch: source,
          targetBranch: target
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        log('✅ ' + data.message, colors.green)
      } else {
        log('❌ Failed to copy variables', colors.red)
      }
    } catch (error) {
      log('❌ Error copying variables', colors.red)
    }
  })

// Show help if no command provided
if (process.argv.length === 2) {
  const projectPath = process.cwd()
  const packageJsonPath = path.join(projectPath, 'package.json')
  let currentProject = null
  
  // Check if we're in a project with package.json
  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
      currentProject = {
        name: pkg.name || path.basename(projectPath),
        version: pkg.version || '1.0.0'
      }
    } catch {}
  }
  
  console.log()
  log('🔧 BuildAppolis Env-Manager v' + packageJson.version, colors.bright + colors.blue)
  log('━'.repeat(50), colors.blue)
  
  if (currentProject) {
    console.log()
    log('📦 Current Project:', colors.cyan)
    log(`   ${currentProject.name} v${currentProject.version}`, colors.reset)
  }
  
  console.log()
  log('Quick Start:', colors.cyan)
  log('  env-manager init         Initialize in your project', colors.reset)
  log('  env-manager start        Start the service', colors.reset)
  log('  env-manager open         Open in browser', colors.reset)
  console.log()
  log('Install globally for easier access:', colors.cyan)
  log('  npm install -g @buildappolis/env-manager', colors.bright)
  console.log()
  log('For more commands, use: env-manager --help', colors.reset)
  console.log()
} else {
  program.parse()
}