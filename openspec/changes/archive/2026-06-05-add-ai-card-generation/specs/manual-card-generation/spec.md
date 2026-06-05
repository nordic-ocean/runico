## ADDED Requirements

### Requirement: Offer a manual bring-your-own-chat transport
The system SHALL let the user generate cards using their own AI chat (e.g. ChatGPT, Claude, Gemini) as an alternative to the automatic API transport, requiring no API key or OpenRouter credit.

#### Scenario: Choosing the manual transport
- **WHEN** the user opens the add flow
- **THEN** they can choose "Use my own AI" instead of "Generate with my key"
- **AND** the manual transport is available even when no API key is configured

### Requirement: Provide a ready-to-copy prompt
The system SHALL present the canonical generation prompt (from the shared generation contract) with the user's source material embedded or clearly marked for attachment, and SHALL provide a one-tap action to copy it.

#### Scenario: Copying the prompt
- **WHEN** the user provides source material and selects the manual transport
- **THEN** the app shows the exact prompt to run, including the expected output format
- **AND** a Copy action places the full prompt on the clipboard

#### Scenario: Image source in the manual transport
- **WHEN** the source includes an image
- **THEN** the app instructs the user to attach that image alongside the copied prompt in their own chat
- **AND** does not require the app to transmit the image anywhere

### Requirement: Accept a pasted response and parse it via the shared contract
The system SHALL provide a field where the user pastes the response from their own chat, and SHALL parse it with the same parser used by the automatic transport, producing draft cards.

#### Scenario: Pasting a well-formed response
- **WHEN** the user pastes a response that matches the expected output format
- **THEN** the cards are parsed and offered as drafts in the existing review queue

#### Scenario: Pasting a chat-wrapped response
- **WHEN** the pasted text wraps the output in markdown, code fences, or surrounding prose (as chat UIs commonly do)
- **THEN** the parser still extracts the valid cards
- **AND** entries it cannot parse are skipped without failing the batch

#### Scenario: Pasting an unusable response
- **WHEN** the pasted text yields no valid cards
- **THEN** the user is shown a clear message that no cards could be read, with the chance to re-copy the prompt and try again

### Requirement: Manual transport feeds the same downstream pipeline
The system SHALL route manually generated drafts into the same draft-review and approval flow (`approveDrafts`) as the automatic transport, with no separate handling after parsing.

#### Scenario: Review parity across transports
- **WHEN** cards are produced by the manual transport
- **THEN** they appear in the existing draft-review screen
- **AND** only cards the user keeps are added to the deck, exactly as with the automatic transport
