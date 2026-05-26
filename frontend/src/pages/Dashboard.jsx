// ============================================================
// Dashboard.jsx — Main Analytics Dashboard (Fixed Layout)
// ============================================================

import { useApp } from "../context/AppContext";
import { formatCurrency, calcPortfolioMetrics } from "../utils/stockSimulator";
import { MARKET_INDICES, NEWS_HEADLINES, SECTOR_COLORS } from "../data/mockStocks";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Briefcase, Activity, Newspaper } from "lucide-react";

// Custom chart tooltip
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-elevated)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-md)",
      padding: "8px 12px",
      fontSize: 13,
    }}>
      <div style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 3 }}>{label}</div>
      <div style={{ fontWeight: 700, color: "var(--green)", fontFamily: "'JetBrains Mono', monospace" }}>
        {formatCurrency(payload[0].value)}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { state } = useApp();
  const { stocks, portfolio, walletBalance, transactions } = state;

  const metrics      = calcPortfolioMetrics(portfolio, stocks);
  const totalNetWorth = walletBalance + metrics.totalValue;
  const isPnlPositive = metrics.totalPnL >= 0;

  // Top movers
  const sorted     = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
  const topGainers = sorted.slice(0, 4);
  const topLosers  = sorted.slice(-4).reverse();

  // Allocation pie data
  const allocationData = metrics.positions.reduce((acc, pos) => {
    const existing = acc.find((a) => a.name === pos.sector);
    if (existing) existing.value += pos.currentValue;
    else acc.push({ name: pos.sector, value: pos.currentValue });
    return acc;
  }, []);

  // 14-day simulated chart
  const chartData = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    const v = totalNetWorth * (0.88 + i * 0.008) * (1 + Math.sin(i * 0.8) * 0.03);
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: parseFloat(v.toFixed(2)),
    };
  });
  chartData[chartData.length - 1].value = parseFloat(totalNetWorth.toFixed(2));

  return (
    <div className="anim-fade-in" style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* ── Page Header ───────────────────────────────────── */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 7,
          background: "var(--green-bg)", border: "1px solid rgba(0,255,136,0.2)",
          borderRadius: "var(--r-full)", padding: "5px 14px", flexShrink: 0,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", display: "inline-block", animation: "pulse-dot 2s infinite" }} />
          <span style={{ color: "var(--green)", fontSize: 12.5, fontWeight: 600 }}>Live Market</span>
        </div>
      </div>

      {/* ── Row 1: Market Indices ──────────────────────────── */}
      <div className="grid-4">
        {MARKET_INDICES.map((idx) => (
          <div key={idx.ticker} className="glass-card stat-card">
            <div className="stat-label">{idx.name}</div>
            <div className="stat-value" style={{ fontSize: 20 }}>
              {idx.value.toLocaleString()}
            </div>
            <div className="stat-sub" style={{ color: idx.change >= 0 ? "var(--green)" : "var(--red)", fontWeight: 600 }}>
              {idx.change >= 0 ? "▲ +" : "▼ "}{idx.change.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 2: Portfolio Stats ─────────────────────────── */}
      <div className="grid-4">
        <div className="glass-card stat-card" style={{ borderTop: "2px solid var(--accent)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <DollarSign size={14} color="var(--accent-light)" />
            <span className="stat-label" style={{ marginBottom: 0 }}>Net Worth</span>
          </div>
          <div className="stat-value">{formatCurrency(totalNetWorth)}</div>
          <div className="stat-sub">Cash + Portfolio</div>
        </div>

        <div className="glass-card stat-card" style={{ borderTop: "2px solid var(--cyan)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Briefcase size={14} color="var(--cyan)" />
            <span className="stat-label" style={{ marginBottom: 0 }}>Portfolio</span>
          </div>
          <div className="stat-value" style={{ color: "var(--cyan)" }}>{formatCurrency(metrics.totalValue)}</div>
          <div className="stat-sub">{portfolio.length} positions</div>
        </div>

        <div className="glass-card stat-card" style={{ borderTop: "2px solid var(--green)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Activity size={14} color="var(--green)" />
            <span className="stat-label" style={{ marginBottom: 0 }}>Cash</span>
          </div>
          <div className="stat-value" style={{ color: "var(--green)" }}>{formatCurrency(walletBalance)}</div>
          <div className="stat-sub">Available</div>
        </div>

        <div className="glass-card stat-card" style={{ borderTop: `2px solid ${isPnlPositive ? "var(--green)" : "var(--red)"}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            {isPnlPositive
              ? <TrendingUp size={14} color="var(--green)" />
              : <TrendingDown size={14} color="var(--red)" />}
            <span className="stat-label" style={{ marginBottom: 0 }}>Total P&amp;L</span>
          </div>
          <div className="stat-value" style={{ color: isPnlPositive ? "var(--green)" : "var(--red)" }}>
            {isPnlPositive ? "+" : ""}{formatCurrency(metrics.totalPnL)}
          </div>
          <div className="stat-sub" style={{ color: isPnlPositive ? "var(--green)" : "var(--red)" }}>
            {isPnlPositive ? "+" : ""}{metrics.totalPnLPercent.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* ── Row 3: Chart + Allocation ──────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>

        {/* Area Chart */}
        <div className="glass-card" style={{ padding: "20px 20px 16px" }}>
          <div className="section-header">
            <span className="section-title">Portfolio Performance</span>
            <span style={{
              fontSize: 11, color: "var(--text-muted)",
              background: "var(--bg-glass-hover)", padding: "3px 10px",
              borderRadius: "var(--r-full)", border: "1px solid var(--border)",
            }}>14-Day</span>
          </div>
          {/* height must be explicit; parent can't be 'auto' for Recharts */}
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6c63ff" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6c63ff" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2} fill="url(#portfolioGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocation Pie */}
        <div className="glass-card" style={{ padding: "20px" }}>
          <div className="section-header">
            <span className="section-title">Allocation</span>
          </div>
          {allocationData.length > 0 ? (
            <>
              <div style={{ width: "100%", height: 140 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={allocationData} cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={4} dataKey="value">
                      {allocationData.map((entry) => (
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
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 8 }}>
                {allocationData.map((entry) => {
                  const pct = metrics.totalValue > 0 ? ((entry.value / metrics.totalValue) * 100).toFixed(1) : "0.0";
                  return (
                    <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 9, height: 9, borderRadius: 2, background: SECTOR_COLORS[entry.name] || "#6c63ff", flexShrink: 0 }} />
                      <span style={{ fontSize: 11.5, color: "var(--text-secondary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.name}</span>
                      <span style={{ fontSize: 11.5, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "24px 0", color: "var(--text-muted)", textAlign: "center" }}>
              <span style={{ fontSize: 30 }}>🥧</span>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>No holdings yet</span>
              <span style={{ fontSize: 12 }}>Buy stocks to see allocation</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 4: Top Gainers & Losers ────────────────────── */}
      <div className="grid-2">
        {/* Gainers */}
        <div className="glass-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 16px 10px", display: "flex", alignItems: "center", gap: 7 }}>
            <TrendingUp size={15} color="var(--green)" />
            <span className="section-title">Top Gainers</span>
          </div>
          {topGainers.map((stock) => (
            <div key={stock.ticker} style={{
              display: "flex", alignItems: "center",
              padding: "9px 16px", borderTop: "1px solid var(--border)",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stock.ticker}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{stock.sector}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 13 }}>${stock.price.toFixed(2)}</div>
                <div style={{ color: "var(--green)", fontSize: 12, fontWeight: 600 }}>▲ +{stock.changePercent.toFixed(2)}%</div>
              </div>
            </div>
          ))}
        </div>

        {/* Losers */}
        <div className="glass-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 16px 10px", display: "flex", alignItems: "center", gap: 7 }}>
            <TrendingDown size={15} color="var(--red)" />
            <span className="section-title">Top Losers</span>
          </div>
          {topLosers.map((stock) => (
            <div key={stock.ticker} style={{
              display: "flex", alignItems: "center",
              padding: "9px 16px", borderTop: "1px solid var(--border)",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stock.ticker}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{stock.sector}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 13 }}>${stock.price.toFixed(2)}</div>
                <div style={{ color: "var(--red)", fontSize: 12, fontWeight: 600 }}>▼ {stock.changePercent.toFixed(2)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 5: News Feed ───────────────────────────────── */}
      <div className="glass-card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 16px 10px", display: "flex", alignItems: "center", gap: 7 }}>
          <Newspaper size={15} color="var(--cyan)" />
          <span className="section-title">Market News</span>
        </div>
        {NEWS_HEADLINES.map((news) => (
          <div key={news.id} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 16px", borderTop: "1px solid var(--border)",
            cursor: "pointer", transition: "background var(--t-fast)",
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-glass-hover)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: news.sentiment === "positive" ? "var(--green)" : "var(--red)", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{news.headline}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <span style={{ background: "var(--bg-glass-hover)", border: "1px solid var(--border)", borderRadius: "var(--r-full)", padding: "1px 9px", fontSize: 10.5, fontWeight: 700, color: "var(--accent-light)" }}>{news.ticker}</span>
              <span style={{ fontSize: 11.5, color: "var(--text-muted)", minWidth: 44, textAlign: "right" }}>{news.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent Trades ──────────────────────────────────── */}
      {transactions.length > 0 && (
        <div className="glass-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 16px 10px" }}>
            <span className="section-title">Recent Trades</span>
          </div>
          {transactions.slice(0, 3).map((txn) => (
            <div key={txn.id} style={{
              display: "flex", alignItems: "center",
              padding: "10px 16px", borderTop: "1px solid var(--border)",
            }}>
              <span className={`badge ${txn.type === "BUY" ? "badge-green" : "badge-red"}`} style={{ minWidth: 42, justifyContent: "center", marginRight: 12 }}>{txn.type}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: 700 }}>{txn.ticker}</span>
                <span style={{ color: "var(--text-muted)", fontSize: 12.5, marginLeft: 8 }}>{txn.shares} shares @ ${txn.price.toFixed(2)}</span>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 14, color: txn.type === "BUY" ? "var(--red)" : "var(--green)", flexShrink: 0 }}>
                {txn.type === "BUY" ? "−" : "+"}{formatCurrency(txn.total)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
