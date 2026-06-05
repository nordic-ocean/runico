# copy-scope Specification

## Purpose
TBD - created by archiving change add-folder-move-copy. Update Purpose after archive.
## Requirements
### Requirement: Copy a folder into another folder

The system SHALL allow a non-root folder to be duplicated into a destination folder. The copy SHALL deep-clone the folder, all of its sub-folders, and every card contained in its topics, assigning freshly minted ids to every cloned scope and card. The original folder and its contents SHALL remain unchanged, and the clone SHALL be placed under the destination folder.

#### Scenario: Copy a folder duplicates its whole subtree and cards
- **WHEN** the user copies folder `B` (containing sub-folders and topics with cards) into folder `A`
- **THEN** a new folder with the same structure and the same cards appears under `A`
- **AND** the cloned folder, its descendants, and every cloned card have new ids distinct from the originals
- **AND** the original folder `B` and its contents are unchanged

#### Scenario: Editing a copy does not affect the original
- **WHEN** the user copies a topic's cards and later edits a card in the copy
- **THEN** the corresponding card in the original topic is unchanged

### Requirement: Copy a topic into another folder

The system SHALL allow a single leaf topic to be duplicated into a destination folder, cloning the topic and all of its cards with fresh ids.

#### Scenario: Copy a topic
- **WHEN** the user copies topic `T` into folder `C`
- **THEN** a new topic with the same cards (new ids) appears under `C` and the original `T` is unchanged

### Requirement: Copy validation

The system SHALL reject a copy whose destination is invalid, leaving all state unchanged. The root scope MUST NOT be copyable. A folder MUST NOT be copied into itself or into any of its own descendants. Only a non-leaf folder MAY be a destination.

#### Scenario: Cannot copy into own subtree
- **WHEN** the user attempts to copy folder `B` into a descendant of `B`
- **THEN** the copy is rejected and no scope changes

#### Scenario: Destination must be a folder
- **WHEN** the user attempts to copy a scope onto a leaf topic
- **THEN** the copy is rejected and no scope changes

### Requirement: Copies get fresh ids and fresh study history

Every scope and card produced by a copy SHALL receive a newly minted id that does not collide with any existing id. Cloned scopes SHALL start with fresh study history (no prior sessions or progress), so a duplicate is studied independently of its source.

#### Scenario: Duplicate starts with no progress
- **WHEN** the user copies a topic that has study history into another folder
- **THEN** the new topic contains the same cards but shows no prior study sessions or progress

### Requirement: Name-collision disambiguation

When a copy's top-level scope would share its label with a scope already present under the destination folder, the system SHALL give the copy a disambiguating label (for example, appending a "(copy)" suffix) so the destination does not contain two siblings with identical labels.

#### Scenario: Duplicate label is disambiguated
- **WHEN** the user copies folder `B` into a folder that already contains a folder labeled `B`
- **THEN** the copy is added under a distinct label (e.g., `B (copy)`)

### Requirement: A copy persists across reloads

The system SHALL persist the cloned scopes and their cloned cards through the existing session-backed storage so the duplicate survives a reload within the tab.

#### Scenario: Copy survives reload
- **WHEN** the user copies a folder and then reloads the tab
- **THEN** the duplicated folder and its cloned cards are still present under the destination

