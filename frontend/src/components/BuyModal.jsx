// ============================================================
// BuyModal.jsx — Trade Execution Modal (Buy & Sell)
// Shows stock details, quantity picker, and confirms the trade.
// ============================================================

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/stockSimulator";
import { X, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, ShoppingCart, Banknote } from "lucide-react";

/**
 * @param {Object} stock  - The stock being traded
 * @param {string} mode   - "BUY" or "SELL"
 * @param {Function} onClose - Close the modal
 */
export default function BuyModal({ stock, mode, onClose }) {
  const { state, dispatch } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [success, setSuccess] = useState(false);

  if (!stock) return null;

  // Find how many shares the user holds (for selling)
  const holding = state.portfolio.find((p) => p.ticker === stock.ticker);
  const sharesOwned = holding?.shares || 0;

  const totalCost    = quantity * stock.price;
  const canAffordBuy = totalCost <= state.walletBalance;
  const canSell      = mode === "SELL" && quantity <= sharesOwned;
  const canExecute   = mode === "BUY" ? canAffordBuy : canSell;

  function handleConfirm() {
    if (!canExecute) return;
    dispatch({
      type: mode === "BUY" ? "BUY_STOCK" : "SELL_STOCK",
      payload: { ticker: stock.ticker, shares: quantity, price: stock.price },
    });
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  }

  const isUp = stock.changePercent >= 0;

  return (
    <div className="modal-overlay anim-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box anim-fade-up" style={{ maxWidth: 400 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 2 }}>
              {mode === "BUY" ? "Buy" : "Sell"} {stock.ticker}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>{stock.name}</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "var(--bg-glass-hover)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "6px", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Success state */}
        {success && (
          <div style={{ background: "var(--green-bg)", border: "1px solid var(--green)", borderRadius: "var(--r-md)", padding: "16px", textAlign: "center", color: "var(--green)", fontWeight: 700, fontSize: 16, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <CheckCircle2 size={20} />
            {mode === "BUY" ? "Purchase" : "Sale"} Successful!
          </div>
        )}

        {!success && (
          <>
            {/* Stock Price Info */}
            <div className="glass-card" style={{ padding: "16px 20px", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                    ${stock.price.toFixed(2)}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    {isUp ? <TrendingUp size={14} color="var(--green)" /> : <TrendingDown size={14} color="var(--red)" />}
                    <span style={{ color: isUp ? "var(--green)" : "var(--red)", fontSize: 13, fontWeight: 600 }}>
                      {isUp ? "+" : ""}{stock.changePercent.toFixed(2)}% today
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                    {mode === "BUY" ? "Available Cash" : "Shares Owned"}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: mode === "BUY" ? "var(--accent)" : "var(--accent-light)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {mode === "BUY" ? formatCurrency(state.walletBalance) : `${sharesOwned} shares`}
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity Input */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                Number of Shares
              </label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{ width: 40, justifyContent: "center" }}
                >
                  −
                </button>
                <input
                  type="number"
                  className="input"
                  value={quantity}
                  min={1}
                  max={mode === "SELL" ? sharesOwned : 9999}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ textAlign: "center", fontSize: 18, fontWeight: 700 }}
                />
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setQuantity((q) => mode === "SELL" ? Math.min(sharesOwned, q + 1) : q + 1)}
                  style={{ width: 40, justifyContent: "center" }}
                >
                  +
                </button>
              </div>

              {/* Quick select buttons */}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                {mode === "BUY"
                  ? [1, 5, 10, 25].map((q) => (
                      <button key={q} className={`btn btn-sm btn-ghost`} onClick={() => setQuantity(q)} style={{ flex: 1, justifyContent: "center", background: quantity === q ? "rgba(108,99,255,0.15)" : "" }}>
                        {q}
                      </button>
                    ))
                  : [1, Math.floor(sharesOwned * 0.25), Math.floor(sharesOwned * 0.5), sharesOwned].filter((v, i, a) => a.indexOf(v) === i && v > 0).map((q) => (
                      <button key={q} className="btn btn-sm btn-ghost" onClick={() => setQuantity(q)} style={{ flex: 1, justifyContent: "center", background: quantity === q ? "rgba(108,99,255,0.15)" : "" }}>
                        {q === sharesOwned ? "All" : q}
                      </button>
                    ))
                }
              </div>
            </div>

            {/* Order Summary */}
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "16px", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                <span>Price per share</span>
                <span className="font-mono">${stock.price.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                <span>Shares</span>
                <span>{quantity}</span>
              </div>
              <div style={{ height: 1, background: "var(--border)", margin: "10px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800 }}>
                <span>{mode === "BUY" ? "Total Cost" : "Total Revenue"}</span>
                <span style={{ color: mode === "BUY" ? "var(--red)" : "var(--green)", fontFamily: "'JetBrains Mono', monospace" }}>
                  {mode === "BUY" ? "-" : "+"}{formatCurrency(totalCost)}
                </span>
              </div>
            </div>

            {/* Warning if can't afford */}
            {!canExecute && (
              <div style={{ display: "flex", gap: 8, background: "var(--red-bg)", border: "1px solid rgba(180,24,45,0.35)", borderRadius: "var(--r-md)", padding: "12px", marginBottom: 16, color: "#ff6b7a", fontSize: 13 }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                {mode === "BUY" ? "Insufficient funds. Reduce quantity or add more cash." : "You don't have enough shares to sell."}
              </div>
            )}

            {/* Confirm Button */}
            <button
              className={`btn ${mode === "BUY" ? "btn-buy" : "btn-sell"} btn-full btn-lg`}
              onClick={handleConfirm}
              disabled={!canExecute}
            >
              {mode === "BUY"
                ? <><ShoppingCart size={16} /> Confirm Purchase</>
                : <><Banknote size={16} /> Confirm Sale</>}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
