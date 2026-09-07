import * as directoriesApi from "../api/directories.js";

export const FOLDER_TINTS = ["tint-orange", "tint-green", "tint-purple", "tint-blue"];

export function adaptFolder(dir, index) {
  return {
    key: dir.id,
    id: dir.id,
    name: dir.title,
    tint: FOLDER_TINTS[index % FOLDER_TINTS.length],
  };
}

export function adaptDirectories(items) {
  return (items ?? []).map(adaptFolder);
}

export function countNotesInFolder(noteFolderMap, folderId) {
  return [...noteFolderMap.values()].filter((v) => String(v) === String(folderId)).length;
}

export async function buildNoteFolderMap(folders) {
  const map = new Map();
  await Promise.all(
    folders.map(async (folder) => {
      try {
        const links = await directoriesApi.listNotes(folder.id ?? folder.key);
        links.forEach((link) => {
          if (!map.has(link.noteId)) {
            map.set(link.noteId, link.directoryId);
          }
        });
      } catch {
        return;
      }
    })
  );
  return map;
}

export async function moveNote({ noteFolderMap, noteId, targetFolderId }) {
  const current = noteFolderMap.get(noteId) || null;
  if (String(current) === String(targetFolderId)) return noteFolderMap;
  try {
    if (current) await directoriesApi.removeNote(current, noteId);
    await directoriesApi.addNote(targetFolderId, noteId);
    return new Map(noteFolderMap).set(noteId, targetFolderId);
  } catch {
    return null;
  }
}

export async function removeNoteFromFolder({ noteFolderMap, noteId }) {
  const current = noteFolderMap.get(noteId);
  if (!current) return noteFolderMap;
  try {
    await directoriesApi.removeNote(current, noteId);
    const next = new Map(noteFolderMap);
    next.delete(noteId);
    return next;
  } catch {
    return null;
  }
}

export async function createAndMoveNote({ noteFolderMap, noteId, title, folderCount }) {
  const current = noteFolderMap.get(noteId) || null;
  try {
    const created = await directoriesApi.create({ title });
    if (current) await directoriesApi.removeNote(current, noteId);
    await directoriesApi.addNote(created.id, noteId);
    return {
      folder: adaptFolder(created, folderCount),
      noteFolderMap: new Map(noteFolderMap).set(noteId, created.id),
    };
  } catch {
    return null;
  }
}