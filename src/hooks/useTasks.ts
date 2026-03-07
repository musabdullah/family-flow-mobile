import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { sendFamilyNotification } from '../lib/notifications';

export interface Task {
    id: string;
    title: string;
    columnId: string;
    avatar: string;
    customPhoto?: string;
    addedBy: string;
    timestamp: number;
    note?: string;
    isOverdue?: boolean;
    isUrgent?: boolean;
    tag: string;
    completionNote?: string;
    completedBy?: string;
    completedByAvatar?: string;
}

export function useTasks(columnId?: string) {
    const [rawTasks, setRawTasks] = useState<Task[]>([]);
    const [tempTopIds, setTempTopIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const user = useAuthStore(state => state.user);
    const familyId = user?.familyId;

    useEffect(() => {
        if (!familyId) {
            setRawTasks([]);
            setLoading(false);
            return;
        }

        try {
            const q = query(collection(db, 'families', familyId, 'tasks'), orderBy('timestamp', 'desc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));

                let addedAny = false;
                const newTemp = new Set(tempTopIds);

                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        const t = change.doc.data() as Task;
                        if (!t.isUrgent && (Date.now() - t.timestamp < 5000)) {
                            newTemp.add(change.doc.id);
                            addedAny = true;

                            setTimeout(() => {
                                setTempTopIds(prev => {
                                    const next = new Set(prev);
                                    next.delete(change.doc.id);
                                    return next;
                                });
                            }, 2500);
                        }
                    }
                });

                if (addedAny) {
                    setTempTopIds(newTemp);
                }

                if (columnId) {
                    setRawTasks(data.filter(t => t.columnId === columnId));
                } else {
                    setRawTasks(data);
                }
                setLoading(false);
            }, (error) => {
                console.error("Firebase realtime sync failed", error);
                setLoading(false);
            });
            return () => unsubscribe();
        } catch (error) {
            console.log("Firebase config not available. Returning empty tasks.");
            setLoading(false);
        }
    }, [columnId, familyId]);

    const addTask = async (newTask: Omit<Task, 'id'>) => {
        if (!familyId || !user) return;
        try {
            await addDoc(collection(db, 'families', familyId, 'tasks'), newTask);

            // Dispatch notification
            sendFamilyNotification({
                familyId,
                senderId: user.id,
                title: 'Yeni Görev',
                body: `${user.name}: "${newTask.title}" eklendi.`,
                data: { route: 'pano', columnId: newTask.columnId }
            });
        } catch (error) {
            console.error("Error adding task", error);
        }
    };

    const updateTask = async (id: string, updates: Partial<Task>) => {
        if (!familyId || !user) return;
        try {
            await updateDoc(doc(db, 'families', familyId, 'tasks', id), updates);

            // Dispatch specific notification for task completion
            if (updates.tag === 'Tamamlandı') {
                const existingTask = rawTasks.find(t => t.id === id);
                if (existingTask && existingTask.tag !== 'Tamamlandı') {
                    let verb = 'tamamladı';
                    if (existingTask.columnId === 'alisveris') verb = 'aldı 🛒';
                    else if (existingTask.columnId === 'faturalar') verb = 'ödedi 💸';
                    else if (existingTask.columnId === 'planlar') verb = 'gerçekleştirdi 📅';

                    sendFamilyNotification({
                        familyId,
                        senderId: user.id,
                        title: 'Görev Tamamlandı ✅',
                        body: `${user.name}, "${existingTask.title}" ${verb}`,
                        data: { route: 'arsiv' }
                    });
                }
            }
        } catch (error) {
            console.error("Error updating task", error);
        }
    };

    const deleteTask = async (id: string) => {
        if (!familyId) return;
        try {
            await deleteDoc(doc(db, 'families', familyId, 'tasks', id));
        } catch (error) {
            console.error("Error deleting task", error);
        }
    };

    const tasks = React.useMemo(() => {
        const sortTasks = (a: Task, b: Task) => {
            const aTop = tempTopIds.has(a.id);
            const bTop = tempTopIds.has(b.id);
            if (aTop && !bTop) return -1;
            if (!aTop && bTop) return 1;

            const aUrgent = a.isUrgent ? 1 : 0;
            const bUrgent = b.isUrgent ? 1 : 0;
            if (aUrgent !== bUrgent) {
                return bUrgent - aUrgent;
            }
            return b.timestamp - a.timestamp;
        };
        return [...rawTasks].sort(sortTasks);
    }, [rawTasks, tempTopIds]);

    return { tasks, loading, addTask, updateTask, deleteTask };
}
