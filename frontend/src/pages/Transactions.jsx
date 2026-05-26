// ============================================================
// Transactions.jsx — Trade History (Fixed Layout)
// ============================================================

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/stockSimulator";
import { TrendingUp, TrendingDown, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Transactions() {
  const { state } = useApp();
  const { transactions, stocks } = state;
  const navigate = useNavigate();
  const [filter, setFilter] = useState("ALL");

  const filtered = transactions.filter((t) => filter === "ALL" || t.type === filter);

  const totalBuys  = transactions.filter((t) => t.type === "BUY").reduce((s, t) => s + t.total, 0);
  const totalSells = transactions.filter((t) => t.type === "SELL").reduce((s, t) => s + t.total, 0);

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " · " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="anim-fade-in" style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">Full trading history</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate("/market")}>+ New Trade</button>
      </div>

      {/* ── Stats Row ───────────────────────────────────────── */}
      <div className="grid-3">
        <div className="glass-card stat-card" style={{ borderTop: "2px solid var(--accent)" }}>
          <div className="stat-label">Total Trades</div>
          <div className="stat-value">{transactions.length}</div>
          <div className="stat-sub">{transactions.filter((t) => t.type === "BUY").length} buys · {transactions.filter((t) => t.type === "SELL").length} sells</div>
        </div>
        <div className="glass-card stat-card" style={{ borderTop: "2px solid var(--red)" }}>
          <div className="stat-label">Total Invested</div>
          <div className="stat-value" style={{ color: "var(--red)" }}>{formatCurrency(totalBuys)}</div>
          <div className="stat-sub">Capital deployed</div>
        </div>
        <div className="glass-card stat-card" style={{ borderTop: "2px solid var(--green)" }}>
          <div className="stat-label">Total Proceeds</div>
          <div className="stat-value" style={{ color: "var(--green)" }}>{formatCurrency(totalSells)}</div>
          <div className="stat-sub">From selling</div>
        </div>
      </div>

      {/* ── Filter Row ──────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <Filter size={14} style={{ color: "var(--text-muted)" }} />
        {["ALL", "BUY", "SELL"].map((f) => (
          <button key={f} className="btn btn-sm btn-ghost" onClick={() => setFilter(f)}
            style={{
              background: filter === f ? "rgba(108,99,255,0.15)" : "",
              color: filter === f ? "var(--accent-light)" : "",
              borderColor: filter === f ? "rgba(108,99,255,0.3)" : "",
            }}>
            {f === "ALL" ? "All Trades" : f === "BUY" ? "🟢 Buys" : "🔴 Sells"}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>
          {filtered.length} record{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Table ───────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-text">No transactions yet</div>
            <div className="empty-state-sub">Your trade history will appear here</div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/market")}>
              Start Trading →
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: "hidden" }}>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 70 }}>Type</th>
                  <th style={{ minWidth: 140 }}>Stock</th>
                  <th style={{ minWidth: 70 }}>Shares</th>
                  <th style={{ minWidth: 100 }}>Price/Share</th>
                  <th style={{ minWidth: 110 }}>Total</th>
                  <th style={{ minWidth: 160 }}>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((txn) => {
                  const stock = stocks.find((s) => s.ticker === txn.ticker);
                  return (
                    <tr key={txn.id}>
                      <td>
                        <span className={`badge ${txn.type === "BUY" ? "badge-green" : "badge-red"}`}
                          style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          {txn.type === "BUY" ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {txn.type}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 800, fontSize: 14 }}>{txn.ticker}</div>
                        <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 1, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stock?.name || txn.ticker}</div>
                      </td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{txn.shares}</td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>${txn.price.toFixed(2)}</td>
                      <td>
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: 14,
                          color: txn.type === "BUY" ? "var(--red)" : "var(--green)",
                        }}>
                          {txn.type === "BUY" ? "−" : "+"}{formatCurrency(txn.total)}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-secondary)", fontSize: 12.5, whiteSpace: "nowrap" }}>
                        {formatDate(txn.date)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
