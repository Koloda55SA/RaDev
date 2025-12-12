'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/components/auth/useAuth'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Send, MessageCircle, ArrowLeft, Search, UserPlus, Users, X, Image as ImageIcon, Code } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import GlobalChat from '@/components/chat/GlobalChat'
import toast from 'react-hot-toast'
import { useActivityTracking } from '@/lib/hooks/useActivityTracking'
import { getFollowingList, searchUsersByNickname, followUser, unfollowUser, getUserById, UserSubscription } from '@/lib/api/socialApi'
import { escapeHtml, sanitizeString } from '@/lib/utils/security'
import { filterProfanity, containsProfanity } from '@/lib/utils/profanityFilter'
import { apiClient } from '@/lib/api/client'
import MessageBubble from '@/components/chat/MessageBubble'

interface Message {
  id: string
  text: string
  senderId: string
  senderEmail: string
  receiverId: string
  receiverEmail: string
  timestamp: Date | string
  read: boolean
  imageUrl?: string
  code?: string
  codeLanguage?: string
}

export default function ChatPage() {
  const { user, userRole } = useAuth()
  const router = useRouter()
  const { trackMessageSent } = useActivityTracking()
  // Helper to get user ID that works for both Firebase User and ApiUser
  const getUserId = () => (user as any)?.uid || (user as any)?.id || ''
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserSubscription | null>(null)
  const [showUserSelect, setShowUserSelect] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserSubscription[]>([])
  const [following, setFollowing] = useState<UserSubscription[]>([])
  const [searching, setSearching] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [codeLanguage, setCodeLanguage] = useState('text')
  const [activeTab, setActiveTab] = useState<'private' | 'global' | 'groups'>('private')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // КРИТИЧНО: Не редиректим на login, если обрабатывается OAuth redirect
    // Проверяем наличие OAuth параметров в URL
    const hasOAuthParams = typeof window !== 'undefined' && (
      window.location.search.includes('__firebase_request_key') || 
      window.location.hash.includes('access_token') ||
      window.location.hash.includes('id_token')
    )
    
    // Если есть OAuth параметры - ждем восстановления сессии
    if (hasOAuthParams) {
      console.log('[ChatPage] OAuth redirect detected, waiting for session restoration...')
      return
    }
    
    if (!user) {
      router.push('/login?redirect=/chat')
      return
    }

    // Проверяем параметр user из URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const userIdParam = urlParams.get('user')
      if (userIdParam) {
        // Загружаем пользователя из параметра
        loadUserById(userIdParam)
      } else {
        loadFollowing()
      }
    } else {
      loadFollowing()
    }
  }, [user])

  const loadUserById = async (userId: string) => {
    if (!user) return
    try {
      const targetUser = await getUserById(userId)
      if (targetUser) {
        await handleSelectUser(targetUser)
      }
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const loadFollowing = async () => {
    if (!user) return
    try {
      const followingList = await getFollowingList(getUserId())
      setFollowing(followingList)
      
      // Если есть подписки, выбираем первого по умолчанию
      if (followingList.length > 0 && !selectedUserId) {
        setSelectedUserId(followingList[0].uid)
        setSelectedUser(followingList[0])
        loadMessages(followingList[0].uid)
      }
    } catch (error) {
      console.error('Error loading following:', error)
    }
  }

  const loadMessages = async (receiverId: string) => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await apiClient.getPrivateChat(receiverId, 100)
      if (response.success && response.data) {
        const messagesData = response.data.map((msg: any) => ({
          id: msg.id || msg.messageId,
          text: msg.content || msg.text || '',
          senderId: msg.senderId || msg.sender?.id,
          senderEmail: msg.senderEmail || msg.sender?.email || '',
          receiverId: msg.receiverId || receiverId,
          receiverEmail: msg.receiverEmail || '',
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          read: msg.read || false,
          imageUrl: msg.fileUrl || msg.imageUrl,
          code: msg.code,
          codeLanguage: msg.codeLanguage,
        })) as Message[]
        
        setMessages(messagesData)
      } else {
        setMessages([])
      }
      setLoading(false)
    } catch (error) {
      console.error('Error loading messages:', error)
      toast.error('Ошибка загрузки сообщений')
      setLoading(false)
    }
  }

  const handleSearchUsers = async () => {
    if (!user || !searchQuery.trim()) return
    
    setSearching(true)
    try {
      const results = await searchUsersByNickname(searchQuery, getUserId())
      setSearchResults(results)
    } catch (error) {
      console.error('Error searching users:', error)
      toast.error('Ошибка поиска пользователей')
    } finally {
      setSearching(false)
    }
  }

  const handleSelectUser = async (targetUser: UserSubscription) => {
    if (!user) return
    
    setSelectedUserId(targetUser.uid)
    setSelectedUser(targetUser)
    setShowUserSelect(false)
    setSearchQuery('')
    setSearchResults([])
    
    // Если не подписан, подписываемся автоматически
    const isFollowingUser = following.some(u => u.uid === targetUser.uid)
    if (!isFollowingUser) {
      try {
        await followUser(getUserId(), targetUser.uid)
        await loadFollowing()
        toast.success(`Подписались на ${targetUser.nickname}`)
      } catch (error) {
        console.error('Error following user:', error)
      }
    }
    
    loadMessages(targetUser.uid)
  }

  const handleImageUpload = async (file: File): Promise<string | null> => {
    if (!file || !user) return null
    
    try {
      setUploadingImage(true)
      // Отправляем файл вместе с сообщением через API
      // Файл будет загружен на сервер и URL вернется в ответе
      return null // Файл будет отправлен вместе с сообщением
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Ошибка загрузки изображения')
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер изображения не должен превышать 5 МБ')
      return
    }

    // Показываем превью
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Загружаем изображение
    const imageUrl = await handleImageUpload(file)
    if (imageUrl) {
      // Отправляем сообщение с изображением
      await sendMessage('', imageUrl)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const sendMessage = async (text: string, imageUrl?: string, code?: string, codeLang?: string) => {
    if ((!text.trim() && !imageUrl && !code) || !user || !selectedUserId || !selectedUser) {
      return
    }

    try {
      // Санитизируем и фильтруем маты
      const sanitizedText = sanitizeString(text.trim() || '')
      const filteredText = filterProfanity(sanitizedText)
      
      if (containsProfanity(sanitizedText) && sanitizedText !== filteredText) {
        toast.error('Сообщение содержит недопустимые слова и было отфильтровано')
      }
      
      const sanitizedCode = code ? sanitizeString(code) : undefined
      
      // Формируем контент сообщения
      let content = filteredText
      if (sanitizedCode) {
        content = `\`\`\`${codeLang || 'text'}\n${sanitizedCode}\n\`\`\``
        if (filteredText) {
          content = `${filteredText}\n\n${content}`
        }
      }
      
      // Если есть файл из fileInputRef, отправляем его
      let file: File | undefined = undefined
      if (fileInputRef.current?.files?.[0]) {
        file = fileInputRef.current.files[0]
      }

      const response = await apiClient.sendPrivateMessage(selectedUserId, content, file)
      
      if (response.success) {
        await trackMessageSent()
        // Обновляем сообщения
        await loadMessages(selectedUserId)
        if (!imageUrl && !code) {
          toast.success('✅ Сообщение отправлено')
        }
        // Очищаем input файла
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        throw new Error(response.error || 'Ошибка отправки сообщения')
      }
    } catch (error: any) {
      console.error('Error sending message:', error)
      toast.error(`Ошибка отправки: ${error.message || 'Неизвестная ошибка'}`)
    }
  }

  const handleSend = async () => {
    if ((!input.trim() && !codeInput.trim()) || !user || !selectedUserId || !selectedUser) {
      return
    }

    const messageText = input.trim()
    const code = codeInput.trim()
    const codeLang = codeLanguage
    
    setInput('')
    setCodeInput('')
    setShowCodeInput(false)
    setCodeLanguage('text')
    
    await sendMessage(messageText, undefined, code || undefined, codeLang !== 'text' ? codeLang : undefined)
  }

  const handleSendCode = async () => {
    if (!codeInput.trim() || !user || !selectedUserId || !selectedUser) {
      return
    }

    const code = codeInput.trim()
    const codeLang = codeLanguage
    
    setCodeInput('')
    setShowCodeInput(false)
    setCodeLanguage('text')
    
    await sendMessage('', undefined, code, codeLang)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-20 max-w-6xl min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="inline-block">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
        </Link>
        
        <Dialog open={showUserSelect} onOpenChange={setShowUserSelect}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Выбрать пользователя
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Выберите пользователя для чата</DialogTitle>
              <DialogDescription>
                Выберите из подписок или найдите нового пользователя
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Поиск по никнейму..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchUsers()
                      }
                    }}
                  />
                  <Button onClick={handleSearchUsers} disabled={searching || !searchQuery.trim()}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    <p className="text-sm font-semibold">Результаты поиска:</p>
                    {searchResults.map((result) => (
                      <div
                        key={result.uid}
                        onClick={() => handleSelectUser(result)}
                        className="p-2 rounded-lg border hover:bg-accent cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold">{result.nickname}</p>
                          <p className="text-xs text-muted-foreground">{result.email}</p>
                        </div>
                        <UserPlus className="h-4 w-4" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {following.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Мои подписки:</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {following.map((followedUser) => (
                      <div
                        key={followedUser.uid}
                        onClick={() => handleSelectUser(followedUser)}
                        className={`p-2 rounded-lg border cursor-pointer flex items-center justify-between ${
                          selectedUserId === followedUser.uid ? 'bg-primary/10 border-primary' : 'hover:bg-accent'
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{followedUser.nickname}</p>
                          <p className="text-xs text-muted-foreground">{followedUser.email}</p>
                        </div>
                        {selectedUserId === followedUser.uid && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="h-[calc(100vh-200px)] sm:h-[700px] max-h-[800px] flex flex-col shadow-lg">
        <CardHeader className="flex-shrink-0">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'private' | 'global' | 'groups')}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="private">Личные сообщения</TabsTrigger>
              <TabsTrigger value="global">Глобальный чат</TabsTrigger>
              <TabsTrigger value="groups">Группы</TabsTrigger>
            </TabsList>
            <TabsContent value="global" className="mt-0">
              <GlobalChat user={user} userRole={userRole} />
            </TabsContent>
            <TabsContent value="groups" className="mt-0">
              <div className="flex flex-col h-[550px] sm:h-[650px] items-center justify-center text-center p-8">
                <div className="text-6xl mb-4">🚧</div>
                <h3 className="text-xl font-semibold mb-2">Группы в разработке</h3>
                <p className="text-muted-foreground">
                  Скоро вы сможете создавать группы и общаться с несколькими пользователями одновременно
                </p>
              </div>
            </TabsContent>
            <TabsContent value="private" className="mt-0">
              <div className="flex flex-col h-[calc(100vh-250px)] sm:h-[650px] max-h-[700px]">
                <CardTitle className="flex items-center gap-2 mb-4">
                  <MessageCircle className="h-5 w-5" />
                  {selectedUser ? `Чат с ${selectedUser.nickname}` : 'Выберите пользователя для чата'}
                </CardTitle>
                <div className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 overscroll-contain" style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}>
            {!selectedUserId ? (
              <div className="text-center text-muted-foreground py-8">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Выберите пользователя для начала чата</p>
                <p className="text-sm mt-2">Нажмите кнопку &quot;Выбрать пользователя&quot; выше</p>
              </div>
            ) : loading ? (
              <div className="text-center text-muted-foreground py-8">
                <p>Загрузка сообщений...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>Начните общение с {selectedUser?.nickname}</p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  const isUser = message.senderId === getUserId()
                  const senderId = message.senderId
                  const senderAvatar = senderId === getUserId() 
                    ? (((user as any)?.photoURL || (user as any)?.avatar) || '/default-avatar.png')
                    : (selectedUser?.avatar || '/default-avatar.png')
                  
                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isUser={isUser}
                      senderAvatar={senderAvatar}
                      senderNickname={isUser ? undefined : selectedUser?.nickname}
                      onAvatarClick={() => {
                        if (isUser) {
                          router.push('/profile')
                        } else {
                          router.push(`/users/${senderId}`)
                        }
                      }}
                    />
                  )
                })}
              </>
            )}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="p-4 border-t border-border flex-shrink-0 space-y-2">
            {imagePreview && (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="max-w-[200px] max-h-[200px] rounded-lg" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={() => {
                    setImagePreview(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            {showCodeInput && (
              <div className="space-y-2 p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-2">
                  <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Язык" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Текст</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                      <SelectItem value="csharp">C#</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="css">CSS</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowCodeInput(false)
                      setCodeInput('')
                      setCodeLanguage('text')
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="Введите код..."
                  className="font-mono text-sm min-h-[100px]"
                />
                <Button
                  onClick={handleSendCode}
                  size="sm"
                  disabled={!codeInput.trim() || !selectedUserId}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Отправить код
                </Button>
              </div>
            )}
            <div className="flex gap-2 sm:gap-3">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || !selectedUserId || uploadingImage}
                className="flex-shrink-0 h-10 w-10 sm:h-11 sm:w-11 hover:scale-105 active:scale-95 transition-transform"
                title="Отправить изображение"
              >
                <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowCodeInput(!showCodeInput)}
                disabled={loading || !selectedUserId}
                className="flex-shrink-0 h-10 w-10 sm:h-11 sm:w-11 hover:scale-105 active:scale-95 transition-transform"
                title="Отправить код"
              >
                <Code className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder={selectedUserId ? "Введите сообщение..." : "Выберите пользователя..."}
                disabled={loading || !selectedUserId || uploadingImage}
                className="min-h-[50px] sm:min-h-[60px] max-h-[120px] resize-none flex-1 text-sm sm:text-base"
                rows={2}
              />
              <Button 
                onClick={handleSend} 
                size="icon" 
                disabled={loading || (!input.trim() && !imagePreview) || !selectedUserId || uploadingImage} 
                className="self-end flex-shrink-0 h-10 w-10 sm:h-11 sm:w-11 hover:scale-105 active:scale-95 transition-transform"
              >
                {uploadingImage ? (
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
            </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  )
}
