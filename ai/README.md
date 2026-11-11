# TagBrush.css for AI coding agents

These files teach a coding agent to write pages for TagBrush.css: semantic HTML, the patterns that become components, forms, and theming, and not to invent classes or write layout CSS. They're generated from the guide ([`llms.txt`](../llms.txt) and [`llms/`](../llms/)), and the tests check that every pattern in it really is styled by TagBrush.css.

Each agent gets the index of every pattern, plus the details in the form that agent reads best: the Claude Code skill keeps them as references it opens when a task needs them, Cursor gets one rule per topic that it pulls in by description, and `AGENTS.md` gets everything in one file.

Run the command for your agent in your project folder.

| Agent | Install |
|---|---|
| Claude Code (skill) | `npx degit kovirlabs/tagbrush/ai/claude/tagbrush .claude/skills/tagbrush` |
| Cursor (project rules) | `npx degit kovirlabs/tagbrush/ai/cursor .cursor/rules` |
| Codex, Copilot, Gemini, Windsurf, and others that read `AGENTS.md` | `curl https://raw.githubusercontent.com/kovirlabs/tagbrush/main/ai/AGENTS.md >> AGENTS.md` |
| Claude Code without a skill | `curl https://raw.githubusercontent.com/kovirlabs/tagbrush/main/ai/AGENTS.md >> CLAUDE.md` |

If you installed TagBrush.css from npm, the same files are in `node_modules/tagbrush/ai/`.

Agents that can read links can also just be pointed at `https://kovirlabs.github.io/tagbrush/llms.txt`; it links to the detail files. For a tool that takes one file, use `https://kovirlabs.github.io/tagbrush/llms-full.txt`.
