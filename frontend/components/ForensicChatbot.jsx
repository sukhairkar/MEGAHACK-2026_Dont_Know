"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ForensicChatbot({ context, isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "I am your Forensic AI Strategist. You can ask me legal queries or investigation next-steps for this case." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const textAreaRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle auto-expanding height
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      const newHeight = Math.min(textAreaRef.current.scrollHeight, 180); // Lock at 180px
      textAreaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question: input,
          context: context // Sending full JSON context for zero-DB-dependency chat
        }),
      });
      const data = await res.json();
      if (data.response) {
        setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      } else if (data.error) {
        setMessages(prev => [...prev, { role: "assistant", content: `Intelligence Error: ${data.error}` }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "Strategic systems returned an empty response. Please retry." }]);
      }
    } catch (err) {
      console.error("Chat failed:", err.message);
      setMessages(prev => [...prev, { role: "assistant", content: "Critical: Backend intelligence sync lost. Verify server status." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-[95%] md:w-[600px] h-[85vh] glass shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-indigo-500/30 flex flex-col z-[2000] animate-in slide-in-from-right-10 duration-500 overflow-hidden text-white">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-indigo-600/20 backdrop-blur-xl flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
          <span className="text-sm font-black text-white uppercase tracking-widest">Forensic AI Advisor</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/40">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none shadow-lg' 
                : 'bg-indigo-950/40 border border-indigo-500/20 text-indigo-100 rounded-bl-none prose prose-invert prose-sm'
            }`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {m.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-indigo-950/40 border border-indigo-500/20 p-3 rounded-2xl rounded-bl-none">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Smart Auto-Expanding Input */}
      <div className="p-4 border-t border-white/10 bg-black/40">
        <div className="relative glass border-white/10 rounded-2xl flex flex-col p-1.5 transition-all duration-300 focus-within:border-indigo-500/50 bg-white/[0.05]">
          
          <div className="flex items-end gap-3 px-3 pb-2 pt-1.5">
            {/* Context Plus Icon */}
            <button className="p-1.5 text-slate-400 hover:text-white transition-colors shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </button>

            <textarea 
              ref={textAreaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Query legal provisions or roadmap..."
              className="w-full bg-transparent border-none text-base font-medium text-white placeholder:text-slate-500 focus:outline-none focus:ring-0 resize-none py-1.5 custom-scrollbar leading-relaxed"
            />

            <div className="flex items-center gap-2 mb-1">
              {/* Magic/Intelligent Icon */}
              <button className="p-1.5 text-slate-400 hover:text-indigo-400 transition-colors shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
              </button>
              
              <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="p-2.5 bg-white text-black rounded-full hover:bg-slate-200 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
