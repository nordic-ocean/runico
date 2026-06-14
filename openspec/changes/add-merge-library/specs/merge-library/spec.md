## ADDED Requirements

### Requirement: Merge a second library into the open one

The system SHALL allow the user, while a library (A) is open, to select a second `.runico` file (B) and fold B's contents into A. The merge SHALL be additive: every scope and card from B SHALL end up in A (subject to the duplicate-resolution step), and no content of A SHALL be removed by the merge. B's file SHALL NOT be modified. The merged result SHALL be written into A's current file through the existing auto-save path.

#### Scenario: Merging adds B's content to A
- **WHEN** the user merges file `B` into the open library `A`
- **THEN** the topics and cards from `B` appear in `A`
- **AND** every scope and card already in `A` is still present
- **AND** the file `B` on disk is unchanged

#### Scenario: Result is saved to the open file
- **WHEN** a merge completes
- **THEN** the combined library is persisted to `A`'s current file via auto-save, with no separate "save as" step

#### Scenario: Invalid file is rejected without changing the open library
- **WHEN** the user selects a file that is not a valid `.runico` library
- **THEN** the merge is rejected with an error and the open library `A` is left unchanged

### Requirement: Recursive union by label-path

The system SHALL place B's content by matching scopes against A by their effective label-path (the sequence of folder/topic labels from the root, with any custom label overrides applied), starting from B's root children. B's root scope SHALL NOT be imported as a node. For each scope in B:
- when no scope of the same kind exists at the same label-path in A, the entire subtree SHALL be grafted into A as a new sibling at that level;
- when a folder in B matches a folder at the same label-path in A, the merge SHALL recurse into their children;
- when a topic in B matches a topic at the same label-path in A, their cards SHALL be unioned (see card-level requirements).

#### Scenario: New top-level folder is added as a sibling
- **WHEN** `B` has a top-level folder whose label is not present under `A`'s root
- **THEN** that folder and its whole subtree are added beside `A`'s existing top-level folders

#### Scenario: Matching folders merge instead of duplicating
- **WHEN** `B` and `A` both contain a folder `Biology` at the same path
- **THEN** `B`'s `Biology` is not added as a second folder
- **AND** the contents of `B`'s `Biology` are merged into `A`'s existing `Biology`

#### Scenario: Matching topics union their cards
- **WHEN** `B` and `A` both contain the topic `Biology / Cells` and `B`'s copy has a card not present in `A`
- **THEN** that card is added into `A`'s `Biology / Cells` topic

#### Scenario: B's root is never added as a node
- **WHEN** any file is merged
- **THEN** no scope representing `B`'s root appears in `A`; only `B`'s root children and their descendants are considered

### Requirement: Grafted content gets fresh ids

Every scope and card brought from B into A SHALL receive a freshly minted id that does not collide with any id already in A, and all internal references (parent pointers, card-to-scope keys, label overrides, sort preferences, source references, and study-history keys) among the grafted content SHALL be remapped to the new ids so the grafted subtree is internally consistent.

#### Scenario: Grafted ids do not collide with existing ids
- **WHEN** a subtree from `B` is grafted into `A`
- **THEN** every grafted scope and card has a new id distinct from all ids already present in `A`

#### Scenario: Internal references are remapped
- **WHEN** a subtree from `B` is grafted into `A`
- **THEN** each grafted scope's parent reference points to its new parent's new id
- **AND** each grafted card is keyed under its topic's new id

### Requirement: Topic-versus-folder clash falls back to a distinct sibling

When a scope in B matches the label-path of a scope in A but the two are of different kinds (one a folder, the other a leaf topic), the system SHALL NOT union them. It SHALL instead graft B's scope as a new sibling with a disambiguating label so the destination does not contain two siblings with identical labels.

#### Scenario: Folder in B clashes with a topic in A
- **WHEN** `A` has a topic labeled `Notes` and `B` has a folder labeled `Notes` at the same path
- **THEN** `B`'s folder is added under a distinct label (for example `Notes (copy)`)
- **AND** `A`'s `Notes` topic is unchanged

### Requirement: Study history is preserved and remapped

The system SHALL carry B's study history — per-session records and per-card pass/fail records — into A, remapping their scope and card keys to the new ids. Where a topic from B is unioned into an existing A topic, B's session records for that topic SHALL be combined with A's existing session records for that topic.

#### Scenario: History travels with grafted content
- **WHEN** a topic with prior study sessions is grafted from `B` into `A`
- **THEN** the grafted topic retains its session history and per-card pass/fail records under the new ids

#### Scenario: Sessions combine for unioned topics
- **WHEN** a topic exists in both `A` and `B`, each with their own study sessions, and the two are unioned
- **THEN** the unioned topic's history contains the session records from both

### Requirement: Duplicate cards are detected by path and content

The system SHALL classify an incoming card from B as a duplicate only when both conditions hold: it lands at a topic with the same label-path as a topic in A, and its content matches a card already in that A topic. Content equality SHALL be defined as: for text cards (cloze, Q&A, reversible) the card kind together with its question and answer text; for image-occlusion cards the masked image together with its box layout. Cards that match on content but land at a different path SHALL NOT be treated as duplicates, and cards that share a path but differ in content SHALL NOT be treated as duplicates.

#### Scenario: Same path and same content is a duplicate
- **WHEN** `B` contributes a card to topic `Biology / Cells` whose kind, question, and answer match a card already in `A`'s `Biology / Cells`
- **THEN** that card is flagged as a duplicate for resolution

#### Scenario: Same content at a different path is not a duplicate
- **WHEN** `B` contributes a card with the same content as a card in `A` but under a different topic path
- **THEN** the card is added normally and is not flagged as a duplicate

#### Scenario: Same path with different content is not a duplicate
- **WHEN** `B` contributes a card under the same topic path as `A` but with different question or answer text
- **THEN** the card is added normally and is not flagged as a duplicate

#### Scenario: Occlusion duplicates compare image and boxes
- **WHEN** `B` contributes an image-occlusion card to the same topic path with the same masked image and the same box layout as one in `A`
- **THEN** the card is flagged as a duplicate for resolution

### Requirement: Duplicate-resolution step

When a merge produces one or more duplicates, the system SHALL present a resolution step before the merge is committed, listing each duplicate with its existing (A) card and incoming (B) card. For each duplicate the user SHALL be offered three actions: keep both (add the incoming card anyway), edit the incoming card (modify it before it is added), and skip the incoming card (keep only A's existing copy). No incoming card SHALL be silently discarded; the merge SHALL be committed only after the user has resolved the listed duplicates. When the user skips a duplicate, B's per-card study history for the skipped card SHALL be merged into A's surviving card.

#### Scenario: Resolution step appears only when duplicates exist
- **WHEN** a merge produces at least one duplicate
- **THEN** the resolution step is shown before the merge is committed
- **AND** when a merge produces no duplicates, the merge is committed without a resolution step

#### Scenario: Keep both adds the incoming card
- **WHEN** the user chooses "keep both" for a duplicate
- **THEN** both the existing card and the incoming card are present in `A` after the merge

#### Scenario: Edit incoming makes the card distinct
- **WHEN** the user chooses "edit incoming" and changes the card's content
- **THEN** the edited card is added to `A` and is no longer identical to the existing card

#### Scenario: Skip keeps only the existing card and merges its history
- **WHEN** the user chooses "skip" for a duplicate
- **THEN** the incoming card is not added and only `A`'s existing card remains
- **AND** `B`'s per-card study history for the skipped card is merged into `A`'s surviving card

### Requirement: Disposition of auxiliary library data

When merging, the system SHALL handle the non-card library data as follows: for scopes that are unioned into an existing A scope, A's custom label and folder-sort preference SHALL be kept; for newly grafted scopes, B's label overrides and sort preferences SHALL be carried over (remapped to new ids). Source documents referenced by grafted cards SHALL be carried over with remapped ids, honoring the existing cap on retained sources. B's trash, B's pending (unreviewed) drafts, and B's last-session marker SHALL NOT be merged; A's last-session marker SHALL be retained.

#### Scenario: Existing folder keeps A's preferences
- **WHEN** a folder from `B` is unioned into an existing `A` folder that has a custom label and sort order
- **THEN** `A`'s custom label and sort order for that folder are kept

#### Scenario: New folder carries B's preferences
- **WHEN** a folder from `B` is grafted as a new scope in `A`
- **THEN** that folder's custom label and sort order from `B` are applied under the new id

#### Scenario: Trash and drafts from B are not merged
- **WHEN** `B` contains trashed items, unreviewed drafts, and a last-session marker
- **THEN** none of these are merged into `A`
- **AND** `A`'s own last-session marker is unchanged

### Requirement: Merge entry point and source-file selection

The system SHALL expose a merge action in the top navigation, beside the Open and New actions. Invoking it SHALL let the user select a second `.runico` file using the platform's file picker (the File System Access API in the browser, the native open dialog on desktop), reading that file for merging without replacing or closing the currently-open library.

#### Scenario: Merge action is available while a library is open
- **WHEN** a library is open
- **THEN** a "Merge…" action is available in the top navigation beside Open and New

#### Scenario: Selecting B does not replace the open library
- **WHEN** the user invokes Merge and selects file `B`
- **THEN** `B` is read for merging and the currently-open library `A` remains the active, open library
