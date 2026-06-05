# move-scope Specification

## Purpose
TBD - created by archiving change add-folder-move-copy. Update Purpose after archive.
## Requirements
### Requirement: Move a folder into another folder

The system SHALL allow a non-root folder, together with its entire subtree (all descendant folders and topics), to be moved into a different folder. The moved folder and every descendant SHALL keep its id, label, cards, and study history; only the moved folder's `parent`, the `depth` of the moved folder and its descendants, and the ordering of the scope list SHALL change.

#### Scenario: Move a folder with its contents
- **WHEN** the user moves folder `B` (which contains sub-folders and topics) into folder `A`
- **THEN** `B.parent` becomes `A` and `B` and all of its descendants appear under `A` in the browser
- **AND** every card and the study history of each topic inside `B` is preserved unchanged (ids are stable)

#### Scenario: Descendants move with the folder
- **WHEN** folder `B` containing topic `T` is moved into folder `A`
- **THEN** topic `T` remains a descendant of `B` and is now reachable under `A` → `B` → `T`

### Requirement: Move a topic into another folder

The system SHALL allow a single leaf topic to be moved into a different folder, preserving its id, cards, and study history.

#### Scenario: Move a topic
- **WHEN** the user moves topic `T` from folder `A` into folder `C`
- **THEN** `T.parent` becomes `C`, `T` appears under `C`, and `T`'s cards and progress are unchanged

### Requirement: Move validation keeps the hierarchy valid

The system SHALL reject any move that would corrupt the hierarchy, leaving all state unchanged. The root scope ("Everything") MUST NOT be movable. A folder MUST NOT be moved into itself or into any of its own descendants. Only a non-leaf folder MAY be a destination — a leaf topic MUST NOT receive children. A move whose destination is the scope's current parent SHALL be treated as a no-op.

#### Scenario: Cannot move the root
- **WHEN** a move of the root scope is attempted
- **THEN** the move is rejected and no scope changes

#### Scenario: Cannot create a cycle
- **WHEN** the user attempts to move folder `B` into one of `B`'s own descendants
- **THEN** the move is rejected and no scope changes

#### Scenario: Destination must be a folder
- **WHEN** the user attempts to move a scope onto a leaf topic
- **THEN** the move is rejected and no scope changes

#### Scenario: Moving into the current parent does nothing
- **WHEN** the user moves a scope into the folder that is already its parent
- **THEN** the hierarchy is unchanged (no-op)

### Requirement: Depth and ordering are recomputed after a move

After a successful move, the system SHALL set the moved scope's `depth` to one greater than its new parent's `depth` and SHALL recompute each descendant's `depth` relative to it. The flat scope list SHALL be re-ordered so the moved scope and its descendants form one contiguous block positioned under the destination folder, preserving the depth-first display ordering the browser relies on.

#### Scenario: Depth updates across the moved subtree
- **WHEN** folder `B` at depth 2 (with a child topic at depth 3) is moved under the root at depth 0
- **THEN** `B` becomes depth 1 and its child topic becomes depth 2

#### Scenario: Subtree stays contiguous and correctly placed
- **WHEN** a folder is moved into a destination that already has children
- **THEN** the moved subtree appears as one contiguous block under the destination and the browser renders it in the correct column without interleaving other scopes

### Requirement: A move persists across reloads

The system SHALL persist the result of a move through the existing session-backed scope storage so it survives a reload within the tab. Because ids are stable across a move, the moved scopes' cards, drafts, history, and label overrides SHALL remain correctly associated.

#### Scenario: Move survives reload
- **WHEN** the user moves a folder and then reloads the tab
- **THEN** the folder is still under its new parent with all its cards and progress intact

