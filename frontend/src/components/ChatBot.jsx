// ============================================================
// ChatBot.jsx — TradeBot AI Finance Assistant (Floating)
// A floating chat bubble that provides AI-powered (keyword-based)
// stock market guidance and portfolio analysis.
// ============================================================

import { useState, useRef, useEffect } from "react";
import { MessageSquareText, X, Send, Bot, ChevronDown } from "lucide-react";
import { getTradeBotResponse } from "../utils/tradeBot";
import { useApp } from "../context/AppContext";
import "./ChatBot.css";

// Initial greeting message from TradeBot
const INITIAL_MESSAGES = [
  {
    id: 1,
    from: "bot",
    text: "Hi! I'm **TradeBot**, your AI finance assistant!\n\nTry asking me:\n• *\"analyze AAPL\"*\n• *\"my portfolio\"*\n• *\"what is P/E ratio?\"*\n• *\"market summary\"*",
    time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  },
];

// Parse simple markdown-like formatting in bot messages
function parseMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
}

export default function ChatBot() {
  const { state } = useApp();
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput]     = useState("");
  const [typing, setTyping]   = useState(false);
  const [unread, setUnread]   = useState(0);
  const messagesEndRef         = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Clear unread count when opened
  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  function sendMessage(text) {
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      from: "user",
      text: text.trim(),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    // Simulate typing delay (200ms–800ms based on response length)
    setTimeout(() => {
      const response = getTradeBotResponse(text, state);
      const botMsg = {
        id: Date.now() + 1,
        from: "bot",
        text: response,
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setTyping(false);
      if (!open) setUnread((n) => n + 1);
    }, 500 + Math.random() * 500);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  // Quick-action suggestion chips
  const QUICK_ACTIONS = ["analyze AAPL", "market summary", "my portfolio", "top gainers"];

  return (
    <>
      {/* ── Floating bubble button ─────────────────────────── */}
      <button
        className={`chatbot-fab ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="Open TradeBot"
      >
        {open ? <X size={22} /> : <MessageSquareText size={22} />}
        {!open && unread > 0 && (
          <span className="chatbot-badge">{unread}</span>
        )}
      </button>

      {/* ── Chat Window ───────────────────────────────────── */}
      {open && (
        <div className="chatbot-window anim-fade-up">
          {/* Header */}
          <div className="chatbot-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="chatbot-avatar">
                <Bot size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>TradeBot AI</div>
                <div style={{ fontSize: 11, color: "var(--green)", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
                  Online · AI Finance Assistant
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="chatbot-close">
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.from}`}>
                {msg.from === "bot" && (
                  <div className="chat-bot-icon"><Bot size={14} /></div>
                )}
                <div className="chat-bubble">
                  <div
                    className="chat-text"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }}
                  />
                  <div className="chat-time">{msg.time}</div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="chat-message bot">
                <div className="chat-bot-icon"><Bot size={14} /></div>
                <div className="chat-bubble">
                  <div className="typing-indicator">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick action chips */}
          <div className="chatbot-chips">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                className="chip"
                onClick={() => sendMessage(action)}
              >
                {action}
              </button>
            ))}
          </div>

          {/* Input area */}
          <div className="chatbot-input-area">
            <input
              className="chatbot-input"
              placeholder="Ask TradeBot anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={200}
            />
            <button
              className="chatbot-send"
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
