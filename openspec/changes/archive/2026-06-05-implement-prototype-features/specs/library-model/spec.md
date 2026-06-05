## ADDED Requirements

### Requirement: Library hierarchy of subjects, folders, and topics
The system SHALL organize content as a hierarchy that drills from broad to specific: subjects → folders → topics, where a topic (leaf source) holds the actual cards.

#### Scenario: Drilling from subject to topic
- **WHEN** the user navigates the library
- **THEN** they can move from a subject, into a folder, down to a topic that contains cards

#### Scenario: Topic is the unit that holds cards
- **WHEN** a topic (leaf source) is opened
- **THEN** its cards are listed, and non-leaf scopes instead list their child scopes

### Requirement: Four card kinds
The system SHALL support four card kinds: cloze (a prompt with a blanked term), Q&A, reversible (front/back), and image-occlusion (regions masked over a figure).

#### Scenario: Cloze card hides its term until revealed
- **WHEN** a cloze card is shown before reveal
- **THEN** the blanked term is hidden and the surrounding text is visible

#### Scenario: Occlusion card carries masked regions
- **WHEN** an occlusion card is created
- **THEN** it stores the figure and its masked regions, each hiding one label

### Requirement: Card counts and user-driven practice
The system SHALL track, per scope, factual counts — total cards, an optional count of new/unstudied cards, and last-studied recency — and surface them in the interface. v1 SHALL NOT compute spaced-repetition schedules or algorithmic "due" dates; the user freely chooses what and when to practice.

#### Scenario: Counts shown for a scope
- **WHEN** a scope is listed
- **THEN** its total card count is shown, along with any factual new/unstudied count and last-studied recency

#### Scenario: No algorithmic scheduling gates practice
- **WHEN** the user starts practice on a scope
- **THEN** they study that scope's cards in their own time and order
- **AND** no scheduling algorithm decides which cards are "due" or withholds cards

### Requirement: All user data persists durably across restarts
The system SHALL persist all user data — the library, cards, study history, and settings — durably so it survives fully closing and reopening the app, not only reloads within a session.

#### Scenario: Edits survive a restart
- **WHEN** the user renames, adds, or deletes content and later reopens the app
- **THEN** the changes are still present

#### Scenario: History and settings persist too
- **WHEN** the user studies cards and changes settings, then reopens the app
- **THEN** the recorded history and chosen settings are retained

### Requirement: Complete state is a single portable save document
The system SHALL represent the complete user state as a single portable save document — text data (library, cards, history, settings) plus referenced media (images for occlusion figures and source pages) — so the data is self-contained and can be persisted, backed up, or moved as one unit. The concrete file format and media bundling are defined by the `local-save-file` capability.

#### Scenario: State is self-contained
- **WHEN** the complete save document is captured
- **THEN** it contains all text data and the media its cards reference, with no dependency on external storage

#### Scenario: Media referenced, not duplicated inline
- **WHEN** multiple cards reference the same figure (e.g. occlusion regions over one diagram)
- **THEN** that image is stored once and referenced by the cards, not embedded separately per card
