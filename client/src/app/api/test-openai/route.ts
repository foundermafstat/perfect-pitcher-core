import { NextResponse } from 'next/server'

export async function POST() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'OPENAI_API_KEY не настроен в переменных окружения'
      })
    }

    // Простой тест - получаем список моделей
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        success: false,
        error: `OpenAI API вернул ошибку: ${response.status} - ${errorText}`
      })
    }

    const data = await response.json()
    const hasImageModels = data.data?.some((model: any) => 
      model.id?.includes('dall-e') || model.id?.includes('gpt-image')
    )

    return NextResponse.json({
      success: true,
      message: `Подключение к OpenAI API успешно. Доступно ${data.data?.length || 0} моделей.`,
      hasImageModels
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `Ошибка подключения: ${error.message}`
    })
  }
}
