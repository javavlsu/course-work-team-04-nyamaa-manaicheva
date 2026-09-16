import { useLayoutEffect, useRef, useState } from "react";
import { Link, useOutletContext, useParams, useSearchParams } from "react-router-dom";

import { useAuth } from "@/context/AuthContext.jsx";
import { refreshNotesCounts } from "@/hooks/useNotesCounts.js";
import EditorTopbar from "./components/EditorTopbar";
import FormatToolbar from "./components/FormatToolbar";
import MarkdownArea from "./components/MarkdownArea";
import TaskListEditor from "./components/TaskListEditor";
import TableEditor from "./components/TableEditor";
import AttachmentsSection from "./components/AttachmentsSection";
import CommentsSection from "./components/CommentsSection";
import LinkModal from "./components/LinkModal";
import TableModal from "./components/TableModal";
import { useNoteDocument } from "./hooks/useNoteDocument";
import { useNoteComments } from "./hooks/useNoteComments";
import { useNoteAttachments } from "./hooks/useNoteAttachments";
import { useNotePermissions } from "./hooks/useNotePermissions";
import { useNoteDirectories } from "./hooks/useNoteDirectories";
import { useEditorActions } from "./hooks/useEditorActions";
import { serializeListContent, serializeTableContent } from "./utils";
import "./NoteEditorPage.css";

// Временное отключение вложений (MinIO-сервис на backend не запущен).
// Чтобы вернуть: поставьте true и включите MinIO на бэкенде (MINIO_ENABLED=true).
const ATTACHMENTS_ENABLED = false;

export function NoteEditorPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const isNew = id === "new";

  const templateParam = searchParams.get("type");
  const templateType =
    templateParam === "List" || templateParam === "Table" ? templateParam : "Empty";

  const { setSidebarProps } = useOutletContext();
  const [mode, setMode] = useState("edit");

  const comments = useNoteComments(id, isNew);
  const attachments = useNoteAttachments(id, isNew);
  const permissions = useNotePermissions(id, isNew, currentUser);
  const directories = useNoteDirectories(id, isNew, currentUser);

  const doc = useNoteDocument(
    id,
    isNew,
    comments.load,
    attachments.load,
    permissions.load,
    directories.load,
    templateType,
  );

  const editorType = isNew ? templateType : doc.noteType || "Empty";

  const textareaRef = useRef(null);

  const actions = useEditorActions(textareaRef, doc.setContent);

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [tableModalOpen, setTableModalOpen] = useState(false);

  const showDirectoryMenu =
    !isNew &&
    doc.ownerId !== null &&
    currentUser?.id === doc.ownerId;

  useLayoutEffect(() => {
    setSidebarProps({ active: "" });
  }, [setSidebarProps]);

  const handleToggleFavorite = async () => {
    await doc.toggleFavorite();
    if (!isNew) {
      refreshNotesCounts();
    }
  };

  if (doc.isLoading) {
    return (
      <div className="editor-loading">
        <div className="editor-loading-spinner" />
        <span>Загрузка заметки…</span>
      </div>
    );
  }

  if (doc.error) {
    return (
      <div className="editor-error">
        <p>{doc.error.message}</p>
        <div className="editor-error-actions">
          {doc.error.type !== "not-found" && (
            <button
              className="btn btn-secondary"
              onClick={() => window.location.reload()}
            >
              Попробовать снова
            </button>
          )}
          <Link to="/notes" className="btn btn-secondary">
            Назад к заметкам
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
        <EditorTopbar
          noteType={editorType}
          mode={mode}
          onModeChange={setMode}
          favorited={doc.favorited}
          onToggleFavorite={handleToggleFavorite}
          privacyOpen={permissions.privacyOpen}
          onTogglePrivacy={permissions.togglePrivacy}
          privacy={permissions.privacy}
          onSelectPrivacy={permissions.selectPrivacy}
          privacyWrapRef={permissions.privacyWrapRef}
          shareUsers={permissions.shareUsers}
          onAddShareUser={permissions.addShareUser}
          onRemoveShareUser={permissions.removeShareUser}
          onExport={doc.export}
          onSave={doc.save}
          isSaving={doc.isSaving}
          justSaved={doc.justSaved}
          onDelete={doc.delete}
          isDeleting={doc.isDeleting}
          deleteDisabled={isNew}
          showDirectoryMenu={showDirectoryMenu}
          directoryMenuOpen={directories.menuOpen}
          onToggleDirectoryMenu={directories.toggleMenu}
          directoryMenuWrapRef={directories.wrapRef}
          directories={directories.list}
          directoryMemberIds={directories.memberIds}
          onToggleNoteDirectory={directories.toggle}
          updatingDirectoryIds={directories.isUpdating}
          directoriesLoading={directories.isLoading}
        />

        {doc.saveError && (
          <div className={`editor-save-banner editor-save-banner-${doc.saveError.type}`}>
            <span>{doc.saveError.message}</span>
            <div className="editor-save-banner-actions">
              {doc.saveError.type === "conflict" && (
                <button className="btn btn-secondary" onClick={doc.reloadAfterConflict}>
                  Загрузить актуальную версию
                </button>
              )}
              <button
                className="editor-save-banner-dismiss"
                onClick={doc.dismissSaveError}
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
        {attachments.error && (
          <div className="editor-save-banner editor-save-banner-generic">
            <span>{attachments.error}</span>
            <div className="editor-save-banner-actions">
              <button
                className="editor-save-banner-dismiss"
                onClick={attachments.dismissError}
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
        {attachments.isUploading && (
          <div className="editor-save-banner">
            <span>Загрузка файла…</span>
          </div>
        )}
        {permissions.error && (
          <div className="editor-save-banner editor-save-banner-generic">
            <span>{permissions.error}</span>
            <div className="editor-save-banner-actions">
              <button
                className="editor-save-banner-dismiss"
                onClick={permissions.dismissError}
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
        {directories.error && (
          <div className="editor-save-banner editor-save-banner-generic">
            <span>{directories.error}</span>
            <div className="editor-save-banner-actions">
              <button
                className="editor-save-banner-dismiss"
                onClick={directories.dismissError}
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
        <div className="editor-content-wrap">
          {mode === "edit" && editorType === "Empty" && (
            <FormatToolbar
              noteType={editorType}
              onBold={actions.bold}
              onItalic={actions.italic}
              onStrikethrough={actions.strikethrough}
              onHeading={actions.heading}
              onLink={() => setLinkModalOpen(true)}
              onBulletList={actions.bulletList}
              onNumberedList={actions.numberedList}
              onTaskList={actions.taskList}
              onTable={() => setTableModalOpen(true)}
              onFileSelect={attachments.upload}
              isUploading={attachments.isUploading}
              uploadDisabled={isNew}
              attachmentsEnabled={ATTACHMENTS_ENABLED}
              onCopy={actions.copy}
              onCut={actions.cut}
              onPaste={actions.paste}
            />
          )}
          <div className="editor-body" data-note-version={doc.version ?? undefined}>
            {editorType === "List" && (
              <>
                <input
                  className="editor-title"
                  type="text"
                  placeholder="Без названия…"
                  value={doc.title}
                  onChange={(e) => doc.setTitle(e.target.value)}
                />
                <TaskListEditor
                  items={doc.content?.items ?? []}
                  onItemsChange={(items) => doc.setContent(serializeListContent(items))}
                />
              </>
            )}
            {editorType === "Table" && (
              <>
                <input
                  className="editor-title"
                  type="text"
                  placeholder="Без названия…"
                  value={doc.title}
                  onChange={(e) => doc.setTitle(e.target.value)}
                />
                <TableEditor
                  rows={doc.content?.rows ?? []}
                  onRowsChange={(rows) => doc.setContent(serializeTableContent(rows))}
                />
              </>
            )}
            {editorType === "Empty" && (
              <MarkdownArea
                ref={textareaRef}
                mode={mode}
                title={doc.title}
                onTitleChange={(e) => doc.setTitle(e.target.value)}
                content={doc.content}
                onContentChange={(e) => doc.setContent(e.target.value)}
                onKeyDown={actions.handleListEnter}
              />
            )}
            <div className="note-dates">
              <span>Создано: {doc.createdAt}</span>
              <span>Изменено: {doc.updatedAt}</span>
            </div>

            {!ATTACHMENTS_ENABLED && !isNew && (
              <p className="comments-status">Вложения временно отключены</p>
            )}

            {!isNew && ATTACHMENTS_ENABLED && attachments.list.length > 0 && (
              <AttachmentsSection
                attachments={attachments.list}
                onDownload={attachments.download}
                onDelete={attachments.remove}
                downloadingId={attachments.downloadingId}
                deletingId={attachments.deletingId}
                downloadError={attachments.downloadError}
              />
            )}

            <CommentsSection
              comments={comments.list}
              draft={comments.draft}
              onDraftChange={comments.onDraftChange}
              onSend={comments.add}
              isLoading={comments.isLoading}
              error={comments.error}
              onRetry={comments.load}
              isSending={comments.isSending}
              sendError={comments.sendError}
              currentUserId={currentUser?.id}
              onDeleteComment={comments.remove}
              deletingCommentId={comments.deletingId}
              deleteError={comments.deleteError}
            />
          </div>
        </div>

        <LinkModal
          open={linkModalOpen}
          onClose={() => setLinkModalOpen(false)}
          onInsert={actions.link}
        />
        <TableModal
          open={tableModalOpen}
          onClose={() => setTableModalOpen(false)}
          onInsert={actions.table}
        />
    </>
  );
}
