/*
AI Code-Review — Website Starter (single-file React component)

What this file contains:
- A ready-to-run React component (default export) that serves as the MVP website UI.
- Tailwind CSS utility classes are used for styling (no import required here if your project already has Tailwind configured).
- UI features:
  - Header and product pitch
  - "Connect GitHub" button (placeholder) for OAuth
  - Sample PR list (mock data) with Analyze button
  - Simple settings panel (model provider, API key placeholder)
  - Logs/console area showing model responses

How to use:
1. Create a React app (Vite or Create React App) and add Tailwind CSS.
2. Save this file as `App.jsx` (or `App.tsx` if you prefer TypeScript) inside `src/`.
3. Provide a backend endpoint `/api/analyze` that accepts POST { repo, prDiff } and returns { summary, flags, tests }.
   - For initial MVP, this endpoint will call an LLM API and return structured results.
4. Configure OAuth flow separately; the "Connect GitHub" button currently opens a placeholder flow.
5. Run the app: `npm run dev` (Vite) or `npm start` (CRA).

Notes / Next steps I can do for you if you want:
- Create the backend FastAPI or Node.js skeleton for `/api/analyze` and the GitHub webhook handler.
- Provide example prompts and example API payloads/responses.
- Wire up GitHub OAuth and webhook setup instructions.
*/

import React, { useState } from "react";

const MOCK_PRS = [
  {
    id: 1,
    title: "Fix: handle null user in transformUser",
    author: "alice",
    diff: "+ function transformUser(u) { if(!u) return null; /* ... */ }",
  },
  {
    id: 2,
    title: "Feat: add bulk upload endpoint",
    author: "bob",
    diff: "+ POST /api/upload - new endpoint (no tests yet)",
  },
];

export default function App() {
  const [connected, setConnected] = useState(false);
  const [prs, setPrs] = useState(MOCK_PRS);
  const [logs, setLogs] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [settings, setSettings] = useState({ provider: "llm-api", apiKey: "" });

  async function connectGitHub() {
    // placeholder - your real app should trigger OAuth flow
    setConnected(true);
    setLogs((l) => ["Connected to GitHub (mock)", ...l]);
  }

  async function analyzePR(pr) {
    setLoadingId(pr.id);
    setLogs((l) => [`Analyzing PR #${pr.id}...`, ...l]);
    try {
      const payload = { repo: "owner/repo-placeholder", prDiff: pr.diff };
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setLogs((l) => [
        `PR #${pr.id} analyzed — Summary: ${data.summary?.slice(0, 200) || "(none)"}`,
        ...l,
      ]);

      // Attach results to the PR locally for UI demo
      setPrs((prev) => prev.map((p) => (p.id === pr.id ? { ...p, analysis: data } : p)));
    } catch (err) {
      setLogs((l) => [`Error analyzing PR #${pr.id}: ${err.message}`, ...l]);
    } finally {
      setLoadingId(null);
    }
  }

  function updateSetting(key, value) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <header className="max-w-5xl mx-auto flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">AI Code Quality Copilot</h1>
          <p className="text-slate-600 mt-1">PR summaries, risk flags, and test suggestions — in your workflow.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={connectGitHub}
            className={`px-4 py-2 rounded-lg border ${connected ? "bg-green-50" : "bg-white hover:shadow"}`}
          >
            {connected ? "GitHub Connected" : "Connect GitHub"}
          </button>
          <button className="px-4 py-2 rounded-lg bg-slate-800 text-white">Get Early Access</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-3 gap-6">
        {/* Left: PR List */}
        <section className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Pull Requests</h2>
            <div className="text-sm text-slate-500">Showing {prs.length} PRs</div>
          </div>

          <div className="space-y-4">
            {prs.map((pr) => (
              <article key={pr.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{pr.title}</h3>
                    <div className="text-xs text-slate-500">#{pr.id} opened by {pr.author}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => analyzePR(pr)}
                      className="px-3 py-1 rounded-md border hover:bg-slate-50"
                      disabled={loadingId === pr.id}
                    >
                      {loadingId === pr.id ? "Analyzing..." : "Analyze"}
                    </button>
                    <button
                      onClick={() => {
                        // open a quick diff modal (simple alert for starter)
                        alert(`PR Diff:\n\n${pr.diff}`);
                      }}
                      className="px-3 py-1 rounded-md border hover:bg-slate-50"
                    >
                      View Diff
                    </button>
                  </div>
                </div>

                {/* analysis result preview */}
                {pr.analysis && (
                  <div className="mt-3 bg-slate-50 p-3 rounded">
                    <div className="text-sm text-slate-700">Summary: {pr.analysis.summary}</div>
                    <div className="mt-2 text-xs text-slate-600">Flags: {pr.analysis.flags?.join(", ")}</div>
                    <details className="mt-2 text-xs">
                      <summary className="cursor-pointer">Suggested tests</summary>
                      <pre className="whitespace-pre-wrap text-xs mt-1">{pr.analysis.tests}</pre>
                    </details>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* Right: Settings & Logs */}
        <aside className="col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h4 className="font-semibold">Settings</h4>
            <div className="mt-3 space-y-3 text-sm">
              <label className="block">
                <div className="text-slate-500 text-xs">Model provider</div>
                <select
                  value={settings.provider}
                  onChange={(e) => updateSetting("provider", e.target.value)}
                  className="w-full mt-1 rounded border px-2 py-1"
                >
                  <option value="llm-api">LLM API (fast start)</option>
                  <option value="self-hosted">Self-hosted model</option>
                </select>
              </label>

              <label className="block">
                <div className="text-slate-500 text-xs">API Key (placeholder)</div>
                <input
                  value={settings.apiKey}
                  onChange={(e) => updateSetting("apiKey", e.target.value)}
                  placeholder="sk-..."
                  className="w-full mt-1 rounded border px-2 py-1"
                />
              </label>

              <div className="text-xs text-slate-400">Note: store API keys on the backend, not in the browser.</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h4 className="font-semibold">Activity Log</h4>
            <div className="mt-2 h-56 overflow-auto text-xs text-slate-600">
              {logs.length === 0 ? <div className="text-slate-400">No activity yet.</div> : (
                <ul className="space-y-2">
                  {logs.map((log, i) => (
                    <li key={i} className="break-words">{log}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm text-xs text-slate-500">
            <strong>Next steps:</strong>
            <ol className="mt-2 list-decimal list-inside">
              <li>Implement backend `/api/analyze`</li>
              <li>Wire GitHub OAuth + webhook</li>
              <li>Improve prompts & sample outputs</li>
            </ol>
          </div>
        </aside>
      </main>

      <footer className="max-w-5xl mx-auto mt-8 text-center text-xs text-slate-400">Built with ♥ for developers</footer>
    </div>
  );
}
