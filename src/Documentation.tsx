import { useState } from "react";

type Tab = "features" | "setup" | "troubleshoot" | "commands" | "config" | "mcp";

interface TabInfo {
  id: Tab;
  label: string;
  icon: string;
}

const tabs: TabInfo[] = [
  { id: "features", label: "Features", icon: "⚡" },
  { id: "setup", label: "Setup & Install", icon: "🔧" },
  { id: "troubleshoot", label: "Troubleshooting", icon: "🔍" },
  { id: "commands", label: "Commands", icon: "⌘" },
  { id: "config", label: "Configuration", icon: "⚙" },
  { id: "mcp", label: "MCP Configs", icon: "🔗" },
];

const features = [
  {
    title: "CLI Command",
    desc: "Use `contextcore` command for all operations",
  },
  {
    title: "Local Backend Server",
    desc: "Runs on http://127.0.0.1:8000 by default",
  },
  {
    title: "MCP Server Integration",
    desc: "Connects with Claude Desktop, OpenCode and other MCP tools",
  },
  {
    title: "Text & Document Indexing",
    desc: "Index and search through text files and documents",
  },
  {
    title: "Image Indexing",
    desc: "CLIP-powered semantic image search",
  },
  {
    title: "Audio Transcripts",
    desc: "Whisper-powered audio indexing with transcription",
  },
  {
    title: "Video Embeddings",
    desc: "Video context and semantic search (requires ffmpeg)",
  },
  {
    title: "Codebase Context",
    desc: "Get code structure, symbols, dependencies, and file-level detail",
  },
];

const setupSteps = [
  {
    step: "1",
    title: "Quick Install (Windows PowerShell)",
    code: `irm https://raw.githubusercontent.com/lucifer-ux/SearchEmbedSDK/main/install.ps1 | iex`,
  },
  {
    step: "2",
    title: "Quick Install (macOS/Linux)",
    code: `curl -sL https://raw.githubusercontent.com/lucifer-ux/SearchEmbedSDK/main/install.sh | bash`,
  },
  {
    step: "3",
    title: "Initialize ContextCore",
    code: `contextcore init`,
  },
  {
    step: "4",
    title: "Verify Installation",
    code: `contextcore --help`,
  },
  {
    step: "5",
    title: "Check Status",
    code: `contextcore status`,
  },
];

const troubleshootingIssues = [
  {
    issue: "`contextcore` command not found",
    cause: "venv not activated or editable install not run",
    fix: "Activate venv and run `pip install -e .`",
  },
  {
    issue: "`contextcore init` fails on import errors",
    cause: "Dependencies not installed in active venv",
    fix: "Run `pip install -r requirements.txt && pip install -e .`",
  },
  {
    issue: "Server healthy, but Claude says unavailable",
    cause: "Claude using different Python environment than backend",
    fix: "Use same venv in both places, update Claude config, restart Claude",
  },
  {
    issue: "Video says `missing ffmpeg`",
    cause: "ffmpeg not installed or not resolvable in runtime",
    fix: "Install ffmpeg: `winget install Gyan.FFmpeg` (Win) or `brew install ffmpeg` (Mac)",
  },
  {
    issue: "Video says `model unavailable`",
    cause: "CLIP dependencies installed but model files not ready",
    fix: "Run `contextcore install clip`",
  },
  {
    issue: "Audio not indexing",
    cause: "Whisper missing, wrong venv, or unsupported audio file",
    fix: "Run `contextcore install audio` then `contextcore index`",
  },
  {
    issue: "Indexing results stay at zero",
    cause: "Watched folder doesn't contain supported files or wrong config",
    fix: "Check `~/.contextcore/contextcore.yaml` for correct paths",
  },
  {
    issue: "Port mismatch between backend and Claude",
    cause: "Backend and Claude config using different ports",
    fix: "Ensure both use port 8000: `CONTEXTCORE_API_BASE_URL`: `http://127.0.0.1:8000`",
  },
  {
    issue: "Old background servers still running",
    cause: "Multiple server instances running",
    fix: "Find and stop: `Get-CimInstance Win32_Process | Where-Object {$_.CommandLine -match 'uvicorn|mcp_server'}`",
  },
];

const commands = [
  { cmd: "contextcore init", desc: "First-time setup wizard" },
  { cmd: "contextcore status", desc: "Show server status and index counts" },
  { cmd: "contextcore index", desc: "Run indexing on watched directories" },
  { cmd: "contextcore index <path>", desc: "Index a specific folder" },
  { cmd: "contextcore serve", desc: "Start backend server manually" },
  { cmd: "contextcore doctor", desc: "Diagnose setup problems" },
  { cmd: "contextcore register claude-desktop", desc: "Register MCP with Claude Desktop" },
  { cmd: "contextcore register claude-code", desc: "Register MCP with Claude Code" },
  { cmd: "contextcore install clip", desc: "Install CLIP model manually" },
  { cmd: "contextcore install audio", desc: "Install Whisper audio model" },
  { cmd: "contextcore install all", desc: "Install all optional models" },
];

const configInfo = [
  {
    title: "Config Location",
    path: "~/.contextcore/contextcore.yaml",
    desc: "Main configuration file",
  },
  {
    title: "Backend Entry",
    path: "unimain.py",
    desc: "Server entry point",
  },
  {
    title: "MCP Bridge",
    path: "mcp_server.py",
    desc: "MCP server script for Claude integration",
  },
  {
    title: "Config Loader",
    path: "config.py",
    desc: "Repository configuration loader",
  },
];

const mcpConfigs = [
  {
    tool: "Claude Desktop",
    path: "~/AppData/Roaming/Claude/settings.json",
    config: {
      mcpServers: {
        contextcore: {
          command: "C:\\path\\to\\SearchEmbedSDK\\.venv\\Scripts\\python.exe",
          args: ["C:\\path\\to\\SearchEmbedSDK\\mcp_server.py"],
          cwd: "C:\\path\\to\\SearchEmbedSDK",
          env: {
            CONTEXTCORE_API_BASE_URL: "http://127.0.0.1:8000",
            CONTEXTCORE_MCP_TIMEOUT_SECONDS: "120",
          },
        },
      },
    },
  },
  {
    tool: "Claude Code (cline)",
    path: "~/AppData/Roaming/Code/User/globalStorage/saoudrizwan.cline-dev/settings/cline_mcp_settings.json",
    config: {
      mcpServers: {
        contextcore: {
          command: "C:\\path\\to\\SearchEmbedSDK\\.venv\\Scripts\\python.exe",
          args: ["C:\\path\\to\\SearchEmbedSDK\\mcp_server.py"],
          cwd: "C:\\path\\to\\SearchEmbedSDK",
          env: {
            CONTEXTCORE_API_BASE_URL: "http://127.0.0.1:8000",
          },
        },
      },
    },
  },
  {
    tool: "Cursor",
    path: "~/.cursor/mcp.json",
    config: {
      mcpServers: {
        contextcore: {
          command: "C:\\path\\to\\SearchEmbedSDK\\.venv\\Scripts\\python.exe",
          args: ["C:\\path\\to\\SearchEmbedSDK\\mcp_server.py"],
        },
      },
    },
  },
  {
    tool: "VS Code (with extension)",
    path: "~/.vscode/extensions/<extension-id>/mcp.json",
    config: "Check specific extension docs",
  },
];

const indexedFiles = [
  { path: "README.md", lines: 607, type: "markdown" },
  { path: "MCP_INTEGRATION.md", lines: 73, type: "markdown" },
  { path: "INSTALL.md", lines: 78, type: "markdown" },
  { path: "install.ps1", lines: 274, type: "powershell" },
  { path: "install.sh", lines: 240, type: "shell" },
  { path: "pyproject.toml", lines: 44, type: "toml" },
  { path: "setup.py", lines: 26, type: "python" },
  { path: "requirements.txt", lines: 32, type: "text" },
  { path: "requirements.optional.txt", lines: 24, type: "text" },
  { path: "contextcore.example.yaml", lines: 32, type: "yaml" },
  { path: "cli/__init__.py", lines: 3, type: "python" },
  { path: "cli/constants.py", lines: 6, type: "python" },
  { path: "cli/commands/__init__.py", lines: 2, type: "python" },
  { path: "core/__init__.py", lines: 17, type: "python" },
  { path: "audio_search_implementation_v2/worker.py", lines: 17, type: "python" },
  { path: "image_search_implementation_v2/config.py", lines: 34, type: "python" },
  { path: "text_search_implementation_v2/config.py", lines: 9, type: "python" },
  { path: "video_search_implementation_v2/storage/runtime_state.json", lines: 5, type: "json" },
  { path: "debug_video_extraction.py", lines: 26, type: "python" },
];

const Documentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("features");

  const renderContent = () => {
    switch (activeTab) {
      case "features":
        return (
          <div style={styles.section}>
            <div style={styles.headerRow}>
              <span style={styles.headerIcon}>⚡</span>
              <span style={styles.headerTitle}>ContextCore Features</span>
            </div>
            <p style={styles.headerDesc}>
              ContextCore is a local CLI + backend + MCP integration layer for searching text, images, audio, and video from AI tools.
            </p>
            <div style={styles.grid}>
              {features.map((f, i) => (
                <div key={i} style={styles.card}>
                  <div style={styles.cardTitle}>{f.title}</div>
                  <div style={styles.cardDesc}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case "setup":
        return (
          <div style={styles.section}>
            <div style={styles.headerRow}>
              <span style={styles.headerIcon}>🔧</span>
              <span style={styles.headerTitle}>Setup & Installation</span>
            </div>
            <div style={styles.steps}>
              {setupSteps.map((s, i) => (
                <div key={i} style={styles.stepCard}>
                  <div style={styles.stepHeader}>
                    <span style={styles.stepNum}>{s.step}</span>
                    <span style={styles.stepTitle}>{s.title}</span>
                  </div>
                  <code style={styles.codeBlock}>{s.code}</code>
                </div>
              ))}
            </div>
            <div style={styles.infoBox}>
              <strong>Prerequisites:</strong> Python 3.10+, Windows/macOS/Linux, internet for model downloads, ffmpeg (optional for video)
            </div>
          </div>
        );

      case "troubleshoot":
        return (
          <div style={styles.section}>
            <div style={styles.headerRow}>
              <span style={styles.headerIcon}>🔍</span>
              <span style={styles.headerTitle}>Troubleshooting</span>
            </div>
            <div style={styles.issuesList}>
              {troubleshootingIssues.map((t, i) => (
                <div key={i} style={styles.issueCard}>
                  <div style={styles.issueTitle}>{t.issue}</div>
                  <div style={styles.issueRow}>
                    <span style={styles.issueLabel}>Cause:</span> {t.cause}
                  </div>
                  <div style={styles.issueRow}>
                    <span style={styles.issueLabel}>Fix:</span> {t.fix}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "commands":
        return (
          <div style={styles.section}>
            <div style={styles.headerRow}>
              <span style={styles.headerIcon}>⌘</span>
              <span style={styles.headerTitle}>CLI Commands</span>
            </div>
            <div style={styles.cmdList}>
              {commands.map((c, i) => (
                <div key={i} style={styles.cmdRow}>
                  <code style={styles.cmdCode}>{c.cmd}</code>
                  <span style={styles.cmdDesc}>{c.desc}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case "config":
        return (
          <div style={styles.section}>
            <div style={styles.headerRow}>
              <span style={styles.headerIcon}>⚙</span>
              <span style={styles.headerTitle}>Configuration</span>
            </div>
            <div style={styles.configList}>
              {configInfo.map((c, i) => (
                <div key={i} style={styles.configCard}>
                  <div style={styles.configTitle}>{c.title}</div>
                  <code style={styles.configPath}>{c.path}</code>
                  <div style={styles.configDesc}>{c.desc}</div>
                </div>
              ))}
            </div>
            <div style={styles.infoBox}>
              <strong>Health Check:</strong> Test backend with <code>Invoke-WebRequest http://127.0.0.1:8000/health</code>
            </div>
          </div>
        );

      case "mcp":
        return (
          <div style={styles.section}>
            <div style={styles.headerRow}>
              <span style={styles.headerIcon}>🔗</span>
              <span style={styles.headerTitle}>MCP Configurations</span>
            </div>
            <p style={styles.headerDesc}>
              Configuration files for connecting ContextCore MCP server to various AI tools. Replace paths with your actual installation paths.
            </p>
            <div style={styles.mcpList}>
              {mcpConfigs.map((mcp, i) => (
                <div key={i} style={styles.mcpCard}>
                  <div style={styles.mcpHeader}>
                    <span style={styles.mcpTool}>{mcp.tool}</span>
                    <code style={styles.mcpPath}>{mcp.path}</code>
                  </div>
                  <pre style={styles.mcpCode}>
{JSON.stringify(mcp.config, null, 2)}
                  </pre>
                </div>
              ))}
            </div>

            <div style={{ ...styles.headerRow, marginTop: 32 }}>
              <span style={styles.headerIcon}>📁</span>
              <span style={styles.headerTitle}>Indexed Files</span>
            </div>
            <p style={styles.headerDesc}>
              Currently indexed files in the SearchEmbedSDK codebase. Use <code>contextcore index</code> to refresh.
            </p>
            <div style={styles.indexedTable}>
              <div style={styles.indexedHeader}>
                <span style={{ flex: 2 }}>Path</span>
                <span style={{ flex: 1 }}>Type</span>
                <span style={{ flex: 1 }}>Lines</span>
              </div>
              {indexedFiles.map((file, i) => (
                <div key={i} style={styles.indexedRow}>
                  <code style={{ flex: 2, ...styles.indexedPath }}>{file.path}</code>
                  <span style={{ flex: 1, ...styles.indexedType }}>{file.type}</span>
                  <span style={{ flex: 1, ...styles.indexedLines }}>{file.lines}</span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.main}>
        <div style={styles.titleRow}>
          <h1 style={styles.title}>ContextCore Documentation</h1>
          <p style={styles.subtitle}>Local CLI + Backend + MCP for multimodal search</p>
        </div>

        <div style={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.tabActive : {}),
              }}
            >
              <span style={styles.tabIcon}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div style={styles.content}>{renderContent()}</div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    background: "#0a0a0a",
    color: "#fff",
    padding: "32px 24px",
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  main: {
    maxWidth: 900,
    margin: "0 auto",
  },
  titleRow: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    margin: "0 0 8px 0",
  },
  subtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    margin: 0,
  },
  tabs: {
    display: "flex",
    gap: 8,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 16px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "rgba(255,255,255,0.7)",
    cursor: "pointer",
    fontSize: 14,
    transition: "all 0.2s",
  },
  tabActive: {
    background: "#fff",
    color: "#000",
    borderColor: "#fff",
  },
  tabIcon: {
    fontSize: 16,
  },
  content: {
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 16,
    background: "rgba(15,15,15,0.8)",
    padding: 24,
  },
  section: {},
  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 600,
  },
  headerDesc: {
    color: "rgba(255,255,255,0.7)",
    marginBottom: 24,
    lineHeight: 1.5,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: 16,
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 1.4,
  },
  steps: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    marginBottom: 20,
  },
  stepCard: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  stepHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 600,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: 600,
  },
  codeBlock: {
    display: "block",
    background: "#000",
    padding: "12px 16px",
    borderRadius: 8,
    fontSize: 13,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    color: "#9fe3b0",
    overflow: "auto",
  },
  infoBox: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 16,
    fontSize: 13,
    lineHeight: 1.5,
    color: "rgba(255,255,255,0.8)",
  },
  issuesList: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  issueCard: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#ff7a7a",
    marginBottom: 12,
  },
  issueRow: {
    fontSize: 13,
    lineHeight: 1.5,
    marginBottom: 6,
    color: "rgba(255,255,255,0.8)",
  },
  issueLabel: {
    fontWeight: 600,
    color: "rgba(255,255,255,0.9)",
  },
  cmdList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  cmdRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  cmdCode: {
    background: "#000",
    padding: "8px 12px",
    borderRadius: 6,
    fontSize: 13,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    color: "#9fe3b0",
    minWidth: 220,
  },
  cmdDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  configList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 16,
    marginBottom: 20,
  },
  configCard: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  configTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 8,
  },
  configPath: {
    display: "block",
    fontSize: 12,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    color: "#9fe3b0",
    marginBottom: 8,
  },
  configDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  mcpList: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  mcpCard: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  mcpHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  mcpTool: {
    fontSize: 15,
    fontWeight: 600,
    color: "#9fe3b0",
  },
  mcpPath: {
    fontSize: 12,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    color: "rgba(255,255,255,0.6)",
  },
  mcpCode: {
    display: "block",
    background: "#000",
    padding: "12px 16px",
    borderRadius: 8,
    fontSize: 12,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    color: "rgba(255,255,255,0.85)",
    overflow: "auto",
    margin: 0,
    whiteSpace: "pre",
  },
  indexedTable: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  indexedHeader: {
    display: "flex",
    padding: "12px 16px",
    background: "rgba(255,255,255,0.08)",
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(255,255,255,0.7)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  indexedRow: {
    display: "flex",
    padding: "10px 16px",
    fontSize: 12,
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  indexedPath: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    color: "#9fe3b0",
  },
  indexedType: {
    color: "rgba(255,255,255,0.6)",
  },
  indexedLines: {
    color: "rgba(255,255,255,0.6)",
  },
};

export default Documentation;