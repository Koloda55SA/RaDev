import { NextRequest, NextResponse } from 'next/server'
import { SYSTEM_PROMPT } from '@/lib/ai/prompt'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let requestBody: any
  
  try {
    // Читаем body один раз и сохраняем
    requestBody = await request.json()
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
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}








