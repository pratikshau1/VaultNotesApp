import { openDB, DBSchema } from 'idb';

interface VaultDB extends DBSchema {
  users: {
    key: string; // username
    value: {
      username: string;
      passwordHash: string;
      passwordSalt: string;
      encryptionSalt: string;
      encryptedRecoveryData: string;
      firebaseUid?: string;
      failedAttempts?: number;
      lockedUntil?: number;
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
      isTrashed: boolean;
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
      createdAt: number;
    };
  };
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
const DB_VERSION = 5;

export const initDB = async () => {
  return openDB<VaultDB>(DB_NAME, DB_VERSION, {
    upgrade(db, _oldVersion, _newVersion, _transaction) {
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
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files', { keyPath: 'id' });
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
  async updateUser(username: string, updates: any) {
    const db = await initDB();
    const user = await db.get('users', username);
    if (user) {
      const updatedUser = { ...user, ...updates };
      return db.put('users', updatedUser);
    }
    return null;
  },
  async incrementFailedAttempts(username: string) {
    const db = await initDB();
    const user = await db.get('users', username);
    if (user) {
      const failedAttempts = (user.failedAttempts || 0) + 1;
      const lockedUntil = failedAttempts >= 5 ? Date.now() + 15 * 60 * 1000 : undefined;
      return this.updateUser(username, { failedAttempts, lockedUntil });
    }
    return null;
  },
  async resetFailedAttempts(username: string) {
    return this.updateUser(username, { failedAttempts: 0, lockedUntil: undefined });
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
  },
  async deleteFolder(id: string) {
    const db = await initDB();
    return db.delete('folders', id);
  },
  async saveFile(file: any) {
    const db = await initDB();
    return db.put('files', file);
  },
  async getFiles() {
    const db = await initDB();
    return db.getAll('files');
  },
  async deleteFile(id: string) {
    const db = await initDB();
    return db.delete('files', id);
  }
};
