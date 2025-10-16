import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await db.agent.findUnique({
      where: { id: params.id },
      include: {
        tasks: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ agent })
  } catch (error: any) {
    console.error('Get agent error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch agent' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, tasks } = body

    // Update agent
    const updatedAgent = await db.agent.update({
      where: { id: params.id },
      data: {
        status,
        updatedAt: new Date()
      },
      include: {
        tasks: true
      }
    })

    // Update tasks if provided
    if (tasks && Array.isArray(tasks)) {
      for (const task of tasks) {
        await db.task.update({
          where: { id: task.id },
          data: {
            status: task.status,
            result: task.result,
            updatedAt: new Date()
          }
        })
      }
    }

    // Fetch updated agent with tasks
    const agent = await db.agent.findUnique({
      where: { id: params.id },
      include: {
        tasks: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    return NextResponse.json({ agent })
  } catch (error: any) {
    console.error('Update agent error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update agent' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.agent.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete agent error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete agent' },
      { status: 500 }
    )
  }
}