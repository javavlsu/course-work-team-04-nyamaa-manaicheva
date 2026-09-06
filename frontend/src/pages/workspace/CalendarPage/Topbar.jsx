import { ChevronLeft, ChevronRight } from "lucide-react";

function Topbar() {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="nav-arrows">
          <button id="prev-month">
            <ChevronLeft strokeWidth={2} />
          </button>
          <button id="next-month">
            <ChevronRight strokeWidth={2} />
          </button>
        </div>
        <span className="topbar-title" id="month-label">Август 2026</span>
      </div>
      <div className="topbar-right">
        <button className="btn btn-secondary" id="today-btn">Сегодня</button>
      </div>
    </div>
  );
}

export default Topbar;
