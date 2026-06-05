# library-browser Specification

## Purpose
TBD - created by archiving change implement-prototype-features. Update Purpose after archive.
## Requirements
### Requirement: Column browser drills through the hierarchy
The system SHALL present the library as a column browser where selecting an item opens a new column to the right, drilling subjects → folders → topics.

#### Scenario: Opening a new column on selection
- **WHEN** the user selects a subject or folder
- **THEN** a new column appears showing its children
- **AND** newly revealed columns are scrolled into view

#### Scenario: Columns show card counts
- **WHEN** a column lists scopes
- **THEN** each entry shows its total card count, and any factual new/unstudied count where applicable

### Requirement: Practice all from a column
The system SHALL provide a "Practice all" action on a column to study everything within that scope.

#### Scenario: Practicing an entire scope
- **WHEN** the user activates "Practice all" on a column
- **THEN** a study session covering that scope's cards begins

### Requirement: Topic action card
The system SHALL present a topic action card when a topic is selected, leading with its accuracy-trend, then its stats and a resume hint, and offering actions: Continue practice, Open cards, View progress, and Add more cards.

#### Scenario: Action card content
- **WHEN** the user selects a topic
- **THEN** an action card shows the accuracy trend, stats (total cards, any new/unstudied count, last studied), and the listed actions

#### Scenario: Trend falls back when history is thin
- **WHEN** a topic has too little history to draw a trend line
- **THEN** the action card shows a simple fallback marker instead of the line

