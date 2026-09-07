#!/usr/bin/env node
/**
 * One-time OAuth 2.0 helper: turns your Google Cloud "Desktop app" OAuth client
 * into a long-lived refresh token for the Google Ads API.
 *
 *   npm run ads:auth                              # reads GOOGLE_ADS_CLIENT_ID / _SECRET
 *   npm run ads:auth -- --credentials client_secret_xxx.json
 *   npm run ads:auth -- --save                    # also writes .env.google-ads.local
 *
 * Run this on a machine with a browser (your laptop, not a cloud shell): it
 * opens Google's consent page and receives the redirect on 127.0.0.1.
 * Sign in with the Google account that manages Bathroom Excellence's ads.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { loadEnv, getConfig, parseArgs, reportError, OAUTH_SCOPE, ENV_KEYS } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  console.log(`Usage: node scripts/google-ads/get-refresh-token.mjs [options]

  --credentials <file>   OAuth client JSON downloaded from Google Cloud Console
  --client-id <id>       (or GOOGLE_ADS_CLIENT_ID)
  --client-secret <s>    (or GOOGLE_ADS_CLIENT_SECRET)
  --port <n>             Loopback port to listen on (default: random free port)
  --save                 Write the token into .env.google-ads.local
  --no-browser           Print the URL instead of opening a browser
`);
  process.exit(0);
}

loadEnv();

const ENV_FILE = ".env.google-ads.local";
const AUTH_URL = process.env.GOOGLE_ADS_AUTH_URL || "https://accounts.google.com/o/oauth2/v2/auth";

try {
  const { clientId, clientSecret } = resolveClient();
  const { tokenUrl } = getConfig();

  // PKCE: proves the token exchange comes from the same process that started the flow.
  const verifier = crypto.randomBytes(48).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  const state = crypto.randomBytes(16).toString("hex");

  const server = http.createServer();
  await new Promise((resolve) => server.listen(Number(args.port) || 0, "127.0.0.1", resolve));
  const redirectUri = `http://127.0.0.1:${server.address().port}`;

  const url = new URL(AUTH_URL);
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: OAUTH_SCOPE,
    access_type: "offline", // ask for a refresh token
    prompt: "consent", // always issue a fresh refresh token
    include_granted_scopes: "true",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  }).toString();

  console.log("\nOpen this URL in your browser and approve access:\n");
  console.log(`  ${url}\n`);
  if (args.browser !== false) openBrowser(url.toString());
  console.log(`Waiting for Google to redirect to ${redirectUri} …`);

  const code = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timed out after 10 minutes waiting for the OAuth redirect.")), 10 * 60_000);
    server.on("request", (req, res) => {
      const q = new URL(req.url, redirectUri).searchParams;
      if (!q.has("code") && !q.has("error")) {
        res.writeHead(404).end();
        return;
      }
      const ok = q.has("code") && q.get("state") === state;
      res.writeHead(ok ? 200 : 400, { "content-type": "text/html; charset=utf-8" });
      res.end(
        ok
          ? "<h2>Authorised ✔</h2><p>You can close this tab and return to the terminal.</p>"
          : `<h2>Authorisation failed</h2><p>${escapeHtml(q.get("error") ?? "state mismatch")}</p>`,
      );
      clearTimeout(timer);
      server.close();
      if (ok) resolve(q.get("code"));
      else reject(new Error(`Google returned an error: ${q.get("error") ?? "state mismatch"}`));
    });
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      code_verifier: verifier,
    }),
  });
  const tokens = await res.json().catch(() => ({}));
  if (!res.ok || !tokens.refresh_token) {
    throw new Error(
      `Token exchange failed (${res.status}): ${tokens.error ?? ""} ${tokens.error_description ?? ""}\n` +
        (tokens.access_token && !tokens.refresh_token
          ? "Google returned an access token but no refresh token — make sure the OAuth client is a 'Desktop app' and re-run."
          : ""),
    );
  }

  console.log("\n✔ Refresh token obtained.\n");
  const lines = [
    `${ENV_KEYS.clientId}=${clientId}`,
    `${ENV_KEYS.clientSecret}=${clientSecret}`,
    `${ENV_KEYS.refreshToken}=${tokens.refresh_token}`,
  ];

  if (args.save) {
    const file = path.resolve(ENV_FILE);
    const updated = upsertEnv(fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "", lines);
    fs.writeFileSync(file, updated, { mode: 0o600 });
    fs.chmodSync(file, 0o600);
    console.log(`Saved to ${ENV_FILE}. Fill in the remaining variables there (developer token, customer IDs).`);
  } else {
    console.log(`Add these lines to ${ENV_FILE} (or re-run with --save):\n`);
    console.log(lines.map((l) => `  ${l}`).join("\n"));
  }
  console.log("\nKeep the refresh token secret — it grants access to the Google Ads account.");
} catch (err) {
  reportError(err);
  process.exit(1);
}

/* ───────────────────────────────── helpers ───────────────────────────────── */

function resolveClient() {
  let clientId = args.clientId ?? process.env.GOOGLE_ADS_CLIENT_ID;
  let clientSecret = args.clientSecret ?? process.env.GOOGLE_ADS_CLIENT_SECRET;
  if (args.credentials) {
    const json = JSON.parse(fs.readFileSync(path.resolve(args.credentials), "utf8"));
    const client = json.installed ?? json.web ?? json;
    clientId = client.client_id ?? clientId;
    clientSecret = client.client_secret ?? clientSecret;
    if (json.web && !json.installed) {
      console.warn(
        "warning: this is a 'Web application' OAuth client. Add http://127.0.0.1 (any port) to its\n" +
          "Authorized redirect URIs, or create a 'Desktop app' client instead — Desktop clients accept loopback redirects automatically.",
      );
    }
  }
  if (!clientId || !clientSecret) {
    throw new Error(
      "No OAuth client configured. Pass --credentials <client_secret.json> (downloaded from Google Cloud Console → APIs & Services → Credentials),\n" +
        "or set GOOGLE_ADS_CLIENT_ID and GOOGLE_ADS_CLIENT_SECRET. See docs/google-ads-api.md → Step 2.",
    );
  }
  return { clientId: clientId.trim(), clientSecret: clientSecret.trim() };
}

function openBrowser(url) {
  const [cmd, cmdArgs] =
    process.platform === "darwin" ? ["open", [url]]
    : process.platform === "win32" ? ["cmd", ["/c", "start", "", url.replace(/&/g, "^&")]]
    : ["xdg-open", [url]];
  try {
    spawn(cmd, cmdArgs, { stdio: "ignore", detached: true }).on("error", () => {}).unref();
  } catch {
    /* fall back to the printed URL */
  }
}

function upsertEnv(existing, lines) {
  let out = existing.replace(/\s*$/, "");
  for (const line of lines) {
    const key = line.split("=")[0];
    const re = new RegExp(`^${key}=.*$`, "m");
    out = re.test(out) ? out.replace(re, line) : `${out}${out ? "\n" : ""}${line}`;
  }
  return out + "\n";
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
