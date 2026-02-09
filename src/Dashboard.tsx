import { useState } from "react";

const API_BASE_URL = " https://pengu1n-bot.peng1n.workers.dev";
const LOGIN_API_URL = `${API_BASE_URL}/login`;
const LEADS_API_URL = `${API_BASE_URL}/getLeads`;
const SESSION_TOKEN_URL = `${API_BASE_URL}/sedsessiontoken`;

type LeadRecord = Record<string, unknown>;

export default function Dashboard() {
  const [token, setToken] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [loginStatus, setLoginStatus] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoginStatus(null);
    setLoginError(null);
    setIsAuthed(false);
    try {
      const resp = await fetch(LOGIN_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });
      if (resp.status === 401 || resp.status === 404 || resp.status === 400) {
        setLoginError("Generate a new token.");
        return;
      }
      if (!resp.ok) {
        setLoginError(`Login failed (${resp.status})`);
        return;
      }
      setIsAuthed(true);
      setLoginStatus("Login successful.");
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : "Login failed.");
    }
  };

  const handleGetSessionToken = async () => {
    setSessionStatus(null);
    setSessionToken(null);
    try {
      const resp = await fetch(SESSION_TOKEN_URL, { method: "POST" });
      if (!resp.ok) {
        throw new Error(`Session token failed (${resp.status})`);
      }
      const data = await resp.json().catch(() => ({}));
      const tokenValue = data?.token ?? data?.sessionToken ?? "";
      if (tokenValue) {
        setSessionToken(tokenValue);
        setSessionStatus("Session token generated.");
      } else {
        setSessionStatus("Token endpoint responded, but no token found.");
      }
    } catch (e) {
      setSessionStatus(
        e instanceof Error ? e.message : "Session token request failed.",
      );
    }
  };

  const handleImportLeads = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await fetch(LEADS_API_URL, { method: "GET" });
      if (!resp.ok) {
        throw new Error(`Failed to fetch leads (${resp.status})`);
      }
      const data = await resp.json();
      const normalized = Array.isArray(data)
        ? data
        : data?.leads ?? data?.items ?? [];
      setLeads(normalized);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch leads.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCsv = (rows: LeadRecord[]) => {
    if (!rows.length) {
      setExportStatus("No leads to export.");
      return;
    }
    const headers = Array.from(
      rows.reduce((set, row) => {
        Object.keys(row).forEach((k) => set.add(k));
        return set;
      }, new Set<string>()),
    );

    const escapeCsv = (value: unknown) => {
      const str = value === null || value === undefined ? "" : String(value);
      if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvLines = [
      headers.join(","),
      ...rows.map((row) =>
        headers.map((h) => escapeCsv((row as Record<string, unknown>)[h])).join(","),
      ),
    ];

    const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportStatus("CSV downloaded.");
  };

  const handleExport = async () => {
    setExportStatus(null);
    if (leads.length) {
      downloadCsv(leads);
      return;
    }
    try {
      const resp = await fetch(LEADS_API_URL, { method: "GET" });
      if (!resp.ok) {
        throw new Error(`Failed to fetch leads (${resp.status})`);
      }
      const data = await resp.json();
      const normalized = Array.isArray(data)
        ? data
        : data?.leads ?? data?.items ?? [];
      setLeads(normalized);
      downloadCsv(normalized);
    } catch (e) {
      setExportStatus(e instanceof Error ? e.message : "Export failed.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#fff",
        padding: "40px 24px",
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 16,
          padding: 24,
          background: "rgba(15,15,15,0.9)",
        }}
      >
        <h1 style={{ fontSize: 24, marginBottom: 16 }}>Dashboard</h1>

        {!isAuthed ? (
          <>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <input
                type="password"
                placeholder="Enter logintoken"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "#0f0f0f",
                  color: "#fff",
                  minWidth: 260,
                }}
              />
              <button
                onClick={handleLogin}
                style={{
                  padding: "10px 16px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "#fff",
                  color: "#000",
                  fontWeight: 600,
                }}
              >
                Login
              </button>
              <button
                onClick={handleGetSessionToken}
                style={{
                  padding: "10px 16px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  fontWeight: 600,
                }}
              >
                Get Session Token
              </button>
            </div>
            {loginStatus && (
              <div style={{ marginTop: 12, color: "#9fe3b0" }}>
                {loginStatus}
              </div>
            )}
            {loginError && (
              <div style={{ marginTop: 12, color: "#ff7a7a" }}>
                {loginError}
              </div>
            )}
            {sessionStatus && (
              <div style={{ marginTop: 12, color: "#9fe3b0" }}>
                {sessionStatus}
              </div>
            )}
            {sessionToken && (
              <div
                style={{
                  marginTop: 8,
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: 12,
                  opacity: 0.85,
                  wordBreak: "break-all",
                }}
              >
                {sessionToken}
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={handleImportLeads}
                disabled={isLoading}
                style={{
                  padding: "10px 16px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  fontWeight: 600,
                }}
              >
                {isLoading ? "Fetching..." : "Fetch Waitlist"}
              </button>
              <button
                onClick={handleExport}
                style={{
                  padding: "10px 16px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  fontWeight: 600,
                }}
              >
                Download CSV
              </button>
            </div>

            {error && (
              <div style={{ marginTop: 12, color: "#ff7a7a" }}>{error}</div>
            )}
            {exportStatus && (
              <div style={{ marginTop: 12, color: "#9fe3b0" }}>
                {exportStatus}
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <div style={{ opacity: 0.7, marginBottom: 8 }}>
                Leads ({leads.length})
              </div>
              <div
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  padding: 16,
                  background: "#0b0b0b",
                  maxHeight: 420,
                  overflow: "auto",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: 12,
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                }}
              >
                {leads.length ? JSON.stringify(leads, null, 2) : "No leads yet."}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
