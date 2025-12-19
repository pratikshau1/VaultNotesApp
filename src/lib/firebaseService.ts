import { firestore } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  deleteField
} from 'firebase/firestore';

export interface Note {
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
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
}

export const firebaseService = {
  // Notes Operations
  async saveNote(userId: string, note: Note) {
    try {
      const noteRef = doc(firestore, `users/${userId}/notes`, note.id);
      await setDoc(noteRef, {
        ...note,
        createdAt: Timestamp.fromMillis(note.createdAt),
        updatedAt: Timestamp.fromMillis(note.updatedAt)
      }, { merge: true });
      return true;
    } catch (error) {
      console.error('Failed to save note to Firebase:', error);
      throw error;
    }
  },

  async getNote(userId: string, noteId: string): Promise<Note | null> {
    try {
      const noteRef = doc(firestore, `users/${userId}/notes`, noteId);
      const snapshot = await getDoc(noteRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          ...data,
          createdAt: data.createdAt?.toMillis() || Date.now(),
          updatedAt: data.updatedAt?.toMillis() || Date.now(),
        } as Note;
      }
      return null;
    } catch (error) {
      console.error('Failed to get note from Firebase:', error);
      throw error;
    }
  },

  async getAllNotes(userId: string): Promise<Note[]> {
    try {
      const notesRef = collection(firestore, `users/${userId}/notes`);
      const snapshot = await getDocs(notesRef);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toMillis() || Date.now(),
          updatedAt: data.updatedAt?.toMillis() || Date.now(),
        } as Note;
      });
    } catch (error) {
      console.error('Failed to get notes from Firebase:', error);
      throw error;
    }
  },

  async deleteNote(userId: string, noteId: string) {
    try {
      const noteRef = doc(firestore, `users/${userId}/notes`, noteId);
      await deleteDoc(noteRef);
      return true;
    } catch (error) {
      console.error('Failed to delete note from Firebase:', error);
      throw error;
    }
  },

  subscribeToNotes(userId: string, callback: (notes: Note[]) => void) {
    const notesRef = collection(firestore, `users/${userId}/notes`);
    const q = query(notesRef, orderBy('updatedAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toMillis() || Date.now(),
          updatedAt: data.updatedAt?.toMillis() || Date.now(),
        } as Note;
      });
      callback(notes);
    }, (error) => {
      console.error('Error subscribing to notes:', error);
    });
  },

  // Folders Operations
  async saveFolder(userId: string, folder: Folder) {
    try {
      const folderRef = doc(firestore, `users/${userId}/folders`, folder.id);
      await setDoc(folderRef, {
        ...folder,
        createdAt: Timestamp.fromMillis(folder.createdAt)
      }, { merge: true });
      return true;
    } catch (error) {
      console.error('Failed to save folder to Firebase:', error);
      throw error;
    }
  },

  async getFolder(userId: string, folderId: string): Promise<Folder | null> {
    try {
      const folderRef = doc(firestore, `users/${userId}/folders`, folderId);
      const snapshot = await getDoc(folderRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          ...data,
          createdAt: data.createdAt?.toMillis() || Date.now(),
        } as Folder;
      }
      return null;
    } catch (error) {
      console.error('Failed to get folder from Firebase:', error);
      throw error;
    }
  },

  async getAllFolders(userId: string): Promise<Folder[]> {
    try {
      const foldersRef = collection(firestore, `users/${userId}/folders`);
      const snapshot = await getDocs(foldersRef);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toMillis() || Date.now(),
        } as Folder;
      });
    } catch (error) {
      console.error('Failed to get folders from Firebase:', error);
      throw error;
    }
  },

  async deleteFolder(userId: string, folderId: string) {
    try {
      const folderRef = doc(firestore, `users/${userId}/folders`, folderId);
      await deleteDoc(folderRef);
      return true;
    } catch (error) {
      console.error('Failed to delete folder from Firebase:', error);
      throw error;
    }
  },

  subscribeToFolders(userId: string, callback: (folders: Folder[]) => void) {
    const foldersRef = collection(firestore, `users/${userId}/folders`);
    
    return onSnapshot(foldersRef, (snapshot) => {
      const folders = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toMillis() || Date.now(),
        } as Folder;
      });
      callback(folders);
    }, (error) => {
      console.error('Error subscribing to folders:', error);
    });
  },

  // User Profile Operations
  async saveUserProfile(userId: string, userData: any) {
    try {
      const userRef = doc(firestore, 'users', userId);
      
      // Remove undefined values and convert undefined fields to deleteField()
      const cleanedData: any = {
        updatedAt: serverTimestamp()
      };
      
      // Clean the data to remove all undefined values
      for (const [key, value] of Object.entries(userData)) {
        if (value === undefined) {
          // Use deleteField() to remove undefined fields from Firestore
          cleanedData[key] = deleteField();
        } else if (value !== null) {
          // Only include defined, non-null values
          cleanedData[key] = value;
        }
        // Note: null values are allowed in Firestore, so we keep them
      }
      
      await setDoc(userRef, cleanedData, { merge: true });
      return true;
    } catch (error) {
      console.error('Failed to save user profile to Firebase:', error);
      throw error;
    }
  },

  async getUserProfile(userId: string) {
    try {
      const userRef = doc(firestore, 'users', userId);
      const snapshot = await getDoc(userRef);
      
      if (snapshot.exists()) {
        return snapshot.data();
      }
      return null;
    } catch (error) {
      console.error('Failed to get user profile from Firebase:', error);
      throw error;
    }
  }
};

