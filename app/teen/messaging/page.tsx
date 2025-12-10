"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, Loader, Phone, Video, MoreVertical, Search, Circle } from "lucide-react"
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

export default function TeenMessagingPage() {
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

  useEffect(() => {
    const loginToChat = async () => {
      if (!user) {
        console.log('No user found, cannot login to chat')
        return
      }

      try {
        console.log('Attempting auto-login with:', { name: user.name, email: user.email, role: 'adolescent' })
        
        // Auto-login: creates user if doesn't exist, logs in if exists
        const response = await fetch(`${CHAT_BACKEND_URL}/api/auth/auto-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            name: user.name,
            email: user.email, 
            role: 'adolescent'
          })
        })

        console.log('Auto-login response status:', response.status)

        if (response.ok) {
          const chatUser = await response.json()
          console.log('Chat login successful:', chatUser)
          console.log('Setting chatUserId to:', chatUser._id)
          setIsLoggedInToChat(true)
          setChatUserId(chatUser._id)
          
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
            console.log('Teen received new message via socket:', message)
            setMessages((prev) => [...prev, message])
          })

          setSocket(newSocket)
          fetchUsers()
        } else {
          const errorText = await response.text()
          console.error('Chat login failed with status:', response.status)
          console.error('Error response:', errorText)
          alert(`Erreur de connexion au chat (${response.status}): ${errorText}`)
        }
      } catch (error) {
        console.error('Chat login error:', error)
        alert(`Erreur de connexion au chat: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    loginToChat()

    return () => {
      socket?.disconnect()
    }
  }, [user])

  const fetchUsers = async () => {
    try {
      console.log('Fetching users from:', `${CHAT_BACKEND_URL}/api/users`)
      const response = await fetch(`${CHAT_BACKEND_URL}/api/users`, {
        credentials: 'include'
      })
      console.log('Fetch users response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched users:', data)
        console.log('Number of users fetched:', data.length)
        // Adolescents see only doctors and mothers
        const filtered = data.filter((u: User) => 
          u.role === 'doctor' || u.role === 'mother'
        )
        console.log('Filtered users for adolescent:', filtered)
        console.log('Number of filtered users:', filtered.length)
        setUsers(filtered)
      } else {
        const errorText = await response.text()
        console.error('Failed to fetch users:', response.status, errorText)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch(`${CHAT_BACKEND_URL}/api/message/${userId}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleUserSelect = (selectedUser: User) => {
    setSelectedUser(selectedUser)
    fetchMessages(selectedUser._id)
  }

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedUser) return

    try {
      const response = await fetch(`${CHAT_BACKEND_URL}/api/message/send/${selectedUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: messageInput })
      })

      if (response.ok) {
        const newMessage = await response.json()
        setMessages([...messages, newMessage])
        setMessageInput("")
      } else {
        const errorText = await response.text()
        console.error('Failed to send message:', response.status, errorText)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/40 via-purple-50/30 to-pink-50/40 p-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500/80 via-purple-500/80 to-pink-500/80 p-8 shadow-xl mb-6">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
            <span className="text-4xl">💬</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">Messagerie</h1>
            <p className="text-white/90 mt-1 font-medium">Discute avec tes médecins</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-250px)]">
        {/* Users List */}
        <Card className="col-span-4 bg-white/40 backdrop-blur-sm border-purple-200/30 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-800">Contacts</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/60 border-purple-200/40 rounded-xl"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-y-auto max-h-[calc(100vh-400px)]">
              {filteredUsers.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun contact disponible</p>
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isOnline = onlineUsers.includes(u._id)
                  return (
                    <div
                      key={u._id}
                      onClick={() => handleUserSelect(u)}
                      className={`p-4 border-b border-purple-200/20 cursor-pointer transition-all hover:bg-purple-50/40 ${
                        selectedUser?._id === u._id ? 'bg-purple-50/60' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${
                            u.role === 'doctor' ? 'bg-gradient-to-br from-pink-400 to-rose-500 text-white' : 'bg-gradient-to-br from-purple-400 to-blue-500 text-white'
                          }`}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{u.name}</p>
                          <p className="text-sm text-gray-600 truncate">
                            {u.role === 'doctor' ? '👨‍⚕️ Médecin' : u.role === 'mother' ? '👩 Maman' : '👤 Utilisateur'}
                          </p>
                        </div>
                        {isOnline && <Circle className="w-2 h-2 fill-green-500 text-green-500" />}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="col-span-8 bg-white/40 backdrop-blur-sm border-purple-200/30 shadow-sm flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b border-purple-200/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${
                      selectedUser.role === 'doctor' ? 'bg-gradient-to-br from-pink-400 to-rose-500 text-white' : 'bg-gradient-to-br from-purple-400 to-blue-500 text-white'
                    }`}>
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{selectedUser.name}</h3>
                      <p className="text-sm text-gray-600">
                        {onlineUsers.includes(selectedUser._id) ? '🟢 En ligne' : '⚪ Hors ligne'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <Phone className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <Video className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(100vh-450px)]">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageCircle className="w-16 h-16 mx-auto mb-3 opacity-50" />
                      <p>Aucun message pour l'instant</p>
                      <p className="text-sm mt-1">Commence la conversation !</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderId?.toString() === chatUserId?.toString()
                    return (
                      <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl p-4 ${
                          isMine
                            ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
                            : 'bg-white/60 border border-purple-200/40 text-gray-800'
                        }`}>
                          <p className="text-sm">{msg.text}</p>
                          <p className={`text-xs mt-1 ${isMine ? 'text-white/80' : 'text-gray-500'}`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input */}
              <div className="p-4 border-t border-purple-200/30">
                <div className="flex gap-2">
                  <Input
                    placeholder="Écris ton message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 bg-white/60 border-purple-200/40 rounded-xl"
                  />
                  <Button 
                    onClick={sendMessage}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl px-6"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <MessageCircle className="w-20 h-20 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Bienvenue dans ta messagerie</h3>
                <p>Sélectionne un contact pour commencer à discuter</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
