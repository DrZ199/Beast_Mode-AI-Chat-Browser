import { NextResponse } from 'next/server'

export async function GET() {
  const models = [
    // Premium Models
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', description: 'Most capable model for complex tasks' },
    { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', description: 'Fast and efficient for most tasks' },
    { id: 'mistral-medium', name: 'Mistral Medium', provider: 'Mistral', description: 'Balanced performance and cost' },
    
    // Free Models - Google
    { id: 'gemini-flash', name: 'Gemini 1.5 Flash', provider: 'Google', free: true, description: 'Fast, versatile model for diverse tasks' },
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', free: true, description: 'Powerful reasoning and analysis' },
    
    // Free Models - Meta Llama
    { id: 'llama-3-8b', name: 'Llama 3 8B', provider: 'Meta', free: true, description: 'General purpose conversational AI' },
    { id: 'llama-3-70b', name: 'Llama 3 70B', provider: 'Meta', free: true, description: 'Larger model for complex reasoning' },
    { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', provider: 'Meta', free: true, description: 'Latest Llama with improved capabilities' },
    { id: 'llama-3.2-3b', name: 'Llama 3.2 3B', provider: 'Meta', free: true, description: 'Lightweight, efficient model' },
    
    // Free Models - Mistral AI
    { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', provider: 'Mistral AI', free: true, description: 'Mixture of experts model' },
    { id: 'mistral-7b', name: 'Mistral 7B', provider: 'Mistral AI', free: true, description: 'Efficient open source model' },
    
    // Free Models - Microsoft
    { id: 'phi-3-mini', name: 'Phi-3 Mini', provider: 'Microsoft', free: true, description: 'Small but capable reasoning model' },
    { id: 'phi-3-medium', name: 'Phi-3 Medium', provider: 'Microsoft', free: true, description: 'Balanced size and performance' },
    
    // Free Models - Specialized
    { id: 'codellama-7b', name: 'CodeLlama 7B', provider: 'Meta', free: true, description: 'Code generation and analysis' },
    { id: 'zephyr-7b', name: 'Zephyr 7B', provider: 'Hugging Face', free: true, description: 'Fine-tuned for helpfulness' },
    { id: 'openchat-7b', name: 'OpenChat 7B', provider: 'OpenChat', free: true, description: 'Open source conversational AI' },
  ]

  return NextResponse.json({ models })
}