import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User as UserIcon,
  Lightbulb,
  Trash2,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { apiAIAgent } from '../services/api';
import { ChatMessage } from '../types';

interface AIAgentChatProps {
  isOpen: boolean;
  onClose: () => void;
  activeExperimentId?: number | null;
  activeDatasetId?: string | null;
}

const getNowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const AIAgentChat: React.FC<AIAgentChatProps> = ({
  isOpen,
  onClose,
  activeExperimentId,
  activeDatasetId,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      role: 'assistant',
      content:
        "Hello! I am your **QuantumKernel AI Copilot**. I can evaluate your classification experiments, diagnose kernel conditioning, explain ZZFeatureMap mechanics, and provide hyperparameter tuning recommendations. How can I assist your research today?",
      timestamp: '12:00 PM',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([
    'Analyze active experiment results',
    'How does ZZFeatureMap encode nonlinear data?',
    'Explain the difference between RBF kernel and Quantum kernel',
    'How can I prevent barren plateaus / kernel concentration?',
  ]);
  const [isExpanded, setIsExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: getNowTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const res = await apiAIAgent.chat({
        message: text,
        experiment_id: activeExperimentId,
        dataset_id: activeDatasetId,
        history: messages,
      });

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: res.reply,
        timestamp: getNowTime(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (res.recommendations && res.recommendations.length > 0) {
        setRecommendations(res.recommendations);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `Apologies, I encountered an error communicating with the quantum reasoning service: ${err.message}`,
        timestamp: getNowTime(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Conversation history cleared. Ready for your next quantum query!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isExpanded
          ? 'inset-4 sm:inset-10'
          : 'bottom-4 right-4 sm:right-6 w-full max-w-lg h-[640px]'
      }`}
    >
      <div className="flex flex-col h-full rounded-2xl glass-panel bg-slate-950/95 border border-cyan-500/30 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-500 p-[1px] shadow-md shadow-cyan-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-950">
                <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-white tracking-wide">Quantum Copilot AI</h3>
                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Active
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                {activeExperimentId ? `Context: Experiment #${activeExperimentId}` : 'Context: General QML'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearHistory}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
              title="Clear chat history"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors hidden sm:block"
              title={isExpanded ? 'Minimize' : 'Maximize'}
            >
              {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Close Copilot"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-slate-900/40 border-b border-slate-800/80 overflow-x-auto flex gap-1.5 scrollbar-none">
          {recommendations.slice(0, 4).map((rec, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(rec)}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-900 hover:bg-cyan-500/15 border border-slate-800 hover:border-cyan-500/40 text-[10px] text-slate-300 hover:text-cyan-300 transition-all flex items-center gap-1 shrink-0"
            >
              <Lightbulb className="h-3 w-3 text-cyan-400 shrink-0" />
              <span>{rec}</span>
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    isUser
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                  }`}
                >
                  {isUser ? <UserIcon className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed space-y-1 ${
                    isUser
                      ? 'bg-cyan-600/20 border border-cyan-500/30 text-white rounded-tr-none'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] text-slate-500 font-mono pb-1 border-b border-white/5">
                    <span>{isUser ? 'You' : 'Quantum Copilot'}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed text-slate-300 pt-1 font-sans">
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono py-2 pl-10">
              <Sparkles className="h-3.5 w-3.5 animate-spin" />
              <span>Q-Copilot reasoning with Qiskit domain model...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900/80 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask Q-Copilot (e.g. 'How can I improve accuracy on Circles?')..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || loading}
              className="flex items-center justify-center h-9 w-9 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
