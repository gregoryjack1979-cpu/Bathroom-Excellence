/**
 * Shared helpers for the Google Ads API scripts.
 *
 * Talks to the Google Ads API over its REST interface with Node's built-in
 * `fetch` — no SDK, no extra dependencies. Everything is configured through
 * environment variables (see `.env.google-ads.example` and
 * `docs/google-ads-api.md`).
 */
import fs from "node:fs";
import path from "node:path";

export const DEFAULT_API_VERSION = "v25";
export const OAUTH_SCOPE = "https://www.googleapis.com/auth/adwords";

/** Env files loaded (first match wins for each variable; real env always wins). */
export const ENV_FILES = [".env.google-ads.local", ".env.local", ".env"];

export const ENV_KEYS = {
  developerToken: "GOOGLE_ADS_DEVELOPER_TOKEN",
  clientId: "GOOGLE_ADS_CLIENT_ID",
  clientSecret: "GOOGLE_ADS_CLIENT_SECRET",
  refreshToken: "GOOGLE_ADS_REFRESH_TOKEN",
  loginCustomerId: "GOOGLE_ADS_LOGIN_CUSTOMER_ID",
  customerId: "GOOGLE_ADS_CUSTOMER_ID",
};

/* ────────────────────────────── configuration ────────────────────────────── */

export function loadEnv(cwd = process.cwd()) {
  for (const name of ENV_FILES) {
    const file = path.join(cwd, name);
    if (!fs.existsSync(file)) continue;
    try {
      // Node ≥ 20.12: variables already present in process.env take precedence.
      process.loadEnvFile(file);
    } catch (err) {
      console.warn(`warning: could not read ${name}: ${err.message}`);
    }
  }
}

export const normalizeCustomerId = (value) => String(value ?? "").replace(/\D/g, "");

export function formatCustomerId(value) {
  const digits = normalizeCustomerId(value);
  return digits.length === 10
    ? `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
    : digits;
}

export class ConfigError extends Error {}

/**
 * Read configuration from the environment. `required` lists config keys that
 * must be present; a readable error names the missing env vars.
 */
export function getConfig({ required = [] } = {}) {
  const env = process.env;
  const cfg = {
    developerToken: env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim() || "",
    clientId: env.GOOGLE_ADS_CLIENT_ID?.trim() || "",
    clientSecret: env.GOOGLE_ADS_CLIENT_SECRET?.trim() || "",
    refreshToken: env.GOOGLE_ADS_REFRESH_TOKEN?.trim() || "",
    loginCustomerId: normalizeCustomerId(env.GOOGLE_ADS_LOGIN_CUSTOMER_ID),
    customerId: normalizeCustomerId(env.GOOGLE_ADS_CUSTOMER_ID),
    apiVersion: env.GOOGLE_ADS_API_VERSION?.trim() || DEFAULT_API_VERSION,
    apiBase: (env.GOOGLE_ADS_API_BASE || "https://googleads.googleapis.com").replace(/\/+$/, ""),
    tokenUrl: env.GOOGLE_ADS_TOKEN_URL || "https://oauth2.googleapis.com/token",
  };
  const missing = required.filter((key) => !cfg[key]).map((key) => ENV_KEYS[key] ?? key);
  if (missing.length) {
    throw new ConfigError(
      `Missing configuration: ${missing.join(", ")}\n` +
        `Set them in .env.google-ads.local (copy .env.google-ads.example) or export them.\n` +
        `Setup guide: docs/google-ads-api.md`,
    );
  }
  return cfg;
}

/* ─────────────────────────────── API client ──────────────────────────────── */

export class GoogleAdsApiError extends Error {
  constructor(message, { status, requestId, errors = [], body, hint } = {}) {
    super(message);
    this.name = "GoogleAdsApiError";
    this.status = status;
    this.requestId = requestId;
    this.errors = errors;
    this.body = body;
    this.hint = hint;
  }
}

const HINTS = {
  DEVELOPER_TOKEN_NOT_APPROVED:
    "Your developer token only has Test Account access. Either point GOOGLE_ADS_CUSTOMER_ID at a test account, or wait for Explorer/Basic access (docs/google-ads-api.md → Step 1).",
  DEVELOPER_TOKEN_PROHIBITED:
    "This developer token belongs to a different manager account than the one you are logging in with. Use the token from the manager account in GOOGLE_ADS_LOGIN_CUSTOMER_ID.",
  DEVELOPER_TOKEN_INVALID: "GOOGLE_ADS_DEVELOPER_TOKEN is not a valid token. Copy it again from the API Center.",
  USER_PERMISSION_DENIED:
    "The Google account that authorised the refresh token cannot access this customer. Check the account has access in Google Ads, and that GOOGLE_ADS_LOGIN_CUSTOMER_ID is the manager account that links this client (or is unset when authorising as the client account itself).",
  CUSTOMER_NOT_FOUND: "GOOGLE_ADS_CUSTOMER_ID does not exist or is not visible to this login. Run `npm run ads:pull -- accounts` to list what you can reach.",
  CUSTOMER_NOT_ENABLED: "The customer account is cancelled or not yet activated in Google Ads.",
  NOT_ADS_USER: "The Google account that authorised the refresh token has no Google Ads account. Authorise with the account that manages Bathroom Excellence's ads.",
  OAUTH_TOKEN_INVALID: "The refresh token was rejected. Re-run `npm run ads:auth` to mint a new one.",
  OAUTH_TOKEN_REVOKED: "The refresh token was revoked (or expired after 7 days because the OAuth app is still in 'Testing'). Publish the app and re-run `npm run ads:auth`.",
  UNRECOGNIZED_FIELD: "A field in the GAQL query does not exist in this API version. Check GOOGLE_ADS_API_VERSION.",
};

function parseApiError(status, data) {
  const err = data?.error ?? {};
  const details = Array.isArray(err.details) ? err.details : [];
  const failure = details.find((d) => Array.isArray(d.errors));
  const errors = (failure?.errors ?? []).map((e) => ({
    code: Object.values(e.errorCode ?? {})[0] ?? "UNKNOWN",
    message: e.message ?? "",
    field: (e.location?.fieldPathElements ?? []).map((f) => f.fieldName).join("."),
    trigger: e.trigger?.stringValue,
  }));
  const lines = errors.length
    ? errors.map((e) => `${e.code}: ${e.message}${e.field ? ` (${e.field})` : ""}`)
    : [err.message ?? JSON.stringify(data)];
  const hint = errors.map((e) => HINTS[e.code]).find(Boolean) ??
    (status === 401 ? HINTS.OAUTH_TOKEN_INVALID : undefined);
  return new GoogleAdsApiError(
    `Google Ads API ${status}${err.status ? ` ${err.status}` : ""}\n  ${lines.join("\n  ")}`,
    { status, requestId: failure?.requestId, errors, body: data, hint },
  );
}

/** Collapse a template-literal GAQL query onto one line. */
export const gaql = (query) => query.replace(/\s+/g, " ").trim();

export function createClient(cfg) {
  let cached = null; // { accessToken, expiresAt }

  async function getAccessToken() {
    if (cached && cached.expiresAt - Date.now() > 60_000) return cached.accessToken;
    const res = await fetch(cfg.tokenUrl, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        refresh_token: cfg.refreshToken,
        grant_type: "refresh_token",
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.access_token) {
      const why = [data.error, data.error_description].filter(Boolean).join(": ");
      throw new GoogleAdsApiError(`OAuth token refresh failed (${res.status})${why ? `: ${why}` : ""}`, {
        status: res.status,
        body: data,
        hint:
          data.error === "invalid_grant"
            ? HINTS.OAUTH_TOKEN_REVOKED
            : "Check GOOGLE_ADS_CLIENT_ID / GOOGLE_ADS_CLIENT_SECRET match the OAuth client the refresh token was issued for.",
      });
    }
    cached = { accessToken: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 };
    return cached.accessToken;
  }

  async function request(method, resourcePath, body) {
    const headers = {
      authorization: `Bearer ${await getAccessToken()}`,
      "developer-token": cfg.developerToken,
      "content-type": "application/json",
    };
    if (cfg.loginCustomerId) headers["login-customer-id"] = cfg.loginCustomerId;
    const res = await fetch(`${cfg.apiBase}/${cfg.apiVersion}/${resourcePath}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: { message: text.slice(0, 500) } };
    }
    if (!res.ok) throw parseApiError(res.status, data);
    return data;
  }

  /** Run a GAQL query, following `nextPageToken` until every row is in. */
  async function search(customerId, query, { onPage } = {}) {
    const rows = [];
    let pageToken;
    do {
      const body = { query: gaql(query) };
      if (pageToken) body.pageToken = pageToken;
      const data = await request("POST", `customers/${normalizeCustomerId(customerId)}/googleAds:search`, body);
      const results = data.results ?? [];
      rows.push(...results);
      onPage?.(results, data);
      pageToken = data.nextPageToken;
    } while (pageToken);
    return rows;
  }

  async function listAccessibleCustomers() {
    const data = await request("GET", "customers:listAccessibleCustomers");
    return (data.resourceNames ?? []).map((name) => name.split("/")[1]);
  }

  return { search, listAccessibleCustomers, request, getAccessToken };
}

/* ───────────────────────────── data utilities ────────────────────────────── */

/** Read a dotted path (`campaign.name`) off a REST row (camelCase keys). */
export function pick(row, dotted, fallback = undefined) {
  let cur = row;
  for (const key of dotted.split(".")) {
    if (cur == null || typeof cur !== "object") return fallback;
    cur = cur[key];
  }
  return cur ?? fallback;
}

/** Flatten nested objects into dotted keys; arrays become JSON strings. */
export function flatten(obj, prefix = "", out = {}) {
  for (const [key, value] of Object.entries(obj ?? {})) {
    const name = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) flatten(value, name, out);
    else out[name] = Array.isArray(value) ? JSON.stringify(value) : value;
  }
  return out;
}

export const microsToUnits = (micros) => Math.round(Number(micros ?? 0)) / 1_000_000;
export const round = (n, places = 2) => Math.round(Number(n ?? 0) * 10 ** places) / 10 ** places;
export const resourceId = (resourceName) => String(resourceName ?? "").split("/").pop();

export function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

/** `segments.date BETWEEN 'start' AND 'end'` covering the last `days` days (inclusive of today). */
export function dateRange(days) {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - (Math.max(1, days) - 1));
  return { start: isoDate(start), end: isoDate(end) };
}

export const dateClause = (days, field = "segments.date") => {
  const { start, end } = dateRange(days);
  return `${field} BETWEEN '${start}' AND '${end}'`;
};

/* ───────────────────────────────── output ────────────────────────────────── */

function csvCell(value) {
  if (value == null) return "";
  const s = typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows, columns) {
  const cols = columns ?? [...rows.reduce((set, r) => (Object.keys(r).forEach((k) => set.add(k)), set), new Set())];
  const lines = [cols.map(csvCell).join(",")];
  for (const row of rows) lines.push(cols.map((c) => csvCell(row[c])).join(","));
  return lines.join("\n") + "\n";
}

/** Write `<dir>/<name>.csv` and/or `.json`; returns the written paths. */
export function writeDataset(dir, name, rows, format = "both") {
  fs.mkdirSync(dir, { recursive: true });
  const written = [];
  if (format === "csv" || format === "both") {
    const file = path.join(dir, `${name}.csv`);
    fs.writeFileSync(file, toCsv(rows));
    written.push(file);
  }
  if (format === "json" || format === "both") {
    const file = path.join(dir, `${name}.json`);
    fs.writeFileSync(file, JSON.stringify(rows, null, 2) + "\n");
    written.push(file);
  }
  return written;
}

export function printTable(rows, columns, { limit = 15 } = {}) {
  if (!rows.length) {
    console.log("  (no rows)");
    return;
  }
  const cols = columns ?? Object.keys(rows[0]);
  const shown = rows.slice(0, limit);
  const fmt = (v) => (v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v));
  const widths = cols.map((c) => Math.min(40, Math.max(c.length, ...shown.map((r) => fmt(r[c]).length))));
  const line = (cells) => "  " + cells.map((v, i) => fmt(v).slice(0, widths[i]).padEnd(widths[i])).join("  ");
  console.log(line(cols));
  console.log(line(widths.map((w) => "─".repeat(w))));
  for (const row of shown) console.log(line(cols.map((c) => row[c])));
  if (rows.length > shown.length) console.log(`  … ${rows.length - shown.length} more row(s) in the export files`);
}

/* ───────────────────────────────── CLI ───────────────────────────────────── */

/** Tiny argv parser: `--key value`, `--key=value`, `--flag`, `--no-flag`, positionals. */
export function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) {
      args._.push(a);
      continue;
    }
    const [rawKey, inlineValue] = a.slice(2).split(/=(.*)/s);
    const key = rawKey.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    if (inlineValue !== undefined) args[key] = inlineValue;
    else if (rawKey.startsWith("no-")) args[key.slice(2, 3).toLowerCase() + key.slice(3)] = false;
    else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith("--")) args[key] = argv[++i];
    else args[key] = true;
  }
  return args;
}

export function reportError(err) {
  if (err instanceof ConfigError) {
    console.error(`\n✖ ${err.message}`);
  } else if (err instanceof GoogleAdsApiError) {
    console.error(`\n✖ ${err.message}`);
    if (err.requestId) console.error(`  request-id: ${err.requestId}`);
    if (err.hint) console.error(`\n  Hint: ${err.hint}`);
  } else {
    console.error(`\n✖ ${err?.message ?? err}`);
    if (process.env.GOOGLE_ADS_DEBUG && err?.stack) console.error(err.stack);
  }
}
