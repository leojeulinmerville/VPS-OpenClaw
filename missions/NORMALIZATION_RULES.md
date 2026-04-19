# Mission Normalization Rules

## Goal

Convert free-form Slack mission requests into a stable minimal structure.

## Accepted input

- structured mission messages with explicit labels
- semi-structured bullets
- free-form paragraphs

## Extracted fields

- But
- Contexte
- Livrable
- Priorité
- Deadline

## Fallback behavior

If the message is free-form:
- `But` is inferred from the main request
- `Contexte` falls back to the remaining free-form content
- `Livrable` defaults to `À clarifier`
- `Priorité` defaults to `P2` unless urgency markers are detected
- `Deadline` defaults to `Non précisée`

## Mission id rule

Use a stable slug from the inferred title plus a short hash suffix.

## Output

The normalizer should produce:
- `mission_id`
- `title`
- `goal`
- `summary`
- normalized fields
- a compact Slack mission card
