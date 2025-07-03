"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LogOut, Monitor, Smartphone, Tablet, Clock, Shield } from "lucide-react"

interface Session {
  id: number
  token: string
  createdAt: string
  expiresAt: string
  isCurrent: boolean
}

interface SessionData {
  currentSession: {
    id: string
    lastActivity: number
    role: string
    email: string
  }
  allSessions: Session[]
}

export default function SessionManager() {
  const [sessions, setSessions] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/auth/sessions")
      
      if (!response.ok) {
        throw new Error("Failed to fetch sessions")
      }
      
      const data = await response.json()
      setSessions(data)
    } catch (error) {
      setError("Failed to load sessions")
      console.error("Error fetching sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async (action: "logout-current" | "logout-all") => {
    try {
      setActionLoading(true)
      const response = await fetch(`/api/auth/sessions?action=${action}`, {
        method: "DELETE"
      })
      
      if (!response.ok) {
        throw new Error("Failed to logout")
      }
      
      if (action === "logout-all") {
        // Redirect to login page
        window.location.href = "/login"
      } else {
        // Refresh sessions list
        await fetchSessions()
      }
    } catch (error) {
      setError("Failed to logout")
      console.error("Error logging out:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes("Mobile")) return <Smartphone className="w-4 h-4" />
    if (userAgent.includes("Tablet")) return <Tablet className="w-4 h-4" />
    return <Monitor className="w-4 h-4" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatLastActivity = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return "Just now"
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!sessions) {
    return (
      <Alert>
        <AlertDescription>No session data available</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Session Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Current Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{sessions.currentSession.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <Badge variant="secondary" className="capitalize">
                {sessions.currentSession.role}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Activity</p>
              <p className="font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {formatLastActivity(sessions.currentSession.lastActivity)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Session ID</p>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                {sessions.currentSession.id.substring(0, 16)}...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Active Sessions ({sessions.allSessions.length})</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLogout("logout-current")}
                disabled={actionLoading}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout Current
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleLogout("logout-all")}
                disabled={actionLoading}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout All
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.allSessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  session.isCurrent ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-gray-500" />
                    {session.isCurrent && (
                      <Badge variant="default" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div>
                    <p className="font-mono text-sm">
                      {session.token}
                    </p>
                    <p className="text-xs text-gray-500">
                      Created: {formatDate(session.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    Expires: {formatDate(session.expiresAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 