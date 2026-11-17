import { supabase, isSupabaseConfigured } from './supabaseClient';

const formatBytes = (bytes = 0) => {
  const num = Number(bytes) || 0;
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  if (num < 1024 * 1024 * 1024) return `${(num / (1024 * 1024)).toFixed(2)} MB`;
  return `${(num / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const getLocalStorageUsageKB = () => {
  if (typeof window === 'undefined' || !window.localStorage) return 0;
  try {
    let totalChars = 0;
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const k = window.localStorage.key(i) || '';
      const v = window.localStorage.getItem(k) || '';
      totalChars += k.length + v.length;
    }
    return Number(((totalChars * 2) / 1024).toFixed(1));
  } catch {
    return 0;
  }
};

export const SystemHealthService = {
  formatBytes,

  measureWebsitePing: async () => {
    if (typeof window === 'undefined') {
      return { pingMs: 0, status: 'offline' };
    }
    const start = performance.now();
    try {
      const res = await fetch(`${window.location.origin}/favicon-32x32.png?ping=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store'
      });
      const elapsed = Math.max(1, Math.round(performance.now() - start));
      if (!res.ok) {
        return { pingMs: elapsed, status: 'degraded' };
      }
      return {
        pingMs: elapsed,
        status: elapsed < 150 ? 'optimal' : elapsed < 400 ? 'moderate' : 'slow'
      };
    } catch {
      return { pingMs: null, status: 'offline' };
    }
  },

  getBrowserTelemetry: () => {
    if (typeof window === 'undefined') {
      return {
        online: true,
        heapUsedMB: null,
        heapLimitMB: null,
        networkType: 'unknown',
        downlinkMbps: null,
        localStorageKB: 0
      };
    }

    const mem = window.performance && window.performance.memory ? window.performance.memory : null;
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;

    return {
      online: navigator.onLine !== false,
      heapUsedMB: mem ? Number((mem.usedJSHeapSize / (1024 * 1024)).toFixed(1)) : null,
      heapLimitMB: mem ? Number((mem.jsHeapSizeLimit / (1024 * 1024)).toFixed(0)) : null,
      networkType: conn?.effectiveType ? String(conn.effectiveType).toUpperCase() : 'WIFI/LAN',
      downlinkMbps: typeof conn?.downlink === 'number' ? conn.downlink : null,
      localStorageKB: getLocalStorageUsageKB()
    };
  },

  measureDatabaseHealth: async () => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        connected: false,
        rpcAvailable: false,
        dbPingMs: null,
        dbSizeBytes: 0,
        dbSizePretty: '0 MB',
        quotaBytes: 500 * 1024 * 1024,
        usagePercent: 0,
        activeConnections: 0,
        cacheHitRatio: null,
        totalRows: 0,
        tables: []
      };
    }

    const dbStart = performance.now();
    try {
      const { data, error } = await supabase.rpc('get_database_health_stats');
      const dbPingMs = Math.max(1, Math.round(performance.now() - dbStart));

      if (!error && data) {
        const dbSizeBytes = Number(data.db_size_bytes) || 0;
        const quotaBytes = 500 * 1024 * 1024; // 500 MB standard Supabase DB quota reference
        const tables = Array.isArray(data.tables) ? data.tables : [];
        const totalRows = tables.reduce((acc, t) => acc + (Number(t.row_count) || 0), 0);

        return {
          connected: true,
          rpcAvailable: true,
          dbPingMs,
          dbSizeBytes,
          dbSizePretty: data.db_size_pretty || formatBytes(dbSizeBytes),
          quotaBytes,
          usagePercent: Math.min(100, Number(((dbSizeBytes / quotaBytes) * 100).toFixed(2))),
          activeConnections: Number(data.active_connections) || 0,
          cacheHitRatio: data.cache_hit_ratio !== null && data.cache_hit_ratio !== undefined
            ? Number(data.cache_hit_ratio)
            : null,
          totalRows,
          tables
        };
      }
    } catch {
      // Fallback below if RPC is not installed yet
    }

    // Fallback: ping Supabase via lightweight count queries
    const fallbackStart = performance.now();
    const fallbackTables = ['bookings', 'hotels', 'packages', 'transports', 'restaurants', 'site_visitors', 'admin_users'];
    const tableResults = [];
    let connected = false;

    for (const tbl of fallbackTables) {
      try {
        const { count, error } = await supabase
          .from(tbl)
          .select('*', { count: 'exact', head: true });
        if (!error) {
          connected = true;
          tableResults.push({
            table_name: tbl,
            row_count: Number(count) || 0,
            total_bytes: 0,
            total_pretty: 'SQL RPC Needed'
          });
        }
      } catch {
        // ignore missing table
      }
    }

    const dbPingMs = connected ? Math.max(1, Math.round(performance.now() - fallbackStart)) : null;
    const totalRows = tableResults.reduce((acc, t) => acc + t.row_count, 0);

    return {
      connected,
      rpcAvailable: false,
      dbPingMs,
      dbSizeBytes: 0,
      dbSizePretty: 'SQL RPC Needed',
      quotaBytes: 500 * 1024 * 1024,
      usagePercent: 0,
      activeConnections: connected ? 1 : 0,
      cacheHitRatio: null,
      totalRows,
      tables: tableResults
    };
  },

  collectSnapshot: async () => {
    const [web, db] = await Promise.all([
      SystemHealthService.measureWebsitePing(),
      SystemHealthService.measureDatabaseHealth()
    ]);
    const browser = SystemHealthService.getBrowserTelemetry();

    return {
      checkedAt: new Date().toISOString(),
      web,
      db,
      browser
    };
  }
};
