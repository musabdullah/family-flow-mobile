import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import { CheckCircle, X, Check } from 'lucide-react-native';
import BottomSheetWrapper from './BottomSheetWrapper';
import { Task } from '../hooks/useTasks';

interface CompleteBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onSave: (id: string, note: string) => void;
    task: Task | null;
    accentColor: string;
}

export default function CompleteTaskBottomSheet({ visible, onClose, onSave, task, accentColor }: CompleteBottomSheetProps) {
    const [note, setNote] = useState('');

    const prevTask = useRef<Task | null>(null);

    useEffect(() => {
        if (task) {
            prevTask.current = task;
        }
    }, [task]);

    const displayTask = task || prevTask.current;

    useEffect(() => {
        if (visible) {
            setNote('');
        }
    }, [visible]);

    const handleSave = () => {
        if (!displayTask) return;
        onSave(displayTask.id, note.trim());
        onClose();
    };

    if (!displayTask) return null;

    return (
        <BottomSheetWrapper visible={visible} onClose={onClose} accentColor={accentColor}>
            <View style={styles.header}>
                <View style={[styles.iconBox, { backgroundColor: accentColor + '20', borderColor: accentColor + '40' }]}>
                    <CheckCircle size={20} color={accentColor} />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.subtitle}>GÖREVİ TAMAMLA</Text>
                    <Text style={styles.title} numberOfLines={1}>{displayTask.title}</Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <X size={15} color="#8a93b5" />
                </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={styles.promptText}>
                    Ailenize iletmek istediğiniz veya teslimatla ilgili eklemek istediğiniz bir not var mı?
                </Text>

                <Text style={styles.label}>TAMAMLAMA NOTU (İSTEĞE BAĞLI)</Text>
                <TextInput
                    style={[styles.input, { height: undefined, paddingVertical: 12, minHeight: 80 }]}
                    placeholder="Alındı, ödendi, ek notlar..."
                    placeholderTextColor="#47506f"
                    value={note}
                    onChangeText={setNote}
                    multiline
                />

                <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: accentColor }]}
                    activeOpacity={0.8}
                    onPress={handleSave}
                >
                    <Check size={19} color="#0c2825" />
                    <Text style={[styles.saveText, { color: '#0c2825' }]}>
                        {note.trim() ? "Not Ekle ve Tamamla" : "Mesajsız Tamamla"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </BottomSheetWrapper>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', padding: 18, paddingTop: 6 },
    iconBox: { width: 44, height: 44, borderRadius: 15, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    headerText: { flex: 1, marginLeft: 12 },
    subtitle: { color: '#4ade80', fontSize: 11, fontWeight: 'bold' },
    title: { color: '#e4e8f8', fontSize: 17, fontWeight: 'bold' },
    closeBtn: { width: 34, height: 34, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 18, marginBottom: 18 },
    body: { paddingHorizontal: 18, paddingBottom: 90 },
    promptText: { color: '#8a93b5', fontSize: 14, marginBottom: 20, lineHeight: 20 },
    label: { color: '#47506f', fontSize: 11, fontWeight: 'bold', marginBottom: 8 },
    input: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 15, paddingHorizontal: 16, height: 50, color: '#e4e8f8', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.09)', marginBottom: 24 },
    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 17, borderRadius: 18, gap: 9 },
    saveText: { fontWeight: 'bold', fontSize: 16 },
});
