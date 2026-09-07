import { ArrowUpDown, Search } from "lucide-react";

function Toolbar({ searchQuery, onSearchChange }) {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <div className="search-box">
          <Search strokeWidth={1.6} aria-hidden="true" />
          <input
            type="text"
            placeholder="Поиск заметок…"
            value={searchQuery}
            onChange={onSearchChange}
          />
        </div>
      </div>
      <div className="toolbar-right">
        <button
          className="filter-pill"
          disabled
          title="Сортировка недоступна"
        >
          <ArrowUpDown strokeWidth={1.6} aria-hidden="true" />
          Сортировка
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
