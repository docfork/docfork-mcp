# Contributing

## Setup

**Prerequisites:** Node.js ≥18, pnpm ≥9

```bash
git clone https://github.com/docfork/docfork.git
cd docfork
pnpm install
pnpm build
```

## Development

All commands run from root:

```bash
pnpm dev            # development mode
pnpm build          # build packages
pnpm lint           # lint with auto-fix
pnpm lint:check     # lint check only
pnpm format         # format with auto-fix
pnpm format:check   # format check only
pnpm typecheck      # type checking
pnpm test           # run tests
pnpm start          # start MCP server (HTTP mode)
pnpm start:stdio    # start MCP server (stdio mode)
pnpm clean          # clean build artifacts
```

## Structure

```
docfork/
├── packages/
│   └── mcp/              # mcp server
├── eslint.config.mjs     # shared config
├── prettier.config.mjs   # shared config
└── turbo.json            # build pipeline
```

## Workflow

1. Create branch from `main`
2. Make changes
3. Run `pnpm lint && pnpm typecheck && pnpm build`
4. Commit and open PR

**Publishing:** automatic via GitHub Actions on release.

**Questions?** [Open an issue](https://github.com/docfork/docfork/issues)
