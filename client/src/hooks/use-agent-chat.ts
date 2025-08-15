"use client"

import { useState, useCallback } from "react"

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
  files?: { name: string; type: string; size: number }[]
}

interface FileData {
  name: string
  type: 'image' | 'text' | 'other'
  data?: string // base64 для изображений
  content?: string // текстовое содержимое для текстовых файлов
}

interface AgentChatOptions {
  toolsFunctions?: Record<string, Function>
}

export function useAgentChat(options: AgentChatOptions = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendCommand = useCallback(async (
    message: string, 
    files?: File[], 
    conversationHistory?: ChatMessage[]
  ): Promise<{ success: boolean; response?: string; error?: string }> => {
    setIsLoading(true)
    setError(null)

    try {
      // Обработка файлов
      const processedFiles: FileData[] = []
      
      if (files && files.length > 0) {
        for (const file of files) {
          const fileData: FileData = {
            name: file.name,
            type: 'other'
          }

          if (file.type.startsWith('image/')) {
            fileData.type = 'image'
            fileData.data = await fileToBase64(file)
          } else if (
            file.type.startsWith('text/') || 
            file.name.endsWith('.txt') || 
            file.name.endsWith('.md') ||
            file.name.endsWith('.json')
          ) {
            fileData.type = 'text'
            fileData.content = await file.text()
          }

          processedFiles.push(fileData)
        }
      }

      // Отправка запроса к API
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          files: processedFiles,
          conversationHistory: conversationHistory?.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Неизвестная ошибка')
      }

      // Если нужно выполнить функции на клиенте
      if (data.needs_client_execution && data.function_results && options.toolsFunctions) {
        for (const funcResult of data.function_results) {
          if (funcResult.status === 'pending_client_execution') {
            try {
              const functionName = funcResult.function_name
              const args = JSON.parse(funcResult.arguments)
              
              // Маппинг имен функций
              const functionMap: Record<string, string> = {
                'getCurrentTime': 'timeFunction',
                'changeBackgroundColor': 'backgroundFunction',
                'partyMode': 'partyFunction',
                'launchWebsite': 'launchWebsite',
                'copyToClipboard': 'copyToClipboard',
                'scrapeWebsite': 'scrapeWebsite',
                'createTask': 'createTask',
                'listTasks': 'listTasks',
                'updateTask': 'updateTask',
                'deleteTask': 'deleteTask',
                'getAgentProjectContext': 'getAgentProjectContext',
                'navigateToPage': 'navigateToPage',
                'nextSlide': 'nextSlide',
                'previousSlide': 'previousSlide',
                'goToSlide': 'goToSlide'
              }

              const clientFunctionName = functionMap[functionName]
              if (clientFunctionName && options.toolsFunctions[clientFunctionName]) {
                console.log(`Executing ${functionName} -> ${clientFunctionName}`, args)
                const result = await options.toolsFunctions[clientFunctionName](args)
                console.log(`Function ${functionName} result:`, result)
              } else {
                console.warn(`Function ${functionName} not found in toolsFunctions`)
              }
            } catch (funcError) {
              console.error('Error executing function:', funcError)
            }
          }
        }
      }

      return {
        success: true,
        response: data.message,
        tool_calls: data.tool_calls,
        function_results: data.function_results
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при отправке команды'
      setError(errorMessage)
      console.error('Agent chat error:', err)
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    sendCommand,
    isLoading,
    error,
    clearError
  }
}

/**
 * Convert file to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      resolve(base64) // Возвращаем полный data URL
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
