import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, ImagePlus, Trash2, Loader2, RefreshCw, ChevronLeft, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Conversation {
  id: string
  user_id: string
  user_name: string
  user_avatar: string | null
  user_email: string
  status: string
  last_message_at: string
  created_at: string
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender_role: 'user' | 'admin'
  content: string
  image_url: string | null
  created_at: string
}

export default function AdminChatSection() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [msgsLoading, setMsgsLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editMsg, setEditMsg] = useState<{ id: string; content: string } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Fetch all conversations
  const fetchConversations = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('chat_conversations')
      .select('*')
      .order('last_message_at', { ascending: false })
    if (data) setConversations(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchConversations()

    // Subscribe to new conversations
    const channel = supabase
      .channel('admin-conversations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_conversations' },
        () => fetchConversations()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConv) return

    const fetchMsgs = async () => {
      setMsgsLoading(true)
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', selectedConv.id)
        .order('created_at', { ascending: true })
      if (data) setMessages(data)
      setMsgsLoading(false)
    }

    fetchMsgs()

    const channel = supabase
      .channel(`admin-chat-${selectedConv.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${selectedConv.id}` },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === (payload.new as Message).id)) return prev
            return [...prev, payload.new as Message]
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${selectedConv.id}` },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== (payload.old as Message).id))
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${selectedConv.id}` },
        (payload) => {
          setMessages((prev) => prev.map((m) => m.id === (payload.new as Message).id ? (payload.new as Message) : m))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [selectedConv])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const sendMessage = async (content: string, imageUrl?: string) => {
    if ((!content.trim() && !imageUrl) || !selectedConv || !user) return
    setSending(true)
    const { data: newMsg } = await supabase.from('chat_messages').insert({
      conversation_id: selectedConv.id,
      sender_id: user.id,
      sender_role: 'admin',
      content: content.trim(),
      image_url: imageUrl || null,
    }).select().single()
    if (newMsg) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev
        return [...prev, newMsg as Message]
      })
    }
    await supabase
      .from('chat_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', selectedConv.id)
    setInput('')
    setSending(false)
  }

  const deleteMessage = async (msgId: string) => {
    await supabase.from('chat_messages').delete().eq('id', msgId)
    setMessages((prev) => prev.filter((m) => m.id !== msgId))
  }

  const updateMessage = async () => {
    if (!editMsg) return
    await supabase.from('chat_messages').update({ content: editMsg.content }).eq('id', editMsg.id)
    setMessages((prev) => prev.map((m) => m.id === editMsg.id ? { ...m, content: editMsg.content } : m))
    setEditMsg(null)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `admin/${user.id}/${Date.now()}.${ext}`
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

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })

  const filteredConvs = conversations.filter((c) =>
    c.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.user_email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-5 pb-4 border-b border-border/50">
        <h3 className="font-bold text-base flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-500" /> Tin nhắn
          {conversations.length > 0 && (
            <span className="ml-1 text-xs font-semibold bg-blue-500 text-white px-2 py-0.5 rounded-full">{conversations.length}</span>
          )}
        </h3>
        <button onClick={fetchConversations} className="flex items-center gap-1.5 text-primary text-xs font-semibold cursor-pointer hover:underline">
          <RefreshCw className="w-3.5 h-3.5" /> Làm mới
        </button>
      </div>

      <div className="flex" style={{ height: 520 }}>
        {/* Conversation List */}
        <div className={`${selectedConv ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-border/50`}>
          {/* Search */}
          <div className="p-3 border-b border-border/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm người dùng..."
                className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-xl text-sm placeholder:text-text-muted focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <MessageCircle className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-text-muted text-sm">Chưa có tin nhắn nào</p>
              </div>
            ) : (
              filteredConvs.map((conv) => (
                <motion.button
                  key={conv.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedConv(conv)}
                  className={`w-full flex items-center gap-3 p-4 text-left cursor-pointer transition-colors border-b border-border/30 ${
                    selectedConv?.id === conv.id ? 'bg-primary-50 border-l-2 border-l-primary' : 'hover:bg-gray-50'
                  }`}
                >
                  {conv.user_avatar ? (
                    <img src={conv.user_avatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 flex-shrink-0" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {(conv.user_name || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{conv.user_name || 'Người dùng'}</p>
                    <p className="text-text-muted text-[11px] truncate">{conv.user_email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-text-muted">{formatDate(conv.last_message_at)}</p>
                    <p className="text-[10px] text-text-muted">{formatTime(conv.last_message_at)}</p>
                    <span className={`inline-block mt-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                      conv.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {conv.status === 'active' ? '🟢 Active' : '🔴 Closed'}
                    </span>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className={`${selectedConv ? 'flex' : 'hidden md:flex'} flex-col flex-1`}>
          {selectedConv ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-gray-50/50">
                <button onClick={() => setSelectedConv(null)} className="md:hidden w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {selectedConv.user_avatar ? (
                  <img src={selectedConv.user_avatar} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-primary/20" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {(selectedConv.user_name || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-sm">{selectedConv.user_name}</p>
                  <p className="text-text-muted text-[11px]">{selectedConv.user_email}</p>
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
                {msgsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-text-muted text-sm">Chưa có tin nhắn</div>
                ) : (
                  messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender_role === 'admin' ? 'justify-end' : 'justify-start'} group`}
                    >
                      <div className={`relative max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        msg.sender_role === 'admin'
                          ? 'bg-primary text-white rounded-br-md'
                          : 'bg-white text-text-primary border border-border/50 shadow-sm rounded-bl-md'
                      }`}>
                        {msg.sender_role === 'user' && (
                          <p className="text-[10px] font-semibold text-blue-500 mb-1">{selectedConv.user_name}</p>
                        )}
                        {msg.image_url && (
                          <img
                            src={msg.image_url}
                            alt=""
                            className="rounded-xl mb-2 max-h-40 w-auto cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(msg.image_url!, '_blank')}
                          />
                        )}

                        {/* Edit mode */}
                        <AnimatePresence>
                          {editMsg?.id === msg.id ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1">
                              <input
                                autoFocus
                                value={editMsg.content}
                                onChange={(e) => setEditMsg({ ...editMsg, content: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && updateMessage()}
                                className="flex-1 px-2 py-1 rounded text-sm bg-white/20 text-inherit outline-none border border-white/30"
                              />
                              <button onClick={updateMessage} className="text-[10px] px-1.5 py-0.5 bg-white/20 rounded cursor-pointer hover:bg-white/30">✓</button>
                              <button onClick={() => setEditMsg(null)} className="text-[10px] px-1.5 py-0.5 bg-white/20 rounded cursor-pointer hover:bg-white/30">✕</button>
                            </motion.div>
                          ) : (
                            msg.content && <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          )}
                        </AnimatePresence>

                        <p className={`text-[10px] mt-1 ${msg.sender_role === 'admin' ? 'text-white/60' : 'text-text-muted'}`}>
                          {formatTime(msg.created_at)}
                        </p>

                        {/* Action buttons */}
                        <div className="absolute -top-2 right-0 hidden group-hover:flex items-center gap-1 bg-white rounded-lg shadow-md border border-border/50 px-1 py-0.5">
                          <button
                            onClick={() => setEditMsg({ id: msg.id, content: msg.content })}
                            className="p-1 hover:bg-gray-100 rounded cursor-pointer text-text-muted hover:text-blue-500 transition-colors"
                            title="Sửa"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            className="p-1 hover:bg-red-50 rounded cursor-pointer text-text-muted hover:text-red-500 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-3 border-t border-border/50 bg-white">
                <div className="flex items-center gap-2">
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 text-text-muted animate-spin" /> : <ImagePlus className="w-4 h-4 text-text-muted" />}
                  </button>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Trả lời tin nhắn..."
                    className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all border border-transparent focus:border-primary/30"
                  />
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.9 }}
                    disabled={(!input.trim() && !uploading) || sending}
                    className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center cursor-pointer disabled:opacity-40 flex-shrink-0 shadow-md shadow-primary/20"
                  >
                    {sending ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
                  </motion.button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                <MessageCircle className="w-10 h-10 text-blue-400" />
              </div>
              <p className="font-semibold text-text-primary">Chọn cuộc trò chuyện</p>
              <p className="text-text-muted text-sm mt-1">Chọn một cuộc trò chuyện để bắt đầu trả lời</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
