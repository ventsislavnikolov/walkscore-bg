# walkscore-bg

## Prerequisites

- Node.js v24.13.0 (`nvm use` to switch automatically)
- pnpm

## Getting Started

```bash
pnpm install
pnpm dev
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server (port 3000) |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm check` | Lint with BiomeJS |
| `pnpm typecheck` | TypeScript type check |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm test:e2e` | Run E2E tests (Playwright) |
| `pnpm format` | Format code with Ultracite |

## Project Structure

```text
__tests__/
  unit/         Vitest unit tests
  e2e/          Playwright E2E tests
docs/
  superpowers/  Planning docs and specs
public/         Static assets
src/            Application source
```
