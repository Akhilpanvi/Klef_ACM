import cookie from 'cookie';
import { supabase } from './utils/db.js';
import { getAdminSession } from './utils/auth.js';

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
    const serializedCookie = cookie.serialize('acm_session', '', {
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
