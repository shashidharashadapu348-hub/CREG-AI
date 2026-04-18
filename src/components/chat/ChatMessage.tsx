import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";
import { Terminal, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isAssistant = role === "assistant";

  return (
    <div className={`flex gap-4 ${isAssistant ? "" : "flex-row-reverse"}`}>
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
        isAssistant ? "bg-primary/15 text-primary" : "bg-secondary text-foreground"
      }`}>
        {isAssistant ? <Terminal className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>
      <div className={`flex-1 min-w-0 ${isAssistant ? "pr-12" : "pl-12"}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isAssistant
            ? "bg-transparent"
            : "bg-secondary text-foreground"
        }`}>
          {isAssistant ? (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const code = String(children).replace(/\n$/, "");
                    if (match) {
                      return <CodeBlock language={match[1]} code={code} />;
                    }
                    return (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    );
                  },
                  pre({ children }) {
                    return <>{children}</>;
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          )}
        </div>
      </div>
    </div>
  );
}
