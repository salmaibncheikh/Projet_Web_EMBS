"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MessageSquare, Send, Search } from "lucide-react"

interface Message {
  id: string
  patientName: string
  patientEmail: string
  content: string
  timestamp: string
  isFromPatient: boolean
}

interface Conversation {
  patientId: string
  patientName: string
  patientEmail: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export default function DoctorMessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data - will be replaced with real data from MongoDB
  const conversations: Conversation[] = [
    {
      patientId: "1",
      patientName: "Sarah Martin",
      patientEmail: "sarah.martin@example.com",
      lastMessage: "Merci docteur pour vos conseils",
      lastMessageTime: "Il y a 2h",
      unreadCount: 0,
    },
    {
      patientId: "2",
      patientName: "Marie Dubois",
      patientEmail: "marie.dubois@example.com",
      lastMessage: "J'ai une question concernant...",
      lastMessageTime: "Il y a 5h",
      unreadCount: 2,
    },
    {
      patientId: "3",
      patientName: "Emma Laurent",
      patientEmail: "emma.laurent@example.com",
      lastMessage: "Mon enfant va mieux",
      lastMessageTime: "Hier",
      unreadCount: 0,
    },
  ]

  const messages: Message[] = [
    {
      id: "1",
      patientName: "Sarah Martin",
      patientEmail: "sarah.martin@example.com",
      content: "Bonjour docteur, j'ai besoin de vos conseils concernant la nutrition de mon enfant.",
      timestamp: "10:30",
      isFromPatient: true,
    },
    {
      id: "2",
      patientName: "Docteur",
      patientEmail: "",
      content: "Bonjour Sarah, je serais ravi de vous aider. Quel âge a votre enfant ?",
      timestamp: "10:35",
      isFromPatient: false,
    },
    {
      id: "3",
      patientName: "Sarah Martin",
      patientEmail: "sarah.martin@example.com",
      content: "Il a 3 ans. Il refuse de manger des légumes.",
      timestamp: "10:37",
      isFromPatient: true,
    },
    {
      id: "4",
      patientName: "Docteur",
      patientEmail: "",
      content:
        "C'est un problème courant à cet âge. Je vous recommande de présenter les légumes de différentes façons et de les intégrer dans ses plats préférés.",
      timestamp: "10:40",
      isFromPatient: false,
    },
  ]

  const filteredConversations = conversations.filter((conv) =>
    conv.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedConversation) {
      // TODO: Send message to API
      console.log("Sending message:", messageInput)
      setMessageInput("")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground mt-1">Communiquez avec vos patientes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Conversations</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une patiente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border max-h-[calc(100vh-400px)] overflow-y-auto">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.patientId}
                  onClick={() => setSelectedConversation(conv.patientId)}
                  className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                    selectedConversation === conv.patientId ? "bg-muted" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-semibold text-foreground">{conv.patientName}</p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mb-1">{conv.lastMessage}</p>
                  <p className="text-xs text-muted-foreground">{conv.lastMessageTime}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {conversations.find((c) => c.patientId === selectedConversation)?.patientName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {conversations.find((c) => c.patientId === selectedConversation)?.patientEmail}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[calc(100vh-500px)]">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isFromPatient ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.isFromPatient
                          ? "bg-muted text-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {message.isFromPatient && (
                        <p className="text-xs font-semibold mb-1">{message.patientName}</p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.isFromPatient ? "text-muted-foreground" : "text-primary-foreground/70"
                        }`}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
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
                  <Button onClick={handleSendMessage} className="btn-primary">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">Sélectionnez une conversation</p>
                <p className="text-sm text-muted-foreground">
                  Choisissez une patiente pour commencer à discuter
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
