"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, X, TrendingUp, AlertCircle, Info, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface Notification {
  id: string
  type: "nutrition" | "mental-health"
  category: "success" | "warning" | "info" | "error"
  title: string
  message: string
  timestamp: Date
}

export function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [seenNotifications, setSeenNotifications] = useState<Set<string>>(new Set())
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load seen notifications from localStorage
  useEffect(() => {
    const seen = localStorage.getItem("seenNotifications")
    if (seen) {
      setSeenNotifications(new Set(JSON.parse(seen)))
    }
  }, [])

  // Fetch notifications
  useEffect(() => {
    if (!user?._id) return

    const fetchNotifications = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/notifications?userId=${user._id}`)
        if (response.ok) {
          const data = await response.json()
          setNotifications(data.notifications || [])
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
    // Refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [user?._id])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const unseenCount = notifications.filter(n => !seenNotifications.has(n.id)).length

  const handleToggleDropdown = () => {
    if (!isOpen) {
      // Mark all as seen when opening
      const allIds = new Set(notifications.map(n => n.id))
      setSeenNotifications(allIds)
      localStorage.setItem("seenNotifications", JSON.stringify([...allIds]))
    }
    setIsOpen(!isOpen)
  }

  const handleDismiss = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-500" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case "info":
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "success":
        return "bg-green-50 border-green-200"
      case "warning":
        return "bg-amber-50 border-amber-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "info":
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  const getTypeIcon = (type: string) => {
    return type === "nutrition" ? "🥗" : "🧠"
  }

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggleDropdown}
        className="text-foreground hover:bg-muted rounded-lg p-2 relative transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unseenCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200 p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {notifications.length > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${getCategoryColor(notification.category)} border-l-4`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getCategoryIcon(notification.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getTypeIcon(notification.type)}</span>
                            <h4 className="text-sm font-semibold text-gray-900">
                              {notification.title}
                            </h4>
                          </div>
                          <button
                            onClick={(e) => handleDismiss(notification.id, e)}
                            className="text-gray-400 hover:text-gray-600 rounded hover:bg-gray-200 p-1 transition-colors flex-shrink-0"
                            aria-label="Dismiss"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500 capitalize">
                            {notification.type.replace("-", " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
              <button
                onClick={() => {
                  setNotifications([])
                  setIsOpen(false)
                }}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
