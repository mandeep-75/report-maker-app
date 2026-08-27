import type { Report } from '../data/reportSchema'

const DB_NAME = 'report-maker'
const DB_VERSION = 1
const STORE_NAME = 'autosave'
const AUTOSAVE_KEY = 'current'
const RECENT_INDEX_KEY = 'recent-index'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveAutosave(report: Report): Promise<void> {
  const db = await openDB()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(report, AUTOSAVE_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
  db.close()
}

export async function loadAutosave(): Promise<Report | null> {
  try {
    const db = await openDB()
    const result = await new Promise<Report | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(AUTOSAVE_KEY)
      req.onsuccess = () => resolve((req.result as Report) ?? null)
      req.onerror = () => resolve(null)
    })
    db.close()
    return result
  } catch {
    return null
  }
}

export async function clearAutosave(): Promise<void> {
  try {
    const db = await openDB()
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).delete(AUTOSAVE_KEY)
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
    })
    db.close()
  } catch {
    /* ignore */
  }
}

export interface RecentMeta {
  id: string
  name: string
  updatedAt: string
}

function readIndex(): RecentMeta[] {
  try {
    const raw = localStorage.getItem(RECENT_INDEX_KEY)
    return raw ? (JSON.parse(raw) as RecentMeta[]) : []
  } catch {
    return []
  }
}

function writeIndex(list: RecentMeta[]) {
  try {
    localStorage.setItem(RECENT_INDEX_KEY, JSON.stringify(list))
  } catch {
    /* ignore quota errors */
  }
}

export async function saveRecentReport(report: Report): Promise<void> {
  const db = await openDB()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(report, `recent-${report.id}`)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
  db.close()
  const index = readIndex().filter((r) => r.id !== report.id)
  index.unshift({
    id: report.id,
    name: report.eventInfo.eventName || report.eventInfo.collegeName || 'Untitled Report',
    updatedAt: report.updatedAt,
  })
  writeIndex(index.slice(0, 20))
}

export async function listRecentReports(): Promise<RecentMeta[]> {
  return readIndex()
}

export async function loadRecentReport(id: string): Promise<Report | null> {
  try {
    const db = await openDB()
    const result = await new Promise<Report | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(`recent-${id}`)
      req.onsuccess = () => resolve((req.result as Report) ?? null)
      req.onerror = () => resolve(null)
    })
    db.close()
    return result
  } catch {
    return null
  }
}

export async function deleteRecentReport(id: string): Promise<void> {
  try {
    const db = await openDB()
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).delete(`recent-${id}`)
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
    })
    db.close()
  } catch {
    /* ignore */
  }
  writeIndex(readIndex().filter((r) => r.id !== id))
}

