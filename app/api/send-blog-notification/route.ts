import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { blogTitle, blogExcerpt, blogId, subscribers } = await request.json()

    if (!blogTitle || !subscribers || !Array.isArray(subscribers)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Здесь можно интегрировать EmailJS, SendGrid или другой email сервис
    // Пока просто логируем для отладки
    console.log('Sending blog notification to subscribers:', {
      blogTitle,
      blogExcerpt,
      blogId,
      subscriberCount: subscribers.length,
    })

    // TODO: Интегрировать реальную отправку email
    // Пример с EmailJS:
    // await emailjs.send(
    //   'service_id',
    //   'template_id',
    //   {
    //     blog_title: blogTitle,
    //     blog_excerpt: blogExcerpt,
    //     blog_url: `https://www.radev.digital/blog/${blogId}`,
    //     to_email: subscriber.email,
    //   }
    // )

    return NextResponse.json({
      success: true,
      message: `Email notifications queued for ${subscribers.length} subscribers`,
    })
  } catch (error: any) {
    console.error('Error in send-blog-notification:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}







