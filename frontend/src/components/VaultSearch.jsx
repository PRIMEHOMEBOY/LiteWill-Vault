import { useState } from "react";
import { useVault } from "../hooks/useDeadVault";
import VaultCard from "./VaultCard";

function SearchResult({ id, query, onAction }) {
  const { data: d } = useVault(id);
  if (!d) return null;
  const name = String(d[2] || "").toLowerCase();
  if (query && !name.includes(query.toLowerCase())) return null;
  const vault = { id, owner: d[1], name: d[2], encryptedDataCID: d[3], encryptedSymKey: d[4], secretType: d[5], intervalSeconds: d[6], lastCheckIn: d[7], deadline: d[8], coSigner: d[9], status: d[10], createdAt: d[11] };
  return <VaultCard vault={vault} onAction={onAction} />;
}

export default function VaultSearch({ ids = [], onAction }) {
  const [query,  setQuery]  = useState("");
  const [status, setStatus] = useState("all");

  const STATUS_FILTERS = ["all", "active", "claimable", "released", "revoked"];
  const STATUS_MAP     = { active: 0, claimable: 1, released: 2, revoked: 3 };

  return (
    <div>
      {/* Search bar */}
      <div style={{ position: "relative", marginBottom: 14 }}>
        <input
          className="input"
          placeholder="🔍  Search vaults by name..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ paddingLeft: 16 }}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16 }}
          >✕</button>
        )}
      </div>

      {/* Status filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {STATUS_FILTERS.map(f => (
          <button
            key={f}
            className={`btn btn-sm ${status === f ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setStatus(f)}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Results */}
      {ids.map(id => {
        if (status !== "all") {
          // We need to filter by status — check hook data
          return <FilteredResult key={String(id)} id={id} query={query} statusFilter={STATUS_MAP[status]} onAction={onAction} />;
        }
        return <SearchResult key={String(id)} id={id} query={query} onAction={onAction} />;
      })}
    </div>
  );
}

function FilteredResult({ id, query, statusFilter, onAction }) {
  const { data: d } = useVault(id);
  if (!d) return null;
  if (Number(d[10]) !== statusFilter) return null;
  const name = String(d[2] || "").toLowerCase();
  if (query && !name.includes(query.toLowerCase())) return null;
  const vault = { id, owner: d[1], name: d[2], encryptedDataCID: d[3], encryptedSymKey: d[4], secretType: d[5], intervalSeconds: d[6], lastCheckIn: d[7], deadline: d[8], coSigner: d[9], status: d[10], createdAt: d[11] };
  return <VaultCard vault={vault} onAction={onAction} />;
}
