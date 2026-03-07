import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import { Star, X, Check } from 'lucide-react-native';
import BottomSheetWrapper from './BottomSheetWrapper';
import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';

const A = '#f472b6';
const TASK_CHIPS = [
    { label: 'Ev İşi', icon: '🏠' },
    { label: 'Tamir', icon: '🔧' },
    { label: 'Bahçe', icon: '🌱' },
    { label: 'Evcil Hayvan', icon: '🐾' },
    { label: 'Sağlık', icon: '💊' },
    { label: 'Kişisel', icon: '✨' },
    { label: 'Teknoloji', icon: '💻' },
];

const PRIORITIES = [
    { value: 'düşük', label: 'Düşük', icon: '🟢', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
    { value: 'orta', label: 'Orta', icon: '🟡', color: '#fbbf6a', bg: 'rgba(251,191,106,0.12)' },
    { value: 'yüksek', label: 'Yüksek', icon: '🔴', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
];

interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}

export default function OthersBottomSheet({ visible, onClose, onSave }: BottomSheetProps) {
    const { isDarkMode } = useThemeStore();
    const colors = getColors(isDarkMode);
    const styles = createStyles(colors);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<string | null>(null);
    const [category, setCategory] = useState('');

    const handleSave = () => {
        if (!title.trim()) return;
        onSave({ title, description, priority, category });
        setTitle(''); setDescription(''); setPriority(null); setCategory('');
        onClose();
    };

    const activePriorityObj = PRIORITIES.find(p => p.value === priority);

    return (
        <BottomSheetWrapper visible={visible} onClose={onClose} accentColor={A}>
            <View style={styles.header}>
                <View style={styles.iconBox}>
                    <Star size={20} color={A} />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.subtitle}>DİĞERLERİ</Text>
                    <Text style={styles.title}>Yeni Görev Ekle</Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <X size={15} color="#8a93b5" />
                </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow} keyboardShouldPersistTaps="handled">
                    {TASK_CHIPS.map(chip => {
                        const active = category === chip.label;
                        return (
                            <TouchableOpacity
                                key={chip.label}
                                style={[styles.chip, active && styles.chipActive]}
                                onPress={() => setCategory(active ? '' : chip.label)}
                            >
                                <Text style={styles.chipIcon}>{chip.icon}</Text>
                                <Text style={[styles.chipText, active && styles.chipTextActive]}>{chip.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                <Text style={styles.label}>GÖREV ADI</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Görev adı... (ör: Garaj Kapısını Onar)"
                    placeholderTextColor="#47506f"
                    value={title}
                    onChangeText={setTitle}
                />

                <View style={styles.prioRow}>
                    <Text style={styles.label}>ÖNCELİK</Text>
                    <View style={styles.prioGrid}>
                        {PRIORITIES.map(p => {
                            const active = priority === p.value;
                            return (
                                <TouchableOpacity
                                    key={p.value}
                                    style={[styles.prioBtn, active && { backgroundColor: p.bg, borderColor: p.color + '55' }]}
                                    onPress={() => setPriority(active ? null : p.value)}
                                >
                                    <Text style={{ fontSize: 16, marginBottom: 4 }}>{p.icon}</Text>
                                    <Text style={[styles.prioBtnText, active && { color: p.color, fontWeight: '700' }]}>{p.label}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </View>

                <Text style={styles.label}>AÇIKLAMA / NOTLAR</Text>
                <TextInput
                    style={[styles.input, { height: 100, textAlignVertical: 'top', paddingTop: 14 }]}
                    placeholder="Detaylı açıklama..."
                    placeholderTextColor="#47506f"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />

                <TouchableOpacity
                    style={[styles.saveBtn, title.trim() ? styles.saveActive : {}]}
                    activeOpacity={title.trim() ? 0.8 : 1}
                    onPress={handleSave}
                >
                    <Check size={19} color={title.trim() ? '#fff' : colors.textSecondary} />
                    <Text style={[styles.saveText, title.trim() && { color: '#fff' }]}>Görev Ekle</Text>
                </TouchableOpacity>
            </ScrollView>
        </BottomSheetWrapper>
    );
}

function createStyles(colors: any) { return StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', padding: 18, paddingTop: 6 },
    iconBox: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(244,114,182,0.13)', borderColor: 'rgba(244,114,182,0.26)', borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    headerText: { flex: 1, marginLeft: 12 },
    subtitle: { color: colors.textSecondary, fontSize: 11, fontWeight: 'bold' },
    title: { color: colors.textPrimary, fontSize: 17, fontWeight: 'bold' },
    closeBtn: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 18, marginBottom: 18 },
    body: { paddingHorizontal: 18, paddingBottom: 90 },
    chipsRow: { gap: 7, paddingBottom: 16 },
    chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 13, borderRadius: 22, backgroundColor: colors.border, borderWidth: 1.5, borderColor: colors.border, gap: 5 },
    chipActive: { backgroundColor: 'rgba(244,114,182,0.13)', borderColor: 'rgba(244,114,182,0.7)' },
    chipIcon: { fontSize: 13 },
    chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '400' },
    chipTextActive: { color: A, fontWeight: '600' },
    label: { color: colors.textSecondary, fontSize: 11, fontWeight: 'bold', marginBottom: 8 },
    input: { backgroundColor: colors.border, borderRadius: 15, paddingHorizontal: 16, height: 50, color: colors.textPrimary, borderWidth: 1.5, borderColor: colors.border, marginBottom: 14 },
    prioRow: { marginBottom: 16 },
    prioGrid: { flexDirection: 'row', gap: 8 },
    prioBtn: { flex: 1, paddingVertical: 10, borderRadius: 13, backgroundColor: colors.border, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center' },
    prioBtnText: { color: colors.textSecondary, fontSize: 12 },
    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.border, padding: 17, borderRadius: 18, gap: 9 },
    saveActive: { backgroundColor: A },
    saveText: { color: colors.textSecondary, fontWeight: 'bold', fontSize: 16 },
}); }
