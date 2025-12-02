export const ConversationEmptyState = () => (
  <div className="flex h-full flex-col items-center justify-center bg-[#f7f8fc] px-6 text-center text-gray-500">
    <div className="flex h-20 w-20 items-center justify-center rounded-full border border-gray-200 bg-white text-2xl text-[#1877f2] shadow-sm">
      💬
    </div>
    <p className="mt-6 text-lg font-semibold text-gray-900">Select a conversation</p>
    <p className="mt-2 max-w-sm text-sm text-gray-500">
      Choose a contact from the chat list on the left to load the full conversation thread here.
    </p>
  </div>
)
