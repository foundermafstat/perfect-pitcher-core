"use client"

import React, { useRef, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, X, FileText, Image, File, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAgentChat, ChatMessage } from "@/hooks/use-agent-chat"

interface AttachedFile {
  id: string
  file: File
  type: 'image' | 'text' | 'other'
  preview?: string
}

interface TextCommandInputProps {
  onResponse?: (response: string) => void
  onUserMessage?: (text: string, files?: File[]) => void
  conversationHistory?: ChatMessage[]
  toolsFunctions?: Record<string, Function>
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function TextCommandInput({ 
  onResponse,
  onUserMessage,
  conversationHistory = [],
  toolsFunctions,
  disabled = false, 
  placeholder = "Введите команду для агента...",
  className 
}: TextCommandInputProps) {
  const [text, setText] = useState("")
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { sendCommand, isLoading, error, clearError } = useAgentChat({ toolsFunctions })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() && attachedFiles.length === 0) return
    if (isLoading) return

    clearError()
    
    const files = attachedFiles.map(af => af.file)
    
    // Уведомляем о пользовательском сообщении
    onUserMessage?.(text.trim(), files)
    
    const result = await sendCommand(text.trim(), files, conversationHistory)
    
    if (result.success && result.response) {
      onResponse?.(result.response)
      setText("")
      setAttachedFiles([])
      setIsExpanded(false)
    }
    // Ошибки показываются через состояние error из хука
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    files.forEach(file => {
      const id = Math.random().toString(36).substring(2)
      let type: AttachedFile['type'] = 'other'
      let preview: string | undefined

      if (file.type.startsWith('image/')) {
        type = 'image'
        preview = URL.createObjectURL(file)
      } else if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        type = 'text'
      }

      const attachedFile: AttachedFile = {
        id,
        file,
        type,
        preview
      }

      setAttachedFiles(prev => [...prev, attachedFile])
    })

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (id: string) => {
    setAttachedFiles(prev => {
      const updated = prev.filter(f => f.id !== id)
      const fileToRemove = prev.find(f => f.id === id)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return updated
    })
  }

  const getFileIcon = (type: AttachedFile['type']) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />
      case 'text': return <FileText className="h-4 w-4" />
      default: return <File className="h-4 w-4" />
    }
  }

  const shouldShowExpanded = isExpanded || text.length > 50 || attachedFiles.length > 0

  return (
    <motion.div 
      className={cn(
        "bg-card text-card-foreground rounded-xl border shadow-sm p-3",
        className
      )}
      layout
    >
      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-3 p-2 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="h-6 w-6 p-0 hover:bg-destructive/20"
          >
            <X className="h-3 w-3" />
          </Button>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Attached Files Display */}
        {attachedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {attachedFiles.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-muted rounded-lg p-2 flex items-center gap-2 text-sm"
              >
                {getFileIcon(file.type)}
                <span className="truncate max-w-[120px]" title={file.file.name}>
                  {file.file.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeFile(file.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Input Area */}
        <div className="flex gap-2">
          {shouldShowExpanded ? (
            <Textarea
              placeholder={placeholder}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={disabled}
              className="flex-1 min-h-[80px] resize-none"
              onFocus={() => setIsExpanded(true)}
            />
          ) : (
            <Input
              type="text"
              placeholder={placeholder}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={disabled}
              className="flex-1"
              onFocus={() => setIsExpanded(true)}
            />
          )}
          
          <div className="flex gap-1">
            {/* File Attach Button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={disabled || isLoading}
              onClick={() => fileInputRef.current?.click()}
              title="Прикрепить файл"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            {/* Send Button */}
            <Button 
              type="submit" 
              disabled={disabled || isLoading || (!text.trim() && attachedFiles.length === 0)}
              size="icon"
              title={isLoading ? "Отправка..." : "Отправить"}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Collapse Button for expanded mode */}
        {shouldShowExpanded && (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="text-muted-foreground"
            >
              Свернуть
            </Button>
          </div>
        )}
      </form>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,text/*,.txt,.md,.json,.csv,.xml,.pdf,.doc,.docx"
      />
    </motion.div>
  )
}
