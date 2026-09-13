import { useEffect, useRef, useState } from "react";
import { ArrowUpDown, ChevronDown, Search } from "lucide-react";

const SORT_OPTIONS = [
  { label: "По дате создания", sortBy: "createDate", order: "desc" },
  { label: "По названию А–Я", sortBy: "title", order: "asc" },
  { label: "По названию Я–А", sortBy: "title", order: "desc" },
];

function Toolbar({ searchQuery, onSearchChange, sort, onSortChange, sortDisabled = false }) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortWrapRef = useRef(null);

  useEffect(() => {
    if (!sortOpen) return;
    const handleOutside = (e) => {
      if (sortWrapRef.current && !sortWrapRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [sortOpen]);

  const currentSort =
    SORT_OPTIONS.find(
      (option) => option.sortBy === sort.sortBy && option.order === sort.order
    ) ?? SORT_OPTIONS[0];

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
        <div className="sort-wrap" ref={sortWrapRef}>
          <button
            className="filter-pill sort-pill"
            disabled={sortDisabled}
            title={sortDisabled ? "Сортировка недоступна в папках" : "Сортировка"}
            onClick={() => setSortOpen((prev) => !prev)}
          >
            <ArrowUpDown strokeWidth={1.6} aria-hidden="true" />
            {currentSort.label}
            <ChevronDown strokeWidth={1.6} className="sort-chevron" aria-hidden="true" />
          </button>
          {sortOpen && (
            <div className="sort-dropdown">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  className="sort-option"
                  onClick={() => {
                    onSortChange({ sortBy: option.sortBy, order: option.order });
                    setSortOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Toolbar;