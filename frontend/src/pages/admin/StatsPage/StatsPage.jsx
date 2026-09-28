import { useLayoutEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { ChartNoAxesColumn } from "lucide-react";

import "../../workspace/TrashPage/TrashPage.css";

/**
 * Заглушка: упрощённая статистика (ошибки, число созданных/удалённых пользователей)
 * будет добавлена позже.
 */
export function StatsPage() {
  const { setSidebarProps } = useOutletContext();

  useLayoutEffect(() => {
    setSidebarProps({ active: "stats" });
  }, [setSidebarProps]);

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-title">Статистика</span>
        </div>
      </div>
      <div className="empty-state">
        <ChartNoAxesColumn strokeWidth={1.4} aria-hidden="true" />
        <p>Статистика появится позже.</p>
      </div>
    </>
  );
}
