"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, Loader, Phone, Video, MoreVertical, Search } from "lucide-react"
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

export default function MessagingPage() {
  const { user } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [isLoggedInToChat, setIsLoggedInToChat] = useState(false)
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
            role: user.role || 'mother'
          })
        })

        if (response.ok) {
          const chatUser = await response.json()
          console.log('Chat login successful:', chatUser)
          setIsLoggedInToChat(true)
          
          // Connect to Socket.IO
          const newSocket = io(CHAT_BACKEND_URL, {
            query: { userId: chatUser._id }
          })

          newSocket.on('connect', () => {
            console.log('Connected to chat server')
          })

          newSocket.on('getOnlineUsers', (users: string[]) => {
            console.log('Online users updated:', users)
            setOnlineUsers(users)
          })

          newSocket.on('newMessage', (message: Message) => {
            console.log('New message received via socket:', message)
            setMessages((prev) => [...prev, message])
          })

          setSocket(newSocket)

          // Fetch users list
          fetchUsers()
        } else {
          const errorData = await response.json()
          console.error('Chat login failed:', errorData)
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
      console.log('Current user role:', user?.role)
      
      // Filter based on current user role
      let filteredUsers = data
      if (user?.role === 'mother') {
        // Mothers see only doctors
        filteredUsers = data.filter((u: User) => u.role === 'doctor')
        console.log('Mother filtering - showing only doctors')
      } else if (user?.role === 'doctor') {
        // Doctors see mothers and adolescents (teen or adolescent role)
        filteredUsers = data.filter((u: User) => u.role === 'mother' || u.role === 'adolescent' || u.role === 'teen')
        console.log('Doctor filtering - showing mothers and adolescents')
      } else {
        console.log('Unknown role or no filter applied. User role:', user?.role)
        console.log('Showing all users by default')
      }
      
      console.log('Filtered users:', filteredUsers)
      console.log('Number of filtered users:', filteredUsers.length)
      setUsers(filteredUsers)
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !selectedUser) return

    try {
      const response = await fetch(`${CHAT_BACKEND_URL}/api/message/send/${selectedUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: messageInput })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages((prev) => [...prev, data])
        setMessageInput("")
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/40 via-cyan-50/30 to-sky-50/40 p-6 space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500/80 via-cyan-500/80 to-sky-500/80 p-8 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
            <span className="text-4xl">💬</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">Messagerie</h1>
            <p className="text-white/90 mt-1 font-medium">Communiquez directement avec vos médecins</p>
            <p className="text-white/70 mt-1 text-sm">Role: {user?.role || 'unknown'} | Users: {users.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <div className="lg:col-span-1 flex flex-col overflow-hidden bg-white/40 backdrop-blur-sm rounded-2xl border border-blue-200/30 shadow-sm">
          <div className="border-b border-blue-200/30 pb-4 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              Conversations
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-blue-200/40 bg-white/60 focus:ring-2 focus:ring-blue-400/50 rounded-xl transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-0">
            <div className="space-y-1">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Aucun médecin disponible
                </div>
              ) : (
                filteredUsers.map((doctor) => (
                  <button
                    key={doctor._id}
                    onClick={() => handleUserSelect(doctor)}
                    className={`w-full text-left p-4 border-b border-blue-200/30 hover:bg-blue-50/30 transition-all duration-200 ${
                      selectedUser?._id === doctor._id ? "bg-blue-50/50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400/70 to-cyan-400/70 flex items-center justify-center text-sm font-semibold text-white shadow-sm">
                          {doctor.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            onlineUsers.includes(doctor._id) ? "bg-green-500 animate-pulse" : "bg-gray-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-800 text-sm">{doctor.name}</p>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">
                          {onlineUsers.includes(doctor._id) ? "En ligne" : "Hors ligne"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col overflow-hidden bg-white/40 backdrop-blur-sm rounded-2xl border border-blue-200/30 shadow-sm">
          {selectedUser ? (
            <>
              {/* Header */}
              <div className="border-b border-blue-200/30 pb-4 p-6 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400/70 to-cyan-400/70 flex items-center justify-center text-sm font-semibold text-white shadow-sm">
                      {selectedUser.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        onlineUsers.includes(selectedUser._id) ? "bg-green-500 animate-pulse" : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-800">{selectedUser.name}</h3>
                    <p className="text-xs text-gray-600">
                      {onlineUsers.includes(selectedUser._id) ? "En ligne" : "Hors ligne"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-blue-50/50 rounded-xl">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-blue-50/50 rounded-xl">
                    <Video className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-blue-50/50 rounded-xl">
                    <MoreVertical className="w-4 h-4 text-blue-600" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  const isMyMessage = message.senderId?.toString() === user?._id?.toString()
                  console.log('Mother - Message:', { senderId: message.senderId, userId: user?._id, isMyMessage })
                  return (
                    <div
                      key={message._id}
                      className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex gap-2 max-w-xs ${isMyMessage ? "flex-row-reverse" : ""}`}>
                        {!isMyMessage && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400/70 to-cyan-400/70 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 shadow-sm">
                            {selectedUser.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div
                            className={`px-4 py-2 rounded-2xl shadow-sm ${
                              isMyMessage
                                ? "bg-gradient-to-br from-blue-400/80 to-cyan-400/80 text-white rounded-br-none"
                                : "bg-white/60 backdrop-blur-sm border border-blue-200/40 text-gray-800 rounded-bl-none"
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                          </div>
                          <span className="text-xs text-gray-500 mt-1 block opacity-70">
                            {new Date(message.createdAt).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-blue-200/30 p-4 bg-white/20 backdrop-blur-sm">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Écrivez votre message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 border-blue-200/40 bg-white/60 focus:ring-2 focus:ring-blue-400/50 rounded-xl"
                  />
                  <Button type="submit" disabled={!messageInput.trim()} className="bg-gradient-to-r from-blue-400/80 to-cyan-400/80 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl shadow-sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400/20 to-cyan-400/20 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-blue-500" />
                </div>
                <p className="text-gray-600 font-medium">Sélectionnez un médecin pour commencer</p>
                <p className="text-gray-500 text-sm mt-1">Vos conversations apparaîtront ici</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
