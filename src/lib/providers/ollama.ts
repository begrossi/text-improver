import type { LLMProvider } from "./types"

const SYSTEM_PROMPT =
  "You are a writing assistant. Improve the following text for clarity, grammar, and conciseness. Return only the improved text with no explanation, preamble, or quotes."

export class OllamaProvider implements LLMProvider {
  private baseUrl: string
  private model: string

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434"
    this.model = process.env.LLM_MODEL ?? "llama3.2:3b"
  }

  async improve(text: string): Promise<string> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 55000)

    let res: Response
    try {
      res = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: text },
          ],
          stream: false,
        }),
        signal: controller.signal,
      })
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error("Ollama request timed out after 55 seconds")
      }
      throw err
    } finally {
      clearTimeout(timeout)
    }

    if (!res.ok) {
      throw new Error(`Ollama error ${res.status}: ${await res.text()}`)
    }

    const data = await res.json()
    return (data.message.content as string).trim()
  }
}
