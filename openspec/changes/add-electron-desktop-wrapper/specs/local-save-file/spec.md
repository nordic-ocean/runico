## ADDED Requirements

### Requirement: All user data persists in a single local save document
The desktop app SHALL persist all user data — library, cards, study history, and settings — to a single local save document on disk: a `data.json` text file plus a `media/` bundle for images, stored under the app's user-data location.

#### Scenario: Saving to the local document
- **WHEN** the user makes a change in the desktop app
- **THEN** the change is written to the local save document (text in `data.json`, any new image into `media/`)

#### Scenario: Loading on launch
- **WHEN** the desktop app starts and a save document exists
- **THEN** the full state (library, cards, history, settings) is loaded from it

### Requirement: Images are stored as referenced media, not inline base64
The system SHALL store images as binary files in the media bundle, referenced from `data.json` by id/hash, and SHALL NOT base64-embed images inside `data.json`. Identical images SHALL be de-duplicated by hash.

#### Scenario: Image written once and referenced
- **WHEN** a card or source uses an image
- **THEN** the image is written to `media/` as a binary file
- **AND** the card/source records a reference (id/hash) to it rather than embedding the image data

#### Scenario: Shared figure de-duplicated
- **WHEN** several cards reference the same figure (e.g. occlusion regions over one diagram)
- **THEN** the figure is stored a single time in the media bundle

### Requirement: Auto-save keeps the text document small and writes incrementally
The system SHALL keep `data.json` to text-only so it stays small and fast to write, and SHALL auto-save changes without rewriting media that has not changed.

#### Scenario: Auto-save does not rewrite media
- **WHEN** a text change is auto-saved
- **THEN** only `data.json` is rewritten and unchanged media files are left in place

### Requirement: Export and import the save document
The system SHALL let the user export the complete save document as a single portable file (the data plus its media, e.g. a zipped bundle) and import one back, restoring the full state.

#### Scenario: Exporting
- **WHEN** the user exports their data
- **THEN** a single portable file containing `data.json` and the referenced media is produced

#### Scenario: Importing
- **WHEN** the user imports a previously exported file
- **THEN** the app restores the library, cards, history, and settings, with media intact

### Requirement: Save document is corruption-resilient
The system SHALL write the save document so an interrupted write cannot leave the primary document corrupted (e.g. write-to-temp-then-rename), and SHALL surface a clear message if a save document cannot be read.

#### Scenario: Interrupted write
- **WHEN** a save is interrupted partway
- **THEN** the previously good save document remains intact and loadable

### Requirement: Browser build uses a durable fallback
When running in the browser (not Electron), the system SHALL persist to a durable web store (local storage / IndexedDB) and SHALL offer the same export/import so data is not lost on tab close.

#### Scenario: Browser persistence survives tab close
- **WHEN** the app runs in the browser and the user closes and reopens the tab
- **THEN** their data is still present via the durable web store
