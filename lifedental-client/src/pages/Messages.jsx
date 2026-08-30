import { useState, useEffect, useRef } from 'react'
import * as signalR from '@microsoft/signalr'
import api from '../api/axios'
import { PaperAirplaneIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const roleColors = {
  Admin: 'bg-purple-100 text-purple-700',
  Dentist: 'bg-blue-100 text-blue-700',
  Receptionist: 'bg-green-100 text-green-700',
  DentalNurse: 'bg-yellow-100 text-yellow-700',
  DentalHygienist: 'bg-orange-100 text-orange-700',
  Patient: 'bg-gray-100 text-gray-600',
}

export default function Messages() {
  const [users, setUsers] = useState([])
  const [inbox, setInbox] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [search, setSearch] = useState('')
  const [connection, setConnection] = useState(null)
  const messagesEndRef = useRef(null)
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    fetchUsers()
    fetchInbox()
    setupSignalR()

    return () => {
      if (connection) connection.stop()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (selectedUser) fetchConversation(selectedUser.id)
  }, [selectedUser])

  const setupSignalR = async () => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/chat', {
        withCredentials: true
      })
      .withAutomaticReconnect()
      .build()

    conn.on('ReceiveMessage', (message) => {
      setMessages(prev => {
        // Undvik dubletter
        if (prev.some(m => m.id === message.id)) return prev
        return [...prev, message]
      })
      fetchInbox()
    })

    try {
      await conn.start()
      setConnection(conn)
    } catch (err) {
      console.error('SignalR connection failed:', err)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await api.get('/messages/users')
      setUsers(res.data)
    } catch {
      console.error('Could not fetch users')
    }
  }

  const fetchInbox = async () => {
    try {
      const res = await api.get('/messages/inbox')
      setInbox(res.data)
    } catch {
      console.error('Could not fetch inbox')
    }
  }

  const fetchConversation = async (userId) => {
    try {
      const res = await api.get(`/messages/conversation/${userId}`)
      setMessages(res.data)
    } catch {
      console.error('Could not fetch conversation')
    }
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser || !connection) return

    try {
      await connection.invoke('SendMessage', selectedUser.id, newMessage.trim())
      setNewMessage('')
    } catch (err) {
      console.error('Could not send message:', err)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const filteredUsers = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const getInboxUser = (userId) =>
    inbox.find(i => i.userId === userId)

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">

      {/* Left panel — user list */}
      <div className="w-72 bg-white rounded-xl border border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Messages</h2>
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map(u => {
            const inboxEntry = getInboxUser(u.id)
            const isSelected = selectedUser?.id === u.id

            return (
              <div
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition border-b border-gray-50 ${
                  isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="relative">
                  <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {u.firstName?.[0]}{u.lastName?.[0]}
                  </div>
                  {inboxEntry?.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                      {inboxEntry.unreadCount}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {u.firstName} {u.lastName}
                    </p>
                    {inboxEntry && (
                      <p className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(inboxEntry.lastMessageAt).toLocaleTimeString('en-GB', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${roleColors[u.role] ?? 'bg-gray-100 text-gray-500'}`}>
                      {u.role}
                    </span>
                    {inboxEntry && (
                      <p className="text-xs text-gray-400 truncate">{inboxEntry.lastMessage}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right panel — conversation */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col">
        {!selectedUser ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <PaperAirplaneIcon className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm">Select a user to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${roleColors[selectedUser.role] ?? 'bg-gray-100'}`}>
                  {selectedUser.role}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-8">
                  No messages yet. Say hello!
                </div>
              ) : (
                messages.map(m => {
                  const isMe = m.senderId === currentUser.id
                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        {!isMe && (
                          <p className="text-xs text-gray-400 px-1">{m.senderName}</p>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                        }`}>
                          {m.content}
                        </div>
                        <p className="text-xs text-gray-400 px-1">
                          {new Date(m.sentAt).toLocaleTimeString('en-GB', {
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-5 py-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${selectedUser.firstName}...`}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || !connection}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5 px-1">Press Enter to send</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}