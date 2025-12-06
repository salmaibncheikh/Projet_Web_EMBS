"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './auth-context'

interface ChatContextType {
  socket: Socket | null
  onlineUsers: string[]
  messages: Message[]
  sendMessage: (receiverId: string, text: string, image?: string) => void
  loadMessages: (userId: string) => Promise<void>
}

interface Message {
  _id: string
  senderId: string
  receiverId: string
  text?: string
  image?: string
  createdAt: string
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  // Initialize Socket.IO connection when user logs in
  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:8080', {
        query: {
          userId: user.id
        }
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

      return () => {
        newSocket.close()
      }
    } else {
      if (socket) {
        socket.close()
        setSocket(null)
      }
    }
  }, [user])

  const sendMessage = async (receiverId: string, text: string, image?: string) => {
    if (!socket || !user) return

    try {
      // Send via HTTP API (Socket.IO will broadcast it)
      const response = await fetch(`http://localhost:8081/api/message/send/${receiverId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for JWT
        body: JSON.stringify({ text, image }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const message = await response.json()
      setMessages((prev) => [...prev, message])
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const loadMessages = async (userId: string) => {
    if (!user) return

    try {
      const response = await fetch(`http://localhost:8081/api/message/${userId}`, {
        credentials: 'include', // Include cookies for JWT
      })

      if (!response.ok) {
        throw new Error('Failed to load messages')
      }

      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  return (
    <ChatContext.Provider value={{ socket, onlineUsers, messages, sendMessage, loadMessages }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
