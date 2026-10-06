// Starts the Decap CMS GitHub OAuth flow: /api/auth/request
// Requires GITHUB_OAUTH_CLIENT_ID and GITHUB_OAUTH_CLIENT_SECRET env vars (Vercel project settings).
import crypto from 'crypto';

export default async function handler(req, res) {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.status(500).type('text/plain').send(
      'GitHub OAuth is not configured. Set GITHUB_OAUTH_CLIENT_ID and GITHUB_OAUTH_CLIENT_SECRET in the Vercel project settings (see ADMIN.md).'
    );
    return;
  }

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const redirectUri = proto + '://' + host + '/api/auth/callback';
  const state = crypto.randomBytes(16).toString('hex');

  res.setHeader('Set-Cookie',
    '__wcef_oauth=' + state + '; Path=/api/auth; HttpOnly; Secure; SameSite=Lax; Max-Age=600');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'repo',
    state,
    allow_signup: 'true'
  });

  res.statusCode = 302;
  res.setHeader('Location', 'https://github.com/login/oauth/authorize?' + params.toString());
  res.end();
}
