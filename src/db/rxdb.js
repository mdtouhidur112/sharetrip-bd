import { createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { replicateRxCollection } from 'rxdb/plugins/replication';
import { Subject } from 'rxjs';
import {
  supabase,
  rowToPackageCategory,
  packageCategoryToRow,
  rowToPackage,
  packageToRow,
  rowToHotel,
  hotelToRow,
  rowToTransport,
  transportToRow,
  rowToRestaurant,
  restaurantToRow,
  rowToBooking,
  bookingToRow,
  rowToExpense,
  expenseToRow,
  rowToReview,
  reviewToRow,
  rowToAdminProfile,
  adminProfileToRow
} from '../services/supabaseClient';

const createBaseSchema = (title) => ({
  title,
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 160 },
    updatedAt: { type: 'string', maxLength: 64 }
  },
  required: ['id'],
  additionalProperties: true
});

const COLLECTION_CONFIGS = [
  {
    name: 'categories',
    table: 'package_categories',
    storageKey: 'aetheria_pkg_categories_db',
    eventName: 'app:categories-updated',
    rowToDoc: rowToPackageCategory,
    docToRow: packageCategoryToRow
  },
  {
    name: 'packages',
    table: 'packages',
    storageKey: 'aetheria_packages_db',
    eventName: 'app:packages-updated',
    rowToDoc: rowToPackage,
    docToRow: packageToRow
  },
  {
    name: 'hotels',
    table: 'hotels',
    storageKey: 'aetheria_hotels_db',
    eventName: 'app:hotels-updated',
    rowToDoc: rowToHotel,
    docToRow: hotelToRow
  },
  {
    name: 'transports',
    table: 'transports',
    storageKey: 'aetheria_transports_db',
    eventName: 'app:transports-updated',
    rowToDoc: rowToTransport,
    docToRow: transportToRow
  },
  {
    name: 'restaurants',
    table: 'restaurants',
    storageKey: 'aetheria_restaurants_db',
    eventName: 'app:restaurants-updated',
    rowToDoc: rowToRestaurant,
    docToRow: restaurantToRow
  },
  {
    name: 'bookings',
    table: 'bookings',
    storageKey: 'aetheria_bookings_db',
    eventName: 'app:bookings-updated',
    rowToDoc: rowToBooking,
    docToRow: bookingToRow
  },
  {
    name: 'expenses',
    table: 'expenses',
    storageKey: 'aetheria_expenses_db',
    eventName: 'app:expenses-updated',
    rowToDoc: rowToExpense,
    docToRow: expenseToRow
  },
  {
    name: 'reviews',
    table: 'reviews',
    storageKey: 'aetheria_reviews_db',
    eventName: 'app:reviews-updated',
    rowToDoc: rowToReview,
    docToRow: reviewToRow
  },
  {
    name: 'admin_profile',
    table: 'admin_profile',
    storageKey: 'aetheria_root_admin_profile',
    eventName: 'app:admin-profile-updated',
    isSingleton: true,
    rowToDoc: rowToAdminProfile,
    docToRow: adminProfileToRow
  }
];

let dbPromise = null;
let syncPromise = null;
let realtimeChannel = null;
let currentSyncStatus = typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : (supabase ? 'syncing' : 'offline');
const statusListeners = new Set();
const replicationStates = new Map();
const pullStreams = new Map();

const setSyncStatus = (nextStatus) => {
  if (currentSyncStatus === nextStatus) return;
  currentSyncStatus = nextStatus;
  statusListeners.forEach((cb) => {
    try {
      cb(nextStatus);
    } catch {
      // ignore listener error
    }
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:rxdb-sync-status', { detail: nextStatus }));
  }
};

export const getSyncStatus = () => currentSyncStatus;

export const subscribeSyncStatus = (cb) => {
  statusListeners.add(cb);
  cb(currentSyncStatus);
  return () => statusListeners.delete(cb);
};

export const getRxdb = async () => {
  if (dbPromise) return dbPromise;
  dbPromise = (async () => {
    const db = await createRxDatabase({
      name: 'aetheria_travel_rxdb_v1',
      storage: getRxStorageDexie(),
      multiInstance: true,
      ignoreDuplicate: true
    });

    const collectionsSpec = {};
    COLLECTION_CONFIGS.forEach((cfg) => {
      collectionsSpec[cfg.name] = { schema: createBaseSchema(cfg.name) };
    });

    await db.addCollections(collectionsSpec);
    return db;
  })();
  return dbPromise;
};

const mirrorCollectionToLocalStorage = async (db, cfg) => {
  try {
    const col = db[cfg.name];
    if (!col) return;
    const docs = await col.find().exec();
    const active = docs
      .map((d) => {
        const json = d.toJSON();
        const copy = { ...json };
        delete copy._rev;
        delete copy._attachments;
        delete copy._deleted;
        delete copy._meta;
        return copy;
      })
      .filter((item) => !item._deleted);

    if (cfg.isSingleton) {
      if (active[0]) {
        localStorage.setItem(cfg.storageKey, JSON.stringify(active[0]));
        window.dispatchEvent(new CustomEvent(cfg.eventName));
      }
    } else if (active.length > 0 || localStorage.getItem(cfg.storageKey) !== null) {
      localStorage.setItem(cfg.storageKey, JSON.stringify(active));
      window.dispatchEvent(new CustomEvent(cfg.eventName));
    }
  } catch (err) {
    console.warn(`RxDB mirror warning (${cfg.name}):`, err);
  }
};

export const initRxdbSync = async () => {
  if (syncPromise) return syncPromise;

  syncPromise = (async () => {
    try {
      const db = await getRxdb();

      if (typeof window !== 'undefined') {
        window.addEventListener('online', () => {
          setSyncStatus('syncing');
          pullStreams.forEach((stream$) => stream$.next('RESYNC'));
          setTimeout(() => {
            if (navigator.onLine && supabase) setSyncStatus('synced');
          }, 1200);
        });
        window.addEventListener('offline', () => setSyncStatus('offline'));
      }

      if (!supabase || (typeof navigator !== 'undefined' && !navigator.onLine)) {
        setSyncStatus('offline');
        return db;
      }

      setSyncStatus('syncing');

      COLLECTION_CONFIGS.forEach((cfg) => {
        const col = db[cfg.name];
        if (!col) return;

        // Subscribe to local RxDB changes so UI stays reactive offline & online
        col.$.subscribe(() => {
          mirrorCollectionToLocalStorage(db, cfg);
        });

        const pullStream$ = new Subject();
        pullStreams.set(cfg.name, pullStream$);

        const repState = replicateRxCollection({
          collection: col,
          replicationIdentifier: `supabase-${cfg.table}-v1`,
          live: true,
          retryTime: 10000,
          autoStart: true,
          pull: {
            stream$: pullStream$.asObservable(),
            batchSize: 100,
            handler: async (lastCheckpoint, batchSize) => {
              try {
                if (typeof navigator !== 'undefined' && !navigator.onLine) {
                  setSyncStatus('offline');
                  return { documents: [], checkpoint: lastCheckpoint };
                }
                setSyncStatus('syncing');

                let query = supabase
                  .from(cfg.table)
                  .select('*')
                  .order('updated_at', { ascending: true })
                  .limit(batchSize || 100);

                if (lastCheckpoint?.updatedAt) {
                  query = query.gt('updated_at', lastCheckpoint.updatedAt);
                }

                let { data, error } = await query;

                // Graceful fallback if table lacks updated_at column
                if (error && String(error.message || '').includes('updated_at')) {
                  const fallbackRes = await supabase
                    .from(cfg.table)
                    .select('*')
                    .limit(batchSize || 100);
                  data = fallbackRes.data;
                  error = fallbackRes.error;
                }

                if (error) {
                  console.warn(`RxDB pull notice (${cfg.table}):`, error.message);
                  return { documents: [], checkpoint: lastCheckpoint };
                }

                const rows = Array.isArray(data) ? data : [];
                const documents = rows
                  .filter((r) => r && r.id)
                  .map((r) => ({
                    ...cfg.rowToDoc(r),
                    id: String(r.id),
                    updatedAt: r.updated_at || new Date().toISOString(),
                    _deleted: Boolean(r._deleted)
                  }));

                const lastRow = rows[rows.length - 1];
                const nextCheckpoint = lastRow
                  ? {
                      id: String(lastRow.id),
                      updatedAt: lastRow.updated_at || new Date().toISOString()
                    }
                  : lastCheckpoint;

                setSyncStatus('synced');
                return { documents, checkpoint: nextCheckpoint };
              } catch (err) {
                console.warn(`RxDB pull exception (${cfg.table}):`, err);
                setSyncStatus(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'synced');
                return { documents: [], checkpoint: lastCheckpoint };
              }
            }
          },
          push: {
            batchSize: 50,
            handler: async (changeRows) => {
              try {
                if (!supabase || (typeof navigator !== 'undefined' && !navigator.onLine)) {
                  setSyncStatus('offline');
                  return [];
                }
                setSyncStatus('syncing');

                for (const change of changeRows) {
                  const doc = change.newDocumentState;
                  if (!doc || !doc.id) continue;

                  if (doc._deleted) {
                    const { error } = await supabase
                      .from(cfg.table)
                      .delete()
                      .eq('id', doc.id);
                    if (error) {
                      console.warn(`RxDB push delete notice (${cfg.table}):`, error.message);
                    }
                  } else {
                    const payload = {
                      ...cfg.docToRow(doc),
                      id: doc.id,
                      updated_at: new Date().toISOString()
                    };
                    const { error } = await supabase
                      .from(cfg.table)
                      .upsert(payload, { onConflict: 'id' });
                    if (error) {
                      console.warn(`RxDB push upsert notice (${cfg.table}):`, error.message);
                    }
                  }
                }

                setSyncStatus('synced');
                return [];
              } catch (err) {
                console.warn(`RxDB push exception (${cfg.table}):`, err);
                setSyncStatus(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'synced');
                return [];
              }
            }
          }
        });

        repState.active$.subscribe((isActive) => {
          if (typeof navigator !== 'undefined' && !navigator.onLine) {
            setSyncStatus('offline');
          } else if (isActive) {
            setSyncStatus('syncing');
          } else {
            setSyncStatus('synced');
          }
        });

        replicationStates.set(cfg.name, repState);
      });

      // Trigger RxDB pull immediately whenever Supabase Realtime fires postgres_changes
      if (!realtimeChannel) {
        let ch = supabase.channel('rxdb-supabase-replication-trigger');
        COLLECTION_CONFIGS.forEach((cfg) => {
          ch = ch.on(
            'postgres_changes',
            { event: '*', schema: 'public', table: cfg.table },
            () => {
              const stream$ = pullStreams.get(cfg.name);
              if (stream$) stream$.next('RESYNC');
            }
          );
        });
        realtimeChannel = ch.subscribe();
      }

      setSyncStatus('synced');
      return db;
    } catch (err) {
      console.warn('RxDB initialization fallback notice:', err);
      setSyncStatus(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'synced');
      return null;
    }
  })();

  return syncPromise;
};

export const upsertRxDoc = async (collectionName, doc) => {
  try {
    if (!doc || !doc.id) return null;
    const db = await getRxdb();
    const col = db?.[collectionName];
    if (!col) return null;
    const payload = {
      ...doc,
      id: String(doc.id),
      updatedAt: doc.updatedAt || new Date().toISOString()
    };
    return await col.upsert(payload);
  } catch (err) {
    console.warn(`RxDB upsert warning (${collectionName}):`, err);
    return null;
  }
};

export const deleteRxDoc = async (collectionName, id) => {
  try {
    if (!id) return false;
    const db = await getRxdb();
    const col = db?.[collectionName];
    if (!col) return false;
    const doc = await col.findOne(String(id)).exec();
    if (doc) {
      await doc.remove();
    }
    return true;
  } catch (err) {
    console.warn(`RxDB remove warning (${collectionName}):`, err);
    return false;
  }
};

export const getRxDocs = async (collectionName) => {
  try {
    const db = await getRxdb();
    const col = db?.[collectionName];
    if (!col) return [];
    const docs = await col.find().exec();
    return docs.map((d) => d.toJSON());
  } catch (err) {
    console.warn(`RxDB query warning (${collectionName}):`, err);
    return [];
  }
};
