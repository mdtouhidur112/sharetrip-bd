import { supabase } from './supabaseClient';

const SESSION_STORAGE_KEY = 'stb_visitor_session_id';
const ACTIVE_WINDOW_MS = 90 * 1000; // 90 seconds active window
const HEARTBEAT_INTERVAL_MS = 25 * 1000; // 25 seconds heartbeat

const getOrCreateSessionId = () => {
  if (typeof window === 'undefined') return `srv_${Date.now()}`;
  try {
    let sid = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sid) {
      sid = `vis_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_STORAGE_KEY, sid);
    }
    return sid;
  } catch {
    return `vis_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }
};

let presenceChannel = null;
let lastTrackedSignature = '';

export const VisitorService = {
  getSessionId: getOrCreateSessionId,

  buildPayload: (user, currentPath = '/') => {
    const isLoggedIn = Boolean(user && (user.email || user.uid || user.id));
    return {
      session_id: getOrCreateSessionId(),
      visitor_type: isLoggedIn ? 'user' : 'guest',
      user_email: isLoggedIn ? String(user.email || '').trim().toLowerCase() : '',
      user_name: isLoggedIn ? String(user.name || user.displayName || user.email?.split('@')[0] || 'User').trim() : 'Guest Visitor',
      current_path: String(currentPath || (typeof window !== 'undefined' ? window.location.pathname : '/')),
      last_seen: new Date().toISOString()
    };
  },

  upsertVisit: async (user, currentPath = '/') => {
    const payload = VisitorService.buildPayload(user, currentPath);

    if (supabase) {
      try {
        await supabase
          .from('site_visitors')
          .upsert(payload, { onConflict: 'session_id' });
      } catch {
        // Ignore if table not created yet; Realtime Presence fallback still works
      }

      try {
        if (!presenceChannel) {
          presenceChannel = supabase.channel('website-live-visitors', {
            config: { presence: { key: payload.session_id } }
          });
          presenceChannel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              try {
                await presenceChannel.track(payload);
              } catch {
                // ignore
              }
            }
          });
        } else {
          const sig = `${payload.visitor_type}|${payload.user_email}|${payload.current_path}`;
          if (sig !== lastTrackedSignature) {
            lastTrackedSignature = sig;
            await presenceChannel.track(payload);
          }
        }
      } catch {
        // ignore presence errors
      }
    }

    return payload;
  },

  removeCurrentVisit: async () => {
    const sid = getOrCreateSessionId();
    if (supabase) {
      try {
        if (presenceChannel) {
          await presenceChannel.untrack();
          await supabase.removeChannel(presenceChannel);
          presenceChannel = null;
        }
      } catch {
        // ignore
      }
      try {
        await supabase.from('site_visitors').delete().eq('session_id', sid);
      } catch {
        // ignore
      }
    }
  },

  startTracking: (getUser, getPath) => {
    const ping = () => {
      const user = typeof getUser === 'function' ? getUser() : getUser;
      const path = typeof getPath === 'function' ? getPath() : getPath;
      VisitorService.upsertVisit(user, path);
    };

    ping();
    const timer = setInterval(ping, HEARTBEAT_INTERVAL_MS);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        ping();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  },

  fetchLiveVisitors: async () => {
    const cutoffIso = new Date(Date.now() - ACTIVE_WINDOW_MS).toISOString();
    let dbRows = [];

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('site_visitors')
          .select('session_id, visitor_type, user_email, user_name, current_path, last_seen')
          .gte('last_seen', cutoffIso)
          .order('last_seen', { ascending: false });

        if (!error && Array.isArray(data)) {
          dbRows = data;
        }
      } catch {
        // ignore
      }
    }

    return VisitorService.summarizeVisitors(dbRows);
  },

  summarizeVisitors: (rows = []) => {
    const deduped = new Map();
    const cutoffMs = Date.now() - ACTIVE_WINDOW_MS;

    rows.forEach((row) => {
      if (!row?.session_id) return;
      const lastSeenMs = row.last_seen ? new Date(row.last_seen).getTime() : Date.now();
      if (lastSeenMs < cutoffMs) return;

      const existing = deduped.get(row.session_id);
      if (!existing || new Date(existing.last_seen).getTime() < lastSeenMs) {
        deduped.set(row.session_id, row);
      }
    });

    const list = Array.from(deduped.values()).sort(
      (a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime()
    );

    const usersCount = list.filter((v) => v.visitor_type === 'user').length;
    const guestsCount = list.filter((v) => v.visitor_type !== 'user').length;

    return {
      totalLive: list.length,
      usersCount,
      guestsCount,
      visitors: list
    };
  },

  subscribeLiveVisitors: (onUpdate) => {
    if (typeof onUpdate !== 'function') return () => {};
    let isDisposed = false;
    let presenceRows = [];

    const emitCombined = async () => {
      if (isDisposed) return;
      const cutoffIso = new Date(Date.now() - ACTIVE_WINDOW_MS).toISOString();
      let dbRows = [];

      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('site_visitors')
            .select('session_id, visitor_type, user_email, user_name, current_path, last_seen')
            .gte('last_seen', cutoffIso)
            .order('last_seen', { ascending: false });
          if (!error && Array.isArray(data)) {
            dbRows = data;
          }
        } catch {
          // ignore
        }
      }

      if (!isDisposed) {
        const combined = [...presenceRows, ...dbRows];
        onUpdate(VisitorService.summarizeVisitors(combined));
      }
    };

    emitCombined();
    const pollTimer = setInterval(emitCombined, 15000);

    let dbChannel = null;
    let adminPresenceChannel = null;

    if (supabase) {
      try {
        dbChannel = supabase
          .channel(`site-visitors-db-${Date.now()}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'site_visitors' },
            () => {
              emitCombined();
            }
          )
          .subscribe();

        adminPresenceChannel = supabase.channel('website-live-visitors');
        adminPresenceChannel
          .on('presence', { event: 'sync' }, () => {
            const state = adminPresenceChannel.presenceState();
            const nextRows = [];
            Object.values(state || {}).forEach((entries) => {
              if (Array.isArray(entries)) {
                entries.forEach((entry) => {
                  if (entry?.session_id) {
                    nextRows.push({
                      ...entry,
                      last_seen: new Date().toISOString()
                    });
                  }
                });
              }
            });
            presenceRows = nextRows;
            emitCombined();
          })
          .subscribe();
      } catch {
        // ignore
      }
    }

    return () => {
      isDisposed = true;
      clearInterval(pollTimer);
      if (supabase) {
        if (dbChannel) supabase.removeChannel(dbChannel).catch(() => {});
        if (adminPresenceChannel) supabase.removeChannel(adminPresenceChannel).catch(() => {});
      }
    };
  }
};
