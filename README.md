[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/docfork-docfork-mcp-badge.png)](https://mseep.ai/app/docfork-docfork-mcp)

# Docfork: 🌿 Fresh docs for your AI Code Editor

@latest docs for 9000+ libraries in your AI code editor, with a single MCP.

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-light.svg)](https://cursor.com/install-mcp?name=docfork&config=eyJjb21tYW5kIjoibnB4IC15IGRvY2ZvcmtAbGF0ZXN0In0%3D) [![Website](https://img.shields.io/badge/Website-docfork.com-%23088DCC)](https://docfork.com) [![smithery badge](https://smithery.ai/badge/@docfork/mcp)](https://smithery.ai/server/@docfork/mcp)

## ❌ The Problem: Expired Knowledge

- Out of date code & stale data
- API ghost towns & hallucinations
- Old or mismatched versions

## ✅ The Solution: Fresh docs at warp speed

- Always in sync with the latest version of docs
- Accurate descriptions and code examples
- Sub-second retrieval results in your AI code editor

Just tell Cursor to **`use docfork`**

```txt
Create a basic Next.js app with the App Router. use docfork
```

## 🛠️ Get Started in Seconds

### 📋 Requirements

- Node.js ≥ v18
- Cursor/Windsurf/Claude Desktop (any MCP client)

### ⚡ Install in Cursor

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-light.svg)](https://cursor.com/install-mcp?name=docfork&config=eyJjb21tYW5kIjoibnB4IC15IGRvY2ZvcmtAbGF0ZXN0In0%3D)

or manually:

1. `Settings` -> `Cursor Settings` -> `MCP Tools`
2. Add New MCP Server
3. Or configure per-project via `.cursor/mcp.json`

Recommended Setup:
Add this to your global `~/.cursor/mcp.json` (or per-project in `./.cursor/mcp.json`):

#### Cursor Remote Server Connection

```json
{
  "mcpServers": {
    "docfork": {
      "url": "https://mcp.docfork.com/mcp"
    }
  }
}
```

#### Cursor Local Server Connection

```json
{
  "mcpServers": {
    "docfork": {
      "command": "npx",
      "args": ["-y", "docfork"]
    }
  }
}
```

<details>
<summary>Alternative: Use Bun</summary>

```json
{
  "mcpServers": {
    "docfork": {
      "command": "bunx",
      "args": ["-y", "docfork"]
    }
  }
}
```

</details>

<details>
<summary>Alternative: Use Deno</summary>

```json
{
  "mcpServers": {
    "docfork": {
      "command": "deno",
      "args": ["run", "--allow-env", "--allow-net", "npm:docfork"]
    }
  }
}
```

</details>

</details>

<details>
<summary><b>Installing via Smithery</b></summary>

### Installing via Smithery

To install Docfork MCP Server for any client automatically via [Smithery](https://smithery.ai/server/@docfork/mcp):

```bash
npx -y @smithery/cli@latest install @docfork/mcp --client <CLIENT_NAME> --key <YOUR_SMITHERY_KEY>
```

You can find your Smithery key in the [Smithery.ai webpage](https://smithery.ai/server/@docfork/mcp).

</details>

<details>
<summary><b>Install in Windsurf</b></summary>

### Install in Windsurf

Add this to your Windsurf MCP config. See [Windsurf MCP docs](https://docs.windsurf.com/windsurf/mcp) for more info.

#### Windsurf Remote Server Connection

```json
{
  "mcpServers": {
    "docfork": {
      "serverUrl": "https://mcp.docfork.com/sse"
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
      "args": ["-y", "docfork"]
    }
  }
}
```

</details>

<details>
<summary><b>Install in VS Code</b></summary>

### Install in VS Code

Add this to your VS Code MCP config. See [VS Code MCP docs](https://code.visualstudio.com/docs/copilot/chat/mcp-servers) for more info.

#### VS Code Remote Server Connection

```json
{
  "mcpServers": {
    "docfork": {
      "type": "http",
      "url": "https://mcp.docfork.com/mcp"
    }
  }
}
```

#### VS Code Local Server Connection

```json
{
  "servers": {
    "docfork": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "docfork"]
    }
  }
}
```

</details>

<details>
<summary><b>Install in Zed</b></summary>

### Install in Zed

One-click install:
→ Get the [Docfork Extension](https://zed.dev/extensions?query=Docfork&filter=context-servers)

Or Manual config (for power users):

```json
{
  "context_servers": {
    "docfork": {
      "command": {
        "path": "npx",
        "args": ["-y", "docfork"]
      },
      "settings": {}
    }
  }
}
```

</details>

<details>
<summary><b>Install in Claude Code</b></summary>

### Install in Claude Code

Run this command. See [Claude Code MCP docs](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/tutorials#set-up-model-context-protocol-mcp) for more info.

#### Claude Code Remote Server Connection

```sh
claude mcp add --transport sse docfork https://mcp.docfork.com/sse
```

#### Claude Code Local Server Connection

```sh
claude mcp add docfork -- npx -y docfork
```

</details>

<details>
<summary><b>Install in Claude Desktop</b></summary>

### Install in Claude Desktop

Add this to your Claude Desktop `claude_desktop_config.json` file. See [Claude Desktop MCP docs](https://modelcontextprotocol.io/quickstart/user) for more info.

```json
{
  "mcpServers": {
    "docfork": {
      "command": "npx",
      "args": ["-y", "docfork"]
    }
  }
}
```

</details>

<details>
<summary><b>Install in BoltAI</b></summary>

### Install in BoltAI

Open the "Settings" page of the app, navigate to "Plugins," and enter the following JSON:

```json
{
  "mcpServers": {
    "docfork": {
      "command": "npx",
      "args": ["-y", "docfork"]
    }
  }
}
```

More info is available on [BoltAI's Documentation site](https://docs.boltai.com/docs/plugins/mcp-servers). For BoltAI on iOS, [see this guide](https://docs.boltai.com/docs/boltai-mobile/mcp-servers).

</details>

<details>
<summary><b>Using Docker</b></summary>

### Using Docker

If you prefer to run the MCP server in a Docker container:

1. **Build the Docker Image:**

   First, create a `Dockerfile` in the project root (or anywhere you prefer):

   <details>
   <summary>Click to see Dockerfile content</summary>

   ```Dockerfile
   FROM node:18-alpine

   WORKDIR /app

   # Install the latest version globally
   RUN npm install -g docfork

   # Expose default port if needed (optional, depends on MCP client interaction)
   # EXPOSE 3000

   # Default command to run the server
   CMD ["docfork"]
   ```

   </details>

   Then, build the image using a tag (e.g., `docfork-mcp`). **Make sure Docker Desktop (or the Docker daemon) is running.** Run the following command in the same directory where you saved the `Dockerfile`:

   ```bash
   docker build -t docfork .
   ```

2. **Configure Your MCP Client:**

   Update your MCP client's configuration to use the Docker command.

   _Example for a cline_mcp_settings.json:_

   ```json
   {
     "mcpServers": {
       "docfork": {
         "autoApprove": [],
         "disabled": false,
         "timeout": 60,
         "command": "docker",
         "args": ["run", "-i", "--rm", "docfork-mcp"],
         "transportType": "stdio"
       }
     }
   }
   ```

   _Note: This is an example configuration. Please refer to the specific examples for your MCP client (like Cursor, VS Code, etc.) earlier in this README to adapt the structure (e.g., `mcpServers` vs `servers`). Also, ensure the image name in `args` matches the tag used during the `docker build` command._

</details>

<details>
<summary><b>Install in Windows</b></summary>

### Install in Windows

The configuration on Windows is slightly different compared to Linux or macOS (_`Cline` is used in the example_). The same principle applies to other editors; refer to the configuration of `command` and `args`.

```json
{
  "mcpServers": {
    "github.com/docfork/mcp": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "docfork@latest"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

</details>

<details>
<summary><b>Install in Augment Code</b></summary>

### Install in Augment Code

To configure Docfork MCP in Augment Code, follow these steps:

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
            "args": ["-y", "docfork"]
        }
    ]
}
```

Once the MCP server is added, restart your editor. If you receive any errors, check the syntax to make sure closing brackets or commas are not missing.

</details>

<details>
<summary><b>Install in Roo Code</b></summary>

### Install in Roo Code

Add this to your Roo Code MCP configuration file. See [Roo Code MCP docs](https://docs.roocode.com/features/mcp/using-mcp-in-roo) for more info.

#### Roo Code Remote Server Connection

```json
{
  "mcpServers": {
    "docfork": {
      "type": "streamable-http",
      "url": "https://mcp.docfork.com/mcp"
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
      "args": ["-y", "docfork"]
    }
  }
}
```

</details>

## 🔧 Environment Variables

The Docfork MCP server supports the following environment variables:

- `DEFAULT_MINIMUM_TOKENS`: Set the minimum token count for documentation retrieval (default: 10000)

Example configuration with environment variables:

```json
{
  "mcpServers": {
    "docfork": {
      "command": "npx",
      "args": ["-y", "docfork@latest"],
      "env": {
        "DEFAULT_MINIMUM_TOKENS": "10000"
      }
    }
  }
}
```

## 🔨 Available Tools

Docfork MCP provides the following tool that LLMs can use:

- `get-library-docs`: Searches the library and returns its documentation.
  - `libraryName` (required): The name of the library to search for
  - `topic` (required): Focus the docs on a specific topic (e.g., "routing", "hooks")
  - `tokens` (optional, default 10000, max 50000): Max number of tokens to return. Values less than the configured `DEFAULT_MINIMUM_TOKENS` value or the default value of 10000 are automatically increased to that value.

## Development

Clone the project and install dependencies:

```bash
npm i
```

Build:

```bash
npm run build
```

### Local Configuration Example

```json
{
  "mcpServers": {
    "docfork": {
      "command": "npx",
      "args": ["tsx", "/path/to/folder/docfork/src/index.ts"]
    }
  }
}
```

### Testing with MCP Inspector

```bash
npx -y @modelcontextprotocol/inspector npx docfork
```

## Troubleshooting

### Module Not Found Errors

If you encounter `ERR_MODULE_NOT_FOUND`, try using `bunx` instead of `npx`:

```json
{
  "mcpServers": {
    "docfork": {
      "command": "bunx",
      "args": ["-y", "docfork"]
    }
  }
}
```

This often resolves module resolution issues in environments where `npx` doesn't properly install or resolve packages.

### ESM Resolution Issues

For errors like `Error: Cannot find module 'uriTemplate.js'`, try the `--experimental-vm-modules` flag:

```json
{
  "mcpServers": {
    "docfork": {
      "command": "npx",
      "args": ["-y", "--node-options=--experimental-vm-modules", "docfork"]
    }
  }
}
```

### Troubleshooting Common MCP Client Errors

1. Append `@latest` to the package name to pull the newest release.
2. Swap `npx` for `bunx` if the command stalls or fails.
3. Prefer Deno as a drop-in alternative when you hit bundler issues.
4. Verify you're on Node.js v18+ so `fetch` is available natively.

## ⚠️ Disclaimer

Docfork is an open, community-driven catalogue. Although we review submissions, we make no warranties—express or implied—about the accuracy, completeness, or security of any linked documentation or code. Projects listed here are created and maintained by their respective authors, not by Docfork.

If you spot content that is suspicious, inappropriate, or potentially harmful, please contact us.

By using Docfork, you agree to do so at your own discretion and risk.

## 🌟 Connect with us

Stay in the loop and meet the community:

- 🐦 Follow us on X → [@docfork_ai](https://x.com/docfork_ai) for product news and updates
- 🌐 Visit our [Website](https://docfork.com)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=docfork/mcp&type=Date)](https://www.star-history.com/#docfork/mcp&Date)

## License

MIT
