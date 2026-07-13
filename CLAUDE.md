# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

This is **not** an application codebase. It is "Everything Claude Code," a distributable **Claude Code plugin**: a curated collection of agents, skills, commands, hooks, rules, contexts, and MCP configs meant to be installed into other projects (via `/plugin marketplace add` + `/plugin install`, or copied manually into `~/.claude/`). Changes here are edits to *configuration and automation scripts that other Claude Code sessions will load*, not to a running service.

The one exception is `barbing-salon-website/` — a standalone static HTML/CSS/JS demo site unrelated to the plugin itself (added as a one-off example). Treat it as an isolated project if asked to touch it; it has no bearing on the plugin architecture below.

## Commands

```bash
# Run the full test suite
node tests/run-all.js

# Run a single test file directly
node tests/lib/utils.test.js
node tests/lib/package-manager.test.js
node tests/hooks/hooks.test.js
```

There is no build step, bundler, or lint config — this repo is Markdown (agents/skills/commands/rules) plus small Node.js scripts. Tests use a hand-rolled runner (plain `assert`, no Jest/Vitest), one `test(name, fn)` helper per file; `tests/run-all.js` shells out to each file and aggregates the printed `Passed:`/`Failed:` counts, so a new test file must be added to the `testFiles` array in `tests/run-all.js` to be picked up by the full run.

```bash
# Package manager detection/config (also exposed as the /setup-pm command)
node scripts/setup-package-manager.js --detect
node scripts/setup-package-manager.js --global <npm|pnpm|yarn|bun>
node scripts/setup-package-manager.js --project <npm|pnpm|yarn|bun>
```

## Architecture

### Component directories → plugin surface

Each top-level directory is a distinct Claude Code extension point, wired together by `.claude-plugin/plugin.json` (declares `commands` and `skills` paths) and `.claude-plugin/marketplace.json` (catalog entry for `/plugin marketplace add`):

- **`agents/`** — subagent definitions (frontmatter: `name`, `description`, `tools`, `model`). Delegation targets like `planner`, `architect`, `tdd-guide`, `code-reviewer`, `security-reviewer`.
- **`skills/`** — workflow/domain knowledge, each in its own directory with a `SKILL.md` (some, like `strategic-compact` and `continuous-learning`, ship a companion shell script alongside `SKILL.md`).
- **`commands/`** — slash commands (`.md` files with `description` frontmatter), e.g. `/plan`, `/tdd`, `/code-review`, `/verify`, `/setup-pm`.
- **`rules/`** — always-follow guidelines meant to be copied into `~/.claude/rules/`. Split by concern (`security.md`, `coding-style.md`, `testing.md`, `git-workflow.md`, `agents.md`, `performance.md`, `patterns.md`, `hooks.md`).
- **`hooks/hooks.json`** — the single source of truth for all `PreToolUse`/`PostToolUse`/`Stop`/`SessionStart`/`SessionEnd`/`PreCompact` hook wiring. Hook commands reference scripts via `${CLAUDE_PLUGIN_ROOT}/scripts/hooks/*.js` rather than hardcoded paths, so the plugin works regardless of install location. Simple inline hooks (console.log warnings, tmux reminders, doc-file blocking) are written as inline `node -e "..."` one-liners directly in the JSON instead of separate script files.
- **`scripts/lib/`** — shared cross-platform Node.js utilities (`utils.js` for fs/path/platform helpers, `package-manager.js` for npm/pnpm/yarn/bun detection). Everything under `scripts/` is written in plain Node.js (no TS build) specifically so hooks work identically on Windows/macOS/Linux.
- **`scripts/hooks/`** — the actual implementations invoked by `hooks/hooks.json`'s `SessionStart`/`SessionEnd`/`PreCompact` entries (`session-start.js`, `session-end.js`, `pre-compact.js`, `suggest-compact.js`, `evaluate-session.js`). These implement the "memory persistence" and "strategic compaction" features referenced in the Longform Guide.
- **`contexts/`** — dynamic system-prompt injection snippets for mode-switching (`dev.md`, `review.md`, `research.md`).
- **`mcp-configs/mcp-servers.json`** — reference MCP server configs (GitHub, Supabase, Firecrawl, memory, sequential-thinking, etc.) with `YOUR_*_HERE` placeholders — never fill these with real credentials in this repo.
- **`examples/`** — reference/template files only (`CLAUDE.md`, `user-CLAUDE.md`, `statusline.json`) showing what a *consuming* project's config should look like. Don't confuse these with this repo's own config.

### Package manager detection

`scripts/lib/package-manager.js` implements a priority chain used by hooks and the setup script: `CLAUDE_PACKAGE_MANAGER` env var → `.claude/package-manager.json` (project) → `packageManager` field in `package.json` → lockfile detection → `~/.claude/package-manager.json` (global) → first available PM. This repo's own `.claude/package-manager.json` pins `bun`.

## Conventions specific to this repo

- **Format matters more than code here.** Agents need `name`/`description`/`tools`/`model` frontmatter; skills need a `SKILL.md`; commands need `description` frontmatter. Follow the existing files in each directory as the template rather than inventing a new shape.
- **File naming**: lowercase-with-hyphens, descriptive (`tdd-workflow.md`, not `workflow.md`); the filename should match the agent/skill/command name.
- Cross-platform is a hard requirement for anything under `scripts/` and `hooks/hooks.json` — no bash-only scripts, no OS-specific path separators; use `scripts/lib/utils.js` helpers.
- Don't add new top-level `.md` files for documentation — this repo's own hook config (`hooks/hooks.json`) blocks creating stray `.md`/`.txt` files outside `README.md`/`CLAUDE.md`/`AGENTS.md`/`CONTRIBUTING.md`; consolidate into existing docs instead.
- Never commit real secrets/tokens into `mcp-configs/mcp-servers.json` or anywhere else — placeholders only.
- Conventional commit format is expected: `<type>: <description>` with types `feat, fix, refactor, docs, test, chore, perf, ci`.
