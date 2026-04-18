import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ChatInputProps {
  onSend: (message: string, attachments?: string[]) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!input.trim() && files.length === 0) return;

    const attachmentUrls: string[] = [];
    if (files.length > 0 && user) {
      setUploading(true);
      for (const file of files) {
        const path = `${user.id}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage
          .from("chat-attachments")
          .upload(path, file);
        if (!error) attachmentUrls.push(path);
      }
      setUploading(false);
    }

    onSend(input, attachmentUrls.length > 0 ? attachmentUrls : undefined);
    setInput("");
    setFiles([]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  return (
    <div className="border-t border-border bg-background p-4">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-secondary rounded-lg px-3 py-1.5 text-xs">
              <span className="truncate max-w-[120px]">{file.name}</span>
              <button onClick={() => setFiles(f => f.filter((_, j) => j !== i))}>
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          multiple
          accept=".py,.js,.ts,.tsx,.jsx,.java,.cpp,.c,.cs,.go,.rs,.php,.rb,.swift,.kt,.sql,.html,.css,.json,.yaml,.yml,.xml,.md,.txt,.png,.jpg,.jpeg,.gif,.pdf"
          onChange={handleFileChange}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Textarea
          placeholder="Describe your coding problem, paste code, or ask anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || uploading}
          className="min-h-[44px] max-h-[200px] resize-none border-0 bg-secondary focus-visible:ring-1 rounded-xl"
          rows={1}
        />
        <Button
          size="icon"
          className="h-10 w-10 shrink-0 rounded-xl"
          onClick={handleSubmit}
          disabled={disabled || uploading || (!input.trim() && files.length === 0)}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
