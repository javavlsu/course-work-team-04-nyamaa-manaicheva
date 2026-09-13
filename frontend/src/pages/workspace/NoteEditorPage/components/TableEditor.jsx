import { Plus, X } from "lucide-react";
import "./TableEditor.css";

function TableEditor({ rows, onRowsChange }) {
  const matrix = (Array.isArray(rows) ? rows : []).map((row) =>
    Array.isArray(row) ? row.map((cell) => String(cell ?? "")) : [],
  );
  const cols = matrix.reduce((max, row) => Math.max(max, row.length), 0);

  const setCell = (r, c, value) => {
    onRowsChange(
      matrix.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? value : cell)) : row)),
    );
  };

  const addRow = () => {
    onRowsChange([...matrix, Array.from({ length: cols || 1 }, () => "")]);
  };

  const removeRow = (r) => {
    if (matrix.length <= 1) return;
    onRowsChange(matrix.filter((_, ri) => ri !== r));
  };

  const addColumn = () => {
    onRowsChange(matrix.map((row) => [...row, ""]));
  };

  const removeColumn = (c) => {
    if (cols <= 1) return;
    onRowsChange(matrix.map((row) => row.filter((_, ci) => ci !== c)));
  };

  return (
    <div className="table-editor">
      <div className="table-editor-scroll">
        <table className="table-editor-grid">
          <thead>
            <tr>
              <th className="table-editor-corner" aria-hidden="true" />
              {cols > 0 &&
                matrix[0].map((_, c) => (
                  <th key={c} className="table-editor-col-action">
                    <button
                      type="button"
                      className="table-delete-btn"
                      title="Удалить столбец"
                      disabled={cols <= 1}
                      onClick={() => removeColumn(c)}
                    >
                      <X size={13} strokeWidth={2} />
                    </button>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, r) => (
              <tr key={r}>
                <td className="table-editor-row-action">
                  <button
                    type="button"
                    className="table-delete-btn"
                    title="Удалить строку"
                    disabled={matrix.length <= 1}
                    onClick={() => removeRow(r)}
                  >
                    <X size={13} strokeWidth={2} />
                  </button>
                </td>
                {row.map((cell, c) => (
                  <td key={c}>
                    <input
                      className="table-editor-cell"
                      value={cell}
                      onChange={(e) => setCell(r, c, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-editor-actions">
        <button type="button" className="table-editor-add" onClick={addRow}>
          <Plus size={14} strokeWidth={2} />
          Добавить строку
        </button>
        <button type="button" className="table-editor-add" onClick={addColumn}>
          <Plus size={14} strokeWidth={2} />
          Добавить столбец
        </button>
      </div>
    </div>
  );
}

export default TableEditor;