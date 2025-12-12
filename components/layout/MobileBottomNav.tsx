'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, BookOpen, MessageCircle, Search, User } from 'lucide-react'
import { useAuth } from '@/components/auth/useAuth'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const navItems = [
    { href: '/courses', label: 'Курсы', icon: BookOpen },
    { href: '/', label: 'Главная', icon: Home },
    { href: user ? '/chat' : '/login', label: 'Чат', icon: MessageCircle },
    { href: '/users/search', label: 'Поиск', icon: Search },
    { href: user ? '/profile' : '/login', label: 'Профиль', icon: User },
  ]

  // Не показываем на админке и страницах входа
  if (pathname?.startsWith('/admin') || pathname === '/login') {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-background/95 backdrop-blur-md border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center 
                flex-1 h-full
                transition-colors duration-200
                ${isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
              style={{ 
                minHeight: '56px', 
                touchAction: 'manipulation',
                pointerEvents: 'auto',
                WebkitTapHighlightColor: 'rgba(59, 130, 246, 0.5)',
                cursor: 'pointer'
              }}
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
