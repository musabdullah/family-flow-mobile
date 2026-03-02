import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';

export interface ChatMessage {
    id: string;
    author: string;
    text: string;
    timestamp: number;
    avatar: string;
    customPhoto?: string;
}

export function useMessages() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const familyId = useAuthStore(state => state.user?.familyId);

    useEffect(() => {
        if (!familyId) {
            setMessages([]);
            setLoading(false);
            return;
        }

        try {
            // Limit to last 100 messages for performance
            const q = query(
                collection(db, 'families', familyId, 'messages'),
                orderBy('timestamp', 'desc'),
                limit(100)
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                // Firebase returns descending, we need ascending for chat UI
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)).reverse();
                setMessages(data);
                setLoading(false);
            }, (error) => {
                console.error("Firebase realtime sync failed", error);
                setLoading(false);
            });
            return () => unsubscribe();
        } catch (error) {
            console.log("Firebase config not available. Returning empty messages.");
            setLoading(false);
        }
    }, [familyId]);

    const sendMessage = async (newMsg: Omit<ChatMessage, 'id'>) => {
        if (!familyId) return;
        try {
            await addDoc(collection(db, 'families', familyId, 'messages'), newMsg);
        } catch (error) {
            console.error("Error adding message", error);
        }
    };

    return { messages, loading, sendMessage };
}
