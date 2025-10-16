import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // For now, return empty array since we don't have authentication
    // In production, you'd get userId from session
    const agents = []
    
    return NextResponse.json({ agents })
  } catch (error: any) {
    console.error('Get agents error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch agents' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { goal, model, tasks, userId } = body

    if (!goal || !model || !tasks || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create agent
    const agent = await db.agent.create({
      data: {
        goal,
        model,
        status: 'idle',
        userId,
        tasks: {
          create: tasks.map((task: any) => ({
            title: task.title,
            status: task.status || 'pending'
          }))
        }
      },
      include: {
        tasks: true
      }
    })

    return NextResponse.json({ agent })
  } catch (error: any) {
    console.error('Create agent error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create agent' },
      { status: 500 }
    )
  }
}