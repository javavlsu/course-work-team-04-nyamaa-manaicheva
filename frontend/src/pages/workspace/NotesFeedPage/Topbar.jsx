function Topbar({ title = "Все заметки", count, pluralRu }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <span className="topbar-title">{title}</span>
        {count != null && (
          <span className="topbar-count">
            {count} {pluralRu(count)}
          </span>
        )}
      </div>
      <div className="topbar-right"></div>
    </div>
  );
}

export default Topbar;