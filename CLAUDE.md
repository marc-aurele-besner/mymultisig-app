# CLAUDE.md

Read [AGENTS.md](./AGENTS.md) first: it holds the project overview, layout, commands, verification steps, conventions, git workflow and architecture for every agent. This file only adds what is specific to Claude Code.

## Claude Code specifics

- Project skills live in `.claude/skills/` (`adapt`, `animate`, `distill`, `frontend-design`, `task`, `typeset`, `verify`). Use `/verify` to build and drive the app headlessly before committing UI or web3 changes.
- The Claude Code plugin shipped to users is in `plugins/mymultisig` (see "Agent integrations" in AGENTS.md); it is a product, not configuration for this session.
- In a git worktree session, run git commands one at a time; chained git commands or heredocs may be refused.
- Commit messages are enforced by commitlint + husky; use Conventional Commits and do not add `Co-authored-by` or other attribution lines unless asked.
