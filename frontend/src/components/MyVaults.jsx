import { useAccount } from "wagmi";
import { useOwnerVaults } from "../hooks/useDeadVault";
import VaultSearch from "./VaultSearch";

export default function MyVaults({ onAction, onTabChange }) {
  const { isConnected } = useAccount();
  const { data: ids = [], isLoading } = useOwnerVaults();

  if (!isConnected) return (
    <div className="empty-state fade-in">
      <div className="empty-icon">🔌</div>
      <div className="empty-title">Wallet not connected</div>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="section-title">
        <div className="section-num">↓</div>
        My Vaults
        <span style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)" }}>
          {ids.length} vault{ids.length !== 1 ? "s" : ""}
        </span>
      </div>

      {isLoading && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontFamily: "monospace", fontSize: 12 }}>
          <span className="spinner" style={{ marginRight: 10 }} />Loading vaults...
        </div>
      )}

      {!isLoading && ids.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔒</div>
          <div className="empty-title">No vaults found</div>
          <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => onTabChange("Create Vault")}>
            + Create Vault
          </button>
        </div>
      )}

      {!isLoading && ids.length > 0 && (
        <VaultSearch ids={ids} onAction={onAction} />
      )}
    </div>
  );
}
