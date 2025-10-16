import { NextResponse } from 'next/server'

export async function GET() {
  const models = [
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', description: 'Most capable model, best for complex tasks' },
    { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', description: 'Fast and efficient, great for most tasks' },
    { id: 'mistral-medium', name: 'Mistral Medium', provider: 'Mistral', description: 'Balanced performance and cost' },
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', description: 'Free tier available', free: true },
    { id: 'llama-3-8b', name: 'Llama 3 8B', provider: 'Meta', description: 'Open source, free tier available', free: true },
  ]

  return NextResponse.json({ models })
}