import { NextResponse } from "next/server"

export async function POST() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY is not set, returning mock session data")
      return NextResponse.json({
        client_secret: {
          value: "mock_ephemeral_token_" + Date.now(),
        },
        expires_at: Date.now() + 3600000,
      })
    }

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "alloy",
        modalities: ["audio", "text"],
        instructions: `You are a helpful AI assistant in a voice broadcast application. You can:
1. Have natural conversations with users
2. Navigate to different pages using the navigate_to_page function
3. Provide helpful information and assistance
4. Respond with both text and voice

Available pages for navigation: dashboard, analytics, settings, profile, help.
When users ask to go somewhere or want to see something specific, use the navigation function.
Always be conversational and helpful.

Additionally:
- The client may send one or more messages labeled "PROJECT_CONTEXT" at the start of the session. Treat that information as authoritative background knowledge for project-related questions throughout the session.
- Prefer responding in the user's current locale if the client provides a language preference message.
- Do not reveal raw JSON or internal fields from the context. Summarize and answer naturally.`,
        tools: [
          {
            type: "function",
            name: "navigate_to_page",
            description: "Navigate to a specific page in the application",
            parameters: {
              type: "object",
              properties: {
                page: {
                  type: "string",
                  enum: ["dashboard", "analytics", "settings", "profile", "help"],
                  description: "The page to navigate to",
                },
                reason: {
                  type: "string",
                  description: "Brief explanation of why navigating to this page",
                },
              },
              required: ["page"],
            },
          },
        ],
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500,
        },
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        input_audio_transcription: {
          model: "whisper-1",
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`OpenAI API request failed with status ${response.status}:`, errorText)
      return NextResponse.json(
        {
          error: "Failed to create OpenAI session",
          status: response.status,
          details: errorText,
        },
        { status: 500 },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in session API route:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
