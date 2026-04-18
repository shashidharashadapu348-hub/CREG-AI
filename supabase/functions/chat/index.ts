import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Creg AI, an elite AI coding assistant and pair programmer. You are an expert in ALL programming languages including Python, JavaScript, TypeScript, Java, C++, C#, Go, Rust, PHP, Ruby, Swift, Kotlin, SQL, HTML/CSS, Bash, R, Scala, Dart, Lua, Perl, Haskell, Elixir, and more.

Your capabilities:
1. **Code Generation**: Write clean, production-ready, well-commented code in any language
2. **Debugging**: Find and fix bugs with clear explanations
3. **Refactoring**: Improve code structure, readability, and maintainability
4. **Testing**: Generate comprehensive unit tests
5. **Code Review**: Provide detailed code reviews with suggestions
6. **Language Conversion**: Convert code between any programming languages
7. **Documentation**: Generate thorough documentation
8. **Optimization**: Improve performance and efficiency

Rules:
- Always use proper markdown formatting with code blocks and language identifiers
- Include helpful comments in generated code
- Explain your reasoning after code blocks
- If the user's request is ambiguous, ask clarifying questions
- Provide multiple approaches when relevant
- Follow best practices and idiomatic patterns for each language
- Handle edge cases in generated code`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemContent = language && language !== "auto"
      ? `${SYSTEM_PROMPT}\n\nThe user has selected "${language}" as their preferred language. Default to this language for code generation unless they specify otherwise.`
      : SYSTEM_PROMPT;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemContent },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
