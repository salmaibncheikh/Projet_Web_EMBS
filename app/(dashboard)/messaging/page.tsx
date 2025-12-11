"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, Loader, Phone, Video, MoreVertical, Search, Sparkles, Users, Shield, Bell } from "lucide-react"
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
  const [greeting, setGreeting] = useState("Bonne journée")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Bonjour")
    else if (hour < 18) setGreeting("Bon après-midi")
    else setGreeting("Bonsoir")
  }, [])

  const features = [
    { icon: Shield, label: "Messages sécurisés", color: "blue" },
    { icon: Users, label: "Médecins certifiés", color: "cyan" },
    { icon: Bell, label: "Notifications", color: "sky" }
  ]

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-sky-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-xl backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-cyan-50/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIHN0b3AtY29sb3I9IiMwMDdiZmYiIHN0b3Atb3BhY2l0eT0iMC4wNSIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzAwYjZmZiIgc3RvcC1vcGFjaXR5PSIwLjAyIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==')]"></div>
        
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
                  {greeting}, <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{user?.name || 'Utilisateur'}</span>
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-1">
                  Communiquez directement avec vos médecins et professionnels de santé
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {features.map((feature, idx) => {
                const Icon = feature.icon
                return (
                  <div key={idx} className="px-3 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 flex items-center gap-2">
                    <Icon className={`w-4 h-4 text-${feature.color}-600`} />
                    <span className="text-xs font-medium text-gray-700 hidden md:inline">{feature.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-cyan-100/50 rounded-bl-full transition-all duration-500 group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Médecins</span>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-blue-600 font-medium">Disponibles</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-100 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <span className="text-2xl">👨‍⚕️</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{users.length}</p>
            <p className="text-sm text-gray-600">professionnels certifiés</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-100/50 to-sky-100/50 rounded-bl-full transition-all duration-500 group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Messages</span>
                <div className="flex items-center gap-2 mt-1">
                  <MessageCircle className="w-4 h-4 text-cyan-500" />
                  <span className="text-xs text-cyan-600 font-medium">Non lus</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-sky-500 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <span className="text-2xl">💬</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{messages.filter(m => m.senderId !== user?._id).length}</p>
            <p className="text-sm text-gray-600">messages en attente</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-100/50 to-blue-100/50 rounded-bl-full transition-all duration-500 group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">En ligne</span>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="w-4 h-4 text-sky-500" />
                  <span className="text-xs text-sky-600 font-medium">Actifs</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <span className="text-2xl">⚡</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-1">{onlineUsers.length}</p>
            <p className="text-sm text-gray-600">utilisateurs connectés</p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1 flex flex-col overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg group">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Conversations</h2>
                <p className="text-sm text-gray-600">Vos contacts professionnels</p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 bg-white focus:ring-2 focus:ring-blue-400/50 rounded-xl transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {filteredUsers.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">Aucun contact disponible</p>
                  <p className="text-gray-500 text-sm mt-1">Vos contacts apparaîtront ici</p>
                </div>
              ) : (
                filteredUsers.map((contact) => (
                  <button
                    key={contact._id}
                    onClick={() => handleUserSelect(contact)}
                    className={`w-full text-left p-4 border-b border-gray-200 hover:bg-blue-50/30 transition-all duration-200 rounded-lg mx-2 ${
                      selectedUser?._id === contact._id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-sm font-semibold text-white shadow-sm">
                          {contact.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            onlineUsers.includes(contact._id) ? "bg-green-500 animate-pulse" : "bg-gray-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-800">{contact.name}</p>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {contact.role === 'doctor' ? 'Médecin' : 'Patient'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {onlineUsers.includes(contact._id) ? "En ligne" : "Hors ligne"}
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
        <div className="lg:col-span-2 flex flex-col overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg">
          {selectedUser ? (
            <>
              {/* Header */}
              <div className="border-b border-gray-200 p-6 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-sm font-semibold text-white shadow-sm">
                      {selectedUser.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        onlineUsers.includes(selectedUser._id) ? "bg-green-500 animate-pulse" : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{selectedUser.name}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedUser.role === 'doctor' ? 'Médecin' : 'Patient'} • 
                      {onlineUsers.includes(selectedUser._id) ? " En ligne" : " Hors ligne"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-blue-50/50 rounded-xl">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-blue-50/50 rounded-xl">
                    <Video className="w-5 h-5 text-blue-600" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-blue-50/50 rounded-xl">
                    <MoreVertical className="w-5 h-5 text-blue-600" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white/50 
            overflow-y-auto"
     style={{ height: "360px" }}>
                {messages.map((message) => {
                  const isMyMessage = message.senderId?.toString() === user?._id?.toString()
                  return (
                    <div
                      key={message._id}
                      className={`flex ${isMyMessage ? "justify-end" : "justify-start"} animate-in fade-in-50`}
                    >
                      <div className={`flex gap-3 max-w-xs ${isMyMessage ? "flex-row-reverse" : ""}`}>
                        {!isMyMessage && (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 shadow-sm mt-1">
                            {selectedUser.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="space-y-1">
                          <div
                            className={`px-4 py-3 rounded-2xl shadow-sm ${
                              isMyMessage
                                ? "bg-gradient-to-br from-blue-400 to-cyan-400 text-white rounded-br-none"
                                : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm"
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                          </div>
                          <span className="text-xs text-gray-500 block px-1">
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
              <div className="border-t border-gray-200 p-6 bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Écrivez votre message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="pl-4 pr-12 border-gray-300 bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent rounded-xl h-12"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={!messageInput.trim()} 
                    className="h-12 px-6 bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl shadow-sm hover:shadow-md transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full p-12">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Bienvenue dans la messagerie</h3>
                <p className="text-gray-600 mb-6">
                  Sélectionnez un contact pour commencer une conversation sécurisée avec votre médecin ou patient
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-4 py-3 bg-blue-50/50 rounded-xl">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-700">Messages cryptés end-to-end</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 bg-blue-50/50 rounded-xl">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-700">Téléconsultation intégrée</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-br from-blue-50/50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Conseil de communication</h3>
            <p className="text-xs text-gray-500">Messages efficaces</p>
          </div>
        </div>
        <p className="text-sm text-gray-700">
          Pour une communication plus efficace avec votre médecin, décrivez clairement vos symptômes,
          mentionnez leur durée et notez toute médication en cours. Ajoutez des photos si nécessaire.
        </p>
      </div>
    </div>
  )
}