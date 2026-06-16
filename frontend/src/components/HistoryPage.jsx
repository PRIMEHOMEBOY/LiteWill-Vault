import { useAccount, useReadContract } from "wagmi";
import { useOwnerVaults, useHeirVaults, useVault, useClaimRequest, useHeirs } from "../hooks/useDeadVault";
import { useState } from "react";

function VaultHistory({ id }) {
  const { data: d }     = useVault(id);
  const { data: claim } = useClaimRequest(id);
  const { data: heirs = [] } = useHeirs(id);

  if (!d) return null;

  const name     = d[2];
  const status   = Number(d[10]);
  const created  = Number(d[11]);
  const lastCI   = Number(d[7]);
  const deadline = Number(d[8]);

  const fmt = (ts) => ts ? new Date(Number(ts) * 1000).toLocaleString() : "—";
  const statusLabels = ["Active", "Claimable", "Released", "Revoked"];
  const statusColors = ["var(--green)", "var(--accent-text)", "var(--blue)", "var(--text-muted)"];

  const events = [
    { label: "Vault Created",    time: created,              icon: "🔐", color: "var(--green)" },
    { label: "Last Check-In",    time: lastCI,               icon: "✅", color: "var(--green)" },
    { label: "Deadline",         time: deadline,             icon: "⏰", color: "var(--amber)" },
    claim?.initiatedAt ? { label: "Claim Initiated",  time: claim.initiatedAt,  icon: "📋", color: "var(--accent-text)" } : null,
    claim?.approvedAt  ? { label: "Co-Signer Approved", time: claim.approvedAt, icon: "✍", color: "var(--blue)" }        : null,
    status === 2       ? { label: "Vault Released",    time: claim?.approvedAt ? Number(claim.approvedAt) + 3*86400 : 0, icon: "🔓", color: "var(--green)" } : null,
    status === 3       ? { label: "Vault Revoked",     time: 0,                 icon: "✕",  color: "var(--red)" }        : null,
  ].filter(Boolean).sort((a, b) => Number(a.time) - Number(b.time));

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="row-between" style={{ marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{name}</div>
          <div className="label">VLT-{String(id).padStart(4,"0")} · {heirs.length} heir{heirs.length !== 1 ? "s" : ""}</div>
        </div>
        <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, letterSpacing: ".15em", color: statusColors[status], padding: "4px 10px", border: `1px solid ${statusColors[status]}`, textTransform: "uppercase" }}>
          {statusLabels[status]}
        </span>
      </div>

      {/* Timeline */}
      <div style={{ position: "relative", paddingLeft: 28 }}>
        {/* Vertical line */}
        <div style={{ position: "absolute", left: 9, top: 8, bottom: 8, width: 2, background: "var(--border)" }} />

        {events.map((ev, i) => (
          <div key={i} style={{ position: "relative", marginBottom: 16, display: "flex", gap: 14, alignItems: "flex-start" }}>
            {/* Dot */}
            <div style={{
              position: "absolute", left: -28,
              width: 20, height: 20, borderRadius: "50%",
              background: "var(--card-bg)",
              border: `2px solid ${ev.color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, zIndex: 1,
            }}>
              {ev.icon}
            </div>
            {/* Content */}
            <div>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: ev.color, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 2 }}>
                {ev.label}
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)" }}>
                {fmt(ev.time)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const { isConnected } = useAccount();
  const { data: ownerIds = [] } = useOwnerVaults();
  const { data: heirIds  = [] } = useHeirVaults();
  const [filter, setFilter] = useState("owned");

  if (!isConnected) return (
    <div className="empty-state fade-in">
      <div className="empty-icon">📋</div>
      <div className="empty-title">Wallet not connected</div>
    </div>
  );

  const ids = filter === "owned" ? ownerIds : heirIds;

  return (
    <div className="fade-in">
      <div className="section-title">
        <div className="section-num">📋</div>
        Transaction History
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button className={`btn btn-sm ${filter==="owned"?"btn-primary":"btn-ghost"}`} onClick={() => setFilter("owned")}>
          My Vaults ({ownerIds.length})
        </button>
        <button className={`btn btn-sm ${filter==="heir"?"btn-primary":"btn-ghost"}`} onClick={() => setFilter("heir")}>
          As Heir ({heirIds.length})
        </button>
      </div>

      {ids.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <div className="empty-title">No history yet</div>
        </div>
      ) : (
        ids.map(id => <VaultHistory key={String(id)} id={id} />)
      )}
    </div>
  );
}
