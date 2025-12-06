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
            setOnlineUsers(users)
          })

          newSocket.on('newMessage', (message: Message) => {
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
      const response = await fetch(`${CHAT_BACKEND_URL}/api/message/users`, {
        credentials: 'include'
      })
      const data = await response.json()
      console.log('Fetched users:', data)
      // Filter to show only doctors
      const doctors = data.filter((u: User) => u.role === 'doctor')
      console.log('Filtered doctors:', doctors)
      setUsers(doctors)
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Messagerie</h1>
        <p className="text-muted-foreground mt-2">Communiquez directement avec vos médecins</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1 flex flex-col overflow-hidden">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-lg mb-4">Conversations</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="space-y-1">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Aucun médecin disponible
                </div>
              ) : (
                filteredUsers.map((doctor) => (
                  <button
                    key={doctor._id}
                    onClick={() => handleUserSelect(doctor)}
                    className={`w-full text-left p-4 border-b border-border hover:bg-muted transition-colors ${
                      selectedUser?._id === doctor._id ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                          {doctor.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                            onlineUsers.includes(doctor._id) ? "bg-green-500" : "bg-gray-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground text-sm">{doctor.name}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {onlineUsers.includes(doctor._id) ? "En ligne" : "Hors ligne"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          {selectedUser ? (
            <>
              {/* Header */}
              <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                      {selectedUser.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                        onlineUsers.includes(selectedUser._id) ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-base">{selectedUser.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {onlineUsers.includes(selectedUser._id) ? "En ligne" : "Hors ligne"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
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
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                            {selectedUser.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div
                            className={`px-4 py-2 rounded-lg ${
                              isMyMessage
                                ? "bg-primary text-primary-foreground rounded-br-none"
                                : "bg-muted rounded-bl-none"
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1 block">
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
              </CardContent>

              {/* Input */}
              <div className="border-t border-border p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Écrivez votre message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!messageInput.trim()} className="btn-primary">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Sélectionnez un médecin pour commencer</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
