'use client'

import { useState, useEffect } from 'react'
import { Download, X, Smartphone, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('desktop')

  useEffect(() => {
    // Check if app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                          window.matchMedia('(display-mode: fullscreen)').matches ||
                          // @ts-ignore
                          window.navigator.standalone === true

    setIsInstalled(isAppInstalled)

    // Detect device type
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    setDeviceType(isMobile ? 'mobile' : 'desktop')

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show install prompt after a delay if not already dismissed
      const dismissed = localStorage.getItem('beastmode-install-dismissed')
      if (!dismissed && !isAppInstalled) {
        setTimeout(() => setShowInstallPrompt(true), 5000)
      }
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('✅ BeastMode: PWA was installed successfully')
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
      localStorage.removeItem('beastmode-install-dismissed')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      console.log(`⚡ BeastMode: User ${outcome} the install prompt`)
      
      if (outcome === 'accepted') {
        setShowInstallPrompt(false)
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('❌ BeastMode: Install prompt failed:', error)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    localStorage.setItem('beastmode-install-dismissed', 'true')
  }

  // Don't show if already installed or no prompt available
  if (isInstalled || !deferredPrompt || !showInstallPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-right-full">
      <Card className="bg-gradient-to-r from-violet-900/95 to-blue-900/95 border-violet-500/50 shadow-2xl backdrop-blur-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {deviceType === 'mobile' ? (
                <Smartphone className="w-5 h-5 text-violet-400" />
              ) : (
                <Monitor className="w-5 h-5 text-violet-400" />
              )}
              <CardTitle className="text-lg text-white">Install BeastMode</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-6 w-6 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription className="text-gray-300">
            Get the full native app experience
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <ul className="text-sm text-gray-300 space-y-1">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                Offline access to your agents
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                Faster loading and performance
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                Native {deviceType} app experience
              </li>
            </ul>
            
            <Button 
              onClick={handleInstallClick}
              className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-semibold"
            >
              <Download className="w-4 h-4 mr-2" />
              Install App
            </Button>
            
            <p className="text-xs text-gray-400 text-center">
              {deviceType === 'mobile' 
                ? 'Add to home screen for quick access'
                : 'Install as desktop app for better experience'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}