import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  deriveEncryptionKey,
  generateSalt,
  generateRecoveryKey,
  encryptPassphraseWithRecoveryKey,
  decryptPassphraseWithRecoveryKey
} from '@/lib/crypto';
import { auth, firestore } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firebaseService } from '@/lib/firebaseService';
import { toast } from 'sonner';

interface UserProfile {
  username: string;
  encryptionSalt: string;
  encryptedRecoveryData: string;
  failedAttempts?: number;
  lockedUntil?: number;
  createdAt: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  encryptionKey: any | null;
  login: (username: string, password: string, passphrase: string) => Promise<boolean>;
  register: (username: string, password: string, passphrase: string) => Promise<{ success: boolean; recoveryKey?: string }>;
  logout: () => void;
  recoverAccount: (username: string, recoveryKey: string) => Promise<{ success: boolean; passphrase?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      // Load user profile from Firestore when Firebase user is authenticated
      if (firebaseUser) {
        try {
          const userProfile = await firebaseService.getUserProfile(firebaseUser.uid);
          if (userProfile) {
            setUser(userProfile as UserProfile);
          }
        } catch (error) {
          console.error('Failed to load user profile:', error);
        }
      } else {
        setUser(null);
        setEncryptionKey(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (username: string, password: string, passphrase: string) => {
    try {
      const email = `${username}@vaultnotes.local`;
      
      // Authenticate with Firebase Auth
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (firebaseError: any) {
        if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
          // Try to get user profile to increment failed attempts
          try {
            const usersRef = collection(firestore, 'users');
            const q = query(usersRef, where('username', '==', username));
            const snapshot = await getDocs(q);
            
            if (!snapshot.empty) {
              const userDoc = snapshot.docs[0];
              const userId = userDoc.id;
              const userProfile = userDoc.data() as UserProfile;
              const failedAttempts = (userProfile.failedAttempts || 0) + 1;
              const lockedUntil = failedAttempts >= 5 ? Date.now() + 15 * 60 * 1000 : undefined;
              
              await firebaseService.saveUserProfile(userId, {
                ...userProfile,
                failedAttempts,
                lockedUntil
              });
              
              const attemptsLeft = 5 - failedAttempts;
              if (attemptsLeft > 0) {
                toast.error(`Invalid credentials. ${attemptsLeft} attempts remaining.`);
              } else {
                toast.error("Account locked due to too many failed attempts.");
              }
            } else {
              toast.error("Invalid credentials");
            }
          } catch (error) {
            console.error('Failed to increment failed attempts:', error);
            toast.error("Invalid credentials");
          }
        } else {
          toast.error("Login failed");
        }
        return false;
      }

      const userId = userCredential.user.uid;
      
      // Load user profile from Firestore
      const userProfile = await firebaseService.getUserProfile(userId) as UserProfile | null;
      
      if (!userProfile) {
        toast.error("User profile not found");
        await signOut(auth);
        return false;
      }

      // Check if account is locked
      if (userProfile.lockedUntil && userProfile.lockedUntil > Date.now()) {
        const minutesLeft = Math.ceil((userProfile.lockedUntil - Date.now()) / 60000);
        toast.error(`Account locked. Try again in ${minutesLeft} minutes.`);
        await signOut(auth);
        return false;
      }

      // Derive encryption key from passphrase
      const key = deriveEncryptionKey(passphrase, userProfile.encryptionSalt);
      
      // Reset failed attempts on successful login
      await firebaseService.saveUserProfile(userId, {
        ...userProfile,
        failedAttempts: 0,
        lockedUntil: undefined
      });

      setEncryptionKey(key);
      setUser(userProfile);
      toast.success("Vault unlocked");
      return true;
    } catch (e: any) {
      console.error(e);
      toast.error("Login failed");
      return false;
    }
  };

  const register = async (username: string, password: string, passphrase: string) => {
    try {
      const email = `${username}@vaultnotes.local`;
      
      // Create Firebase Auth user
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } catch (firebaseError: any) {
        if (firebaseError.code === 'auth/email-already-in-use') {
          toast.error("Username already exists");
          return { success: false };
        }
        throw firebaseError;
      }

      const userId = userCredential.user.uid;
      const encryptionSalt = generateSalt();
      const recoveryKey = generateRecoveryKey();
      const encryptedRecoveryData = encryptPassphraseWithRecoveryKey(passphrase, recoveryKey);

      // Save user profile to Firestore
      const newUser: UserProfile = {
        username,
        encryptionSalt,
        encryptedRecoveryData,
        failedAttempts: 0,
        createdAt: Date.now(),
      };

      await firebaseService.saveUserProfile(userId, newUser);
      

      const key = deriveEncryptionKey(passphrase, encryptionSalt);

      setEncryptionKey(key);
      setUser(newUser);
      toast.success("Vault created successfully");

      return { success: true, recoveryKey };
    } catch (e: any) {
      console.error(e);
      if (e.code === 'auth/email-already-in-use') {
        toast.error("Username already exists");
      } else {
        toast.error("Registration failed");
      }
      return { success: false };
    }
  };

  const recoverAccount = async (username: string, recoveryKey: string) => {
    try {
      // Query users collection by username to find the user
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('username', '==', username));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        toast.error("User not found");
        return { success: false };
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data() as UserProfile;

      const passphrase = decryptPassphraseWithRecoveryKey(
        userData.encryptedRecoveryData,
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
      isAuthenticated: !!user && !!firebaseUser,
      user,
      firebaseUser,
      encryptionKey,
      login,
      register,
      logout,
      recoverAccount
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
