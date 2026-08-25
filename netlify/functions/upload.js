import { supabase } from './utils/db.js';
import { getAdminSession } from './utils/auth.js';

export async function handler(event, context) {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
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

  // 1. Session Authentication check
  const session = getAdminSession(event);
  if (!session) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized. Admin session is required for uploads.' }),
    };
  }

  try {
    const { name, type, body } = JSON.parse(event.body || '{}');

    if (!name || !type || !body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing name, type or body payload.' }),
      };
    }

    // Validate file type (Images only)
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(type)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Unsupported file type. Only PNG, JPEG, WEBP, and SVG are allowed.' }),
      };
    }

    const fileExtension = (name.split('.').pop() || '').toLowerCase();
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'svg', 'webp'];
    if (!allowedExtensions.includes(fileExtension)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Unsupported file extension. Only PNG, JPG, JPEG, SVG, and WEBP extensions are allowed.' }),
      };
    }

    // 2. Ensure bucket exists (Self-initializing)
    // We try to create it, ignoring conflicts if it already exists
    try {
      await supabase.storage.createBucket('acm-media', {
        public: true,
        allowedMimeTypes: allowedTypes,
      });
    } catch (bucketErr) {
      // Bucket might already exist, which is fine
    }

    // 3. Decode base64 image data
    const base64Data = body.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Validate file size (5MB limit)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (buffer.length > maxSizeBytes) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'File size exceeds the 5MB limit.' }),
      };
    }

    // 4. Generate unique file path
    const cleanFileName = name
      .substring(0, name.lastIndexOf('.') === -1 ? name.length : name.lastIndexOf('.'))
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 30);
    const filePath = `uploads/${Date.now()}_${cleanFileName}.${fileExtension}`;

    // 5. Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('acm-media')
      .upload(filePath, buffer, {
        contentType: type,
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    // 6. Get Public URL
    const { data: publicUrlData } = supabase.storage
      .from('acm-media')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    // 7. Write Audit Log
    await supabase.from('audit_logs').insert({
      admin_id: session.id,
      admin_username: session.username,
      action: 'image_upload',
      resource: 'storage',
      resource_id: filePath,
      details: `Uploaded image to storage: ${filePath}`,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        url: publicUrl,
        path: filePath,
      }),
    };
  } catch (err) {
    console.error('Image upload exception:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Internal Server Error' }),
    };
  }
}
