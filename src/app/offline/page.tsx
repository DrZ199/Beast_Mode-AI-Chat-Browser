'use client'

import { Zap, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)
    
    updateOnlineStatus()
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Zap className="w-16 h-16 text-violet-500" />
              <div className="absolute inset-0 w-16 h-16 bg-violet-500 rounded-full blur-xl opacity-50 animate-pulse" />
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
            BeastMode
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="flex justify-center">
            {isOnline ? (
              <Wifi className="w-12 h-12 text-green-500" />
            ) : (
              <WifiOff className="w-12 h-12 text-red-500" />
            )}
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {isOnline ? 'Connection Restored!' : 'You\'re Offline'}
            </h2>
            <p className="text-gray-400">
              {isOnline 
                ? 'Your internet connection has been restored. Click below to reload BeastMode.'
                : 'BeastMode needs an internet connection to create and run AI agents. Please check your connection and try again.'
              }
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleRetry}
              className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
              disabled={!isOnline}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {isOnline ? 'Reload BeastMode' : 'Retry Connection'}
            </Button>
            
            {!isOnline && (
              <div className="text-sm text-gray-500 space-y-2">
                <p>While offline, you can:</p>
                <ul className="list-disc list-inside space-y-1 text-left">
                  <li>View previously created agents</li>
                  <li>Export saved results</li>
                  <li>Browse the interface</li>
                </ul>
                <p className="mt-2">
                  <strong>Note:</strong> Creating new agents and running tasks requires an internet connection.
                </p>
              </div>
            )}
          </div>
          
          <div className="pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500">
              BeastMode - Your Autonomous AI Workforce
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}