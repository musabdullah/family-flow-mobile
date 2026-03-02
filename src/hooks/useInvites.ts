import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';

export interface PendingInvite {
    id: string; // doc id is the email
    email: string;
    familyId: string;
    inviterName: string;
    status: 'pending' | 'accepted';
}

export function useInvites() {
    const [invites, setInvites] = useState<PendingInvite[]>([]);
    const user = useAuthStore(state => state.user);

    useEffect(() => {
        if (!user?.email) {
            setInvites([]);
            return;
        }

        const q = query(
            collection(db, 'invites'),
            where('email', '==', user.email.toLowerCase()),
            where('status', '==', 'pending')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PendingInvite));
            setInvites(data);
        }, (error) => {
            console.error("Firebase realtime invite sync failed", error);
        });

        return () => unsubscribe();
    }, [user?.email]);

    return { invites };
}
