import "./globals.css"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import MobileBottomNav from "@/components/layout/MobileBottomNav"
import I18nProvider from "@/components/providers/I18nProvider"
import QueryProvider from "@/components/providers/QueryProvider"
import { HybridAuthProvider } from "@/components/auth/HybridAuthProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import ChatBot from "@/components/ai/ChatBot"
import ScrollToTop from "@/components/shared/ScrollToTop"
import LoadingScreen from "@/components/shared/LoadingScreen"
import { Toaster } from "react-hot-toast"
import { metadata } from "./metadata"
import Script from "next/script"

export { metadata }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json?v=5.0.0" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Регистрация Service Worker для всех устройств (адаптивный подход)
                if ('serviceWorker' in navigator) {
                  // Регистрируем SW асинхронно, не блокируя загрузку страницы
                  setTimeout(function() {
                    var swVersion = '5.0.0'
                    console.log('[SW] Registering version:', swVersion)
                    
                    navigator.serviceWorker.register('/sw.js?v=' + swVersion, {
                      updateViaCache: 'none'
                    })
                      .then(function(registration) {
                        console.log('[SW] Registered:', registration.scope)
                        
                        // Проверяем обновления только раз в 10 минут (очень редко)
                        var updateInterval = setInterval(function() {
                          registration.update()
                        }, 600000) // 10 минут - достаточно редко для обновлений
                        
                        // Обработка обновлений - только при реальном обновлении версии
                        var currentVersion = swVersion
                        var hasUpdated = false
                        
                        registration.addEventListener('updatefound', function() {
                          console.log('[SW] Update found')
                          const newWorker = registration.installing
                          
                          if (newWorker) {
                            newWorker.addEventListener('statechange', function() {
                              if (newWorker.state === 'installed') {
                                // Проверяем, действительно ли это обновление (не первая установка)
                                if (navigator.serviceWorker.controller && !hasUpdated) {
                                  hasUpdated = true
                                  console.log('[SW] New version installed, reloading in 3s...')
                                  // Перезагружаем через 3 секунды, давая время пользователю
                                  setTimeout(function() {
                                    window.location.reload()
                                  }, 3000)
                                } else if (!navigator.serviceWorker.controller) {
                                  console.log('[SW] First install - no reload needed')
                                }
                              }
                            })
                          }
                        })
                        
                        // Проверка обновлений при возврате на вкладку - редко
                        var lastUpdateCheck = 0
                        document.addEventListener('visibilitychange', function() {
                          if (!document.hidden) {
                            var now = Date.now()
                            // Проверяем обновления максимум раз в 5 минут (не каждую минуту!)
                            if (now - lastUpdateCheck > 300000) {
                              lastUpdateCheck = now
                              registration.update()
                            }
                          }
                        })
                        
                        // НЕ слушаем сообщения от SW - это вызывало бесконечные перезагрузки
                        // Перезагрузка только через updatefound при реальном обновлении
                      })
                      .catch(function(err) {
                        console.error('[SW] Registration failed:', err)
                      })
                  }, 5000) // Ждем 5 секунд после загрузки страницы (не блокируем)
                }
                
                // Очищаем старые кэши только один раз, не при каждой загрузке
                if ('caches' in window && !sessionStorage.getItem('cacheCleaned')) {
                  caches.keys().then(function(cacheNames) {
                    cacheNames.forEach(function(cacheName) {
                      if (cacheName.indexOf('freedip-cache-') !== -1 && 
                          !cacheName.includes('5.0.0')) {
                        caches.delete(cacheName).then(function() {
                          console.log('[Cache] Deleted old cache:', cacheName)
                        })
                      }
                    })
                    sessionStorage.setItem('cacheCleaned', 'true')
                  })
                }
              })()
            `,
          }}
        />
        <LoadingScreen />
        <ThemeProvider>
          <I18nProvider>
            <QueryProvider>
              <HybridAuthProvider>
                <Header />
                <main className="min-h-screen pt-16 pb-20 md:pb-0 relative z-10">
                  {children}
                </main>
                <Footer />
                <MobileBottomNav />
                <ChatBot />
                <ScrollToTop />
                <Toaster position="top-right" />
              </HybridAuthProvider>
            </QueryProvider>
          </I18nProvider>
        </ThemeProvider>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}

