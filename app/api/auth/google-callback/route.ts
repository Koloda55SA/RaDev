import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      )
    }

    // Используем хардкод как fallback, если переменные не установлены
    const googleClientId = process.env.GOOGLE_CLIENT_ID
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
    // На сервере используем прямой URL к VPS
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://213.199.56.27:5000/api'

    if (!googleClientId || !googleClientSecret) {
      console.error('[Google Callback] Missing Google OAuth credentials')
      return NextResponse.json(
        { error: 'Google OAuth not configured' },
        { status: 500 }
      )
    }

    // Обмениваем код на токен доступа
    // Используем правильный redirect_uri (без двойного слеша и trailing slash)
    const origin = request.nextUrl.origin.replace(/\/+$/, '')
    const redirectUri = `${origin}/auth/google/callback`
    
    console.log('[Google Callback] Config:', {
      clientId: googleClientId.substring(0, 20) + '...',
      redirectUri,
      origin: request.nextUrl.origin
    })
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}))
      console.error('Google token exchange error:', errorData)
      return NextResponse.json(
        { error: 'Failed to exchange authorization code' },
        { status: 400 }
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Получаем информацию о пользователе от Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!userInfoResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to get user info from Google' },
        { status: 400 }
      )
    }

    const userInfo = await userInfoResponse.json()

    // Отправляем данные на наш C# бэкенд
    console.log('[Google Callback] Sending user data to backend:', {
      apiUrl: `${apiUrl}/auth/google`,
      userEmail: userInfo.email,
      userName: userInfo.name
    })
    
    let backendResponse
    let backendData
    
    try {
      backendResponse = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          googleId: userInfo.id,
        }),
        // Добавляем таймаут
        signal: AbortSignal.timeout(15000), // 15 секунд
      })
      
      if (!backendResponse.ok) {
        const errorData = await backendResponse.json().catch(() => ({}))
        console.error('[Google Callback] Backend error response:', {
          status: backendResponse.status,
          statusText: backendResponse.statusText,
          error: errorData
        })
        
        // Если бэкенд недоступен, используем временное решение
        if (backendResponse.status === 404 || backendResponse.status === 503 || backendResponse.status === 502) {
          console.warn('[Google Callback] Backend unavailable, using temporary local storage solution')
          // Временное решение: создаем пользователя локально
          const tempUserId = `google_${userInfo.id}`
          const tempToken = `temp_token_${Date.now()}_${Math.random().toString(36).substring(7)}`
          
          return NextResponse.json({
            token: tempToken,
            user: {
              id: tempUserId,
              uid: tempUserId,
              email: userInfo.email,
              displayName: userInfo.name,
              photoURL: userInfo.picture,
              role: 'user',
              nickname: userInfo.name.split(' ')[0] || userInfo.email.split('@')[0],
            },
            warning: 'Backend недоступен, используется временное решение. Пользователь сохранен локально.'
          })
        }
        
        return NextResponse.json(
          { 
            error: errorData.error || `Backend error: ${backendResponse.status} ${backendResponse.statusText}`,
            details: errorData.details || errorData.message || 'Проверьте логи на сервере'
          },
          { status: backendResponse.status }
        )
      }
      
      backendData = await backendResponse.json()
      console.log('[Google Callback] Backend success, received data:', {
        hasToken: !!backendData.token,
        hasUser: !!backendData.user,
        keys: Object.keys(backendData)
      })
      
      // Если бэкенд вернул только токен, создаем объект пользователя из userInfo
      if (backendData.token && !backendData.user) {
        console.log('[Google Callback] Backend returned only token, creating user object from Google info')
        backendData.user = {
          id: userInfo.id,
          uid: userInfo.id,
          email: userInfo.email,
          displayName: userInfo.name,
          photoURL: userInfo.picture,
          role: 'user',
          nickname: userInfo.name?.split(' ')[0] || userInfo.email?.split('@')[0] || 'Пользователь',
        }
      }
      
    } catch (fetchError: any) {
      console.error('[Google Callback] Backend fetch error:', fetchError)
      
      // Если бэкенд недоступен, используем временное решение
      if (fetchError.message?.includes('fetch failed') || 
          fetchError.message?.includes('ECONNREFUSED') ||
          fetchError.message?.includes('network') ||
          fetchError.name === 'AbortError' ||
          fetchError.name === 'TimeoutError') {
        
        console.warn('[Google Callback] Backend unavailable, using temporary local storage solution')
        console.warn('[Google Callback] API URL:', apiUrl)
        console.warn('[Google Callback] Error:', fetchError.message)
        
        // Временное решение: создаем пользователя локально
        // Генерируем временный ID и токен
        const tempUserId = `google_${userInfo.id}`
        const tempToken = `temp_token_${Date.now()}_${Math.random().toString(36).substring(7)}`
        
        return NextResponse.json({
          token: tempToken,
          user: {
            id: tempUserId,
            uid: tempUserId,
            email: userInfo.email,
            displayName: userInfo.name,
            photoURL: userInfo.picture,
            role: 'user',
            nickname: userInfo.name.split(' ')[0] || userInfo.email.split('@')[0],
          },
          warning: 'Backend недоступен, используется временное решение. Пользователь сохранен локально. Проверьте настройки C# API на VPS.'
        })
      }
      
      return NextResponse.json(
        { 
          error: 'Ошибка при обращении к серверу',
          details: fetchError.message || 'Unknown error'
        },
        { status: 500 }
      )
    }

    // Убеждаемся, что user объект существует
    if (!backendData.user) {
      console.warn('[Google Callback] User object missing, creating from Google info')
      backendData.user = {
        id: userInfo.id,
        uid: userInfo.id,
        email: userInfo.email,
        displayName: userInfo.name,
        photoURL: userInfo.picture,
        role: 'user',
        nickname: userInfo.name?.split(' ')[0] || userInfo.email?.split('@')[0] || 'Пользователь',
      }
    }
    
    console.log('[Google Callback] Final response:', {
      hasToken: !!backendData.token,
      hasUser: !!backendData.user,
      userEmail: backendData.user?.email
    })
    
    return NextResponse.json({
      token: backendData.token,
      user: backendData.user,
    })
  } catch (error: any) {
    console.error('Google callback error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}





