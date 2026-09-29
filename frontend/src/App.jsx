import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

import { HomePage } from "./pages/home/HomePage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { RecoverPage } from "./pages/auth/RecoverPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { AccountPage } from "./pages/workspace/AccountPage";
import { NotesFeedPage } from "./pages/workspace/NotesFeedPage";
import { FavouritesPage } from "./pages/workspace/FavouritesPage";
import { TrashPage } from "./pages/workspace/TrashPage";
import { DirectoriesPage } from "./pages/workspace/DirectoriesPage";
import { NoteEditorPage } from "./pages/workspace/NoteEditorPage";
import { KanbanBoardPage } from "./pages/workspace/KanbanBoardPage";
import { KanbanArchivePage } from "./pages/workspace/KanbanArchivePage";
import { CalendarPage } from "./pages/workspace/CalendarPage";
import { AnalyticsPage } from "./pages/workspace/AnalyticsPage";
import { SettingsPage } from "./pages/workspace/SettingsPage";
import { UsersPage } from "./pages/admin/UsersPage";
import { LogsPage } from "./pages/admin/LogsPage";
import { StatsPage } from "./pages/admin/StatsPage";
import { NotFoundPage } from "./pages/system/NotFoundPage";
import { ForbiddenPage } from "./pages/system/ForbiddenPage";
import { ServerErrorPage } from "./pages/system/ServerErrorPage";
import { AuthLayout } from "./layouts/AuthLayout";
import { WorkspaceLayout } from "./layouts/WorkspaceLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { PublicRoute } from "./routes/PublicRoute";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { useAuth } from "./context/AuthContext.jsx";
import { ROLE_ADMIN, ROLE_CLIENT } from "./lib/utils/roles.js";

function RootGate() {
  const { isAuthenticated, isLoading } = useAuth();
  const { pathname } = useLocation();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated && pathname === "/") {
    return <HomePage />;
  }

  return <Outlet />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootGate />}>
        <Route element={<ProtectedRoute allowedRoles={[ROLE_CLIENT]} />}>
          <Route element={<WorkspaceLayout />}>
            <Route index element={<NotesFeedPage />} />
            <Route path="notes" element={<NotesFeedPage />} />
            <Route path="favourites" element={<FavouritesPage />} />
            <Route path="notes/:id" element={<NoteEditorPage />} />
            <Route path="directories" element={<DirectoriesPage />} />
            <Route path="directories/:folderId" element={<DirectoriesPage />} />
            <Route path="kanban" element={<KanbanBoardPage />} />
            <Route path="kanban/archive" element={<KanbanArchivePage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="trash" element={<TrashPage />} />
          </Route>
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLE_ADMIN]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/users" replace />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="settings" element={<SettingsPage admin />} />
        </Route>
      </Route>

      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/recover" element={<RecoverPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLE_CLIENT]} />}>
        <Route path="/account" element={<AccountPage />} />
      </Route>

      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/500" element={<ServerErrorPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;