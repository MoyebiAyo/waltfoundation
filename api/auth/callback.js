// Finishes the Decap CMS GitHub OAuth flow: /api/auth/callback
// Verifies the state cookie, exchanges the code for a token and hands it to
// the CMS window via postMessage (the message format Decap expects).
import crypto from 'crypto';

const PAGE_START = '<!doctype html><html><body><script>';

function resultPage(tokenJson, padding) {
  // The CMS (opener) sends "authorizing:github"; we reply with the token.
  return PAGE_START + padding +
    '(function(){' +
    'function receiveMessage(e){' +
    'console.log("receiveMessage %o", e);' +
    'window.removeEventListener("message", receiveMessage);' +
    'e.source.postMessage("authorization:github:success:" + ' + JSON.stringify(tokenJson) + ', e.origin);' +
    '}' +
    'window.addEventListener("message", receiveMessage);' +
    'console.log("Waiting for message from CMS...");' +
    '})();' +
    '</' + 'script></body></html>';
}

export default async function handler(req, res) {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.status(500).type('text/plain').send(
      'GitHub OAuth is not configured. Set GITHUB_OAUTH_CLIENT_ID and GITHUB_OAUTH_CLIENT_SECRET in the Vercel project settings (see ADMIN.md).'
    );
    return;
  }

  const code = req.query.code;
  const state = req.query.state;
  const cookies = req.headers.cookie || '';
  const savedState = /(?:^|;\s*)__wcef_oauth=([a-f0-9]+)/.exec(cookies);

  if (!code || !state || !savedState || state !== savedState[1]) {
    res.status(400).type('text/plain').send('Sign-in failed: invalid or expired state. Close this window and try again.');
    return;
  }

  // Clear the one-time state cookie either way.
  res.setHeader('Set-Cookie', '__wcef_oauth=; Path=/api/auth; HttpOnly; Secure; SameSite=Lax; Max-Age=0');

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const redirectUri = proto + '://' + host + '/api/auth/callback';

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri
      })
    });
    const token = await tokenRes.json();

    if (token.error || !token.access_token) {
      console.error('GitHub token exchange failed:', token.error_description || token.error);
      res.status(401).type('text/plain').send('Sign-in failed: GitHub rejected the authorization. Close this window and try again.');
      return;
    }

    // Random padding defeats max-caching on the response body.
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.status(200)
      .type('html')
      .send(resultPage(JSON.stringify({
        token: token.access_token,
        provider: 'github'
      }), '<!--' + crypto.randomBytes(8).toString('hex') + '-->'));
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.status(502).type('text/plain').send('Sign-in failed: could not reach GitHub. Close this window and try again.');
  }
}
