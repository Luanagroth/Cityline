# ID Strategy

## Official Rule

The Cityline ingestion pipeline treats normalized IDs as the single source of truth.
Local legacy IDs are not canonical.

## TransportLine

- Municipal and intermunicipal bus lines:
  - format: `line-<normalized-code>`
  - examples: `line-100`, `line-0104`, `line-610`
- Ferry lines:
  - format: `ferry-<normalized-code>`
  - example: `ferry-fb-01`

Normalization rule:
- lowercase
- remove accents
- replace non-alphanumeric separators with `-`
- trim duplicate separators

`transportMode + code` is the business identity.
`id` must be derived deterministically from that pair.

## RouteDirection

- format: `<lineId>-<type>`
- examples:
  - `line-100-outbound`
  - `ferry-fb-01-inbound`

Valid types:
- `outbound`
- `inbound`

## Stop

- format: `stop-<normalized-name>-<lat4>-<lng4>`
- example:
  - `stop-terminal-central-m26_2429-m48_6384`

Stops are deduplicated by normalized name plus rounded coordinates.

## LineStop

- format: `<directionId>-stop-<sequence>`
- example:
  - `line-100-outbound-stop-3`

## Schedule

- format: `<directionId>-<serviceDay>-<HHmm>`
- example:
  - `line-100-outbound-weekday-0620`

When an explicit collected ID is trusted and already stable, it can be reused internally during normalization, but the canonical target remains deterministic.

## StopTimePrediction

- format: `<scheduleId>-<lineStopId>-prediction`

## RoutePath

- format: `<directionId>-path-<sequence>`

## Fare

- format: `<lineId>-fare-<normalized-label-or-label-category>-<sortOrder>`
- examples:
  - `line-100-fare-tarifa-urbana-municipal-1`
  - `ferry-fb-01-fare-pedestre-pedestrian-1`

## Development Policy

- Legacy local data is disposable.
- Canonical IDs win over historical test fixtures.
- If the local database contains conflicting legacy IDs, the correct action in development is to reset transport-domain data and reimport normalized manifests.
- Do not create compatibility aliases in the API layer just to preserve old local seed IDs.
