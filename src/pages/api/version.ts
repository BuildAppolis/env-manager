import type { APIRoute } from 'astro'
import { getVersionInfo } from '../../lib/version'

export const GET: APIRoute = async () => {
  const versionInfo = getVersionInfo()
  
  return new Response(JSON.stringify(versionInfo), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}