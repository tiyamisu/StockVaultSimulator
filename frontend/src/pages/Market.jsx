// ============================================================
// Market.jsx — Stock Market Browser (Fixed Layout)
// ============================================================

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../utils/stockSimulator";
import BuyModal from "../components/BuyModal";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { Search, TrendingUp, TrendingDown, Star, X, ShoppingCart } from "lucide-react";

const SECTORS = ["All", "Technology", "Finance", "Energy", "Healthcare", "Consumer"];

const SECTOR_BADGE = {
  Technology:  "badge-tech",
  Finance:     "badge-finance",
  Energy:      "badge-energy",
  Healthcare:  "badge-healthcare",
  Consumer:    "badge-consumer",
};

export default function Market() {
  const { state, dispatch } = useApp();
  const { stocks, watchlist } = state;
  const navigate = useNavigate();

  const [search, setSearch]         = useState("");
  const [sector, setSector]         = useState("All");
  const [selectedStock, setSelected] = useState(null);
  const [buyModal, setBuyModal]     = useState(null);
  const [sort, setSort]             = useState("ticker");

  const filtered = stocks
    .filter((s) => {
      const q = search.toLowerCase();
      return (
        (sector === "All" || s.sector === sector) &&
        (s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sort === "price")  return b.price - a.price;
      if (sort === "change") return b.changePercent - a.changePercent;
      return a.ticker.localeCompare(b.ticker);
    });

  function toggleWatchlist(ticker) {
    dispatch({ type: watchlist.includes(ticker) ? "REMOVE_WATCHLIST" : "ADD_WATCHLIST", payload: ticker });
  }

  return (
    <div className="anim-fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Market</h1>
          <p className="page-subtitle">{stocks.length} stocks · live prices every 3s</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate("/watchlist")}>
          <Star size={13} /> Watchlist ({watchlist.length})
        </button>
      </div>

      {/* ── Search + Sort Row ────────────────────────────────── */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div className="search-bar" style={{ flex: "1 1 200px", maxWidth: 380 }}>
          <Search size={15} className="search-icon" />
          <input
            id="stock-search-input"
            className="input"
            placeholder="Search ticker or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 600 }}>Sort:</span>
          {["ticker", "price", "change"].map((s) => (
            <button key={s} className="btn btn-sm btn-ghost" onClick={() => setSort(s)}
              style={{
                background: sort === s ? "rgba(253,164,129,0.15)" : "",
                color: sort === s ? "var(--accent)" : "",
                borderColor: sort === s ? "rgba(253,164,129,0.35)" : "",
              }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Sector Chips ─────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
        {SECTORS.map((s) => (
          <button key={s} onClick={() => setSector(s)} style={{
            padding: "5px 14px", borderRadius: "var(--r-full)", fontSize: 12.5, fontWeight: 600,
            border: "1px solid", cursor: "pointer", fontFamily: "inherit",
            transition: "all var(--t-fast)",
            background: sector === s ? "rgba(253,164,129,0.15)" : "transparent",
            borderColor: sector === s ? "var(--accent)" : "var(--border)",
            color: sector === s ? "var(--accent)" : "var(--text-secondary)",
          }}>
            {s}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Stock Table ──────────────────────────────────────── */}
      <div className="glass-card" style={{ overflow: "hidden" }}>
        {/* Horizontal scroll wrapper for table */}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: 130 }}>Symbol</th>
                <th style={{ minWidth: 90 }}>Price</th>
                <th style={{ minWidth: 100 }}>Change</th>
                <th style={{ minWidth: 80 }}>Volume</th>
                <th style={{ minWidth: 90 }}>Mkt Cap</th>
                <th style={{ minWidth: 55 }}>P/E</th>
                <th style={{ minWidth: 100 }}>Sector</th>
                <th style={{ minWidth: 120, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((stock) => {
                const isUp      = stock.changePercent >= 0;
                const inWatch   = watchlist.includes(stock.ticker);
                const isSelected = selectedStock?.ticker === stock.ticker;

                return (
                  <>
                    <tr key={stock.ticker}
                      style={{ cursor: "pointer", background: isSelected ? "rgba(253,164,129,0.06)" : "" }}
                      onClick={() => setSelected(isSelected ? null : stock)}
                    >
                      <td>
                        <div style={{ fontWeight: 800, fontSize: 14 }}>{stock.ticker}</div>
                        <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 1, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stock.name}</div>
                      </td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 14 }}>
                        ${stock.price.toFixed(2)}
                      </td>
                      <td>
                        <span style={{ color: isUp ? "var(--green)" : "var(--red)", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                          {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                          {isUp ? "+" : ""}{stock.changePercent.toFixed(2)}%
                        </span>
                      </td>
                      <td style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{stock.volume}</td>
                      <td style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{stock.marketCap}</td>
                      <td style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{stock.pe}</td>
                      <td><span className={`badge ${SECTOR_BADGE[stock.sector] || "badge-accent"}`}>{stock.sector}</span></td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }}>
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => toggleWatchlist(stock.ticker)}
                            style={{ color: inWatch ? "var(--yellow)" : "var(--text-muted)", padding: "5px 7px" }}
                          >
                            <Star size={13} fill={inWatch ? "var(--yellow)" : "none"} />
                          </button>
                          <button
                            id={`buy-btn-${stock.ticker}`}
                            className="btn btn-buy btn-sm"
                            onClick={() => setBuyModal({ stock, mode: "BUY" })}
                          >
                            <ShoppingCart size={12} /> Buy
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* ── Expanded chart row ─────────────────────── */}
                    {isSelected && (
                      <tr key={`${stock.ticker}-detail`}>
                        <td colSpan={8} style={{ padding: 0, background: "rgba(253,164,129,0.03)" }}>
                          <div style={{ padding: "18px 20px" }}>
                            <div style={{ display: "flex", gap: 16, justifyContent: "space-between", flexWrap: "wrap", marginBottom: 14 }}>
                              {/* Info */}
                              <div style={{ flex: 1, minWidth: 200 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{stock.name}</h3>
                                <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5, maxWidth: 420 }}>{stock.description}</p>
                                <div style={{ display: "flex", gap: 20, marginTop: 10, flexWrap: "wrap" }}>
                                  <div>
                                    <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>52W High</div>
                                    <div style={{ color: "var(--green)", fontWeight: 700, fontSize: 13 }}>${stock.high52}</div>
                                  </div>
                                  <div>
                                    <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>52W Low</div>
                                    <div style={{ color: "var(--red)", fontWeight: 700, fontSize: 13 }}>${stock.low52}</div>
                                  </div>
                                  <div>
                                    <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>P/E</div>
                                    <div style={{ fontWeight: 700, fontSize: 13 }}>{stock.pe}</div>
                                  </div>
                                  <div>
                                    <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>Volatility</div>
                                    <div style={{ color: stock.volatility === "extreme" ? "var(--red)" : stock.volatility === "high" ? "var(--yellow)" : "var(--green)", fontWeight: 700, fontSize: 13, textTransform: "capitalize" }}>{stock.volatility}</div>
                                  </div>
                                </div>
                              </div>
                              {/* Action buttons */}
                              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexShrink: 0 }}>
                                <button className="btn btn-sell btn-sm" onClick={() => setBuyModal({ stock, mode: "SELL" })}>Sell</button>
                                <button className="btn btn-buy btn-sm" onClick={() => setBuyModal({ stock, mode: "BUY" })}><ShoppingCart size={12} /> Buy</button>
                                <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)} style={{ padding: "5px 8px" }}><X size={13} /></button>
                              </div>
                            </div>

                            {/* Mini chart */}
                            <div style={{ width: "100%", height: 140 }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stock.history} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                  <defs>
                                    <linearGradient id={`grad-${stock.ticker}`} x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor={isUp ? "#2dd4a0" : "#B4182D"} stopOpacity={0.28} />
                                      <stop offset="100%" stopColor={isUp ? "#2dd4a0" : "#B4182D"} stopOpacity={0.01} />
                                    </linearGradient>
                                  </defs>
                                  <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
                                  <YAxis domain={["auto", "auto"]} hide />
                                  <Tooltip
                                    formatter={(v) => [`$${v.toFixed(2)}`, "Price"]}
                                    contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", fontSize: 12 }}
                                  />
                                  <Area type="monotone" dataKey="price" stroke={isUp ? "var(--green)" : "var(--red)"} strokeWidth={1.8} fill={`url(#grad-${stock.ticker})`} dot={false} />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><Search size={38} strokeWidth={1.5} color="var(--text-muted)" /></div>
            <div className="empty-state-text">No stocks found</div>
            <div className="empty-state-sub">Try a different search or sector</div>
          </div>
        )}
      </div>

      {/* Trade Modal */}
      {buyModal && (
        <BuyModal stock={buyModal.stock} mode={buyModal.mode} onClose={() => setBuyModal(null)} />
      )}
    </div>
  );
}
