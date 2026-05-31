import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  language?: string;
  code: string;
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = getExtension(language || "txt");
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-border my-3 group">
      <div className="flex items-center justify-between bg-muted px-4 py-2">
        <span className="text-xs font-mono text-muted-foreground">
          {language || "plaintext"}
        </span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
            {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <pre className="m-0 overflow-x-auto rounded-none bg-[#0f172a] p-4 text-sm leading-6 text-slate-100">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}

function getExtension(lang: string): string {
  const map: Record<string, string> = {
    javascript: "js", typescript: "ts", python: "py", java: "java",
    cpp: "cpp", csharp: "cs", go: "go", rust: "rs", php: "php",
    ruby: "rb", swift: "swift", kotlin: "kt", sql: "sql",
    html: "html", css: "css", bash: "sh", shell: "sh", json: "json",
    yaml: "yml", xml: "xml", markdown: "md",
  };
  return map[lang] || "txt";
}
