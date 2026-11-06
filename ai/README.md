# TagBrush.css for AI coding agents

These files teach a coding agent to write pages for TagBrush.css: semantic HTML, the few patterns that become components, forms, and theming, and not to invent classes or write layout CSS. They're generated from [`llms.txt`](../llms.txt), and the tests check that every pattern in it really is styled by TagBrush.css.

Run the command for your agent in your project folder.

| Agent | Install |
|---|---|
| Claude Code (skill) | `npx degit kovirlabs/tagbrush/ai/claude/tagbrush .claude/skills/tagbrush` |
| Cursor (project rule) | `curl --create-dirs -o .cursor/rules/tagbrush.mdc https://raw.githubusercontent.com/kovirlabs/tagbrush/main/ai/cursor/tagbrush.mdc` |
| Codex, Copilot, Gemini, Windsurf, and others that read `AGENTS.md` | `curl https://raw.githubusercontent.com/kovirlabs/tagbrush/main/ai/AGENTS.md >> AGENTS.md` |
| Claude Code without a skill | `curl https://raw.githubusercontent.com/kovirlabs/tagbrush/main/ai/AGENTS.md >> CLAUDE.md` |

If you installed TagBrush.css from npm, the same files are in `node_modules/tagbrush/ai/`.

Agents that can read links can also just be pointed at `https://kovirlabs.github.io/tagbrush/llms.txt`.
