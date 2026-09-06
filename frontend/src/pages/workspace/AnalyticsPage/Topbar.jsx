const PERIODS = ["Неделя", "Месяц", "Квартал"];

function Topbar({ period, onPeriodChange }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <span className="topbar-title">Аналитика</span>
      </div>
      <div className="topbar-right">
        <div className="period-toggle">
          {PERIODS.map((p) => (
            <button
              key={p}
              className={period === p ? "active" : undefined}
              onClick={() => onPeriodChange(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Topbar;
