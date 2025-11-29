# Hit SDK - TypeScript

Strongly-typed TypeScript client libraries for Hit platform microservices.

## Installation


### Production (Git-based)


Add to your `package.json`:

```json
{
  "dependencies": {
    "@hit/sdk": "git+https://github.com/c0x65o/hit-sdk-typescript.git"
  }
}
```

Or pin to a specific version:

```json
{
  "dependencies": {
    "@hit/sdk": "git+https://github.com/c0x65o/hit-sdk-typescript.git#v1.0.0"
  }
}
```

### Local Development (Editable Mode)

For local development with editable mode, use npm link:

```bash
cd hit-sdk-typescript
npm link

cd your-project
npm link @hit/sdk
```

Or use a local file path in `.npmrc.local` (gitignored):

```
@hit/sdk:file=../../../hit-sdk-typescript
```

## Versioning

This SDK uses semantic versioning. Check available versions:

```bash
git ls-remote --tags https://github.com/c0x65o/hit-sdk-typescript.git
```

Pin to a specific version using tags:

```json
{
  "dependencies": {
    "@hit/sdk": "git+https://github.com/c0x65o/hit-sdk-typescript.git#v1.0.0"
  }
}
```

Or pin to a specific commit SHA:

```json
{
  "dependencies": {
    "@hit/sdk": "git+https://github.com/c0x65o/hit-sdk-typescript.git#abc123def456..."
  }
}
```

## Usage

```typescript
import { Client, Config } from "@hit/sdk";

const config = new Config({ apiUrl: "https://api.example.com" });
const client = new Client(config);

// Use client methods
const response = await client.pingPong.ping();
```

## Updating

To update to the latest version:

```bash
npm install
```

Or use the Hit CLI:

```bash
hit sdk update
```
