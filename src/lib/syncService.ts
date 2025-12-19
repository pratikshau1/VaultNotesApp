import { firestore } from './firebase';
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './db';

export const syncService = {
  async syncNoteToCloud(userId: string, note: any) {
    try {
      const noteRef = doc(firestore, `users/${userId}/notes`, note.id);
      await setDoc(noteRef, {
        ...note,
        syncedAt: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (error) {
      console.error('Failed to sync note to cloud:', error);
      return false;
    }
  },

  async syncAllNotesToCloud(userId: string) {
    try {
      const notes = await db.getNotes();
      const syncPromises = notes.map(note => this.syncNoteToCloud(userId, note));
      await Promise.all(syncPromises);
      return true;
    } catch (error) {
      console.error('Failed to sync all notes:', error);
      return false;
    }
  },

  async syncNotesFromCloud(userId: string) {
    try {
      const notesRef = collection(firestore, `users/${userId}/notes`);
      const snapshot = await getDocs(notesRef);

      const cloudNotes = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));

      for (const note of cloudNotes) {
        await db.saveNote(note);
      }

      return cloudNotes;
    } catch (error) {
      console.error('Failed to sync notes from cloud:', error);
      return [];
    }
  },

  async syncFolderToCloud(userId: string, folder: any) {
    try {
      const folderRef = doc(firestore, `users/${userId}/folders`, folder.id);
      await setDoc(folderRef, {
        ...folder,
        syncedAt: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (error) {
      console.error('Failed to sync folder to cloud:', error);
      return false;
    }
  },

  async syncFoldersFromCloud(userId: string) {
    try {
      const foldersRef = collection(firestore, `users/${userId}/folders`);
      const snapshot = await getDocs(foldersRef);

      const cloudFolders = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));

      for (const folder of cloudFolders) {
        await db.saveFolder(folder);
      }

      return cloudFolders;
    } catch (error) {
      console.error('Failed to sync folders from cloud:', error);
      return [];
    }
  },

  async syncFileToCloud(userId: string, file: any) {
    try {
      const fileRef = doc(firestore, `users/${userId}/files`, file.id);
      await setDoc(fileRef, {
        ...file,
        syncedAt: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (error) {
      console.error('Failed to sync file to cloud:', error);
      return false;
    }
  },

  async syncFilesFromCloud(userId: string) {
    try {
      const filesRef = collection(firestore, `users/${userId}/files`);
      const snapshot = await getDocs(filesRef);

      const cloudFiles = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));

      for (const file of cloudFiles) {
        await db.saveFile(file);
      }

      return cloudFiles;
    } catch (error) {
      console.error('Failed to sync files from cloud:', error);
      return [];
    }
  },

  async deleteNoteFromCloud(userId: string, noteId: string) {
    try {
      const noteRef = doc(firestore, `users/${userId}/notes`, noteId);
      await deleteDoc(noteRef);
      return true;
    } catch (error) {
      console.error('Failed to delete note from cloud:', error);
      return false;
    }
  },

  async saveRecoveryKey(userId: string, encryptedRecoveryData: string) {
    try {
      const recoveryRef = doc(firestore, 'recoveryKeys', userId);
      await setDoc(recoveryRef, {
        encryptedRecoveryData,
        createdAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Failed to save recovery key:', error);
      return false;
    }
  },

  async getRecoveryKey(userId: string) {
    try {
      const recoveryRef = doc(firestore, 'recoveryKeys', userId);
      const snapshot = await getDoc(recoveryRef);

      if (snapshot.exists()) {
        return snapshot.data().encryptedRecoveryData;
      }
      return null;
    } catch (error) {
      console.error('Failed to get recovery key:', error);
      return null;
    }
  }
};
