"use client"

import { motion } from "framer-motion"
import { User, Bot } from "lucide-react"

interface DebateBubbleProps {
  role: "user" | "ai"
  message: string
  timestamp: Date
}

export function DebateBubble({ role, message, timestamp }: DebateBubbleProps) {
  const isUser = role === "user"
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <motion.div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`flex gap-3 max-w-[80%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <motion.div
          className={`
            flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center
            ${isUser ? "bg-primary/10" : "bg-secondary"}
          `}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
        >
          {isUser ? <User className="h-4 w-4 text-primary" /> : <Bot className="h-4 w-4 text-primary" />}
        </motion.div>

        <div>
          <motion.div
            className={`
              p-3 rounded-lg glassmorphism
              ${isUser ? "rounded-br-none" : "rounded-bl-none"}
            `}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-sm">{message}</p>
          </motion.div>
          <div className={`text-xs text-muted-foreground mt-1 ${isUser ? "text-right" : "text-left"}`}>
            {formatTime(timestamp)}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

