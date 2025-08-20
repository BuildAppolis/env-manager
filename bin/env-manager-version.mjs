#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawn, execSync } from 'child_process'
import readline from 'readline'

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

// Config file path for version switching
const configPath = path.join(os.homedir(), '.env-manager', 'version-config.json')
const configDir = path.dirname(configPath)

function loadVersionConfig() {
  try {
    if (!fs.existsSync(configPath)) {
      return {
        current: 'production',
        localPath: null,
        productionCommand: 'npx @buildappolis/env-manager',
        lastSwitched: null
      }
    }
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  } catch (error) {
    return {
      current: 'production',
      localPath: null,
      productionCommand: 'npx @buildappolis/env-manager',
      lastSwitched: null
    }
  }
}

function saveVersionConfig(config) {
  try {
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true })
    }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    return true
  } catch (error) {
    console.error('Failed to save version config:', error)
    return false
  }
}

async function promptForPath(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  return new Promise(resolve => {
    rl.question(message, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

async function setupLocalPath() {
  const config = loadVersionConfig()
  
  log('🏠 Setup Local Development Version', colors.bright + colors.blue)
  log('━'.repeat(50), colors.blue)
  console.log()
  
  if (config.localPath) {
    log('Current local path:', colors.cyan)
    log(`  ${config.localPath}`, colors.reset)
    console.log()
    
    const answer = await promptForPath('Change local path? (y/N): ')
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      return config.localPath
    }
  }
  
  const localPath = await promptForPath('Enter path to local env-manager installation: ')
  
  if (!localPath) {
    log('❌ Path cannot be empty', colors.red)
    return null
  }
  
  const absolutePath = path.resolve(localPath)
  
  // Verify the path exists and has package.json
  const packagePath = path.join(absolutePath, 'package.json')
  if (!fs.existsSync(packagePath)) {
    log('❌ Invalid path - package.json not found', colors.red)
    return null
  }
  
  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'))
    if (pkg.name !== '@buildappolis/env-manager') {
      log('❌ This is not the env-manager package', colors.red)
      log(`   Found: ${pkg.name}`, colors.reset)
      return null
    }
    
    log('✅ Found env-manager local installation', colors.green)
    log(`   Version: ${pkg.version}`, colors.reset)
    
    config.localPath = absolutePath
    saveVersionConfig(config)
    
    return absolutePath
  } catch (error) {
    log('❌ Failed to read package.json', colors.red)
    return null
  }
}

async function switchVersion(target) {
  const config = loadVersionConfig()
  
  // If switching to local but no path configured
  if (target === 'local' && !config.localPath) {
    log('⚠️  Local path not configured', colors.yellow)
    const localPath = await setupLocalPath()
    if (!localPath) {
      process.exit(1)
    }
  }
  
  // Update current version
  config.current = target
  config.lastSwitched = new Date().toISOString()
  
  if (!saveVersionConfig(config)) {
    log('❌ Failed to save configuration', colors.red)
    process.exit(1)
  }
  
  log(`✅ Switched to ${target} version`, colors.green)
  
  if (target === 'local') {
    log(`   Path: ${config.localPath}`, colors.reset)
    log(`   Use: env-manager <command>`, colors.cyan)
  } else {
    log(`   Use: env-manager <command>`, colors.cyan)
  }
}

function showStatus() {
  const config = loadVersionConfig()
  
  log('📦 Env-Manager Version Status', colors.bright + colors.blue)
  log('━'.repeat(50), colors.blue)
  console.log()
  
  log('Current Version:', colors.cyan)
  log(`  ${config.current === 'production' ? '● ' : '  '}Production (npm package)`, 
      config.current === 'production' ? colors.green : colors.reset)
  log(`  ${config.current === 'local' ? '● ' : '  '}Local development`, 
      config.current === 'local' ? colors.green : colors.reset)
  
  if (config.localPath) {
    console.log()
    log('Local Installation:', colors.cyan)
    log(`  Path: ${config.localPath}`, colors.reset)
    
    // Try to get version
    try {
      const pkgPath = path.join(config.localPath, 'package.json')
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
      log(`  Version: ${pkg.version}`, colors.reset)
    } catch {}
  }
  
  // Get production version
  try {
    console.log()
    log('Production Version:', colors.cyan)
    const result = execSync('npm view @buildappolis/env-manager version', { encoding: 'utf-8' })
    log(`  Latest: ${result.trim()}`, colors.reset)
  } catch {}
  
  if (config.lastSwitched) {
    console.log()
    log(`Last switched: ${new Date(config.lastSwitched).toLocaleString()}`, colors.reset)
  }
}

async function executeCommand(args) {
  const config = loadVersionConfig()
  
  let command, commandArgs, cwd
  
  if (config.current === 'local') {
    if (!config.localPath) {
      log('❌ Local path not configured', colors.red)
      log('   Run: env-manager version setup', colors.reset)
      process.exit(1)
    }
    
    // Use local version
    const cliPath = path.join(config.localPath, 'bin', 'env-manager-cli.mjs')
    if (!fs.existsSync(cliPath)) {
      log('❌ Local CLI not found', colors.red)
      log(`   Expected at: ${cliPath}`, colors.reset)
      process.exit(1)
    }
    
    command = 'node'
    commandArgs = [cliPath, ...args]
    cwd = process.cwd()
  } else {
    // Use production version
    command = 'npx'
    commandArgs = ['@buildappolis/env-manager', ...args]
    cwd = process.cwd()
  }
  
  // Execute the command
  const child = spawn(command, commandArgs, {
    stdio: 'inherit',
    cwd
  })
  
  child.on('exit', (code) => {
    process.exit(code || 0)
  })
}

// Main execution
const args = process.argv.slice(2)

if (args.length === 0 || args[0] === 'status') {
  showStatus()
} else if (args[0] === 'setup') {
  await setupLocalPath()
} else if (args[0] === 'switch') {
  if (!args[1] || !['local', 'production'].includes(args[1])) {
    log('❌ Invalid target. Use: local or production', colors.red)
    process.exit(1)
  }
  await switchVersion(args[1])
} else if (args[0] === 'local') {
  await switchVersion('local')
} else if (args[0] === 'production' || args[0] === 'prod') {
  await switchVersion('production')
} else if (args[0] === 'exec') {
  // Execute command with current version
  await executeCommand(args.slice(1))
} else {
  // Show help
  log('🔄 Env-Manager Version Switcher', colors.bright + colors.blue)
  log('━'.repeat(50), colors.blue)
  console.log()
  log('Commands:', colors.cyan)
  log('  env-manager version status       Show current version', colors.reset)
  log('  env-manager version setup        Configure local path', colors.reset)
  log('  env-manager version local        Switch to local version', colors.reset)
  log('  env-manager version production   Switch to production', colors.reset)
  log('  env-manager version exec <cmd>   Execute command with current version', colors.reset)
  console.log()
  log('Quick switches:', colors.cyan)
  log('  env-manager version local        Use local development', colors.reset)
  log('  env-manager version prod         Use production npm', colors.reset)
  console.log()
}