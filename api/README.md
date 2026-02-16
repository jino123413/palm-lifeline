# Azure Functions API Starter

This folder is a minimal Azure Functions (Node v4) starter.

## Endpoints

- `GET /api/health`
- `GET /api/version`

## Local Run

1. Install Azure Functions Core Tools v4.
2. Copy `local.settings.sample.json` to `local.settings.json`.
3. Run:

```bash
npm install
npm run start
```

Default local URLs:

- `http://localhost:7071/api/health`
- `http://localhost:7071/api/version`
