// ============================================================
// Ticker.jsx — Animated Market Ticker Bar
// Scrolls stock prices across the top of the screen.
// ============================================================

import { useApp } from "../context/AppContext";

export default function Ticker() {
  const { state } = useApp();
  const { stocks } = state;

  // Double the array so the infinite scroll looks seamless
  const doubled = [...stocks, ...stocks];

  return (
    <div className="ticker-bar">
      <div className="ticker-track">
        {doubled.map((stock, idx) => {
          const isUp = stock.changePercent >= 0;
          return (
            <span className="ticker-item" key={`${stock.ticker}-${idx}`}>
              <span className="ticker-symbol">{stock.ticker}</span>
              <span className="ticker-price">${stock.price.toFixed(2)}</span>
              <span style={{ color: isUp ? "var(--green)" : "var(--red)", fontWeight: 700, fontSize: 12, display: "inline-flex", alignItems: "center", gap: 2 }}>
                <span style={{ display: "inline-block", width: 0, height: 0,
                  borderLeft: "4px solid transparent", borderRight: "4px solid transparent",
                  ...(isUp
                    ? { borderBottom: "5px solid var(--green)" }
                    : { borderTop: "5px solid var(--red)" })
                }} />
                {Math.abs(stock.changePercent).toFixed(2)}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
