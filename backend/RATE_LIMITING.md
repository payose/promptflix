# Rate Limiting

The backend limits user-initiated OpenAI recommendation searches by anonymous `session_id`.

Homepage section recommendations do not consume user quota. They use a separate endpoint so clients cannot bypass limits with a query flag.

## Endpoints

```text
GET /api/movies/search/stream?query=...&filter=...
```

Charges quota only on backend cache misses.

```text
GET /api/movies/sections/stream?query=...&filter=...
```

Never charges user quota.

## Configuration

Set these in the backend environment:

```bash
RATE_LIMIT_PER_HOUR=5
RATE_LIMIT_PER_DAY=10
SEARCH_CACHE_TTL_SECONDS=86400
SEARCH_CACHE_MAX_ITEMS=1000
```

`RATE_LIMIT_PER_DAY` must be greater than or equal to `RATE_LIMIT_PER_HOUR`.

## Cache Behavior

Search results use an in-memory TTL cache. Default lifetime is 24 hours.

The cache is cleared when:

- the backend process restarts
- a different worker handles the request
- `/api/cache/search` or `/api/cache/all` is called

Use Redis or a database-backed cache if cached results must survive restarts or multiple workers.

## Response Shape

The stream sends a `rate_limit` event before result events, and repeats the same object on `initial`, `complete`, `done`, and `error` events.

```json
{
  "type": "rate_limit",
  "rate_limit": {
    "quota": {
      "hourLimit": 5,
      "hourRemaining": 4,
      "hourReset": 1713981600,
      "dayLimit": 10,
      "dayRemaining": 9,
      "dayReset": 1714003199
    },
    "status": "ok",
    "message": null,
    "limitType": null,
    "retryAfter": null,
    "quotaConsumed": true
  }
}
```

`status` values:

- `ok`: no user-facing message
- `warning`: `message` explains the user is close to a limit
- `exceeded`: stream emits an `error` event with a retry time

Example warning:

```json
{
  "status": "warning",
  "message": "You're close to your hourly search limit. 1 search left until 3:45 PM.",
  "limitType": "per_hour",
  "quotaConsumed": true
}
```

Example exceeded message:

```json
{
  "status": "exceeded",
  "message": "You have exceeded your hourly search limit. Try again at 3:45 PM.",
  "limitType": "per_hour",
  "retryAfter": 1200,
  "quotaConsumed": false
}
```

## Caveats

The current limiter is in-memory and process-local. It is acceptable for a single-process MVP, but production deployments with multiple workers or instances should move counters to Redis.
