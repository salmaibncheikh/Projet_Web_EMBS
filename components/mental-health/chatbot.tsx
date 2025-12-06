"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function MentalHealthChatbot() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Bonjour! Je suis votre assistant santé mentale. Comment puis-je vous aider aujourd'hui? Vous pouvez me parler de votre bien-être ou de celui de votre enfant.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Sentiment analysis helper (basic keyword-based)
  const analyzeSentiment = (text: string): "positive" | "neutral" | "negative" => {
    const lowerText = text.toLowerCase()
    
    const positiveWords = [
      "bien", "heureux", "heureuse", "content", "contente", "joyeux", "joyeuse", 
      "merci", "super", "excellent", "génial", "parfait", "mieux", "bon", "bonne",
      "calme", "serein", "sereine", "paisible", "relaxé", "relaxée", "confiant",
      "confiante", "optimiste", "positif", "positive", "agréable", "satisfait"
    ]
    
    const negativeWords = [
      "triste", "déprimé", "déprimée", "anxieux", "anxieuse", "stressé", "stressée",
      "inquiet", "inquiète", "peur", "mal", "mauvais", "mauvaise", "fatigué", "fatiguée",
      "difficile", "problème", "préoccupé", "préoccupée", "nerveux", "nerveuse",
      "colère", "frustré", "frustrée", "déçu", "déçue", "seul", "seule", "isolé"
    ]
    
    let positiveCount = 0
    let negativeCount = 0
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveCount++
    })
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeCount++
    })
    
    if (positiveCount > negativeCount) return "positive"
    if (negativeCount > positiveCount) return "negative"
    return "neutral"
  }

  // Extract topics and keywords from conversation
  const extractTopicsAndKeywords = (userMessages: Message[], assistantMessages: Message[]) => {
    const topicKeywords: Record<string, string[]> = {
      "well-being": ["bien-être", "santé", "forme", "énergie"],
      "anxiety": ["anxiété", "anxieux", "anxieuse", "stress", "stressé", "inquiet", "inquiète", "peur"],
      "sleep": ["sommeil", "dormir", "insomnie", "fatigue", "fatigué", "repos"],
      "mood": ["humeur", "triste", "tristesse", "dépression", "déprimé", "moral"],
      "pregnancy": ["grossesse", "enceinte", "bébé", "accouchement", "trimestre"],
      "relationships": ["famille", "conjoint", "relation", "soutien", "social"],
      "emotions": ["émotion", "sentiment", "ressenti", "peur", "joie", "colère"]
    }
    
    const allText = [...userMessages, ...assistantMessages]
      .map(m => m.content.toLowerCase())
      .join(" ")
    
    const detectedTopics: string[] = []
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => allText.includes(keyword))) {
        detectedTopics.push(topic)
      }
    })
    
    // Extract significant keywords (words that appear more than once)
    const words = allText
      .split(/\s+/)
      .filter(word => word.length > 4) // Words longer than 4 chars
      .filter(word => !["votre", "comment", "pouvez", "parler", "aujourd"].includes(word))
    
    const wordFreq: Record<string, number> = {}
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1
    })
    
    const keywords = Object.entries(wordFreq)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word)
    
    return {
      topic: detectedTopics[0] || "general",
      keywords: keywords.length > 0 ? keywords : ["conversation", "santé"]
    }
  }

  // Save chatbot interaction to database
  const saveChatbotInteraction = async (userMessages: Message[], assistantMessages: Message[]) => {
    console.log("=== SAVE CHATBOT INTERACTION CALLED ===")
    console.log("User ID:", user?._id)
    console.log("User messages count:", userMessages.length)
    
    if (!user?._id) {
      console.log("❌ No user ID available, skipping save")
      return
    }

    try {
      // Analyze sentiment from user messages
      const userTexts = userMessages.map(m => m.content).join(" ")
      const sentiment = analyzeSentiment(userTexts)
      
      // Extract topics and keywords
      const { topic, keywords } = extractTopicsAndKeywords(userMessages, assistantMessages)
      
      const payload = {
        userId: user._id,
        type: "chatbot",
        chatbotData: {
          topic,
          sentiment,
          keywords,
          messageCount: userMessages.length
        }
      }
      
      console.log("📤 Sending to API:", JSON.stringify(payload, null, 2))
      
      const response = await fetch("/api/mental-health/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      console.log("Response status:", response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ API Error:", errorData)
        throw new Error(`Failed to save: ${JSON.stringify(errorData)}`)
      }

      const result = await response.json()
      console.log("✅ Chatbot interaction saved successfully:", result)
    } catch (error) {
      console.error("❌ Error saving chatbot interaction:", error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
    const response = await fetch("http://127.0.0.1:5000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: input,
      conversationHistory: messages,
    }),
    })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Erreur serveur: ${response.status} - ${text}`)
  }
      const data = await response.json()
      console.log("Response data:", data)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Save interaction after every 3 user messages
      const allMessages = [...messages, userMessage, assistantMessage]
      const userMessagesCount = allMessages.filter(m => m.role === "user").length
      
      console.log("💬 Total user messages so far:", userMessagesCount)
      console.log("📊 Should save? (every 3 messages):", userMessagesCount % 3 === 0)
      
      if (userMessagesCount > 0 && userMessagesCount % 3 === 0) {
        console.log("🎯 Triggering save at message count:", userMessagesCount)
        const userMsgs = allMessages.filter(m => m.role === "user")
        const assistantMsgs = allMessages.filter(m => m.role === "assistant")
        await saveChatbotInteraction(userMsgs, assistantMsgs)
      }
    } catch (error) {
      console.error("Error:", error)
      // Fallback response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Je comprends votre préoccupation. Pouvez-vous me donner plus de détails sur la situation?",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px] bg-muted/30 rounded-lg border border-border">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-card border border-border rounded-bl-none"
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border px-4 py-2 rounded-lg rounded-bl-none">
              <Loader className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder="Écrivez votre message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !input.trim()} className="btn-primary">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
