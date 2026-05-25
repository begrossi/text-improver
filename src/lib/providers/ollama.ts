import type { LLMProvider } from "./types"

const SYSTEM_PROMPT =
  "You are a writing assistant. Your only job is to return an improved version of the user's text. Rules: (1) Fix grammar, clarity, and conciseness. (2) If the text is already correct or too short to meaningfully improve, return it exactly as-is. (3) Output ONLY the improved text — no explanations, no comments, no quotes, no preamble, nothing else."

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
