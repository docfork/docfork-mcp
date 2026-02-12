[![Docfork cover](https://docfork.com/cover.png)](https://docfork.com)

# Docfork MCP - Up-to-date Docs for AI Agents.

<a href="https://cursor.com/deeplink/mcp-install-dark.svg"><img src="https://cursor.com/deeplink/mcp-install-dark.svg" height="32" alt="Add to Cursor"/></a>&nbsp;&nbsp;<a href="https://app.docfork.com/signup"><img src="https://img.shields.io/badge/Get%20Free%20API%20Key-F02A2B?style=for-the-badge&logo=fire&logoColor=white" height="32" alt="Get Free API Key"/></a>

<a href="https://docfork.com"><img alt="Website" src="https://img.shields.io/badge/Website-docfork.com-blue?style=flat-square" /></a>&nbsp;&nbsp;<a href="https://www.npmjs.com/package/docfork"><img alt="npm" src="https://img.shields.io/npm/v/docfork?style=flat-square&color=red" /></a>&nbsp;&nbsp;<a href="./LICENSE"><img alt="License" src="https://img.shields.io/npm/l/docfork?style=flat-square" /></a>

**Stop hallucinations, context bloat, and outdated APIs.**

Professional developers use Docfork to enforce context isolation with project-specific **Cabinets**. By hard-locking your LLM to a verified stack, you ensure deterministic accuracy and minimal token overhead, eliminating the latency and context bloat of general-purpose indexes.

## ⚡ The Docfork Difference

Other context MCPs treat docs like a general search engine; Docfork treats it like a **deterministic build artifact**:

- **✅ Context Isolation:** Use Cabinets to hard-lock your agent to a verified stack (e.g. `Next.js` + `Better Auth`) to stop context poisoning from unwanted libraries.

- **✅ SOTA Index:** 10,000+ libraries, pre-chunked and ready. ~200ms global edge-cached retrieval for Markdown docs & code snippets.

- **✅ Team-First:** Standardize your organization's context with API keys & Cabinets so every engineer—and agent—is on the same page.

## 🚀 Quick Start

### 1. Get your Free API Key

Grab a free key at **[docfork.com](https://app.docfork.com/signup)**.

- **Free Tier:** 1,000 requests/month (per org).
- **Team:** 5 free seats included per org.
- **Pro Tier & Private Docs**: Coming soon 🚀

### 2. Install MCP

<details>
<summary><b>Install in Cursor</b></summary>

Go to: `Settings` -> `Cursor Settings` -> `MCP` -> `Add new global MCP server`

Pasting the following configuration into your Cursor `~/.cursor/mcp.json` file is the recommended approach. You may also install in a specific project by creating `.cursor/mcp.json` in your project folder. See [Cursor MCP docs](https://cursor.com/docs/context/mcp) for more info.

> Since Cursor 1.0, you can click the install buttons below for instant one-click installation.

#### Cursor Remote Server Connection

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=docfork&config=eyJ1cmwiOiJodHRwczovL21jcC5kb2Nmb3JrLmNvbS9tY3AifQ%3D%3D)

```json
{
  "mcpServers": {
    "docfork": {
      "url": "https://mcp.docfork.com/mcp",
      "headers": {
        "DOCFORK_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

#### Cursor Local Server Connection

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=docfork&config=eyJjb21tYW5kIjoibnB4IC15IGRvY2ZvcmsifQ%3D%3D)

```json
{
  "mcpServers": {
    "docfork": {
      "command": "npx",
      "args": ["-y", "docfork", "--api-key", "YOUR_API_KEY"]
    }
  }
}
```

</details>

<details>
<summary><b>Install in Claude Code</b></summary>

Run this command. See [Claude Code MCP docs](https://code.claude.com/docs/en/mcp) for more info.

#### Claude Code Local Server Connection

```sh
claude mcp add docfork -- npx -y docfork --api-key YOUR_API_KEY
```

#### Claude Code Remote Server Connection

```sh
claude mcp add --header "DOCFORK_API_KEY: YOUR_API_KEY" --transport http docfork https://mcp.docfork.com/mcp
```

</details>

<details>
<summary><b>Install in OpenCode</b></summary>

Add this to your OpenCode configuration file. See [OpenCode MCP docs](https://opencode.ai/docs/mcp-servers) for more info.

#### OpenCode Remote Server Connection

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "docfork": {
      "type": "remote",
      "url": "https://mcp.docfork.com/mcp",
      "headers": {
        "DOCFORK_API_KEY": "YOUR_API_KEY",
      },
      "enabled": true,
    },
  },
}
```

#### OpenCode Local Server Connection

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "docfork": {
      "type": "local",
      "command": ["npx", "-y", "docfork", "--api-key", "YOUR_API_KEY"],
      "enabled": true,
    },
  },
}
```

</details>

<details>
<summary><b>Install in Cline</b></summary>

Add this to your Cline `cline_mcp_settings.json` file. To access it: Click the MCP Servers icon in the top navigation bar → Select the "Configure" tab → Click "Configure MCP Servers" at the bottom. See [Cline MCP docs](https://docs.cline.bot/mcp/configuring-mcp-servers) for more info.

#### Cline Remote Server Connection

```json
{
  "mcpServers": {
    "docfork": {
      "url": "https://mcp.docfork.com/mcp",
      "type": "streamableHttp",
      "headers": {
        "DOCFORK_API_KEY": "YOUR_API_KEY"
      },
      "alwaysAllow": ["query_docs", "fetch_url"],
      "disabled": false
    }
  }
}
```

#### Cline Local Server Connection

```json
{
  "mcpServers": {
    "docfork": {
      "command": "npx",
      "args": ["-y", "docfork", "--api-key", "YOUR_API_KEY"],
      "alwaysAllow": ["query_docs", "fetch_url"],
      "disabled": false
    }
  }
}
```

</details>

**[See Setup for Windsurf, Roo Code, and 40+ others →](https://docs.docfork.com/integrations/overview)**

<details>
<summary><b>OAuth Authentication</b></summary>

Docfork supports [MCP OAuth specs](https://modelcontextprotocol.io/specification/latest/basic/authorization). Change your endpoint to use OAuth:

```diff
- "url": "https://mcp.docfork.com/mcp"
+ "url": "https://mcp.docfork.com/mcp/oauth"
```

_Note: OAuth is for remote HTTP connections only. [View OAuth Guide →](https://docs.docfork.com/core/authentication)_

</details>

### 3. Use Docfork

Tell your AI to fetch specific, version-accurate documentation for your stack:

```txt
Implement a secure authentication flow using Better Auth and Supabase. use docfork
```

### 4. Add a rule to auto-invoke Docfork MCP

Don't want to type `use docfork` every time? Add a rule to make your AI fetch docs automatically.

> [!NOTE]
> **[Add Rule to Cursor (One-Click)](<https://cursor.com/link/rule?name=docfork-policy&text=You+have+access+to+the+docfork+MCP+server.+To+ensure+the+code+you+write+is+accurate+and+up-to-date%2C+you+must+follow+these+requirements%3A%0A%0A1.+Auto-Invoke%3A+Always+use+%60query_docs%60+when+asked+for+library+implementation%2C+API+setup%2C+or+debugging.%0A2.+Context+Strategy%3A%0A+++-+Search%3A+Call+%60query_docs%60+and+review+the+content+chunks+in+the+results.%0A+++-+Fetch%3A+Only+call+%60fetch_url%60+if+the+chunks+are+incomplete+or+you+need+the+full+file+context+for+a+complex+implementation.%0A+++-+Identity%3A+%60library%60+is+required.+Start+with+a+best-guess+library+name+(e.g.%2C+%60react%60).+Once+you+identify+the+exact+repo%2C+always+switch+%60library%60+to+the+exact+%60owner%2Frepo%60+(e.g.%2C+%60facebook%2Freact%60)+for+follow-up+queries.+If+you+have+%60%2Fowner%2Frepo%60%2C+remove+the+leading+slash.%0A%0AIf+you+are+unsure+of+a+library%27s+latest+syntax%2C+search+with+docfork+first.>)**

Copy rule:

```markdown title=".cursor/rules/docfork-policy.md"
You have access to the docfork MCP server. To ensure the code you write is accurate and up-to-date, you must follow these requirements:

1. Auto-Invoke: Always use `query_docs` when asked for library implementation, API setup, or debugging.
2. Context Strategy:
   - Search: Call `query_docs` and review the content chunks in the results.
   - Fetch: Only call `fetch_url` if the chunks are incomplete or you need the full file context for a complex implementation.
   - Identity: `library` is required. Start with a best-guess library name (e.g., `react`). Once you identify the exact repo, always switch `library` to the exact `owner/repo` (e.g., `facebook/react`) for follow-up queries.

If you are unsure of a library's latest syntax, search with docfork first.
```

Once enabled, your AI will automatically fetch the latest docs when you ask questions like:

```txt
Add a Prisma schema for a multi-tenant SaaS and generate the client.
```

## 🔨 Available Tools

| Tool         | Purpose                                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `query_docs` | **Context-Aware Search.** Respects your `DOCFORK_CABINET` header to strictly limit results to your approved tech stack. |
| `fetch_url`  | **Fetch URL.** Fetches full Markdown content from a URL when chunks aren't enough.                                      |

## 📖 Documentation

- **[Installation Guides](https://docs.docfork.com/get-started/installation)** – Comprehensive setup for all IDEs.
- **[Cabinets](https://docs.docfork.com/core/cabinets)** – Context isolation and project-scoped documentation.
- **[Library Identifiers](https://docs.docfork.com/context/identifiers)** – Improve accuracy with `owner/repo` targeting.
- **[Troubleshooting](https://docs.docfork.com/troubleshooting/common-fixes)** – Fix connection or auth issues.

## 💬 Connect with Us

- **[Official Changelog](https://docfork.com/changelog)** – We are constantly shipping!
- **[X (Twitter)](https://x.com/docfork_ai)** – Follow for latest updates.
- Found an issue? [Raise a GitHub issue](https://github.com/docfork/mcp/issues/new?labels=library&title=LIBRARY:%20) or [contact support](mailto:support@docfork.com).

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=docfork/mcp&type=Date)](https://www.star-history.com/#docfork/mcp&Date)

## Disclaimer

Docfork is an open, community-driven catalogue. While we review submissions, we cannot guarantee accuracy for every project listed. If you spot an issue, [raise a GitHub issue](https://github.com/docfork/mcp/issues/new?labels=library&title=LIBRARY:%20) or [contact support](mailto:support@docfork.com).

## License

MIT
