'use client'

import { useState, useEffect } from 'react'
import { Zap, Settings, Moon, Sun, Play, Pause, Square, Download, Trash2, Edit, Plus, ChevronRight, Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  title: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: string
}

interface Agent {
  id: string
  goal: string
  model: string
  tasks: Task[]
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed'
  createdAt: Date
}

const AVAILABLE_MODELS = [
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

export default function BeastMode() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [darkMode, setDarkMode] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showNewAgent, setShowNewAgent] = useState(false)
  const [newGoal, setNewGoal] = useState('')
  const [selectedModel, setSelectedModel] = useState('gemini-flash')
  const [apiKey, setApiKey] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const { toast } = useToast()

  // Load data from localStorage on mount and handle PWA shortcuts
  useEffect(() => {
    const savedAgents = localStorage.getItem('beastmode-agents')
    const savedSettings = localStorage.getItem('beastmode-settings')
    const savedTheme = localStorage.getItem('beastmode-theme')
    
    if (savedAgents) {
      setAgents(JSON.parse(savedAgents))
    }
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setApiKey(settings.apiKey || '')
      setSelectedModel(settings.defaultModel || 'gemini-flash')
    }
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark')
    }

    // Handle PWA shortcuts from URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const action = urlParams.get('action')
    
    if (action === 'new-agent') {
      setTimeout(() => setShowNewAgent(true), 500)
    } else if (action === 'settings') {
      setTimeout(() => setShowSettings(true), 500)
    }

    // Clean up URL parameters after handling
    if (action) {
      const url = new URL(window.location.href)
      url.searchParams.delete('action')
      window.history.replaceState({}, '', url.toString())
    }
  }, [])

  // Save agents to localStorage
  useEffect(() => {
    if (agents.length > 0) {
      localStorage.setItem('beastmode-agents', JSON.stringify(agents))
    }
  }, [agents])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('beastmode-settings', JSON.stringify({
      apiKey,
      defaultModel: selectedModel
    }))
  }, [apiKey, selectedModel])

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('beastmode-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const createAgent = () => {
    if (!newGoal.trim()) {
      toast({
        title: "Error",
        description: "Please enter a goal for your agent.",
        variant: "destructive"
      })
      return
    }

    // Generate 5 subtasks from the goal (simulated AI decomposition)
    const subtasks = generateSubtasks(newGoal)
    
    const newAgent: Agent = {
      id: Date.now().toString(),
      goal: newGoal,
      model: selectedModel,
      tasks: subtasks.map((title, index) => ({
        id: `${Date.now()}-${index}`,
        title,
        status: 'pending' as const
      })),
      status: 'idle',
      createdAt: new Date()
    }

    setAgents(prev => [newAgent, ...prev])
    setSelectedAgent(newAgent)
    setNewGoal('')
    setShowNewAgent(false)
    
    toast({
      title: "Agent Created",
      description: "Your AI agent is ready to run!",
    })
  }

  const generateSubtasks = (goal: string): string[] => {
    // Simulated AI task decomposition
    const commonPatterns = {
      research: [
        "Research and gather initial information",
        "Identify key sources and references",
        "Analyze and synthesize findings",
        "Create structured summary",
        "Generate comprehensive report"
      ],
      analysis: [
        "Define analysis framework",
        "Collect relevant data",
        "Perform detailed analysis",
        "Identify patterns and insights",
        "Create actionable recommendations"
      ],
      creation: [
        "Define requirements and objectives",
        "Create outline/structure",
        "Develop core content",
        "Refine and optimize",
        "Finalize and deliver"
      ],
      planning: [
        "Assess current situation",
        "Define objectives and KPIs",
        "Develop strategic approach",
        "Create implementation timeline",
        "Define success metrics"
      ]
    }

    const goalLower = goal.toLowerCase()
    let pattern = commonPatterns.creation // default

    if (goalLower.includes('research') || goalLower.includes('analyze') || goalLower.includes('find')) {
      pattern = commonPatterns.research
    } else if (goalLower.includes('analyze') || goalLower.includes('compare') || goalLower.includes('evaluate')) {
      pattern = commonPatterns.analysis
    } else if (goalLower.includes('plan') || goalLower.includes('strategy') || goalLower.includes('roadmap')) {
      pattern = commonPatterns.planning
    }

    return pattern
  }

  const runAgent = async () => {
    if (!selectedAgent || !apiKey) {
      toast({
        title: "API Key Required",
        description: "Please add your OpenRouter API key in settings.",
        variant: "destructive"
      })
      return
    }

    setIsRunning(true)
    const updatedAgent = { ...selectedAgent, status: 'running' as const }
    setSelectedAgent(updatedAgent)
    setAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a))

    // Execute tasks sequentially using real API
    let currentTasks = [...updatedAgent.tasks]
    
    for (let i = 0; i < currentTasks.length; i++) {
      if (currentTasks[i].status !== 'pending') continue
      
      try {
        // Update task status to running
        currentTasks[i] = { ...currentTasks[i], status: 'running' as const }
        setSelectedAgent({ ...updatedAgent, tasks: currentTasks })
        setAgents(prev => prev.map(a => a.id === updatedAgent.id ? { ...updatedAgent, tasks: currentTasks } : a))

        // Call API to execute task
        const response = await fetch('/api/run-agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agentId: updatedAgent.id,
            goal: updatedAgent.goal,
            model: updatedAgent.model,
            tasks: currentTasks,
            apiKey: apiKey
          })
        })

        const data = await response.json()
        
        if (data.success && data.updatedTasks) {
          currentTasks = data.updatedTasks
        } else {
          // Mark task as failed
          currentTasks[i] = {
            ...currentTasks[i],
            status: 'failed' as const,
            result: data.error || 'Unknown error occurred'
          }
        }

        setSelectedAgent({ ...updatedAgent, tasks: currentTasks })
        setAgents(prev => prev.map(a => a.id === updatedAgent.id ? { ...updatedAgent, tasks: currentTasks } : a))

      } catch (error: any) {
        console.error('Task execution error:', error)
        
        // Mark task as failed
        currentTasks[i] = {
          ...currentTasks[i],
          status: 'failed' as const,
          result: `Network error: ${error.message}`
        }
        
        setSelectedAgent({ ...updatedAgent, tasks: currentTasks })
        setAgents(prev => prev.map(a => a.id === updatedAgent.id ? { ...updatedAgent, tasks: currentTasks } : a))
        
        toast({
          title: "Execution Error",
          description: "Failed to execute task. Please check your API key and try again.",
          variant: "destructive"
        })
        break
      }
    }

    // Mark agent as completed or failed
    const allCompleted = currentTasks.every(t => t.status === 'completed')
    const hasFailed = currentTasks.some(t => t.status === 'failed')
    
    updatedAgent.status = hasFailed ? 'failed' : (allCompleted ? 'completed' : 'paused')
    updatedAgent.tasks = currentTasks
    
    setSelectedAgent({ ...updatedAgent })
    setAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a))
    setIsRunning(false)

    if (allCompleted) {
      toast({
        title: "Agent Completed",
        description: "All tasks have been executed successfully!",
      })
    } else if (hasFailed) {
      toast({
        title: "Agent Failed",
        description: "Some tasks failed. Check the results for details.",
        variant: "destructive"
      })
    }
  }

  

  const stopAgent = () => {
    if (!selectedAgent) return
    
    const updatedAgent = { ...selectedAgent, status: 'paused' as const }
    setSelectedAgent(updatedAgent)
    setAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a))
    setIsRunning(false)
  }

  const deleteAgent = (agentId: string) => {
    setAgents(prev => prev.filter(a => a.id !== agentId))
    if (selectedAgent?.id === agentId) {
      setSelectedAgent(null)
    }
    toast({
      title: "Agent Deleted",
      description: "The agent has been removed.",
    })
  }

  const exportAgent = () => {
    if (!selectedAgent) return

    const content = `# BeastMode Agent Report

## Goal
${selectedAgent.goal}

## Model
${selectedAgent.model}

## Created
${selectedAgent.createdAt.toLocaleString()}

## Status
${selectedAgent.status}

## Tasks
${selectedAgent.tasks.map((task, index) => `
### Task ${index + 1}: ${task.title}
**Status:** ${task.status}
${task.result ? `**Result:** ${task.result}` : ''}
`).join('\n')}

---
Generated by BeastMode AI Chat Browser
`

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `beastmode-${selectedAgent.id}.md`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: "Agent results exported as Markdown file.",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'running': return 'bg-blue-500'
      case 'pending': return 'bg-gray-500'
      case 'failed': return 'bg-red-500'
      case 'paused': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="w-3 h-3" />
      case 'running': return <Loader2 className="w-3 h-3 animate-spin" />
      case 'pending': return <ChevronRight className="w-3 h-3" />
      case 'failed': return <X className="w-3 h-3" />
      case 'paused': return <Pause className="w-3 h-3" />
      default: return <ChevronRight className="w-3 h-3" />
    }
  }

  return (
    <div className={cn(
      "min-h-screen flex",
      darkMode ? "bg-black text-white" : "bg-white text-black"
    )}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800 backdrop-blur-lg bg-black/80">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Zap className="w-8 h-8 text-violet-500" />
              <div className="absolute inset-0 w-8 h-8 bg-violet-500 rounded-full blur-xl opacity-50 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
              BeastMode
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="text-gray-400 hover:text-white"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className={cn(
                "max-w-md",
                darkMode ? "bg-gray-900 border-gray-800" : "bg-white"
              )}>
                <DialogHeader>
                  <DialogTitle className={darkMode ? "text-white" : "text-black"}>
                    Settings
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="apiKey" className={darkMode ? "text-white" : "text-black"}>
                      OpenRouter API Key
                    </Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-or-v1-..."
                      className={cn(
                        "mt-1",
                        darkMode ? "bg-gray-800 border-gray-700 text-white" : ""
                      )}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Get your key at{' '}
                      <a 
                        href="https://openrouter.ai" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-violet-500 hover:underline"
                      >
                        openrouter.ai
                      </a>
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="defaultModel" className={darkMode ? "text-white" : "text-black"}>
                      <div className="flex items-center gap-2">
                        Default Model
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full font-semibold",
                          darkMode ? "bg-green-900 text-green-300" : "bg-green-100 text-green-700"
                        )}>
                          {AVAILABLE_MODELS.filter(m => m.free).length} Free
                        </span>
                      </div>
                    </Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className={cn(
                        "mt-1",
                        darkMode ? "bg-gray-800 border-gray-700 text-white" : ""
                      )}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={cn(
                        darkMode ? "bg-gray-800 border-gray-700" : ""
                      )}>
                        {AVAILABLE_MODELS.map(model => (
                          <SelectItem 
                            key={model.id} 
                            value={model.id}
                            className={cn(
                              "cursor-pointer",
                              darkMode ? "text-white hover:bg-gray-700" : "hover:bg-gray-100"
                            )}
                          >
                            <div className="flex flex-col items-start gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{model.name}</span>
                                {model.free && <span className="text-green-500 text-xs font-semibold">(Free)</span>}
                              </div>
                              <div className={cn(
                                "text-xs opacity-70",
                                darkMode ? "text-gray-300" : "text-gray-600"
                              )}>
                                {model.provider} • {model.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className={cn(
          "w-80 border-r min-h-screen p-4",
          darkMode ? "border-gray-800 bg-gray-950" : "border-gray-200 bg-gray-50"
        )}>
          <Dialog open={showNewAgent} onOpenChange={setShowNewAgent}>
            <DialogTrigger asChild>
              <Button className="w-full mb-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Agent
              </Button>
            </DialogTrigger>
            <DialogContent className={cn(
              "max-w-lg",
              darkMode ? "bg-gray-900 border-gray-800" : "bg-white"
            )}>
              <DialogHeader>
                <DialogTitle className={darkMode ? "text-white" : "text-black"}>
                  Create New Agent
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="goal" className={darkMode ? "text-white" : "text-black"}>
                    Goal
                  </Label>
                  <Textarea
                    id="goal"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="What do you want your AI agent to accomplish?"
                    className={cn(
                      "mt-1 min-h-[100px]",
                      darkMode ? "bg-gray-800 border-gray-700 text-white" : ""
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="model" className={darkMode ? "text-white" : "text-black"}>
                    <div className="flex items-center gap-2">
                      AI Model
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full font-semibold",
                        darkMode ? "bg-green-900 text-green-300" : "bg-green-100 text-green-700"
                      )}>
                        {AVAILABLE_MODELS.filter(m => m.free).length} Free
                      </span>
                    </div>
                  </Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className={cn(
                      "mt-1",
                      darkMode ? "bg-gray-800 border-gray-700 text-white" : ""
                    )}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={cn(
                      darkMode ? "bg-gray-800 border-gray-700" : ""
                    )}>
                      {AVAILABLE_MODELS.map(model => (
                        <SelectItem 
                          key={model.id} 
                          value={model.id}
                          className={cn(
                            "cursor-pointer",
                            darkMode ? "text-white hover:bg-gray-700" : "hover:bg-gray-100"
                          )}
                        >
                          <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{model.name}</span>
                              {model.free && <span className="text-green-500 text-xs font-semibold">(Free)</span>}
                            </div>
                            <div className={cn(
                              "text-xs opacity-70",
                              darkMode ? "text-gray-300" : "text-gray-600"
                            )}>
                              {model.provider} • {model.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={createAgent}
                  className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
                >
                  Create Agent
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="space-y-2">
              {agents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No agents yet</p>
                  <p className="text-sm">Create your first agent to get started</p>
                </div>
              ) : (
                agents.map(agent => (
                  <Card
                    key={agent.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-lg",
                      selectedAgent?.id === agent.id 
                        ? "ring-2 ring-violet-500 bg-violet-950/20" 
                        : darkMode ? "bg-gray-900 hover:bg-gray-800" : "bg-white hover:bg-gray-50",
                      darkMode ? "border-gray-800" : ""
                    )}
                    onClick={() => setSelectedAgent(agent)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm line-clamp-2 flex-1">
                          {agent.goal}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-2 text-gray-500 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteAgent(agent.id)
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs",
                            darkMode ? "bg-gray-800 text-gray-300" : ""
                          )}
                        >
                          {agent.tasks.filter(t => t.status === 'completed').length}/{agent.tasks.length} tasks
                        </Badge>
                        
                        <div className="flex items-center gap-1">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            getStatusColor(agent.status)
                          )} />
                          <span className="text-xs text-gray-500">
                            {agent.status}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {selectedAgent ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Agent Header */}
              <Card className={cn(
                darkMode ? "bg-gray-900 border-gray-800" : ""
              )}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">
                        {selectedAgent.goal}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Model: {selectedAgent.model}</span>
                        <span>Created: {selectedAgent.createdAt.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {selectedAgent.status === 'idle' && (
                        <Button
                          onClick={runAgent}
                          disabled={isRunning}
                          className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Run
                        </Button>
                      )}
                      
                      {(selectedAgent.status === 'running' || isRunning) && (
                        <Button
                          onClick={stopAgent}
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        >
                          <Square className="w-4 h-4 mr-2" />
                          Stop
                        </Button>
                      )}
                      
                      <Button
                        onClick={exportAgent}
                        variant="outline"
                        disabled={selectedAgent.status !== 'completed'}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Tasks */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Tasks</h2>
                
                {selectedAgent.tasks.map((task, index) => (
                  <Card 
                    key={task.id}
                    className={cn(
                      darkMode ? "bg-gray-900 border-gray-800" : "",
                      task.status === 'running' && "ring-2 ring-blue-500"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-white mt-0.5",
                          getStatusColor(task.status)
                        )}>
                          {getStatusIcon(task.status)}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium mb-2">
                            Task {index + 1}: {task.title}
                          </h3>
                          
                          <Badge 
                            variant="outline"
                            className={cn(
                              "mb-3",
                              task.status === 'completed' && "border-green-500 text-green-500",
                              task.status === 'running' && "border-blue-500 text-blue-500",
                              task.status === 'pending' && "border-gray-500 text-gray-500",
                              task.status === 'failed' && "border-red-500 text-red-500",
                              darkMode && "bg-gray-800"
                            )}
                          >
                            {task.status}
                          </Badge>
                          
                          {task.result && (
                            <div className={cn(
                              "p-3 rounded-lg text-sm",
                              darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700"
                            )}>
                              {task.result}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
              <div className="relative mb-8">
                <Zap className="w-24 h-24 text-violet-500" />
                <div className="absolute inset-0 w-24 h-24 bg-violet-500 rounded-full blur-2xl opacity-30 animate-pulse" />
              </div>
              
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
                Welcome to BeastMode
              </h2>
              
              <p className="text-xl text-gray-500 mb-8 max-w-md">
                Your autonomous AI workforce. Create agents, set goals, and watch them execute tasks automatically.
              </p>
              
              <Button
                onClick={() => setShowNewAgent(true)}
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Agent
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}