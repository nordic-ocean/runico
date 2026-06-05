# scope-reorganization-ui Specification

## Purpose
TBD - created by archiving change add-folder-move-copy. Update Purpose after archive.
## Requirements
### Requirement: Drag-and-drop a scope onto a folder to move it

The column browser SHALL let the user drag a folder or topic and drop it onto a target folder to move it there. While dragging, the system SHALL indicate which targets are valid drop destinations, and dropping onto a valid folder SHALL perform a move (re-parent) of the dragged scope. Dropping onto an invalid target (the dragged scope itself, one of its descendants, a leaf topic, or its current parent) SHALL be a no-op with no state change.

#### Scenario: Drag a folder onto another folder
- **WHEN** the user drags folder `B` and drops it onto folder `A`
- **THEN** folder `B` is moved into folder `A`

#### Scenario: Valid drop targets are indicated while dragging
- **WHEN** the user is dragging a scope
- **THEN** folders that can receive it are visually highlighted as valid drop targets and invalid targets are not

#### Scenario: Dropping on an invalid target does nothing
- **WHEN** the user drops a folder onto one of its own descendants or onto a leaf topic
- **THEN** nothing moves and the hierarchy is unchanged

#### Scenario: Drop onto a folder's card moves into that folder
- **WHEN** the user drops a dragged scope onto a column card's body (not onto a specific child row)
- **THEN** the scope is moved into the folder that card represents, and the card highlights while it is a valid drop target

### Requirement: Each folder sorts its children independently

Each folder SHALL offer a sort of its children for display — Name (A–Z), Name (Z–A), Most cards, or Manual (insertion order) — chosen from a control inside that folder's card. The choice SHALL be remembered per folder and persisted, and SHALL reorder the DISPLAY only: the stored order is unchanged, so move and copy remain correct.

#### Scenario: Per-folder sort is independent and persisted
- **WHEN** the user sets one folder's sort to "Name (A–Z)" and another folder's sort to "Most cards"
- **THEN** each folder's children display in its own chosen order, and the choices survive a reload

#### Scenario: Sorting does not change stored order
- **WHEN** a folder is sorted by name and the user then moves or copies a scope
- **THEN** the move/copy behaves identically to manual order (the display sort does not corrupt the underlying ordering)

### Requirement: Cut, Copy, and Paste a scope via a clipboard

The system SHALL provide per-scope **Cut** and **Copy** actions and a **Paste here** action on folders. Choosing Cut or Copy SHALL place the chosen scope on an ephemeral clipboard, recording whether it is a cut or a copy. **Paste here** on a destination folder SHALL move the clipboard scope when it was cut, or duplicate it when it was copied, applying the same validation as drag-and-drop.

#### Scenario: Cut then paste moves the scope
- **WHEN** the user chooses Cut on folder `B`, then chooses Paste here on folder `A`
- **THEN** folder `B` is moved into folder `A`

#### Scenario: Copy then paste duplicates the scope
- **WHEN** the user chooses Copy on folder `B`, then chooses Paste here on folder `A`
- **THEN** a duplicate of folder `B` (with its cards) is created under folder `A` and the original remains where it was

### Requirement: Paste affordance only on valid destinations

The system SHALL offer **Paste here** only on folders that are valid destinations for the current clipboard scope. A folder that is the clipboard scope itself, a descendant of it, or (for a cut) its current parent SHALL NOT offer paste, and a leaf topic SHALL never offer paste.

#### Scenario: No paste on an invalid destination
- **WHEN** a folder is on the clipboard and the user views one of its own descendant folders
- **THEN** that descendant does not offer "Paste here"

#### Scenario: No paste onto a topic
- **WHEN** any scope is on the clipboard
- **THEN** leaf topics never offer "Paste here"

### Requirement: Clipboard state and visual feedback

While a scope is on the clipboard as a **cut**, the system SHALL visually mark that scope (e.g., dimmed) to show it will move on paste, and SHALL mark valid destination folders so the user can see where it may go. A successful paste — whether cut or copy — SHALL clear the clipboard, removing every paste affordance (inline "Paste here", footer paste, cancel options, and the cut marking). The clipboard is ephemeral and SHALL be empty after a reload. The user MAY also clear it explicitly via Cancel cut / Cancel copy.

#### Scenario: Cut source is marked
- **WHEN** the user chooses Cut on a scope
- **THEN** that scope is shown dimmed/marked until it is pasted or the clipboard is cleared

#### Scenario: Paste clears the clipboard and all paste options
- **WHEN** the user completes a paste (from either a cut or a copy)
- **THEN** the clipboard is empty, the cut marking is gone, and no folder shows a "Paste here" affordance any longer

#### Scenario: Cancel clears the clipboard
- **WHEN** the user chooses Cancel cut (next to the ⋯ on the cut item) or Cancel copy (in the ⋯ menu)
- **THEN** the clipboard is empty and all paste affordances are removed

### Requirement: Reorganization is available in the column browser

The Cut/Copy/Paste actions SHALL be available in the column browser alongside drag-and-drop, so a scope can be reorganized from the same surface used to browse it. (The separate folders-management screen described in earlier drafts is not rendered in the current app — the column browser replaced it — so no second surface is required.)

#### Scenario: Reorganize from the column browser
- **WHEN** the user uses Cut/Copy on an item and then Paste here on a folder in the column browser
- **THEN** the scope is moved or duplicated, identically to the drag-and-drop result

