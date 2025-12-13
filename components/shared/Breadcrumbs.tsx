'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  currentLabel?: string
}

export default function Breadcrumbs({ items, currentLabel }: BreadcrumbsProps) {
  const pathname = usePathname()
  
  // Автоматическое определение breadcrumbs из pathname
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items
    
    const paths = pathname?.split('/').filter(Boolean) || []
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Главная', href: '/' }]
    
    let currentPath = ''
    paths.forEach((path, index) => {
      currentPath += `/${path}`
      
      // Пропускаем динамические сегменты (id)
      if (path.match(/^[a-zA-Z0-9-]+$/)) {
        const label = path
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
        
        // Если это последний элемент и есть currentLabel, используем его
        if (index === paths.length - 1 && currentLabel) {
          breadcrumbs.push({ label: currentLabel, href: currentPath })
        } else {
          breadcrumbs.push({ label, href: currentPath })
        }
      }
    })
    
    return breadcrumbs
  }
  
  const breadcrumbs = getBreadcrumbs()
  
  // Не показываем на главной странице
  if (breadcrumbs.length <= 1) return null
  
  return (
    <nav className="hidden md:flex items-center gap-2 text-sm text-muted-foreground mb-6 px-4">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1
        
        return (
          <div key={item.href} className="flex items-center gap-2">
            {index === 0 ? (
              <Link 
                href={item.href}
                className="hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Home className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <ChevronRight className="h-4 w-4" />
                {isLast ? (
                  <span className="text-foreground font-medium">{item.label}</span>
                ) : (
                  <Link 
                    href={item.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </>
            )}
          </div>
        )
      })}
    </nav>
  )
}








