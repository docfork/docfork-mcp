<div align="center">

[![Docfork cover](https://docfork.com/cover.png)](https://docfork.com)

# Docfork MCP

**Stop hallucinations, context bloat, and outdated APIs.**

<a href="https://cursor.com/deeplink/mcp-install-dark.svg"><img src="https://cursor.com/deeplink/mcp-install-dark.svg" height="32" alt="Add to Cursor"/></a>&nbsp;&nbsp;<a href="https://app.docfork.com/signup"><img src="https://img.shields.io/badge/Get_Free_API_Key-F02A2B?style=for-the-badge&logo=fire&logoColor=white" height="32" alt="Get API Key"/></a>&nbsp;&nbsp;<a href="https://docfork.com"><img src="https://img.shields.io/badge/Read_The_Docs-181717?style=for-the-badge&logo=bookstack&logoColor=white" height="32" alt="Website"/></a>

[![NPM Downloads](https://img.shields.io/npm/dw/docfork?style=flat-square&color=333&labelColor=181717)](https://www.npmjs.com/package/docfork) [![NPM Version](https://img.shields.io/npm/v/docfork?style=flat-square&color=333&labelColor=181717)](https://www.npmjs.com/package/docfork) [![License](https://img.shields.io/npm/l/docfork?style=flat-square&color=333&labelColor=181717)](./LICENSE)

</div>

## ⚡ Why Docfork?

Standard AI models (Claude 4.5, GPT-5.1) have a knowledge cutoff. They don't know about the framework changes released last week.

**The Problem:**

- ❌ AI hallucinates syntax from year-old docs.
- ❌ AI guesses APIs that don't exist.
- ❌ Valuable coding time is lost debugging deprecated patterns.

**The Solution:**

- ✅ **Live Sync:** We pull documentation from the source automatically.
- ✅ **Private Cabinets:** Scope your search to your specific tech stack (Next.js + Supabase + Tailwind), avoiding generic results.
- ✅ **Team Ready:** Share context with your whole organization.

## 🚀 Quick Start

### 1. Get your Free API Key

Grab a free key at **[app.docfork.com](https://app.docfork.com/signup)**.

- **Free Tier:** Generous limit for individual devs.
- **Team:** 5 free seats included.
- **Pro Tier & Private Docs**: Coming soon 🚀

### 2. Install MCP

<details open>
<summary><b>Cursor (One-Click)</b></summary>

**Option A: One-Click**
[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=docfork&config=eyJ1cmwiOiJodHRwczovL21jcC5kb2Nmb3JrLmNvbS9tY3AifQ%3D%3D)

**Option B: Manual (Remote)**
Add to `Cursor Settings` > `Tools & MCP`:

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

**Option C: Manual (Local)**

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
<summary><b>Claude Code</b></summary>
<br>

**Remote:**

```bash
claude mcp add --transport http docfork https://mcp.docfork.com/mcp --header "DOCFORK_API_KEY: YOUR_API_KEY"
```

**Local:**

```bash
claude mcp add docfork -- npx -y docfork --api-key YOUR_API_KEY
```

</details>

<details>
<summary><b>OAuth Setup (Alternative)</b></summary>
<br>

Docfork supports [MCP OAuth specs](https://modelcontextprotocol.io/specification/latest/basic/authorization). Change your endpoint to use OAuth:

```diff
- "url": "https://mcp.docfork.com/mcp"
+ "url": "https://mcp.docfork.com/mcp/oauth"
```

_Note: OAuth is for remote HTTP connections only. [View OAuth Guide →](https://docs.docfork.com/core/authentication)_

</details>

**[See Setup for Opencode, Windsurf, and 30+ others →](https://docs.docfork.com/integrations/overview)**

### 3. Usage

Tell your AI to fetch specific, version-accurate documentation for your stack:

```txt
Implement a secure authentication flow using Better Auth and Supabase. use docfork
```

```txt
Create a responsive dashboard layout with Tailwind CSS and shadcn/ui. use docfork
```

### 4. Automate (Step 4)

Don't want to type `use docfork` every time? Add a rule to make your AI fetch docs automatically.

**[Add Rule to Cursor (One-Click)](https://cursor.com/link/rule?name=docfork-policy&text=You+have+access+to+the+docfork+MCP+server.+To+ensure+the+code+you+write+is+accurate+and+up-to-date%2C+you+must+follow+these+requirements%3A%0A%0A1.+Auto-Invoke%3A+Always+use+%60docfork_search_docs%60+when+asked+for+library+implementation%2C+API+setup%2C+or+debugging.%0A2.+Context+Strategy%3A%0A+++-+Search%3A+Call+%60docfork_search_docs%60.+Review+the+%60content%60+snippets+in+the+results.%0A+++-+Read%3A+Only+call+%60docfork_read_url%60+if+the+search+snippets+are+incomplete+or+you+need+the+full+file+context+for+a+complex+implementation.%0A+++-+Identity%3A+Use+the+%60docforkIdentifier%60+in+follow-up+searches+to+narrow+results+to+a+specific+library.%0A%0AIf+you+are+unsure+of+a+library%27s+latest+syntax%2C+search+with+docfork+first.)** — or [configure manually](https://docs.docfork.com/context/rules).

Once enabled, your AI will automatically fetch the latest docs when you ask questions like:

```txt
Add a Prisma schema for a multi-tenant SaaS and generate the client.
```

---

## 🛡️ The Docfork Difference: Cabinets

**Stop searching the entire internet.** Other MCP servers treat documentation like a noisy Google search. Docfork **Cabinets** hard-lock your AI to your specific stack (e.g., "Only use Tailwind v4 and React 19").

1. Create a Cabinet in your **[Dashboard](https://app.docfork.com/signup)**.
2. Add the `DOCFORK_CABINET` header to your config:

```json
{
  "mcpServers": {
    "docfork": {
      "url": "https://mcp.docfork.com/mcp",
      "headers": {
        "DOCFORK_API_KEY": "YOUR_API_KEY",
        "DOCFORK_CABINET": "my-project-stack"
      }
    }
  }
}
```

_[Learn more about Cabinet Scoping →](https://docs.docfork.com/core/cabinets)_

## 🔨 Available Tools

| Tool                  | Purpose                                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `docfork_search_docs` | **Context-Aware Search.** Respects your `DOCFORK_CABINET` header to strictly limit results to your approved tech stack. |
| `docfork_read_url`    | **The Deep Dive.** Fetches full Markdown content from a search result URL when the snippet isn't enough.                |

> [!TIP]
> **Identity First:** Use the `docforkIdentifier` (e.g., `vercel/next.js`) for **10x more accurate results**. [See usage guide →](https://docs.docfork.com/core/tools)

## 📖 Documentation & Community

- **[Installation Guides](https://docs.docfork.com/get-started/installation)** – Comprehensive setup for all IDEs.
- **[Troubleshooting](https://docs.docfork.com/troubleshooting/common-fixes)** – Fix connection or auth issues.
- **[Official Changelog](https://docfork.com/changelog)** – We ship weekly.
- **[X (Twitter)](https://x.com/docfork_ai)** – Follow for latest updates.

Found an issue? [Raise a GitHub issue](https://github.com/docfork/mcp/issues/new?labels=library&title=LIBRARY:%20) or [contact support](mailto:support@docfork.com).

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=docfork/mcp&type=Date)](https://www.star-history.com/#docfork/mcp&Date)

## ⚠️ Disclaimer

Docfork is an open, community-driven catalogue. While we review submissions, we cannot guarantee accuracy for every project listed. If you spot an issue, [raise a GitHub issue](https://github.com/docfork/mcp/issues/new?labels=library&title=LIBRARY:%20) or [contact support](mailto:support@docfork.com).

## License

MIT
