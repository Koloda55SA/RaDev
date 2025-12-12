import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-6xl font-bold mb-4 glow-blue">404</h1>
      <h2 className="text-3xl font-semibold mb-4">Страница не найдена</h2>
      <p className="text-muted-foreground mb-8">
        К сожалению, запрашиваемая страница не существует.
      </p>
      <Link href="/">
        <Button variant="neon">
          <Home className="mr-2 h-4 w-4" />
          На главную
        </Button>
      </Link>
    </div>
  )
}

