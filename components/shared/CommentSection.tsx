'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Heart, Reply, Edit, Trash2, Flag, ThumbsUp, Smile, MoreVertical } from 'lucide-react'
import { useAuth } from '@/components/auth/useAuth'
import { getDb } from '@/lib/firebase/config'
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, increment } from 'firebase/firestore'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Comment {
  id: string
  itemId: string
  itemType: 'blog' | 'project'
  userId: string
  userName: string
  userEmail: string
  text: string
  parentId?: string
  createdAt: any
  editedAt?: any
  likes?: number
  helpful?: number
  reactions?: { [key: string]: number }
}

type SortOption = 'newest' | 'oldest' | 'popular' | 'helpful'

interface CommentSectionProps {
  itemId: string
  itemType: 'blog' | 'project'
}

export default function CommentSection({ itemId, itemType }: CommentSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [reactionMenu, setReactionMenu] = useState<string | null>(null)

  useEffect(() => {
    const commentsQuery = query(
      collection(getDb(), `${itemType}_comments`),
      where('itemId', '==', itemId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[]
      setComments(commentsData)
    })

    return () => unsubscribe()
  }, [itemId, itemType])

  const handleComment = async () => {
    if (!user) {
      toast.error('Войдите, чтобы оставлять комментарии')
      return
    }

    if (!commentText.trim()) {
      toast.error('Введите комментарий')
      return
    }

    try {
      const commentData: any = {
        itemId,
        itemType,
        userId: ('uid' in user ? user.uid : user.id) || '',
        userName: ('displayName' in user ? user.displayName : null) || user.email?.split('@')[0] || 'Аноним',
        userEmail: user.email || '',
        text: commentText.trim(),
        createdAt: serverTimestamp(),
        likes: 0,
        helpful: 0,
        reactions: {},
      }

      if (replyingTo) {
        commentData.parentId = replyingTo
      }

      await addDoc(collection(getDb(), `${itemType}_comments`), commentData)
      setCommentText('')
      setReplyingTo(null)
      toast.success('Комментарий добавлен')
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Ошибка при добавлении комментария')
    }
  }

  const handleEdit = async (commentId: string) => {
    if (!editText.trim()) {
      toast.error('Введите текст')
      return
    }

    try {
      const commentRef = doc(getDb(), `${itemType}_comments`, commentId)
      await updateDoc(commentRef, {
        text: editText.trim(),
        editedAt: serverTimestamp(),
      })
      setEditingId(null)
      setEditText('')
      toast.success('Комментарий отредактирован')
    } catch (error) {
      console.error('Error editing comment:', error)
      toast.error('Ошибка при редактировании')
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Удалить комментарий?')) return

    try {
      await deleteDoc(doc(getDb(), `${itemType}_comments`, commentId))
      toast.success('Комментарий удален')
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Ошибка при удалении')
    }
  }

  const handleLike = async (commentId: string) => {
    if (!user) {
      toast.error('Войдите, чтобы ставить лайки')
      return
    }

    try {
      const commentRef = doc(getDb(), `${itemType}_comments`, commentId)
      await updateDoc(commentRef, {
        likes: increment(1)
      })
    } catch (error) {
      console.error('Error liking comment:', error)
    }
  }

  const handleHelpful = async (commentId: string) => {
    if (!user) {
      toast.error('Войдите, чтобы отмечать комментарии')
      return
    }

    try {
      const commentRef = doc(getDb(), `${itemType}_comments`, commentId)
      await updateDoc(commentRef, {
        helpful: increment(1)
      })
      toast.success('Отмечено как полезное')
    } catch (error) {
      console.error('Error marking helpful:', error)
    }
  }

  const handleReaction = async (commentId: string, emoji: string) => {
    if (!user) return

    try {
      const commentRef = doc(getDb(), `${itemType}_comments`, commentId)
      const comment = comments.find(c => c.id === commentId)
      const currentReactions = comment?.reactions || {}
      const newReactions = {
        ...currentReactions,
        [emoji]: (currentReactions[emoji] || 0) + 1
      }
      await updateDoc(commentRef, {
        reactions: newReactions
      })
      setReactionMenu(null)
    } catch (error) {
      console.error('Error adding reaction:', error)
    }
  }

  const handleReport = async (commentId: string) => {
    if (!user) return

    try {
      await addDoc(collection(getDb(), 'reports'), {
        type: 'comment',
        itemId: commentId,
        userId: ('uid' in user ? user.uid : user.id) || '',
        reason: 'spam',
        createdAt: serverTimestamp(),
      })
      toast.success('Жалоба отправлена')
    } catch (error) {
      console.error('Error reporting comment:', error)
    }
  }

  const sortedComments = [...comments].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0)
      case 'oldest':
        return (a.createdAt?.toDate?.()?.getTime() || 0) - (b.createdAt?.toDate?.()?.getTime() || 0)
      case 'popular':
        return (b.likes || 0) - (a.likes || 0)
      case 'helpful':
        return (b.helpful || 0) - (a.helpful || 0)
      default:
        return 0
    }
  })

  const topLevelComments = sortedComments.filter(c => !c.parentId)
  const getReplies = (parentId: string) => sortedComments.filter(c => c.parentId === parentId)

  const canEdit = (comment: Comment) => {
    if (!user) return false
    const userId = ('uid' in user ? user.uid : user.id) || ''
    if (comment.userId !== userId) return false
    const createdAt = comment.createdAt?.toDate?.()?.getTime() || 0
    const fiveMinutes = 5 * 60 * 1000
    return Date.now() - createdAt < fiveMinutes
  }

  const parseMentions = (text: string) => {
    const mentionRegex = /@(\w+)/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.substring(lastIndex, match.index) })
      }
      parts.push({ type: 'mention', content: match[1] })
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(lastIndex) })
    }

    return parts.length > 0 ? parts : [{ type: 'text', content: text }]
  }

  const reactions = ['👍', '❤️', '😊', '🎉', '🔥']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Комментарии ({comments.length})</h3>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Новые</SelectItem>
            <SelectItem value="oldest">Старые</SelectItem>
            <SelectItem value="popular">Популярные</SelectItem>
            <SelectItem value="helpful">Полезные</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {user ? (
        <div className="space-y-2">
          {replyingTo && (
            <div className="text-sm text-muted-foreground">
              Ответ на: {comments.find(c => c.id === replyingTo)?.userName}
              <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="ml-2">
                Отмена
              </Button>
            </div>
          )}
          <Textarea
            placeholder={replyingTo ? "Ваш ответ..." : "Оставьте комментарий..."}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
          />
          <Button onClick={handleComment} disabled={!commentText.trim()}>
            {replyingTo ? 'Ответить' : 'Отправить'}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">Войдите</Link>, чтобы оставлять комментарии
        </p>
      )}

      <div className="space-y-4">
        {topLevelComments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Пока нет комментариев</p>
        ) : (
          topLevelComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={getReplies(comment.id)}
              user={user}
              itemType={itemType}
              onReply={() => setReplyingTo(comment.id)}
              onEdit={() => {
                setEditingId(comment.id)
                setEditText(comment.text)
              }}
              onDelete={() => handleDelete(comment.id)}
              onLike={() => handleLike(comment.id)}
              onHelpful={() => handleHelpful(comment.id)}
              onReaction={(emoji: string) => handleReaction(comment.id, emoji)}
              onReport={() => handleReport(comment.id)}
              canEdit={canEdit(comment)}
              editingId={editingId}
              editText={editText}
              onEditChange={setEditText}
              onEditSave={() => handleEdit(comment.id)}
              onEditCancel={() => {
                setEditingId(null)
                setEditText('')
              }}
              reactionMenu={reactionMenu}
              onReactionMenuToggle={(id) => setReactionMenu(reactionMenu === id ? null : id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  replies: Comment[]
  user: any
  itemType: 'blog' | 'project'
  onReply: () => void
  onEdit: () => void
  onDelete: () => void
  onLike: () => void
  onHelpful: () => void
  onReaction: (emoji: string) => void
  onReport: () => void
  canEdit: boolean
  editingId: string | null
  editText: string
  onEditChange: (text: string) => void
  onEditSave: () => void
  onEditCancel: () => void
  reactionMenu: string | null
  onReactionMenuToggle: (id: string) => void
}

function CommentItem({
  comment,
  replies,
  user,
  itemType,
  onReply,
  onEdit,
  onDelete,
  onLike,
  onHelpful,
  onReaction,
  onReport,
  canEdit,
  editingId,
  editText,
  onEditChange,
  onEditSave,
  onEditCancel,
  reactionMenu,
  onReactionMenuToggle,
}: CommentItemProps) {
  const parseMentions = (text: string) => {
    const mentionRegex = /@(\w+)/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.substring(lastIndex, match.index) })
      }
      parts.push({ type: 'mention', content: match[1] })
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(lastIndex) })
    }

    return parts.length > 0 ? parts : [{ type: 'text', content: text }]
  }

  const reactions = ['👍', '❤️', '😊', '🎉', '🔥']

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-sm">{comment.userName}</p>
          <p className="text-xs text-muted-foreground">
            {comment.createdAt?.toDate?.()?.toLocaleDateString('ru-RU') || 'Недавно'}
            {comment.editedAt && ' (отредактировано)'}
          </p>
        </div>
        {user && (('uid' in user ? user.uid : user.id) || '') === comment.userId && canEdit && (
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={onEdit} className="h-6 w-6">
              <Edit className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="h-6 w-6">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
        {user && user.uid !== comment.userId && (
          <Button variant="ghost" size="icon" onClick={onReport} className="h-6 w-6" title="Пожаловаться">
            <Flag className="h-3 w-3" />
          </Button>
        )}
      </div>

      {editingId === comment.id ? (
        <div className="space-y-2">
          <Textarea
            value={editText}
            onChange={(e) => onEditChange(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={onEditSave}>Сохранить</Button>
            <Button size="sm" variant="outline" onClick={onEditCancel}>Отмена</Button>
          </div>
        </div>
      ) : (
        <div className="mb-3">
          {parseMentions(comment.text).map((part: any, index: number) => (
            part.type === 'mention' ? (
              <span key={index} className="text-primary font-medium">@{part.content}</span>
            ) : (
              <span key={index}>{part.content}</span>
            )
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <Button variant="ghost" size="sm" onClick={onLike} className="h-6">
          <Heart className="h-3 w-3 mr-1" />
          {comment.likes || 0}
        </Button>
        <Button variant="ghost" size="sm" onClick={onHelpful} className="h-6">
          <ThumbsUp className="h-3 w-3 mr-1" />
          Полезно ({comment.helpful || 0})
        </Button>
        <Button variant="ghost" size="sm" onClick={onReply} className="h-6">
          <Reply className="h-3 w-3 mr-1" />
          Ответить
        </Button>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReactionMenuToggle(comment.id)}
            className="h-6"
          >
            <Smile className="h-3 w-3 mr-1" />
            Реакции
          </Button>
          {reactionMenu === comment.id && (
            <div className="absolute bottom-full left-0 mb-2 bg-background border border-border rounded-md shadow-lg p-2 flex gap-1 z-50">
              {reactions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onReaction(emoji)}
                  className="text-lg hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        {comment.reactions && Object.keys(comment.reactions).length > 0 && (
          <div className="flex gap-1">
            {Object.entries(comment.reactions).map(([emoji, count]: [string, any]) => (
              <span key={emoji} className="text-xs">
                {emoji} {count}
              </span>
            ))}
          </div>
        )}
      </div>

      {replies.length > 0 && (
        <div className="mt-4 ml-4 space-y-3 border-l-2 border-border pl-4">
          {replies.map((reply: Comment) => (
            <div key={reply.id} className="text-sm">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <span className="font-medium">{reply.userName}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {reply.createdAt?.toDate?.()?.toLocaleDateString('ru-RU') || 'Недавно'}
                  </span>
                </div>
              </div>
              <div>
                {parseMentions(reply.text).map((part: any, index: number) => (
                  part.type === 'mention' ? (
                    <span key={index} className="text-primary font-medium">@{part.content}</span>
                  ) : (
                    <span key={index}>{part.content}</span>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

