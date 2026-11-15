# Web Push support in this stack

Answers issue #3 (Web Push support in this stack), part of wayfinder map #1.

Researched: 2026-11-15. Stack: React Router app on Node, SQLite via better-sqlite3 (`^12.8.0`, latest 13.2.0), Drizzle ORM (`^0.45.2`, latest 0.45.4). Repo has no existing push code (`app/` and `public/` have no `pushManager`, `serviceWorker` or `web-push` references).

## Summary

- **Library:** `web-push` on npm. Latest is **4.0.0**, published **2026-11-06**, ESM-only (`"type": "module"`), `engines.node >= 16`. The 3.6.x line is the previous major line; 4.0.0 is only days old, so pin and smoke-test it before relying on it.
- **Setup work:** generate VAPID keys once and store them; set a `mailto:` or `https:` subject; store each `PushSubscription` (endpoint plus `keys.p256dh` and `keys.auth`) in SQLite; add a service worker with a `push` event handler that shows a notification; subscribe from the client with the VAPID public key.
- **VAPID:** RFC 8292. ES256-signed JWT with `aud`, `exp` (max 24 hours ahead), optional `sub`; public key is an uncompressed P-256 point, base64url.
- **iOS:** Supported since iOS/iPadOS 16.4, but **only for Home Screen web apps** (added via Share > Add to Home Screen), and permission must be requested from a direct user gesture. Not available in a regular Safari tab.

## Library: `web-push`

Sources:
- Repository and README: https://github.com/web-push-libs/web-push (fetched 2026-11-15)
- npm registry metadata, `npm view web-push` run 2026-11-15: version 4.0.0, `time.4.0.0 = 2026-11-06T11:44:33Z`, `engines.node >= 16`.
- Package source inspected from the 4.0.0 tarball (`src/index.js`, `src/web-push-lib.js`).

Facts:
- Core API: `generateVAPIDKeys()`, `setVapidDetails(subject, publicKey, privateKey)`, `sendNotification(subscription, payload, options)`, `generateRequestDetails(...)`, `getVapidHeaders(...)`, `encrypt(...)` (README; 4.0.0 exports confirmed in `src/index.js`).
- `sendNotification` encrypts the payload automatically; the subscription must include `keys.p256dh` and `keys.auth`. Payload must be a string or Buffer.
- Options (README): `TTL` in seconds (default four weeks per README; 4.0.0 source sets `DEFAULT_TTL = 2419200`, which is 28 days), `urgency` (`very-low`, `low`, `normal`, `high`), `topic` (up to 32 URL/filename-safe base64 characters), `contentEncoding` (`aes128gcm` default, or `aesgcm`), `timeout`, `proxy`, `agent`.
- Errors: rejects with `WebPushError` carrying `statusCode`, `headers`, `body`.
- Apple's push service rejects placeholder subjects such as `mailto:user@localhost` with `403 BadJwtToken` (README).
- Module is ESM in 4.0.0, which matches this repo's `"type": "module"`.

Setup work this implies:
1. Generate VAPID keys once (`npx web-push generate-vapid-keys` or `generateVAPIDKeys()`), store the private key as a server secret, and expose the public key to the client.
2. Add a `push_subscriptions` table in Drizzle (`endpoint` unique, `p256dh`, `auth`, `user_id`, timestamps). Migrate via the project's `database-migrations` skill.
3. On send, handle `WebPushError` with status `404` or `410` by deleting the subscription. This is a common convention; it is not verified against RFC 8030 in this research.
4. better-sqlite3 and Drizzle need no push-specific changes; the subscription is plain relational data.

## VAPID: RFC 8292

Source: https://www.rfc-editor.org/rfc/rfc8292 (fetched 2026-11-15; RFC publication date not re-checked here).

- Authorization header scheme `vapid`, with parameters `t` (the signed JWT) and `k` (the public key) (Sections 2, 3, 6.1).
- JWT signed with ES256. Claims: `aud` (push resource origin) and `exp` are required; `sub` is optional and must be a `mailto:` or `https:` URI (Section 2, 2.1).
- `exp` must be no more than 24 hours after the request (Sections 2, 4.2).
- Public key: uncompressed X9.62 P-256 point, base64url (Section 3.2).
- Signing key must differ from the message-encryption key pair (RFC 8291) (Section 3.2).
- The client-side public key is supplied via the Push API's `applicationServerKey` (the RFC does not use that name; it comes from the Push API).

## Service worker and client requirements

Source: https://developer.mozilla.org/en-US/docs/Web/API/Push_API (fetched 2026-11-15; page last modified 2025-05-28 per the fetched page).

- An app must have an **active service worker** to receive push messages; `PushManager.subscribe()` is called from the active worker's registration (MDN).
- The subscription endpoint is a capability URL and must be kept secret; the page also recommends protecting subscription endpoints against CSRF (MDN).
- Baseline: "Widely available" across browsers since March 2023 (MDN).

Not verified from primary sources in this pass (general knowledge, check before implementing):
- Secure context (HTTPS or localhost) is required.
- `userVisibleOnly: true` is required by Chrome, and the service worker should show a notification in its `push` handler. The MDN page fetched did not state this.

## Browser support (library README table, as fetched)

- Chrome: VAPID from v52+.
- Firefox: VAPID from v46+.
- Edge: all features from v17+.
- Safari: all features from v16+ (macOS 13 or later per the README note).
- Opera: no VAPID on desktop.
- Samsung Internet: no VAPID.

The README table is a secondary summary of browser support; it is not a browser-vendor source. Use MDN's compatibility data for authoritative numbers.

## iOS and iPadOS: Home Screen web apps

Primary source: WebKit blog, "Web Push for Web Apps on iOS and iPadOS", https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/ (published **2023-02-16**, as fetched 2026-11-15).

- Introduced in **iOS and iPadOS 16.4** (beta at the time of the post).
- "A web app that has been added to the Home Screen can request permission to receive push notifications". Only Home Screen web apps can request Web Push permission.
- Permission must be requested "in response to direct user interaction", e.g. a subscribe button.
- The web app manifest must set `display` to `standalone` or `fullscreen`, which makes the site a Home Screen web app.

Not verified from primary sources:
- Apple developer documentation page "Sending web push notifications in web apps and browsers" (https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers) returned only its title when fetched on 2026-11-15, so no current Apple requirements text was confirmed.
- A third-party guide (MagicBell) claims Apple removed standalone PWA push in the EU in iOS 17.4. This is a secondary claim and was not confirmed against an Apple source or checked for 2026; treat as unverified.

## Open questions and next steps

1. Re-check Apple's developer documentation and WebKit release notes for any change after 2023 (including the EU claim) before committing to iOS as a target.
2. Pin `web-push` to a version at least two weeks old, or accept 4.0.0 after a smoke test; 4.0.0 is only nine days old as of 2026-11-15.
3. Decide the subscription-cleanup policy (404/410) against RFC 8030 before implementation.
