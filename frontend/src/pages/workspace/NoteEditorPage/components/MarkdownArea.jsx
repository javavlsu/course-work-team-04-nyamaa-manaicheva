import { forwardRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkdownArea = forwardRef(function MarkdownArea(
  { mode, title, onTitleChange, content, onContentChange, onKeyDown },
  ref,
) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        if (onKeyDown && onKeyDown(e)) {
          return;
        }
      }
      if (e.key === "Tab") {
        e.preventDefault();
        const el = ref?.current;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const newVal = content.slice(0, start) + "  " + content.slice(end);
        onContentChange({ target: { value: newVal } });
        requestAnimationFrame(() => {
          el.selectionStart = start + 2;
          el.selectionEnd = start + 2;
        });
      }
    },
    [onKeyDown, ref, content, onContentChange],
  );

  const handleEditorClick = useCallback(
    (e) => {
      const el = ref?.current;
      if (!el || mode !== "edit") return;

      const rect = el.getBoundingClientRect();
      const styles = getComputedStyle(el);
      const paddingTop = parseFloat(styles.paddingTop) || 0;
      const paddingLeft = parseFloat(styles.paddingLeft) || 0;
      const lineHeight = parseFloat(styles.lineHeight) || 23.8;

      const clickY = e.clientY - rect.top + el.scrollTop - paddingTop;
      const lineIndex = Math.floor(clickY / lineHeight);

      const lines = content.split("\n");
      if (lineIndex < 0 || lineIndex >= lines.length) return;

      const line = lines[lineIndex];
      const taskMatch = line.match(/^(\s*[-*+])\s\[[ x]\]\s/);
      if (!taskMatch) return;

      const checkboxStart = taskMatch[0].length - 4;
      const approxCharW = 7.5;
      const clickX = e.clientX - rect.left + el.scrollLeft - paddingLeft;
      const charX = clickX / approxCharW;

      if (charX < checkboxStart - 1 || charX > checkboxStart + 3) return;

      const isChecked = line.includes("[x]");
      const prefixEnd = taskMatch[0].length;
      const restOfLine = line.slice(prefixEnd);

      const before = content.split("\n").slice(0, lineIndex).join("\n");
      const after = content.split("\n").slice(lineIndex + 1).join("\n");
      const prefixBefore = before ? before + "\n" : "";
      const prefixAfter = after ? "\n" + after : "";

      const newCheckbox = isChecked ? "[ ] " : "[x] ";
      const newLine = taskMatch[1] + " " + newCheckbox + restOfLine;
      const newContent = prefixBefore + newLine + prefixAfter;

      onContentChange({ target: { value: newContent } });
    },
    [ref, mode, content, onContentChange],
  );

  return (
    <>
      <input
        className="editor-title"
        type="text"
        placeholder="Без названия…"
        value={title}
        onChange={onTitleChange}
      />
      {mode === "edit" ? (
        <textarea
          ref={ref}
          className="md-editor"
          placeholder="Начните писать в формате Markdown…"
          spellCheck={false}
          value={content}
          onChange={onContentChange}
          onKeyDown={handleKeyDown}
          onClick={handleEditorClick}
        />
      ) : (
        <div className="md-preview active">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      )}
    </>
  );
});

export default MarkdownArea;
