import { useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";

import AppSidebar from "../../../components/layout/AppSidebar";
import { useAuth } from "../../../context/AuthContext.jsx";
import EditorTopbar from "./components/EditorTopbar";
import FormatToolbar from "./components/FormatToolbar";
import MarkdownArea from "./components/MarkdownArea";
import AttachmentsSection from "./components/AttachmentsSection";
import CommentsSection from "./components/CommentsSection";
import { useNoteDocument } from "./hooks/useNoteDocument";
import { useNoteComments } from "./hooks/useNoteComments";
import { useNoteAttachments } from "./hooks/useNoteAttachments";
import { useNotePermissions } from "./hooks/useNotePermissions";
import { useNoteDirectories } from "./hooks/useNoteDirectories";
import "./NoteEditorPage.css";

export function NoteEditorPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const isNew = id === "new";

  const { collapsed, onToggleSidebar } = useOutletContext();
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
  );

  const showDirectoryMenu =
    !isNew &&
    doc.ownerId !== null &&
    currentUser?.id === doc.ownerId;

  // --- Loading state ---
  if (doc.isLoading) {
    return (
      <>
        <AppSidebar
          active=""
          collapsed={collapsed}
          onToggle={onToggleSidebar}
        />
        <div className="main">
          <div className="editor-loading">
            <div className="editor-loading-spinner" />
            <span>Загрузка заметки…</span>
          </div>
        </div>
      </>
    );
  }

  // --- Error state ---
  if (doc.error) {
    return (
      <>
        <AppSidebar
          active=""
          collapsed={collapsed}
          onToggle={onToggleSidebar}
        />
        <div className="main">
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
        </div>
      </>
    );
  }

  return (
    <>
      <AppSidebar
        active=""
        collapsed={collapsed}
        onToggle={onToggleSidebar}
      />
      <div className="main">
        <EditorTopbar
          mode={mode}
          onModeChange={setMode}
          favorited={doc.favorited}
          onToggleFavorite={doc.toggleFavorite}
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

        {/* Ошибка сохранения — в т.ч. 409 Conflict. Локальные title/content не затираются. */}
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
        {/* Загрузка/ошибка attachment — минимальный state, переиспользованы те же баннеры, что и для save */}
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
        {/* Ошибка загрузки permissions — минимальный state, тот же баннер, что и для attachment */}
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
        {/* Ошибка add/remove Note↔Directory — тот же паттерн, что и для permissions */}
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
          {mode === "edit" && (
            <FormatToolbar
              onFileSelect={attachments.upload}
              isUploading={attachments.isUploading}
              uploadDisabled={isNew}
            />
          )}
          {/* data-note-version хранит текущий version для optimistic locking, не влияет на UI */}
          <div className="editor-body" data-note-version={doc.version ?? undefined}>
            <MarkdownArea
              mode={mode}
              title={doc.title}
              onTitleChange={(e) => doc.setTitle(e.target.value)}
              content={doc.content}
              onContentChange={(e) => doc.setContent(e.target.value)}
            />
            <div className="note-dates">
              <span>Создано: {doc.createdAt}</span>
              <span>Изменено: {doc.updatedAt}</span>
            </div>

            {/* Список загруженных в этой сессии attachments. Для "new" не показывается. */}
            {!isNew && attachments.list.length > 0 && (
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
      </div>
    </>
  );
}