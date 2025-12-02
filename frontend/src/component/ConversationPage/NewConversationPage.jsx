import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { LoadingOutlined } from "@ant-design/icons"
import { getMessages } from "../InboxPage/getMessages"
import { fromNow } from "../../js/util"

const buildConversations = messages => {
  const map = new Map()

  messages.forEach(message => {
    const key = [message.from, message.to].sort().join("__")
    const existing = map.get(key)
    const messageDate = new Date(message.date)

    if (!existing || messageDate > new Date(existing.latest.date)) {
      map.set(key, {
        id: key,
        latest: message,
      })
    }
  })

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.latest.date).getTime() - new Date(a.latest.date).getTime(),
  )
}

export const NewConversationPage = () => {
  const navigate = useNavigate()

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState("")

  useEffect(() => {
    getMessages()
      .then(setMessages)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  const conversationOptions = useMemo(() => buildConversations(messages), [messages])

  const uniquePhoneNumbers = useMemo(() => {
    const set = new Set()

    conversationOptions.forEach(conversation => {
      const { latest } = conversation
      const num = latest.direction === "received" ? latest.to : latest.from
      set.add(num)
    })

    return Array.from(set)
  }, [conversationOptions])

  const uniqueContacts = useMemo(() => {
    const set = new Set();

    conversationOptions.forEach(conversation => {
      const { latest } = conversation;
      const contact =
        latest.direction === "received" ? latest.from : latest.to;

      set.add(contact);
    });

    return Array.from(set); // unique list
  }, [conversationOptions]);

  const [contactInput, setContactInput] = useState("");

  const existingConversation = useMemo(() => {
    if (!selectedPhoneNumber || !contactInput) return null
    const key = [selectedPhoneNumber, contactInput].sort().join("__")
    return conversationOptions.find(convo => convo.id === key) || null
  }, [conversationOptions, selectedPhoneNumber, contactInput])

  useEffect(() => {
    if (!existingConversation) return
    const { latest } = existingConversation
    if (!latest) return
    navigate(`/inbox/${encodeURIComponent(latest.from)}/${encodeURIComponent(latest.to)}`)
  }, [existingConversation, navigate])

  const [draft, setDraft] = useState("")
  const draftIsValid = draft.trim().length > 0 && draft.trim().length <= 500
  const canStartNewChat = !!selectedPhoneNumber && !!contactInput && draftIsValid && !existingConversation && !loading && !error

  const handleStartChat = () => {
    if (!canStartNewChat) return
    navigate(`/send/${encodeURIComponent(selectedPhoneNumber)}/${encodeURIComponent(contactInput)}`)
  }

  return (
    <div className="flex h-full flex-col bg-white text-gray-900">
      <div className="border-b border-gray-200 px-6 py-4 shadow-sm">
        <h2 className="text-lg font-semibold">Start a conversation</h2>
        <p className="text-sm text-gray-500">Choose a contact to jump straight into their thread.</p>

        {/* --- PHONE NUMBER SELECT --- */}
        <div className="mt-4">
          <label className="block text-xs font-semibold uppercase text-gray-500">
            Phone Number
          </label>

          <select
            id="phone-number-selector"
            value={selectedPhoneNumber}
            disabled={loading || !!error}
            onChange={e => setSelectedPhoneNumber(e.target.value)}
            className="mt-1 w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm
              focus:border-[#1b74e4] focus:outline-none disabled:cursor-not-allowed disabled:text-gray-400"
            >
            <option value="">
              {loading ? "Loading phone numbers..." : "Select a phone number"}
            </option>

            {uniquePhoneNumbers.map(phone => (
              <option key={phone} value={phone}>
                {phone}
              </option>
            ))}
          </select>


          {error && (
            <p className="mt-2 text-sm text-red-500">
              Unable to load data. Please try again.
            </p>
          )}
        </div>

        {/* --- CONTACT SELECT --- */}
        <div className="mt-4">
          <label className="block text-xs font-semibold uppercase text-gray-500">
            Contact
          </label>

          <input
            list="contact-options"
            type="text"
            placeholder="Type or select a number"
            value={contactInput}
            disabled={selectedPhoneNumber === ""}
            onChange={(e) => setContactInput(e.target.value)}
            className={`mt-1 w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2
                      text-sm text-gray-900 shadow-sm
                      focus:border-[#1b74e4] focus:outline-none ${selectedPhoneNumber === "" ? "cursor-not-allowed text-gray-400" : ""}`}
          />

          <datalist id="contact-options">
            {uniqueContacts.map((number) => (
              <option key={number} value={number} />
            ))}
          </datalist>

          {error && (
            <p className="mt-2 text-sm text-red-500">
              Unable to load contacts. Please try again.
            </p>
          )}
        </div>
      </div>

      <div className="bg-[#f4f6fb] flex flex-1 justify-center p-4">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <LoadingOutlined spin /> Fetching contacts…
          </div>
        ) : !selectedPhoneNumber || !contactInput ? (
          <p className="text-sm text-gray-500">
            Pick a phone number and contact above to open or start a chat.
          </p>
        ) : existingConversation ? (
          <p className="text-sm text-gray-500">Opening existing conversation…</p>
        ) : (
          <div className="flex w-full flex-col rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex-1 pb-4 text-center text-sm text-gray-400">
              No previous messages between <span className="font-semibold text-gray-700">{selectedPhoneNumber}</span> and{" "}
              <span className="font-semibold text-gray-700">{contactInput}</span>. Start the conversation below.
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex gap-3">
                <input
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  placeholder="Type your message…"
                  className="flex-1 rounded-full border border-gray-200 bg-[#f7f8fc] px-4 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[#1877f2] focus:outline-none focus:ring-2 focus:ring-[#c7dcff]"
                />
                <button
                  type="button"
                  onClick={handleStartChat}
                  disabled={!canStartNewChat}
                  className={`rounded-full px-6 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-[#c7dcff] focus:ring-offset-1 border-0 shadow-sm ${
                    canStartNewChat ? "bg-[#1877f2] hover:bg-[#0f62d7]" : "bg-gray-300 cursor-not-allowed text-gray-600"
                  }`}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
