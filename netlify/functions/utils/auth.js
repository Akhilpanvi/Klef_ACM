import jwt from 'jsonwebtoken';

export function parseCookies(header) {
  const list = {};
  if (!header) return list;
  header.split(';').forEach(cookieItem => {
    let [name, ...rest] = cookieItem.split('=');
    name = name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    if (!value) return;
    try {
      list[name] = decodeURIComponent(value);
    } catch {
      list[name] = value;
    }
  });
  return list;
}

export function getAdminSession(event) {
  const cookieHeader = event.headers.cookie || event.headers.Cookie || '';
  if (!cookieHeader) {
    return null;
  }

  const cookies = parseCookies(cookieHeader);
  const sessionToken = cookies.acm_session;
  if (!sessionToken) {
    return null;
  }

  try {
    const decoded = jwt.verify(sessionToken, process.env.SESSION_SECRET || 'klu_acm_portal_secure_jwt_session_secret_2026');
    return decoded; // Returns { id, username, role }
  } catch (err) {
    console.error('Session verification error:', err.message);
    return null;
  }
}
