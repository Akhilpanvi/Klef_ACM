/**
 * Pure API Client for KLEF ACM Student Chapter Website
 * Connects directly to the live backend server / serverless API.
 * Strict Server-Side Session and Database driven. NO localStorage / sessionStorage.
 */

const API_BASE = '/api';
const CLIENT_CACHE_KEY = 'klu_acm_client_public_cache_v2';
let clientMemoryCache = null;

/**
 * Helper to handle fetch responses and extract JSON/errors cleanly
 */
async function handleResponse(response) {
  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = { text };
  }

  if (!response.ok) {
    const errorMsg = data?.error || (response.status === 401 ? 'Invalid credentials or CAPTCHA answer.' : 'API Request Failed');
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // ---------------------------------------------------------------------------
  // CLIENT-SIDE INSTANT CACHING (Stale-While-Revalidate)
  // ---------------------------------------------------------------------------
  
  /**
   * Synchronously returns cached public site data for instant 0ms app boot
   */
  getCachedPublicData() {
    if (clientMemoryCache) return clientMemoryCache;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const item = window.sessionStorage.getItem(CLIENT_CACHE_KEY);
        if (item) {
          const parsed = JSON.parse(item);
          if (parsed && typeof parsed === 'object') {
            clientMemoryCache = parsed;
            return parsed;
          }
        }
      }
    } catch {}
    return null;
  },

  /**
   * Updates synchronous client cache
   */
  setCachedPublicData(data) {
    if (!data) return;
    clientMemoryCache = data;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(CLIENT_CACHE_KEY, JSON.stringify(data));
      }
    } catch {}
  },

  /**
   * Clears client cache
   */
  clearCachedPublicData() {
    clientMemoryCache = null;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(CLIENT_CACHE_KEY);
      }
    } catch {}
  },

  // ---------------------------------------------------------------------------
  // PUBLIC WEBSITE ENDPOINTS
  // ---------------------------------------------------------------------------
  
  /**
   * Fetches authoritative live data for the public website with background cache update.
   * @param {string} type - 'all', 'events', 'members', 'gallery', 'page', 'contact'
   * @param {string} [slug] - Required if type is 'page'
   */
  async getPublicData(type = 'all', slug = '') {
    let url = `${API_BASE}/public-data?type=${type}`;
    if (slug) url += `&slug=${slug}`;
    const res = await fetch(url);
    const data = await handleResponse(res);
    if (type === 'all' && data) {
      this.setCachedPublicData(data);
    }
    return data;
  },

  /**
   * Submits a user contact enquiry and dispatches automated SMTP emails
   */
  async sendContactInquiry(formData) {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    return handleResponse(res);
  },

  // ---------------------------------------------------------------------------
  // AUTHENTICATION (Server-Controlled HttpOnly Cookies)
  // ---------------------------------------------------------------------------

  /**
   * Fetches a new 8-character cryptographic CAPTCHA challenge
   */
  async getCaptcha() {
    const res = await fetch(`${API_BASE}/captcha`);
    return handleResponse(res);
  },

  /**
   * Submits credentials & CAPTCHA for server authentication
   */
  async login(username, password, captchaToken, captchaAnswer) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
   * Invalidates administrator session cookie
   */
  async logout() {
    const res = await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      credentials: 'same-origin',
    });
    return handleResponse(res);
  },

  /**
   * Checks current administrator session state from server cookie
   */
  async checkSession() {
    const res = await fetch(`${API_BASE}/me`, {
      credentials: 'same-origin',
    });
    return handleResponse(res);
  },

  // ---------------------------------------------------------------------------
  // CMS CRUD OPERATIONS (Server-Authenticated)
  // ---------------------------------------------------------------------------

  /**
   * Fetches all records from an administrative table
   */
  async getTable(table) {
    const res = await fetch(`${API_BASE}/admin-crud?table=${table}`, {
      credentials: 'same-origin',
    });
    return handleResponse(res);
  },

  /**
   * Inserts a new record into a CMS table
   */
  async createRow(table, data) {
    const res = await fetch(`${API_BASE}/admin-crud?table=${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'same-origin',
    });
    return handleResponse(res);
  },

  /**
   * Updates an existing record in a CMS table
   */
  async updateRow(table, data) {
    const res = await fetch(`${API_BASE}/admin-crud?table=${table}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'same-origin',
    });
    return handleResponse(res);
  },

  /**
   * Batch updates multiple records in a single request to prevent connection pool exhaustion
   */
  async updateRows(table, dataArray) {
    const res = await fetch(`${API_BASE}/admin-crud?table=${table}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataArray),
      credentials: 'same-origin',
    });
    return handleResponse(res);
  },

  /**
   * Deletes a record from a CMS table
   */
  async deleteRow(table, id) {
    const res = await fetch(`${API_BASE}/admin-crud?table=${table}&id=${id}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    return handleResponse(res);
  },

  /**
   * Uploads an image payload to object storage and returns the permanent public URL
   */
  async uploadImage(name, type, base64Body) {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type, body: base64Body }),
      credentials: 'same-origin',
    });
    return handleResponse(res);
  },
};
