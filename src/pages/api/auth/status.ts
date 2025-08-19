import type { APIRoute } from 'astro';
import { getDatabase } from '../../../lib/session.js';
import path from 'path';
import fs from 'fs';
import os from 'os';

export const GET: APIRoute = async () => {
  try {
    const database = getDatabase();
    const isAuthenticated = database.isAuthenticated();
    
    // Check for secure credentials
    const credPath = path.join(os.homedir(), '.env-manager', 'credentials.json');
    const hasSecureCredentials = fs.existsSync(credPath);
    
    let credentialsInfo = null;
    if (hasSecureCredentials) {
      try {
        const credentials = JSON.parse(fs.readFileSync(credPath, 'utf-8'));
        credentialsInfo = {
          exists: true,
          createdAt: credentials.createdAt,
          lastModified: credentials.lastModified,
          hasRecovery: !!credentials.recoveryHash
        };
      } catch (error) {
        console.error('Failed to read credentials info:', error);
      }
    }
    
    return new Response(JSON.stringify({ 
      authenticated: isAuthenticated,
      secureCredentials: hasSecureCredentials,
      credentialsInfo,
      authMethod: hasSecureCredentials ? 'secure' : 'legacy'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Auth status error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to get auth status' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};