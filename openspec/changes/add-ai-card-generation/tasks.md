## 1. Shared generation contract

- [ ] 1.1 Add a `buildPrompt({ text, image, count })` function producing the canonical prompt incl. the strict output format (`{ kind, q, a, regions? }` JSON array)
- [ ] 1.2 Keep the prompt and output format as the single source of truth used by every transport
- [ ] 1.3 Trim/cap source length before embedding to control size/cost

## 2. Shared response parser

- [ ] 2.1 Add a `parseCards(responseText)` that strips code fences/prose and extracts the JSON cards
- [ ] 2.2 Validate and map each entry to existing kinds (`qa`, `cloze`, `rev`, `occlusion`); coerce unknown kinds to `qa`
- [ ] 2.3 Drop unparseable entries without failing the batch; if none survive, return an explicit empty result
- [ ] 2.4 Ensure this exact parser is used by both the API and manual transports

## 3. Automatic transport (OpenRouter API)

- [ ] 3.1 Add a `generateViaApi({ prompt, image, model, apiKey })` that sends the prompt to OpenRouter and returns its raw response text
- [ ] 3.2 Include image input only when provided and the model is vision-capable
- [ ] 3.3 Gate this transport on the credential availability status; when no key, offer the manual transport or Settings

## 4. Manual transport (bring-your-own-chat)

- [ ] 4.1 Add a "Use my own AI" option in the add flow alongside "Generate with my key"
- [ ] 4.2 Render the canonical prompt with a Copy action (source embedded; image marked to attach in the user's chat)
- [ ] 4.3 Add a paste field for the chat response, run it through `parseCards`, and produce drafts
- [ ] 4.4 Make the manual transport fully usable with no API key configured

## 5. Wire transports into the add flow

- [ ] 5.1 Replace the static `DRAFT_QUEUE` source so both transports feed parsed cards into the existing draft queue
- [ ] 5.2 Ensure `approveDrafts` and the review screens work unchanged for cards from either transport
- [ ] 5.3 (Optional) Keep `DRAFT_QUEUE` as a no-key demo fallback for the public prototype

## 6. Model selection (Settings)

- [ ] 6.1 Add `genModel` persisted state defaulting to `google/gemini-3-flash-preview`
- [ ] 6.2 Add a model picker in Settings with a curated list including `deepseek/deepseek-v4-flash`
- [ ] 6.3 Warn when an image is supplied to a text-only model and offer to switch to a vision-capable model (automatic transport)

## 7. States & errors

- [ ] 7.1 Add a loading state to the add flow and prevent duplicate submissions
- [ ] 7.2 Handle rate-limit/quota errors (automatic transport) with a "try again later" message
- [ ] 7.3 Handle network/CORS failures (automatic transport) with a retryable error message
- [ ] 7.4 Handle "no cards generated / could not read response" with a clear empty-state message for both transports

## 8. Verification

- [ ] 8.1 Verify a real generation against OpenRouter with the default model produces reviewable drafts
- [ ] 8.2 Verify the manual transport: copy prompt → run in an external chat → paste → drafts appear
- [ ] 8.3 Verify the manual transport works with no API key configured
- [ ] 8.4 Verify approve flow adds only kept cards to the deck (both transports)
- [ ] 8.5 Verify graceful behavior with no key, an invalid key, and a malformed/unparseable response
