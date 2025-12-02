import { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { Outlet } from "react-router-dom"

import { LogoutOutlined } from "@ant-design/icons"

const EXCIS_LOGOUT_URL = "http://localhost:3001/twilio-sms-web/auth/logout"
const EXCIS_ME_URL = "http://localhost:3001/twilio-sms-web/api/me"

const getDisplayNameFromUser = user => {
  if (!user) return "Excis User"
  return (
    user.id.displayName || "Excis User"
  )
}

const getEmailFromUser = user => {
  if (!user) return ""
  return user.id.username || ""
}

const getInitialsFromName = name => {
  if (!name) return "E"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
}

const ExcisLogo = ({ expanded }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1877f2] via-[#00bcd4] to-[#8e24aa] shadow-md">
        <span className="text-lg font-bold leading-none text-white">E</span>
      </div>
      {expanded && (
        <div className="flex flex-col">
          <span className="text-base font-semibold tracking-tight text-gray-900">Excis</span>
          <span className="text-[0.70rem] font-medium uppercase tracking-[0.18em] text-gray-400">
            Messaging
          </span>
        </div>
      )}
    </div>
  )
}

ExcisLogo.propTypes = {
  expanded: PropTypes.bool.isRequired,
}

export default function ChatLayout({ left, right }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetch(EXCIS_ME_URL, { credentials: "include" })
      .then(res => {
        if (!res.ok) return null
        return res.json()
      })
      .then(data => {
        if (!cancelled) {
          setCurrentUser(data?.user ?? null)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCurrentUser(null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleLogout = () => {
    window.location.href = EXCIS_LOGOUT_URL
  }

  const name = getDisplayNameFromUser(currentUser)
  const email = getEmailFromUser(currentUser)
  const initials = getInitialsFromName(name)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#e4e6eb] text-gray-900">
      <div className="flex h-full w-full gap-3 px-3 py-3">
        {/* LEFT SIDEBAR (Messenger-style, light theme) */}
        <aside
          className={`flex h-full flex-col rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-[width] duration-300 ease-out ${
            isSidebarOpen ? "w-64" : "w-20"
          }`}
        >
          {/* Top brand + toggle */}
          <div className="flex items-center justify-between px-3 pt-4 pb-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(open => !open)}
              className="bg-transparent border-white/10 flex flex-1 gap-3 group hover:bg-white/5 items-center px-1 py-1 rounded-2xl text-left"
            >
              <ExcisLogo expanded={isSidebarOpen} />
            </button>

            {isSidebarOpen && (
              <button
                type="button"
                onClick={() => setIsSidebarOpen(open => !open)}
                className="ml-2 flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-xs text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2d8cff]"
                aria-label="Collapse sidebar"
              >
                <span className="transition-transform duration-200">«</span>
              </button>
            )}
          </div>

          {/* Middle nav items */}
          {/* <nav className="mt-2 flex flex-1 flex-col gap-1 px-2">
            {[
              { id: "chats", icon: "💬", label: "Chats", active: true },
              { id: "contacts", icon: "👥", label: "Contacts", active: false },
              { id: "settings", icon: "⚙️", label: "Settings", active: false },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                className={`flex items-center ${
                  isSidebarOpen ? "justify-between" : "justify-center"
                } gap-3 rounded-xl px-2 py-2 text-sm transition border-0 hover:bg-[#f0f2f5] ${
                  item.active
                    ? "bg-[#f0f2f5] text-[#1877f2]"
                    : "bg-transparent text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${
                      item.active ? "bg-white shadow-sm" : "bg-gray-100"
                    }`}
                  >
                    {item.icon}
                  </div>
                  {isSidebarOpen && (
                    <span className="text-sm font-medium text-gray-900">{item.label}</span>
                  )}
                </div>
                {isSidebarOpen && item.active && (
                  <span className="rounded-full bg-[#1877f2] px-2 text-[0.65rem] font-semibold uppercase tracking-wide text-white">
                    12
                  </span>
                )}
              </button>
            ))}
          </nav> */}

          {/* Bottom user profile */}
          <div className="mt-auto border-t border-gray-100 px-3 pb-4 pt-3">
            <div
              className={`flex items-center ${
                isSidebarOpen ? "justify-between" : "justify-center"
              } gap-3 rounded-2xl bg-gray-50 px-2 py-2 text-sm`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#2d8cff] via-[#00bcd4] to-[#8e24aa] text-xs font-semibold uppercase text-white shadow-sm">
                  {initials}
                </div>
                {isSidebarOpen && (
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-xs font-semibold text-gray-900">{name}</span>
                    {email && (
                      <span className="truncate text-[0.7rem] text-gray-500" title={email}>
                        {email}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {isSidebarOpen && (

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex h-9 w-9 border-0 items-center justify-center rounded-full bg-white text-red-600 shadow-sm transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-[#c7dcff]"
                >
                  <LogoutOutlined />
                </button>


              )}
            </div>
          </div>
        </aside>

        {/* MIDDLE PANEL: Conversations list (card with gaps) */}
        <div className="flex h-full w-[360px] flex-col rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
          {left}
        </div>

        {/* RIGHT PANEL: Active conversation (card with gaps) */}
        <div className="flex h-full flex-1 flex-col rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
          {right ?? <Outlet />}
        </div>
      </div>
    </div>
  )
}

ChatLayout.propTypes = {
  left: PropTypes.node,
  right: PropTypes.node,
}
