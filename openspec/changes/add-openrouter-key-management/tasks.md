## 1. Credential store seam

- [ ] 1.1 Add a `credentialStore` helper in `app.jsx` exposing `getKey()`, `setKey(value)`, `clearKey()`, backed by `usePersistentState('openrouterKey', '')` (prefix `runico:v1:`)
- [ ] 1.2 Ensure all key access in the app goes through this helper — no direct `sessionStorage` reads of the key elsewhere
- [ ] 1.3 Add a derived `keyStatus` value (`none | present | valid | invalid`) computed from "key saved?" + last validation result

## 2. Settings UI

- [ ] 2.1 Add an "OpenRouter API key" field to `SettingsScreen` (`app.jsx:2142`) with Save and Clear actions
- [ ] 2.2 Mask the stored key in the field (dots or last-4), with an optional explicit reveal toggle
- [ ] 2.3 Wire Save → `setKey`, Clear → `clearKey`, and reflect the result in the key-status indicator
- [ ] 2.4 Show a short, non-technical helper line explaining the key stays in the browser and is the user's own

## 3. Key validation

- [ ] 3.1 Add a `validateKey()` function that calls OpenRouter's auth/models endpoint with the stored key
- [ ] 3.2 Map responses: 2xx → `valid`, 401/403 → `invalid`, network/CORS failure → `untested`
- [ ] 3.3 Add a "Test key" action in Settings that runs `validateKey()` and surfaces the status with a clear message
- [ ] 3.4 Confirm no response body beyond the derived status is persisted

## 4. Safety & verification

- [ ] 4.1 Audit that the raw key is never passed to console logs, render output, or analytics
- [ ] 4.2 Verify persistence across a tab reload and removal on Clear via the live prototype
- [ ] 4.3 Verify the availability status is the only key-related value other features read
