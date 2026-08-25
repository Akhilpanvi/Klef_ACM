/**
 * API Service for KLEF ACM Student Chapter Website
 * Connects the React frontend to the secure Netlify serverless functions.
 */

const API_BASE = '/api';

/**
 * Helper to handle fetch responses and handle JSON/text extraction
 */
async function handleResponse(response) {
  if (response.status === 401) {
    // Session expired or unauthorized
    return { error: 'Unauthorized', status: 401 };
  }
  
  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { text: await response.text() };
  }

  if (!response.ok) {
    throw new Error(data.error || 'API Request Failed');
  }

  return data;
}

export const api = {
  // ---------------------------------------------------------------------------
  // PUBLIC ENDPOINTS
  // ---------------------------------------------------------------------------
  
  /**
   * Fetches data for the public website.
   * @param {string} type - 'all', 'events', 'members', 'gallery', 'page', 'contact'
   * @param {string} [slug] - Required if type is 'page'
   */
  async getPublicData(type = 'all', slug = '') {
    let url = `${API_BASE}/public-data?type=${type}`;
    if (slug) url += `&slug=${slug}`;
    
    const res = await fetch(url);
    return handleResponse(res);
  },

  // ---------------------------------------------------------------------------
  // ADMIN AUTHENTICATION
  // ---------------------------------------------------------------------------

  /**
   * Gets a new CAPTCHA challenge
   */
  async getCaptcha() {
    const res = await fetch(`${API_BASE}/captcha`);
    return handleResponse(res);
  },

  /**
   * Submits credentials and captcha for authentication
   */
  async login(username, password, captchaToken, captchaAnswer) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        captchaToken,
        captchaAnswer,
      }),
      credentials: 'same-origin',
    });
    return handleResponse(res);
  },

  /**
   * Clears the session cookie and logs out the admin
   */
  async logout() {
    const res = await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      credentials: 'same-origin',
    });
    return handleResponse(res);
  },

  /**
   * Verifies the current session state
   */
  async checkSession() {
    const res = await fetch(`${API_BASE}/me`, {
      credentials: 'same-origin',
    });
    return handleResponse(res);
  },

  // ---------------------------------------------------------------------------
  // CMS CRUD OPERATIONS (ADMIN ONLY)
  // ---------------------------------------------------------------------------

  /**
   * Fetches all rows from an administrative table (including draft/unpublished)
   */
  async getTable(table) {
    const res = await fetch(`${API_BASE}/admin-crud?table=${table}`, {
      credentials: 'same-origin',
    });
    return handleResponse(res);
  },

  /**
   * Inserts a new row in a CMS table
   */
  async createRow(table, data) {
    const res = await fetch(`${API_BASE}/admin-crud?table=${table}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'same-origin',
    });
    return handleResponse(res);
  },

  /**
   * Updates an existing row (or upserts config row) in a CMS table
   */
  async updateRow(table, data) {
    const res = await fetch(`${API_BASE}/admin-crud?table=${table}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'same-origin',
    });
    return handleResponse(res);
  },

  /**
   * Deletes a row from a CMS table
   */
  async deleteRow(table, id) {
    const res = await fetch(`${API_BASE}/admin-crud?table=${table}&id=${id}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    return handleResponse(res);
  },

  /**
   * Uploads an image to Supabase Storage and returns the public URL
   */
  async uploadImage(name, type, base64Body) {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        type,
        body: base64Body,
      }),
      credentials: 'same-origin',
    });
    return handleResponse(res);
  },
};
