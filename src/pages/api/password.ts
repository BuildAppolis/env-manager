import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { createHash, randomBytes, pbkdf2Sync } from 'crypto';

// Credentials path
const credentialsPath = path.join(os.homedir(), '.env-manager', 'credentials.json');
const registryPath = path.join(os.homedir(), '.env-manager', 'projects.json');

interface Credentials {
  passwordHash: string;
  salt: string;
  encryptionKey: string;
  recoveryHash: string;
  createdAt: string;
  lastModified: string;
}

function loadCredentials(): Credentials | null {
  try {
    if (fs.existsSync(credentialsPath)) {
      return JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
    }
  } catch (error) {
    console.error('Failed to load credentials:', error);
  }
  return null;
}

function saveCredentials(credentials: Credentials): boolean {
  try {
    const credDir = path.dirname(credentialsPath);
    if (!fs.existsSync(credDir)) {
      fs.mkdirSync(credDir, { recursive: true });
    }
    fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));
    // Set restrictive permissions (owner read/write only)
    fs.chmodSync(credentialsPath, 0o600);
    return true;
  } catch (error) {
    console.error('Failed to save credentials:', error);
    return false;
  }
}

function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function generateRecoveryPhrase(): string {
  const words = [
    'alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot',
    'golf', 'hotel', 'india', 'juliet', 'kilo', 'lima',
    'mike', 'november', 'oscar', 'papa', 'quebec', 'romeo',
    'sierra', 'tango', 'uniform', 'victor', 'whiskey', 'zulu'
  ];
  
  const phrase = [];
  for (let i = 0; i < 4; i++) {
    phrase.push(words[Math.floor(Math.random() * words.length)]);
  }
  phrase.push(Math.floor(Math.random() * 9999).toString().padStart(4, '0'));
  
  return phrase.join('-');
}

export const GET: APIRoute = async () => {
  try {
    const credentials = loadCredentials();
    const hasGlobalPassword = !!credentials;
    
    return new Response(JSON.stringify({
      hasGlobalPassword,
      createdAt: credentials?.createdAt,
      lastModified: credentials?.lastModified
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error checking password status:', error);
    return new Response(JSON.stringify({ error: 'Failed to check password status' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { action, password, newPassword, recoveryPhrase, projectPath } = body;
    
    if (action === 'setup') {
      // Setup global password for the first time
      const existingCreds = loadCredentials();
      if (existingCreds) {
        return new Response(JSON.stringify({ 
          error: 'Password already configured',
          requiresAuth: true 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (!password || password.length < 6) {
        return new Response(JSON.stringify({ 
          error: 'Password must be at least 6 characters' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const salt = randomBytes(32).toString('hex');
      const passwordHash = hashPassword(password, salt);
      const encryptionKey = randomBytes(32).toString('hex');
      const newRecoveryPhrase = generateRecoveryPhrase();
      const recoveryHash = createHash('sha256').update(newRecoveryPhrase).digest('hex');
      
      const credentials: Credentials = {
        passwordHash,
        salt,
        encryptionKey,
        recoveryHash,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };
      
      if (!saveCredentials(credentials)) {
        return new Response(JSON.stringify({ error: 'Failed to save credentials' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ 
        success: true,
        recoveryPhrase: newRecoveryPhrase,
        message: 'Password configured successfully'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (action === 'verify') {
      // Verify password
      const credentials = loadCredentials();
      if (!credentials) {
        return new Response(JSON.stringify({ 
          error: 'No password configured',
          needsSetup: true 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const passwordHash = hashPassword(password, credentials.salt);
      const isValid = passwordHash === credentials.passwordHash;
      
      // Check for project-specific password if provided
      if (isValid && projectPath) {
        const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
        const project = registry.projects[projectPath];
        
        if (project?.projectPassword) {
          // Verify project password as well
          const projectPasswordHash = hashPassword(password, project.projectPassword.salt);
          const projectValid = projectPasswordHash === project.projectPassword.passwordHash;
          
          return new Response(JSON.stringify({ 
            valid: isValid,
            projectValid,
            requiresProjectPassword: true
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      
      return new Response(JSON.stringify({ valid: isValid }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (action === 'change') {
      // Change password
      const credentials = loadCredentials();
      if (!credentials) {
        return new Response(JSON.stringify({ error: 'No password configured' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Verify current password
      const currentHash = hashPassword(password, credentials.salt);
      if (currentHash !== credentials.passwordHash) {
        return new Response(JSON.stringify({ error: 'Current password is incorrect' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (!newPassword || newPassword.length < 6) {
        return new Response(JSON.stringify({ 
          error: 'New password must be at least 6 characters' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Generate new credentials
      const salt = randomBytes(32).toString('hex');
      const passwordHash = hashPassword(newPassword, salt);
      const newRecoveryPhrase = generateRecoveryPhrase();
      const recoveryHash = createHash('sha256').update(newRecoveryPhrase).digest('hex');
      
      credentials.passwordHash = passwordHash;
      credentials.salt = salt;
      credentials.recoveryHash = recoveryHash;
      credentials.lastModified = new Date().toISOString();
      
      if (!saveCredentials(credentials)) {
        return new Response(JSON.stringify({ error: 'Failed to save new password' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ 
        success: true,
        recoveryPhrase: newRecoveryPhrase,
        message: 'Password changed successfully'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (action === 'recover') {
      // Recover password using recovery phrase
      const credentials = loadCredentials();
      if (!credentials) {
        return new Response(JSON.stringify({ error: 'No password configured' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const recoveryHash = createHash('sha256').update(recoveryPhrase).digest('hex');
      if (recoveryHash !== credentials.recoveryHash) {
        return new Response(JSON.stringify({ error: 'Invalid recovery phrase' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (!newPassword || newPassword.length < 6) {
        return new Response(JSON.stringify({ 
          error: 'New password must be at least 6 characters' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Generate new credentials
      const salt = randomBytes(32).toString('hex');
      const passwordHash = hashPassword(newPassword, salt);
      const newRecoveryPhrase = generateRecoveryPhrase();
      const newRecoveryHash = createHash('sha256').update(newRecoveryPhrase).digest('hex');
      
      credentials.passwordHash = passwordHash;
      credentials.salt = salt;
      credentials.recoveryHash = newRecoveryHash;
      credentials.lastModified = new Date().toISOString();
      
      if (!saveCredentials(credentials)) {
        return new Response(JSON.stringify({ error: 'Failed to save new password' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ 
        success: true,
        recoveryPhrase: newRecoveryPhrase,
        message: 'Password recovered successfully'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Password operation error:', error);
    return new Response(JSON.stringify({ error: 'Password operation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};