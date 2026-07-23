# AGENTS

## Purpose
This file helps AI coding agents understand the repository structure, conventions, and common developer tasks for `npm-package-nodejs-utils-lda`.

## Project summary
- Node.js utility library published as a dual-format package.
- Sources are mirrored in `src/cjs/` for CommonJS and `src/esm/` for ESM.
- The package root exports are defined in `package.json`:
  - `require` → `./src/cjs/index.cjs`
  - `import` → `./src/esm/index.mjs`
- This repository is not transpiled; runtime code is the source code.
- The package also includes helper documentation files such as `functionsList.md`, `discordUtils.md`, `mongoUtils.md`, and `gemini-agent.md`.

## Environment and runtime notes
- Required runtime files:
  - `.env`
  - `config.json`
- Runtime folders may be created at execution time:
  - `data/`
  - `logs/`
- Crypto keys are generated automatically when needed for RSA/AES encryption.
- The repository exposes a self-hosted `/status` route and a logs dashboard. Do not overwrite these routes unless explicitly improving their behavior.

## Source structure
- `src/cjs/` - CommonJS implementation files for Node.js consumers using `require()`.
- `src/esm/` - ESM implementation files for Node.js consumers using `import`.
- `src/cjs/security/` and `src/esm/security/` - cryptography, encrypted payload middleware, anti-replay protection.
- `src/cjs/mongodb/` and `src/esm/mongodb/` - MongoDB helpers, collection wrappers, and repository abstractions.
- `src/cjs/discordUtils/` and `src/esm/discordUtils/` - Discord helpers and default slash command utilities.
- `src/cjs/router/` and `src/esm/router/` - router helpers, dashboards, firewall, request logging, and exception middleware.
- `src/cjs/storage/` and `src/esm/storage/` - file storage helpers, upload limits, and storage route configuration.
- `src/cjs/userSystem/` and `src/esm/userSystem/` - user management, validation, selectors, and role utilities.

## Important conventions
- Keep CJS and ESM versions in sync for public APIs.
- When adding exported utilities, update both `src/cjs/index.cjs` and `src/esm/index.mjs`.
- Do not introduce a build step or transpilation layer; consumers rely on source module files directly.
- Use `package.json` exports as the source of truth for runtime entrypoints.
- Preserve existing API behavior and patterns when refactoring.

## Scripts and developer workflows
- `npm test` - run Jest tests.
- `npm run update` - update dependencies via `npm-check-updates` and install.
- `npm run structure` - export repository tree to `structure.txt`.
- `src/scripts/` contains publish/unpublish helper scripts for package management.

## Documentation references
- Main README: [README.md](README.md)
- Functions index: [functionsList.md](functionsList.md)
- Discord utilities: [discordUtils.md](discordUtils.md)
- MongoDB utilities: [mongoUtils.md](mongoUtils.md)
- Gemini agent guidance: [gemini-agent.md](gemini-agent.md)

## Recommended guidance for AI agents
- When asked to implement features or fix bugs, check both CJS and ESM modules for parallel changes.
- Validate public exports against `src/cjs/index.cjs`, `src/esm/index.mjs`, and `package.json`.
- Keep changes minimal and respect the existing structure of security and router helpers.
- Prefer linking to existing documentation rather than duplicating details in code comments or commit messages.
