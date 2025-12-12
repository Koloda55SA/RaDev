'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Terminal, Play, Save, FilePlus, X, Minimize2, Maximize2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface CodeFile {
  name: string
  language: string
  content: string
}

interface CodeIDEProps {
  onSave?: (files: CodeFile[]) => void
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'cpp', label: 'C++', icon: '⚙️' },
  { value: 'c', label: 'C', icon: '⚙️' },
  { value: 'csharp', label: 'C#', icon: '🔷' },
  { value: 'go', label: 'Go', icon: '🐹' },
  { value: 'rust', label: 'Rust', icon: '🦀' },
  { value: 'php', label: 'PHP', icon: '🐘' },
  { value: 'ruby', label: 'Ruby', icon: '💎' },
  { value: 'swift', label: 'Swift', icon: '🐦' },
  { value: 'kotlin', label: 'Kotlin', icon: '🟦' },
  { value: 'html', label: 'HTML', icon: '🌐' },
  { value: 'css', label: 'CSS', icon: '🎨' },
  { value: 'json', label: 'JSON', icon: '📄' },
]

export default function CodeIDE({ onSave }: CodeIDEProps) {
  const [files, setFiles] = useState<CodeFile[]>([
    { name: 'main.js', language: 'javascript', content: '// Начните писать код здесь\nconsole.log("Hello, World!");' }
  ])
  const [activeFileIndex, setActiveFileIndex] = useState(0)
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOutputMaximized, setIsOutputMaximized] = useState(false)
  const editorRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const activeFile = files[activeFileIndex]

  useEffect(() => {
    const saved = localStorage.getItem('radev_ide_files')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFiles(parsed)
        }
      } catch (e) {
        console.error('Error loading saved files:', e)
      }
    }
  }, [])

  const handleCodeChange = (value: string) => {
    const newFiles = [...files]
    newFiles[activeFileIndex].content = value
    setFiles(newFiles)
  }

  const getLanguageExtension = (lang: string) => {
    switch (lang) {
      case 'javascript':
      case 'typescript':
        return javascript({ jsx: true, typescript: lang === 'typescript' })
      case 'python':
        return python()
      case 'java':
        return java()
      case 'cpp':
      case 'c':
        return cpp()
      case 'html':
        return html()
      case 'css':
        return css()
      case 'json':
        return json()
      default:
        return []
    }
  }

  const handleLanguageChange = (language: string) => {
    const newFiles = [...files]
    newFiles[activeFileIndex].language = language
    const ext = LANGUAGES.find(l => l.value === language)?.value || 'txt'
    newFiles[activeFileIndex].name = `main.${ext}`
    setFiles(newFiles)
  }

  const handleAddFile = () => {
    const newFile: CodeFile = {
      name: `file${files.length + 1}.js`,
      language: 'javascript',
      content: '// Новый файл\n'
    }
    setFiles([...files, newFile])
    setActiveFileIndex(files.length)
  }

  const handleDeleteFile = (index: number) => {
    if (files.length === 1) {
      toast.error('Нельзя удалить последний файл')
      return
    }
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    if (activeFileIndex >= newFiles.length) {
      setActiveFileIndex(newFiles.length - 1)
    }
  }

  const handleRun = async () => {
    if (!activeFile) return
    
    setLoading(true)
    setOutput('')
    
    try {
      const response = await fetch('https://api.piston.run/api/v2/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: activeFile.language,
          version: '*',
          files: [{ content: activeFile.content }]
        }),
        signal: AbortSignal.timeout(30000)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      console.log('API Response:', data) // Debug log
      
      let outputText = ''
      
      if (data.run) {
        if (data.run.stdout) {
          outputText += `📤 Вывод:\n${data.run.stdout}\n\n`
        }
        
        if (data.run.stderr) {
          outputText += `⚠️  Ошибки:\n${data.run.stderr}\n\n`
        }
        
        if (data.run.output) {
          outputText += `📝 Результат:\n${data.run.output}\n\n`
        }
        
        if (data.run.code !== undefined && data.run.code !== 0) {
          outputText += `❌ Код возврата: ${data.run.code}\n\n`
        }
      }
      
      if (!outputText.trim()) {
        outputText = '✅ Программа выполнена без вывода'
      } else {
        outputText = '✅ Выполнено успешно!\n\n' + outputText
      }
      
      setOutput(outputText)
      
    } catch (error: any) {
      console.error('Execution error:', error)
      
      let errorMessage = '❌ Ошибка выполнения\n\n'
      
      if (error.name === 'AbortError') {
        errorMessage += '⏱️ Превышено время ожидания (30 секунд)'
      } else if (error.message.includes('NetworkError')) {
        errorMessage += '🌐 Проверьте подключение к интернету'
      } else {
        errorMessage += `💥 ${error.message || 'Неизвестная ошибка'}`
      }
      
      errorMessage += '\n\n🛠️ Что проверить:\n• Интернет соединение\n• Синтаксис кода\n• Поддержку языка\n'
      
      setOutput(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    localStorage.setItem('radev_ide_files', JSON.stringify(files))
    if (onSave) onSave(files)
    toast.success('💾 Файлы сохранены локально')
  }

  const handleClearOutput = () => {
    setOutput('')
  }

  useEffect(() => {
    // Глобальные комбинации клавиш
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      if (e.key === 'F5') {
        e.preventDefault()
        handleRun()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [files, activeFileIndex])

  const getLanguageIcon = (lang: string) => {
    return LANGUAGES.find(l => l.value === lang)?.icon || '📄'
  }

  return (
    <div 
      ref={containerRef}
      className="flex flex-col h-full bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden rounded-xl border border-gray-800 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-blue-400" />
            <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              R&A DEV IDE
            </span>
          </div>
          
          <div className="flex items-center gap-1 overflow-x-auto max-w-md scrollbar-thin">
            {files.map((file, index) => (
              <button
                key={index}
                onClick={() => setActiveFileIndex(index)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  index === activeFileIndex
                    ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-700/50 text-white shadow-lg'
                    : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white'
                }`}
              >
                <span>{getLanguageIcon(file.language)}</span>
                <span className="text-sm font-medium">{file.name}</span>
                {files.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteFile(index)
                    }}
                    className="ml-1 p-0.5 rounded hover:bg-red-900/30 hover:text-red-400 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </button>
            ))}
            
            <button
              onClick={handleAddFile}
              className="px-3 py-1.5 bg-gradient-to-r from-green-900/30 to-emerald-900/30 hover:from-green-800/40 hover:to-emerald-800/40 rounded-lg border border-green-800/30 hover:border-green-700/50 transition-all"
            >
              <FilePlus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={activeFile?.language || 'javascript'}
            onValueChange={handleLanguageChange}
          >
            <SelectTrigger className="w-[140px] bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 max-h-[400px]">
              {LANGUAGES.map((lang) => (
                <SelectItem 
                  key={lang.value} 
                  value={lang.value}
                  className="text-white hover:bg-gray-700 focus:bg-gray-700"
                >
                  <span className="mr-2">{lang.icon}</span>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            onClick={handleSave}
            variant="outline"
            size="sm"
            className="bg-gray-800/50 border-gray-700 hover:bg-gray-700 text-white"
          >
            <Save className="h-4 w-4 mr-1" />
            Сохранить
          </Button>
          
          <Button
            onClick={handleRun}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Выполнение...</span>
              </div>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1 fill-current" />
                Запустить (F5)
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-0 h-full w-full">
          <CodeMirror
            value={activeFile?.content || ''}
            height="100%"
            theme={oneDark}
            extensions={[getLanguageExtension(activeFile?.language || 'javascript')]}
            onChange={handleCodeChange}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              dropCursor: false,
              allowMultipleSelections: false,
              indentOnInput: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              highlightSelectionMatches: true,
            }}
          />
        </div>
      </div>

      {/* Output Panel */}
      {output && (
        <div 
          className={`border-t border-gray-800 bg-gradient-to-b from-gray-900 to-black transition-all duration-300 ${
            isOutputMaximized ? 'h-2/3' : 'h-[200px]'
          } flex flex-col flex-shrink-0`}
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-green-400" />
              <span className="text-sm font-semibold text-gray-300">Вывод:</span>
              <span className="text-xs text-gray-500">
                {loading ? 'Выполняется...' : 'Готово'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOutputMaximized(!isOutputMaximized)}
                className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                title={isOutputMaximized ? 'Свернуть' : 'Развернуть'}
              >
                {isOutputMaximized ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
              
              <button
                onClick={handleClearOutput}
                className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                title="Очистить вывод"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed">
              <code className="text-gray-300">
                {output.split('\n').map((line, i) => (
                  <div key={i} className={`py-0.5 ${
                    line.includes('✅') ? 'text-green-400' :
                    line.includes('❌') || line.includes('⚠️') ? 'text-red-400' :
                    line.includes('📤') || line.includes('📝') ? 'text-blue-400' :
                    'text-gray-400'
                  }`}>
                    {line}
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
