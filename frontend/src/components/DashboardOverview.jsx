import { useVault, useOwnerVaults } from "../hooks/useDeadVault";
import { useAccount } from "wagmi";

function NextDeadlineCard({ ids }) {
  const vaults = ids.map(id => {
    const { data: d } = useVault(id);
    return d ? { id, name: d[2], deadline: Number(d[8]), status: Number(d[10]) } : null;
  }).filter(v => v && v.status === 0);

  if (!vaults.length) return null;

  const now     = Math.floor(Date.now() / 1000);
  const nearest = vaults.sort((a, b) => a.deadline - b.deadline)[0];
  const left    = nearest.deadline - now;
  const days    = Math.floor(left / 86400);
  const hours   = Math.floor((left % 86400) / 3600);
  const isUrgent = left < 3 * 86400;

  if (left <= 0) return (
    <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", padding: "16px 20px", marginBottom: 20 }}>
      <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, letterSpacing: ".2em", color: "var(--red)", textTransform: "uppercase", marginBottom: 4 }}>🚨 Overdue</div>
      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "var(--red)" }}>{nearest.name}</div>
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Deadline passed — heirs can now initiate a claim</div>
    </div>
  );

  return (
    <div style={{
      background: isUrgent ? "rgba(245,158,11,.08)" : "var(--accent-subtle)",
      border: `1px solid ${isUrgent ? "rgba(245,158,11,.3)" : "var(--border-accent)"}`,
      padding: "16px 20px", marginBottom: 20,
    }}>
      <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, letterSpacing: ".2em", color: isUrgent ? "var(--amber)" : "var(--accent-text)", textTransform: "uppercase", marginBottom: 4 }}>
        {isUrgent ? "⚡ Urgent — " : ""}Next Check-In Due
      </div>
      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{nearest.name}</div>
      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 22, fontWeight: 900, color: isUrgent ? "var(--amber)" : "var(--accent-text)" }}>
        {days > 0 ? `${days}d ${hours}h` : `${hours}h`}
      </div>
      <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>remaining before vault expires</div>
    </div>
  );
}

export default function DashboardOverview({ ownerIds = [] }) {
  const { isConnected } = useAccount();
  if (!isConnected || ownerIds.length === 0) return null;

  return <NextDeadlineCard ids={ownerIds} />;
}
