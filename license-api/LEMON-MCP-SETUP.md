# Nest-Pro License MCP server

This folder hosts a read-only Model Context Protocol (MCP) endpoint for the Lemon Squeezy catalog associated with Nest-Pro Laser.

## Endpoint

After deployment: `https://nest-pro-license-api.vercel.app/api/mcp`

## Tools

- `get_store_summary`
- `get_nest_pro_laser_product`
- `list_nest_pro_laser_variants`
- `audit_nest_pro_license_variants`

The endpoint is deliberately read-only and restricted to the configured store/product. It does not expose customer data, order records, raw license keys, refunds, checkout creation, or any write/update/delete action.

## Required Vercel environment variable

Add `LEMON_SQUEEZY_API_KEY` to the `nest-pro-license-api` Vercel project in the desired environment (Production, Preview, and/or Development). Use the Lemon Squeezy API key for the same Live or Test store represented by Store ID `500658`. Do not commit the key or put it inside the plugin source.

After saving the environment variable, redeploy the project.

Create/manage the key in Lemon Squeezy under **Settings → API**. Keep it in Vercel's encrypted environment variables.

## ChatGPT compatibility

ChatGPT's current published docs list custom MCP server connections for Business and Enterprise/Edu workspaces. A ChatGPT Go account may not be able to add this server in ChatGPT's Plugins/Add custom MCP server UI. In that case, the deployed endpoint can still be tested with an MCP client or connected later from a supported workspace.

## Protocol/runtime

Uses Vercel `mcp-handler` v2 and MCP SDK v2 for stateless Streamable HTTP, compatible with modern MCP clients and 2025-era Streamable HTTP clients.
