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
