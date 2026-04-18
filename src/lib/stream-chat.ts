export type Msg = { role: "user" | "assistant"; content: string };

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const CHAT_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/chat` : "";

export async function streamChat({
  messages,
  language,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  language?: string;
  onDelta: (deltaText: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}) {
  if (!CHAT_URL) {
    onError("Supabase configuration is missing. Add VITE_SUPABASE_URL.");
    return;
  }

  // Use a simple CORS request (no custom headers) to avoid preflight failures on some edge gateways.
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=UTF-8",
    },
    body: JSON.stringify({ messages, language }),
  });

  if (resp.status === 429) {
    onError("Rate limit exceeded. Please wait a moment and try again.");
    return;
  }
  if (resp.status === 402) {
    onError("AI credits exhausted. Please add funds to continue.");
    return;
  }
  if (!resp.ok) {
    let details = "";
    try {
      const payload = await resp.json();
      details = payload?.error ? ` ${payload.error}` : "";
    } catch {
      // Ignore parse errors and fall back to status-based message.
    }
    onError(`Failed to connect to AI (${resp.status}).${details}`.trim());
    return;
  }
  if (!resp.body) {
    onError("AI response stream is unavailable in this browser session. Please refresh and try again.");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}
