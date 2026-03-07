import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, limit, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { sendFamilyNotification } from '../lib/notifications';

export interface ChatMessage {
    id: string;
    author: string;
    text: string;
    timestamp: number;
    avatar: string;
    customPhoto?: string;
    isSystem?: boolean;
}

export function useMessages() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [messageLimit, setMessageLimit] = useState(20);
    const user = useAuthStore(state => state.user);
    const familyId = user?.familyId;

    useEffect(() => {
        if (!familyId) {
            setMessages([]);
            setLoading(false);
            return;
        }

        try {
            // Fetch based on dynamic limit for pagination
            const q = query(
                collection(db, 'families', familyId, 'messages'),
                orderBy('timestamp', 'desc'),
                limit(messageLimit)
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
    }, [familyId, messageLimit]);

    const sendMessage = async (newMsg: Omit<ChatMessage, 'id'>) => {
        if (!familyId || !user) return;
        try {
            await addDoc(collection(db, 'families', familyId, 'messages'), newMsg);

            // Only send push if it's a real user message, not a system-generated completion note
            if (!newMsg.isSystem && newMsg.author !== 'Sistem') {
                sendFamilyNotification({
                    familyId,
                    senderId: user.id,
                    title: 'Yeni Mesaj 💬',
                    body: `${user.name}: ${newMsg.text}`,
                    data: { route: 'sohbet' }
                });
            }
        } catch (error) {
            console.error("Error adding message", error);
        }
    };

    const deleteMessage = async (messageId: string) => {
        if (!familyId) return;
        try {
            await deleteDoc(doc(db, 'families', familyId, 'messages', messageId));
        } catch (error) {
            console.error("Error deleting message", error);
        }
    };

    const loadMoreMessages = () => {
        setMessageLimit(prev => prev + 20);
    };

    return { messages, loading, sendMessage, deleteMessage, loadMoreMessages };
}
