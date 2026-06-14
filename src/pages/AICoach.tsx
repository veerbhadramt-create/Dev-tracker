import React, { useState, useEffect, useRef } from 'react';
import { ProGate } from '../components/ProGate';
import { useAuth } from '../hooks/useAuth';
import { localStore } from '../lib/store';
import { ChatSession, ChatMessage } from '../lib/types';
import { Plus, Send, MessageSquare, Trash2, User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const AICoach: React.FC = () => {
  return (
    <ProGate>
      <AICoachContent />
    </ProGate>
  );
};

const AICoachContent: React.FC = () => {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');
  const messageEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStore
  useEffect(() => {
    const chatHistory = localStore.getChatSessions();
    setSessions(chatHistory);
    if (chatHistory.length > 0) {
      setActiveSession(chatHistory[0]);
    } else {
      // Create an initial session if none exist
      handleNewSession();
    }
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeSession?.messages, streamText]);

  const handleNewSession = () => {
    const skills = profile?.skills.join(', ') || 'React, JavaScript';
    const systemPrompt = `You are a senior developer career mentor. Context: User has completed ${profile?.tasksCompleted || 0} tasks and logged ${profile?.codingHoursTotal || 0} hours of coding. Skills: ${skills}. Provide short, highly actionable career advice.`;
    
    const newSession = localStore.addChatSession('New Career Session', systemPrompt);
    setSessions(localStore.getChatSessions());
    setActiveSession(newSession);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this chat history?')) {
      localStore.deleteChatSession(id);
      const remaining = localStore.getChatSessions();
      setSessions(remaining);
      if (activeSession?.id === id) {
        setActiveSession(remaining.length > 0 ? remaining[0] : null);
      }
      toast.success('Session deleted');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeSession || isStreaming) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputText,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...activeSession.messages, userMessage];
    const sessionWithUser = localStore.updateChatMessages(activeSession.id, updatedMessages);
    setActiveSession(sessionWithUser);
    setInputText('');
    setIsStreaming(true);
    setStreamText('');

    // Generate mentoring advice based on user inputs
    const responsePrompt = userMessage.content.toLowerCase();
    let reply = '';
    
    if (responsePrompt.includes('dsa') || responsePrompt.includes('algorithm')) {
      reply = `As your mentor, I recommend a structured DSA roadmap. Focus on:\n\n` + 
              `1. Arrays & Hashing (Map/Set) - essential for React data mapping.\n` +
              `2. Two Pointers & Slidind Window.\n` +
              `3. Trees and Graphs - practice traversing nested JSON component trees.\n\n` +
              `Given your skills in ${profile?.skills[0] || 'React'}, solve 1 problem daily, and log it under your Habits. Let's aim to boost your coding consistency score.`;
    } else if (responsePrompt.includes('resume') || responsePrompt.includes('cv') || responsePrompt.includes('job')) {
      reply = `To prepare for job applications, your primary focus should be project validation:\n\n` +
              `• Complete your in-progress projects (like ${profile?.skills[0] || 'React'} apps) and move them to Shipped. Recruiter filtering favors active GitHub links.\n` +
              `• Use the Resume Analyzer to parse your file. Your baseline CV score matches 74%. We should aim to raise it to 85% by incorporating metrics and skills matches like TypeScript and Node.js.`;
    } else {
      reply = `That is a great career question. Let's analyze your progress:\n\n` +
              `Currently, you have logged ${profile?.codingHoursTotal || 0} coding hours and checked off ${profile?.tasksCompleted || 0} learning goals. To land developer interviews:\n\n` +
              `1. Master TypeScript: Type safety is non-negotiable in production React teams.\n` +
              `2. Document everything: Commit work to your repositories daily (aim for active streaks!).\n` +
              `3. Keep practicing API designs and state management integrations. Let me know what specific module you want to deep dive next!`;
    }

    // Stream the response typing effect
    let i = 0;
    const interval = setInterval(() => {
      if (i < reply.length) {
        setStreamText((prev) => prev + reply.charAt(i));
        i += 2; // print 2 chars per tick for responsive speed
      } else {
        clearInterval(interval);
        
        // Save complete streamed message
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: reply,
          timestamp: new Date().toISOString()
        };
        const finalMessages = [...updatedMessages, assistantMessage];
        const finalSession = localStore.updateChatMessages(activeSession.id, finalMessages);
        
        // Update session title if it was default
        if (activeSession.title === 'New Career Session') {
          finalSession.title = userMessage.content.length > 25 
            ? userMessage.content.substring(0, 22) + '...' 
            : userMessage.content;
          localStore.saveChatSessions(
            localStore.getChatSessions().map(s => s.id === finalSession.id ? finalSession : s)
          );
        }

        setSessions(localStore.getChatSessions());
        setActiveSession(finalSession);
        setIsStreaming(false);
        setStreamText('');
      }
    }, 20);
  };

  const getActiveMessages = () => {
    if (!activeSession) return [];
    // Filter out system prompts from display
    return activeSession.messages.filter(m => m.role !== 'system');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
      {/* Sessions History List */}
      <div className="glass-card p-4 flex flex-col md:col-span-1 h-full overflow-hidden justify-between">
        <div className="overflow-hidden flex flex-col h-full">
          <button 
            onClick={handleNewSession}
            className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all mb-4 shrink-0"
          >
            <Plus className="w-4 h-4" /> New Session
          </button>

          <div className="space-y-1.5 overflow-y-auto no-scrollbar flex-1">
            {sessions.map(s => {
              const active = activeSession?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setActiveSession(s)}
                  className={`flex items-center justify-between p-2.5 rounded-lg text-sm cursor-pointer select-none transition-all ${
                    active 
                      ? 'bg-primary/15 border border-primary/30 text-foreground font-semibold shadow-sm' 
                      : 'hover:bg-secondary/40 text-muted-foreground hover:text-foreground border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare className="w-4 h-4 shrink-0 text-primary" />
                    <span className="truncate">{s.title}</span>
                  </div>
                  <button 
                    onClick={(e) => handleDeleteSession(s.id, e)}
                    className="p-1 rounded text-muted-foreground/60 hover:text-red-500 hover:bg-red-500/5 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chat Messages Panel */}
      <div className="glass-card flex flex-col md:col-span-3 h-full overflow-hidden justify-between">
        {activeSession ? (
          <>
            {/* Header info */}
            <div className="px-5 py-4 border-b border-border/40 shrink-0 flex items-center gap-2">
              <div className="p-1.5 bg-primary/20 text-primary rounded-lg">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">{activeSession.title}</h3>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Gemini Senior Dev Mentor</p>
              </div>
            </div>

            {/* Bubble logs */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar"
            >
              {getActiveMessages().map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={index} className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shrink-0 text-sm font-semibold">
                        G
                      </div>
                    )}
                    
                    <div className={`p-3.5 rounded-2xl max-w-[85%] text-sm leading-relaxed border whitespace-pre-wrap ${
                      isUser 
                        ? 'bg-primary text-primary-foreground border-primary rounded-tr-none' 
                        : 'bg-secondary/25 border-border/30 text-foreground rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-full bg-secondary border border-border/30 flex items-center justify-center shrink-0 text-sm font-semibold text-foreground">
                        <User className="w-4.5 h-4.5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Streaming responses typing bubble */}
              {isStreaming && streamText && (
                <div className="flex items-start gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shrink-0 text-sm font-semibold animate-pulse">
                    G
                  </div>
                  <div className="p-3.5 rounded-2xl max-w-[85%] text-sm leading-relaxed bg-secondary/25 border border-border/30 text-foreground rounded-tl-none whitespace-pre-wrap font-mono">
                    {streamText}
                    <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse" />
                  </div>
                </div>
              )}

              <div ref={messageEndRef} />
            </div>

            {/* Input panel */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border/40 flex items-center gap-3 shrink-0">
              <input 
                type="text" 
                placeholder="Ask your mentor: 'Review my DSA focus' or 'Tell me how to improve my resume'..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isStreaming}
                className="flex-1 bg-background border border-border/45 text-foreground text-sm rounded-xl px-4 py-3 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
              />
              <button 
                type="submit"
                disabled={!inputText.trim() || isStreaming}
                className="p-3 bg-primary hover:bg-primary/95 text-primary-foreground disabled:opacity-55 disabled:cursor-not-allowed rounded-xl transition-all shadow-md active:scale-95"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground italic">
            Start a new session to consult your AI Coach.
          </div>
        )}
      </div>
    </div>
  );
};
