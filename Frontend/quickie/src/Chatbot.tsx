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

  const BASE_URL = "http://localhost:8000";

  // Fetch chat history on load
  useEffect(() => {
    fetch(`${BASE_URL}/chat/history`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setMessages(data.history || []))
      .catch((err) => console.error("Error fetching history:", err));
  }, []);

  // Auto-scroll to bottom on new message
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

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
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div
  style={{
    resize: "both",
    overflow: "auto",
    height:"500px",
    minWidth: "400px", // Original width
    minHeight: "500px", // Original height, adjust based on your content
    maxWidth: "none",
    maxHeight: "none",
    margin: "auto",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
    backgroundColor: "#141618",
  }}
  className="bg-gray-900 p-5 rounded-lg shadow-md"
>
  <div
    style={{
      
      height: "80%",
      overflowY: "auto",
      padding: "15px",
      borderRadius: "10px",
      backgroundColor: "#242424",
      boxShadow: "inset 0px 2px 5px rgba(0,0,0,0.1)",
    }}
    className="h-[400px] overflow-y-auto p-3.75 rounded-lg bg-gray-800 shadow-inner"
  >
    {messages.map((msg, index) => (
      <div
        key={index}
        style={{
          display: "flex",
          justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
          marginBottom: "10px",
        }}
        className={`flex mb-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        <div
          style={{
            padding: "12px",
            borderRadius: "18px",
            maxWidth: "70%",
            wordWrap: "break-word",
            backgroundColor: msg.role === "user" ? "#007bff" : "#e5e5ea",
            color: msg.role === "user" ? "white" : "black",
          }}
          className={`py-3 px-3 rounded-[18px] max-w-[70%] break-words ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
        >
          <ReactMarkdown
            components={{
              code({ inline, children, ...props }) {
                return !inline ? (
                  <pre>
                    <code
                      {...props}
                      style={{ cursor: "pointer" }}
                      onClick={() => copyToClipboard(String(children))}
                      className="cursor-pointer"
                    >
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code {...props}>{children}</code>
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
  <div style={{ display: "flex", marginTop: "15px" }} className="flex mt-3.75">
    <input
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyUp={handleKeyPress}
      style={{
        flex: 1,
        padding: "12px",
        border: "1px solid #ccc",
        borderRadius: "20px",
        fontSize: "16px",
        outline: "none",
      }}
      className="flex-grow p-3 border border-gray-300 rounded-[20px] text-base focus:outline-none"
      placeholder="Type a message..."
    />
    <button
      onClick={sendMessage}
      style={{
        marginLeft: "10px",
        padding: "12px 18px",
        fontSize: "16px",
        cursor: "pointer",
      }}
      className={`ml-2.5 py-3 px-4.5 rounded-[20px] text-base cursor-pointer ${loading ? 'bg-gray-400' : 'bg-orange-500 text-red-400'}`}
      disabled={loading}
    >
      {loading ? "..." : <img src='https://img.icons8.com/3d-fluency/24/paper-plane.png' alt="send" className="scale-110 border-blue-500" />}
    </button>
  </div>
</div>
  );
};

export default Chatbot;
