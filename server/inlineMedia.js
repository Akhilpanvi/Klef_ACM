// Inline media offloading.
//
// Older uploads were saved as base64 data URIs inside table rows (member photos up to
// 2.5MB each), which made /api/public-data ~12MB. Before sending public data we swap any
// large data URI for a short URL; GET /api/media/:table/:key/:field then serves that single
// image as a real, long-cached file. The database itself is left untouched.
//
// ponytail: keeps reading the full rows from the DB; the real fix is moving these images to
// Supabase Storage (one-off migration), after which this module becomes a no-op.

import crypto from 'crypto';

const MIN_INLINE = 20 * 1024; // only offload data URIs larger than this
const TABLES = { events: 'id', members: 'id', gallery_images: 'id', pages: 'slug' };

const isBigDataUri = (v) => typeof v === 'string' && v.length > MIN_INLINE && v.startsWith('data:image/');
const version = (v) => crypto.createHash('sha1').update(v).digest('hex').slice(0, 10);
const mediaUrl = (table, key, field, value) =>
  `/api/media/${table}/${encodeURIComponent(key)}/${field}?v=${version(value)}`;

/** Replace big inline images in rows of `table` with /api/media URLs (returns new rows). */
export function offloadRows(table, rows) {
  if (!Array.isArray(rows)) return rows;
  return rows.map((row) => {
    if (!row || typeof row !== 'object' || row.id == null) return row;
    let out = row;
    for (const [field, value] of Object.entries(row)) {
      if (isBigDataUri(value)) {
        if (out === row) out = { ...row };
        out[field] = mediaUrl(table, row.id, field, value);
      }
    }
    return out;
  });
}

/** Same for the combined public-data payload ({ events, members, gallery, pages, ... }). */
export function offloadPayload(payload) {
  if (!payload || typeof payload !== 'object') return payload;
  const pages = {};
  for (const [slug, page] of Object.entries(payload.pages || {})) {
    const content = page?.content;
    if (content && typeof content === 'object' && !Array.isArray(content)) {
      const c = { ...content };
      for (const [field, value] of Object.entries(content)) {
        if (isBigDataUri(value)) c[field] = mediaUrl('pages', slug, field, value);
      }
      pages[slug] = { ...page, content: c };
    } else {
      pages[slug] = page;
    }
  }
  return {
    ...payload,
    events: offloadRows('events', payload.events),
    members: offloadRows('members', payload.members),
    gallery: offloadRows('gallery_images', payload.gallery),
    pages,
  };
}

/**
 * Load one inline image. Returns { type, buffer } or null.
 * `table`/`field` are validated against an allow-list / identifier pattern before querying.
 */
export async function loadInlineMedia(supabase, table, key, field) {
  if (!supabase || !TABLES[table] || !/^[a-z_]{1,64}$/.test(field) || !key) return null;
  let value;
  if (table === 'pages') {
    const { data, error } = await supabase.from('pages').select('content').eq('slug', key).maybeSingle();
    if (error) throw error;
    value = data?.content?.[field];
  } else {
    const { data, error } = await supabase.from(table).select(field).eq(TABLES[table], key).maybeSingle();
    if (error) throw error;
    value = data?.[field];
  }
  if (typeof value === 'string' && /^https?:\/\//i.test(value)) return { redirect: value };
  const m = typeof value === 'string' && value.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
  if (!m) return null;
  return { type: m[1].toLowerCase(), buffer: Buffer.from(m[2], 'base64') };
}

export const MEDIA_CACHE_HEADER = 'public, max-age=31536000, immutable'; // URL carries ?v=<hash>

// Members without the photo column: reading ~12MB of inline photos made Postgres hit its
// statement timeout. Photos are then served one at a time via /api/media (cache key = updated_at).
const MEMBER_COLUMNS = 'id, name, role, category, biography, linkedin_url, email, display_order, is_active, created_at, updated_at';

export async function fetchMembersLight(supabase) {
  const [list, withPhoto] = await Promise.all([
    supabase.from('members').select(MEMBER_COLUMNS).eq('is_active', true).order('display_order', { ascending: true }),
    supabase.from('members').select('id').eq('is_active', true).not('photograph_url', 'is', null).neq('photograph_url', ''),
  ]);
  if (list.error) return { data: null, error: list.error };
  const has = new Set((withPhoto.data || []).map(r => r.id));
  const data = (list.data || []).map(m => ({
    ...m,
    photograph_url: has.has(m.id) ? `/api/media/members/${m.id}/photograph_url?v=${version(String(m.updated_at))}` : '',
  }));
  return { data, error: null };
}
