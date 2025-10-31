export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Rate limiting for API endpoints
    if (url.pathname.startsWith('/api/')) {
      const clientIP = request.headers.get('CF-Connecting-IP');
      const rateLimitKey = `rate_limit:${clientIP}`;
      
      // Simple rate limiting (100 requests per minute)
      const current = await env.KV.get(rateLimitKey);
      if (current && parseInt(current) > 100) {
        return new Response('Rate limit exceeded', { status: 429 });
      }
      
      await env.KV.put(rateLimitKey, (parseInt(current) || 0) + 1, { expirationTtl: 60 });
    }
    
    // Fetch from origin
    const response = await fetch(request);
    
    // Add security headers
    const newResponse = new Response(response.body, response);
    
    newResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    newResponse.headers.set('X-Content-Type-Options', 'nosniff');
    newResponse.headers.set('X-Frame-Options', 'DENY');
    newResponse.headers.set('X-XSS-Protection', '1; mode=block');
    newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Cache static assets
    if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
      newResponse.headers.set('Cache-Control', 'public, max-age=31536000');
    }
    
    return newResponse;
  },
};