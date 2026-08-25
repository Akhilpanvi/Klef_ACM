import { supabase } from './utils/db.js';
import { getAdminSession } from './utils/auth.js';

const ALLOWED_TABLES = [
  'events',
  'members',
  'gallery_albums',
  'gallery_images',
  'pages',
  'site_settings',
  'contact_settings',
  'audit_logs',
];

export async function handler(event, context) {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // 1. Session Authentication check
  const session = getAdminSession(event);
  if (!session) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized. Admin session is missing or expired.' }),
    };
  }

  // 2. Validate requested table
  const params = event.queryStringParameters || {};
  const table = params.table;
  if (!table || !ALLOWED_TABLES.includes(table)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid or missing table parameter.' }),
    };
  }

  const method = event.httpMethod;

  try {
    // -------------------------------------------------------------------------
    // GET METHOD (READ)
    // -------------------------------------------------------------------------
    if (method === 'GET') {
      let query = supabase.from(table).select('*');

      // Add appropriate ordering based on table type
      if (table === 'audit_logs') {
        query = query.order('timestamp', { ascending: false }).limit(200);
      } else if (table === 'members') {
        query = query.order('display_order', { ascending: true });
      } else if (table === 'events') {
        query = query.order('date', { ascending: false });
      } else if (table === 'gallery_images') {
        query = query.order('created_at', { ascending: false });
      } else if (table === 'pages') {
        query = query.order('slug', { ascending: true });
      }

      const { data, error } = await query;
      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data),
      };
    }

    // -------------------------------------------------------------------------
    // POST METHOD (CREATE)
    // -------------------------------------------------------------------------
    if (method === 'POST') {
      if (table === 'audit_logs') {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Audit logs are read-only.' }) };
      }

      const payload = JSON.parse(event.body || '{}');
      
      // Remove ID to let DB generate UUID if it's there and empty
      if (payload.id === '') {
        delete payload.id;
      }

      const { data, error } = await supabase
        .from(table)
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      // Write Audit Log
      const resourceId = data.id || data.key || 'unknown';
      await supabase.from('audit_logs').insert({
        admin_id: session.id,
        admin_username: session.username,
        action: 'create',
        resource: table,
        resource_id: String(resourceId),
        details: `Created new item in ${table}: ${JSON.stringify(payload).substring(0, 200)}`,
      });

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(data),
      };
    }

    // -------------------------------------------------------------------------
    // PUT METHOD (UPDATE)
    // -------------------------------------------------------------------------
    if (method === 'PUT') {
      if (table === 'audit_logs') {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Audit logs are read-only.' }) };
      }

      const payload = JSON.parse(event.body || '{}');
      
      let resError;
      let data;

      if (table === 'site_settings' || table === 'contact_settings') {
        const key = payload.key;
        if (!key) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'Key field is required for config updates.' }) };
        }
        
        const { data: upsertData, error } = await supabase
          .from(table)
          .upsert(payload)
          .select()
          .single();
        
        resError = error;
        data = upsertData;
      } else {
        const id = payload.id;
        if (!id) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'ID field is required for updates.' }) };
        }

        const { data: updateData, error } = await supabase
          .from(table)
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        resError = error;
        data = updateData;
      }

      if (resError) throw resError;

      // Write Audit Log
      const resourceId = data.id || data.key;
      await supabase.from('audit_logs').insert({
        admin_id: session.id,
        admin_username: session.username,
        action: payload.is_published === false ? 'unpublish' : (payload.is_published === true ? 'publish' : 'update'),
        resource: table,
        resource_id: String(resourceId),
        details: `Updated item in ${table} (ID/Key: ${resourceId})`,
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data),
      };
    }

    // -------------------------------------------------------------------------
    // DELETE METHOD (DELETE)
    // -------------------------------------------------------------------------
    if (method === 'DELETE') {
      if (table === 'audit_logs' || table === 'site_settings' || table === 'contact_settings') {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Table is protected from deletion.' }) };
      }

      const id = params.id;
      if (!id) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'ID parameter is required for deletion.' }) };
      }

      const { data, error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;

      // Write Audit Log
      await supabase.from('audit_logs').insert({
        admin_id: session.id,
        admin_username: session.username,
        action: 'delete',
        resource: table,
        resource_id: id,
        details: `Deleted item from ${table} (ID: ${id})`,
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, deletedItem: data }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  } catch (err) {
    console.error(`Admin CRUD exception in ${table} (${method}):`, err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Internal Server Error' }),
    };
  }
}
