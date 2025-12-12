'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { User, Upload, X } from 'lucide-react'
import { updateUserProfile, UserProfile } from '@/lib/firebase/users-api'
import { getStorageInstance } from '@/lib/firebase/config'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { validateNickname, validateBio, sanitizeString } from '@/lib/utils/security'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface CompleteProfileModalProps {
  open: boolean
  user: any
  userRole: 'admin' | 'user' | null
  onComplete: () => void
}

export default function CompleteProfileModal({ open, user, userRole, onComplete }: CompleteProfileModalProps) {
  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<{ nickname?: string; bio?: string }>({})

  useEffect(() => {
    if (user && open) {
      setNickname(user.displayName || user.email?.split('@')[0] || '')
      setAvatar(user.photoURL || null)
    }
  }, [user, open])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    const file = e.target.files[0]
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 2MB')
      return
    }
    
    if (!file.type.startsWith('image/')) {
      toast.error('Выберите изображение')
      return
    }
    
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatar(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    // Валидация
    const nicknameValidation = validateNickname(nickname)
    const bioValidation = validateBio(bio)
    
    setErrors({})
    
    if (!nicknameValidation.valid) {
      setErrors({ nickname: nicknameValidation.error })
      return
    }
    
    if (!bioValidation.valid) {
      setErrors({ bio: bioValidation.error })
      return
    }
    
    setSaving(true)
    try {
      let avatarUrl = avatar
      
      // Загружаем аватарку если выбрана новая
      if (avatarFile) {
        setUploading(true)
        const userId = ('uid' in user ? user.uid : user.id) || ''
        if (!userId) return
        const avatarRef = ref(getStorageInstance(), `avatars/${userId}/${Date.now()}_${avatarFile.name}`)
        await uploadBytes(avatarRef, avatarFile)
        avatarUrl = await getDownloadURL(avatarRef)
        setUploading(false)
      }
      
      // Санитизируем данные
      const sanitizedNickname = sanitizeString(nickname.trim())
      const sanitizedBio = bio ? sanitizeString(bio.trim()) : ''
      
      // Создаем профиль
      const profile: Partial<UserProfile> = {
        uid: ('uid' in user ? user.uid : user.id) || '',
        email: user.email || '',
        nickname: sanitizedNickname,
        displayName: sanitizedNickname,
        role: userRole || 'user',
        avatar: avatarUrl || undefined,
        bio: sanitizedBio || undefined,
        achievements: [],
        privacy: {
          showActivity: true,
          showAchievements: true,
          showProfile: true,
        },
        stats: {
          projectsViewed: 0,
          blogPostsRead: 0,
          codeRuns: 0,
          messagesSent: 0,
          loginCount: 0,
        },
      }
      
      const userId = ('uid' in user ? user.uid : user.id) || ''
      if (!userId) return
      await updateUserProfile(userId, profile as UserProfile)
      toast.success('Профиль создан успешно!')
      onComplete()
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Ошибка сохранения профиля')
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  const handleClose = () => {
    // Сохраняем в localStorage, что пользователь закрыл модальное окно
    if (user && typeof window !== 'undefined') {
      const userId = ('uid' in user ? user.uid : user.id) || ''
      if (userId) {
        localStorage.setItem(`profile_complete_modal_closed_${userId}`, 'true')
      }
    }
    onComplete()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Завершите регистрацию</DialogTitle>
          <DialogDescription>
            Заполните обязательные данные для завершения регистрации
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/50">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-primary" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                <Upload className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">Фото (необязательно)</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nickname">
              Никнейм <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value)
                if (errors.nickname) setErrors({ ...errors, nickname: undefined })
              }}
              placeholder="Введите никнейм"
              maxLength={20}
              required
            />
            {errors.nickname && (
              <p className="text-sm text-destructive">{errors.nickname}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Биография</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => {
                setBio(e.target.value)
                if (errors.bio) setErrors({ ...errors, bio: undefined })
              }}
              placeholder="Расскажите о себе..."
              maxLength={500}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {bio.length}/500 символов
            </p>
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio}</p>
            )}
          </div>
          
          <Button
            onClick={handleSave}
            disabled={saving || uploading || !nickname.trim()}
            className="w-full"
          >
            {saving || uploading ? 'Сохранение...' : 'Сохранить и продолжить'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

