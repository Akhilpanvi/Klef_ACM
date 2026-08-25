import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { supabase } from './utils/db.js';

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
    const { data: captchaRow, error: captchaError } = await supabase
      .from('captcha_challenges')
      .select('*')
      .eq('token', captchaToken)
      .single();

    if (captchaError || !captchaRow) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'CAPTCHA challenge has expired or is invalid.' }),
      };
    }

    // Validate expiration first
    const now = new Date();
    if (new Date(captchaRow.expires_at) < now) {
      await supabase.from('captcha_challenges').delete().eq('token', captchaToken);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'CAPTCHA has expired. Please request a new one.' }),
      };
    }

    // Verify answer hash
    const inputHash = crypto.createHash('sha256').update(captchaAnswer).digest('hex');
    if (inputHash === captchaRow.hash) {
      // SUCCESS: single-use invalidation
      await supabase
        .from('captcha_challenges')
        .delete()
        .eq('token', captchaToken);
    } else {
      // FAILURE: increment attempts counter
      const newAttempts = (captchaRow.attempts || 0) + 1;
      const maxAttempts = 3;

      if (newAttempts >= maxAttempts) {
        // Excessive-attempt invalidation
        await supabase
          .from('captcha_challenges')
          .delete()
          .eq('token', captchaToken);

        await supabase.from('audit_logs').insert({
          action: 'login_failed',
          resource: 'admin_users',
          details: `CAPTCHA excessive attempts reached (${newAttempts}/${maxAttempts}) for username: ${username}`,
        });

        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'CAPTCHA attempts exceeded. Please refresh CAPTCHA.' }),
        };
      } else {
        // Increment attempts count in DB
        await supabase
          .from('captcha_challenges')
          .update({ attempts: newAttempts })
          .eq('token', captchaToken);

        await supabase.from('audit_logs').insert({
          action: 'login_failed',
          resource: 'admin_users',
          details: `CAPTCHA incorrect attempt (${newAttempts}/${maxAttempts}) for username: ${username}`,
        });

        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: `Incorrect CAPTCHA answer. Attempt ${newAttempts} of ${maxAttempts}.` }),
        };
      }
    }

    // 3. Authenticate User
    const { data: user, error: userError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('active', true)
      .maybeSingle();

    if (userError || !user) {
      // Run slow dummy bcrypt hash to prevent timing attacks
      bcrypt.compareSync('dummy_pass', '$2a$12$DummySaltForTimingAttackPreventionOnlyDoNotUse');
      
      await supabase.from('audit_logs').insert({
        action: 'login_failed',
        resource: 'admin_users',
        details: `Failed login: Username not found or inactive: ${username}`,
      });

      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid credentials or CAPTCHA answer.' }),
      };
    }

    // Compare Password
    const passwordMatch = bcrypt.compareSync(password, user.password_hash);
    if (!passwordMatch) {
      await supabase.from('audit_logs').insert({
        action: 'login_failed',
        resource: 'admin_users',
        details: `Failed login: Password mismatch for username: ${username}`,
      });

      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid credentials or CAPTCHA answer.' }),
      };
    }

    // 4. Successful Authentication
    // Generate JWT
    const sessionToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.SESSION_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    // Create secure Cookie
    const serializedCookie = cookie.serialize('acm_session', sessionToken, {
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
