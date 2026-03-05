import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SendNotificationProps {
    familyId: string;
    senderId: string;
    title: string;
    body: string;
    data?: any;
}

export async function sendFamilyNotification({ familyId, senderId, title, body, data }: SendNotificationProps) {
    if (!familyId || !senderId) return;

    try {
        // Find all users in the same family, except the sender
        const q = query(
            collection(db, 'users'),
            where('familyId', '==', familyId)
        );

        const querySnapshot = await getDocs(q);
        const tokens: string[] = [];

        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            // Don't send notification to the person who triggered it
            if (doc.id !== senderId && userData.pushToken) {
                tokens.push(userData.pushToken);
            }
        });

        if (tokens.length === 0) return; // No other devices to notify

        // Send notifications via Expo's Push API
        const message = {
            to: tokens,
            sound: 'default',
            title,
            body,
            data: data || {},
        };

        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        if (!response.ok) {
            console.error('Error sending push notification:', await response.text());
        }

    } catch (error) {
        console.error('Error in sendFamilyNotification:', error);
    }
}
