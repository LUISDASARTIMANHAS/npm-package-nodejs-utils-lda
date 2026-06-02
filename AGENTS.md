# AGENTS

## Purpose
This file helps AI coding agents understand the repository structure, conventions, and common developer tasks for `npm-package-nodejs-utils-lda`.

## Project summary
- A Node.js utility library with both CommonJS and ESM exports.
- Source files are organized under `src/cjs/` and `src/esm/`.
- The package entrypoints are:
  - `src/cjs/index.cjs` for CommonJS
  - `src/esm/index.mjs` for ESM
- The package is published from `package.json` using `exports` to load the appropriate format.

## Key conventions
- Preserve both module formats for published API changes when adding new exported utility modules.
- Keep entrypoint exports aligned between `src/cjs/index.cjs` and `src/esm/index.mjs`.
- The repository is not a transpiled build project; work directly with JavaScript sources.
- Important runtime expectations:
  - `.env` file is required
  - `config.json` is required
  - `data/` folder may be created automatically
  - RSA/AES keys are generated automatically when needed
- Do not modify the self-hosted status route `/status` or the auto-generated logs dashboard unless explicitly improving behavior.

## Common directories
- `src/cjs/` - CommonJS implementation files
- `src/esm/` - ESM implementation files
- `src/cjs/security/` and `src/esm/security/` - cryptography, encrypted payload middleware, anti-replay
- `src/cjs/mongodb/` and `src/esm/mongodb/` - MongoDB helpers
- `src/cjs/discordUtils/` and `src/esm/discordUtils/` - Discord helper utilities and default slash commands
- `src/cjs/router/` and `src/esm/router/` - router helpers, dashboard middleware, firewall, request logging
- `src/cjs/storage/` and `src/esm/storage/` - file storage helpers and upload validation
- `src/cjs/userSystem/` and `src/esm/userSystem/` - basic user system and validation helpers

## Testing and scripts
- Run tests with `npm test`.
- Update dependencies with `npm run update`.
- Generate repository tree structure with `npm run structure`.

## Documentation references
- Main README: [README.md](README.md)
- Functions index: [functionsList.md](functionsList.md)
- Discord helpers: [discordUtils.md](discordUtils.md)
- MongoDB helpers: [mongoUtils.md](mongoUtils.md)
- Gemini agent guidance: [gemini-agent.md](gemini-agent.md)

## Recommended guidance for AI agents
- When asked to add features or fix bugs, map changes across both `src/cjs/` and `src/esm/` if the change affects public exports.
- Prefer making minimal, behavior-preserving changes that follow existing module patterns.
- Verify API surface changes against `package.json` exports and the root entrypoint modules.
- For documentation updates, link to existing top-level docs rather than duplicating them.
