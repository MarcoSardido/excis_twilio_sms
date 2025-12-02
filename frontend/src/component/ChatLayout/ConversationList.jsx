import { useEffect, useMemo, useState } from "react"
import { useMatch, useNavigate } from "react-router-dom"
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons"
import { getMessages } from "../InboxPage/getMessages"
import { fromNow } from "../../js/util"

const conversationKey = (a, b) => [a, b].sort().join("__")

const buildConversations = messages => {
  const map = new Map()

  messages.forEach(message => {
    const key = conversationKey(message.from, message.to)
    const existing = map.get(key)
    const messageDate = new Date(message.date)

    if (!existing || messageDate > new Date(existing.latest.date)) {
      map.set(key, {
        id: key,
        latest: message,
        participants: [message.from, message.to],
      })
    }
  })

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.latest.date).getTime() - new Date(a.latest.date).getTime(),
  )
}

const messagePreview = message => {
  if (message.body) return message.body
  if (message.media > 0 || message.hasMedia) return "Message contains media"
  return "No message content"
}

const displayName = message => {
  // Fallback to whichever participant sent the last message
  return message.direction === "received" ? message.from : message.to
}

const ALL_NUMBERS_OPTION = "ALL_NUMBERS_OPTION"

export default function ConversationList() {
  const navigate = useNavigate()
  const activeMatch = useMatch("/inbox/:from/:to")
  const activeFrom = activeMatch?.params?.from
  const activeTo = activeMatch?.params?.to
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNumber, setSelectedNumber] = useState(ALL_NUMBERS_OPTION)

  useEffect(() => {
    getMessages()
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setLoading(false))
  }, [])

  const phoneNumberOptions = useMemo(() => {
    const numbers = new Set()
    messages.forEach(message => {
      if (message.from) numbers.add(message.from)
      if (message.to) numbers.add(message.to)
    })
    return Array.from(numbers).sort()
  }, [messages])

  const conversations = useMemo(() => {
    const grouped = buildConversations(messages)
    if (selectedNumber === ALL_NUMBERS_OPTION) {
      return grouped
    }

    return grouped.filter(convo => convo.participants.includes(selectedNumber))
  }, [messages, selectedNumber])

  const selectedKey =
    activeFrom && activeTo ? conversationKey(decodeURIComponent(activeFrom), decodeURIComponent(activeTo)) : null

  const handleConversationClick = ({ latest }) => {
    navigate(`/inbox/${encodeURIComponent(latest.from)}/${encodeURIComponent(latest.to)}`)
  }

  const handleKeyDown = (event, conversation) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handleConversationClick(conversation)
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#f5f6f7]">
      <div className="px-4 pb-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Chats</h2>
          <button
            type="button"
            onClick={() => navigate("/inbox/new")}
            className="bg-white border border-gray-200 flex focus:outline-none focus:ring-2 focus:ring-[#c7dcff] h-9 hover:bg-[#eef2ff] items-center justify-center rounded-full shadow-sm text-[#1b74e4] transition w-9"
            title="New message"
          >
            <PlusOutlined />
          </button>
        </div>
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-gray-500" htmlFor="conversation-filter">
          Phone filter
        </label>
        <select
          id="conversation-filter"
          className="mt-1 w-full rounded-lg border-2 border-[#d0d7e6] bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-[#1b74e4] focus:outline-none"
          value={selectedNumber}
          onChange={e => setSelectedNumber(e.target.value)}
        >
          <option value={ALL_NUMBERS_OPTION}>All phone numbers</option>
          {phoneNumberOptions.map(number => (
            <option key={number} value={number}>
              {number}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-4">
        {loading ? (
          <div className="flex h-full items-center justify-center text-2xl text-blue-500">
            <LoadingOutlined />
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-4 py-8 text-sm text-gray-500">No conversations yet.</div>
        ) : (
          conversations.map(conversation => {
            const { latest } = conversation
            const isActive = selectedKey === conversation.id

            return (
              <div
                role="button"
                tabIndex={0}
                key={conversation.id}
                onClick={() => handleConversationClick(conversation)}
                onKeyDown={event => handleKeyDown(event, conversation)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                  isActive ? "bg-[#e4e6eb]" : "bg-white hover:bg-[#f0f2f5]"
                }`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dfe3ee] text-sm font-semibold uppercase text-gray-700">
                  {displayName(latest)?.substring(0, 2) || "??"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-gray-900">{displayName(latest) || "Unknown"}</span>
                    <span className="text-[0.65rem] uppercase tracking-wide text-gray-400">
                      {fromNow(latest.date)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-1">
                    {messagePreview(latest)}
                  </p>
                  <p className="mt-1 text-[0.7rem] text-gray-400">
                    {latest.from} · {latest.to}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
