import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';

// Set notification handler to show notifications even when app is open
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export function usePushNotifications() {
    const { user } = useAuthStore();
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();

    useEffect(() => {
        if (!user) return;

        registerForPushNotificationsAsync().then(token => {
            if (token) {
                setExpoPushToken(token);
                // Save token to Firestore under the user's document
                setDoc(doc(db, 'users', user.id), { pushToken: token }, { merge: true })
                    .catch(e => console.error("Error saving push token:", e));
            }
        });

        // This listener is fired whenever a notification is received while the app is foregrounded
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            // Optional: Handle foreground notification logic here if needed
            // console.log("Foreground notification received:", notification);
        });

        // This listener is fired whenever a user taps on or interacts with a notification 
        // (works when app is foregrounded, backgrounded, or killed)
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            // Optional: Handle notification tap logic here (e.g. navigation)
            // console.log("Notification tapped:", response);
        });

        return () => {
            if (notificationListener.current) notificationListener.current.remove();
            if (responseListener.current) responseListener.current.remove();
        };
    }, [user]);

    return { expoPushToken };
}

async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#a78bfa',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            // Permission denied
            return null;
        }

        // Learn more about projectId: https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
        try {
            token = (await Notifications.getExpoPushTokenAsync({
                projectId: '365eda57-e638-46b4-8db3-712076cec245' // From app.json
            })).data;
        } catch (e) {
            console.error("Error getting Expo Push Token:", e);
        }
    } else {
        // Must use physical device for Push Notifications
    }

    return token;
}
