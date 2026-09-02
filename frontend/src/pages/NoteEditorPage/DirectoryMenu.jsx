import { Folder } from "lucide-react";

/**
 * Небольшое выпадающее меню для управления принадлежностью текущей заметки
 * к директориям. Визуально переиспользует те же CSS-классы, что и PrivacyMenu
 * (.privacy-wrap/.privacy-dropdown/.dropdown-share-list), чтобы не вводить
 * новый визуальный паттерн.
 *
 * Одна заметка может одновременно находиться в нескольких директориях —
 * это обычный список чекбоксов, без взаимного исключения.
 *
 * "Все заметки" сюда не передаётся — вызывающая сторона (NoteEditorPage)
 * отвечает за то, чтобы directories не содержал системный псевдо-пункт "all".
 */
export default function DirectoryMenu({
  open,
  onToggle,
  wrapRef,
  directories,
  memberIds,
  onToggleDirectory,
  updatingDirectoryIds,
  isLoading = false,
}) {
  return (
    <div className="privacy-wrap" ref={wrapRef}>
      <button
        className="btn btn-ghost"
        title="Папки заметки"
        onClick={onToggle}
      >
        <Folder strokeWidth={1.8} />
      </button>
      <div className={open ? "privacy-dropdown open" : "privacy-dropdown"}>
        <h4>
          <Folder strokeWidth={1.8} />
          Папки
        </h4>

        {isLoading && <p className="comments-status">Загрузка папок…</p>}

        {!isLoading && directories.length === 0 && (
          <p className="comments-status">Нет доступных папок</p>
        )}

        {!isLoading && directories.length > 0 && (
          <div className="dropdown-share-list">
            {directories.map((dir) => {
              const checked = memberIds.has(dir.id);
              const busy = updatingDirectoryIds.has(dir.id);
              return (
                <label className="directory-menu-item" key={dir.id}>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={busy}
                    onChange={() => onToggleDirectory(dir)}
                  />
                  <span>{dir.title}</span>
                  {busy && <span className="directory-menu-busy">…</span>}
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
