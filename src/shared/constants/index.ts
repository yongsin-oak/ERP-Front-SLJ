// ---------------------------------------------------------------------------
// Query timing constants — use these everywhere instead of inline math
// ---------------------------------------------------------------------------

/** How long cached data is considered fresh before a background refetch triggers. */
export const STALE_TIME = {
  /** 0ms — always stale; every mount triggers a fetch (dashboard live panels) */
  REALTIME: 0,
  /** 30s — near-live data that changes frequently */
  SHORT: 1000 * 30,
  /** 2min — default; most paginated lists */
  MEDIUM: 1000 * 60 * 2,
  /** 5min — data that changes infrequently (employees, orders) */
  LONG: 1000 * 60 * 5,
  /** 10min — master data rarely edited (brands, categories, shops) */
  MASTER: 1000 * 60 * 10,
  /** 30min — near-static reference data (roles, terminal list) */
  STATIC: 1000 * 60 * 30,
} as const;

/** How long inactive queries stay in memory before being garbage-collected. */
export const GC_TIME = {
  /** 5min */
  SHORT: 1000 * 60 * 5,
  /** 10min — default */
  MEDIUM: 1000 * 60 * 10,
  /** 30min — keep master data alive across route changes */
  LONG: 1000 * 60 * 30,
} as const;

/** Automatic background polling interval for live-dashboard queries. */
export const REFETCH_INTERVAL = {
  /** 30s — recent-orders live feed */
  REALTIME: 1000 * 30,
  /** 1min — summary stats */
  SHORT: 1000 * 60,
  /** 5min — charts / aggregates */
  MEDIUM: 1000 * 60 * 5,
  /** 10min — low-priority ambient refresh */
  LONG: 1000 * 60 * 10,
} as const;

// ---------------------------------------------------------------------------
// Pagination defaults
// ---------------------------------------------------------------------------

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 200,
} as const;

// ---------------------------------------------------------------------------
// Upload limits
// ---------------------------------------------------------------------------

export const UPLOAD = {
  MAX_IMAGE_MB: 5,
  MAX_DOCUMENT_MB: 20,
  ACCEPTED_IMAGES: '.jpg,.jpeg,.png,.webp',
  ACCEPTED_DOCS: '.pdf,.xlsx,.csv',
} as const;
