import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

interface Task {
  id: string
  title: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: string
}

interface RunAgentRequest {
  agentId: string
  goal: string
  model: string
  tasks: Task[]
  apiKey: string
}

interface RunAgentResponse {
  success: boolean
  error?: string
  updatedTasks?: Task[]
}

export async function POST(request: NextRequest): Promise<NextResponse<RunAgentResponse>> {
  try {
    const body: RunAgentRequest = await request.json()
    const { agentId, goal, model, tasks, apiKey } = body

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'API key is required'
      }, { status: 400 })
    }

    // Find the first pending task
    const pendingTaskIndex = tasks.findIndex(task => task.status === 'pending')
    
    if (pendingTaskIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'No pending tasks found'
      }, { status: 400 })
    }

    const task = tasks[pendingTaskIndex]
    
    // Update task status to running
    tasks[pendingTaskIndex] = { ...task, status: 'running' }

    try {
      // Create ZAI instance
      const zai = await ZAI.create()

      // Build context from previous completed tasks
      const context = tasks
        .filter(t => t.status === 'completed' && t.result)
        .map(t => `Previous task "${t.title}": ${t.result}`)
        .join('\n\n')

      // Build the prompt for the current task
      const prompt = buildPrompt(goal, task.title, context)

      // Map our model names to actual model identifiers
      const modelMapping: Record<string, string> = {
        'gpt-4-turbo': 'openai/gpt-4-turbo',
        'claude-3-haiku': 'anthropic/claude-3-haiku',
        'mistral-medium': 'mistralai/mistral-medium',
        'gemini-pro': 'google/gemini-pro',
        'llama-3-8b': 'meta-llama/llama-3-8b-instruct'
      }

      const selectedModel = modelMapping[model] || modelMapping['claude-3-haiku']

      // Execute the task using ZAI
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant working as part of an autonomous agent team. Execute the given task thoroughly and provide detailed, actionable results.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: selectedModel,
        temperature: 0.7,
        max_tokens: 1000
      })

      const result = completion.choices[0]?.message?.content || 'Task completed but no result generated.'

      // Update task with result
      tasks[pendingTaskIndex] = {
        ...task,
        status: 'completed',
        result
      }

      return NextResponse.json({
        success: true,
        updatedTasks: tasks
      })

    } catch (aiError: any) {
      console.error('AI execution error:', aiError)
      
      // Mark task as failed
      tasks[pendingTaskIndex] = {
        ...task,
        status: 'failed',
        result: `Error: ${aiError.message || 'Unknown error occurred'}`
      }

      return NextResponse.json({
        success: false,
        error: `AI execution failed: ${aiError.message}`,
        updatedTasks: tasks
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Run agent error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

function buildPrompt(goal: string, taskTitle: string, context: string): string {
  let prompt = `Overall Goal: ${goal}\n\n`
  
  if (context) {
    prompt += `Context from previous tasks:\n${context}\n\n`
  }
  
  prompt += `Current Task: ${taskTitle}\n\n`
  prompt += `Please execute this task thoroughly. Consider the overall goal and any previous context. Provide detailed, actionable results that will help accomplish the overall objective.`
  
  return prompt
}