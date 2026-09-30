import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function CollapsibleSection({
  className = "",
  title,
  count,
  defaultOpen = true,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div className={`${className} collapsible-section${open ? "" : " is-collapsed"}`}>
      <h3 className="section-heading">
        <button
          type="button"
          className="section-toggle"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen((v) => !v)}
        >
          <span>{title}</span>
          {count !== undefined && <span className="comments-count">{count}</span>}
          <ChevronDown className="section-toggle-chevron" strokeWidth={2} aria-hidden="true" />
        </button>
      </h3>
      <div id={contentId} className="collapsible-body" role="region">
        <div className="collapsible-inner">
          <div className="collapsible-content">{children}</div>
        </div>
      </div>
    </div>
  );
}
