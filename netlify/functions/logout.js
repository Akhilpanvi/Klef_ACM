import { supabase } from './utils/db.js';
import { getAdminSession } from './utils/auth.js';

function serializeCookie(name, val, options = {}) {
  let str = `${name}=${encodeURIComponent(val)}`;
  if (options.maxAge != null) {
    str += `; Max-Age=${Math.floor(options.maxAge)}`;
  }
  if (options.domain) {
    str += `; Domain=${options.domain}`;
  }
  if (options.path) {
    str += `; Path=${options.path}`;
  }
  if (options.expires) {
    str += `; Expires=${options.expires.toUTCString()}`;
  }
  if (options.httpOnly) {
    str += '; HttpOnly';
  }
  if (options.secure) {
    str += '; Secure';
  }
  if (options.sameSite) {
    const sameSite = typeof options.sameSite === 'string' ? options.sameSite.toLowerCase() : options.sameSite;
    if (sameSite === true || sameSite === 'strict') {
      str += '; SameSite=Strict';
    } else if (sameSite === 'lax') {
      str += '; SameSite=Lax';
    } else if (sameSite === 'none') {
      str += '; SameSite=None';
    }
  }
  return str;
}

export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const session = getAdminSession(event);
    if (session) {
      // Record audit log
      await supabase.from('audit_logs').insert({
        admin_id: session.id,
        admin_username: session.username,
        action: 'logout',
        resource: 'admin_users',
        resource_id: session.id,
        details: 'Successful administrator logout',
      });
    }

    // Clear session cookie
    const serializedCookie = serializeCookie('acm_session', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      expires: new Date(0), // Expire immediately
    });

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Set-Cookie': serializedCookie,
      },
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error('Logout failed:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
}
