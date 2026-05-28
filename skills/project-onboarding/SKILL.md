---
name: project-onboarding
description: Generate a concise onboarding guide for any project. Covers what it does, how to start, key directories, and real gotchas. Use when someone is new to a project or evaluating an unfamiliar codebase.
metadata:
  type: project
---

# Project Onboarding

Generate an onboarding guide that prevents the next person from wasting an afternoon. Output directly to the user — do not write a file.

## Output Structure

Four sections, in Chinese. Keep it terse. Every sentence should earn its place.

### 1. 项目一句话

2-3 sentences covering: what this project does, core tech stack, where it deploys (if applicable). Go beyond surface — explain **why** the architecture looks the way it does. "Astro + React hybrid because SEO-critical landing needs zero-JS default" beats "uses Astro and React."

### 2. 快速启动

Real commands copied from `package.json` / `Cargo.toml` / `pyproject.toml` / `Makefile`. Include runtime version requirement. One block of bash, annotated.

### 3. 关键目录

Max 12 directories. Each gets a one-line comment explaining its *role in this project* — not a generic label. Bad: `src/components/ # React components`. Good: `src/components/react/ # Interactive islands, loaded via client:only`.

### 4. 常见踩坑点

This is where you add the most value. Three sources of truth, in priority order:

**A. Git history (strongest signal).** Run these before writing anything:
```bash
git log --oneline -20 | grep -i 'fix\|revert\|hotfix\|bug\|break'
git log --oneline -20 | grep -i 'gotcha\|trap\|careful\|warn\|hack\|workaround'
```
Recent fixes = recent pain. Report what broke and how it was fixed.

**B. Codebase scars.** Search for:
```bash
grep -r 'TODO\|FIXME\|HACK\|WORKAROUND\|XXX' --include='*.ts' --include='*.tsx' --include='*.py' --include='*.rs' --include='*.go' src/ 2>/dev/null | head -20
grep -r 'DO NOT\|NEVER\|WARNING\|CAREFUL' --include='*.md' . 2>/dev/null | head -10
```
These are self-documented pitfalls left by the team.

**C. Framework-specific risk patterns.** Based on the detected stack, proactively warn about well-known sharp edges. Examples of the pattern:
- Tailwind v4: JIT scanner can't resolve `${var}` in template literals → use CSS custom properties
- i18next: `i18n.language` unresolved on first render → use `window.location.pathname` for render-critical language checks
- Python: `pip install` vs `pip install -e .` — editable installs needed for local dev
- Rust: first `cargo build` downloads + compiles everything → use `cargo check` for fast iteration
- Go: forgetting `go mod tidy` after adding imports → silent CI failure
- Docker: `COPY . .` busts cache on every file change → reorder Dockerfile stages

You know these patterns from training data. Apply them — don't skip, don't fabricate.

**For every pitfall, give the fix, not just the problem.** "Docker cache breaks" is useless. "Put COPY before `npm ci` and only copy `package.json` + lockfile first" is useful.

## Quality Gate

Before outputting, verify:
- Can a new dev run the project in 10 minutes using only this guide? If not, add what's missing.
- Are all listed directories real? Delete any that don't exist.
- Is every pitfall backed by git evidence, codebase evidence, or a well-known framework risk? Delete anything speculative.
- Does this explain **why**, not just **what**?
