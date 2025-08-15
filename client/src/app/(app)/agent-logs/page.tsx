"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AgentEvent {
  id: string
  type: string
  role: string
  text: string
  timestamp: string
}

interface AgentSession {
  id: string
  voice: string
  locale: string
  startedAt: string
  endedAt: string | null
  status: string
  events: AgentEvent[]
}

export default function AgentLogsPage() {
  const [sessions, setSessions] = useState<AgentSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/agent-logs')
      const data = await res.json()
      if (data.success) {
        setSessions(data.sessions)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading agent logs...</div>
  }

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Agent Session Logs</h1>
      
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">No agent sessions found.</p>
          </CardContent>
        </Card>
      ) : (
        sessions.map((session) => (
          <Card key={session.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Session {session.id.slice(0, 8)}...
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">{session.voice}</Badge>
                  <Badge variant="outline">{session.locale}</Badge>
                  <Badge 
                    variant={session.status === 'ENDED' ? 'secondary' : 'default'}
                  >
                    {session.status}
                  </Badge>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Started: {new Date(session.startedAt).toLocaleString()}
                {session.endedAt && (
                  <span> | Ended: {new Date(session.endedAt).toLocaleString()}</span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">Events ({session.events.length}):</p>
                {session.events.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No events recorded</p>
                ) : (
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {session.events.map((event) => (
                      <div key={event.id} className="text-sm border rounded p-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant={event.role === 'user' ? 'default' : event.role === 'assistant' ? 'secondary' : 'outline'} 
                            className="text-xs"
                          >
                            {event.role}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              event.type === 'function_execution' ? 'bg-blue-50' :
                              event.type === 'agent_response' ? 'bg-green-50' :
                              event.type.includes('user') ? 'bg-yellow-50' : ''
                            }`}
                          >
                            {event.type.replace(/_/g, ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {event.text && (
                          <p className="text-sm whitespace-pre-wrap">{event.text}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
