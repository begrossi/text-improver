export interface LLMProvider {
  improve(text: string): Promise<string>
}
