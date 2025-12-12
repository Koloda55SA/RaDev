'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'

const CodeIDE = dynamic(() => import('@/components/ide/CodeIDE'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Загрузка редактора...</p>
      </div>
    </div>
  ),
})

export default function IDEPage() {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">💻 Онлайн IDE</CardTitle>
          <CardDescription>
            Полноценный редактор кода с поддержкой множества языков программирования
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div style={{ height: 'calc(100vh - 250px)', minHeight: '600px' }}>
            <CodeIDE
              onSave={(files) => {
                localStorage.setItem('radev_ide_files', JSON.stringify(files))
                toast.success('Файлы сохранены')
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
