## ADDED Requirements

### Requirement: Electron app hosts the existing renderer
The system SHALL provide an Electron application that loads the existing `app/` Runico app as its renderer in a desktop window.

#### Scenario: Launching the desktop app
- **WHEN** the desktop app is started
- **THEN** a window opens showing the Runico interface from the existing app code
- **AND** core flows (study, browse, settings, add cards) work as in the browser

### Requirement: Reuse the web codebase without forking it
The system SHALL load the same renderer assets used by the web build, so the renderer is not duplicated or diverged for desktop.

#### Scenario: Single source of UI
- **WHEN** the renderer is updated in `app/`
- **THEN** both the web build and the Electron app reflect the change without a separate copy

### Requirement: Application lifecycle and window management
The system SHALL handle standard desktop lifecycle: opening a window on launch, quitting when windows close (per-platform convention), and a basic application menu.

#### Scenario: Closing the app
- **WHEN** the user closes the main window
- **THEN** the app follows platform convention (quit on Windows/Linux; stay in dock on macOS until explicitly quit)

### Requirement: Dev-run and packaging entry points
The system SHALL provide a documented way to run the app in development and to package a runnable desktop build.

#### Scenario: Running in development
- **WHEN** a developer runs the documented dev command
- **THEN** the Electron app launches loading the local web app

#### Scenario: Producing a build
- **WHEN** the documented build command is run
- **THEN** a runnable desktop application artifact is produced for the current platform

### Requirement: Web build remains functional
The system SHALL keep the existing browser/GitHub Pages build working unchanged; Electron is an additional target.

#### Scenario: Web build unaffected
- **WHEN** the web app is served as a static site as before
- **THEN** it runs in the browser with no dependency on Electron-only APIs
