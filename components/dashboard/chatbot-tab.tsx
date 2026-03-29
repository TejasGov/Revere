'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { Mic, MicOff, Loader2, BotMessageSquare, AlertCircle } from 'lucide-react'
import { useConversation, ConversationProvider } from '@elevenlabs/react'
import { cn } from '@/lib/utils'
import type { DashboardSnapshot } from '@/lib/dashboard-types'
import { VoicePoweredOrb } from '@/components/ui/voice-powered-orb'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'

type ChatbotTabProps = {
  data: DashboardSnapshot
}

type Message = {
  id: string
  source: 'user' | 'ai'
  text: string
}

function ChatbotInner({ data }: ChatbotTabProps) {
  const [hasPermission, setHasPermission] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID

  const conversation = useConversation({
    onConnect: () => console.log('Connected to ElevenLabs Agent'),
    onDisconnect: () => console.log('Disconnected from ElevenLabs Agent'),

    // Attempting standard callbacks that @elevenlabs/react might fire 
    // depending on the version for transcripts.
    onMessage: (props: any) => {
      // The onMessage callback might give { source: 'ai', message: 'hello' }
      if (props && typeof props === 'object' && props.message) {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + Math.random(),
          source: props.source === 'user' ? 'user' : 'ai',
          text: props.message
        }])
      }
    },

    onError: (error) => {
      console.error('ElevenLabs Error:', error)
      alert(`ElevenLabs Connection Error: ${typeof error === 'string' ? error : (error as Error).message || 'Check console'}. Make sure you clicked Publish and defined the Variable!`)
    },
  })

  // Start the conversation session
  const toggleConversation = useCallback(async () => {
    if (conversation.status === 'connected') {
      await conversation.endSession()
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        setHasPermission(true)

        // Convert dashboard data to a readable string context for the AI
        const contextStr = JSON.stringify({
          scheduleToday: data.schedule,
          facesKnown: data.faces.map(f => f.name),
          recentActivity: data.activity.slice(0, 5)
        })

        // Start session using their exact agent id and send the live dashboard data
        await conversation.startSession({
          agentId: agentId || 'agent_5501kmtw6tawef9arhcfs74xt2s3',
          dynamicVariables: {
            dashboard_context: contextStr
          }
        })
      } catch (err) {
        console.error('Failed to start conversation:', err)
        alert(`Failed to start conversation: \n${err}`)
      }
    }
  }, [conversation, data, agentId])

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-8rem)] md:h-[calc(100vh-5rem)] max-w-6xl mx-auto p-4 md:p-6 animate-fade-in relative overflow-hidden">

      {/* Left Column: Voice Orb and Controls */}
      <div className="flex flex-col items-center justify-center space-y-8 bg-card rounded-2xl p-6 shadow-sm border border-border/40 relative">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-serif tracking-tight text-foreground flex items-center justify-center gap-2">
            <BotMessageSquare className="w-6 h-6 text-primary" />
            Caregiver Assistant
          </h2>
          <p className="text-sm text-muted-foreground w-full max-w-sm mx-auto">
            Interactive AI companion that knows the patient's schedule and familiar faces. Tap to talk.
          </p>
        </div>

        {!agentId && (
          <div className="flex items-start gap-3 p-4 bg-destructive/10 text-destructive rounded-lg w-full max-w-sm text-left">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Missing Agent ID</p>
              <p className="opacity-90">Please add NEXT_PUBLIC_ELEVENLABS_AGENT_ID to your .env.local file.</p>
            </div>
          </div>
        )}

        {/* Voice Orb and Microphone Area */}
        <div className="relative flex items-center justify-center w-64 h-64 rounded-full bg-gradient-to-b from-background to-background/50 shadow-inner overflow-hidden border border-border/10">
          {/* If connected, enable voice control on the orb to react to AI and User voice */}
          <div className="absolute inset-0 pointer-events-none scale-105">
            <VoicePoweredOrb
              enableVoiceControl={conversation.status === 'connected'}
              voiceSensitivity={1.5}
              maxRotationSpeed={2.5}
              className="opacity-90 mix-blend-screen"
            />
          </div>

          <Button
            onClick={toggleConversation}
            disabled={!agentId && conversation.status !== 'connected'}
            variant={conversation.status === 'connected' ? 'destructive' : 'outline'}
            size="icon"
            className={cn(
              "relative z-10 w-20 h-20 rounded-full shadow-lg transition-all duration-300 backdrop-blur-md border-2 border-border/50",
              conversation.status === 'connected'
                ? "scale-105 ring-4 ring-destructive/20"
                : "bg-background/60 hover:bg-background/80 hover:scale-105 ring-4 ring-background/20 text-foreground/80 hover:text-foreground",
              (!agentId && conversation.status !== 'connected') && "opacity-50 cursor-not-allowed"
            )}
          >
            {conversation.status === 'connecting' ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : conversation.status === 'connected' ? (
              <MicOff className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </Button>
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm font-medium">
            {conversation.status === 'connected'
              ? (conversation.isSpeaking ? 'Agent is speaking...' : 'Listening...')
              : conversation.status === 'connecting'
                ? 'Connecting to AI...'
                : 'Disconnected'}
          </p>
          {conversation.status === 'connected' && (
            <p className="text-xs text-muted-foreground animate-fade-in delay-150">
              Aware of {data.schedule.length} schedule items and {data.faces.length} faces.
            </p>
          )}
        </div>
      </div>

      {/* Right Column: Text Transcript */}
      <div className="flex flex-col h-full bg-muted/20 rounded-2xl border border-border/40 overflow-hidden shadow-inner w-full relative">
        <div className="p-4 border-b border-border/40 bg-card/50 backdrop-blur-sm flex items-center justify-between z-10">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            Live Transcript
          </h3>
          {conversation.status === 'connected' && (
            <span className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live
            </span>
          )}
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 pb-4 px-2">
            {messages.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm flex-col gap-3 opacity-60">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <BotMessageSquare className="w-6 h-6" />
                </div>
                <p>Start a conversation to see the transcript here.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex w-full animate-in fade-in slide-in-from-bottom-2",
                    msg.source === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                    msg.source === 'user'
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-background border border-border/50 text-foreground rounded-tl-sm ring-1 ring-black/5 dark:ring-white/5"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>

    </div>
  )
}

export function ChatbotTab({ data }: ChatbotTabProps) {
  return (
    <ConversationProvider>
      <ChatbotInner data={data} />
    </ConversationProvider>
  )
}
