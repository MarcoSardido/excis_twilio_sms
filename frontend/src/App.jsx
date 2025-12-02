import { ProtectedRoute } from "./component/ProtectedRoute/ProtectedRoute";

import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthenticationProvider } from "./context/AuthenticationProvider";
import { ComposerProvider } from "./context/ComposerProvider";
import { UiPage } from "./component/UiPage/UiPage";
import { NotFoundPage } from "./component/NotFoundPage/NotFoundPage";
import { ConversationPage } from "./component/ConversationPage/ConversationPage";
import { NewConversationPage } from "./component/ConversationPage/NewConversationPage";
import { SendPage } from "./component/SendPage/SendPage";
import { MessagePage } from "./component/MessagePage/MessagePage";
import { SentPage } from "./component/SentPage/SentPage";

import ChatLayout from "./component/ChatLayout/ChatLayout";
import ConversationList from "./component/ChatLayout/ConversationList";
import { ConversationEmptyState } from "./component/ConversationPage/ConversationEmptyState";

export const App = () => {
  return (
    <div className="h-full">
      <AuthenticationProvider>
        <ComposerProvider>
          <HashRouter>
            <Routes>

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navigate to="/inbox" replace />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/inbox/*"
                element={
                  <ProtectedRoute>
                    <ChatLayout left={<ConversationList />} />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ConversationEmptyState />} />
                <Route path="new" element={<NewConversationPage />} />
                <Route path=":from/:to" element={<ConversationPage />} />
              </Route>

              <Route
                path="/message/:messageSid"
                element={
                  <ProtectedRoute>
                    <MessagePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/sent/:messageSid"
                element={
                  <ProtectedRoute>
                    <SentPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/send"
                element={
                  <ProtectedRoute>
                    <SendPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/send/:from/:to"
                element={
                  <ProtectedRoute>
                    <SendPage />
                  </ProtectedRoute>
                }
              />

              <Route path="/ui" element={<UiPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </HashRouter>
        </ComposerProvider>
      </AuthenticationProvider>
    </div>
  );
};
