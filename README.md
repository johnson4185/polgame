# REPUBLIC: 543

A 2D political strategy and life-simulation game set in modern India: build a citizen
movement, hold the Jantar Mantar protest, form a party, fight a 543-seat general election,
and govern.

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run dev     # http://localhost:3000
```

No environment variables are needed — the game runs entirely in the browser and saves to
`localStorage`.

## Build

```bash
npm run build && npm start
```

## Contributing (humans & AI agents)

See [AGENTS.md](AGENTS.md) for architecture, conventions, and the parallel
Claude Code + Codex workflow, and [docs/TASKS.md](docs/TASKS.md) for the task board.
