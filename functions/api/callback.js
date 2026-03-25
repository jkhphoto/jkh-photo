export async function onRequestGet(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  if (!code) return new Response('Missing code parameter', { status: 400 })
  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code }),
    })
    const data = await tokenResponse.json()
    if (data.error) return new Response('OAuth error: ' + (data.error_description || data.error), { status: 400 })
    const token = data.access_token
    const content = '<!doctype html><html><body><script>(function(){function r(e){window.opener.postMessage("authorization:github:success:"+JSON.stringify({token:"'+token+'",provider:"github"}),e.origin);window.removeEventListener("message",r,false)}window.addEventListener("message",r,false);window.opener.postMessage("authorizing:github","*")})()</script></body></html>'
    return new Response(content, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } })
  } catch (err) {
    return new Response('Auth failed: ' + err.message, { status: 500 })
  }
}

