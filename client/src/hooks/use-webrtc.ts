"use client"

import { useEffect, useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"

import type { Conversation } from "@/lib/conversations"
import { useTranslations } from "@/providers/translations-context"

export interface Tool {
  name: string
  description: string
  // biome-ignore lint/suspicious/noExplicitAny: Разрешаем использование any для совместимости с API
  parameters?: Record<string, any>
}

/**
 * The return type for the hook, matching Approach A
 * (RefObject<HTMLDivElement | null> for the audioIndicatorRef).
 */
interface UseWebRTCAudioSessionReturn {
  status: string
  isSessionActive: boolean
  audioIndicatorRef: React.RefObject<HTMLDivElement | null>
  startSession: () => Promise<void>
  stopSession: () => void
  handleStartStopClick: () => void
  registerFunction: (name: string, fn: Function) => void
  msgs: any[]
  currentVolume: number
  conversation: Conversation[]
  sendTextMessage: (text: string) => void
}

/**
 * Hook to manage a real-time session with OpenAI's Realtime endpoints.
 */
export default function useWebRTCAudioSession(
  voice: string,
  tools?: Tool[],
  storyContext?: { title: string; description?: string; slides?: Array<{ title: string; content: string }> } | null
): UseWebRTCAudioSessionReturn {
  const { t, locale } = useTranslations()
  // Connection/session states
  const [status, setStatus] = useState("")
  const [isSessionActive, setIsSessionActive] = useState(false)

  // Audio references for local mic
  // Approach A: explicitly typed as HTMLDivElement | null
  const audioIndicatorRef = useRef<HTMLDivElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)

  // WebRTC references
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)

  // Keep track of all raw events/messages
  const [msgs, setMsgs] = useState<any[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const sessionIdRef = useRef<string | null>(null)

  // Main conversation state
  const [conversation, setConversation] = useState<Conversation[]>([])

  // For function calls (AI "tools")
  const functionRegistry = useRef<Record<string, Function>>({})

  // Volume analysis (assistant inbound audio)
  const [currentVolume, setCurrentVolume] = useState(0)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const volumeIntervalRef = useRef<number | null>(null)

  /**
   * We track only the ephemeral user message **ID** here.
   * While user is speaking, we update that conversation item by ID.
   */
  const ephemeralUserMessageIdRef = useRef<string | null>(null)

  // For accumulating agent responses
  const currentAgentResponseRef = useRef<string>("")
  const currentUserTranscriptRef = useRef<string>("")

  /**
   * Helper function to log events to database
   */
  function logEventToDB(payload: { sessionId: string; type: string; role: string; text: string; raw: any }) {
    try {
      fetch('/api/agent-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(console.error)
    } catch (e) {
      console.error('Error logging event:', e)
    }
  }

  /**
   * Register a function (tool) so the AI can call it.
   */
  function registerFunction(name: string, fn: Function) {
    functionRegistry.current[name] = fn
  }

  /**
   * Configure the data channel on open, sending a session update to the server.
   */
  function configureDataChannel(dataChannel: RTCDataChannel) {
    // Send session update
    const sessionUpdate = {
      type: "session.update",
      session: {
        modalities: ["text", "audio"],
        tools: tools || [],
        input_audio_transcription: {
          model: "whisper-1",
        },
      },
    }
    dataChannel.send(JSON.stringify(sessionUpdate))

    console.log("Session update sent:", sessionUpdate)
    console.log("Setting locale: " + t("language") + " : " + locale)

    // Send language preference message
    const languageMessage = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: t("languagePrompt"),
          },
        ],
      },
    }
    dataChannel.send(JSON.stringify(languageMessage))

    // Send story context if available
    if (storyContext) {
      const contextText = `Контекст презентации:
Название: ${storyContext.title}
${storyContext.description ? `Описание: ${storyContext.description}` : ''}
${storyContext.slides ? `Слайды (${storyContext.slides.length}):
${storyContext.slides.map((slide, index) => 
  `${index + 1}. ${slide.title}${slide.content ? `\n   ${slide.content.slice(0, 200)}${slide.content.length > 200 ? '...' : ''}` : ''}`
).join('\n')}` : ''}

Используй этот контекст для ответов на вопросы о презентации.`

      const contextMessage = {
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text: contextText,
            },
          ],
        },
      }
      dataChannel.send(JSON.stringify(contextMessage))
      console.log("Story context sent:", storyContext.title)
    }
  }

  /**
   * Return an ephemeral user ID, creating a new ephemeral message in conversation if needed.
   */
  function getOrCreateEphemeralUserId(): string {
    let ephemeralId = ephemeralUserMessageIdRef.current
    if (!ephemeralId) {
      // Use uuidv4 for a robust unique ID
      ephemeralId = uuidv4()
      ephemeralUserMessageIdRef.current = ephemeralId

      const newMessage: Conversation = {
        id: ephemeralId,
        role: "user",
        text: "",
        timestamp: new Date().toISOString(),
        isFinal: false,
        status: "speaking",
      }

      // Append the ephemeral item to conversation
      setConversation((prev) => [...prev, newMessage])
    }
    return ephemeralId
  }

  /**
   * Update the ephemeral user message (by ephemeralUserMessageIdRef) with partial changes.
   */
  function updateEphemeralUserMessage(partial: Partial<Conversation>) {
    const ephemeralId = ephemeralUserMessageIdRef.current
    if (!ephemeralId) return // no ephemeral user message to update

    setConversation((prev) =>
      prev.map((msg) => {
        if (msg.id === ephemeralId) {
          return { ...msg, ...partial }
        }
        return msg
      })
    )
  }

  /**
   * Clear ephemeral user message ID so the next user speech starts fresh.
   */
  function clearEphemeralUserMessage() {
    ephemeralUserMessageIdRef.current = null
  }

  /**
   * Main data channel message handler: interprets events from the server.
   */
  async function handleDataChannelMessage(event: MessageEvent) {
    try {
      const msg = JSON.parse(event.data)
      // console.log("Incoming dataChannel message:", msg);

      switch (msg.type) {
        /**
         * User speech started
         */
        case "input_audio_buffer.speech_started": {
          getOrCreateEphemeralUserId()
          updateEphemeralUserMessage({ status: "speaking" })
          break
        }

        /**
         * User speech stopped
         */
        case "input_audio_buffer.speech_stopped": {
          // optional: you could set "stopped" or just keep "speaking"
          updateEphemeralUserMessage({ status: "speaking" })
          break
        }

        /**
         * Audio buffer committed => "Processing speech..."
         */
        case "input_audio_buffer.committed": {
          updateEphemeralUserMessage({
            text: "Processing speech...",
            status: "processing",
          })
          break
        }

        /**
         * Partial user transcription
         */
        case "conversation.item.input_audio_transcription": {
          const partialText =
            msg.transcript ?? msg.text ?? "User is speaking..."
          updateEphemeralUserMessage({
            text: partialText,
            status: "speaking",
            isFinal: false,
          })
          break
        }

        /**
         * Final user transcription
         */
        case "conversation.item.input_audio_transcription.completed": {
          // console.log("Final user transcription:", msg.transcript);
          updateEphemeralUserMessage({
            text: msg.transcript || "",
            isFinal: true,
            status: "final",
          })
          clearEphemeralUserMessage()
          break
        }

        /**
         * Streaming AI transcripts (assistant partial)
         */
        case "response.audio_transcript.delta": {
          const newMessage: Conversation = {
            id: uuidv4(), // generate a fresh ID for each assistant partial
            role: "assistant",
            text: msg.delta,
            timestamp: new Date().toISOString(),
            isFinal: false,
          }

          setConversation((prev) => {
            const lastMsg = prev[prev.length - 1]
            if (lastMsg && lastMsg.role === "assistant" && !lastMsg.isFinal) {
              // Append to existing assistant partial
              const updated = [...prev]
              updated[updated.length - 1] = {
                ...lastMsg,
                text: lastMsg.text + msg.delta,
              }
              return updated
            } else {
              // Start a new assistant partial
              return [...prev, newMessage]
            }
          })
          break
        }

        /**
         * Mark the last assistant message as final
         */
        case "response.audio_transcript.done": {
          setConversation((prev) => {
            if (prev.length === 0) return prev
            const updated = [...prev]
            updated[updated.length - 1].isFinal = true
            return updated
          })
          break
        }

        /**
         * AI calls a function (tool)
         */
        case "response.function_call_arguments.done": {
          const fn = functionRegistry.current[msg.name]
          if (fn) {
            const args = JSON.parse(msg.arguments)
            const result = await fn(args)

            // Log function execution
            if (sessionIdRef.current) {
              logEventToDB({
                sessionId: sessionIdRef.current,
                type: 'function_execution',
                role: 'assistant',
                text: `${msg.name}(${msg.arguments}) → ${JSON.stringify(result).slice(0, 200)}`,
                raw: { function: msg.name, arguments: args, result },
              })
            }

            // Respond with function output
            const response = {
              type: "conversation.item.create",
              item: {
                type: "function_call_output",
                call_id: msg.call_id,
                output: JSON.stringify(result),
              },
            }
            dataChannelRef.current?.send(JSON.stringify(response))

            const responseCreate = {
              type: "response.create",
            }
            dataChannelRef.current?.send(JSON.stringify(responseCreate))
          }
          break
        }

        default: {
          // console.warn("Unhandled message type:", msg.type);
          break
        }
      }

      // Always log the raw message
      setMsgs((prevMsgs) => [...prevMsgs, msg])

      // Handle logging with accumulation for complete messages
      if (sessionIdRef.current) {
        switch (msg.type) {
          // User speech transcription - accumulate until completed
          case 'conversation.item.input_audio_transcription.completed':
            const userText = msg.transcript || ''
            if (userText.trim()) {
              logEventToDB({
                sessionId: sessionIdRef.current,
                type: 'user_voice_message',
                role: 'user',
                text: userText.trim(),
                raw: msg,
              })
            }
            break

          // Agent response - accumulate deltas
          case 'response.audio_transcript.delta':
            currentAgentResponseRef.current += msg.delta || ''
            break

          // Agent response complete - log accumulated response
          case 'response.audio_transcript.done':
            const fullResponse = currentAgentResponseRef.current || msg.transcript || ''
            if (fullResponse.trim()) {
              logEventToDB({
                sessionId: sessionIdRef.current,
                type: 'agent_response',
                role: 'assistant',
                text: fullResponse.trim(),
                raw: { type: 'agent_response', fullText: fullResponse },
              })
            }
            currentAgentResponseRef.current = '' // Reset
            break

          // Function calls - already logged in the handler above
          case 'response.function_call_arguments.done':
            // Skip - already logged in the main handler
            break

          // Response starts - reset accumulator
          case 'response.created':
            currentAgentResponseRef.current = ''
            break

          // Skip logging deltas and intermediate events
          default:
            // Don't log intermediate events
            break
        }
      }

      return msg
    } catch (error) {
      console.error("Error handling data channel message:", error)
    }
  }

  /**
   * Fetch ephemeral token from your Next.js endpoint
   */
  async function getEphemeralToken() {
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      if (!response.ok) {
        throw new Error(`Failed to get ephemeral token: ${response.status}`)
      }
      const data = await response.json()
      return data.client_secret.value
    } catch (err) {
      console.error("getEphemeralToken error:", err)
      throw err
    }
  }

  /**
   * Sets up a local audio visualization for mic input (toggle wave CSS).
   */
  function setupAudioVisualization(stream: MediaStream) {
    const audioContext = new AudioContext()
    const source = audioContext.createMediaStreamSource(stream)
    const analyzer = audioContext.createAnalyser()
    analyzer.fftSize = 256
    source.connect(analyzer)

    const bufferLength = analyzer.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const updateIndicator = () => {
      if (!audioContext) return
      analyzer.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / bufferLength

      // Toggle an "active" class if volume is above a threshold
      if (audioIndicatorRef.current) {
        audioIndicatorRef.current.classList.toggle("active", average > 30)
      }
      requestAnimationFrame(updateIndicator)
    }
    updateIndicator()

    audioContextRef.current = audioContext
  }

  /**
   * Calculate RMS volume from inbound assistant audio
   */
  function getVolume(): number {
    if (!analyserRef.current) return 0
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteTimeDomainData(dataArray)

    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      const float = (dataArray[i] - 128) / 128
      sum += float * float
    }
    return Math.sqrt(sum / dataArray.length)
  }

  /**
   * Start a new session:
   */
  async function startSession() {
    try {
      setStatus("Requesting microphone access...")
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioStreamRef.current = stream
      setupAudioVisualization(stream)

      setStatus("Fetching ephemeral token...")
      const ephemeralToken = await getEphemeralToken()

      // create DB session
      try {
        const res = await fetch('/api/agent-sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voice, locale })
        })
        const data = await res.json()
        if (res.ok && data.session?.id) {
          setSessionId(data.session.id)
          sessionIdRef.current = data.session.id
        }
      } catch (e) {
        console.error('Session creation error:', e)
      }

      setStatus("Establishing connection...")

      // Перед установкой соединения, подгружаем задачи из БД
      try {
        const tasksRes = await fetch("/api/tasks", { method: "GET" })
        if (tasksRes.ok) {
          const { tasks } = await tasksRes.json()
          if (Array.isArray(tasks) && tasks.length > 0) {
            // Отправляем список задач как системное сообщение в диалог, чтобы агент знал контекст
            const preloadMsg = {
              type: "conversation.item.create",
              item: {
                type: "message",
                role: "user",
                content: [
                  {
                    type: "input_text",
                    text: `Preload tasks: ${JSON.stringify(tasks)}`,
                  },
                ],
              },
            }
            // Пока dataChannel не открыт, временно сохраним для отправки после открытия
            // Добавим в очередь сообщений
            setMsgs((prev) => [...prev, preloadMsg])
          }
        }
      } catch (e) {
        console.warn("Tasks preload failed:", e)
      }
      const pc = new RTCPeerConnection()
      peerConnectionRef.current = pc

      // Hidden <audio> element for inbound assistant TTS
      const audioEl = document.createElement("audio")
      audioEl.autoplay = true

      // Inbound track => assistant's TTS
      pc.ontrack = (event) => {
        audioEl.srcObject = event.streams[0]

        // Optional: measure inbound volume
        const audioCtx = new (window.AudioContext || window.AudioContext)()
        const src = audioCtx.createMediaStreamSource(event.streams[0])
        const inboundAnalyzer = audioCtx.createAnalyser()
        inboundAnalyzer.fftSize = 256
        src.connect(inboundAnalyzer)
        analyserRef.current = inboundAnalyzer

        // Start volume monitoring
        volumeIntervalRef.current = window.setInterval(() => {
          setCurrentVolume(getVolume())
        }, 100)
      }

      // Data channel for transcripts
      const dataChannel = pc.createDataChannel("response")
      dataChannelRef.current = dataChannel

      dataChannel.onopen = () => {
        // console.log("Data channel open");
        configureDataChannel(dataChannel)
        // Если в msgs есть предварительные сообщения (например, задачи), отправим их
        setMsgs((prev) => {
          const queue = prev.filter((m) => m?.item?.content)
          for (const m of queue) {
            try {
              dataChannel.send(JSON.stringify(m))
              dataChannel.send(JSON.stringify({ type: "response.create" }))
            } catch {}
          }
          return prev
        })
      }
      dataChannel.onmessage = handleDataChannelMessage

      // Add local (mic) track
      pc.addTrack(stream.getTracks()[0])

      // Create offer & set local description
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // Send SDP offer to OpenAI Realtime
      const baseUrl = "https://api.openai.com/v1/realtime"
      const model = "gpt-4o-realtime-preview-2024-12-17"
      const response = await fetch(`${baseUrl}?model=${model}&voice=${voice}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralToken}`,
          "Content-Type": "application/sdp",
        },
      })

      // Set remote description
      const answerSdp = await response.text()
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp })

      setIsSessionActive(true)
      setStatus("Session established successfully!")
    } catch (err) {
      console.error("startSession error:", err)
      setStatus(`Error: ${err}`)
      stopSession()
    }
  }

  /**
   * Stop the session & cleanup
   */
  function stopSession() {
    // Update session end time in DB
    if (sessionIdRef.current) {
      fetch('/api/agent-sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sessionIdRef.current, status: 'ENDED', end: true })
      }).catch(console.error)
    }

    if (dataChannelRef.current) {
      dataChannelRef.current.close()
      dataChannelRef.current = null
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop())
      audioStreamRef.current = null
    }
    if (audioIndicatorRef.current) {
      audioIndicatorRef.current.classList.remove("active")
    }
    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current)
      volumeIntervalRef.current = null
    }
    analyserRef.current = null

    ephemeralUserMessageIdRef.current = null

    // Reset accumulators
    currentAgentResponseRef.current = ""
    currentUserTranscriptRef.current = ""

    setCurrentVolume(0)
    setIsSessionActive(false)
    setStatus("Session stopped")
    setMsgs([])
    setConversation([])
    setSessionId(null)
    sessionIdRef.current = null
  }

  /**
   * Toggle start/stop from a single button
   */
  function handleStartStopClick() {
    if (isSessionActive) {
      stopSession()
    } else {
      startSession()
    }
  }

  /**
   * Send a text message through the data channel
   */
  function sendTextMessage(text: string) {
    if (
      !dataChannelRef.current ||
      dataChannelRef.current.readyState !== "open"
    ) {
      console.error("Data channel not ready")
      return
    }

    const messageId = uuidv4()

    // Add message to conversation immediately
    const newMessage: Conversation = {
      id: messageId,
      role: "user",
      text,
      timestamp: new Date().toISOString(),
      isFinal: true,
      status: "final",
    }

    setConversation((prev) => [...prev, newMessage])

    // Log user text message to DB
    if (sessionIdRef.current) {
      logEventToDB({
        sessionId: sessionIdRef.current,
        type: 'user_text_message',
        role: 'user',
        text: text.trim(),
        raw: { type: 'user_text_message', text },
      })
    }

    // Send message through data channel
    const message = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: text,
          },
        ],
      },
    }

    const response = {
      type: "response.create",
    }

    dataChannelRef.current.send(JSON.stringify(message))
    dataChannelRef.current.send(JSON.stringify(response))
  }



  // Cleanup on unmount
  useEffect(() => {
    return () => stopSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    status,
    isSessionActive,
    audioIndicatorRef,
    startSession,
    stopSession,
    handleStartStopClick,
    registerFunction,
    msgs,
    currentVolume,
    conversation,
    sendTextMessage,
  }
}
