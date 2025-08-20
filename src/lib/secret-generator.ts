import crypto from 'crypto'

export class SecretGenerator {
  /**
   * Generate a UUID v4
   */
  static generateUuid(): string {
    return crypto.randomUUID()
  }

  /**
   * Generate a cryptographically secure random hex string
   * @param length - Length of the hex string (default 32 bytes = 64 hex chars)
   */
  static generateCryptoSecret(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  /**
   * Generate a strong password with mixed characters
   * @param length - Length of the password (default 24)
   * @param options - Options for password generation
   */
  static generatePassword(
    length: number = 24,
    options: {
      uppercase?: boolean
      lowercase?: boolean
      numbers?: boolean
      symbols?: boolean
      excludeAmbiguous?: boolean
    } = {}
  ): string {
    const {
      uppercase = true,
      lowercase = true,
      numbers = true,
      symbols = true,
      excludeAmbiguous = true
    } = options

    let charset = ''
    
    if (uppercase) {
      charset += excludeAmbiguous ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    }
    if (lowercase) {
      charset += excludeAmbiguous ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz'
    }
    if (numbers) {
      charset += excludeAmbiguous ? '23456789' : '0123456789'
    }
    if (symbols) {
      charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'
    }

    if (!charset) {
      throw new Error('At least one character type must be enabled')
    }

    let password = ''
    const randomBytes = crypto.randomBytes(length)
    
    for (let i = 0; i < length; i++) {
      password += charset[randomBytes[i] % charset.length]
    }

    return password
  }

  /**
   * Generate a JWT secret (base64 encoded)
   * @param length - Length of the secret in bytes (default 32)
   */
  static generateJwtSecret(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64')
  }

  /**
   * Generate an API key with a specific format
   * @param prefix - Optional prefix for the key (e.g., 'sk_live_')
   */
  static generateApiKey(prefix: string = ''): string {
    const key = crypto.randomBytes(24).toString('base64url')
    return prefix ? `${prefix}${key}` : key
  }

  /**
   * Generate a database connection string template
   * @param type - Database type
   */
  static generateDatabaseUrl(type: 'postgres' | 'mysql' | 'mongodb' = 'postgres'): string {
    const password = this.generatePassword(16, { symbols: false })
    const username = 'user_' + crypto.randomBytes(4).toString('hex')
    
    switch (type) {
      case 'postgres':
        return `postgresql://${username}:${password}@localhost:5432/dbname`
      case 'mysql':
        return `mysql://${username}:${password}@localhost:3306/dbname`
      case 'mongodb':
        return `mongodb://${username}:${password}@localhost:27017/dbname`
      default:
        return ''
    }
  }

  /**
   * Generate value based on variable name patterns
   * @param variableName - Name of the environment variable
   * @param generate - Generation type specified in config
   */
  static generateByPattern(variableName: string, generate?: 'uuid' | 'crypto' | 'password'): string {
    // If explicit generation type is specified
    if (generate) {
      switch (generate) {
        case 'uuid':
          return this.generateUuid()
        case 'crypto':
          return this.generateCryptoSecret()
        case 'password':
          return this.generatePassword()
      }
    }

    // Auto-detect based on variable name
    const name = variableName.toUpperCase()

    // UUID patterns
    if (name.includes('UUID') || name.includes('_ID') && !name.includes('CLIENT')) {
      return this.generateUuid()
    }

    // JWT patterns
    if (name.includes('JWT') || name.includes('AUTH_SECRET')) {
      return this.generateJwtSecret()
    }

    // API Key patterns
    if (name.includes('API_KEY') || name.includes('API_TOKEN')) {
      const prefix = name.includes('STRIPE') ? 'sk_test_' : 
                     name.includes('SENDGRID') ? 'SG.' : ''
      return this.generateApiKey(prefix)
    }

    // Database URL patterns
    if (name.includes('DATABASE_URL') || name.includes('DB_URL')) {
      if (name.includes('POSTGRES')) return this.generateDatabaseUrl('postgres')
      if (name.includes('MYSQL')) return this.generateDatabaseUrl('mysql')
      if (name.includes('MONGO')) return this.generateDatabaseUrl('mongodb')
      return this.generateDatabaseUrl()
    }

    // Password patterns
    if (name.includes('PASSWORD') || name.includes('PASS')) {
      return this.generatePassword()
    }

    // Secret/Token patterns
    if (name.includes('SECRET') || name.includes('TOKEN') || name.includes('KEY')) {
      return this.generateCryptoSecret()
    }

    // Port patterns
    if (name.includes('PORT')) {
      return String(3000 + Math.floor(Math.random() * 7000)) // Random port 3000-9999
    }

    // Default to crypto secret
    return this.generateCryptoSecret()
  }

  /**
   * Generate multiple secrets at once
   * @param variables - Array of variable names or configs
   */
  static generateBatch(
    variables: Array<string | { name: string; generate?: 'uuid' | 'crypto' | 'password' }>
  ): Record<string, string> {
    const results: Record<string, string> = {}

    for (const variable of variables) {
      if (typeof variable === 'string') {
        results[variable] = this.generateByPattern(variable)
      } else {
        results[variable.name] = this.generateByPattern(variable.name, variable.generate)
      }
    }

    return results
  }
}