[![Docfork cover](https://docfork.com/cover.png)](https://docfork.com)

# Docfork MCP - Up-to-date Docs for AI Agents.

<a href="https://cursor.com/deeplink/mcp-install-dark.svg"><img src="https://cursor.com/deeplink/mcp-install-dark.svg" height="32" alt="Add to Cursor"/></a>&nbsp;&nbsp;<a href="https://app.docfork.com/signup"><img src="https://img.shields.io/badge/Get%20Free%20API%20Key-F02A2B?style=for-the-badge&logo=fire&logoColor=white" height="32" alt="Get Free API Key"/></a>

<a href="https://docfork.com"><img alt="Website" src="https://img.shields.io/badge/Website-docfork.com-blue?style=flat-square" /></a>&nbsp;&nbsp;<a href="https://www.npmjs.com/package/docfork"><img alt="npm" src="https://img.shields.io/npm/v/docfork?style=flat-square&color=red" /></a>&nbsp;&nbsp;<a href="https://www.npmjs.com/package/docfork"><img alt="npm downloads" src="https://img.shields.io/npm/dm/docfork?style=flat-square" /></a>&nbsp;&nbsp;<a href="./LICENSE"><img alt="License" src="https://img.shields.io/npm/l/docfork?style=flat-square" /></a>

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
<summary><b>Install in OpenAI Codex</b></summary>

See [OpenAI Codex](https://github.com/openai/codex) for more information.

#### Local Server Connection

```toml
[mcp_servers.docfork]
args = ["-y", "docfork", "--api-key", "YOUR_API_KEY"]
command = "npx"
startup_timeout_ms = 20_000
```

#### Remote Server Connection

```toml
[mcp_servers.docfork]
url = "https://mcp.docfork.com/mcp"
http_headers = { "DOCFORK_API_KEY" = "YOUR_API_KEY" }
```

If you see startup timeout errors, try increasing `startup_timeout_ms` to `40_000`.

</details>

<details>
<summary><b>Install in Google Antigravity</b></summary>

Add this to your Antigravity MCP config file. See [Antigravity MCP docs](https://antigravity.google/docs/mcp) for more info.

#### Google Antigravity Remote Server Connection

```json
{
  "mcpServers": {
    "docfork": {
      "serverUrl": "https://mcp.docfork.com/mcp",
      "headers": {
        "DOCFORK_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

#### Google Antigravity Local Server Connection

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
<summary><b>Install in VS Code</b></summary>

[![Install in VS Code (npx)](https://img.shields.io/badge/VS_Code-VS_Code?style=flat-square&label=Install%20Docfork%20MCP&color=0098FF)](https://insiders.vscode.dev/redirect?url=vscode%3Amcp%2Finstall%3F%7B%22name%22%3A%22docfork%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22docfork%40latest%22%5D%7D)
[![Install in VS Code Insiders (npx)](https://img.shields.io/badge/VS_Code_Insiders-VS_Code_Insiders?style=flat-square&label=Install%20Docfork%20MCP&color=24bfa5)](https://insiders.vscode.dev/redirect?url=vscode-insiders%3Amcp%2Finstall%3F%7B%22name%22%3A%22docfork%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22docfork%40latest%22%5D%7D)

Add this to your VS Code MCP config file. See [VS Code MCP docs](https://code.visualstudio.com/docs/copilot/chat/mcp-servers) for more info.

#### VS Code Remote Server Connection

```json
"mcp": {
  "servers": {
    "docfork": {
      "type": "http",
      "url": "https://mcp.docfork.com/mcp",
      "headers": {
        "DOCFORK_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

#### VS Code Local Server Connection

```json
"mcp": {
  "servers": {
    "docfork": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "docfork", "--api-key", "YOUR_API_KEY"]
    }
  }
}
```

</details>

<details>
<summary><b>Install in Kilo Code</b></summary>

You can configure the Docfork MCP server in **Kilo Code** using either the UI or by editing your project's MCP configuration file. Kilo Code supports two configuration levels: Global (`mcp_settings.json`) and Project-level (`.kilocode/mcp.json`).

### Configure via Kilo Code UI

1. Open **Kilo Code**.
2. Click the **Settings** icon in the top-right corner.
3. Navigate to **Settings → MCP Servers**.
4. Click **Add Server**.
5. Choose **HTTP Server** (Streamable HTTP Transport).
6. Enter **URL**: `https://mcp.docfork.com/mcp`
7. Add Header: **Key:** `Authorization`, **Value:** `Bearer YOUR_API_KEY`
8. Click **Save**.

### Manual Configuration

Create `.kilocode/mcp.json`:

```json
{
  "mcpServers": {
    "docfork": {
      "type": "streamable-http",
      "url": "https://mcp.docfork.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      },
      "alwaysAllow": [],
      "disabled": false
    }
  }
}
```

</details>

<details>
<summary><b>Install in Kiro</b></summary>

See [Kiro Model Context Protocol Documentation](https://kiro.dev/docs/mcp/configuration/) for details.

1. Navigate `Kiro` > `MCP Servers`
2. Add a new MCP server by clicking the `+ Add` button.
3. Paste the configuration:

```json
{
  "mcpServers": {
    "Docfork": {
      "command": "npx",
      "args": ["-y", "docfork", "--api-key", "YOUR_API_KEY"],
      "env": {},
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

4. Click `Save` to apply.

</details>

<details>
<summary><b>Install in Windsurf</b></summary>

Add this to your Windsurf MCP config file. See [Windsurf MCP docs](https://docs.windsurf.com/windsurf/cascade/mcp) for more info.

#### Windsurf Remote Server Connection

```json
{
  "mcpServers": {
    "docfork": {
      "serverUrl": "https://mcp.docfork.com/mcp",
      "headers": {
        "DOCFORK_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

#### Windsurf Local Server Connection

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
<summary><b>Install in Roo Code</b></summary>

Add this to your Roo Code MCP configuration file. See [Roo Code MCP docs](https://docs.roocode.com/features/mcp/using-mcp-in-roo) for more info.

#### Roo Code Remote Server Connection

```json
{
  "mcpServers": {
    "docfork": {
      "type": "streamable-http",
      "url": "https://mcp.docfork.com/mcp",
      "headers": {
        "DOCFORK_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

#### Roo Code Local Server Connection

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
<summary><b>Install in Trae</b></summary>

Use the Add manually feature and fill in the JSON configuration. See [Trae documentation](https://docs.trae.ai/ide/model-context-protocol?_lang=en) for more details.

#### Trae Remote Server Connection

```json
{
  "mcpServers": {
    "docfork": {
      "url": "https://mcp.docfork.com/mcp"
    }
  }
}
```

#### Trae Local Server Connection

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
<summary><b>Install in Claude Desktop</b></summary>

#### Remote Server Connection

Open Claude Desktop and navigate to Settings > Connectors > Add Custom Connector. Enter the name as `Docfork` and the remote MCP server URL as `https://mcp.docfork.com/mcp`.

#### Local Server Connection

Open Claude Desktop developer settings and edit your `claude_desktop_config.json` file. See [Claude Desktop MCP docs](https://modelcontextprotocol.io/quickstart/user) for more info.

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
<summary><b>Install in Cline</b></summary>

You can install Docfork through the [Cline MCP Server Marketplace](https://cline.bot/mcp-marketplace) by searching for _Docfork_ and clicking **Install**, or add it manually:

1. Click the MCP Servers icon in the top navigation bar → **Configure** tab → **Configure MCP Servers**. See [Cline MCP docs](https://docs.cline.bot/mcp/configuring-mcp-servers) for more info.
2. Choose **Remote Servers** tab → **Edit Configuration**.
3. Add docfork to `mcpServers`:

#### Cline Remote Server Connection

```json
{
  "mcpServers": {
    "docfork": {
      "url": "https://mcp.docfork.com/mcp",
      "type": "streamableHttp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
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

<details>
<summary><b>Install in Zed</b></summary>

It can be installed via [Zed Extensions](https://zed.dev/extensions?query=Docfork) or you can add this to your Zed `settings.json`. See [Zed Context Server docs](https://zed.dev/docs/assistant/context-servers) for more info.

```json
{
  "context_servers": {
    "Docfork": {
      "source": "custom",
      "command": "npx",
      "args": ["-y", "docfork", "--api-key", "YOUR_API_KEY"]
    }
  }
}
```

</details>

<details>
<summary><b>Install in Augment Code</b></summary>

To configure Docfork MCP in Augment Code, you can use either the graphical interface or manual configuration.

### Using the Augment Code UI

1. Click the hamburger menu.
2. Select **Settings**.
3. Navigate to the **Tools** section.
4. Click the **+ Add MCP** button.
5. Enter the following command: `npx -y docfork@latest`
6. Name the MCP: **Docfork**.
7. Click the **Add** button.

### Manual Configuration

1. Press Cmd/Ctrl Shift P or go to the hamburger menu in the Augment panel
2. Select Edit Settings
3. Under Advanced, click Edit in settings.json
4. Add the server configuration to the `mcpServers` array in the `augment.advanced` object

```json
"augment.advanced": {
  "mcpServers": [
    {
      "name": "docfork",
      "command": "npx",
      "args": ["-y", "docfork", "--api-key", "YOUR_API_KEY"]
    }
  ]
}
```

</details>

<details>
<summary><b>Install in Gemini CLI</b></summary>

See [Gemini CLI Configuration](https://google-gemini.github.io/gemini-cli/docs/tools/mcp-server.html) for details.

1. Open the Gemini CLI settings file at `~/.gemini/settings.json`
2. Add the following to the `mcpServers` object:

```json
{
  "mcpServers": {
    "docfork": {
      "httpUrl": "https://mcp.docfork.com/mcp",
      "headers": {
        "DOCFORK_API_KEY": "YOUR_API_KEY",
        "Accept": "application/json, text/event-stream"
      }
    }
  }
}
```

Or, for a local server:

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
<summary><b>Install in Amp</b></summary>

Run this command in your terminal. See [Amp MCP docs](https://ampcode.com/manual#mcp) for more info.

#### Without API Key (Basic Usage)

```sh
amp mcp add docfork https://mcp.docfork.com/mcp
```

#### With API Key (Higher Rate Limits)

```sh
amp mcp add docfork --header "DOCFORK_API_KEY=YOUR_API_KEY" https://mcp.docfork.com/mcp
```

</details>

<details>
<summary><b>Install in Qwen Coder</b></summary>

See [Qwen Coder MCP Configuration](https://qwenlm.github.io/qwen-code-docs/en/tools/mcp-server/#how-to-set-up-your-mcp-server) for details.

1. Open the Qwen Coder settings file at `~/.qwen/settings.json`
2. Add the following to the `mcpServers` object:

```json
{
  "mcpServers": {
    "docfork": {
      "httpUrl": "https://mcp.docfork.com/mcp",
      "headers": {
        "DOCFORK_API_KEY": "YOUR_API_KEY",
        "Accept": "application/json, text/event-stream"
      }
    }
  }
}
```

Or, for a local server:

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
<summary><b>Install in JetBrains AI Assistant</b></summary>

See [JetBrains AI Assistant Documentation](https://www.jetbrains.com/help/ai-assistant/configure-an-mcp-server.html) for more details.

1. In JetBrains IDEs, go to `Settings` -> `Tools` -> `AI Assistant` -> `Model Context Protocol (MCP)`
2. Click `+ Add`.
3. Click on `Command` in the top-left corner and select the As JSON option
4. Add this configuration:

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

5. Click `Apply` to save changes.

</details>

<details>
<summary><b>Using Bun or Deno</b></summary>

Use these alternatives to run the local Docfork MCP server with other runtimes.

#### Bun

```json
{
  "mcpServers": {
    "docfork": {
      "command": "bunx",
      "args": ["-y", "docfork", "--api-key", "YOUR_API_KEY"]
    }
  }
}
```

#### Deno

```json
{
  "mcpServers": {
    "docfork": {
      "command": "deno",
      "args": ["run", "--allow-env=NO_DEPRECATION,TRACE_DEPRECATION", "--allow-net", "npm:docfork"]
    }
  }
}
```

</details>

<details>
<summary><b>Using Docker</b></summary>

1. Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
RUN npm install -g docfork
CMD ["docfork"]
```

2. Build the image:

```bash
docker build -t docfork .
```

3. Configure your MCP client:

```json
{
  "mcpServers": {
    "docfork": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "docfork"],
      "transportType": "stdio"
    }
  }
}
```

</details>

<details>
<summary><b>Install Using the Desktop Extension</b></summary>

Install the [docfork.mcpb](https://github.com/docfork/docfork/tree/master/mcpb/docfork.mcpb) file and add it to your client. See [MCP bundles docs](https://github.com/anthropics/mcpb#mcp-bundles-mcpb) for more info.

</details>

<details>
<summary><b>Install in Windows</b></summary>

The configuration on Windows is slightly different. Use `cmd` to run npx:

```json
{
  "mcpServers": {
    "docfork": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "docfork", "--api-key", "YOUR_API_KEY"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

</details>

<details>
<summary><b>Install in Amazon Q Developer CLI</b></summary>

Add this to your Amazon Q Developer CLI configuration file. See [Amazon Q Developer CLI docs](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line-mcp-configuration.html) for more details.

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
<summary><b>Install in Warp</b></summary>

See [Warp Model Context Protocol Documentation](https://docs.warp.dev/knowledge-and-collaboration/mcp#adding-an-mcp-server) for details.

1. Navigate `Settings` > `AI` > `Manage MCP servers`.
2. Add a new MCP server by clicking the `+ Add` button.
3. Paste the configuration:

```json
{
  "Docfork": {
    "command": "npx",
    "args": ["-y", "docfork", "--api-key", "YOUR_API_KEY"],
    "env": {},
    "working_directory": null,
    "start_on_launch": true
  }
}
```

4. Click `Save`.

</details>

<details>
<summary><b>Install in Copilot Coding Agent</b></summary>

Add the following configuration to Repository->Settings->Copilot->Coding agent->MCP configuration:

```json
{
  "mcpServers": {
    "docfork": {
      "type": "http",
      "url": "https://mcp.docfork.com/mcp",
      "headers": {
        "DOCFORK_API_KEY": "YOUR_API_KEY"
      },
      "tools": ["query_docs", "fetch_url"]
    }
  }
}
```

See the [official GitHub documentation](https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/agents/copilot-coding-agent/extending-copilot-coding-agent-with-mcp) for more info.

</details>

<details>
<summary><b>Install in Copilot CLI</b></summary>

Open `~/.copilot/mcp-config.json` and add:

```json
{
  "mcpServers": {
    "docfork": {
      "type": "http",
      "url": "https://mcp.docfork.com/mcp",
      "headers": {
        "DOCFORK_API_KEY": "YOUR_API_KEY"
      },
      "tools": ["query_docs", "fetch_url"]
    }
  }
}
```

Or, for a local server:

```json
{
  "mcpServers": {
    "docfork": {
      "type": "local",
      "command": "npx",
      "tools": ["query_docs", "fetch_url"],
      "args": ["-y", "docfork", "--api-key", "YOUR_API_KEY"]
    }
  }
}
```

</details>

<details>
<summary><b>Install in LM Studio</b></summary>

See [LM Studio MCP Support](https://lmstudio.ai/blog/lmstudio-v0.3.17) for more information.

#### One-click install:

[![Add MCP Server docfork to LM Studio](https://files.lmstudio.ai/deeplink/mcp-install-light.svg)](https://lmstudio.ai/install-mcp?name=docfork&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImRvY2ZvcmsiXX0%3D)

#### Manual set-up:

1. Navigate to `Program` (right side) > `Install` > `Edit mcp.json`.
2. Paste the configuration:

```json
{
  "mcpServers": {
    "Docfork": {
      "command": "npx",
      "args": ["-y", "docfork", "--api-key", "YOUR_API_KEY"]
    }
  }
}
```

3. Click `Save`.

</details>

<details>
<summary><b>Install in Visual Studio 2022</b></summary>

See [Visual Studio MCP Servers documentation](https://learn.microsoft.com/visualstudio/ide/mcp-servers?view=vs-2022) for details.

```json
{
  "inputs": [],
  "servers": {
    "docfork": {
      "type": "http",
      "url": "https://mcp.docfork.com/mcp",
      "headers": {
        "DOCFORK_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

Or, for a local server:

```json
{
  "mcp": {
    "servers": {
      "docfork": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "docfork", "--api-key", "YOUR_API_KEY"]
      }
    }
  }
}
```

</details>

<details>
<summary><b>Install in Crush</b></summary>

Add this to your Crush configuration file. See [Crush MCP docs](https://github.com/charmbracelet/crush#mcps) for more info.

#### Crush Remote Server Connection (HTTP)

```json
{
  "$schema": "https://charm.land/crush.json",
  "mcp": {
    "docfork": {
      "type": "http",
      "url": "https://mcp.docfork.com/mcp",
      "headers": {
        "DOCFORK_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

#### Crush Local Server Connection

```json
{
  "$schema": "https://charm.land/crush.json",
  "mcp": {
    "docfork": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "docfork", "--api-key", "YOUR_API_KEY"]
    }
  }
}
```

</details>

<details>
<summary><b>Install in BoltAI</b></summary>

Open the "Settings" page, navigate to "Plugins," and enter:

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

See [BoltAI's Documentation](https://docs.boltai.com/docs/plugins/mcp-servers) for more info.

</details>

<details>
<summary><b>Install in Rovo Dev CLI</b></summary>

Edit your Rovo Dev CLI MCP config by running: `acli rovodev mcp`

#### Remote Server Connection

```json
{
  "mcpServers": {
    "docfork": {
      "url": "https://mcp.docfork.com/mcp"
    }
  }
}
```

#### Local Server Connection

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
<summary><b>Install in Zencoder</b></summary>

1. Go to the Zencoder menu (...)
2. Select Agent tools
3. Click on Add custom MCP
4. Add the name and configuration:

```json
{
  "command": "npx",
  "args": ["-y", "docfork", "--api-key", "YOUR_API_KEY"]
}
```

5. Click Install.

</details>

<details>
<summary><b>Install in Qodo Gen</b></summary>

See [Qodo Gen docs](https://docs.qodo.ai/qodo-documentation/qodo-gen/qodo-gen-chat/agentic-mode/agentic-tools-mcps) for more details.

1. Open Qodo Gen chat panel in VSCode or IntelliJ.
2. Click Connect more tools.
3. Click + Add new MCP.
4. Add the configuration:

#### Local Server Connection

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

#### Remote Server Connection

```json
{
  "mcpServers": {
    "docfork": {
      "url": "https://mcp.docfork.com/mcp"
    }
  }
}
```

</details>

<details>
<summary><b>Install in Perplexity Desktop</b></summary>

See [Local and Remote MCPs for Perplexity](https://www.perplexity.ai/help-center/en/articles/11502712-local-and-remote-mcps-for-perplexity) for more information.

1. Navigate `Perplexity` > `Settings`
2. Select `Connectors`.
3. Click `Add Connector`.
4. Select `Advanced`.
5. Enter Server Name: `Docfork`
6. Paste:

```json
{
  "args": ["-y", "docfork", "--api-key", "YOUR_API_KEY"],
  "command": "npx",
  "env": {}
}
```

7. Click `Save`.

</details>

<details>
<summary><b>Install in Factory</b></summary>

Factory's droid supports MCP servers through its CLI. See [Factory MCP docs](https://docs.factory.ai/cli/configuration/mcp) for more info.

#### Remote Server Connection

```sh
droid mcp add docfork https://mcp.docfork.com/mcp --type http --header "DOCFORK_API_KEY: YOUR_API_KEY"
```

#### Local Server Connection

```sh
droid mcp add docfork "npx -y docfork" --env DOCFORK_API_KEY=YOUR_API_KEY
```

</details>

<details>
<summary><b>Install in Emdash</b></summary>

[Emdash](https://github.com/generalaction/emdash) is an orchestration layer for running multiple coding agents in parallel.

**What Emdash provides:** Global toggle: Settings → MCP → "Enable Docfork MCP". Per-workspace enable: The Docfork button in the ProviderBar.

**What you still need to do:** Configure your coding agent (Codex, Claude Code, Cursor, etc.) to connect to Docfork MCP. Emdash does not modify your agent's config.

See the [Emdash repository](https://github.com/generalaction/emdash) for more information.

</details>

**[More installation guides →](https://docs.docfork.com/integrations/overview)**

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
