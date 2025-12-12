import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'R&A-Dev - Профессиональная разработка IT-решений',
  description: 'Команда разработчиков R&A-Dev. Создаем дипломные работы, веб-сайты, мобильные и десктоп приложения. Профессиональные IT-решения под ключ.',
  keywords: ['разработка', 'дипломы', 'веб-сайты', 'приложения', 'IT', 'программирование', 'R&A-Dev'],
  authors: [{ name: 'R&A-Dev' }],
  creator: 'R&A-Dev',
  publisher: 'R&A-Dev',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://radev.digital'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: '/',
    title: 'R&A-Dev - Профессиональная разработка IT-решений',
    description: 'Команда разработчиков R&A-Dev. Создаем дипломные работы, веб-сайты, мобильные и десктоп приложения.',
    siteName: 'R&A-Dev',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'R&A-Dev Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'R&A-Dev - Профессиональная разработка IT-решений',
    description: 'Команда разработчиков R&A-Dev. Создаем дипломные работы, веб-сайты, мобильные и десктоп приложения.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
}
