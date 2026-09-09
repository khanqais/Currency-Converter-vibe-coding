const Database = require('better-sqlite3');
const path = require('path');

// Store the SQLite file in the Backend directory
const DB_PATH = path.join(__dirname, '..', 'currency_converter.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Table Definitions ───────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS conversion_cache (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    from_currency TEXT NOT NULL,
    to_currency   TEXT NOT NULL,
    rate          REAL NOT NULL,
    fetched_at    INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    UNIQUE(from_currency, to_currency)
  );

  CREATE TABLE IF NOT EXISTS history_cache (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    from_currency TEXT NOT NULL,
    to_currency   TEXT NOT NULL,
    start_date    TEXT NOT NULL,
    end_date      TEXT NOT NULL,
    data          TEXT NOT NULL,
    fetched_at    INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    UNIQUE(from_currency, to_currency)
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    from_currency TEXT NOT NULL,
    to_currency   TEXT NOT NULL,
    created_at    INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    UNIQUE(from_currency, to_currency)
  );

  CREATE TABLE IF NOT EXISTS conversion_history (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    from_currency TEXT NOT NULL,
    to_currency   TEXT NOT NULL,
    amount        REAL NOT NULL,
    result        REAL NOT NULL,
    rate          REAL NOT NULL,
    timestamp     INTEGER NOT NULL DEFAULT (strftime('%s','now'))
  );

  CREATE INDEX IF NOT EXISTS idx_conversion_history_ts ON conversion_history(timestamp DESC);
`);

// ─── TTL helpers ─────────────────────────────────────────────────────────────

/** Returns Unix timestamp for N seconds ago */
function secondsAgo(seconds) {
  return Math.floor(Date.now() / 1000) - seconds;
}

/** 1-hour TTL for conversion rates */
const RATE_TTL_SECONDS    = 3600;

/** 12-hour TTL for historical data */
const HISTORY_TTL_SECONDS = 43200;

// ─── Conversion Cache ─────────────────────────────────────────────────────────

const conversionCache = {
  get(from, to) {
    return db
      .prepare(
        `SELECT * FROM conversion_cache
         WHERE from_currency = ? AND to_currency = ?
           AND fetched_at > ?`
      )
      .get(from, to, secondsAgo(RATE_TTL_SECONDS));
  },

  upsert(from, to, rate) {
    db.prepare(
      `INSERT INTO conversion_cache (from_currency, to_currency, rate, fetched_at)
       VALUES (?, ?, ?, strftime('%s','now'))
       ON CONFLICT(from_currency, to_currency)
       DO UPDATE SET rate = excluded.rate, fetched_at = excluded.fetched_at`
    ).run(from, to, rate);
  },
};

// ─── History Cache ────────────────────────────────────────────────────────────

const historyCache = {
  get(from, to) {
    const row = db
      .prepare(
        `SELECT * FROM history_cache
         WHERE from_currency = ? AND to_currency = ?
           AND fetched_at > ?`
      )
      .get(from, to, secondsAgo(HISTORY_TTL_SECONDS));
    if (!row) return null;
    return { ...row, data: JSON.parse(row.data) };
  },

  upsert(from, to, startDate, endDate, data) {
    db.prepare(
      `INSERT INTO history_cache (from_currency, to_currency, start_date, end_date, data, fetched_at)
       VALUES (?, ?, ?, ?, ?, strftime('%s','now'))
       ON CONFLICT(from_currency, to_currency)
       DO UPDATE SET start_date = excluded.start_date,
                     end_date   = excluded.end_date,
                     data       = excluded.data,
                     fetched_at = excluded.fetched_at`
    ).run(from, to, startDate, endDate, JSON.stringify(data));
  },
};

// ─── Favorites ────────────────────────────────────────────────────────────────

const favorites = {
  getAll() {
    return db.prepare(`SELECT * FROM favorites ORDER BY created_at DESC`).all();
  },

  create(from, to) {
    try {
      const result = db
        .prepare(
          `INSERT INTO favorites (from_currency, to_currency)
           VALUES (?, ?)`
        )
        .run(from, to);
      return db.prepare(`SELECT * FROM favorites WHERE id = ?`).get(result.lastInsertRowid);
    } catch (err) {
      if (err.message.includes('UNIQUE')) {
        const duplicate = new Error('This currency pair is already in your favorites');
        duplicate.code = 'DUPLICATE';
        throw duplicate;
      }
      throw err;
    }
  },

  delete(id) {
    const result = db.prepare(`DELETE FROM favorites WHERE id = ?`).run(id);
    return result.changes > 0;
  },
};

// ─── Conversion History ───────────────────────────────────────────────────────

const conversionHistory = {
  log(from, to, amount, result, rate) {
    try {
      db.prepare(
        `INSERT INTO conversion_history (from_currency, to_currency, amount, result, rate)
         VALUES (?, ?, ?, ?, ?)`
      ).run(from, to, amount, result, rate);
    } catch {
      // Non-critical — never block the main response
    }
  },
};

module.exports = { db, conversionCache, historyCache, favorites, conversionHistory };
