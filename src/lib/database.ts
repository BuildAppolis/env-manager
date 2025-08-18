import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import type { EnvVariable, DatabaseVariable, HistoryEntry, Snapshot } from '../types.js'

export default class EnvDatabase {
  private dbPath: string
  private data: {
    variables: DatabaseVariable[]
    history: HistoryEntry[]
    snapshots: Snapshot[]
    auth: {
      passwordHash?: string
      salt?: string
      isAuthenticated: boolean
      lastAuth?: number
    }
  }
  private encryptionKey: string | null = null

  constructor(dbPath?: string) {
    this.dbPath = dbPath || path.join(process.cwd(), 'env-data.json')
    this.data = {
      variables: [],
      history: [],
      snapshots: [],
      auth: {
        isAuthenticated: false
      }
    }
    this.loadData()
  }

  private async loadData(): Promise<void> {
    try {
      const fileContent = await fs.readFile(this.dbPath, 'utf-8')
      this.data = JSON.parse(fileContent)
    } catch (error) {
      // File doesn't exist or is invalid, start with empty data
      await this.saveData()
    }
  }

  private async saveData(): Promise<void> {
    try {
      await fs.writeFile(this.dbPath, JSON.stringify(this.data, null, 2))
    } catch (error) {
      console.error('Failed to save database:', error)
      throw error
    }
  }

  private generateSalt(): string {
    return crypto.randomBytes(16).toString('hex')
  }

  private hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  }

  private deriveEncryptionKey(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha512').toString('hex')
  }

  private encrypt(text: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not available')
    }

    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return iv.toString('hex') + ':' + encrypted
  }

  private decrypt(encryptedText: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not available')
    }

    const [ivHex, encrypted] = encryptedText.split(':')
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, Buffer.from(ivHex, 'hex'))
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }

  authenticate(password: string): boolean {
    try {
      // First time setup
      if (!this.data.auth.passwordHash || !this.data.auth.salt) {
        const salt = this.generateSalt()
        const hash = this.hashPassword(password, salt)

        this.data.auth.salt = salt
        this.data.auth.passwordHash = hash
        this.data.auth.isAuthenticated = true
        this.data.auth.lastAuth = Date.now()

        this.encryptionKey = this.deriveEncryptionKey(password, salt)
        this.saveData()
        return true
      }

      // Verify existing password
      const hash = this.hashPassword(password, this.data.auth.salt!)
      if (hash === this.data.auth.passwordHash) {
        this.data.auth.isAuthenticated = true
        this.data.auth.lastAuth = Date.now()
        this.encryptionKey = this.deriveEncryptionKey(password, this.data.auth.salt!)
        this.saveData()
        return true
      }

      return false
    } catch (error) {
      console.error('Authentication error:', error)
      return false
    }
  }

  isAuthenticated(): boolean {
    return this.data.auth.isAuthenticated && !!this.encryptionKey
  }

  logout(): void {
    this.data.auth.isAuthenticated = false
    this.encryptionKey = null
    this.saveData()
  }

  setVariable(name: string, value: string, metadata: Partial<EnvVariable> = {}): DatabaseVariable {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated')
    }

    const now = new Date().toISOString()
    const existingIndex = this.data.variables.findIndex(v => v.name === name)

    const variable: DatabaseVariable = {
      name,
      value: metadata.sensitive ? this.encrypt(value) : value,
      category: metadata.category || 'other',
      description: metadata.description || '',
      sensitive: metadata.sensitive || false,
      encrypted: metadata.sensitive || false,
      createdAt: existingIndex >= 0 ? this.data.variables[existingIndex].createdAt : now,
      updatedAt: now
    }

    // Add to history
    this.data.history.push({
      id: crypto.randomUUID(),
      action: existingIndex >= 0 ? 'update' : 'create',
      variableName: name,
      oldValue: existingIndex >= 0 ? this.data.variables[existingIndex].value : undefined,
      newValue: variable.value,
      timestamp: now
    })

    if (existingIndex >= 0) {
      this.data.variables[existingIndex] = variable
    } else {
      this.data.variables.push(variable)
    }

    this.saveData()
    return variable
  }

  updateVariable(name: string, value: string, metadata: Partial<EnvVariable> = {}): DatabaseVariable {
    return this.setVariable(name, value, metadata)
  }

  getVariable(name: string): DatabaseVariable | null {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated')
    }

    const variable = this.data.variables.find(v => v.name === name)
    if (!variable) return null

    // Decrypt if necessary
    if (variable.encrypted && variable.sensitive) {
      return {
        ...variable,
        value: this.decrypt(variable.value)
      }
    }

    return variable
  }

  getAllVariables(): DatabaseVariable[] {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated')
    }

    return this.data.variables.map(variable => {
      if (variable.encrypted && variable.sensitive) {
        try {
          return {
            ...variable,
            value: this.decrypt(variable.value)
          }
        } catch (error) {
          console.error(`Failed to decrypt variable ${variable.name}:`, error)
          return {
            ...variable,
            value: '[DECRYPTION_FAILED]'
          }
        }
      }
      return variable
    })
  }

  deleteVariable(name: string): boolean {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated')
    }

    const index = this.data.variables.findIndex(v => v.name === name)
    if (index === -1) return false

    const variable = this.data.variables[index]

    // Add to history
    this.data.history.push({
      id: crypto.randomUUID(),
      action: 'delete',
      variableName: name,
      oldValue: variable.value,
      timestamp: new Date().toISOString()
    })

    this.data.variables.splice(index, 1)
    this.saveData()
    return true
  }

  getHistory(): HistoryEntry[] {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated')
    }
    return this.data.history.slice().reverse() // Most recent first
  }

  createSnapshot(name: string, description?: string): Snapshot {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated')
    }

    const snapshot: Snapshot = {
      id: crypto.randomUUID(),
      name,
      description: description || '',
      variables: JSON.parse(JSON.stringify(this.data.variables)),
      createdAt: new Date().toISOString()
    }

    this.data.snapshots.push(snapshot)
    this.saveData()
    return snapshot
  }

  getSnapshots(): Snapshot[] {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated')
    }
    return this.data.snapshots.slice().reverse() // Most recent first
  }

  restoreSnapshot(snapshotId: string): boolean {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated')
    }

    const snapshot = this.data.snapshots.find(s => s.id === snapshotId)
    if (!snapshot) return false

    // Create a backup snapshot first
    this.createSnapshot(`Backup before restore ${snapshot.name}`, 'Auto-created before snapshot restore')

    // Restore variables
    this.data.variables = JSON.parse(JSON.stringify(snapshot.variables))

    // Add to history
    this.data.history.push({
      id: crypto.randomUUID(),
      action: 'restore',
      variableName: `Snapshot: ${snapshot.name}`,
      timestamp: new Date().toISOString()
    })

    this.saveData()
    return true
  }

  deleteSnapshot(snapshotId: string): boolean {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated')
    }

    const index = this.data.snapshots.findIndex(s => s.id === snapshotId)
    if (index === -1) return false

    this.data.snapshots.splice(index, 1)
    this.saveData()
    return true
  }

  generateEnvFile(): string {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated')
    }

    const variables = this.getAllVariables()
    const lines: string[] = []

    // Group by category
    const categories = new Map<string, DatabaseVariable[]>()
    variables.forEach(variable => {
      const category = variable.category || 'other'
      if (!categories.has(category)) {
        categories.set(category, [])
      }
      categories.get(category)!.push(variable)
    })

    // Generate file content
    categories.forEach((vars, category) => {
      lines.push(`# ${category.toUpperCase()}`)
      vars.forEach(variable => {
        if (variable.description) {
          lines.push(`# ${variable.description}`)
        }
        lines.push(`${variable.name}=${variable.value}`)
      })
      lines.push('')
    })

    return lines.join('\n')
  }

  generateEnvExample(): string {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated')
    }

    const variables = this.getAllVariables()
    const lines: string[] = []

    // Group by category
    const categories = new Map<string, DatabaseVariable[]>()
    variables.forEach(variable => {
      const category = variable.category || 'other'
      if (!categories.has(category)) {
        categories.set(category, [])
      }
      categories.get(category)!.push(variable)
    })

    // Generate example file content
    categories.forEach((vars, category) => {
      lines.push(`# ${category.toUpperCase()}`)
      vars.forEach(variable => {
        if (variable.description) {
          lines.push(`# ${variable.description}`)
        }
        const placeholder = variable.sensitive ?
          'your_secret_here' :
          variable.value || 'your_value_here'
        lines.push(`${variable.name}=${placeholder}`)
      })
      lines.push('')
    })

    return lines.join('\n')
  }
}
