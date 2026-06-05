## ADDED Requirements

### Requirement: Add cards from dropped source material
The system SHALL let the user create cards from source material (an image, a chapter, a screenshot, or notes) by dropping, pasting, or browsing for a file into a destination topic.

#### Scenario: Providing a source
- **WHEN** the user drops or browses a file into the add flow
- **THEN** the file is accepted and shown with a thumbnail, size, and a ready indicator

#### Scenario: Naming the destination topic
- **WHEN** the user starts the add flow
- **THEN** a destination breadcrumb and a "What are you learning?" topic name are shown before drafting begins

### Requirement: Drafting feedback while cards are generated
The system SHALL show a processing state with progress that conveys the drafting stages (reading → understanding → drafting → choosing) while cards are produced.

#### Scenario: Processing indicator
- **WHEN** drafting is underway
- **THEN** a progress screen cycles through the drafting stages until drafts are ready

### Requirement: Review drafts and keep only chosen cards
The system SHALL present generated cards as drafts the user reviews one at a time with Keep, Remove, and Edit actions, and SHALL add only kept cards to the topic.

#### Scenario: Keeping and removing drafts
- **WHEN** the user reviews drafts and keeps some and removes others
- **THEN** only the kept cards are added to the topic

#### Scenario: Editing a draft before keeping
- **WHEN** the user edits a draft's content and keeps it
- **THEN** the edited version is added

#### Scenario: Completion confirmation
- **WHEN** the user finishes reviewing
- **THEN** a confirmation states how many cards were added, with actions to view the cards or return home

### Requirement: Pending drafts are surfaced for review
The system SHALL indicate when a topic has draft cards awaiting review and provide a path to review them, and SHALL guard practice until drafts are reviewed where the prototype does so.

#### Scenario: Draft indicator
- **WHEN** a topic has unreviewed drafts
- **THEN** a "new cards ready" indicator and a review action are shown

### Requirement: Manual card create, edit, and delete
The system SHALL let the user manually add, edit, and delete cards in a topic, choosing the card kind and entering its fields.

#### Scenario: Manual add
- **WHEN** the user adds a card manually with a chosen kind and content
- **THEN** the card is added to the topic

#### Scenario: Edit and delete
- **WHEN** the user edits or deletes an existing card
- **THEN** the change is reflected in the topic's cards
