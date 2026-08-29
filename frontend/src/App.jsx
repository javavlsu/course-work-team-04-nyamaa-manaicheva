import { Routes, Route } from "react-router-dom";

import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { RecoverPage } from "./pages/RecoverPage";
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/recover" element={<RecoverPage />} />

      <Route path="/account" element={<AccountPage />} />

      <Route path="/notes">
        <Route index element={<NotesFeedPage />} />
        <Route path=":id" element={<NoteEditorPage />} />
      </Route>

      <Route path="/kanban" element={<KanbanBoardPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/settings" element={<SettingsPage />} />

      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/500" element={<ServerErrorPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
