// Finishes the Decap CMS GitHub OAuth flow: /api/auth/callback
// Verifies the state cookie, exchanges the code for a token and hands it to
// the CMS window via postMessage (the message format Decap expects).
// Uses only raw Node response methods (setHeader/statusCode/end), matching
// api/auth/request.js, to stay independent of helper-method availability.
import crypto from 'crypto';

function sendText(res, statusCode, message) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(message);
}

function resultPage(tokenJson, padding) {
  // The CMS (opener) sends "authorizing:github"; we reply with the token.
  return '<!doctype html><html><body>' + padding + '<scr' + 'ipt>' +
    '(function(){' +
    'function receiveMessage(e){' +
    'console.log("receiveMessage %o", e);' +
    'window.removeEventListener("message", receiveMessage);' +
    'e.source.postMessage("authorization:github:success:" + ' + JSON.stringify(tokenJson) + ', e.origin);' +
    '}' +
    'window.addEventListener("message", receiveMessage);' +
    'console.log("Waiting for message from CMS...");' +
    '})();' +
    '</scr' + 'ipt></body></html>';
}

export default async function handler(req, res) {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    sendText(res, 500,
      'GitHub OAuth is not configured. Set GITHUB_OAUTH_CLIENT_ID and GITHUB_OAUTH_CLIENT_SECRET in the Vercel project settings (see ADMIN.md).');
    return;
  }

  const q = req.query || {};
  const code = q.code;
  const state = q.state;
  const cookies = req.headers.cookie || '';
  const savedState = /(?:^|;\s*)__wcef_oauth=([a-f0-9]+)/.exec(cookies);

  if (!code || !state || !savedState || state !== savedState[1]) {
    sendText(res, 400, 'Sign-in failed: invalid or expired state. Close this window and try again.');
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

    if (!token || token.error || !token.access_token) {
      console.error('GitHub token exchange failed:', token && (token.error_description || token.error));
      sendText(res, 401, 'Sign-in failed: GitHub rejected the authorization. Close this window and try again.');
      return;
    }

    // Random padding defeats response-body caching.
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.end(resultPage(JSON.stringify({
      token: token.access_token,
      provider: 'github'
    }), '<!--' + crypto.randomBytes(8).toString('hex') + '-->'));
  } catch (err) {
    console.error('OAuth callback error:', err);
    sendText(res, 502, 'Sign-in failed: could not reach GitHub. Close this window and try again.');
  }
}
