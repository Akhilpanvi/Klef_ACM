import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export function getAdminSession(event) {
  const cookieHeader = event.headers.cookie || event.headers.Cookie || '';
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookie.parse(cookieHeader);
  const sessionToken = cookies.acm_session;
  if (!sessionToken) {
    return null;
  }

  try {
    const decoded = jwt.verify(sessionToken, process.env.SESSION_SECRET || 'fallback_secret');
    return decoded; // Returns { id, username, role }
  } catch (err) {
    console.error('Session verification error:', err.message);
    return null;
  }
}
