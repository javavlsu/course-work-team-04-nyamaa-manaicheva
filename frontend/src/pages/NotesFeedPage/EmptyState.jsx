function EmptyState() {
  return (
    <div className="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z" />
      </svg>
      <p>
        В этой папке пока нет заметок.
        <br />
        Нажмите «+», чтобы создать первую.
      </p>
    </div>
  );
}

export default EmptyState;
