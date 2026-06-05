# image-occlusion Specification

## Purpose
TBD - created by archiving change implement-prototype-features. Update Purpose after archive.
## Requirements
### Requirement: Mask regions of a figure to build occlusion cards
The system SHALL provide an editing surface over a figure where the user draws boxes that each mask one region, and each kept box becomes one occlusion card hiding that region's label.

#### Scenario: Drawing a box
- **WHEN** the user drags on the figure
- **THEN** a new mask box is created at that location

#### Scenario: A box becomes a card
- **WHEN** the user keeps a mask box
- **THEN** one occlusion card is produced that hides that region's label for recall

### Requirement: Reposition, resize, and remove boxes
The system SHALL let the user drag a box to move it, pull a corner handle to resize it, and remove a box via its close control.

#### Scenario: Moving a box
- **WHEN** the user drags an existing box
- **THEN** the box moves to the new position

#### Scenario: Resizing a box
- **WHEN** the user pulls a box's corner handle
- **THEN** the box resizes accordingly

#### Scenario: Removing a box
- **WHEN** the user activates a box's remove control
- **THEN** the box is removed and no longer produces a card

### Requirement: Editing affordances and region count
The system SHALL show an on-screen hint for the interactions and a live count of the current regions.

#### Scenario: Live region count
- **WHEN** the number of boxes changes
- **THEN** the displayed region count updates to match

