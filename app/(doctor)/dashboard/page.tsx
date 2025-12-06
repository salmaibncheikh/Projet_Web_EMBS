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
        // Get user from localStorage to get password (if stored)
        const storedUser = localStorage.getItem('familyhealth_user')
        if (!storedUser) return

        const userData = JSON.parse(storedUser)
        
        // Login to chat backend
        const response = await fetch(`${CHAT_BACKEND_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            email: userData.email, 
            password: userData.password || 'defaultPassword123' // Fallback
          })
        })

        if (response.ok) {
          const chatUser = await response.json()
          setIsLoggedInToChat(true)
          
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
      const response = await fetch(`${CHAT_BACKEND_URL}/api/message/users`, {
        credentials: 'include'
      })
      const data = await response.json()
      console.log('Fetched users:', data)
      // Filter to show only mothers
      const mothers = data.filter((u: User) => u.role === 'mother')
      console.log('Filtered mothers:', mothers)
      setUsers(mothers)
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground mt-1">Communiquez avec vos patientes</p>
        </div>
        {!isLoggedInToChat && (
          <div className="text-sm text-yellow-600">
            Connexion au chat en cours...
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
        {/* Users List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Utilisateurs</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border max-h-[calc(100vh-400px)] overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Aucun utilisateur trouvé
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => handleUserSelect(u)}
                    className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                      selectedUser?._id === u._id ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-semibold text-foreground">{u.name}</p>
                      {onlineUsers.includes(u._id) && (
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">{u.role}</p>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedUser ? (
            <>
              <CardHeader className="border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{selectedUser.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                  {onlineUsers.includes(selectedUser._id) && (
                    <span className="ml-auto text-sm text-green-600 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      En ligne
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[calc(100vh-500px)]">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Aucun message. Commencez la conversation!
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMyMessage = message.senderId?.toString() === user?._id?.toString()
                    console.log('Doctor - Message:', { senderId: message.senderId, userId: user?._id, isMyMessage })
                    return (
                      <div
                        key={message._id}
                        className={`flex ${
                          isMyMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isMyMessage
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
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
              </CardContent>

              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="Tapez votre message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Sélectionnez un utilisateur pour commencer</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
