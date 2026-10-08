import { supabase } from './utils/db.js';
import { loadInlineMedia, MEDIA_CACHE_HEADER } from '../../server/inlineMedia.js';

// GET /api/media/:table/:key/:field — see server/inlineMedia.js
export async function handler(event) {
  const parts = (event.path || '').split('/media/')[1]?.split('/') || [];
  const [table, key, field] = parts.map(decodeURIComponent);
  try {
    const media = await loadInlineMedia(supabase, table, key, field);
    if (!media) return { statusCode: 404, body: 'Not found' };
    if (media.redirect) return { statusCode: 302, headers: { Location: media.redirect }, body: '' };
    return {
      statusCode: 200,
      headers: { 'Content-Type': media.type, 'Cache-Control': MEDIA_CACHE_HEADER },
      body: media.buffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
}
