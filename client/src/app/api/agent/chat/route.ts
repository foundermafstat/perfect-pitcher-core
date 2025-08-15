import { NextRequest, NextResponse } from "next/server"
import { tools } from "@/lib/tools"

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { message, files, conversationHistory = [] } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      )
    }

    // Подготавливаем сообщения для OpenAI
    const messages = [
      {
        role: "system",
        content: `Ты полезный ИИ-ассистент в приложении Perfect Pitcher для создания презентаций и управления проектами. Ты можешь:

1. **Навигация**: Переходить на разные страницы приложения (home, my-stories, stories, projects, products, editor, agent, dashboard, charts, forms, ui, account, login, help)
2. **Управление временем**: Показывать текущее время в любом часовом поясе
3. **Интерфейс**: Менять тему приложения, запускать анимации и эффекты
4. **Веб-взаимодействие**: Открывать сайты, парсить контент, копировать текст в буфер обмена
5. **Задачи**: Создавать, редактировать, удалять и просматривать задачи пользователя
6. **Анализ файлов**: Обрабатывать прикрепленные изображения и текстовые файлы
7. **Презентации**: Помогать с созданием и управлением слайдами

**Важно**: Когда пользователь просит перейти на страницу, обязательно используй функцию navigateToPage.
Отвечай на русском языке, коротко и по существу. Если пользователь прикрепил файлы, проанализируй их содержимое.`
      },
      // Добавляем историю разговора если есть
      ...conversationHistory.slice(-10), // Берем последние 10 сообщений
      {
        role: "user",
        content: message
      }
    ]

    // Если есть файлы, добавляем их в последнее сообщение
    if (files && files.length > 0) {
      const lastMessage = messages[messages.length - 1]
      const content = [{ type: "text", text: message }]
      
      for (const file of files) {
        if (file.type === 'image' && file.data) {
          content.push({
            type: "image_url",
            image_url: {
              url: file.data // base64 изображение
            }
          })
        } else if (file.type === 'text' && file.content) {
          content[0].text += `\n\n[Файл: ${file.name}]\n${file.content}`
        } else {
          content[0].text += `\n\n[Прикреплен файл: ${file.name}]`
        }
      }
      
      lastMessage.content = content
    }

    // Вызываем OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        max_tokens: 1000,
        temperature: 0.7,
        tools: tools.map(tool => ({
          type: "function",
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters
          }
        })),
        tool_choice: "auto"
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`OpenAI API request failed with status ${response.status}:`, errorText)
      return NextResponse.json(
        { 
          error: "Failed to get response from OpenAI",
          status: response.status 
        },
        { status: 500 }
      )
    }

    const data = await response.json()
    const assistantMessage = data.choices[0]?.message

    if (!assistantMessage) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      )
    }

    // Если ассистент вызвал функции, отправляем информацию о них
    let functionResults = []
    let needsClientExecution = false
    
    if (assistantMessage.tool_calls) {
      for (const toolCall of assistantMessage.tool_calls) {
        try {
          console.log('Tool call:', toolCall.function.name, toolCall.function.arguments)
          
          // Отмечаем что нужно выполнение на клиенте
          needsClientExecution = true
          
          functionResults.push({
            tool_call_id: toolCall.id,
            function_name: toolCall.function.name,
            arguments: toolCall.function.arguments,
            status: 'pending_client_execution'
          })
        } catch (error) {
          console.error('Error processing tool call:', error)
          functionResults.push({
            tool_call_id: toolCall.id,
            error: 'Ошибка обработки вызова функции'
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: assistantMessage.content || "Ответ получен",
      tool_calls: assistantMessage.tool_calls || [],
      function_results: functionResults,
      needs_client_execution: needsClientExecution,
      usage: data.usage
    })

  } catch (error) {
    console.error("Error in chat API route:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    )
  }
}
