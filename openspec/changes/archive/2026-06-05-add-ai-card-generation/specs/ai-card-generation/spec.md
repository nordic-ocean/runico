## ADDED Requirements

### Requirement: Single generation contract shared by all input paths
The system SHALL define one generation contract — a canonical card-generation prompt, one expected output format (a JSON array of `{ kind, q, a, regions? }`), and one parser — and SHALL reuse it for every transport (automatic API and manual paste), so identical input produces identical drafts regardless of how the response was obtained.

#### Scenario: Same parser for both transports
- **WHEN** a model response is produced by the automatic API transport or pasted from the user's own chat
- **THEN** the same parser maps it into the same draft cards
- **AND** neither transport has a separate prompt or output format

#### Scenario: Prompt is the single source of truth
- **WHEN** the generation prompt or output format changes
- **THEN** both the automatic and manual transports reflect the change without separate edits

### Requirement: Generate draft cards from source material
The system SHALL send user-provided source material to the selected OpenRouter model and produce draft flashcards from the response.

#### Scenario: Generating from pasted text
- **WHEN** the user provides source text in the add flow and starts generation
- **THEN** the system sends the text and a card-generation prompt to OpenRouter using the stored key
- **AND** the returned cards appear as drafts in the review queue

#### Scenario: Generating from an image with a vision-capable model
- **WHEN** the user provides an image and the selected model accepts image input
- **THEN** the image is included in the request
- **AND** any returned cards (including `occlusion` cards where applicable) appear as drafts

### Requirement: Automatic transport requires an available API key
The automatic (OpenRouter) transport SHALL only attempt generation when the credential availability status indicates a key is present, and SHALL otherwise direct the user to Settings or offer the manual (bring-your-own-chat) transport instead. This requirement applies only to the automatic transport; the manual transport (see `manual-card-generation`) requires no key.

#### Scenario: No key configured, automatic transport
- **WHEN** the user starts the automatic transport but no OpenRouter key is available
- **THEN** the automatic transport is not attempted
- **AND** the user is offered the manual transport or a prompt to add their key in Settings

### Requirement: Responses are parsed into Runico card shapes
The system SHALL parse the model response into the existing card shapes (`qa`, `cloze`, `rev`, and `occlusion` where supported) before presenting drafts, discarding entries it cannot parse.

#### Scenario: Well-formed structured response
- **WHEN** the model returns cards in the expected structured format
- **THEN** each valid entry is mapped to a Runico card with its kind, question, and answer fields populated

#### Scenario: Partially malformed response
- **WHEN** some entries in the response cannot be parsed into a valid card
- **THEN** the valid entries are still offered as drafts
- **AND** the unparseable entries are skipped without failing the whole batch

#### Scenario: Entirely unparseable response
- **WHEN** no entry in the response can be parsed into a valid card
- **THEN** the user is shown an error indicating no cards could be generated
- **AND** no drafts are added

### Requirement: Generated cards enter the existing review queue
The system SHALL place generated cards into the existing draft-review flow so the user reviews and approves them; no card is added to a deck without explicit approval.

#### Scenario: Review before adding
- **WHEN** generation succeeds
- **THEN** the cards are shown in the existing draft-review screen
- **AND** only cards the user keeps via the existing approve action are added to the deck

### Requirement: Generation surfaces loading and error states
The system SHALL show progress during generation and a clear, non-technical message for each failure mode without crashing the flow.

#### Scenario: In-progress feedback
- **WHEN** a generation request is in flight
- **THEN** the add flow shows a loading state and prevents duplicate submissions

#### Scenario: Rate limited or quota exceeded
- **WHEN** OpenRouter returns a rate-limit/quota error
- **THEN** the user is told to try again later and no drafts are added

#### Scenario: Network failure
- **WHEN** the request fails to reach OpenRouter
- **THEN** the user is told generation could not complete and can retry
