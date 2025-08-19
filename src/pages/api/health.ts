import type { APIRoute } from 'astro'

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    status: 'ok',
    service: 'BuildAppolis Env-Manager',
    version: '1.0.4',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}