import { createClient } from '@supabase/supabase-js';

// Client-safe Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const publicSupabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } })
  : null;

// Native cross-tab broadcast channel
let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('klu_acm_realtime_sync');
  }
} catch {
  broadcastChannel = null;
}

/**
 * Broadcasts a local content modification to all browser tabs and windows immediately.
 * @param {string} table - The table name that was modified (e.g. 'pages', 'events', 'members', 'gallery_images')
 */
export function broadcastDataChange(table = 'all') {
  const timestamp = Date.now();
  
  // 1. BroadcastChannel for active browser tabs
  try {
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'ACM_CONTENT_UPDATED', table, timestamp });
    }
  } catch (err) {
    console.warn('BroadcastChannel post error:', err);
  }

  // 2. LocalStorage event for cross-tab sync
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('klu_acm_sync_trigger', JSON.stringify({ table, timestamp }));
    }
  } catch (err) {
    console.warn('LocalStorage sync error:', err);
  }

  // 3. Custom DOM event for current window
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('klu_acm_content_changed', { detail: { table, timestamp } }));
    }
  } catch (err) {
    console.warn('CustomEvent dispatch error:', err);
  }
}

/**
 * Subscribes to live database changes via multiple synchronization layers:
 * 1. Supabase WebSocket Realtime
 * 2. HTML5 BroadcastChannel (instant zero-latency multi-tab sync)
 * 3. Window storage events (cross-tab fallback)
 * 4. Window focus / visibilitychange
 * 5. Automatic fast background heartbeat polling
 * 
 * @param {Function} onDataChange - Callback invoked when a database update is detected.
 * @returns {Function} - Cleanup function to unsubscribe on unmount.
 */
export function subscribeToRealtimeUpdates(onDataChange) {
  const cleanupHandlers = [];

  // 1. Supabase Postgres Changes
  if (publicSupabase) {
    try {
      const channel = publicSupabase
        .channel('acm_live_content_channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'pages' },
          (payload) => onDataChange({ table: 'pages', event: payload.eventType, data: payload.new || payload.old })
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'events' },
          (payload) => onDataChange({ table: 'events', event: payload.eventType, data: payload.new || payload.old })
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'members' },
          (payload) => onDataChange({ table: 'members', event: payload.eventType, data: payload.new || payload.old })
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'gallery_images' },
          (payload) => onDataChange({ table: 'gallery_images', event: payload.eventType, data: payload.new || payload.old })
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'contact_settings' },
          (payload) => onDataChange({ table: 'contact_settings', event: payload.eventType, data: payload.new || payload.old })
        )
        .subscribe();

      cleanupHandlers.push(() => {
        try {
          publicSupabase.removeChannel(channel);
        } catch {}
      });
    } catch (err) {
      console.warn('Supabase realtime subscription failed:', err);
    }
  }

  // 2. BroadcastChannel Listener
  if (broadcastChannel) {
    const handleBroadcast = (msg) => {
      if (msg?.data?.type === 'ACM_CONTENT_UPDATED') {
        onDataChange({ table: msg.data.table || 'all', event: 'BROADCAST', source: 'broadcastChannel' });
      }
    };
    broadcastChannel.addEventListener('message', handleBroadcast);
    cleanupHandlers.push(() => broadcastChannel.removeEventListener('message', handleBroadcast));
  }

  // 3. Storage Event Listener
  if (typeof window !== 'undefined') {
    const handleStorage = (e) => {
      if (e.key === 'klu_acm_sync_trigger' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          onDataChange({ table: parsed.table || 'all', event: 'STORAGE_SYNC', source: 'localStorage' });
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    cleanupHandlers.push(() => window.removeEventListener('storage', handleStorage));

    // 4. Custom DOM Event
    const handleCustom = (e) => {
      onDataChange({ table: e.detail?.table || 'all', event: 'CUSTOM_EVENT', source: 'window' });
    };
    window.addEventListener('klu_acm_content_changed', handleCustom);
    cleanupHandlers.push(() => window.removeEventListener('klu_acm_content_changed', handleCustom));

    // 5. Window Focus / Visibility Change (Refreshes data when returning to tab)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        onDataChange({ table: 'all', event: 'FOCUS', source: 'visibilitychange' });
      }
    };
    window.addEventListener('focus', handleVisibility);
    document.addEventListener('visibilitychange', handleVisibility);
    cleanupHandlers.push(() => {
      window.removeEventListener('focus', handleVisibility);
      document.removeEventListener('visibilitychange', handleVisibility);
    });

    // 6. Healthy Background Polling (every 30 seconds - WebSockets & BroadcastChannels handle instant sync)
    const pollInterval = setInterval(() => {
      onDataChange({ table: 'all', event: 'POLL_HEARTBEAT', source: 'interval' });
    }, 30000);
    cleanupHandlers.push(() => clearInterval(pollInterval));
  }

  return () => {
    cleanupHandlers.forEach((fn) => {
      try {
        fn();
      } catch {}
    });
  };
}
