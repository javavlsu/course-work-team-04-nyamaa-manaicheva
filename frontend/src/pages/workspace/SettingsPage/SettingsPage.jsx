import { useLayoutEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { useAuth } from "@/context/AuthContext.jsx";
import useTheme from "./hooks/useTheme";
import useModules from "./hooks/useModules";
import useExport from "./hooks/useExport";
import useSync from "./hooks/useSync";
import ModulesSection from "./components/ModulesSection";
import ThemeSection from "./components/ThemeSection";
import DataSection from "./components/DataSection";
import PasswordSection from "./components/PasswordSection";
import ProfileSection, { roleLabel } from "./components/ProfileSection";
import ProfileCard from "./ProfileCard";
import "./SettingsPage.css";

export function SettingsPage() {
  const { setSidebarProps } = useOutletContext();
  const { currentUser } = useAuth();
  const theme = useTheme();
  const modules = useModules();
  const exportData = useExport();
  const sync = useSync();
  const [editing, setEditing] = useState(false);

  useLayoutEffect(() => {
    setSidebarProps({ active: "settings", modules: modules.modules });
  }, [setSidebarProps, modules.modules]);

  const initials = currentUser
    ? `${(currentUser.name?.[0] || "").toUpperCase()}${(currentUser.surname?.[0] || "").toUpperCase()}`
    : "?";
  const fullName = currentUser
    ? `${currentUser.name} ${currentUser.surname}`
    : "";

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-title">Настройки</span>
        </div>
      </div>
      <div className="settings-content">
          {editing ? (
            <ProfileSection onBack={() => setEditing(false)} />
          ) : (
            <>
              <ProfileCard
                initials={initials}
                name={fullName}
                role={currentUser ? roleLabel(currentUser.role) : ""}
                onEdit={() => setEditing(true)}
              />
              <ModulesSection modules={modules.modules} onToggle={modules.toggle} />
              <ThemeSection dark={theme.dark} onToggle={theme.toggle} />
              <PasswordSection />
              <DataSection sync={sync} exportData={exportData} />
            </>
          )}
      </div>
    </>
  );
}