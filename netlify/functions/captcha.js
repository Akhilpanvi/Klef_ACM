import crypto from 'crypto';
import { supabase } from './utils/db.js';

const cleanDigits = ['3', '4', '6', '7', '8', '9'];
const cleanUpper = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'T', 'U', 'V', 'W', 'X', 'Y'];
const cleanLower = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'j', 'k', 'm', 'n', 'p', 'q', 'r', 't', 'u', 'v', 'w', 'x', 'y'];

function generateStrictCaptcha8() {
  for (let attempt = 0; attempt < 200; attempt++) {
    const usedLetters = new Set();
    const usedDigits = new Set();
    const chosen = [];

    const pool = [
      ...cleanUpper.map(c => ({ char: c, type: 'letter', base: c.toLowerCase() })),
      ...cleanLower.map(c => ({ char: c, type: 'letter', base: c.toLowerCase() })),
      ...cleanDigits.map(d => ({ char: d, type: 'digit', base: d }))
    ];

    while (chosen.length < 8) {
      const idx = crypto.randomInt(0, pool.length);
      const candidate = pool[idx];
      if (candidate.type === 'digit') {
        if (usedDigits.has(candidate.base)) continue;
        usedDigits.add(candidate.base);
        chosen.push(candidate.char);
      } else {
        if (usedLetters.has(candidate.base)) continue;
        usedLetters.add(candidate.base);
        chosen.push(candidate.char);
      }
    }

    const code = chosen.join('');
    let hasSequence = false;
    for (let i = 0; i < code.length - 2; i++) {
      const c1 = code.charCodeAt(i);
      const c2 = code.charCodeAt(i + 1);
      const c3 = code.charCodeAt(i + 2);
      if (c2 === c1 + 1 && c3 === c2 + 1) {
        hasSequence = true;
        break;
      }
    }

    if (!hasSequence) {
      return code;
    }
  }

  return 'A7kP3mX9';
}

function renderCaptchaSvg(code) {
  const width = 240;
  const height = 75;
  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:6px; border:1px solid #cbd5e1; user-select:none;">`;

  for (let i = 0; i < 5; i++) {
    const x1 = crypto.randomInt(0, width);
    const y1 = crypto.randomInt(0, height);
    const x2 = crypto.randomInt(0, width);
    const y2 = crypto.randomInt(0, height);
    const color = `hsl(${200 + crypto.randomInt(0, 30)}, 40%, 80%)`;
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${1 + crypto.randomInt(1, 2)}" />`;
  }

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const fontSize = 26 + crypto.randomInt(0, 6);
    const angle = crypto.randomInt(-15, 15);
    const x = 16 + i * 27 + crypto.randomInt(-3, 3);
    const y = 48 + crypto.randomInt(-4, 4);
    const color = `hsl(${207 + crypto.randomInt(0, 15)}, 85%, ${20 + crypto.randomInt(0, 20)}%)`;
    svg += `<text x="${x}" y="${y}" font-size="${fontSize}" font-family="monospace, Courier New" font-weight="bold" fill="${color}" transform="rotate(${angle}, ${x}, ${y})">${char}</text>`;
  }

  for (let i = 0; i < 25; i++) {
    const cx = crypto.randomInt(0, width);
    const cy = crypto.randomInt(0, height);
    const r = (crypto.randomInt(10, 20) / 10);
    const color = `hsl(${200 + crypto.randomInt(0, 30)}, 50%, 75%)`;
    svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" />`;
  }

  svg += '</svg>';
  return svg;
}

export async function handler(event, context) {
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
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const code = generateStrictCaptcha8();
    const svg = renderCaptchaSvg(code);

    const secret = process.env.SESSION_SECRET || 'klu_acm_portal_secure_jwt_session_secret_2026';
    const answerHash = crypto.createHash('sha256').update(code).digest('hex');
    const nonce = crypto.randomUUID();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    const payload = `${nonce}:${expiresAt}:${answerHash}`;
    const hmacSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const token = `${nonce}.${expiresAt}.${hmacSig}`;

    if (supabase) {
      try {
        await supabase.from('captcha_challenges').insert({
          token,
          hash: answerHash,
          attempts: 0,
          expires_at: new Date(expiresAt).toISOString(),
        });
        supabase.from('captcha_challenges').delete().lt('expires_at', new Date().toISOString()).then(() => {}).catch(() => {});
      } catch (e) {}
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ token, svg }),
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
