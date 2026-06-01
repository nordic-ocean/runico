## ADDED Requirements

### Requirement: API key stored in the OS keychain
When running as the desktop app, the system SHALL persist the OpenRouter API key using Electron `safeStorage` backed by the operating system keychain, not in renderer-accessible web storage.

#### Scenario: Saving a key on desktop
- **WHEN** the user saves an API key in the desktop app
- **THEN** the key is encrypted via `safeStorage` and stored through the OS keychain
- **AND** it is not written to `sessionStorage`/`localStorage`

#### Scenario: Key survives restarts
- **WHEN** the user quits and relaunches the desktop app
- **THEN** the previously saved key is still available without re-entry

### Requirement: Secure storage implements the existing credential-store contract
The system SHALL expose the keychain-backed store through the same `getKey`/`setKey`/`clearKey` contract used by the browser store, so feature code is unchanged.

#### Scenario: Drop-in backend
- **WHEN** the app runs in Electron
- **THEN** credential access resolves to the keychain-backed backend
- **AND** Settings and generation code call the same store interface as in the browser

#### Scenario: Browser fallback preserved
- **WHEN** the same renderer runs in a plain browser (no Electron APIs present)
- **THEN** it falls back to the existing `sessionStorage` backend

### Requirement: Raw key stays in the main process
The system SHALL keep the raw API key in the Electron main process and SHALL NOT expose it to the renderer; the renderer interacts with the key only via IPC actions (save, clear, status, perform-request).

#### Scenario: Renderer never receives the raw key
- **WHEN** the renderer needs to know key state
- **THEN** it receives only a status (present/valid/etc.), never the raw key value

### Requirement: OpenRouter requests run from the main process
The system SHALL perform OpenRouter validation and generation requests from the main process (using the keychain-stored key), returning only results to the renderer, thereby avoiding browser CORS restrictions.

#### Scenario: Generation request via IPC
- **WHEN** the renderer triggers card generation in the desktop app
- **THEN** the main process makes the OpenRouter request with the stored key
- **AND** returns the generated cards (or an error) to the renderer without exposing the key

#### Scenario: No CORS failure on desktop
- **WHEN** a request that the browser would block by CORS is made in the desktop app
- **THEN** it succeeds because it originates from the main process

### Requirement: Clearing the key removes it from the keychain
The system SHALL delete the key from the OS keychain when the user clears it.

#### Scenario: Clearing on desktop
- **WHEN** the user clears the key in the desktop app
- **THEN** the key is removed from the keychain
- **AND** the status reports no key present
