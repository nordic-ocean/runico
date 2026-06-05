## ADDED Requirements

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

While a scope is on the clipboard as a **cut**, the system SHALL visually mark that scope (e.g., dimmed) to show it will move on paste. A successful **cut → paste** SHALL clear the clipboard (a cut is one-shot). A **copy** MAY remain on the clipboard so it can be pasted into more than one destination. The clipboard is ephemeral and SHALL be empty after a reload.

#### Scenario: Cut source is marked
- **WHEN** the user chooses Cut on a scope
- **THEN** that scope is shown dimmed/marked until it is pasted or the clipboard is cleared

#### Scenario: Cut clipboard clears after paste
- **WHEN** the user completes a cut → paste
- **THEN** the clipboard is empty and the moved scope is no longer marked as cut

#### Scenario: Copy can be pasted repeatedly
- **WHEN** the user copies a scope and pastes it into one folder
- **THEN** the clipboard still holds the copy and the user can paste it into another folder

### Requirement: Reorganization is available in the column browser and the folders screen

The Cut/Copy/Paste actions SHALL be available both in the column browser (alongside drag-and-drop) and in the folders management screen, so a scope can be reorganized from either surface.

#### Scenario: Reorganize from the folders management screen
- **WHEN** the user opens the folders management screen and uses Cut/Copy then Paste here
- **THEN** the scope is moved or duplicated exactly as it would be from the column browser
