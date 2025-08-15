"use client"

import React, { useEffect, useMemo, useState, useCallback } from "react"
import { motion } from "framer-motion"

import useWebRTCAudioSession from "@/hooks/use-webrtc"
import { tools } from "@/lib/tools"
import { BroadcastButton } from "@/components/broadcast-button"
import { MessageControls } from "@/components/message-controls"
import { StatusDisplay } from "@/components/status"
import { TokenUsageDisplay } from "@/components/token-usage"
import { VoiceSelector } from "@/components/voice-select"
import Transcriber from "@/components/ui/transcriber"
import { Button } from "@/components/ui/button"
import { TextCommandInput } from "@/components/text-command-input"
import { ApiChatDisplay } from "@/components/api-chat-display"
import { useToolsFunctions } from "@/hooks/use-tools"
import { useTranslations } from "@/providers/translations-context"
import { ChatMessage } from "@/hooks/use-agent-chat"
import { StoryContextSelector } from "@/components/story-context-selector"
import { type Story } from "@/hooks/use-stories"

export function AgentInterface(): React.ReactElement {
  const [voice, setVoice] = useState("ash")
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)

  const webrtcSession = useWebRTCAudioSession(voice, tools, selectedStory)
  const {
    status,
    isSessionActive,
    handleStartStopClick,
    msgs,
    conversation,
    registerFunction,
  } = webrtcSession

  const toolsFunctions = useToolsFunctions()
  const { t } = useTranslations()

  type SuggestedAction = { id: string; label: string; run: () => Promise<any> | any }
  const [suggested, setSuggested] = useState<SuggestedAction[]>([])

  // Преобразование истории разговора для нового API
  const chatHistory: ChatMessage[] = useMemo(() => conversation.map(msg => ({
    id: msg.id,
    role: msg.role as "user" | "assistant",
    content: msg.text,
    timestamp: msg.timestamp
  })), [conversation])

  // Локальная история сообщений для API чата (отдельно от WebRTC)
  const [apiChatHistory, setApiChatHistory] = useState<ChatMessage[]>([])

  // Обработчик ответов от агента через API
  const handleAgentResponse = useCallback((response: string) => {
    const messageId = Math.random().toString(36).substring(2)
    const newMessage: ChatMessage = {
      id: messageId,
      role: "assistant",
      content: response,
      timestamp: new Date().toISOString()
    }
    
    setApiChatHistory(prev => [...prev, newMessage])
  }, [])

  // Обработчик отправки команды через API
  const handleCommandSubmit = useCallback(async (text: string, files?: File[]) => {
    // Добавляем сообщение пользователя в историю API чата
    const userMessageId = Math.random().toString(36).substring(2)
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: "user",
      content: text + (files && files.length > 0 ? 
        `\n📎 Файлы: ${files.map(f => f.name).join(', ')}` : ''),
      timestamp: new Date().toISOString(),
      files: files?.map(f => ({ name: f.name, type: f.type, size: f.size }))
    }
    
    setApiChatHistory(prev => [...prev, userMessage])
  }, [])

  const handleStoryContextChange = useCallback((story: Story | null) => {
    setSelectedStory(story)
  }, [])

  // Объединенная история для передачи в TextCommandInput (только API чат, чтобы избежать дублирования)
  const combinedHistory = useMemo(() => apiChatHistory, [apiChatHistory])

  // Мемоизируем создание доступных действий в зависимости от страницы
  const availableActions = useMemo(() => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    
    // Базовые действия
    const baseActions = [
      { id: "time", label: t("tools.availableTools.getTime.name") || "Время", run: () => toolsFunctions.timeFunction() },
      { id: "theme", label: t("tools.availableTools.themeSwitcher.name") || "Сменить тему", run: () => toolsFunctions.backgroundFunction() },
    ];

    // Контекстные действия для презентации
    if (currentPath.includes('/presentation/')) {
      return [
        ...baseActions,
        { id: "next-slide", label: "Следующий слайд", run: () => toolsFunctions.nextSlide() },
        { id: "prev-slide", label: "Предыдущий слайд", run: () => toolsFunctions.previousSlide() },
        { id: "goto-slide", label: "Перейти к слайду 1", run: () => toolsFunctions.goToSlide({ slideNumber: 1 }) },
        { id: "party", label: t("tools.availableTools.partyMode.name") || "Вечеринка", run: () => toolsFunctions.partyFunction() },
      ];
    }

    // Контекстные действия для редактора
    if (currentPath.includes('/editor/')) {
      return [
        ...baseActions,
        { id: "party", label: t("tools.availableTools.partyMode.name") || "Вечеринка", run: () => toolsFunctions.partyFunction() },
        { id: "tasks-create", label: "Новая задача", run: () => toolsFunctions.createTask({ title: "Demo task" }) },
      ];
    }

    // Контекстные действия для страницы задач
    if (currentPath.includes('/projects') || currentPath.includes('/tasks')) {
      return [
        ...baseActions,
        { id: "tasks-list", label: "Список задач", run: () => toolsFunctions.listTasks() },
        { id: "tasks-create", label: "Новая задача", run: () => toolsFunctions.createTask({ title: "Demo task" }) },
      ];
    }

    // Стандартные действия для других страниц
    return [
      ...baseActions,
      { id: "party", label: t("tools.availableTools.partyMode.name") || "Вечеринка", run: () => toolsFunctions.partyFunction() },
      { id: "copy", label: t("tools.availableTools.copyFn.name") || "Скопировать", run: () => toolsFunctions.copyToClipboard({ text: "AIrine" }) },
      { id: "open", label: t("tools.availableTools.launchWebsite.name") || "Открыть сайт", run: () => toolsFunctions.launchWebsite({ url: "https://openai.com" }) },
      { id: "scrape", label: t("tools.availableTools.scrapeWebsite.name") || "Парсер", run: () => toolsFunctions.scrapeWebsite({ url: "https://example.com" }) },
      { id: "tasks-list", label: "Список задач", run: () => toolsFunctions.listTasks() },
    ];
  }, [t, toolsFunctions])

  // Функция для случайного выбора действий
  const pickRandomActions = useCallback((arr: SuggestedAction[], n: number) => {
    const copy = [...arr]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy.slice(0, n)
  }, [])

  // Регистрация функций для WebRTC сессии
  useEffect(() => {
    if (isSessionActive) {
      const functionNames: Record<string, string> = {
        timeFunction: "getCurrentTime",
        backgroundFunction: "changeBackgroundColor", 
        partyFunction: "partyMode",
        launchWebsite: "launchWebsite",
        copyToClipboard: "copyToClipboard",
        scrapeWebsite: "scrapeWebsite",
        createTask: "createTask",
        listTasks: "listTasks",
        updateTask: "updateTask",
        deleteTask: "deleteTask",
        getAgentProjectContext: "getAgentProjectContext",
        navigateToPage: "navigateToPage",
        nextSlide: "nextSlide",
        previousSlide: "previousSlide",
        goToSlide: "goToSlide"
      }

      // Регистрируем функции для WebRTC сессии
      for (const [functionName, openAIFunctionName] of Object.entries(functionNames)) {
        const fn = (toolsFunctions as any)[functionName]
        if (fn) {
          registerFunction(openAIFunctionName, fn)
        }
      }
    }
  }, [isSessionActive, toolsFunctions, registerFunction])

  useEffect(() => {
    // при каждом новом сообщении ассистента обновляем набор подсказок
    setSuggested(pickRandomActions(availableActions, 4))
  }, [conversation.length, pickRandomActions])

  return (
    <div className="flex h-full w-full flex-col gap-3 p-3 overflow-hidden">
      <div className="bg-card text-card-foreground rounded-xl border p-3 shadow-sm flex-shrink-0">
        <div className="flex flex-col items-start justify-start gap-3">
          <div className="flex gap-3 w-full">
            <div className="flex-1">
              <VoiceSelector value={voice} onValueChange={setVoice} />
            </div>
            <div className="flex-1">
              <StoryContextSelector 
                onContextChange={handleStoryContextChange}
                selectedStoryId={selectedStory?.id}
                disabled={isSessionActive}
              />
            </div>
          </div>
          <BroadcastButton
            isSessionActive={isSessionActive}
            onClick={handleStartStopClick}
          />
        </div>
        {status && (
          <motion.div
            className="mt-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.2 }}
          >
            <StatusDisplay status={status} />
          </motion.div>
        )}
        {msgs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="mt-2 overflow-hidden"
          >
            <TokenUsageDisplay messages={msgs} />
          </motion.div>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-hidden">
        {/* Контент разговора */}
        <div className="flex-1 min-h-0 space-y-3 overflow-auto">
          {/* WebRTC разговор */}
          {conversation.length > 0 && (
            <div className="bg-card text-card-foreground rounded-xl border shadow-sm flex flex-col min-h-0">
              <h3 className="text-sm font-medium p-3 pb-2 flex-shrink-0">Голосовой разговор</h3>
              <div className="flex-1 min-h-0 overflow-hidden px-3 pb-3">
                <Transcriber conversation={conversation} />
              </div>
            </div>
          )}
          
          {/* API чат */}
          {apiChatHistory.length > 0 && (
            <div className="bg-card text-card-foreground rounded-xl border shadow-sm flex flex-col min-h-0">
              <h3 className="text-sm font-medium p-3 pb-0 flex-shrink-0">Текстовые команды</h3>
              <div className="flex-1 min-h-0 overflow-hidden">
                <ApiChatDisplay messages={apiChatHistory} />
              </div>
            </div>
          )}
        </div>
        
        {/* Предложения */}
        {suggested.length > 0 && (
          <div className="flex-shrink-0 bg-card text-card-foreground rounded-xl border p-3 shadow-sm">
            <h4 className="text-xs font-medium mb-2 text-muted-foreground">Предложения</h4>
            <div className="flex flex-wrap gap-2">
              {suggested.map((a) => (
                <Button key={a.id} size="sm" variant="outline" onClick={() => a.run()}>
                  {a.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Text Command Input - всегда доступен */}
      <div className="flex-shrink-0">
        <TextCommandInput 
          onResponse={handleAgentResponse}
          onUserMessage={handleCommandSubmit}
          conversationHistory={combinedHistory}
          toolsFunctions={toolsFunctions}
          placeholder="Введите команду для агента..."
        />
      </div>
    </div>
  )
}

export default AgentInterface


