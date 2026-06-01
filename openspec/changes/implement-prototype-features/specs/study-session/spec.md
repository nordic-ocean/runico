## ADDED Requirements

### Requirement: One card at a time with recall-then-reveal
The system SHALL present one card at a time, initially showing only the prompt (with the key idea hidden for cloze cards) so the user recalls the answer before revealing it.

#### Scenario: Prompt shown before reveal
- **WHEN** a card is presented
- **THEN** the prompt is shown with the answer hidden
- **AND** a "Show answer" action is available

#### Scenario: Revealing the answer
- **WHEN** the user activates "Show answer"
- **THEN** the answer is revealed

### Requirement: Binary self-mark after reveal, no grading scale
After the answer is revealed the system SHALL offer a single binary self-mark — "Got it" or "Missed" — plus a Pause action to leave, and SHALL NOT present any multi-level difficulty/grading scale (e.g. again/hard/good/easy). For image-occlusion cards the pass/miss is derived from the per-region right/wrong marks rather than a separate prompt.

#### Scenario: "Got it" advances and counts as passed
- **WHEN** the user chooses "Got it" on a revealed card
- **THEN** the card is recorded as passed for the sitting
- **AND** the next card is shown

#### Scenario: "Missed" advances and counts as not passed
- **WHEN** the user chooses "Missed" on a revealed card
- **THEN** the card is recorded as reviewed-but-not-passed for the sitting
- **AND** the next card is shown

#### Scenario: Pause stops and saves place
- **WHEN** the user chooses Pause
- **THEN** the session stops and the current position is saved for resume

### Requirement: Progress marker during a session
The system SHALL show the user's position within the deck (e.g. "1 of 4") during a study session.

#### Scenario: Position indicator updates
- **WHEN** the user advances to the next card
- **THEN** the progress marker reflects the new position

### Requirement: Keyboard shortcuts for study
The system SHALL support keyboard control during study: a key to reveal, Enter to mark "Got it" (advance as passed), and Esc to pause.

#### Scenario: "Got it" via keyboard
- **WHEN** the answer is revealed and the user presses Enter
- **THEN** the card is recorded as passed and the session advances

#### Scenario: Pause via keyboard
- **WHEN** the user presses Esc during a session
- **THEN** the session pauses and saves the place

### Requirement: Source link available during study
The system SHALL provide a Source link on the card so the user can open the original material (see `source-view`).

#### Scenario: Source link present
- **WHEN** a card with a known source is shown
- **THEN** a Source link labeled with the source is available in the card footer
