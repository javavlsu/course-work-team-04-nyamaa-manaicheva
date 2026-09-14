import { useEffect, useSyncExternalStore } from "react";

import * as directoriesApi from "@/api/directories.js";
import * as notesApi from "@/api/notes.js";

let snapshot = {};
let listeners = new Set();
let inflight = false;
let loaded = false;

function subscribe(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function merge(next) {
  snapshot = { ...snapshot, ...next };
  emit();
}

function fetchCounts() {
  if (inflight) return;
  inflight = true;
  Promise.all([
    notesApi.list({ limit: 1 }),
    notesApi.listTrash(),
    directoriesApi.list({ limit: 20 }),
  ])
    .then(([page, trash, dirs]) => {
      merge({
        totalNotesCount: page.totalNotesCount ?? null,
        favouritesCount: page.favouritesCount ?? null,
        trashCount: Array.isArray(trash) ? trash.length : null,
        directoriesCount: Array.isArray(dirs.items) ? dirs.items.length : null,
      });
      loaded = true;
    })
    .catch(() => {})
    .finally(() => {
      inflight = false;
    });
}

export function updateNotesCounts(counts) {
  const next = {};
  if (counts.totalNotesCount != null) next.totalNotesCount = counts.totalNotesCount;
  if (counts.favouritesCount != null) next.favouritesCount = counts.favouritesCount;
  if (counts.directoriesCount != null) next.directoriesCount = counts.directoriesCount;
  if (counts.trashCount != null) next.trashCount = counts.trashCount;
  if (Object.keys(next).length === 0) return;
  merge(next);
  if (snapshot.totalNotesCount != null && snapshot.favouritesCount != null) {
    loaded = true;
  }
}

export function refreshNotesCounts() {
  fetchCounts();
}

export function resetNotesCounts() {
  snapshot = {};
  loaded = false;
  emit();
}

export function useNotesCounts({ autoFetch = false } = {}) {
  const counts = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  useEffect(() => {
    if (autoFetch && !loaded) {
      fetchCounts();
    }
  }, [autoFetch]);
  return counts;
}