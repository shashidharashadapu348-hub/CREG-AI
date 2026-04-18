import { Button } from "@/components/ui/button";
import { Bug, TestTube2, Zap, RefreshCw, FileText, ArrowLeftRight } from "lucide-react";

interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
}

const prompts = [
  { label: "Fix bugs", icon: Bug, prompt: "Find and fix all bugs in the following code:" },
  { label: "Add tests", icon: TestTube2, prompt: "Write comprehensive unit tests for the following code:" },
  { label: "Optimize", icon: Zap, prompt: "Optimize the following code for better performance:" },
  { label: "Refactor", icon: RefreshCw, prompt: "Refactor the following code for better readability and maintainability:" },
  { label: "Explain", icon: FileText, prompt: "Explain the following code in detail:" },
  { label: "Convert", icon: ArrowLeftRight, prompt: "Convert the following code to a different programming language:" },
];

export function QuickPrompts({ onSelect }: QuickPromptsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((p) => (
        <Button
          key={p.label}
          variant="outline"
          size="sm"
          className="text-xs gap-1.5 rounded-full h-8"
          onClick={() => onSelect(p.prompt)}
        >
          <p.icon className="h-3 w-3" />
          {p.label}
        </Button>
      ))}
    </div>
  );
}
