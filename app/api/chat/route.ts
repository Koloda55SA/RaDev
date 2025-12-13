import { NextRequest, NextResponse } from 'next/server'
import { SYSTEM_PROMPT } from '@/lib/ai/prompt'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // В Next.js 14 body можно прочитать только один раз
  // Используем более надежный способ - читаем как текст, затем парсим
  let requestBody: any
  
  try {
    // Сначала проверяем, доступен ли body
    if (!request.body) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      )
    }

    // Читаем body как текст один раз
    const bodyText = await request.text()
    
    // Парсим JSON из текста
    try {
      requestBody = JSON.parse(bodyText)
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    
    const { message, conversationHistory } = requestBody

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Получаем API ключ из переменных окружения (только на сервере!)
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.error('OPENAI_API_KEY is not set')
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    // Формируем историю сообщений
    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      ...(conversationHistory || []),
      {
        role: 'user',
        content: message,
      },
    ]

    // Вызываем OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenAI API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to get response from AI' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const aiMessage = data.choices?.[0]?.message?.content || 'Извините, не удалось получить ответ.'

    return NextResponse.json({
      message: aiMessage,
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    
    // Проверяем, не связана ли ошибка с чтением body
    if (error.message?.includes('Body has already been read') || error.message?.includes('Body is unusable')) {
      console.error('Body read error - возможно body был прочитан дважды')
      return NextResponse.json(
        { error: 'Request body processing error' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}








