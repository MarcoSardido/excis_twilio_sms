import { useState } from "react"

export default function MessageInput({ from, to, onSend }) {
  const [text, setText] = useState("")

  return (
    <div className="p-3 border-t bg-white flex gap-2">
      <input
        className="flex-1 border rounded px-3 py-2"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => {
          onSend(text)
          setText("")
        }}
      >
        Send
      </button>
    </div>
  )
}
