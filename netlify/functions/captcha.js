import crypto from 'crypto';
import { supabase } from './utils/db.js';

export async function handler(event, context) {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // 1. Generate 8-character code meeting requirements:
    // Exclude: 0, O, 1, I, l, 5, S, 2, Z
    // No duplicates, no spaces
    const charset = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ346789';
    let captcha = '';
    while (captcha.length < 8) {
      const char = charset[Math.floor(Math.random() * charset.length)];
      if (!captcha.includes(char)) {
        captcha += char;
      }
    }

    // 2. Render SVG CAPTCHA dynamically in pure JS
    const width = 240;
    const height = 75;
    let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:6px; border:1px solid #cbd5e1; user-select:none;">`;

    // Add noise grid lines
    for (let i = 0; i < 5; i++) {
      const x1 = Math.random() * width;
      const y1 = Math.random() * height;
      const x2 = Math.random() * width;
      const y2 = Math.random() * height;
      const color = `hsl(${200 + Math.random() * 20}, 40%, 80%)`;
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${1 + Math.random() * 2}" />`;
    }

    // Draw characters with random rotation, sizing, and position offset
    for (let i = 0; i < captcha.length; i++) {
      const char = captcha[i];
      const fontSize = 28 + Math.floor(Math.random() * 8); // 28px to 36px
      const angle = (Math.random() * 30 - 15); // -15deg to +15deg
      const x = 20 + i * 26 + (Math.random() * 6 - 3);
      const y = 45 + (Math.random() * 10 - 5);
      
      // Use shades of ACM Blue / Slate for professional look
      const color = `hsl(${207 + Math.floor(Math.random() * 10)}, 85%, ${20 + Math.floor(Math.random() * 20)}%)`;
      
      svg += `<text x="${x}" y="${y}" font-size="${fontSize}" font-family="monospace, Courier New" font-weight="bold" fill="${color}" transform="rotate(${angle}, ${x}, ${y})">${char}</text>`;
    }

    // Add some random dots for extra noise
    for (let i = 0; i < 30; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const r = Math.random() * 1.5;
      const color = `hsl(${200 + Math.random() * 20}, 50%, 70%)`;
      svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" />`;
    }

    svg += '</svg>';

    // 3. Hash the answer using SHA-256
    const answerHash = crypto.createHash('sha256').update(captcha).digest('hex');

    // 4. Save to Database
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes lifetime

    const { error: dbError } = await supabase
      .from('captcha_challenges')
      .insert({
        token,
        hash: answerHash,
        attempts: 0,
        expires_at: expiresAt,
      });

    if (dbError) {
      console.error('Error saving CAPTCHA to DB:', dbError);
      throw dbError;
    }

    // 5. Clean up expired challenges asynchronously to prevent bloating
    supabase
      .from('captcha_challenges')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .then(({ error }) => {
        if (error) console.error('Error pruning expired CAPTCHAs:', error);
      });

    // 6. Return response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token,
        svg,
      }),
    };
  } catch (err) {
    console.error('CAPTCHA generation failed:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
}
