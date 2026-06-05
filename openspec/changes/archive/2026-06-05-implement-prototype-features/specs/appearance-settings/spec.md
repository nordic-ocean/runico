## ADDED Requirements

### Requirement: Choose a canvas theme
The system SHALL let the user pick a canvas theme — Light (white), Warm (off-white), or Dark (near-black for low-light study) — and apply it across the interface.

#### Scenario: Switching theme
- **WHEN** the user selects a theme in Settings
- **THEN** the interface canvas updates to that theme

#### Scenario: Theme persists
- **WHEN** the user returns to the app after choosing a theme
- **THEN** the previously chosen theme is still applied

### Requirement: Choose the interface language
The system SHALL let the user choose the interface language from: English, Português (Brasil), Português (Portugal), Español, Русский, Italiano, and 中文. The choice SHALL translate only the interface (UI) — it SHALL NOT translate user-authored card content.

#### Scenario: Switching language translates the UI only
- **WHEN** the user selects a language in Settings
- **THEN** the interface renders in that language
- **AND** existing card content is left in the language it was authored in

#### Scenario: All seven languages available
- **WHEN** the user opens the language options in Settings
- **THEN** English, Português (Brasil), Português (Portugal), Español, Русский, Italiano, and 中文 are all selectable

#### Scenario: Language persists
- **WHEN** the user returns to the app after choosing a language
- **THEN** the previously chosen interface language is still applied
