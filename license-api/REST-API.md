# Nest-Pro License REST API

Base URL: `https://nest-pro-license-api.vercel.app/api/rest`

## Endpoints

### Health
`GET /health`

Returns service status. Does not require secrets.

### Product catalog
`GET /products`

Returns the configured Lemon Squeezy product and its variants. Requires the Vercel environment variable `LEMON_SQUEEZY_API_KEY`. Never exposes the key.

### License validation
`POST /license/validate`

JSON body:
```json
{
  "license_key": "LICENSE-KEY",
  "instance_id": "OPTIONAL-INSTANCE-ID"
}
```

This forwards the validation request to Lemon Squeezy and returns a restricted response. It does not activate or deactivate a device, persist license keys, or create a local license database.

## Security notes

- Do not put `LEMON_SQUEEZY_API_KEY` in the browser or Illustrator plugin.
- The validate endpoint accepts public requests; apply rate limiting and abuse monitoring before relying on it for a commercial production rollout.
- Do not log request bodies or license keys.
- Use the provider's official license API behavior as the source of truth for validity and expiry.
