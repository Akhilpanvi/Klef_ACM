import { supabase } from './utils/db.js';

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
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const params = event.queryStringParameters || {};
  const type = params.type || 'all';

  try {
    if (type === 'all') {
      // Parallel fetches for optimum speed
      const [eventsRes, membersRes, pagesRes, galleryRes, contactRes] = await Promise.all([
        supabase
          .from('events')
          .select('*')
          .eq('is_published', true)
          .order('date', { ascending: false }),
        supabase
          .from('members')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('pages')
          .select('slug, title, content'),
        supabase
          .from('gallery_images')
          .select('*, gallery_albums(name, description)')
          .order('created_at', { ascending: false }),
        supabase
          .from('contact_settings')
          .select('key, value')
          .eq('key', 'contact_info')
          .maybeSingle(),
      ]);

      if (eventsRes.error) throw eventsRes.error;
      if (membersRes.error) throw membersRes.error;
      if (pagesRes.error) throw pagesRes.error;
      if (galleryRes.error) throw galleryRes.error;
      if (contactRes.error) throw contactRes.error;

      // Group pages into a key-value object
      const pages = {};
      pagesRes.data.forEach(p => {
        pages[p.slug] = { title: p.title, content: p.content };
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          events: eventsRes.data,
          members: membersRes.data,
          pages,
          gallery: galleryRes.data,
          contact: contactRes.data?.value || {},
        }),
      };
    }

    if (type === 'events') {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .order('date', { ascending: false });

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (type === 'members') {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (type === 'gallery') {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*, gallery_albums(name, description)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (type === 'page') {
      const slug = params.slug;
      if (!slug) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Page slug is required' }) };
      }
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (type === 'contact') {
      const { data, error } = await supabase
        .from('contact_settings')
        .select('value')
        .eq('key', 'contact_info')
        .maybeSingle();

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data?.value || {}) };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: `Invalid data type requested: ${type}` }),
    };
  } catch (err) {
    console.error('Error fetching public data:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Internal Server Error' }),
    };
  }
}
