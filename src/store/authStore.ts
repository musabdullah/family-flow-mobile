import { create } from 'zustand';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar: string;
    customPhoto?: string;
    role: string;
    familyId: string;
}

interface AuthState {
    user: UserProfile | null;
    isAuthReady: boolean;
    login: (profile: UserProfile) => void;
    logout: () => Promise<void>;
    initAuth: () => () => void;
    updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthReady: false,
    login: (profile) => set({ user: profile }),
    logout: async () => {
        try {
            await signOut(auth);
            await GoogleSignin.revokeAccess();
            await GoogleSignin.signOut();
        } catch (e) {
            console.log(e);
        }
        set({ user: null });
    },
    updateProfile: async (updates) => {
        const currentUser = get().user;
        if (!currentUser) return;

        try {
            const userRef = doc(db, 'users', currentUser.id);
            await updateDoc(userRef, updates);
            set({ user: { ...currentUser, ...updates } });
        } catch (error) {
            console.error("Error updating profile in DB:", error);
            // Even if DB fails, update local state for immediate UI feedback (optimistic)
            set({ user: { ...currentUser, ...updates } });
        }
    },
    initAuth: () => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userRef = doc(db, 'users', firebaseUser.uid);
                    const userSnap = await getDoc(userRef);
                    let familyId = firebaseUser.uid;
                    let customPhoto: string | undefined = undefined;
                    let dbName = firebaseUser.displayName || 'İsimsiz Üye';

                    if (!userSnap.exists()) {
                        // Create initial user document
                        await setDoc(userRef, {
                            name: dbName,
                            email: firebaseUser.email || '',
                            avatar: firebaseUser.photoURL || '',
                            familyId: firebaseUser.uid,
                            createdAt: Date.now()
                        });
                    } else {
                        // User exists, grab their data
                        const data = userSnap.data();
                        familyId = data.familyId || firebaseUser.uid;
                        customPhoto = data.customPhoto;
                        if (data.name) dbName = data.name;
                    }

                    set({
                        user: {
                            id: firebaseUser.uid,
                            name: dbName,
                            email: firebaseUser.email || '',
                            avatar: firebaseUser.photoURL || '',
                            customPhoto: customPhoto,
                            role: 'member',
                            familyId: familyId,
                        },
                        isAuthReady: true,
                    });
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    // Fallback for offline mode so we don't kick user to login screen
                    set({
                        user: {
                            id: firebaseUser.uid,
                            name: firebaseUser.displayName || 'İsimsiz Üye',
                            email: firebaseUser.email || '',
                            avatar: firebaseUser.photoURL || '',
                            role: 'member',
                            familyId: firebaseUser.uid,
                        },
                        isAuthReady: true
                    });
                }
            } else {
                set({ user: null, isAuthReady: true });
            }
        });
        return unsubscribe;
    }
}));

