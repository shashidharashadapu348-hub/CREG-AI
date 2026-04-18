import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { QuickPrompts } from "@/components/chat/QuickPrompts";
import { LanguageSelector } from "@/components/chat/LanguageSelector";
import { streamChat, type Msg } from "@/lib/stream-chat";
import { useToast } from "@/hooks/use-toast";
import { Terminal, Menu, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LocalConversation {
  id: string;
  title: string;
  messages: Msg[];
}

export default function Chat() {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<LocalConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [language, setLanguage] = useState("auto");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync messages to conversation
  useEffect(() => {
    if (activeConvId && messages.length > 0) {
      setConversations(prev =>
        prev.map(c => c.id === activeConvId ? { ...c, messages } : c)
      );
    }
  }, [messages, activeConvId]);

  // Load messages when switching conversation
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }
    const conv = conversations.find(c => c.id === activeConvId);
    if (conv) setMessages(conv.messages);
  }, [activeConvId]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (input: string, _attachments?: string[]) => {
    if (!input.trim() || isStreaming) return;

    const userMsg: Msg = { role: "user", content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsStreaming(true);

    let convId = activeConvId;
    if (!convId) {
      convId = crypto.randomUUID();
      const title = input.slice(0, 50) + (input.length > 50 ? "..." : "");
      setConversations(prev => [{ id: convId!, title, messages: updatedMessages }, ...prev]);
      setActiveConvId(convId);
    }

    let assistantContent = "";

    const upsertAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      await streamChat({
        messages: updatedMessages,
        language: language !== "auto" ? language : undefined,
        onDelta: upsertAssistant,
        onDone: () => setIsStreaming(false),
        onError: (error) => {
          setIsStreaming(false);
          toast({ title: "AI Error", description: error, variant: "destructive" });
        },
      });
    } catch {
      setIsStreaming(false);
      toast({ title: "Error", description: "Connection failed", variant: "destructive" });
    }
  };

  const handleNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConvId === id) {
      setActiveConvId(null);
      setMessages([]);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 border-r border-border flex flex-col bg-card shrink-0">
          <div className="p-3 border-b border-border">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={handleNewChat}>
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
                    activeConvId === conv.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  onClick={() => setActiveConvId(conv.id)}
                >
                  <span className="truncate flex-1">{conv.title}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv.id); }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-4 w-4" />
          </Button>
          <LanguageSelector value={language} onChange={setLanguage} />
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Terminal className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center max-w-md">
                <h2 className="text-xl font-bold text-foreground mb-2">What are you building?</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Describe any coding problem, paste code, or upload a file. I'll generate clean, production-ready code in any language.
                </p>
                <QuickPrompts onSelect={handleQuickPrompt} />
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
              {messages.map((msg, i) => (
                <ChatMessage key={i} role={msg.role} content={msg.content} />
              ))}
              {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm">Thinking...</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="max-w-3xl mx-auto w-full">
          <ChatInput onSend={handleSend} disabled={isStreaming} />
        </div>
      </div>
    </div>
  );
}
