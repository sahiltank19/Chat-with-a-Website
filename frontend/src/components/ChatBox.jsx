import { useState, useRef, useEffect } from "react";
import api from "../services/api";
import Message    from "./Message";
import SourceList from "./SourceList";
import Loader     from "./Loader";

/**
 * ChatBox — full conversational chat interface.
 *
 * Manages its own message history and communicates with POST /api/chat.
 * Shows sources under each AI reply and auto-scrolls to the latest message.
 */
function ChatBox() {
  const [messages,   setMessages]   = useState([]);  // { role, content, sources }[]
  const [input,      setInput]      = useState("");
  const [isLoading,  setIsLoading]  = useState(false);
  const [chatError,  setChatError]  = useState(null);

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || isLoading) return;

    // Optimistically add user message
    setMessages(prev => [...prev, { role: "user", content: question, sources: [] }]);
    setInput("");
    setChatError(null);
    setIsLoading(true);

    try {
      const { data } = await api.post("/chat", { question });

      setMessages(prev => [
        ...prev,
        {
          role:    "assistant",
          content: data.answer,
          sources: data.sources || [],
        },
      ]);
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Please try again.";
      const isLimit = err.response?.status === 429;
      setChatError({ message: msg, isRateLimit: isLimit });
    } finally {
      setIsLoading(false);
      // Re-focus input for quick follow-up questions
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <div className="chatbox">
      {/* ── Message Thread ────────────────────────────── */}
      <div className="chatbox__messages" role="log" aria-live="polite">

        {messages.length === 0 && !isLoading && (
          <div className="chatbox__empty">
            <span className="chatbox__empty-icon">💬</span>
            <p>Ask a question about the website you just crawled.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className="chatbox__message-group">
            <Message role={msg.role} content={msg.content} />
            {msg.role === "assistant" && (
              <SourceList sources={msg.sources} />
            )}
          </div>
        ))}

        {isLoading && (
          <div className="chatbox__message-group">
            <Loader message="Thinking…" size="sm" />
          </div>
        )}

        {chatError && (
          <div className={`chatbox__error ${chatError.isRateLimit ? "chatbox__error--rate_limit" : ""}`} role="alert">
            ⚠️ {chatError.message}
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* ── Input Bar ─────────────────────────────────── */}
      <form className="chatbox__form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className="chatbox__input"
          type="text"
          placeholder="Ask anything about this website…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          autoFocus
        />
        <button
          className="chatbox__submit btn-primary"
          type="submit"
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
        >
          {isLoading ? "…" : "Send →"}
        </button>
      </form>
    </div>
  );
}

export default ChatBox;
