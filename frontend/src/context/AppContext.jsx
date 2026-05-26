// ============================================================
// AppContext.jsx — Global State Management
// Uses React Context + useReducer to manage:
//   - User authentication
//   - Wallet balance
//   - Portfolio holdings
//   - Watchlist
//   - Transaction history
//   - Live stock prices
// Data is persisted to localStorage so it survives page refresh.
// ============================================================

import { createContext, useContext, useReducer, useEffect } from "react";
import { INITIAL_STOCKS } from "../data/mockStocks";

// ── Load saved state from localStorage (or use defaults) ────
const loadState = () => {
  try {
    const saved = localStorage.getItem("stockvault_state");
    if (saved) return JSON.parse(saved);
  } catch { }
  return null;
};

const DEFAULT_STATE = {
  user: null,                          // logged-in user object
  walletBalance: 10000.00,             // starting cash balance
  stocks: INITIAL_STOCKS,             // live stock list
  portfolio: [],                       // [{ ticker, shares, avgPrice, purchaseDate }]
  transactions: [],                    // full trade history
  watchlist: ["AAPL", "NVDA", "TSLA"],// default watchlist tickers
};

// ── Reducer: handles all state transitions ───────────────────
function appReducer(state, action) {
  switch (action.type) {

    // ── Auth ───────────────────────────────────────────────
    case "LOGIN":
      return { ...state, user: action.payload };

    case "LOGOUT":
      return { ...DEFAULT_STATE, stocks: state.stocks }; // keep live prices

    // ── Update live stock prices (called by simulator) ─────
    case "UPDATE_PRICES":
      return { ...state, stocks: action.payload };

    // ── Buy a stock ────────────────────────────────────────
    case "BUY_STOCK": {
      const { ticker, shares, price } = action.payload;
      const totalCost = shares * price;

      // Deduct from wallet
      const newBalance = parseFloat((state.walletBalance - totalCost).toFixed(2));

      // Update portfolio: add to existing position or create new
      const existingIdx = state.portfolio.findIndex((p) => p.ticker === ticker);
      let newPortfolio;
      if (existingIdx >= 0) {
        const existing = state.portfolio[existingIdx];
        const totalShares = existing.shares + shares;
        const avgPrice = parseFloat(
          ((existing.avgPrice * existing.shares + price * shares) / totalShares).toFixed(2)
        );
        newPortfolio = state.portfolio.map((p, i) =>
          i === existingIdx ? { ...p, shares: totalShares, avgPrice } : p
        );
      } else {
        newPortfolio = [
          ...state.portfolio,
          { ticker, shares, avgPrice: parseFloat(price.toFixed(2)), purchaseDate: new Date().toISOString() },
        ];
      }

      // Record transaction
      const txn = {
        id: Date.now(),
        type: "BUY",
        ticker,
        shares,
        price: parseFloat(price.toFixed(2)),
        total: parseFloat(totalCost.toFixed(2)),
        date: new Date().toISOString(),
      };

      return { ...state, walletBalance: newBalance, portfolio: newPortfolio, transactions: [txn, ...state.transactions] };
    }

    // ── Sell a stock ───────────────────────────────────────
    case "SELL_STOCK": {
      const { ticker, shares, price } = action.payload;
      const totalRevenue = shares * price;

      // Add to wallet
      const newBalance = parseFloat((state.walletBalance + totalRevenue).toFixed(2));

      // Update portfolio
      const existingIdx = state.portfolio.findIndex((p) => p.ticker === ticker);
      let newPortfolio;
      if (existingIdx >= 0) {
        const remaining = state.portfolio[existingIdx].shares - shares;
        if (remaining <= 0) {
          newPortfolio = state.portfolio.filter((_, i) => i !== existingIdx);
        } else {
          newPortfolio = state.portfolio.map((p, i) =>
            i === existingIdx ? { ...p, shares: remaining } : p
          );
        }
      } else {
        newPortfolio = state.portfolio;
      }

      // Record transaction
      const txn = {
        id: Date.now(),
        type: "SELL",
        ticker,
        shares,
        price: parseFloat(price.toFixed(2)),
        total: parseFloat(totalRevenue.toFixed(2)),
        date: new Date().toISOString(),
      };

      return { ...state, walletBalance: newBalance, portfolio: newPortfolio, transactions: [txn, ...state.transactions] };
    }

    // ── Watchlist ──────────────────────────────────────────
    case "ADD_WATCHLIST":
      if (state.watchlist.includes(action.payload)) return state;
      return { ...state, watchlist: [...state.watchlist, action.payload] };

    case "REMOVE_WATCHLIST":
      return { ...state, watchlist: state.watchlist.filter((t) => t !== action.payload) };

    default:
      return state;
  }
}

// ── Context setup ────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const savedState = loadState();
  const initialState = savedState
    ? { ...savedState, stocks: INITIAL_STOCKS } // always fresh prices on boot
    : DEFAULT_STATE;

  const [state, dispatch] = useReducer(appReducer, initialState);

  // Persist state to localStorage on every change (except live prices)
  useEffect(() => {
    const { stocks, ...persistable } = state; // don't persist live prices
    localStorage.setItem("stockvault_state", JSON.stringify(persistable));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook for easy access
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
