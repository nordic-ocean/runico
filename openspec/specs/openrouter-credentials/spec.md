# openrouter-credentials Specification

## Purpose
TBD - created by archiving change add-openrouter-key-management. Update Purpose after archive.
## Requirements
### Requirement: User can enter and save an OpenRouter API key
The Settings screen SHALL provide a field where the user can enter their own OpenRouter API key, and SHALL persist it through the credential store when saved.

#### Scenario: Saving a key
- **WHEN** the user types a key into the Settings API-key field and activates Save
- **THEN** the key is written to the credential store
- **AND** the key-status indicator updates to reflect that a key is present

#### Scenario: Key persists across reloads within the session
- **WHEN** a key has been saved and the user reloads the app in the same browser tab/session
- **THEN** the saved key is still present and usable without re-entry

### Requirement: API key is masked in the interface
The system SHALL NOT display the full raw API key in the interface after entry, showing only a masked representation (e.g. a fixed dot string or last few characters).

#### Scenario: Masked display of a stored key
- **WHEN** a key is saved and the Settings screen is shown
- **THEN** the field shows a masked representation rather than the full key
- **AND** an explicit "reveal" affordance is required to view the raw value, if offered at all

### Requirement: User can clear the stored API key
The system SHALL allow the user to remove the stored key, deleting it from the credential store.

#### Scenario: Clearing the key
- **WHEN** the user activates Clear key
- **THEN** the key is removed from the credential store
- **AND** the key-status indicator reports that no key is present

### Requirement: Credential storage is provided through a swappable backend
The system SHALL access the API key only through a credential-store abstraction with get, set, and clear operations, defaulting to the existing session-storage persistence, so the backing store can be replaced without changing callers.

#### Scenario: Default backend is session storage
- **WHEN** no alternative backend is configured
- **THEN** the credential store reads and writes the key via the existing `sessionStorage` persistence under the `runico:v1:` prefix

#### Scenario: Backend can be replaced
- **WHEN** an alternative backend implementing the same get/set/clear contract is supplied
- **THEN** all key reads and writes use it with no change to feature code that consumes the store

### Requirement: User can validate the API key
The system SHALL provide an action that verifies the stored key against OpenRouter and reports whether it is valid, without persisting any response data beyond the resulting status.

#### Scenario: Valid key
- **WHEN** the user triggers validation with a working key
- **THEN** OpenRouter is called using that key
- **AND** the status is set to "valid"

#### Scenario: Invalid or rejected key
- **WHEN** validation is triggered and OpenRouter rejects the key (e.g. 401)
- **THEN** the status is set to "invalid"
- **AND** a clear, non-technical message is shown to the user

#### Scenario: Network failure during validation
- **WHEN** validation is triggered but the request fails to reach OpenRouter
- **THEN** the status remains "untested" and the user is told the check could not complete

### Requirement: Key availability status is exposed without leaking the key
The system SHALL expose a derived, read-only availability status (e.g. none / present / valid / invalid) that other features can read to decide whether AI generation is available, without those features reading the raw key.

#### Scenario: Feature checks availability
- **WHEN** another feature needs to know whether generation can run
- **THEN** it reads the availability status
- **AND** it does not receive or read the raw key value

### Requirement: The API key is never logged or transmitted to third parties
The system SHALL NOT write the raw key to console logs, analytics, or any destination other than OpenRouter requests.

#### Scenario: No key in logs
- **WHEN** the key is saved, validated, or used
- **THEN** the raw key value does not appear in any console output or telemetry

