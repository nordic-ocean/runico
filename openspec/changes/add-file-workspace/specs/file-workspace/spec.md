## ADDED Requirements

### Requirement: Start by opening or creating a library file
The system SHALL require the user to open an existing library file or create a new one before working, and SHALL NOT auto-restore a library on launch.

#### Scenario: Launch with no file open
- **WHEN** the app starts
- **THEN** a start screen offers to Open an existing library file or create a New one
- **AND** no library is loaded until the user does so

#### Scenario: Create a new file
- **WHEN** the user creates a New library file
- **THEN** an empty library (no folders or cards) is created and saved to that file, and the user starts working in it

#### Scenario: Open an existing file
- **WHEN** the user opens a valid library file
- **THEN** its folders, topics, cards, and pictures load and the user works in that file

#### Scenario: Invalid file
- **WHEN** the user opens a file that is not a valid Runico library
- **THEN** the app reports it and stays on the start screen without changing any data

### Requirement: The file holds the whole library
The system SHALL store the full library — folder/topic structure, cards, and embedded pictures, plus labels, study history, trash, drafts, and last session — in the open file. App settings are not part of it.

#### Scenario: Pictures travel with the file
- **WHEN** a library containing image or image-occlusion cards is saved and later opened
- **THEN** the pictures are present, because they are embedded in the file

#### Scenario: Settings stay independent of the file
- **WHEN** the user changes theme, language, or model, or opens a different file
- **THEN** those settings persist across files and sessions and are not written into the library file

### Requirement: Every change auto-saves to the open file
The system SHALL write the open file whenever the library changes — adding, editing, deleting, or moving a folder, topic, card, or picture.

#### Scenario: A change is persisted
- **WHEN** the user adds, edits, deletes, or moves a folder, topic, card, or picture
- **THEN** the change is written to the open file (debounced), with no manual save step

#### Scenario: Reopen after closing
- **WHEN** the user closes the app and opens it again
- **THEN** the start screen appears, and opening the same file shows every change made before closing

### Requirement: Works on desktop and in the browser
The system SHALL support the file workspace on the desktop app (native files) and in the browser (File System Access API), with a graceful fallback where the browser lacks it.

#### Scenario: Desktop
- **WHEN** running the desktop app
- **THEN** Open and New use native file dialogs and changes write to the chosen file path

#### Scenario: Browser with the File System Access API
- **WHEN** running in a browser that supports the File System Access API
- **THEN** Open and New pick a real file and changes auto-write to it

#### Scenario: Browser without it
- **WHEN** running in a browser without the File System Access API
- **THEN** Open accepts an uploaded file and New works in memory, the user saves via a manual download, and an unsaved-changes indicator plus a warning before leaving guard against data loss
