
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import {
  Bot,
  Send,
  Sparkles,
  User,
  Plus,
  Trash2,
} from "lucide-react";

type Message = {
  role: "assistant" | "user";
  text: string;
};

const STORAGE_KEY = "tripplanner_chat_history";

const initialMessage: Message = {
  role: "assistant",
  text: `Hello! 👋 Welcome to your TripPlanner AI Assistant!

I can help you discover destinations, plan trips, explore local food, estimate budgets and find useful travel information.

**Where would you like to travel next?**`,
};

const suggestions = [
  "What are the best places to visit in Ella?",
  "Plan a low-budget weekend trip.",
  "What should I pack for the hill country?",
];

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// Improve Markdown returned by the AI.
function formatMarkdown(text: string): string {
  return text
    .replace(/\\\|/g, "|")
    .replace(/\|\s+\|/g, "|\n|")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const savedMessages = localStorage.getItem(STORAGE_KEY);

      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);

        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }

    return [initialMessage];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  function startNewChat() {
    if (loading) return;

    setMessages([initialMessage]);
    setInput("");
  }

  async function sendMessage(
    event?: FormEvent,
    suggestedText?: string
  ) {
    event?.preventDefault();

    const value = (suggestedText ?? input).trim();

    if (!value || loading) return;

    const previousHistory = messages
      .filter(
        (message, index) =>
          !(index === 0 && message.text === initialMessage.text)
      )
      .map((message) => ({
        role: message.role,
        content: message.text,
      }));

    setMessages((current) => [
      ...current,
      { role: "user", text: value },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: value,
          history: previousHistory,
        }),
      });

      if (!response.ok) {
        throw new Error("AI service request failed.");
      }

      const data = await response.json();

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: data.response || "I couldn't generate a response.",
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "Sorry! I couldn't connect to the AI assistant. Please check your connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell midnight-chat-page">
      <div className="container midnight-chat-container">

        <div className="midnight-chat-heading">
          <span className="midnight-chat-eyebrow">
            <Sparkles size={15} />
            YOUR PERSONAL TRAVEL ASSISTANT
          </span>

          <h1>
            Let's talk about your <span>next journey.</span>
          </h1>

          <p>
            Discover destinations, get travel advice and organise
            your next adventure with AI.
          </p>
        </div>

        <section className="midnight-chat-card">

          {/* Header */}
          <div className="midnight-chat-top">
            <div className="midnight-chat-profile">
              <div className="midnight-bot-avatar">
                <Bot size={23} />
              </div>

              <div>
                <h3>TripPlanner Assistant</h3>

                <span className="midnight-chat-status">
                  <span className="midnight-online-dot" />
                  Online and ready to help
                </span>
              </div>
            </div>

            <div className="midnight-chat-actions">
              <button
                type="button"
                className="midnight-new-chat"
                onClick={startNewChat}
                disabled={loading}
              >
                <Plus size={17} />
                <span>New Chat</span>
              </button>

              <button
                type="button"
                className="midnight-clear-chat"
                onClick={startNewChat}
                disabled={loading}
                title="Clear conversation"
                aria-label="Clear conversation"
              >
                <Trash2 size={17} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="midnight-chat-messages">
            {messages.map((message, index) => (
              <div
                className={`midnight-message ${message.role}`}
                key={index}
              >
                <div className="midnight-message-avatar">
                  {message.role === "assistant" ? (
                    <Bot size={18} />
                  ) : (
                    <User size={18} />
                  )}
                </div>

                <div className="midnight-message-content">
                  <span className="midnight-message-sender">
                    {message.role === "assistant"
                      ? "TripPlanner AI"
                      : "You"}
                  </span>

                  <div className="midnight-chat-markdown">
                    {message.role === "assistant" ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h2: ({ children }) => (
                            <h2 className="travel-section-heading">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="travel-subheading">
                              {children}
                            </h3>
                          ),
                          table: ({ children }) => (
                            <div className="travel-table-wrapper">
                              <table>{children}</table>
                            </div>
                          ),
                        }}
                      >
                        {formatMarkdown(message.text)}
                      </ReactMarkdown>
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.text}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div className="midnight-typing">
                <div className="midnight-message-avatar">
                  <Bot size={18} />
                </div>

                <div className="midnight-typing-content">
                  <span>Preparing your travel guide...</span>

                  <div className="midnight-typing-dots">
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && !loading && (
            <div className="midnight-suggestions">
              <span>QUICK QUESTIONS</span>

              <div className="midnight-suggestion-list">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => sendMessage(undefined, suggestion)}
                  >
                    <Sparkles size={14} />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            className="midnight-chat-input"
            onSubmit={(event) => sendMessage(event)}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask anything about your trip..."
              disabled={loading}
            />

            <button
              type="submit"
              aria-label="Send message"
              disabled={loading || !input.trim()}
            >
              <Send size={19} />
            </button>
          </form>

          <div className="midnight-chat-footer">
            Your personal AI travel companion · TripPlanner AI
          </div>
        </section>
      </div>
    </div>
  );
}
