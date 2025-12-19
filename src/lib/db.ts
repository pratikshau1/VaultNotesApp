import { openDB, DBSchema } from 'idb';

/**
 * IndexedDB schema for VaultNotes
 * Only used for file storage (PDFs, images, etc.)
 * Notes and folders are stored in Firebase Firestore
 */
interface VaultDB extends DBSchema {
  files: {
    key: string;
    value: {
      id: string;
      folderId: string | null;
      encryptedName: string;
      encryptedType: string;
      encryptedBlob: string; // Base64 data
      size: number;
      isTrashed: boolean;
      createdAt: number;
    };
  };
}

const DB_NAME = 'VaultNotesDB';
const DB_VERSION = 6; // Incremented version to remove notes/folders/users stores

export const initDB = async () => {
  return openDB<VaultDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Remove old stores if they exist (migration from old version)
      if (oldVersion < 6) {
        if (db.objectStoreNames.contains('users')) {
          db.deleteObjectStore('users');
        }
        if (db.objectStoreNames.contains('notes')) {
          db.deleteObjectStore('notes');
        }
        if (db.objectStoreNames.contains('folders')) {
          db.deleteObjectStore('folders');
        }
      }
      
      // Create files store if it doesn't exist
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files', { keyPath: 'id' });
      }
    },
  });
};

/**
 * IndexedDB operations for file storage only
 * Files are stored locally in the browser for performance and privacy
 */
export const db = {
  async saveFile(file: any) {
    const dbInstance = await initDB();
    return dbInstance.put('files', file);
  },
  async getFiles() {
    const dbInstance = await initDB();
    return dbInstance.getAll('files');
  },
  async deleteFile(id: string) {
    const dbInstance = await initDB();
    return dbInstance.delete('files', id);
  },
  async getFile(id: string) {
    const dbInstance = await initDB();
    return dbInstance.get('files', id);
  }
};
