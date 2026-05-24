"use client"

import { useState } from "react"

const MAX_CHARS = 500

export default function Home() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const remaining = MAX_CHARS - input.length
  const canSubmit = input.trim().length > 0 && !loading

  async function handleImprove() {
    setLoading(true)
    setError("")
    setResult("")
    setCopied(false)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)

    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
        signal: controller.signal,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Something went wrong")
      setResult(data.improved)
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Request timed out. Try shorter text or try again.")
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong")
      }
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleUseImproved() {
    setInput(result.slice(0, MAX_CHARS))
    setResult("")
  }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex items-start justify-center px-4 pt-20">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Text Improver</h1>
            <p className="text-gray-400 text-sm mt-1">
              Paste your text and let the AI improve it.
            </p>
          </div>
          <a
            href="https://github.com/begrossi/text-improver"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-300 transition mt-1"
            aria-label="View source on GitHub"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.579.688.481C19.138 20.2 22 16.447 22 12.021 22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <textarea
            className="w-full h-44 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-100 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="Enter your text here…"
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
            disabled={loading}
          />
          <div className="flex items-center justify-between text-xs">
            <span className={remaining < 50 ? "text-amber-400" : "text-gray-500"}>
              {remaining} characters remaining
            </span>
            <button
              type="button"
              onClick={handleImprove}
              disabled={!canSubmit}
              className="px-4 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Improving…
                </>
              ) : (
                "Improve"
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/40 border border-red-700 rounded-lg px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                Improved
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleUseImproved}
                  className="text-xs px-3 py-1 rounded-md border border-gray-600 hover:border-gray-400 text-gray-400 hover:text-gray-200 transition"
                >
                  Use as input
                </button>
                <button
                  onClick={handleCopy}
                  className="text-xs px-3 py-1 rounded-md border border-gray-600 hover:border-gray-400 text-gray-400 hover:text-gray-200 transition"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-100 whitespace-pre-wrap">
              {result}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
