import { Folder } from "lucide-react";

function EmptyState() {
  return (
    <div className="empty-state">
      <Folder strokeWidth={1.4} aria-hidden="true" />
      <p>
        В этой папке пока нет заметок.
        <br />
        Нажмите «+», чтобы создать первую.
      </p>
    </div>
  );
}

export default EmptyState;
