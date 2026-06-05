## ADDED Requirements

### Requirement: Deletions move items to the trash
The system SHALL move deleted folders, topics, and cards to a trash bin instead of removing them permanently, capturing enough state to restore them later.

#### Scenario: Deleting a folder
- **WHEN** the user deletes a folder
- **THEN** the folder, all its sub-folders and topics, and their cards are removed from the library and stored as one trash entry
- **AND** they no longer appear in the browser, counts, or study decks

#### Scenario: Deleting a topic
- **WHEN** the user deletes a topic (leaf source)
- **THEN** the topic and its cards are moved to the trash as one entry

#### Scenario: Deleting a card
- **WHEN** the user deletes a single card from a topic
- **THEN** that card is moved to the trash, removed from the topic, and the topic's card count decreases

### Requirement: Restore from trash
The system SHALL let the user restore a trashed item to its original location.

#### Scenario: Restore a folder or topic
- **WHEN** the user restores a trashed folder or topic
- **THEN** it and its cards reappear in their original parent folder with their ids, structure, and cards intact
- **AND** the item is removed from the trash

#### Scenario: Restore when the original parent is gone
- **WHEN** the user restores an item whose original parent folder no longer exists
- **THEN** the item is restored under the nearest surviving ancestor (falling back to the root) rather than being lost

#### Scenario: Restore a card
- **WHEN** the user restores a trashed card and its source topic still exists
- **THEN** the card is added back to that topic and the topic's card count increases

### Requirement: Permanently delete and empty the trash
The system SHALL let the user permanently remove items from the trash, and SHALL never purge them automatically.

#### Scenario: Delete one item forever
- **WHEN** the user chooses "Delete forever" on a trash item
- **THEN** that item is removed from the trash and can no longer be restored

#### Scenario: Empty the trash
- **WHEN** the user empties the trash and confirms
- **THEN** every trash item is permanently removed

#### Scenario: Manual retention
- **WHEN** time passes while items sit in the trash
- **THEN** they are never purged automatically; they remain until restored or deleted by the user

### Requirement: Trash access and persistence
The system SHALL provide access to the trash from the top navigation and persist it with the library.

#### Scenario: Open the trash
- **WHEN** the user clicks the trash button in the top navigation
- **THEN** a Trash view lists the trashed items newest-first with restore and delete-forever actions, or shows an empty state when there are none

#### Scenario: Trash survives a restart
- **WHEN** the user has items in the trash and reloads or restarts the app
- **THEN** the trash still contains those items, and they round-trip through export/import
