import { Routes, Route } from "react-router-dom";

import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { RecoverPage } from "./pages/RecoverPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { AccountPage } from "./pages/AccountPage";
import { NotesFeedPage } from "./pages/NotesFeedPage";
import { NoteEditorPage } from "./pages/NoteEditorPage";
import { KanbanBoardPage } from "./pages/KanbanBoardPage";
import { CalendarPage } from "./pages/CalendarPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ForbiddenPage } from "./pages/ForbiddenPage";
import { ServerErrorPage } from "./pages/ServerErrorPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute.jsx";

function App() {
  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/recover" element={<RecoverPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Статичные error-страницы — публичные */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/500" element={<ServerErrorPage />} />
      <Route path="*" element={<NotFoundPage />} />

      {/* Защищённые маршруты */}
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        }
      />
      <Route path="/notes">
        <Route
          index
          element={
            <ProtectedRoute>
              <NotesFeedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path=":id"
          element={
            <ProtectedRoute>
              <NoteEditorPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route
        path="/kanban"
        element={
          <ProtectedRoute>
            <KanbanBoardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
