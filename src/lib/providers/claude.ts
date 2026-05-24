import type { LLMProvider } from "./types"

const SYSTEM_PROMPT =
  "You are a writing assistant. Improve the following text for clarity, grammar, and conciseness. Return only the improved text with no explanation, preamble, or quotes."

export class ClaudeProvider implements LLMProvider {
  private apiKey: string
  private model: string

  constructor() {
    const key = process.env.ANTHROPIC_API_KEY
    if (!key) throw new Error("ANTHROPIC_API_KEY is not set")
    this.apiKey = key
    this.model = process.env.LLM_MODEL ?? "claude-haiku-4-5-20251001"
  }

  async improve(text: string): Promise<string> {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: text }],
      }),
    })

    if (!res.ok) {
      throw new Error(`Claude API error ${res.status}: ${await res.text()}`)
    }

    const data = await res.json()
    return (data.content[0].text as string).trim()
  }
}
