# Contributing Guide

## Branch Strategy
- `main`: stable branch
- Feature branches: `feat/<name>`
- Fix branches: `fix/<issue>`

## Commit Convention (Conventional Commits)
`feat: new feature` | `fix: bug fix` | `docs: documentation` | `refactor:` | `test:` | `chore:`

## Development Steps

## Headless Mode
1. Fork & Clone
2. Create branch: `git checkout -b feat/xxx`
3. Run frontend: `npm run dev`; backend: `go build -tags headless`
4. Ensure no type errors: `npm run typecheck` / `go build`
5. Commit & Push, open a PR

## GUI Mode
1. Fork & Clone
2. Create branch: `git checkout -b feat/xxx`
3. Run wails3: `wails dev
4. Ensure no type errors: `npm run typecheck` / `go build`
5. Commit & Push, open a PR

## Code Style
- Go: run `go fmt`; avoid unnecessary global variables
- TS/React: run `npm run format`; keep functional components; avoid unused deps; use theme variables; don't hardcode colors

## Tests (To Improve)
- Terminal service: add WebSocket integration tests
- AI Chat: later add provider mock

## Security
Do not commit real secrets; use environment variables or local config files.
