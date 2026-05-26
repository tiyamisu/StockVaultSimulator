// ============================================================
// App.jsx — Main Application Router
// Handles routing, authentication guard, and live price updates.
// The price simulation runs here via setInterval every 3 seconds.
// ============================================================

import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { simulatePriceTick } from "./utils/stockSimulator";

// Pages
import Login         from "./pages/Login";
import Dashboard     from "./pages/Dashboard";
import Market        from "./pages/Market";
import Portfolio     from "./pages/Portfolio";
import Transactions  from "./pages/Transactions";
import Watchlist     from "./pages/Watchlist";
import TradeBotPage  from "./pages/TradeBotPage";

// Layout components
import Sidebar  from "./components/Sidebar";
import Ticker   from "./components/Ticker";
import ChatBot  from "./components/ChatBot";

// ── Authenticated Layout Wrapper ─────────────────────────────
// This wraps all protected pages with the sidebar + ticker bar.
// It also runs the stock price simulation timer.
function AuthLayout({ children }) {
  const { state, dispatch } = useApp();

  // ── Live price simulation: updates every 3 seconds ────────
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedStocks = simulatePriceTick(state.stocks);
      dispatch({ type: "UPDATE_PRICES", payload: updatedStocks });
    }, 3000); // 3-second tick

    return () => clearInterval(interval); // cleanup on unmount
  }, [state.stocks, dispatch]);

  return (
    <div className="app-shell">
      {/* Fixed-width sidebar */}
      <Sidebar />

      {/* Main content area — flex column, no overflow so children control their own scroll */}
      <div className="main-content">
        {/* Sticky ticker at top */}
        <Ticker />

        {/* Scrollable page area — also a flex container so TradeBotPage can fill height */}
        <main className="page-content" style={{ display: "flex", flexDirection: "column" }}>
          {children}
        </main>
      </div>

      {/* Floating TradeBot chat bubble */}
      <ChatBot />
    </div>
  );
}

// ── Route Guard: redirect to login if not authenticated ──────
function ProtectedRoute({ children }) {
  const { state } = useApp();
  if (!state.user) return <Navigate to="/" replace />;
  return <AuthLayout>{children}</AuthLayout>;
}

// ── App Root ─────────────────────────────────────────────────
function AppRoutes() {
  const { state } = useApp();
  return (
    <Routes>
      {/* Public: Login page */}
      <Route
        path="/"
        element={state.user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* Protected: All dashboard pages */}
      <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>}   />
      <Route path="/market"       element={<ProtectedRoute><Market /></ProtectedRoute>}       />
      <Route path="/portfolio"    element={<ProtectedRoute><Portfolio /></ProtectedRoute>}    />
      <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
      <Route path="/watchlist"    element={<ProtectedRoute><Watchlist /></ProtectedRoute>}    />
      <Route path="/tradebot"     element={<ProtectedRoute><TradeBotPage /></ProtectedRoute>} />

      {/* Fallback: redirect unknown paths */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ── Main Export ──────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
