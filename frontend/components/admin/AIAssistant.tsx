"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./AIAssistant.module.css";
import { Send, Sparkles, User, Loader2, Lightbulb, Search, FileText } from "lucide-react";
import type { FIRRecord } from "@/lib/data";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  fir: FIRRecord;
}

const suggestedQuestions = [
  "What are the key leads in this case?",
  "Suggest investigation steps",
  "Analyze witness statements",
  "Find similar cases in database",
  "Generate case summary report",
];

export default function AIAssistant({ fir }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hello! I'm your AI Investigation Assistant on JusticeRoute. I've analyzed ${fir.id} regarding ${fir.incidentType}. I can help you with:\n\n- Identifying key leads and patterns\n- Suggesting investigation steps\n- Analyzing evidence and witness statements\n- Finding similar cases\n- Generating reports\n\nHow can I assist with this investigation?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    const completedSteps = fir.investigationSteps.filter(s => s.completed).length;
    const pendingSteps = fir.investigationSteps.filter(s => !s.completed);

    if (lowerMessage.includes("lead") || lowerMessage.includes("key")) {
      return `Based on my analysis of ${fir.id}, here are the key leads:\n\n1. **Location Analysis**: Incident occurred at ${fir.location}\n2. **Timeline**: The incident was reported on ${new Date(fir.date).toLocaleDateString()}\n3. **Investigation Progress**: ${completedSteps}/${fir.investigationSteps.length} steps completed\n\n**Recommended Priority Actions:**\n- ${pendingSteps.slice(0, 3).map(s => s.action).join('\n- ')}\n\n**IPC Sections Applied:**\n${fir.ipcSections.map(s => `- ${s.section}: ${s.title}`).join('\n')}`;
    }

    if (lowerMessage.includes("step") || lowerMessage.includes("investigation")) {
      return `**Recommended Investigation Steps for ${fir.id}:**\n\n${fir.investigationSteps.map(step => `**Step ${step.step}: ${step.action}** [${step.completed ? 'DONE' : step.priority}]\n${step.details}`).join('\n\n')}\n\n**Progress:** ${completedSteps}/${fir.investigationSteps.length} completed (${Math.round(completedSteps/fir.investigationSteps.length*100)}%)`;
    }

    if (lowerMessage.includes("witness") || lowerMessage.includes("statement")) {
      return `**Witness Analysis for ${fir.id}:**\n\nBased on the case details, I recommend the following witness interview strategy:\n\n1. **Primary Witnesses**\n   - Immediate eyewitnesses at ${fir.location}\n   - Nearby shop owners and residents\n\n2. **Secondary Sources**\n   - CCTV operators in the vicinity\n   - Traffic personnel if applicable\n\n3. **Key Questions to Ask**\n   - Exact time of observation\n   - Description of suspects/vehicles\n   - Any unusual activity before the incident\n\n**Victim Statement Summary:**\n"${fir.victimStatement.substring(0, 200)}..."`;
    }

    if (lowerMessage.includes("similar") || lowerMessage.includes("case")) {
      return `**Similar Cases Analysis:**\n\nI found patterns with similar ${fir.incidentType} cases:\n\n1. **FIR/2024/001245** - ${fir.incidentType} in nearby jurisdiction\n   - Similarity: 78%\n   - Status: Closed (Convicted)\n\n2. **FIR/2024/000987** - Similar modus operandi\n   - Similarity: 65%\n   - Status: Under Investigation\n\n**Pattern Detected:** There appears to be a cluster of similar incidents in ${fir.district} district over the past 6 months. Consider coordinating with the special investigation unit.`;
    }

    if (lowerMessage.includes("report") || lowerMessage.includes("summary")) {
      return `**Case Summary Report - ${fir.id}**\n\n**Classification:** ${fir.incidentType}\n**Status:** ${fir.status}\n**IPC Sections:** ${fir.ipcSections.map(s => s.section).join(", ") || "None applicable"}\n\n**Complainant:** ${fir.victimName}\n**Location:** ${fir.location}\n**Date:** ${new Date(fir.date).toLocaleDateString()}\n\n**Victim Statement:**\n${fir.victimStatement}\n\n**Investigation Progress:** ${completedSteps}/${fir.investigationSteps.length} steps completed\n\nThis report can be exported for official documentation.`;
    }

    if (lowerMessage.includes("ipc") || lowerMessage.includes("section") || lowerMessage.includes("law")) {
      if (fir.ipcSections.length === 0) {
        return `No IPC sections have been applied to this case (${fir.id}). This may be a non-criminal matter or sections are pending legal review.`;
      }
      return `**IPC Sections for ${fir.id}:**\n\n${fir.ipcSections.map(s => `**${s.section} - ${s.title}**\n*Explanation:* ${s.explanation}\n*Punishment:* ${s.punishment}`).join('\n\n')}`;
    }

    return `Thank you for your query regarding ${fir.id}. Based on the case details for this ${fir.incidentType} case, I can provide insights on:\n\n- Investigation leads and progress\n- IPC section explanations\n- Similar case patterns\n- Recommended next steps\n\nCould you please specify what aspect of the investigation you'd like me to focus on?`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: generateAIResponse(userMessage.content),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiResponse]);
    setIsLoading(false);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Sparkles size={20} className={styles.headerIcon} />
          <div>
            <h2 className={styles.title}>JusticeRoute AI Assistant</h2>
            <p className={styles.subtitle}>Intelligent case analysis and investigation support</p>
          </div>
        </div>
      </div>

      <div className={styles.messagesContainer}>
        <div className={styles.messages}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.message} ${message.role === "user" ? styles.userMessage : styles.assistantMessage}`}
            >
              <div className={styles.messageAvatar}>
                {message.role === "user" ? (
                  <User size={18} />
                ) : (
                  <Sparkles size={18} />
                )}
              </div>
              <div className={styles.messageContent}>
                <div className={styles.messageHeader}>
                  <span className={styles.messageRole}>
                    {message.role === "user" ? "You" : "AI Assistant"}
                  </span>
                  <span className={styles.messageTime}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className={styles.messageText}>
                  {message.content.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.message} ${styles.assistantMessage}`}>
              <div className={styles.messageAvatar}>
                <Sparkles size={18} />
              </div>
              <div className={styles.messageContent}>
                <div className={styles.loadingIndicator}>
                  <Loader2 size={16} className={styles.spinner} />
                  <span>Analyzing case data...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className={styles.inputSection}>
        <div className={styles.suggestions}>
          <Lightbulb size={14} />
          <span>Suggested:</span>
          {suggestedQuestions.slice(0, 3).map((question, index) => (
            <button
              key={index}
              className={styles.suggestionBtn}
              onClick={() => handleSuggestedQuestion(question)}
            >
              {question}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about investigation leads, evidence analysis, or case patterns..."
            className={styles.input}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={styles.sendBtn}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? <Loader2 size={18} className={styles.spinner} /> : <Send size={18} />}
          </button>
        </form>
      </div>

      <div className={styles.quickActions}>
        <button className={styles.quickActionBtn}>
          <Search size={16} />
          Search Evidence
        </button>
        <button className={styles.quickActionBtn}>
          <FileText size={16} />
          Generate Report
        </button>
      </div>
    </div>
  );
}
