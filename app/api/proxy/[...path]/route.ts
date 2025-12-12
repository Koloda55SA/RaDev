import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://213.199.56.27:5000/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'PUT')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'PATCH')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'DELETE')
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    const path = params.path.join('/')
    // Убеждаемся, что BACKEND_URL заканчивается на /api, а path не начинается с /
    const backendBase = BACKEND_URL.endsWith('/api') ? BACKEND_URL : `${BACKEND_URL}/api`
    const url = `${backendBase}/${path}${request.nextUrl.search}`
    
    console.log(`[API Proxy] ${method} ${url}`)
    
    // Получаем заголовки из запроса
    const headers: Record<string, string> = {}
    
    // Копируем важные заголовки
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    // Для FormData не устанавливаем Content-Type - браузер сделает это сам
    const contentType = request.headers.get('content-type')
    if (contentType && !contentType.includes('multipart/form-data')) {
      headers['Content-Type'] = contentType
    }
    
    // Получаем тело запроса
    let body: string | FormData | undefined
    if (method !== 'GET' && method !== 'DELETE') {
      const contentType = request.headers.get('content-type')
      if (contentType?.includes('multipart/form-data')) {
        body = await request.formData()
      } else {
        body = await request.text()
      }
    }
    
    // Делаем запрос к бэкенду
    const response = await fetch(url, {
      method,
      headers,
      body: body instanceof FormData ? body : body,
    })
    
    // Получаем ответ
    const data = await response.text()
    
    // Пытаемся распарсить как JSON, если не получается - возвращаем как текст
    let jsonData
    try {
      jsonData = JSON.parse(data)
    } catch {
      jsonData = data
    }
    
    // Логируем ошибки
    if (!response.ok) {
      console.error(`[API Proxy] ${method} ${url} - ${response.status}:`, jsonData)
    }
    
    // Возвращаем ответ с теми же заголовками
    return NextResponse.json(jsonData, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error: any) {
    console.error('[API Proxy] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Proxy error' },
      { status: 500 }
    )
  }
}

