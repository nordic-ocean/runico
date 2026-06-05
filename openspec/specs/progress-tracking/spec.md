# progress-tracking Specification

## Purpose
TBD - created by archiving change implement-prototype-features. Update Purpose after archive.
## Requirements
### Requirement: Per-session accuracy is the metric
The system SHALL compute and display per-session accuracy as cards passed ÷ cards reviewed for each sitting, with no scores or modelled retention.

#### Scenario: Accuracy of a sitting
- **WHEN** a sitting reviewed N cards and passed M of them
- **THEN** that sitting's accuracy is M ÷ N expressed as a percentage

### Requirement: Accuracy trend chart over a 30-day window
The system SHALL plot per-session accuracy (0–100%) over time in a rolling 30-day window, with a point per sitting, a tooltip per point (passed/reviewed and date), and a quiet empty state for windows with no sittings.

#### Scenario: Viewing the trend
- **WHEN** the user opens a topic's progress
- **THEN** a chart of per-session accuracy for the latest 30 days is shown with a point per sitting

#### Scenario: Empty window
- **WHEN** a visible 30-day window has no sittings
- **THEN** a quiet empty state is shown instead of a line

### Requirement: Paging through history by 30-day windows
The system SHALL let the user page Earlier/Later through 30-day windows across their whole history, labeling the visible date range.

#### Scenario: Paging earlier
- **WHEN** the user activates "Earlier 30 days"
- **THEN** the chart shows the prior 30-day window with its date range labeled

### Requirement: Stats summary row
The system SHALL show a stats row with the latest sitting (with a ▲/▼ change vs. the previous), the window average, and the sittings count.

#### Scenario: Reading the stats
- **WHEN** the trend is shown
- **THEN** the latest sitting, window average, and sittings count are displayed

### Requirement: Per-card drill-down
The system SHALL list every card with a mini sparkline and window pass-rate, and on selection switch the chart to that card's pass (green) / miss (red) per sitting, with a way back to the deck overview.

#### Scenario: Drilling into a card
- **WHEN** the user selects a card from the list
- **THEN** the chart switches to that card's per-sitting pass/miss
- **AND** a "Deck overview" action returns to the topic trend

### Requirement: Two entry points to progress
The system SHALL allow opening progress from a topic's action card and from the Open-cards screen (where the accuracy-trend banner doubles as a "View full performance" link).

#### Scenario: Entry from Open cards
- **WHEN** the user activates the trend banner on the Open-cards screen
- **THEN** the full performance view opens

### Requirement: Progress is reporting only
The system SHALL treat progress views as read-only reporting that never modifies the library, cards, or study history. (There is no spaced-repetition scheduling in v1, so progress cannot affect it.)

#### Scenario: Viewing does not change state
- **WHEN** the user views progress
- **THEN** no card, count, or history entry is changed as a result

