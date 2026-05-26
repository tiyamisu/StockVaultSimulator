// ============================================================
// stockSimulator.js — Live Price Simulation Engine
// Simulates stock market price movements using a simple
// random-walk algorithm. Called every 3 seconds from App.jsx.
// ============================================================

// Volatility multipliers for each stock volatility level
const VOLATILITY_MAP = {
  low:     0.003,   // ±0.3%  — stable blue chips (AAPL, MSFT)
  normal:  0.007,   // ±0.7%  — average stocks
  high:    0.014,   // ±1.4%  — volatile stocks (NVDA, COP)
  extreme: 0.025,   // ±2.5%  — TSLA-level chaos
};

/**
 * Simulate one price tick for all stocks.
 * Uses a biased random walk: slightly more likely to go up (bull market bias).
 *
 * @param {Array} stocks - current stocks array from state
 * @returns {Array} updated stocks array with new prices
 */
export function simulatePriceTick(stocks) {
  return stocks.map((stock) => {
    const volatility = VOLATILITY_MAP[stock.volatility] || VOLATILITY_MAP.normal;

    // Random walk: uniform random with slight upward bias (0.48 center instead of 0.5)
    const randomFactor = (Math.random() - 0.48) * 2 * volatility;
    const newPrice = Math.max(0.01, stock.price * (1 + randomFactor));
    const roundedPrice = parseFloat(newPrice.toFixed(2));

    // Calculate change from initial base (use first history point as reference)
    const basePrice = stock.history[0]?.price || roundedPrice;
    const totalChange = roundedPrice - basePrice;
    const totalChangePercent = (totalChange / basePrice) * 100;

    // Append to history (keep last 50 points for charting)
    const now = new Date();
    const timeLabel = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const newHistoryPoint = { date: timeLabel, price: roundedPrice };
    const updatedHistory = [...stock.history.slice(-49), newHistoryPoint];

    return {
      ...stock,
      price: roundedPrice,
      change: parseFloat(totalChange.toFixed(2)),
      changePercent: parseFloat(totalChangePercent.toFixed(2)),
      history: updatedHistory,
    };
  });
}

/**
 * Format a number as currency string.
 * e.g., 1234.5 → "$1,234.50"
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a large number with suffix (B/T/M).
 * e.g., passed as a string like "2.95T" — already formatted in mock data.
 */
export function formatMarketCap(cap) {
  return cap; // already formatted in mockStocks
}

/**
 * Calculate portfolio metrics from holdings and live stock prices.
 * @param {Array} portfolio - user's holdings
 * @param {Array} stocks    - live stock prices
 * @returns {Object} metrics object
 */
export function calcPortfolioMetrics(portfolio, stocks) {
  let totalValue = 0;
  let totalCost = 0;

  const positions = portfolio.map((holding) => {
    const stock = stocks.find((s) => s.ticker === holding.ticker);
    const currentPrice = stock?.price || holding.avgPrice;
    const currentValue = currentPrice * holding.shares;
    const cost = holding.avgPrice * holding.shares;
    const pnl = currentValue - cost;
    const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;

    totalValue += currentValue;
    totalCost += cost;

    return {
      ...holding,
      currentPrice,
      currentValue: parseFloat(currentValue.toFixed(2)),
      cost: parseFloat(cost.toFixed(2)),
      pnl: parseFloat(pnl.toFixed(2)),
      pnlPercent: parseFloat(pnlPercent.toFixed(2)),
      stockName: stock?.name || holding.ticker,
      sector: stock?.sector || "Unknown",
    };
  });

  const totalPnL = totalValue - totalCost;
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  return {
    positions,
    totalValue: parseFloat(totalValue.toFixed(2)),
    totalCost: parseFloat(totalCost.toFixed(2)),
    totalPnL: parseFloat(totalPnL.toFixed(2)),
    totalPnLPercent: parseFloat(totalPnLPercent.toFixed(2)),
  };
}
