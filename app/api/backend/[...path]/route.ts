/**
 * Next.js API Route для проксирования запросов к C# бэкенду
 * Решает проблему Mixed Content (HTTPS -> HTTP)
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://213.199.56.27:5000/api'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return handleRequest(request, resolvedParams, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return handleRequest(request, resolvedParams, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return handleRequest(request, resolvedParams, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return handleRequest(request, resolvedParams, 'DELETE')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return handleRequest(request, resolvedParams, 'PATCH')
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
    let body: string | FormData | undefined
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const contentType = request.headers.get('content-type')
        if (contentType?.includes('multipart/form-data')) {
          body = await request.formData()
        } else {
          body = await request.text()
        }
      } catch {
        // Если body нет, оставляем undefined
      }
    }
    
    // Выполняем запрос к бэкенду
    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(30000),
    }
    
    // Добавляем body только если оно есть
    if (body !== undefined) {
      if (body instanceof FormData) {
        // Для FormData не устанавливаем Content-Type, браузер сделает это сам
        fetchOptions.body = body
      } else {
        fetchOptions.body = body
      }
    }
    
    const response = await fetch(backendUrl, fetchOptions)
    
    // Определяем тип контента
    const contentType = response.headers.get('content-type') || ''
    let responseData: any
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json()
    } else if (contentType && contentType.includes('text/')) {
      responseData = await response.text()
    } else if (contentType && (contentType.startsWith('image/') || contentType.startsWith('application/octet-stream'))) {
      // Для бинарных данных возвращаем как ArrayBuffer
      const buffer = await response.arrayBuffer()
      return new NextResponse(buffer, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    } else {
      // По умолчанию пытаемся как JSON
      try {
        const text = await response.text()
        responseData = JSON.parse(text)
      } catch {
        responseData = await response.text()
      }
    }
    
    return NextResponse.json(responseData, {
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

