// ============================================================
// Watchlist.jsx — Saved Stocks (Fixed Layout)
// ============================================================

import { useApp } from "../context/AppContext";
import BuyModal from "../components/BuyModal";
import { useState } from "react";
import { Star, Trash2, TrendingUp, TrendingDown, ShoppingCart, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

export default function Watchlist() {
  const { state, dispatch } = useApp();
  const { watchlist, stocks } = state;
  const navigate = useNavigate();
  const [buyModal, setBuyModal]       = useState(null);
  const [addSearch, setAddSearch]     = useState("");
  const [showAddPanel, setShowAddPanel] = useState(false);

  const watchedStocks = watchlist
    .map((ticker) => stocks.find((s) => s.ticker === ticker))
    .filter(Boolean);

  const availableToAdd = stocks.filter(
    (s) =>
      !watchlist.includes(s.ticker) &&
      (addSearch === "" || s.ticker.toLowerCase().includes(addSearch.toLowerCase()) || s.name.toLowerCase().includes(addSearch.toLowerCase()))
  );

  function removeFromWatchlist(ticker) {
    dispatch({ type: "REMOVE_WATCHLIST", payload: ticker });
  }

  function addToWatchlist(ticker) {
    dispatch({ type: "ADD_WATCHLIST", payload: ticker });
    setAddSearch("");
  }

  return (
    <div className="anim-fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Watchlist</h1>
          <p className="page-subtitle">{watchedStocks.length} stock{watchedStocks.length !== 1 ? "s" : ""} saved</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAddPanel(!showAddPanel)}>
          + Add Stocks
        </button>
      </div>

      {/* ── Add Panel ───────────────────────────────────────── */}
      {showAddPanel && (
        <div className="glass-card anim-fade-up" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Search size={14} color="var(--text-muted)" />
            <span style={{ fontWeight: 600, fontSize: 13.5 }}>Add to Watchlist</span>
          </div>
          <input
            className="input"
            placeholder="Search ticker or company..."
            value={addSearch}
            onChange={(e) => setAddSearch(e.target.value)}
            style={{ marginBottom: 10 }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, maxHeight: 120, overflowY: "auto" }}>
            {availableToAdd.slice(0, 16).map((s) => (
              <button key={s.ticker} className="btn btn-ghost btn-sm" onClick={() => addToWatchlist(s.ticker)}
                style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Star size={11} />
                <span style={{ fontWeight: 700 }}>{s.ticker}</span>
                <span style={{ color: "var(--text-muted)", fontSize: 11 }}>{s.name.split(" ").slice(0, 2).join(" ")}</span>
              </button>
            ))}
            {availableToAdd.length === 0 && (
              <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>All stocks already in watchlist!</span>
            )}
          </div>
        </div>
      )}

      {/* ── Watchlist Grid ───────────────────────────────────── */}
      {watchedStocks.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <div className="empty-state-icon"><Star size={38} strokeWidth={1.5} color="var(--text-muted)" /></div>
            <div className="empty-state-text">Your watchlist is empty</div>
            <div className="empty-state-sub">Click the ★ icon on the Market page to add stocks</div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/market")}>
              Browse Market →
            </button>
          </div>
        </div>
      ) : (
        <div className="grid-3">
          {watchedStocks.map((stock) => {
            const isUp = stock.changePercent >= 0;
            const rangePct = Math.min(100, Math.max(0,
              ((stock.price - stock.low52) / (stock.high52 - stock.low52)) * 100
            )).toFixed(1);

            return (
              <div key={stock.ticker} className="glass-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 0, overflow: "hidden" }}>
                {/* Card header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 17, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stock.ticker}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stock.name}</div>
                  </div>
                  <button onClick={() => removeFromWatchlist(stock.ticker)} title="Remove"
                    style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--yellow)", padding: "2px 4px", flexShrink: 0 }}>
                    <Star size={16} fill="var(--yellow)" />
                  </button>
                </div>

                {/* Sparkline */}
                <div style={{ width: "100%", height: 55, marginBottom: 10 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stock.history.slice(-20)} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`wl-${stock.ticker}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={isUp ? "#2dd4a0" : "#B4182D"} stopOpacity={0.28} />
                          <stop offset="100%" stopColor={isUp ? "#2dd4a0" : "#B4182D"} stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="price" stroke={isUp ? "var(--green)" : "var(--red)"} strokeWidth={1.5} fill={`url(#wl-${stock.ticker})`} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Price row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: 18 }}>
                      ${stock.price.toFixed(2)}
                    </div>
                    <div style={{ color: isUp ? "var(--green)" : "var(--red)", fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                      {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {isUp ? "+" : ""}{stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                  <div style={{ textAlign: "right", fontSize: 11, color: "var(--text-muted)" }}>
                    <div>Vol: {stock.volume}</div>
                    <div>P/E: {stock.pe}</div>
                  </div>
                </div>

                {/* 52-week range */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--text-muted)", marginBottom: 3 }}>
                    <span>52W Low ${stock.low52}</span>
                    <span>52W High ${stock.high52}</span>
                  </div>
                  <div style={{ height: 3, background: "var(--bg-surface)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg, var(--red), var(--green))", width: `${rangePct}%` }} />
                  </div>
                </div>

                {/* Buttons */}
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-buy btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={() => setBuyModal({ stock, mode: "BUY" })}>
                    <ShoppingCart size={12} /> Buy
                  </button>
                  <button className="btn btn-sell btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={() => setBuyModal({ stock, mode: "SELL" })}>
                    Sell
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeFromWatchlist(stock.ticker)} title="Remove" style={{ padding: "5px 8px" }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {buyModal && (
        <BuyModal stock={buyModal.stock} mode={buyModal.mode} onClose={() => setBuyModal(null)} />
      )}
    </div>
  );
}
