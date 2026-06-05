## ADDED Requirements

### Requirement: Home view remembers the last session
The system SHALL present a single quick-resume action on the home view that reflects the user's most recent practice.

#### Scenario: Last session surfaced on home
- **WHEN** the user returns to the home view after practicing
- **THEN** a quick-resume action referencing that practice is shown

### Requirement: Quick-resume action adapts to session state
The quick-resume action SHALL adapt its label and detail to the last session's state: Continue practice when paused mid-deck (showing cards remaining), Restart practice when the deck was finished, and Begin practice when not yet started.

#### Scenario: Paused mid-deck
- **WHEN** the last session was paused before finishing
- **THEN** the action reads "Continue practice" and shows how many cards remain

#### Scenario: Deck finished
- **WHEN** the last session completed the deck
- **THEN** the action reads "Restart practice"

#### Scenario: Not yet started
- **WHEN** there is a selected topic that has not been started
- **THEN** the action reads "Begin practice"

### Requirement: Resume returns to the exact card
When resuming a paused session the system SHALL place the user on the exact card where they stopped.

#### Scenario: Returning to the saved card
- **WHEN** the user activates Continue practice on a paused deck
- **THEN** the session opens on the card where it was paused
