import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: string;
  text: string;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const BASE_URL = "https://quickie-2qfp.onrender.com";

  useEffect(() => {
    fetch(`${BASE_URL}/chat/history`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setMessages(data.history || []))
      .catch((err) => console.error("Error fetching history:", err));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const userMessage: Message = { role: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const response = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      const botMessage: Message = { role: "assistant", text: data.response };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Code copied to clipboard!");
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "450px",
        height: "500px",
        backgroundColor: "#141618",
        overflow: "hidden",
        margin: "auto",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "15px",
          backgroundColor: "#242424",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                padding: "12px 15px",
                borderRadius: "20px",
                maxWidth: "70%",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                backgroundColor: msg.role === "user" ? "#007bff" : "#e5e5ea",
                color: msg.role === "user" ? "white" : "black",
              }}
            >
              <ReactMarkdown
                components={{
                  code({ children, ...props }) {
                    return (
                      <pre
                        style={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          overflowX: "auto",
                          backgroundColor: "#1e1e1e",
                          color: "#f8f8f8",
                          padding: "8px",
                          borderRadius: "5px",
                          maxWidth: "100%",
                        }}
                      >
                        <code
                          {...props}
                          style={{ cursor: "pointer", display: "block" }}
                          onClick={() => copyToClipboard(String(children))}
                        >
                          {children}
                        </code>
                      </pre>
                    );
                  },
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div
        style={{
          display: "flex",
          padding: "10px",
          borderTop: "1px solid #444",
          backgroundColor: "#141618",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyUp={(e) => e.key === "Enter" && sendMessage()}
          style={{
            flex: 1,
            padding: "12px",
            border: "1px solid #ccc",
            borderRadius: "20px",
            fontSize: "16px",
            outline: "none",
            backgroundColor: "#242424",
            color: "white",
          }}
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          style={{
            marginLeft: "10px",
            padding: "8px 10px",
            fontSize: "16px",
            cursor: "pointer",
            color: "white",
            border: "none",
            borderRadius: "50px",
          }}
          disabled={loading}
        >
          {loading ? (
            "..."
          ) : (
            <img
              width="25"
              height="25"
              src="https://img.icons8.com/ios-filled/50/long-arrow-up.png"
              alt="send"
            />
          )}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
