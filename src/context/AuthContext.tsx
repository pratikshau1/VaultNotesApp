import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  deriveEncryptionKey,
  generateSalt,
  hashPassword,
  generateRecoveryKey,
  encryptPassphraseWithRecoveryKey,
  decryptPassphraseWithRecoveryKey
} from '@/lib/crypto';
import { db } from '@/lib/db';
import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { syncService } from '@/lib/syncService';
import { toast } from 'sonner';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  firebaseUser: FirebaseUser | null;
  encryptionKey: any | null;
  login: (username: string, password: string, passphrase: string) => Promise<boolean>;
  register: (username: string, password: string, passphrase: string) => Promise<{ success: boolean; recoveryKey?: string }>;
  logout: () => void;
  recoverAccount: (username: string, recoveryKey: string) => Promise<{ success: boolean; passphrase?: string }>;
  isAccountLocked: (username: string) => Promise<boolean>;
  syncToCloud: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setFirebaseUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  const isAccountLocked = async (username: string) => {
    const existingUser = await db.getUser(username);
    if (!existingUser) return false;

    if (existingUser.lockedUntil && existingUser.lockedUntil > Date.now()) {
      const minutesLeft = Math.ceil((existingUser.lockedUntil - Date.now()) / 60000);
      toast.error(`Account locked. Try again in ${minutesLeft} minutes.`);
      return true;
    }

    return false;
  };

  const login = async (username: string, password: string, passphrase: string) => {
    try {
      if (await isAccountLocked(username)) {
        return false;
      }

      const existingUser = await db.getUser(username);
      if (!existingUser) {
        toast.error("User not found");
        return false;
      }

      const passwordHash = hashPassword(password, existingUser.passwordSalt);

      if (passwordHash !== existingUser.passwordHash) {
        await db.incrementFailedAttempts(username);
        const updatedUser = await db.getUser(username);
        const attemptsLeft = 5 - (updatedUser?.failedAttempts || 0);

        if (attemptsLeft > 0) {
          toast.error(`Invalid credentials. ${attemptsLeft} attempts remaining.`);
        }
        return false;
      }

      const key = deriveEncryptionKey(passphrase, existingUser.encryptionSalt);

      await db.resetFailedAttempts(username);

      if (existingUser.firebaseUid) {
        try {
          const email = `${username}@vaultnotes.local`;
          await signInWithEmailAndPassword(auth, email, password);
        } catch (firebaseError) {
          console.log('Firebase sign-in failed, continuing with local auth', firebaseError);
        }
      }

      setEncryptionKey(key);
      setUser(existingUser);
      toast.success("Vault unlocked");
      return true;
    } catch (e) {
      console.error(e);
      toast.error("Login failed");
      return false;
    }
  };

  const register = async (username: string, password: string, passphrase: string) => {
    try {
      const existingUser = await db.getUser(username);
      if (existingUser) {
        toast.error("User already exists");
        return { success: false };
      }

      const passwordSalt = generateSalt();
      const encryptionSalt = generateSalt();
      const passwordHash = hashPassword(password, passwordSalt);
      const recoveryKey = generateRecoveryKey();
      const encryptedRecoveryData = encryptPassphraseWithRecoveryKey(passphrase, recoveryKey);

      let firebaseUid: string | undefined;

      try {
        const email = `${username}@vaultnotes.local`;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        firebaseUid = userCredential.user.uid;

        await syncService.saveRecoveryKey(firebaseUid, encryptedRecoveryData);
      } catch (firebaseError) {
        console.log('Firebase registration failed, continuing with local only', firebaseError);
      }

      const newUser = {
        username,
        passwordHash,
        passwordSalt,
        encryptionSalt,
        encryptedRecoveryData,
        firebaseUid,
        failedAttempts: 0,
        createdAt: Date.now(),
      };

      await db.createUser(newUser);

      const key = deriveEncryptionKey(passphrase, encryptionSalt);

      setEncryptionKey(key);
      setUser(newUser);
      toast.success("Vault created successfully");

      return { success: true, recoveryKey };
    } catch (e) {
      console.error(e);
      toast.error("Registration failed");
      return { success: false };
    }
  };

  const recoverAccount = async (username: string, recoveryKey: string) => {
    try {
      const existingUser = await db.getUser(username);
      if (!existingUser) {
        toast.error("User not found");
        return { success: false };
      }

      const passphrase = decryptPassphraseWithRecoveryKey(
        existingUser.encryptedRecoveryData,
        recoveryKey
      );

      if (!passphrase) {
        toast.error("Invalid recovery key");
        return { success: false };
      }

      toast.success("Account recovered! Use this passphrase to login.");
      return { success: true, passphrase };
    } catch (e) {
      console.error(e);
      toast.error("Recovery failed");
      return { success: false };
    }
  };

  const syncToCloud = async () => {
    if (!firebaseUser || !user) {
      toast.error("Not connected to cloud");
      return;
    }

    try {
      toast.info("Syncing to cloud...");
      await syncService.syncAllNotesToCloud(firebaseUser.uid);
      await syncService.syncFoldersFromCloud(firebaseUser.uid);
      await syncService.syncFilesFromCloud(firebaseUser.uid);
      toast.success("Synced to cloud");
    } catch (e) {
      console.error(e);
      toast.error("Sync failed");
    }
  };

  const logout = () => {
    setUser(null);
    setEncryptionKey(null);
    if (firebaseUser) {
      signOut(auth);
    }
    toast.info("Vault locked");
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!user,
      user,
      firebaseUser,
      encryptionKey,
      login,
      register,
      logout,
      recoverAccount,
      isAccountLocked,
      syncToCloud
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
