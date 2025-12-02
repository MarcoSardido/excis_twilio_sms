import { useEffect, useMemo, useState, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getTwilioMessages } from "../../js/getTwilioMessages"
import { useAuthentication } from "../../context/AuthenticationProvider"
import { getTwilioPhoneNumbers } from "../../js/getTwilioPhoneNumbers"
import { sendTwilioMessage } from "../../js/sendTwilioMessage"
import { LoadingOutlined } from "@ant-design/icons"
import { ErrorLabel } from "../ErrorLabel/ErrorLabel"

const sortChronologically = list => [...list].sort((a, b) => Date.parse(a.date) - Date.parse(b.date))

const groupMessagesByTimestamp = pairs => sortChronologically(pairs.flat())

export const ConversationPage = () => {
  const { from: fromParam, to: toParam } = useParams()
  const navigate = useNavigate()
  const [authentication] = useAuthentication()
  const from = fromParam ? decodeURIComponent(fromParam) : ""
  const to = toParam ? decodeURIComponent(toParam) : ""
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState("")
  const [conversationError, setConversationError] = useState(null)
  const [sending, setSending] = useState(false)
  const [phoneNumbers, setPhoneNumbers] = useState([])
  const [loadingNumbers, setLoadingNumbers] = useState(true)
  const [phoneError, setPhoneError] = useState(null)
  const [toast, setToast] = useState(null)

  const loadMessages = useCallback(() => {
    if (!from || !to) return

    setLoading(true)
    setConversationError(null)
    Promise.all([getTwilioMessages(from, to), getTwilioMessages(to, from)])
      .then(groupMessagesByTimestamp)
      .then(setMessages)
      .catch(setConversationError)
      .finally(() => setLoading(false))
  }, [from, to])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  const participantLabel = useMemo(() => `${from} ⇄ ${to}`, [from, to])

  useEffect(() => {
    getTwilioPhoneNumbers()
      .then(setPhoneNumbers)
      .catch(setPhoneError)
      .finally(() => setLoadingNumbers(false))
  }, [])

  const twilioNumber = useMemo(() => {
    if (!phoneNumbers.length) return ""
    if (phoneNumbers.includes(from)) return from
    if (phoneNumbers.includes(to)) return to
    return ""
  }, [phoneNumbers, from, to])

  const recipientNumber = useMemo(() => {
    if (!twilioNumber) return ""
    return twilioNumber === from ? to : from
  }, [twilioNumber, from, to])

  const handleRetry = message => {
    if (!message) return
    navigate(`/send/${encodeURIComponent(message.from)}/${encodeURIComponent(message.to)}`, {
      state: { retryMessage: message },
    })
  }

  const draftIsValid = draft.trim().length > 0 && draft.trim().length <= 500
  const canSend = draftIsValid && !!twilioNumber && !!recipientNumber && !sending && !loadingNumbers

  const composerHint = useMemo(() => {
    if (twilioNumber && recipientNumber) {
      return `Message ${recipientNumber} from ${twilioNumber}`
    }
    return "Unable to send message for this conversation"
  }, [twilioNumber, recipientNumber])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(timer)
  }, [toast])

  const handleSend = async () => {
    if (!canSend) return
    setSending(true)
    const trimmedDraft = draft.trim()
    const tempMessage = {
      messageSid: `temp-${Date.now()}`,
      direction: "sent",
      from: twilioNumber,
      to: recipientNumber,
      date: new Date().toISOString(),
      status: "sending",
      body: trimmedDraft,
      media: 0,
      hasMedia: false,
    }
    setMessages(prev => sortChronologically([...prev, tempMessage]))
    setDraft("")
    try {
      await sendTwilioMessage(authentication, recipientNumber, twilioNumber, trimmedDraft)
      loadMessages()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to send message"
      setMessages(prev =>
        prev.map(msg => (msg.messageSid === tempMessage.messageSid ? { ...msg, status: "failed" } : msg)),
      )
      setToast({
        id: Date.now(),
        message: errorMessage,
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-full flex-col text-gray-900">
      {toast && (
        <div className="pointer-events-none fixed right-6 top-6 z-50">
          <div className="flex items-start gap-3 rounded-xl bg-red-500 px-4 py-3 text-white shadow-lg">
            <span className="text-lg font-bold">!</span>
            <div className="text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide">Send failed</p>
              <p>{toast.message}</p>
            </div>
          </div>
        </div>
      )}
      <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e3e8ff] text-lg font-semibold uppercase text-[#1d3ab7]">
          {from?.substring(0, 2) || "?"}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{from || "Conversation"}</p>
          <p className="text-xs text-gray-500">{participantLabel}</p>
        </div>
      </header>

      {conversationError && (
        <div className="border-b border-red-100 bg-red-50 px-6 py-3">
          <ErrorLabel error={conversationError} />
        </div>
      )}
      <div className="flex-1 overflow-y-auto bg-[#f4f6fb] px-6 py-6">
        {conversationError ? (
          <div className="text-sm text-gray-500">Please try again.</div>
        ) : loading ? (
          <div className="flex h-full items-center justify-center text-base text-gray-500">
            <LoadingOutlined className="text-2xl text-[#1877f2]" spin />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-sm text-gray-500">No messages found between these contacts yet.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map(message => {
              const isSent = message.direction === "sent"
              const statusLabel =
                message.status === "failed" ? "Not Delivered" : message.status === "undelivered" ? "sent" : message.status
              const showFailed = message.status === "failed"

              return (
                <div key={message.messageSid} className={`flex flex-col ${isSent ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm ${
                      isSent ? "bg-[#1877f2] text-white" : "bg-white text-gray-900 border border-gray-100"
                    }`}
                  >
                    <p>{message.body || (message.hasMedia ? "This message contains media." : "No content")}</p>
                    <span className={`mt-1 block text-[0.65rem] ${isSent ? "text-blue-100" : "text-gray-400"}`}>
                      {new Date(message.date).toLocaleString()}
                    </span>
                  </div>
                  {statusLabel && (
                    <div
                      className={`mt-1 flex items-center gap-1 text-[0.7rem] ${
                        showFailed ? "text-red-500 font-semibold" : "text-gray-400"
                      }`}
                    >
                      <span>{statusLabel}</span>
                      {showFailed && (
                        <>
                          <span
                            title="Message not delivered"
                            className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[0.6rem] text-white"
                          >
                            !
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRetry(message)}
                            className="ml-1 rounded-full border-0 bg-white px-3 py-1 text-xs font-semibold text-[#1877f2] shadow-sm transition hover:bg-[#eef2ff] focus:outline-none focus:ring-2 focus:ring-[#c7dcff]"
                          >
                            Retry
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 bg-white px-6 py-4 shadow-inner">
        <div className="flex gap-3">
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder={composerHint}
            disabled={sending || loadingNumbers || !twilioNumber || !recipientNumber}
            className="flex-1 rounded-full border border-gray-200 bg-[#f7f8fc] px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[#1877f2] focus:outline-none focus:ring-2 focus:ring-[#c7dcff] disabled:cursor-not-allowed disabled:text-gray-500"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className={`rounded-full px-6 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-[#c7dcff] focus:ring-offset-1 border-0 shadow-sm ${
              canSend ? "bg-[#1877f2] hover:bg-[#0f62d7]" : "bg-gray-300 cursor-not-allowed text-gray-600"
            }`}
          >
            {sending ? <LoadingOutlined spin /> : "Send"}
          </button>
        </div>
        {!twilioNumber && !loadingNumbers && (
          <p className="mt-3 text-xs text-amber-600">
            None of the phone numbers in this conversation belongs to your Twilio account, so sending is disabled.
          </p>
        )}
        {phoneError && (
          <div className="mt-3">
            <ErrorLabel error={phoneError} />
          </div>
        )}
      </div>
    </div>
  )
}
