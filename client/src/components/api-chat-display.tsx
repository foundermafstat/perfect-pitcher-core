"use client"

import React from "react"
import { motion } from "framer-motion"
import { ChatMessage } from "@/hooks/use-agent-chat"
import { cn } from "@/lib/utils"
import { Bot, User, File } from "lucide-react"

interface ApiChatDisplayProps {
  messages: ChatMessage[]
  className?: string
}

export function ApiChatDisplay({ messages, className }: ApiChatDisplayProps) {
  if (messages.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-32 text-muted-foreground", className)}>
        <p>Отправьте команду агенту для начала диалога</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3 p-3 max-h-96 overflow-y-auto", className)}>
      {messages.map((message, index) => (
        <motion.div
          key={`${message.id}-${message.timestamp}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(index * 0.05, 0.5) }}
          className={cn(
            "flex gap-3 p-3 rounded-lg",
            message.role === "user" 
              ? "bg-primary/10 ml-8" 
              : "bg-muted mr-8"
          )}
        >
          <div className="flex-shrink-0">
            {message.role === "user" ? (
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
            ) : (
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-secondary-foreground" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">
                {message.role === "user" ? "Вы" : "Агент"}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
            
            <div className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </div>
            
            {message.files && message.files.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {message.files.map((file, fileIndex) => (
                  <div 
                    key={fileIndex}
                    className="flex items-center gap-1 text-xs bg-background/50 px-2 py-1 rounded border"
                  >
                    <File className="w-3 h-3" />
                    <span>{file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
