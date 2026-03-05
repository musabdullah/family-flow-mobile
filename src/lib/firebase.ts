import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace these with your actual Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyD13PCOxj8I_Z6KxTU6jfTCTqXJ7_bTSLE",
    authDomain: "familyflow-6b67c.firebaseapp.com",
    projectId: "familyflow-6b67c",
    storageBucket: "familyflow-6b67c.firebasestorage.app",
    messagingSenderId: "459137016269",
    appId: "1:459137016269:web:8de0c051d8ed85f9f9e484"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});
