import { useCallback } from "react";

function getLineRange(text, pos) {
  let start = pos;
  while (start > 0 && text[start - 1] !== "\n") start--;
  let end = pos;
  while (end < text.length && text[end] !== "\n") end++;
  return { start, end };
}

function toggleInline(textarea, before, after, setContent) {
  const el = textarea;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const text = el.value;
  const selected = text.slice(start, end);

  const openBefore = text.slice(Math.max(0, start - before.length), start);
  const closeAfter = text.slice(end, end + after.length);

  if (openBefore === before && closeAfter === after) {
    const newText = text.slice(0, start - before.length) + selected + text.slice(end + after.length);
    setContent(newText);
    requestAnimationFrame(() => {
      el.selectionStart = start - before.length;
      el.selectionEnd = end - before.length;
      el.focus();
    });
  } else {
    const newText = text.slice(0, start) + before + selected + after + text.slice(end);
    setContent(newText);
    requestAnimationFrame(() => {
      el.selectionStart = start + before.length;
      el.selectionEnd = end + before.length;
      el.focus();
    });
  }
}

function applyHeading(textarea, level, setContent) {
  const el = textarea;
  const text = el.value;
  const pos = el.selectionStart;
  const { start } = getLineRange(text, pos);
  const lineText = text.slice(start, el.selectionEnd > pos ? getLineRange(text, el.selectionEnd).end : getLineRange(text, pos).end);
  const lineEnd = start + lineText.length;

  const headingMatch = lineText.match(/^(#{1,6})\s/);
  const currentLevel = headingMatch ? headingMatch[1].length : 0;

  let newText;
  let cursorOffset;

  if (currentLevel === level) {
    newText = text.slice(0, start) + lineText.replace(/^#{1,6}\s/, "") + text.slice(lineEnd);
    cursorOffset = -(level + 1);
  } else if (currentLevel > 0) {
    const replacement = "#".repeat(level) + " " + lineText.replace(/^#{1,6}\s/, "");
    newText = text.slice(0, start) + replacement + text.slice(lineEnd);
    cursorOffset = level - currentLevel;
  } else {
    newText = text.slice(0, start) + "#".repeat(level) + " " + lineText + text.slice(lineEnd);
    cursorOffset = level + 1;
  }

  setContent(newText);
  requestAnimationFrame(() => {
    const newPos = Math.max(0, pos + cursorOffset);
    el.selectionStart = newPos;
    el.selectionEnd = newPos;
    el.focus();
  });
}

function applyListPrefix(textarea, prefix, setContent) {
  const el = textarea;
  const text = el.value;
  const start = el.selectionStart;
  const end = el.selectionEnd;

  const lineStart = text.lastIndexOf("\n", start - 1) + 1;
  let lineEnd = text.indexOf("\n", end);
  if (lineEnd === -1) lineEnd = text.length;

  const selectedLines = text.slice(lineStart, lineEnd).split("\n");
  const bulletPrefix = /^(\s*)[-*+]\s/;
  const numberPrefix = /^(\s*)\d+\.\s/;
  const taskPrefix = /^(\s*)[-*+]\s\[[ x]\]\s/;

  const isTask = prefix.startsWith("- [");
  const isNumbered = prefix === "1. ";

  const stripPrefix = (line) => {
    if (taskPrefix.test(line)) return line.replace(taskPrefix, "$1");
    if (numberPrefix.test(line)) return line.replace(numberPrefix, "$1");
    if (bulletPrefix.test(line)) return line.replace(bulletPrefix, "$1");
    return line;
  };

  const hasMatchingPrefix = (line) => {
    if (isTask) return taskPrefix.test(line);
    if (isNumbered) return numberPrefix.test(line);
    return bulletPrefix.test(line) && !taskPrefix.test(line);
  };

  const allMatch = selectedLines.every((line) => {
    if (line.trim() === "") return true;
    return hasMatchingPrefix(line);
  });

  const processedLines = selectedLines.map((line) => {
    if (allMatch) {
      if (line.trim() === "") return line;
      return stripPrefix(line);
    }
    const stripped = stripPrefix(line);
    if (isTask) {
      const indent = (line.match(/^(\s*)/)[1]);
      return indent + "- [ ] " + stripped;
    }
    if (isNumbered) {
      const indent = (line.match(/^(\s*)/)[1]);
      return indent + prefix + stripped;
    }
    const indent = (line.match(/^(\s*)/)[1]);
    return indent + prefix + stripped;
  });

  const newText = text.slice(0, lineStart) + processedLines.join("\n") + text.slice(lineEnd);
  setContent(newText);
  requestAnimationFrame(() => {
    el.selectionStart = lineStart;
    el.selectionEnd = lineStart + processedLines.join("\n").length;
    el.focus();
  });
}

function insertLink(textarea, url, label, setContent) {
  const el = textarea;
  const text = el.value;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const selected = text.slice(start, end);

  const displayText = label || selected || url;
  const linkMd = label || selected ? `[${displayText}](${url})` : url;
  const newText = text.slice(0, start) + linkMd + text.slice(end);
  setContent(newText);
  requestAnimationFrame(() => {
    el.selectionStart = start + linkMd.length;
    el.selectionEnd = start + linkMd.length;
    el.focus();
  });
}

function insertTable(textarea, rows, cols, setContent) {
  const el = textarea;
  const text = el.value;
  const pos = el.selectionStart;

  const headers = Array.from({ length: cols }, (_, i) => ` Столбец ${i + 1} `).join("|");
  const separator = Array.from({ length: cols }, () => " --- ").join("|");
  const dataRows = Array.from(
    { length: rows },
    () => Array.from({ length: cols }, () => "  ").join("|"),
  ).join("\n");

  const tableMd = `\n|${headers}|\n|${separator}|\n|${dataRows}|\n`;
  const newText = text.slice(0, pos) + tableMd + text.slice(pos);
  setContent(newText);
  requestAnimationFrame(() => {
    el.selectionStart = pos + tableMd.length;
    el.selectionEnd = pos + tableMd.length;
    el.focus();
  });
}

function clipboardCopy(textarea) {
  const text = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd);
  if (text) navigator.clipboard.writeText(text);
  textarea.focus();
}

function clipboardCut(textarea, setContent) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selected = text.slice(start, end);
  if (selected) {
    navigator.clipboard.writeText(selected);
    const newText = text.slice(0, start) + text.slice(end);
    setContent(newText);
    requestAnimationFrame(() => {
      textarea.selectionStart = start;
      textarea.selectionEnd = start;
      textarea.focus();
    });
  } else {
    textarea.focus();
  }
}

function clipboardPaste(textarea, setContent) {
  navigator.clipboard.readText().then((clipText) => {
    if (!clipText) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = text.slice(0, start) + clipText + text.slice(end);
    setContent(newText);
    requestAnimationFrame(() => {
      textarea.selectionStart = start + clipText.length;
      textarea.selectionEnd = start + clipText.length;
      textarea.focus();
    });
  }).catch(() => {
    textarea.focus();
  });
}

export function useEditorActions(textareaRef, setContent) {
  const bold = useCallback(() => {
    if (!textareaRef.current) return;
    toggleInline(textareaRef.current, "**", "**", setContent);
  }, [textareaRef, setContent]);

  const italic = useCallback(() => {
    if (!textareaRef.current) return;
    toggleInline(textareaRef.current, "*", "*", setContent);
  }, [textareaRef, setContent]);

  const strikethrough = useCallback(() => {
    if (!textareaRef.current) return;
    toggleInline(textareaRef.current, "~~", "~~", setContent);
  }, [textareaRef, setContent]);

  const underline = useCallback(() => {
    if (!textareaRef.current) return;
    toggleInline(textareaRef.current, "<u>", "</u>", setContent);
  }, [textareaRef, setContent]);

  const heading = useCallback((level) => {
    if (!textareaRef.current) return;
    applyHeading(textareaRef.current, level, setContent);
  }, [textareaRef, setContent]);

  const link = useCallback((url, label) => {
    if (!textareaRef.current) return;
    insertLink(textareaRef.current, url, label, setContent);
  }, [textareaRef, setContent]);

  const bulletList = useCallback(() => {
    if (!textareaRef.current) return;
    applyListPrefix(textareaRef.current, "- ", setContent);
  }, [textareaRef, setContent]);

  const numberedList = useCallback(() => {
    if (!textareaRef.current) return;
    applyListPrefix(textareaRef.current, "1. ", setContent);
  }, [textareaRef, setContent]);

  const taskList = useCallback(() => {
    if (!textareaRef.current) return;
    applyListPrefix(textareaRef.current, "- [ ] ", setContent);
  }, [textareaRef, setContent]);

  const table = useCallback((rows, cols) => {
    if (!textareaRef.current) return;
    insertTable(textareaRef.current, rows, cols, setContent);
  }, [textareaRef, setContent]);

  const copy = useCallback(() => {
    if (!textareaRef.current) return;
    clipboardCopy(textareaRef.current);
  }, [textareaRef]);

  const cut = useCallback(() => {
    if (!textareaRef.current) return;
    clipboardCut(textareaRef.current, setContent);
  }, [textareaRef, setContent]);

  const paste = useCallback(() => {
    if (!textareaRef.current) return;
    clipboardPaste(textareaRef.current, setContent);
  }, [textareaRef, setContent]);

  const handleListEnter = useCallback((e) => {
    if (!textareaRef.current) return false;
    const el = textareaRef.current;
    const text = el.value;
    const pos = el.selectionStart;
    const { start: lineStart, end: lineEnd } = getLineRange(text, pos);
    const lineText = text.slice(lineStart, lineEnd);

    const taskMatch = lineText.match(/^(\s*[-*+])\s\[[ x]\]\s(.*)/);
    if (taskMatch) {
      const content = taskMatch[2];
      if (content.trim() === "") {
        const newText = text.slice(0, lineStart) + text.slice(lineEnd);
        setContent(newText);
        requestAnimationFrame(() => {
          el.selectionStart = lineStart;
          el.selectionEnd = lineStart;
          el.focus();
        });
        return true;
      }
      const newLine = `\n${taskMatch[1]}- [ ] `;
      const newText = text.slice(0, pos) + newLine + text.slice(lineEnd);
      setContent(newText);
      requestAnimationFrame(() => {
        const newPos = pos + newLine.length;
        el.selectionStart = newPos;
        el.selectionEnd = newPos;
        el.focus();
      });
      return true;
    }

    const bulletMatch = lineText.match(/^(\s*)[-*+]\s(.*)/);
    if (bulletMatch) {
      const content = bulletMatch[2];
      const indent = bulletMatch[1];
      if (content.trim() === "") {
        const newText = text.slice(0, lineStart) + text.slice(lineEnd);
        setContent(newText);
        requestAnimationFrame(() => {
          el.selectionStart = lineStart;
          el.selectionEnd = lineStart;
          el.focus();
        });
        return true;
      }
      const newLine = `\n${indent}- `;
      const newText = text.slice(0, pos) + newLine + text.slice(lineEnd);
      setContent(newText);
      requestAnimationFrame(() => {
        const newPos = pos + newLine.length;
        el.selectionStart = newPos;
        el.selectionEnd = newPos;
        el.focus();
      });
      return true;
    }

    const numberMatch = lineText.match(/^(\s*)(\d+)\.\s(.*)/);
    if (numberMatch) {
      const indent = numberMatch[1];
      const num = parseInt(numberMatch[2], 10);
      const content = numberMatch[3];
      if (content.trim() === "") {
        const newText = text.slice(0, lineStart) + text.slice(lineEnd);
        setContent(newText);
        requestAnimationFrame(() => {
          el.selectionStart = lineStart;
          el.selectionEnd = lineStart;
          el.focus();
        });
        return true;
      }
      const newLine = `\n${indent}${num + 1}. `;
      const newText = text.slice(0, pos) + newLine + text.slice(lineEnd);
      setContent(newText);
      requestAnimationFrame(() => {
        const newPos = pos + newLine.length;
        el.selectionStart = newPos;
        el.selectionEnd = newPos;
        el.focus();
      });
      return true;
    }

    return false;
  }, [textareaRef, setContent]);

  return {
    bold,
    italic,
    strikethrough,
    underline,
    heading,
    link,
    bulletList,
    numberedList,
    taskList,
    table,
    copy,
    cut,
    paste,
    handleListEnter,
  };
}
