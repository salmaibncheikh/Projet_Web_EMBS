"use client"

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

interface Message {
  _id: string
  senderId: string
  receiverId: string
  text: string
  createdAt: string
}

interface User {
  _id: string
  name: string
  email: string
  role: string
  isOnline: boolean
}

export default function ChatTestPage() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  
  // Login form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Login failed')
        return
      }

      const userData = await response.json()
      setCurrentUser(userData)
      setIsLoggedIn(true)

      // Connect to Socket.IO
      const newSocket = io('http://localhost:8081', {
        query: { userId: userData._id }
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

      // Fetch users
      fetchUsers()
    } catch (error) {
      console.error('Login error:', error)
      alert('Login failed')
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/message/users', {
        credentials: 'include'
      })
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const loadMessages = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:8081/api/message/${userId}`, {
        credentials: 'include'
      })
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedUser) return

    try {
      const response = await fetch(`http://localhost:8081/api/message/send/${selectedUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: messageText })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setMessageText('')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    }
  }

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    loadMessages(user._id)
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">Chat Test Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
            >
              Login
            </button>
          </form>
          <div className="mt-4 text-sm text-gray-600 text-center">
            <p>Use existing accounts from Next.js signup</p>
            <p className="mt-2">Mother or Doctor role</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r">
        <div className="p-4 border-b bg-blue-500 text-white">
          <h2 className="font-bold">Chat Test</h2>
          <p className="text-sm">{currentUser?.name} ({currentUser?.role})</p>
        </div>
        <div className="overflow-y-auto h-full">
          {users.map((user) => (
            <div
              key={user._id}
              onClick={() => handleUserSelect(user)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                selectedUser?._id === user._id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
                {onlineUsers.includes(user._id) && (
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 border-b bg-white">
              <h3 className="font-bold">{selectedUser.name}</h3>
              <p className="text-sm text-gray-500">{selectedUser.role}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${
                    msg.senderId === currentUser?._id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.senderId === currentUser?._id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="p-4 bg-white border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border rounded-full"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  )
}
