import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, ImagePlus, MessageCircle, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender_role: 'user' | 'admin'
  content: string
  image_url: string | null
  created_at: string
}

export default function ChatWidget({ open, onClose, initialMessage }: { open: boolean; onClose: () => void; initialMessage?: string }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [convId, setConvId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const initialSent = useRef(false)

  // Get or create conversation
  useEffect(() => {
    if (!open || !user) return

    const init = async () => {
      setLoading(true)
      // Check for existing active conversation
      const { data: existing } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (existing) {
        setConvId(existing.id)
      } else {
        // Create new conversation
        const meta = user.user_metadata || {}
        const { data: created } = await supabase
          .from('chat_conversations')
          .insert({
            user_id: user.id,
            user_name: meta.display_name || meta.full_name || user.email?.split('@')[0] || 'User',
            user_avatar: meta.avatar_url || null,
            user_email: user.email || '',
          })
          .select('id')
          .single()

        if (created) setConvId(created.id)
      }
      setLoading(false)
    }

    init()
  }, [open, user])

  // Fetch messages & subscribe to realtime
  useEffect(() => {
    if (!convId) return

    const fetchMsgs = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true })
      if (data) setMessages(data)
    }

    fetchMsgs()

    const channel = supabase
      .channel(`chat-${convId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${convId}` },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === (payload.new as Message).id)) return prev
            return [...prev, payload.new as Message]
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${convId}` },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== (payload.old as Message).id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [convId])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Auto-send initial message
  useEffect(() => {
    if (initialMessage && convId && !loading && !initialSent.current && user) {
      initialSent.current = true
      sendMessage(initialMessage)
    }
  }, [initialMessage, convId, loading, user])

  const sendMessage = async (content: string, imageUrl?: string) => {
    if ((!content.trim() && !imageUrl) || !convId || !user) return
    setSending(true)
    const { data: newMsg } = await supabase.from('chat_messages').insert({
      conversation_id: convId,
      sender_id: user.id,
      sender_role: 'user',
      content: content.trim(),
      image_url: imageUrl || null,
    }).select().single()
    if (newMsg) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev
        return [...prev, newMsg as Message]
      })
    }
    // Update last_message_at
    await supabase
      .from('chat_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', convId)
    setInput('')
    setSending(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('chat-images').upload(path, file)
    if (!error) {
      const { data: urlData } = supabase.storage.from('chat-images').getPublicUrl(path)
      await sendMessage('', urlData.publicUrl)
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-[calc(100vw-2rem)] md:w-[400px] h-[500px] md:h-[560px] bg-white rounded-2xl shadow-2xl border border-border/50 flex flex-col z-[9999] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary via-primary to-primary-dark px-5 py-4 flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-sm">Chat trực tiếp</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white/70 text-[11px]">Đang trực tuyến</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center cursor-pointer hover:bg-white/25 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </motion.button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm font-semibold text-text-primary">Xin chào! 👋</p>
                <p className="text-xs text-text-muted mt-1">Gửi tin nhắn để bắt đầu cuộc trò chuyện</p>
              </div>
            ) : (
              messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender_role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      msg.sender_role === 'user'
                        ? 'bg-primary text-white rounded-br-md'
                        : 'bg-white text-text-primary border border-border/50 shadow-sm rounded-bl-md'
                    }`}
                  >
                    {msg.sender_role === 'admin' && (
                      <p className="text-[10px] font-semibold text-primary mb-1">Hỗ trợ viên</p>
                    )}
                    {msg.image_url && (
                      <img
                        src={msg.image_url}
                        alt="Chat image"
                        className="rounded-xl mb-2 max-h-48 w-auto cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(msg.image_url!, '_blank')}
                      />
                    )}
                    {msg.content && (
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    )}
                    <p
                      className={`text-[10px] mt-1 ${
                        msg.sender_role === 'user' ? 'text-white/60' : 'text-text-muted'
                      }`}
                    >
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-border/50 bg-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-50 flex-shrink-0"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 text-text-muted animate-spin" />
                ) : (
                  <ImagePlus className="w-4 h-4 text-text-muted" />
                )}
              </motion.button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all border border-transparent focus:border-primary/30"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                disabled={(!input.trim() && !uploading) || sending}
                className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center cursor-pointer disabled:opacity-40 flex-shrink-0 shadow-md shadow-primary/20"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
