"use client"

import { useState, useEffect, useRef } from "react"
import { User, X, Mail, Calendar, Edit2, Check, LogOut, Settings } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export function ProfileDropdown() {
  const { user, setUser } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsEditingUsername(false)
        setError("")
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleEditUsername = () => {
    setNewUsername(user?.name || "")
    setIsEditingUsername(true)
    setError("")
  }

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) {
      setError("Username cannot be empty")
      return
    }

    if (newUsername === user?.name) {
      setIsEditingUsername(false)
      return
    }

    setSaving(true)
    setError("")

    try {
      const response = await fetch("/api/user/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id || user?.id,
          name: newUsername.trim()
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update username")
      }

      const data = await response.json()
      
      // Update user context
      if (setUser && user) {
        const updatedUser = { ...user, name: newUsername.trim() }
        setUser(updatedUser)
        // Persist to localStorage
        localStorage.setItem("familyhealth_user", JSON.stringify(updatedUser))
      }

      setIsEditingUsername(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update username")
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditingUsername(false)
    setNewUsername("")
    setError("")
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8081/api/auth/logout", {
        method: "POST",
        credentials: "include"
      })

      if (response.ok) {
        // Clear user context
        if (setUser) {
          setUser(null)
        }
        // Redirect to login
        window.location.href = "/login"
      }
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      })
    } catch {
      return "N/A"
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-foreground hover:bg-muted rounded-lg p-2 transition-colors flex items-center gap-2"
        aria-label="Profile"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
          {getInitials(user.name)}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold">
                  {getInitials(user.name)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Profile</h3>
                  <p className="text-purple-100 text-sm">Manage your account</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white rounded-full hover:bg-white/20 p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Account Information */}
          <div className="p-4 space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Username
              </label>
              {isEditingUsername ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    placeholder="Enter username"
                    autoFocus
                  />
                  {error && (
                    <p className="text-xs text-red-500">{error}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveUsername}
                      disabled={saving}
                      className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {user.name || "No username"}
                    </span>
                  </div>
                  <button
                    onClick={handleEditUsername}
                    className="text-purple-600 hover:text-purple-700 p-1 rounded hover:bg-purple-50 transition-colors"
                    aria-label="Edit username"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Email
              </label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-900">
                  {user.email || "No email"}
                </span>
              </div>
            </div>

            {/* Account Created */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Member Since
              </label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-900">
                  {formatDate(user.createdAt)}
                </span>
              </div>
            </div>

            {/* User ID */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                User ID
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <code className="text-xs text-gray-600 break-all font-mono">
                  {user._id || user.id || "N/A"}
                </code>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 p-2 bg-gray-50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
