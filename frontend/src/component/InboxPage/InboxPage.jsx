import { Outlet, useLocation } from "react-router-dom";
import { ChatLayout } from "../components/chatLayout/ChatLayout";
import { ConversationList } from "../components/chatLayout/ConversationList";
import { ConversationPlaceholder } from "../components/ConversationPlaceholder";

export const InboxPage = () => {
  const location = useLocation();

  const isViewingConversation = location.pathname.startsWith("/conversation");

  return (
    <ChatLayout
      left={<ConversationList />}
      right={isViewingConversation ? <Outlet /> : <ConversationPlaceholder />}
    />
  );
};
