// ============================================================
// TradeBotPage.jsx — Full-page AI Chat (Fixed Layout)
// Height is properly calculated using flex so it fills the
// remaining viewport without overflowing.
// ============================================================

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Lightbulb } from "lucide-react";
import { getTradeBotResponse } from "../utils/tradeBot";
import { useApp } from "../context/AppContext";

function parseMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em style='color:var(--accent)'>$1</em>")
    .replace(/\n/g, "<br/>");
}

const INITIAL_MESSAGES = [
  {
    id: 1, from: "bot",
    text: "Welcome to **TradeBot AI**! I'm your personal finance assistant.\n\nI can help you:\n• **Analyze stocks** — *\"analyze NVDA\"*\n• **Get advice** — *\"should I buy AAPL?\"*\n• **Review portfolio** — *\"my portfolio\"*\n• **Market overview** — *\"market summary\"*\n• **Learn concepts** — *\"what is P/E ratio?\"*",
    time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  },
];

const QUICK_PROMPTS = [
  { label: "Analyze AAPL",   text: "analyze AAPL"     },
  { label: "Top Gainers",    text: "top gainers"       },
  { label: "My Portfolio",   text: "my portfolio"      },
  { label: "Market Summary", text: "market summary"    },
  { label: "Invest Tips",    text: "investment tips"   },
  { label: "P/E Ratio?",     text: "what is P/E ratio" },
];

export default function TradeBotPage() {
  const { state }       = useApp();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput]       = useState("");
  const [typing, setTyping]     = useState(false);
  const messagesEndRef           = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function sendMessage(text) {
    if (!text.trim()) return;
    const userMsg = {
      id: Date.now(), from: "user", text: text.trim(),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const response = getTradeBotResponse(text, state);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1, from: "bot", text: response,
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      }]);
      setTyping(false);
    }, 400 + Math.random() * 500);
  }

  return (
    /* The outer div uses flexbox and fills the full page height.
       overflow:hidden prevents double scroll bars. */
    <div
      className="anim-fade-in"
      style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, gap: 14 }}
    >
      {/* ── Header ────────────────────────────────────────── */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "var(--r-md)",
            background: "linear-gradient(135deg, var(--accent), var(--plum))",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(253,164,129,0.3)", flexShrink: 0,
          }}>
            <Bot size={22} color="white" />
          </div>
          <div>
            <h1 className="page-title">TradeBot AI</h1>
            <p className="page-subtitle" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, background: "var(--green)", borderRadius: "50%", display: "inline-block", animation: "pulse-dot 2s infinite" }} />
              AI Finance Assistant · Keyword-powered
            </p>
          </div>
        </div>
      </div>

      {/* ── Quick Chips ───────────────────────────────────── */}
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", flexShrink: 0 }}>
        {QUICK_PROMPTS.map((p) => (
          <button key={p.text} onClick={() => sendMessage(p.text)} style={{
            background: "rgba(253,164,129,0.08)", border: "1px solid rgba(253,164,129,0.2)",
            borderRadius: "var(--r-full)", color: "var(--accent)", fontSize: 12, fontWeight: 600,
            padding: "5px 12px", cursor: "pointer", fontFamily: "inherit", transition: "all var(--t-fast)",
          }}
            onMouseEnter={(e) => { e.target.style.background = "rgba(253,164,129,0.18)"; e.target.style.borderColor = "var(--accent)"; }}
            onMouseLeave={(e) => { e.target.style.background = "rgba(253,164,129,0.08)"; e.target.style.borderColor = "rgba(253,164,129,0.2)"; }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Chat Card (fills remaining space) ─────────────── */}
      <div
        className="glass-card"
        style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        {/* Messages scroll area */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{
              display: "flex", gap: 10,
              flexDirection: msg.from === "user" ? "row-reverse" : "row",
              alignItems: "flex-end",
            }}>
              {msg.from === "bot" && (
                <div style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--accent), var(--plum))",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Bot size={14} color="white" />
                </div>
              )}
              <div style={{ maxWidth: "74%", minWidth: 0 }}>
                <div style={{
                  background: msg.from === "bot"
                    ? "var(--bg-card)"
                    : "linear-gradient(135deg, var(--accent), var(--accent-dark))",
                  border: msg.from === "bot" ? "1px solid var(--border)" : "none",
                  borderRadius: msg.from === "bot" ? "14px 14px 14px 4px" : "14px 14px 4px 14px",
                  padding: "10px 15px", fontSize: 13.5, lineHeight: 1.55,
                }}>
                  <div dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }} />
                </div>
                <div style={{
                  fontSize: 10.5, color: "var(--text-muted)", marginTop: 3,
                  textAlign: msg.from === "user" ? "right" : "left",
                }}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--cyan-dark))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Bot size={14} color="white" />
              </div>
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px 14px 14px 4px", padding: "10px 15px" }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", opacity: 0.6, animation: `typingBounce 1.2s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Disclaimer bar */}
        <div style={{
          padding: "7px 20px", background: "var(--bg-surface)", borderTop: "1px solid var(--border)",
          display: "flex", gap: 7, alignItems: "center", flexShrink: 0,
        }}>
          <Lightbulb size={12} color="var(--yellow)" />
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>TradeBot provides simulated educational advice only. Not real financial guidance.</span>
        </div>

        {/* Input bar */}
        <div style={{
          padding: "12px 20px", background: "var(--bg-surface)", borderTop: "1px solid var(--border)",
          display: "flex", gap: 10, flexShrink: 0,
        }}>
          <input
            id="tradebot-input"
            className="input"
            placeholder="Ask TradeBot anything... (e.g. 'analyze TSLA', 'should I buy NVDA?')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            style={{ fontSize: 13.5, borderRadius: "var(--r-full)", flex: 1 }}
          />
          <button
            className="btn btn-primary"
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            style={{ borderRadius: "var(--r-full)", padding: "9px 18px", flexShrink: 0 }}
          >
            <Send size={15} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
