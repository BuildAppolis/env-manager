#!/usr/bin/env node

import { program } from 'commander'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import readline from 'readline'
import { spawn } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'))

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function promptPassword(message) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    // Hide password input
    process.stdout.write(message)
    
    const stdin = process.openStdin()
    process.stdin.on('data', char => {
      char = char + ''
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.pause()
          break
        default:
          process.stdout.clearLine()
          process.stdout.cursorTo(0)
          process.stdout.write(message + '*'.repeat(rl.line.length))
          break
      }
    })
    
    rl.question('', (answer) => {
      rl.close()
      console.log() // New line after password
      resolve(answer)
    })
  })
}

async function setupPassword() {
  log('🔐 BuildAppolis Env-Manager - Password Setup', colors.bright + colors.blue)
  log('━'.repeat(50), colors.blue)
  console.log()
  
  const envPath = path.join(process.cwd(), '.env')
  let envContent = ''
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8')
  }
  
  // Check if password already exists
  const hasPassword = envContent.includes('ENV_MANAGER_PASSWORD=')
  
  if (hasPassword) {
    log('⚠️  Password already configured in .env file', colors.yellow)
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    const answer = await new Promise(resolve => {
      rl.question('Do you want to change it? (y/N): ', resolve)
    })
    rl.close()
    
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      log('✅ Keeping existing password', colors.green)
      return
    }
  }
  
  log('Please set a password for accessing the Env-Manager UI:', colors.cyan)
  log('(This password will be stored in your .env file)', colors.reset)
  console.log()
  
  const password = await promptPassword('Password: ')
  
  if (!password || password.length < 6) {
    log('❌ Password must be at least 6 characters', colors.red)
    process.exit(1)
  }
  
  const confirmPassword = await promptPassword('Confirm password: ')
  
  if (password !== confirmPassword) {
    log('❌ Passwords do not match', colors.red)
    process.exit(1)
  }
  
  // Generate encryption key if not exists
  let encryptionKey = ''
  const hasEncryptionKey = envContent.includes('ENCRYPTION_KEY=')
  
  if (!hasEncryptionKey) {
    encryptionKey = crypto.randomBytes(16).toString('hex')
    log('🔑 Generated encryption key for secure storage', colors.cyan)
  }
  
  // Update or add to .env file
  let newEnvContent = envContent
  
  // Update or add password
  if (hasPassword) {
    newEnvContent = newEnvContent.replace(/ENV_MANAGER_PASSWORD=.*/g, `ENV_MANAGER_PASSWORD=${password}`)
  } else {
    if (!newEnvContent.endsWith('\n') && newEnvContent.length > 0) {
      newEnvContent += '\n'
    }
    newEnvContent += `# BuildAppolis Env-Manager Configuration\n`
    newEnvContent += `ENV_MANAGER_PASSWORD=${password}\n`
  }
  
  // Add encryption key if needed
  if (!hasEncryptionKey && encryptionKey) {
    newEnvContent += `ENCRYPTION_KEY=${encryptionKey}\n`
  }
  
  // Add other default settings if not present
  if (!envContent.includes('ENV_MANAGER_ENABLED=')) {
    newEnvContent += `ENV_MANAGER_ENABLED=true\n`
  }
  
  if (!envContent.includes('ENV_MANAGER_URL=')) {
    newEnvContent += `ENV_MANAGER_URL=http://localhost:3001\n`
  }
  
  fs.writeFileSync(envPath, newEnvContent)
  
  console.log()
  log('✅ Password configured successfully!', colors.green)
  log('━'.repeat(50), colors.blue)
  console.log()
  log('You can now access the Env-Manager at:', colors.cyan)
  log('http://localhost:3001', colors.bright + colors.blue)
  console.log()
  log('To start the Env-Manager service, run:', colors.cyan)
  log('npx env-manager start', colors.bright)
  console.log()
}

async function initProject() {
  log('🚀 BuildAppolis Env-Manager - Project Setup', colors.bright + colors.blue)
  log('━'.repeat(50), colors.blue)
  console.log()
  
  // Create env.config.ts template
  const configPath = path.join(process.cwd(), 'env.config.ts')
  
  if (fs.existsSync(configPath)) {
    log('✅ env.config.ts already exists', colors.green)
  } else {
    const configTemplate = `// Environment Configuration
// Generated by BuildAppolis Env-Manager

import type { ProjectConfig } from '@buildappolis/env-manager'

const config: ProjectConfig = {
  projectName: '${path.basename(process.cwd())}',
  projectVersion: '1.0.0',
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
  
  // Setup password
  await setupPassword()
  
  log('✅ Project initialized successfully!', colors.green)
  console.log()
  log('Next steps:', colors.cyan)
  log('1. Edit env.config.ts to define your environment requirements', colors.reset)
  log('2. Run "npx env-manager start" to start the service', colors.reset)
  log('3. Open http://localhost:3001 to configure variables', colors.reset)
  console.log()
}

async function startService() {
  log('🚀 Starting BuildAppolis Env-Manager...', colors.cyan)
  
  const envManagerPath = path.join(__dirname, '..')
  
  // Build first
  log('📦 Building...', colors.cyan)
  const buildProcess = spawn('npm', ['run', 'build'], {
    cwd: envManagerPath,
    stdio: 'inherit'
  })
  
  await new Promise((resolve, reject) => {
    buildProcess.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`Build failed with code ${code}`))
    })
  })
  
  // Start the server
  log('🚀 Starting server...', colors.cyan)
  const serverProcess = spawn('npm', ['start'], {
    cwd: envManagerPath,
    stdio: 'inherit'
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

program
  .command('setup-password')
  .description('Set or change the env-manager password')
  .action(setupPassword)

program
  .command('start')
  .description('Start the env-manager service')
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

// Show help if no command provided
if (process.argv.length === 2) {
  console.log()
  log('🔧 BuildAppolis Env-Manager v' + packageJson.version, colors.bright + colors.blue)
  log('━'.repeat(50), colors.blue)
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