"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MessageSquare, Send, Search } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { io, Socket } from "socket.io-client"

interface User {
  _id: string
  name: string
  email: string
  role: string
  isOnline?: boolean
}

interface Message {
  _id: string
  senderId: string
  receiverId: string
  text: string
  createdAt: string
}

const CHAT_BACKEND_URL = 'http://localhost:8081'

export default function DoctorMessagesPage() {
  const { user } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [isLoggedInToChat, setIsLoggedInToChat] = useState(false)
  const [chatUserId, setChatUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-login to chat backend when component mounts
  useEffect(() => {
    const loginToChat = async () => {
      if (!user) return

      try {
        // Auto-login: creates user if doesn't exist, logs in if exists
        const response = await fetch(`${CHAT_BACKEND_URL}/api/auth/auto-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            name: user.name,
            email: user.email, 
            role: user.role || 'doctor'
          })
        })

        if (response.ok) {
          const chatUser = await response.json()
          console.log('Chat login successful, chatUserId:', chatUser._id)
          setIsLoggedInToChat(true)
          setChatUserId(chatUser._id)
          
          // Connect to Socket.IO
          const newSocket = io(CHAT_BACKEND_URL, {
            query: { userId: chatUser._id }
          })

          newSocket.on('connect', () => {
            console.log('Connected to chat server')
          })

          newSocket.on('getOnlineUsers', (users: string[]) => {
            setOnlineUsers(users)
          })

          newSocket.on('newMessage', (message: Message) => {
            console.log('Doctor received new message via socket:', message)
            setMessages((prev) => [...prev, message])
          })

          setSocket(newSocket)

          // Fetch users list
          fetchUsers()
        }
      } catch (error) {
        console.error('Chat login error:', error)
      }
    }

    loginToChat()

    return () => {
      if (socket) {
        socket.close()
      }
    }
  }, [user])

  const fetchUsers = async () => {
    try {
      console.log('Fetching users from chat backend...')
      const response = await fetch(`${CHAT_BACKEND_URL}/api/users`, {
        credentials: 'include'
      })
      const data = await response.json()
      console.log('Fetched users:', data)
      console.log('Number of users fetched:', data.length)
      // Doctors see mothers and adolescents (including 'teen' role)
      const filtered = data.filter((u: User) => u.role === 'mother' || u.role === 'adolescent' || u.role === 'teen')
      console.log('Filtered users for doctor:', filtered)
      console.log('Number of filtered users:', filtered.length)
      setUsers(filtered)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const loadMessages = async (userId: string) => {
    try {
      const response = await fetch(`${CHAT_BACKEND_URL}/api/message/${userId}`, {
        credentials: 'include'
      })
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleUserSelect = (selectedUser: User) => {
    setSelectedUser(selectedUser)
    loadMessages(selectedUser._id)
  }

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendMessage = async () => {
    if (messageInput.trim() && selectedUser) {
      try {
        const response = await fetch(`${CHAT_BACKEND_URL}/api/message/send/${selectedUser._id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ text: messageInput })
        })

        if (!response.ok) {
          throw new Error('Failed to send message')
        }

        const sentMessage = await response.json()
        setMessages((prev) => [...prev, sentMessage])
        setMessageInput("")
      } catch (error) {
        console.error('Error sending message:', error)
        alert('Impossible d\'envoyer le message')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/40 via-cyan-50/30 to-blue-50/40 p-6 space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-500/80 via-cyan-500/80 to-blue-500/80 p-8 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
              <span className="text-4xl">👨‍⚕️</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">Messages</h1>
              <p className="text-white/90 mt-1 font-medium">Communiquez avec vos patientes</p>
            </div>
          </div>
          {!isLoggedInToChat && (
            <div className="text-sm bg-yellow-50/90 backdrop-blur-sm text-yellow-700 px-4 py-2 rounded-xl border border-yellow-200/50">
              Connexion au chat en cours...
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
        {/* Users List */}
        <div className="lg:col-span-1 flex flex-col overflow-hidden bg-white/40 backdrop-blur-sm rounded-2xl border border-teal-200/30 shadow-sm">
          <div className="p-6 border-b border-teal-200/30">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-teal-500" />
              Utilisateurs
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-teal-200/40 bg-white/60 focus:ring-2 focus:ring-teal-400/50 rounded-xl"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-0">
            <div className="space-y-1">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Aucun utilisateur trouvé
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => handleUserSelect(u)}
                    className={`w-full p-4 text-left border-b border-teal-200/30 hover:bg-teal-50/30 transition-all duration-200 ${
                      selectedUser?._id === u._id ? "bg-teal-50/50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-semibold text-gray-800">{u.name}</p>
                      {onlineUsers.includes(u._id) && (
                        <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{u.email}</p>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{u.role}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col overflow-hidden bg-white/40 backdrop-blur-sm rounded-2xl border border-teal-200/30 shadow-sm">
          {selectedUser ? (
            <>
              <div className="p-6 border-b border-teal-200/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-400/70 to-cyan-400/70 rounded-full flex items-center justify-center shadow-sm">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{selectedUser.name}</h3>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  </div>
                  {onlineUsers.includes(selectedUser._id) && (
                    <span className="ml-auto text-sm text-green-600 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      En ligne
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[calc(100vh-500px)]">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Aucun message. Commencez la conversation!
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMyMessage = message.senderId?.toString() === chatUserId?.toString()
                    return (
                      <div
                        key={message._id}
                        className={`flex ${
                          isMyMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl p-3 shadow-sm ${
                            isMyMessage
                              ? "bg-gradient-to-br from-teal-400/80 to-cyan-400/80 text-white rounded-br-none"
                              : "bg-white/60 backdrop-blur-sm border border-teal-200/40 text-gray-800 rounded-bl-none"
                          }`}
                        >
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-teal-200/30 bg-white/20 backdrop-blur-sm">
                <div className="flex gap-2">
                  <Input
                    placeholder="Tapez votre message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 border-teal-200/40 bg-white/60 focus:ring-2 focus:ring-teal-400/50 rounded-xl"
                  />
                  <Button onClick={handleSendMessage} size="icon" className="bg-gradient-to-r from-teal-400/80 to-cyan-400/80 hover:from-teal-500 hover:to-cyan-500 text-white rounded-xl shadow-sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400/20 to-cyan-400/20 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-10 h-10 text-teal-500" />
                </div>
                <p className="text-gray-600 font-medium">Sélectionnez un utilisateur pour commencer</p>
                <p className="text-gray-500 text-sm mt-1">Vos conversations apparaîtront ici</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
