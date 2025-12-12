'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/components/auth/useAuth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, X, Globe, User, LogOut, Settings, MessageCircle, Bell, Sun, Moon, Type, BookOpen, MoreVertical, Search, Instagram } from 'lucide-react'
import { getDb } from '@/lib/firebase/config'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { useTheme } from '@/components/providers/ThemeProvider'
import FontSizeControl from '@/components/shared/FontSizeControl'
import ReadingMode from '@/components/shared/ReadingMode'

export default function Header() {
  const { t, i18n } = useTranslation()
  const { user, userRole, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [newRequestsCount, setNewRequestsCount] = useState(0)
  const [newMessagesCount, setNewMessagesCount] = useState(0)

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ru' ? 'ky' : 'ru'
    i18n.changeLanguage(newLang)
  }

  useEffect(() => {
    if (userRole === 'admin' && user) {
      const loadCounts = async () => {
        try {
          const { apiClient } = await import('@/lib/api/client')
          
          // Загружаем заявки
          const requestsResponse = await apiClient.getProjectRequests()
          if (requestsResponse.success && requestsResponse.data) {
            const newRequests = requestsResponse.data.filter((req: any) => req.status === 'pending' || req.status === 'new')
            setNewRequestsCount(newRequests.length)
          }

          // Загружаем непрочитанные сообщения
          // TODO: Добавить метод getUnreadMessagesCount в C# API
          // Пока используем 0
          setNewMessagesCount(0)
        } catch (error) {
          console.error('Error loading counts:', error)
        }
      }

      loadCounts()
      
      // Polling для обновления каждые 10 секунд
      const interval = setInterval(loadCounts, 10000)
      return () => clearInterval(interval)
    }
  }, [userRole, user])

  const navItems = [
    { href: '/', label: t('nav.home') },
    { href: '/courses', label: '📚 Курсы' },
    { href: '/about', label: t('nav.about') },
    { href: '/blog', label: t('nav.blog') },
    { href: '/faq', label: '❓ FAQ' },
    ...(user ? [{ href: '/ide', label: '💻 IDE' }] : []),
  ]

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 mr-4 md:mr-6">
            <Image src="/logo.png" alt="R&A-Dev" width={32} height={32} className="object-contain" />
            <span className="text-xl md:text-2xl font-bold glow-blue whitespace-nowrap">R&A-Dev</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6 flex-1 justify-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs lg:text-sm font-medium hover:text-primary transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/users/search">
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Поиск
                  </Button>
                </Link>
                {userRole !== 'admin' && (
                  <Link href="/chat">
                    <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 shadow-lg">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      <span className="font-semibold">Чат</span>
                    </Button>
                  </Link>
                )}
                <a
                  href="https://www.instagram.com/radev.digital?igsh=MXVkaTd0NXd0NTdnYg=="
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="hidden md:flex">
                    <Instagram className="h-4 w-4" />
                  </Button>
                </a>
                
                {userRole === 'admin' && (
                  <>
                    <Link href="/admin">
                      <Button variant="outline" size="sm">
                        Админка
                      </Button>
                    </Link>
                    
                    <Link href="/admin?tab=requests">
                      <Button variant="ghost" size="icon" className="relative" title="Новые заявки">
                        <Bell className={`h-4 w-4 ${newRequestsCount > 0 ? 'text-red-500' : ''}`} />
                        {newRequestsCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {newRequestsCount > 9 ? '9+' : newRequestsCount}
                          </span>
                        )}
                      </Button>
                    </Link>
                    
                    <Link href="/admin?tab=chats">
                      <Button variant="ghost" size="icon" className="relative" title="Новые сообщения">
                        <MessageCircle className={`h-4 w-4 ${newMessagesCount > 0 ? 'text-blue-500' : ''}`} />
                        {newMessagesCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {newMessagesCount > 9 ? '9+' : newMessagesCount}
                          </span>
                        )}
                      </Button>
                    </Link>
                  </>
                )}
                
                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center w-full">
                        <User className="h-4 w-4 mr-2" />
                        Профиль
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/users/search" className="flex items-center w-full">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Поиск пользователей
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          await logout()
                          router.push('/')
                          window.location.href = '/'
                        } catch (error) {
                          console.error('Logout error:', error)
                        }
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Выйти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <a
                  href="https://www.instagram.com/radev.digital?igsh=MXVkaTd0NXd0NTdnYg=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:block"
                >
                  <Button variant="outline" size="sm">
                    <Instagram className="h-4 w-4" />
                  </Button>
                </a>
                <Link href="/login" className="hidden md:block">
                  <Button variant="outline" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    Войти
                  </Button>
                </Link>
              </>
            )}
            
            {/* Группированные настройки: Размер шрифта, Режим чтения, Тема, Язык */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex rounded-full h-10 w-10"
                  title="Настройки отображения"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 border-b">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">Размер шрифта</div>
                  <div className="flex items-center gap-2">
                    <FontSizeControl />
                  </div>
                </div>
                <div className="px-2 py-1.5 border-b">
                  <ReadingMode />
                </div>
                <DropdownMenuItem onClick={toggleTheme}>
                  {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                  {theme === 'dark' ? 'Светлая тема' : 'Темная тема'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleLanguage}>
                  <Globe className="h-4 w-4 mr-2" />
                  {i18n.language === 'ru' ? 'Кыргызча' : 'Русский'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ minHeight: '48px', minWidth: '48px', touchAction: 'manipulation' }}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto" style={{ pointerEvents: 'auto', zIndex: 50 }}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-left py-3 px-4 text-base font-medium hover:bg-accent rounded-md transition-colors active:scale-95"
                style={{ minHeight: '48px', touchAction: 'manipulation' }}
              >
                {item.label}
              </Link>
            ))}
            
            {user ? (
              <div className="pt-2 border-t border-border space-y-1">
                {userRole === 'admin' && (
                  <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Админка
                    </Button>
                  </Link>
                )}
                
                <a
                  href="https://www.instagram.com/radev.digital?igsh=MXVkaTd0NXd0NTdnYg=="
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Instagram className="h-4 w-4 mr-2" />
                    Instagram
                  </Button>
                </a>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    try {
                      setIsMenuOpen(false)
                      await logout()
                      router.push('/')
                      window.location.href = '/'
                    } catch (error) {
                      console.error('Logout error:', error)
                    }
                  }}
                  className="w-full justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Выйти
                </Button>
              </div>
            ) : (
              <>
                <a
                  href="https://www.instagram.com/radev.digital?igsh=MXVkaTd0NXd0NTdnYg=="
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Instagram className="h-4 w-4 mr-2" />
                    Instagram
                  </Button>
                </a>
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Войти
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
