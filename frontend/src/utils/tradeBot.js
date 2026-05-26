// ============================================================
// tradeBot.js — TradeBot AI Finance Assistant
// Uses keyword-based pattern matching to give intelligent
// responses about stocks, portfolio, and market trends.
// No machine learning or API calls required!
// ============================================================

// Common financial Q&A pairs
const FAQ = {
  "what is p/e ratio": "The P/E ratio (Price-to-Earnings) measures how much investors pay per dollar of earnings. A high P/E (like NVDA's 67) means growth expectations are high. A low P/E (like PFE's 10) may indicate undervaluation or lower growth prospects.",
  "what is market cap": "Market capitalization = Share Price × Total Shares Outstanding. It classifies companies as: Large-cap (>$10B), Mid-cap ($2B–$10B), and Small-cap (<$2B). Larger companies are generally more stable.",
  "what is a dividend": "A dividend is a portion of a company's profits paid to shareholders — usually quarterly. Dividend-paying stocks like JNJ and ABBV are popular for income investors.",
  "what is volatility": "Volatility measures how much a stock's price swings. TSLA is highly volatile (extreme), while AAPL is more stable (low). Higher volatility = higher risk AND higher potential reward.",
  "what is a bull market": "A bull market is when stock prices are rising broadly, typically by 20% or more. Investor confidence is high. The opposite is a bear market.",
  "what is a bear market": "A bear market is a period of falling stock prices (typically down 20% from recent highs). Common during recessions. Bear markets create buying opportunities for long-term investors.",
  "what is diversification": "Diversification means spreading investments across different sectors/assets to reduce risk. Don't put all your eggs in one basket — a portfolio with Tech, Finance, and Healthcare is safer than all tech.",
  "what is dollar cost averaging": "Dollar-cost averaging (DCA) means investing a fixed amount regularly regardless of price. This reduces the impact of volatility over time — you buy more shares when prices are low.",
  "what is an etf": "An ETF (Exchange-Traded Fund) tracks an index like the S&P 500. It's like buying a basket of stocks at once — great for beginners who want diversification without picking individual stocks.",
};

// Ticker-specific analysis responses
const STOCK_ANALYSIS = {
  AAPL: { sentiment: "bullish", reason: "Apple has strong recurring services revenue, loyal customer base, and consistent buybacks. Good long-term hold." },
  GOOGL: { sentiment: "bullish", reason: "Google dominates search and is growing fast in cloud. AI integration into products looks promising." },
  MSFT: { sentiment: "bullish", reason: "Azure cloud growth + Copilot AI integration makes Microsoft a top-tier long-term investment." },
  NVDA: { sentiment: "bullish", reason: "NVIDIA is the backbone of the AI revolution. High P/E means expensive, but growth justifies it for many analysts." },
  META: { sentiment: "bullish", reason: "Meta's ad business is recovering strongly. Threads growth and AI investments look positive." },
  JPM: { sentiment: "neutral", reason: "JPMorgan is the gold standard of banking — stable earnings. Watch interest rate changes." },
  BAC: { sentiment: "neutral", reason: "Bank of America is well-capitalized but sensitive to rate cuts. Solid dividend payer." },
  GS: { sentiment: "neutral", reason: "Goldman benefits from M&A activity. Watch for investment banking deal flow as rates stabilize." },
  V:  { sentiment: "bullish", reason: "Visa's payment network is a near-monopoly with high margins. Excellent long-term compounder." },
  MA: { sentiment: "bullish", reason: "Mastercard's asset-light model and international expansion make it a quality growth stock." },
  XOM: { sentiment: "neutral", reason: "ExxonMobil's huge Permian Basin position is valuable. Oil prices are key — geopolitical risk exists." },
  CVX: { sentiment: "neutral", reason: "Chevron has a strong balance sheet and attractive dividend yield. Good for income-focused investors." },
  COP: { sentiment: "neutral", reason: "ConocoPhillips is a lean E&P company with strong free cash flow. Higher risk due to oil price dependence." },
  SLB: { sentiment: "bullish", reason: "SLB benefits from global oilfield services demand and international expansion." },
  JNJ: { sentiment: "bullish", reason: "Johnson & Johnson is a Dividend King — 60+ consecutive years of dividend increases. Very defensive." },
  PFE: { sentiment: "neutral", reason: "Pfizer faces near-term headwinds from COVID product decline. Pipeline execution is key to recovery." },
  UNH: { sentiment: "bullish", reason: "UnitedHealth's diversified business model shows consistent earnings growth. Premium valuation justified." },
  ABBV: { sentiment: "bullish", reason: "AbbVie's Skyrizi and Rinvoq are offsetting Humira biosimilar competition well." },
  AMZN: { sentiment: "bullish", reason: "AWS cloud growth + improving margins in retail make Amazon an exciting hold." },
  TSLA: { sentiment: "neutral", reason: "Tesla faces margin pressure but remains the EV leader. Highly volatile — not for weak stomachs!" },
};

/**
 * Generate a TradeBot response given user input.
 * @param {string} input - user's chat message
 * @param {Object} state - app state (stocks, portfolio, walletBalance)
 * @returns {string} TradeBot's response
 */
export function getTradeBotResponse(input, state) {
  const text = input.toLowerCase().trim();
  const { stocks = [], portfolio = [], walletBalance = 0 } = state;

  // ── Help / Greeting ──────────────────────────────────────
  if (text.match(/^(hi|hello|hey|greetings|start)/)) {
    return "👋 Hey there! I'm **TradeBot**, your AI finance assistant! I can help you with:\n\n• Stock analysis: *\"analyze AAPL\"*\n• Buy/sell advice: *\"should I buy NVDA?\"*\n• Portfolio review: *\"how is my portfolio?\"*\n• Market terms: *\"what is P/E ratio?\"*\n• Market overview: *\"market summary\"*\n\nWhat would you like to know? 📈";
  }

  if (text.match(/\bhelp\b/)) {
    return "📖 **TradeBot Commands:**\n\n• *\"analyze [TICKER]\"* — get stock analysis\n• *\"should I buy [TICKER]\"* — buy recommendation\n• *\"should I sell [TICKER]\"* — sell advice\n• *\"my portfolio\"* — portfolio summary\n• *\"market summary\"* — market overview\n• *\"what is [term]\"* — finance glossary\n• *\"top gainers\"* — best performing stocks\n• *\"top losers\"* — worst performing stocks\n\nTry: *\"analyze TSLA\"* 🚀";
  }

  // ── Market Overview ──────────────────────────────────────
  if (text.match(/market (summary|overview|today|status)/)) {
    const gainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3);
    const losers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 3);
    return `📊 **Market Summary**\n\n🟢 **Top Gainers:**\n${gainers.map((s) => `• ${s.ticker}: +${s.changePercent.toFixed(2)}% ($${s.price.toFixed(2)})`).join("\n")}\n\n🔴 **Top Losers:**\n${losers.map((s) => `• ${s.ticker}: ${s.changePercent.toFixed(2)}% ($${s.price.toFixed(2)})`).join("\n")}\n\n💡 Overall market sentiment looks **${gainers[0].changePercent > 1 ? "bullish 🐂" : "cautious 😐"}** today.`;
  }

  // ── Top Gainers / Losers ─────────────────────────────────
  if (text.match(/top (gainer|winner|best|gain)/)) {
    const gainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
    return `🚀 **Today's Top Gainers:**\n\n${gainers.map((s, i) => `${i + 1}. **${s.ticker}** — +${s.changePercent.toFixed(2)}% ($${s.price.toFixed(2)})`).join("\n")}\n\n💡 Strong momentum today! Consider these carefully before chasing rallies.`;
  }

  if (text.match(/top (loser|worst|fall|drop|loss)/)) {
    const losers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
    return `📉 **Today's Top Losers:**\n\n${losers.map((s, i) => `${i + 1}. **${s.ticker}** — ${s.changePercent.toFixed(2)}% ($${s.price.toFixed(2)})`).join("\n")}\n\n💡 Dips can be buying opportunities! Research before catching a falling knife.`;
  }

  // ── Portfolio Review ─────────────────────────────────────
  if (text.match(/(my )?(portfolio|holdings|positions)/)) {
    if (portfolio.length === 0) {
      return `💼 Your portfolio is currently **empty**! You have **$${walletBalance.toFixed(2)}** in your wallet.\n\n💡 Start by visiting the Market page and buying some stocks. Diversify across sectors for lower risk!`;
    }
    const holdings = portfolio.map((h) => {
      const stock = stocks.find((s) => s.ticker === h.ticker);
      const currentPrice = stock?.price || h.avgPrice;
      const pnl = (currentPrice - h.avgPrice) * h.shares;
      const sign = pnl >= 0 ? "+" : "";
      return `• **${h.ticker}** — ${h.shares} shares @ $${h.avgPrice.toFixed(2)} | P&L: **${sign}$${pnl.toFixed(2)}**`;
    });
    return `💼 **Your Portfolio** (Cash: $${walletBalance.toFixed(2)}):\n\n${holdings.join("\n")}\n\n💡 Tip: Aim for at least 5-7 stocks across different sectors for proper diversification.`;
  }

  // ── Stock Analysis (by ticker) ───────────────────────────
  const tickerMatch = text.match(/\b(AAPL|GOOGL|MSFT|NVDA|META|JPM|BAC|GS|V|MA|XOM|CVX|COP|SLB|JNJ|PFE|UNH|ABBV|AMZN|TSLA)\b/i);
  if (tickerMatch) {
    const ticker = tickerMatch[0].toUpperCase();
    const stock = stocks.find((s) => s.ticker === ticker);
    const analysis = STOCK_ANALYSIS[ticker];

    if (stock && analysis) {
      const emoji = analysis.sentiment === "bullish" ? "🟢" : analysis.sentiment === "bearish" ? "🔴" : "🟡";
      const owned = portfolio.find((p) => p.ticker === ticker);
      const ownedMsg = owned ? `\n\n📦 You own **${owned.shares} shares** of ${ticker}.` : "";

      // "Should I buy/sell" pattern
      if (text.match(/(should i |buy|purchase|invest in)/i)) {
        return `${emoji} **${ticker} — ${analysis.sentiment.toUpperCase()}**\n\n$${stock.price.toFixed(2)} (${stock.changePercent >= 0 ? "+" : ""}${stock.changePercent.toFixed(2)}%)\n\n${analysis.reason}${ownedMsg}\n\n⚠️ *This is simulated advice for educational purposes only. Always do your own research!*`;
      }
      if (text.match(/(should i sell|sell|exit)/i) && owned) {
        const pnl = (stock.price - owned.avgPrice) * owned.shares;
        const pnlPercent = ((stock.price - owned.avgPrice) / owned.avgPrice) * 100;
        const advice = pnlPercent > 15 ? "You're up nicely — consider taking partial profits!" : pnlPercent < -10 ? "You're down over 10%. Decide if the thesis still holds before selling at a loss." : "You're near breakeven. Hold unless your reasons for buying have changed.";
        return `📊 **${ticker} Sell Analysis**\n\nYou own ${owned.shares} shares at avg $${owned.avgPrice.toFixed(2)}.\nCurrent price: $${stock.price.toFixed(2)}\nP&L: **${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)} (${pnlPercent.toFixed(1)}%)**\n\n💡 ${advice}`;
      }

      return `📈 **${ticker} — ${stock.name}**\n\nPrice: **$${stock.price.toFixed(2)}** (${stock.changePercent >= 0 ? "+" : ""}${stock.changePercent.toFixed(2)}%)\nSector: ${stock.sector} | P/E: ${stock.pe} | Market Cap: ${stock.marketCap}\n\n${emoji} Sentiment: **${analysis.sentiment.toUpperCase()}**\n${analysis.reason}${ownedMsg}`;
    }
  }

  // ── Wallet / Balance ─────────────────────────────────────
  if (text.match(/(wallet|balance|cash|money|funds)/)) {
    return `💰 Your current wallet balance is **$${walletBalance.toFixed(2)}**.\n\n${walletBalance > 5000 ? "💡 You have plenty of buying power! Consider diversifying into 3-5 different stocks." : walletBalance > 1000 ? "💡 Good amount to work with. Even small positions can grow significantly over time!" : "💡 Tip: Every investor starts somewhere. Consider buying fractional positions in quality stocks."}`;
  }

  // ── Finance Glossary (FAQ) ───────────────────────────────
  for (const [question, answer] of Object.entries(FAQ)) {
    if (text.includes(question) || text.includes(question.replace("what is ", ""))) {
      return `📚 **${question.replace("what is ", "").replace(/\b\w/g, (c) => c.toUpperCase())}**\n\n${answer}`;
    }
  }

  // ── Investing tips ───────────────────────────────────────
  if (text.match(/(tip|advice|suggest|recommend|strategy|invest)/)) {
    const tips = [
      "🎯 **Tip:** Invest in what you understand. Warren Buffett says 'Never invest in a business you cannot understand.'",
      "📊 **Tip:** Time in the market beats timing the market. Long-term investors historically outperform short-term traders.",
      "🛡️ **Tip:** Never invest more than you can afford to lose. Keep an emergency fund separate from your investments.",
      "📈 **Tip:** Dollar-cost averaging (DCA) is great for beginners — invest a fixed amount every month regardless of price.",
      "🌍 **Tip:** Diversify! Spread investments across Tech, Finance, Healthcare, and Energy to reduce sector risk.",
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }

  // ── Default / Fallback ───────────────────────────────────
  const defaults = [
    "🤔 I didn't quite catch that. Try asking: *\"analyze AAPL\"*, *\"my portfolio\"*, or *\"market summary\"*.",
    "💡 I'm best at stock analysis! Try: *\"should I buy NVDA?\"* or *\"what is P/E ratio?\"*",
    "📈 Interesting question! For specific stock info, try: *\"analyze [TICKER]\"* — e.g., *\"analyze TSLA\"*",
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}
