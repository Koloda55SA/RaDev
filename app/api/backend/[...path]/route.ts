/**
 * Next.js API Route для проксирования запросов к C# бэкенду
 * Решает проблему Mixed Content (HTTPS -> HTTP)
 */

import { NextRequest, NextResponse } from 'next/server'

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'DELETE')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'PATCH')
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
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
    const url = new URL(request.url)
    const queryString = url.search
    
    // Специальная обработка для uploads - проксируем напрямую к бэкенду
    if (path.startsWith('uploads/')) {
      const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://213.199.56.27:5000'
      const backendUrl = `${backendBaseUrl}/${path}${queryString}`
      
      const response = await fetch(backendUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(30000),
      })
      
      if (!response.ok) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        )
      }
      
      const contentType = response.headers.get('content-type') || 'application/octet-stream'
      const data = await response.arrayBuffer()
      
      return new NextResponse(data, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
        },
      })
    }
    
    const backendUrl = `${BACKEND_URL}/${path}${queryString}`
    
    // Получаем заголовки из запроса
    const headers: Record<string, string> = {}
    
    // Копируем важные заголовки
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    const contentType = request.headers.get('content-type')
    if (contentType) {
      headers['Content-Type'] = contentType
    }
    
    // Получаем body для POST/PUT/PATCH
    let body: string | undefined
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        body = await request.text()
      } catch {
        // Если body нет, оставляем undefined
      }
    }
    
    // Выполняем запрос к бэкенду
    const response = await fetch(backendUrl, {
      method,
      headers,
      body,
      // Увеличиваем таймаут для больших запросов
      signal: AbortSignal.timeout(30000),
    })
    
    const data = await response.text()
    
    // Пытаемся распарсить как JSON, если не получается - возвращаем как текст
    let jsonData
    try {
      jsonData = JSON.parse(data)
    } catch {
      jsonData = data
    }
    
    return NextResponse.json(jsonData, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error: any) {
    console.error('[Backend Proxy] Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to connect to backend',
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
}

