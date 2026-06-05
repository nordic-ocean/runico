## ADDED Requirements

### Requirement: Default and fallback generation models
The system SHALL default to `google/gemini-3-flash-preview` for card generation and SHALL define `deepseek/deepseek-v4-flash` as a fallback option.

#### Scenario: Default model used out of the box
- **WHEN** the user has not chosen a model
- **THEN** generation uses `google/gemini-3-flash-preview`

### Requirement: User can choose the generation model
The system SHALL let the user select which OpenRouter model is used for generation from Settings, and SHALL persist that choice.

#### Scenario: Selecting a model
- **WHEN** the user picks a model in Settings
- **THEN** subsequent generations use the selected model
- **AND** the choice persists across reloads within the session

#### Scenario: Model choice is single-line to swap
- **WHEN** the selected model slug changes
- **THEN** only the request's model field changes; request construction and parsing are unaffected

### Requirement: Model capability is respected for image input
The system SHALL only include image input in a request when the selected model is vision-capable, and SHALL inform the user when an image is provided to a text-only model.

#### Scenario: Image provided to a text-only model
- **WHEN** the user supplies an image but the selected model does not accept images
- **THEN** the user is prompted to switch to a vision-capable model (e.g. the Gemini Flash default) or proceed with text only
