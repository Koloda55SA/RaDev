'use client'

import { Textarea } from '@/components/ui/textarea'

interface SimpleCodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  placeholder?: string
}

export default function SimpleCodeEditor({ value, onChange, language, placeholder }: SimpleCodeEditorProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || 'Введите код...'}
      className="font-mono min-h-[200px]"
    />
  )
}
