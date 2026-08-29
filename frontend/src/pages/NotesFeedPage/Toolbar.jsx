import { SearchIcon, SortIcon } from "./icons";

function Toolbar({ searchQuery, onSearchChange }) {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <div className="search-box">
          <SearchIcon />
          <input
            type="text"
            placeholder="Поиск заметок…"
            value={searchQuery}
            onChange={onSearchChange}
          />
        </div>
      </div>
      <div className="toolbar-right">
        <button className="filter-pill" onClick={() => console.log("Sort")}>
          <SortIcon />
          Сортировка
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
