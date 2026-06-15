import { useState } from "react";
import { useVault, useHeirs } from "../hooks/useDeadVault";
import { useAccount } from "wagmi";

// Try to parse JSON, return null if not JSON
function tryJSON(raw) {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// Copy button component
function CopyBtn({ text }) {
  const [ok, setOk] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(text);
    setOk(true);
    setTimeout(() => setOk(false), 2000);
  };
  return (
    <button
      onClick={copy}
      style={{
        marginTop: 10,
        background: "transparent",
        border: "1px solid var(--border-accent)",
        color: "var(--accent-text)",
        padding: "6px 14px",
        fontFamily: "'Share Tech Mono',monospace",
        fontSize: 10,
        letterSpacing: ".15em",
        textTransform: "uppercase",
        cursor: "pointer",
      }}
    >
      {ok ? "✓ COPIED" : "📋 COPY"}
    </button>
  );
}

// Section wrapper
function Section({ icon, title, content, type }) {
  const isEmpty = !content || content.trim() === "";
  return (
    <div style={{
      border: "1px solid var(--border)",
      marginBottom: 14,
      overflow: "hidden",
    }}>
      {/* Section header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        background: isEmpty ? "var(--page-bg)" : "var(--accent-subtle)",
        borderBottom: "1px solid var(--border)",
      }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{
          fontFamily: "'Share Tech Mono',monospace",
          fontSize: 10,
          letterSpacing: ".2em",
          textTransform: "uppercase",
          color: isEmpty ? "var(--text-muted)" : "var(--accent-text)",
          fontWeight: 700,
        }}>
          {title}
        </span>
        {isEmpty && (
          <span style={{
            marginLeft: "auto",
            fontFamily: "monospace",
            fontSize: 10,
            color: "var(--text-muted)",
            fontStyle: "italic",
          }}>
            not stored
          </span>
        )}
      </div>

      {/* Section content */}
      {!isEmpty && (
        <div style={{ padding: 16 }}>
          {type === "keys" ? (
            <div>
              <div style={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: 14,
                lineHeight: 2,
                color: "var(--accent-text)",
                wordBreak: "break-all",
                letterSpacing: "0.06em",
                background: "var(--bg)",
                padding: "14px 16px",
                border: "1px solid var(--border-accent)",
              }}>
                {content}
              </div>
              <CopyBtn text={content} />
            </div>
          ) : type === "links" ? (
            <div>
              {content.split("\n").filter(l => l.trim()).map((link, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <a
                    href={link.trim().startsWith("http") ? link.trim() : `https://${link.trim()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--accent-text)",
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: 13,
                      wordBreak: "break-all",
                      display: "block",
                    }}
                  >
                    🔗 {link.trim()}
                  </a>
                </div>
              ))}
              <CopyBtn text={content} />
            </div>
          ) : type === "file" ? (
            <div>
              <div style={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: 13,
                color: "var(--text)",
                marginBottom: 10,
                wordBreak: "break-all",
              }}>
                {content}
              </div>
              {(content.startsWith("Qm") || content.startsWith("bafy")) && (
                <a
                  href={`https://ipfs.io/ipfs/${content}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "transparent",
                    border: "1px solid var(--border-accent)",
                    color: "var(--accent-text)",
                    padding: "6px 14px",
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: 10,
                    letterSpacing: ".15em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  🌐 OPEN ON IPFS
                </a>
              )}
              <CopyBtn text={content} />
            </div>
          ) : (
            <div>
              <div style={{
                fontFamily: "'Rajdhani',sans-serif",
                fontSize: 15,
                lineHeight: 1.8,
                color: "var(--text)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}>
                {content}
              </div>
              <CopyBtn text={content} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VaultContents({ vaultId, onClose }) {
  const { address } = useAccount();
  const { data: d }       = useVault(vaultId);
  const { data: heirs = [] } = useHeirs(vaultId);
  const [revealed, setRevealed] = useState(false);

  if (!d) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontFamily: "monospace" }}>
          <span className="spinner" /> Loading...
        </div>
      </div>
    </div>
  );

  const vaultName  = d[2];
  const rawContent = d[3];
  const secretType = String(d[5] || "text");
  const status     = Number(d[10]);
  const isOwner    = String(d[1]).toLowerCase() === address?.toLowerCase();
  const myHeir     = heirs.find(h => String(h.wallet).toLowerCase() === address?.toLowerCase());
  const isHeir     = !!myHeir;
  const hasClaimed = myHeir?.claimed === true;

  // Access control
  const canView = isOwner || (isHeir && status === 2 && hasClaimed);
  const isPending = isHeir && (status === 1);

  if (!canView && !isPending) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18 }}>✕</button>
        <div className="alert alert-danger" style={{ marginBottom: 16 }}>
          Vault contents are only accessible after the vault has been fully released and your claim executed.
        </div>
        <button className="btn btn-ghost btn-full btn-sm" onClick={onClose}>Close</button>
      </div>
    </div>
  );

  if (isPending && !isOwner) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18 }}>✕</button>
        <div className="alert alert-warn" style={{ marginBottom: 16 }}>
          ⏳ Complete the claim process first. Contents available after Execute Release.
        </div>
        <button className="btn btn-ghost btn-full btn-sm" onClick={onClose}>Close</button>
      </div>
    </div>
  );

  // ── Determine what to show in each section ──────────────────────────
  const parsed = tryJSON(rawContent);

  let textContent  = "";
  let keysContent  = "";
  let fileContent  = "";
  let linksContent = "";

  if (parsed && typeof parsed === "object") {
    // New vault — JSON with multiple types
    textContent  = parsed.text  || "";
    keysContent  = parsed.keys  || "";
    fileContent  = parsed.file  || parsed.fileName || "";
    linksContent = parsed.links || "";
  } else {
    // Old vault — single plain text, put in the right section
    const raw = rawContent || "";
    if (secretType === "keys")        keysContent  = raw;
    else if (secretType === "links")  linksContent = raw;
    else if (secretType === "file")   fileContent  = raw;
    else                              textContent  = raw; // text or unknown
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18 }}>✕</button>

        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
          Vault Contents
        </div>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "var(--text-muted)", marginBottom: 20 }}>
          {vaultName}
        </div>

        {!revealed ? (
          <div>
            <div className="alert alert-warn" style={{ marginBottom: 20 }}>
              ⚠ Sensitive vault contents. Make sure you are in a private, secure location before revealing.
            </div>
            <button className="btn btn-primary btn-full btn-lg" onClick={() => setRevealed(true)}>
              🔓 Reveal Vault Contents
            </button>
          </div>
        ) : (
          <div>
            <div className="alert alert-success" style={{ marginBottom: 16 }}>
              ✓ Vault unlocked — all sections shown below
            </div>

            {/* Always show all 4 sections */}
            <Section
              icon="📝"
              title="Secret Message / Text"
              content={textContent}
              type="text"
            />
            <Section
              icon="🔑"
              title="Crypto Keys / Seed Phrase"
              content={keysContent}
              type="keys"
            />
            <Section
              icon="📁"
              title="Files / Documents"
              content={fileContent}
              type="file"
            />
            <Section
              icon="🔗"
              title="Links"
              content={linksContent}
              type="links"
            />

            <div style={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: 10,
              color: "var(--text-muted)",
              padding: "12px 0",
              borderTop: "1px solid var(--border)",
              marginTop: 8,
            }}>
              ⚠ Store this information safely. Close when done. Never share your screen in public.
            </div>

            <button className="btn btn-ghost btn-full btn-sm" style={{ marginTop: 10 }} onClick={onClose}>
              ✓ Done — Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
