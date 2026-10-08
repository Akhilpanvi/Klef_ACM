import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from './utils/db.js';

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
  // CORS Headers
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
    const { username, password, captchaToken, captchaAnswer } = JSON.parse(event.body || '{}');

    if (!username || !password || !captchaToken || !captchaAnswer) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'All fields are required.' }),
      };
    }

    // 1. Rate Limiting Check (Max 5 failed attempts in the last 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count: failedAttemptsCount, error: countError } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('action', 'login_failed')
      .gt('timestamp', fifteenMinutesAgo);

    if (countError) {
      console.error('Error checking failed attempts:', countError);
    } else if (failedAttemptsCount && failedAttemptsCount >= 5) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({
          error: 'Too many failed login attempts. Access is locked for 15 minutes.',
        }),
      };
    }

    // 2. CAPTCHA Verification
    let captchaValid = false;
    const inputHash = crypto.createHash('sha256').update(captchaAnswer).digest('hex');

    // Attempt DB validation if Supabase is connected
    try {
      if (supabase && process.env.SUPABASE_URL) {
        const { data: captchaRow } = await supabase
          .from('captcha_challenges')
          .select('*')
          .eq('token', captchaToken)
          .single();

        if (captchaRow) {
          if (new Date(captchaRow.expires_at) < new Date()) {
            await supabase.from('captcha_challenges').delete().eq('token', captchaToken);
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({ error: 'CAPTCHA has expired. Please click refresh.' }),
            };
          }
          if (inputHash === captchaRow.hash) {
            captchaValid = true;
            await supabase.from('captcha_challenges').delete().eq('token', captchaToken);
          }
        }
      }
    } catch (dbErr) {
      console.warn('DB CAPTCHA validation fallback to cryptographic HMAC:', dbErr.message);
    }

    // Cryptographic HMAC token fallback verification
    if (!captchaValid && captchaToken) {
      const parts = captchaToken.split('.');
      if (parts.length === 3) {
        const [nonce, expStr, sig] = parts;
        const exp = parseInt(expStr, 10);
          const secret = process.env.SESSION_SECRET || 'klu_acm_portal_secure_jwt_session_secret_2026';
          const expectedPayload = `${nonce}:${exp}:${inputHash}`;
          const expectedSig = crypto.createHmac('sha256', secret).update(expectedPayload).digest('hex');
          if (sig.length === expectedSig.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
            captchaValid = true;
          }
        }
      }
    }

    // Local client fallback validation
    if (!captchaValid && typeof captchaToken === 'string' && captchaToken.startsWith('local-')) {
      if (captchaToken.toLowerCase() === `local-${String(captchaAnswer).trim().toLowerCase()}`) {
        captchaValid = true;
      }
    }

    if (!captchaValid) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid or expired CAPTCHA answer. Please try again.' }),
      };
    }

    // 3. Authenticate User
    const cleanUsername = (username || '').trim();
    let user = null;

    try {
      if (supabase && process.env.SUPABASE_URL) {
        const { data: dbUser } = await supabase
          .from('admin_users')
          .select('*')
          .ilike('username', cleanUsername)
          .eq('active', true)
          .maybeSingle();
        user = dbUser;
      }
    } catch (dbUserErr) {
      console.warn('DB user lookup failed:', dbUserErr.message);
    }

    // Direct fallback check if DB record is not yet seeded but valid credentials provided
    if (!user) {
      const allowedAdminEmails = ['bhaanugali@gmail.com', 'admin'];
      if (allowedAdminEmails.includes(cleanUsername.toLowerCase())) {
        const fallbackHash = '$2b$12$fnDMmkpN82p.50yJaUcLGe7eXO4Yc2P7JkWbaXX9C.3jLYr7fq39.'; // Sai@9866
        const isMatch = bcrypt.compareSync(password, fallbackHash);
        if (isMatch) {
          user = {
            id: '00000000-0000-0000-0000-000000000001',
            username: cleanUsername,
            role: 'superadmin',
            active: true
          };
        }
      }
    }

    if (!user) {
      // Run dummy bcrypt hash to prevent timing attacks
      bcrypt.compareSync('dummy_pass', '$2a$12$DummySaltForTimingAttackPreventionOnlyDoNotUse');
      
      try {
        if (supabase) {
          await supabase.from('audit_logs').insert({
            action: 'login_failed',
            resource: 'admin_users',
            details: `Failed login: Username not found: ${cleanUsername}`,
          });
        }
      } catch (e) {}

      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid username, password, or CAPTCHA answer.' }),
      };
    }

    // Compare Password with DB hash if user was found in DB
    if (user.password_hash) {
      const passwordMatch = bcrypt.compareSync(password, user.password_hash);
      if (!passwordMatch) {
        try {
          if (supabase) {
            await supabase.from('audit_logs').insert({
              action: 'login_failed',
              resource: 'admin_users',
              details: `Failed login: Password mismatch for: ${cleanUsername}`,
            });
          }
        } catch (e) {}

        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid username, password, or CAPTCHA answer.' }),
        };
      }
    }

    // 4. Successful Authentication
    // Generate JWT
    const sessionToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.SESSION_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    // Create secure Cookie
    const serializedCookie = serializeCookie('acm_session', sessionToken, {
      httpOnly: true,
      secure: true, // Always enforce Secure for protection on netlify
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    // Write successful audit log
    await supabase.from('audit_logs').insert({
      admin_id: user.id,
      admin_username: user.username,
      action: 'login',
      resource: 'admin_users',
      resource_id: user.id,
      details: 'Successful administrator login',
    });

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Set-Cookie': serializedCookie,
      },
      body: JSON.stringify({
        success: true,
        user: {
          username: user.username,
          role: user.role,
        },
      }),
    };
  } catch (err) {
    console.error('Login process exception:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
}
