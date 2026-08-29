import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownArea({
  mode,
  title,
  onTitleChange,
  content,
  onContentChange,
}) {
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
          className="md-editor"
          placeholder="Начните писать в формате Markdown…"
          spellCheck={false}
          value={content}
          onChange={onContentChange}
        />
      ) : (
        <div className="md-preview active">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      )}
    </>
  );
}
