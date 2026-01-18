# Docfork Docs Site 📚

**The source of truth for [docs.docfork.com](https://docs.docfork.com).**

This is a [Next.js](https://nextjs.org) application powered by [Fumadocs](https://fumadocs.dev). It is part of the Docfork monorepo, allowing us to generate documentation directly from our core MCP tool definitions.

## 📂 Content Structure

Documentation is written in MDX. If you want to contribute, look here:

- `content/docs/`: The main documentation tree.
- `content/blog/`: Feature updates and technical deep-dives.
- `src/`: Next.js layouts and UI components.

## 🛠️ Local Development

Because this is a monorepo, you should manage dependencies from the **root directory**.

1. **Setup** (from the repo root):
   ```bash
   pnpm install
```

2. **Start Development Server**:
You can start the docs specifically using Turborepo:
```bash
pnpm turbo dev --filter=docs
```


*The site will be available at [http://localhost:3000](http://localhost:3000).*

## 🔄 Docs-as-Code Integration

We use Fumadocs to keep our documentation in sync with the MCP server.

* **Auto-Generated Tools**: The "Available Tools" page pulls directly from `packages/mcp-server/src/tools.ts`.
* **Type Safety**: Documentation builds will fail if they reference exported TypeScript types from the core package that no longer exist.

## ✍️ Contributing

We welcome contributions!

* **Typos/Content**: Feel free to edit `.mdx` files in the `content/` directory directly via GitHub.
* **New Integrations**: If you've tested Docfork with a new MCP client (e.g. a new IDE or Agent), add it to `content/docs/integrations/`.

---

[← Back to Root README](../../README.md) | [Go to MCP Server](../../packages/mcp-server/README.md)