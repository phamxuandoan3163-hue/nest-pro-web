# Nova Nesting License REST API

Preview base URL: `https://<license-api-preview-host>/api/rest`

## Health

`GET /health`

Returns service status and does not require secrets.

## Paddle Sandbox webhook

`POST /paddle/webhook`

Verifies the Paddle `Paddle-Signature` header over the exact raw request body. Only completed transactions containing one of the configured NovaNesting Sandbox price IDs are fulfilled. The handler creates an expiring license, persists it idempotently, and emails the license key. Configure a Paddle Sandbox notification destination for `transaction.completed`.

## License activation

`POST /license/activate`

Form body:

```text
license_key=NOVA-...
instance_name=Nova%20Nesting%20AI%20-%20<stable-device-id>
```

Activates a device within the plan's limit and returns a provider-compatible response to the CEP app.

## License validation

`POST /license/validate`

Form body:

```text
license_key=NOVA-...
instance_id=<returned-instance-id>
```

Validates status, expiry, and an optional active device.

## Device deactivation

`POST /license/deactivate`

Form body:

```text
license_key=NOVA-...
instance_id=<returned-instance-id>
```

Releases a device seat.

## Required server environment variables

- `PADDLE_ENVIRONMENT=sandbox`
- `PADDLE_NOTIFICATION_SECRET`
- `DATABASE_URL`
- `LICENSE_ENCRYPTION_KEY` (32 random bytes in 64 hexadecimal characters)
- `RESEND_API_KEY`
- `LICENSE_EMAIL_FROM`
- `LICENSE_ALLOWED_ORIGINS` (explicit list; never use `*`)

The Paddle client-side token belongs only in the website's public `NEXT_PUBLIC_PADDLE_SANDBOX_CLIENT_TOKEN` variable. Never put Paddle API keys or webhook secrets in the website or Illustrator extension. Keep these routes on Preview and keep `PADDLE_ENVIRONMENT=sandbox` until Sandbox checks are complete.

The separate Lemon Squeezy MCP catalog endpoint is read-only and remains unchanged by this REST API.
