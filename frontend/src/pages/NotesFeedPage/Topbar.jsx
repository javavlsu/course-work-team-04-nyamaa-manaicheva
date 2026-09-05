function Topbar({ count, pluralRu }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <span className="topbar-title">Все заметки</span>
        <span style={{ fontSize: "14px", color: "var(--muted)", marginLeft: "8px" }}>
          {count} {pluralRu(count)}
        </span>
      </div>
      <div className="topbar-right"></div>
    </div>
  );
}

export default Topbar;
