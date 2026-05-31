import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const languages = [
  "auto", "python", "javascript", "typescript", "java", "cpp", "csharp",
  "go", "rust", "php", "ruby", "swift", "kotlin", "sql", "html", "css",
  "bash", "r", "scala", "dart", "lua", "perl", "haskell", "elixir",
];

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[160px] h-8 text-xs rounded-full">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang} value={lang} className="text-xs">
            {lang === "auto" ? "Auto-detect" : lang.charAt(0).toUpperCase() + lang.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
