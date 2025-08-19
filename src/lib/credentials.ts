import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import os from 'os'

interface Credentials {
  passwordHash: string
  salt: string
  encryptionKey: string
  createdAt: string
  lastModified: string
  recoveryPhrase?: string  // Optional recovery phrase
}

export class CredentialsManager {
  private credentialsPath: string
  private credentials: Credentials | null = null
  
  constructor() {
    const configDir = path.join(os.homedir(), '.env-manager')
    this.credentialsPath = path.join(configDir, 'credentials.enc')
    
    // Ensure directory exists
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true })
    }
    
    this.loadCredentials()
  }
  
  private loadCredentials(): void {
    try {
      if (fs.existsSync(this.credentialsPath)) {
        const encryptedData = fs.readFileSync(this.credentialsPath, 'utf-8')
        // For now, store as JSON - in production, this should be encrypted
        this.credentials = JSON.parse(encryptedData)
      }
    } catch (error) {
      console.error('Failed to load credentials:', error)
      this.credentials = null
    }
  }
  
  private saveCredentials(): void {
    if (!this.credentials) return
    
    try {
      // In production, encrypt this data before saving
      const data = JSON.stringify(this.credentials, null, 2)
      fs.writeFileSync(this.credentialsPath, data, 'utf-8')
      // Set restrictive permissions (owner read/write only)
      fs.chmodSync(this.credentialsPath, 0o600)
    } catch (error) {
      console.error('Failed to save credentials:', error)
      throw error
    }
  }
  
  hasCredentials(): boolean {
    return this.credentials !== null
  }
  
  generateRecoveryPhrase(): string {
    // Generate a memorable recovery phrase
    const words = [
      'apple', 'banana', 'cherry', 'dragon', 'eagle', 'falcon',
      'galaxy', 'harbor', 'island', 'jungle', 'kingdom', 'lantern',
      'mountain', 'nebula', 'ocean', 'phoenix', 'quantum', 'rainbow',
      'sunset', 'thunder', 'universe', 'volcano', 'warrior', 'zenith'
    ]
    
    const phrase: string[] = []
    for (let i = 0; i < 4; i++) {
      phrase.push(words[Math.floor(Math.random() * words.length)])
    }
    phrase.push(Math.floor(Math.random() * 9999).toString().padStart(4, '0'))
    
    return phrase.join('-')
  }
  
  setPassword(password: string, generateRecovery: boolean = true): { success: boolean; recoveryPhrase?: string } {
    const salt = crypto.randomBytes(32).toString('hex')
    const passwordHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
    const encryptionKey = crypto.randomBytes(32).toString('hex')
    
    let recoveryPhrase: string | undefined
    if (generateRecovery) {
      recoveryPhrase = this.generateRecoveryPhrase()
    }
    
    this.credentials = {
      passwordHash,
      salt,
      encryptionKey,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      recoveryPhrase: recoveryPhrase ? crypto.createHash('sha256').update(recoveryPhrase).digest('hex') : undefined
    }
    
    this.saveCredentials()
    
    return {
      success: true,
      recoveryPhrase
    }
  }
  
  verifyPassword(password: string): boolean {
    if (!this.credentials) return false
    
    const hash = crypto.pbkdf2Sync(password, this.credentials.salt, 100000, 64, 'sha512').toString('hex')
    return hash === this.credentials.passwordHash
  }
  
  verifyRecoveryPhrase(phrase: string): boolean {
    if (!this.credentials || !this.credentials.recoveryPhrase) return false
    
    const phraseHash = crypto.createHash('sha256').update(phrase).digest('hex')
    return phraseHash === this.credentials.recoveryPhrase
  }
  
  resetPassword(recoveryPhrase: string, newPassword: string): { success: boolean; message: string } {
    if (!this.verifyRecoveryPhrase(recoveryPhrase)) {
      return {
        success: false,
        message: 'Invalid recovery phrase'
      }
    }
    
    const result = this.setPassword(newPassword, true)
    return {
      success: result.success,
      message: result.success ? 'Password reset successfully' : 'Failed to reset password'
    }
  }
  
  getEncryptionKey(): string | null {
    return this.credentials?.encryptionKey || null
  }
  
  deleteCredentials(): void {
    try {
      if (fs.existsSync(this.credentialsPath)) {
        fs.unlinkSync(this.credentialsPath)
      }
      this.credentials = null
    } catch (error) {
      console.error('Failed to delete credentials:', error)
      throw error
    }
  }
  
  getCredentialsInfo(): { exists: boolean; createdAt?: string; lastModified?: string } {
    if (!this.credentials) {
      return { exists: false }
    }
    
    return {
      exists: true,
      createdAt: this.credentials.createdAt,
      lastModified: this.credentials.lastModified
    }
  }
}

// Singleton instance
let credentialsInstance: CredentialsManager | null = null

export function getCredentialsManager(): CredentialsManager {
  if (!credentialsInstance) {
    credentialsInstance = new CredentialsManager()
  }
  return credentialsInstance
}