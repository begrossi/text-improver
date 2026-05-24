import type { LLMProvider } from "./providers/types"

export function getProvider(): LLMProvider {
  const name = (process.env.LLM_PROVIDER ?? "ollama").toLowerCase()

  switch (name) {
    case "claude":
    case "anthropic": {
      const { ClaudeProvider } = require("./providers/claude")
      return new ClaudeProvider()
    }
    case "openai": {
      const { OpenAIProvider } = require("./providers/openai")
      return new OpenAIProvider()
    }
    case "ollama":
    default: {
      const { OllamaProvider } = require("./providers/ollama")
      return new OllamaProvider()
    }
  }
}
