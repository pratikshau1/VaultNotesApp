import { openDB, DBSchema } from 'idb';

interface VaultDB extends DBSchema {
  users: {
    key: string; // username
    value: {
      username: string;
      salt: string; // Public salt for key derivation
      passwordHash: string; // Hash of password for verification (optional, or use encryption check)
      createdAt: number;
    };
  };
  notes: {
    key: string; // uuid
    value: {
      id: string;
      folderId: string | null;
      encryptedTitle: string;
      encryptedContent: string;
      isPinned: boolean;
      isArchived: boolean;
      isTrashed: boolean; // Recycle Bin support
      labels: string[];
      createdAt: number;
      updatedAt: number;
    };
    indexes: { 'by-folder': string };
  };
  folders: {
    key: string;
    value: {
      id: string;
      name: string; 
      parentId: string | null;
    };
  };
}

const DB_NAME = 'VaultNotesDB';
const DB_VERSION = 3; // Bumped version for isTrashed

export const initDB = async () => {
  return openDB<VaultDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'username' });
      }
      if (!db.objectStoreNames.contains('notes')) {
        const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
        noteStore.createIndex('by-folder', 'folderId');
      }
      if (!db.objectStoreNames.contains('folders')) {
        db.createObjectStore('folders', { keyPath: 'id' });
      }
      
      // Migration logic
      if (oldVersion < 3) {
        // In a real app, we would iterate and update. 
        // For now, the UI handles undefined isTrashed as false.
      }
    },
  });
};

export const db = {
  async getUser(username: string) {
    const db = await initDB();
    return db.get('users', username);
  },
  async createUser(user: any) {
    const db = await initDB();
    return db.put('users', user);
  },
  async saveNote(note: any) {
    const db = await initDB();
    return db.put('notes', note);
  },
  async getNotes() {
    const db = await initDB();
    return db.getAll('notes');
  },
  async deleteNote(id: string) {
    const db = await initDB();
    return db.delete('notes', id);
  },
  async saveFolder(folder: any) {
    const db = await initDB();
    return db.put('folders', folder);
  },
  async getFolders() {
    const db = await initDB();
    return db.getAll('folders');
  }
};
