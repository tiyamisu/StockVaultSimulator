// ============================================================
// Portfolio.jsx — Holdings, P&L, Charts (Fixed Layout)
// ============================================================

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { formatCurrency, calcPortfolioMetrics } from "../utils/stockSimulator";
import { SECTOR_COLORS } from "../data/mockStocks";
import BuyModal from "../components/BuyModal";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Portfolio() {
  const { state } = useApp();
  const { portfolio, stocks, walletBalance } = state;
  const navigate = useNavigate();
  const [sellModal, setSellModal] = useState(null);

  const metrics      = calcPortfolioMetrics(portfolio, stocks);
  const totalNetWorth = walletBalance + metrics.totalValue;
  const isPnlPositive = metrics.totalPnL >= 0;

  const sectorData = metrics.positions.reduce((acc, pos) => {
    const existing = acc.find((a) => a.name === pos.sector);
    if (existing) existing.value += pos.currentValue;
    else acc.push({ name: pos.sector, value: parseFloat(pos.currentValue.toFixed(2)) });
    return acc;
  }, []);

  const pnlChartData = metrics.positions.map((p) => ({
    ticker: p.ticker,
    pnl: parseFloat(p.pnl.toFixed(2)),
  }));

  if (portfolio.length === 0) {
    return (
      <div className="anim-fade-in" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div>
            <h1 className="page-title">Portfolio</h1>
            <p className="page-subtitle">Your investment holdings</p>
          </div>
        </div>
        <div className="glass-card">
          <div className="empty-state">
            <div className="empty-state-icon">💼</div>
            <div className="empty-state-text">Your portfolio is empty</div>
            <div className="empty-state-sub">You have {formatCurrency(walletBalance)} ready to invest</div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/market")}>
              Browse Market →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="anim-fade-in" style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Portfolio</h1>
          <p className="page-subtitle">{portfolio.length} position{portfolio.length !== 1 ? "s" : ""} · Real-time P&amp;L</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate("/market")}>+ Buy More</button>
      </div>

      {/* ── Stats Row ───────────────────────────────────────── */}
      <div className="grid-4">
        <div className="glass-card stat-card" style={{ borderTop: "2px solid var(--accent)" }}>
          <div className="stat-label">Net Worth</div>
          <div className="stat-value">{formatCurrency(totalNetWorth)}</div>
          <div className="stat-sub">Cash + Holdings</div>
        </div>
        <div className="glass-card stat-card" style={{ borderTop: "2px solid var(--cyan)" }}>
          <div className="stat-label">Portfolio Value</div>
          <div className="stat-value" style={{ color: "var(--cyan)" }}>{formatCurrency(metrics.totalValue)}</div>
          <div className="stat-sub">Market value</div>
        </div>
        <div className="glass-card stat-card" style={{ borderTop: "2px solid var(--green)" }}>
          <div className="stat-label">Cash</div>
          <div className="stat-value" style={{ color: "var(--green)" }}>{formatCurrency(walletBalance)}</div>
          <div className="stat-sub">Available</div>
        </div>
        <div className="glass-card stat-card" style={{ borderTop: `2px solid ${isPnlPositive ? "var(--green)" : "var(--red)"}` }}>
          <div className="stat-label">Total P&amp;L</div>
          <div className="stat-value" style={{ color: isPnlPositive ? "var(--green)" : "var(--red)" }}>
            {isPnlPositive ? "+" : ""}{formatCurrency(metrics.totalPnL)}
          </div>
          <div className="stat-sub" style={{ color: isPnlPositive ? "var(--green)" : "var(--red)" }}>
            {isPnlPositive ? "+" : ""}{metrics.totalPnLPercent.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* ── Charts Row ──────────────────────────────────────── */}
      <div className="grid-2">
        {/* Sector Pie */}
        <div className="glass-card" style={{ padding: "20px" }}>
          <div className="section-header">
            <span className="section-title">Sector Allocation</span>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 150, height: 150, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sectorData} cx="50%" cy="50%" innerRadius={40} outerRadius={68} paddingAngle={3} dataKey="value">
                    {sectorData.map((entry) => (
                      <Cell key={entry.name} fill={SECTOR_COLORS[entry.name] || "#6c63ff"} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => formatCurrency(v)}
                    contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 7 }}>
              {sectorData.map((s) => {
                const pct = ((s.value / metrics.totalValue) * 100).toFixed(1);
                return (
                  <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 9, height: 9, borderRadius: 2, background: SECTOR_COLORS[s.name] || "#6c63ff", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "var(--text-secondary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* P&L Bar Chart */}
        <div className="glass-card" style={{ padding: "20px" }}>
          <div className="section-header">
            <span className="section-title">P&amp;L by Position</span>
          </div>
          <div style={{ width: "100%", height: 170 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pnlChartData} margin={{ top: 4, right: 4, left: 0, bottom: 5 }}>
                <XAxis dataKey="ticker" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(v) => [formatCurrency(v), "P&L"]}
                  contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", fontSize: 12 }}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {pnlChartData.map((entry) => (
                    <Cell key={entry.ticker} fill={entry.pnl >= 0 ? "var(--green)" : "var(--red)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Holdings Table ───────────────────────────────────── */}
      <div className="glass-card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 16px 10px" }}>
          <span className="section-title">Holdings</span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: 130 }}>Stock</th>
                <th style={{ minWidth: 70 }}>Shares</th>
                <th style={{ minWidth: 90 }}>Avg Price</th>
                <th style={{ minWidth: 90 }}>Curr Price</th>
                <th style={{ minWidth: 100 }}>Value</th>
                <th style={{ minWidth: 95 }}>P&amp;L ($)</th>
                <th style={{ minWidth: 85 }}>P&amp;L (%)</th>
                <th style={{ minWidth: 80, textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {metrics.positions.map((pos) => {
                const isUp = pos.pnl >= 0;
                return (
                  <tr key={pos.ticker}>
                    <td>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{pos.ticker}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 1, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pos.stockName}</div>
                    </td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{pos.shares}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>${pos.avgPrice.toFixed(2)}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>${pos.currentPrice.toFixed(2)}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{formatCurrency(pos.currentValue)}</td>
                    <td>
                      <span style={{ color: isUp ? "var(--green)" : "var(--red)", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                        {isUp ? "+" : ""}{formatCurrency(pos.pnl)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isUp ? "badge-green" : "badge-red"}`}>
                        {isUp ? "+" : ""}{pos.pnlPercent.toFixed(2)}%
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-sell btn-sm"
                        id={`sell-btn-${pos.ticker}`}
                        onClick={() => setSellModal(stocks.find((s) => s.ticker === pos.ticker))}
                      >
                        Sell
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {sellModal && (
        <BuyModal stock={sellModal} mode="SELL" onClose={() => setSellModal(null)} />
      )}
    </div>
  );
}
