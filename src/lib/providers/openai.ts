import type { LLMProvider } from "./types"

const SYSTEM_PROMPT =
  "You are a writing assistant. Improve the following text for clarity, grammar, and conciseness. Return only the improved text with no explanation, preamble, or quotes."

export class OpenAIProvider implements LLMProvider {
  private apiKey: string
  private model: string

  constructor() {
    const key = process.env.OPENAI_API_KEY
    if (!key) throw new Error("OPENAI_API_KEY is not set")
    this.apiKey = key
    this.model = process.env.LLM_MODEL ?? "gpt-4o-mini"
  }

  async improve(text: string): Promise<string> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
      }),
    })

    if (!res.ok) {
      throw new Error(`OpenAI error ${res.status}: ${await res.text()}`)
    }

    const data = await res.json()
    return (data.choices[0].message.content as string).trim()
  }
}
