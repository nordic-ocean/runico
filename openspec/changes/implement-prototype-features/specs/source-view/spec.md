## ADDED Requirements

### Requirement: Cards remember their source
The system SHALL associate each card with the original material it was created from, so the source can be reopened later.

#### Scenario: Source retained on a card
- **WHEN** a card is created from source material
- **THEN** the card retains a reference to that source

### Requirement: Open the source as a book page
The system SHALL open a card's source as a readable book-style page — flowing prose around the figure — when the user activates the Source action.

#### Scenario: Opening the source
- **WHEN** the user activates Source on a card
- **THEN** the original material opens as a titled book-style page with prose and any embedded figure and caption

### Requirement: Studied term highlighted in context
The system SHALL highlight the studied term inline within the source page so the user sees it in context.

#### Scenario: Term highlighted
- **WHEN** the source page is shown for a card
- **THEN** the card's studied term is highlighted in place within the prose
