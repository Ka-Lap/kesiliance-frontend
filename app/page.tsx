/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";

export default function Home() {
  const [entityName, setEntityName] = useState("");
  const [entityCountry, setEntityCountry] = useState("");
  const [matchEntityId, setMatchEntityId] = useState("");
  const [threshold, setThreshold] = useState(80);
  const [limit, setLimit] = useState(5);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function uploadCSV(endpoint: "entities/import" | "sanctions/import", file: File | null) {
    setMsg(null);
    if (!file) { setMsg("Sélectionne un fichier .csv"); return; }
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`/api/kesi/${endpoint}`, { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setMsg(`Erreur ${res.status}: ${data?.detail || "Import échoué"}`);
    else setMsg(`Import OK: ${JSON.stringify(data)}`);
  }

  async function createEntity() {
    setMsg(null);
    const res = await fetch(`/api/kesi/entities`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: entityName, country: entityCountry || null }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setMsg(`Erreur ${res.status}: ${data?.detail || "Création échouée"}`);
    else {
      setMsg(`Entity créée: ${JSON.stringify(data)}`);
      if (data?.id) setMatchEntityId(String(data.id));
    }
  }

  async function runMatch() {
    setMsg(null);
    if (!matchEntityId) { setMsg("Renseigne entity_id"); return; }
    const res = await fetch(`/api/kesi/match/${matchEntityId}?threshold=${threshold}&limit=${limit}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setMsg(`Erreur ${res.status}: ${data?.detail || "Match échoué"}`);
    else setMatchResult(data);
  }

  function downloadMatchCSV() {
    if (!matchEntityId) { setMsg("Renseigne entity_id"); return; }
    const url = `/api/kesi/match/${matchEntityId}/csv?threshold=${threshold}&limit=${limit}`;
    window.location.href = url;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">KesiLiance Console</h1>

        {msg && <div className="p-3 bg-yellow-100 border border-yellow-300 rounded">{msg}</div>}

        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white shadow p-4 rounded-2xl">
            <h2 className="text-xl font-semibold mb-3">Importer Entities (CSV)</h2>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => uploadCSV("entities/import", e.target.files?.[0] || null)}
              className="block"
            />
            <p className="text-sm text-gray-500 mt-2">Format: <code>name,country</code></p>
          </div>

          <div className="bg-white shadow p-4 rounded-2xl">
            <h2 className="text-xl font-semibold mb-3">Importer Sanctions (CSV)</h2>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => uploadCSV("sanctions/import", e.target.files?.[0] || null)}
              className="block"
            />
            <p className="text-sm text-gray-500 mt-2">Format: <code>name,country,source</code></p>
          </div>
        </section>

        <section className="bg-white shadow p-4 rounded-2xl">
          <h2 className="text-xl font-semibold mb-3">Créer une entité</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="border rounded px-3 py-2 flex-1"
              placeholder="Nom (ex: Global Trading LLC)"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
            />
            <input
              className="border rounded px-3 py-2 w-40"
              placeholder="Pays (ex: RU)"
              value={entityCountry}
              onChange={(e) => setEntityCountry(e.target.value)}
            />
            <button
              onClick={createEntity}
              className="px-4 py-2 bg-black text-white rounded hover:opacity-90"
            >
              Créer
            </button>
          </div>
        </section>

        <section className="bg-white shadow p-4 rounded-2xl">
          <h2 className="text-xl font-semibold mb-3">Matching Sanctions</h2>
          <div className="grid sm:grid-cols-4 gap-3">
            <input
              className="border rounded px-3 py-2"
              placeholder="entity_id"
              value={matchEntityId}
              onChange={(e) => setMatchEntityId(e.target.value)}
            />
            <input
              className="border rounded px-3 py-2"
              type="number"
              placeholder="threshold"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
            />
            <input
              className="border rounded px-3 py-2"
              type="number"
              placeholder="limit"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            />
            <div className="flex gap-2">
              <button
                onClick={runMatch}
                className="px-4 py-2 bg-black text-white rounded hover:opacity-90"
              >
                Lancer
              </button>
              <button
                onClick={downloadMatchCSV}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                CSV
              </button>
            </div>
          </div>

          {Array.isArray(matchResult) && (
            <div className="mt-4">
              <pre className="bg-gray-100 p-3 rounded overflow-auto text-sm">
{JSON.stringify(matchResult, null, 2)}
              </pre>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
