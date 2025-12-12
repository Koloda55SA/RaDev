'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { Github, Mail, MessageCircle, Instagram } from 'lucide-react'
import EmailSubscribe from '@/components/shared/EmailSubscribe'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo.png" alt="R&A-Dev" width={32} height={32} className="object-contain" />
              <h3 className="text-lg sm:text-xl font-bold glow-blue">R&A-Dev</h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t('hero.subtitle')}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Навигация</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-primary transition-colors">
                  {t('nav.services')}
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-primary transition-colors">
                  {t('nav.portfolio')}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary transition-colors">
                  {t('nav.blog')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:kalikoloda66@gmail.com" className="hover:text-primary transition-colors">
                  kalikoloda66@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <a href="https://t.me/radev_team" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  @radev_team
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                <a href="https://www.instagram.com/radev.digital?igsh=MXVkaTd0NXd0NTdnYg==" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  @radev.digital
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Подписка на новости</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Получайте уведомления о новых проектах и статьях
            </p>
            <EmailSubscribe />
            <div className="mt-4 flex gap-4">
              <a
                href="https://github.com/Koloda55SA"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} R&A-Dev. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}

