import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import { ShoppingCart, X, Check, AlertCircle } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import BottomSheetWrapper from './BottomSheetWrapper';
import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';

const A = '#5eead4';
const QUICK_CHIPS = [
    { label: 'Meyve & Sebze', icon: '🥦' },
    { label: 'Süt Ürünleri', icon: '🥛' },
    { label: 'Et & Tavuk', icon: '🥩' },
    { label: 'Ekmek & Unlu', icon: '🍞' },
    { label: 'Temizlik', icon: '🧼' },
    { label: 'Kişisel Bakım', icon: '🧴' },
    { label: 'İçecek', icon: '🧃' },
    { label: 'Atıştırmalık', icon: '🍿' },
];

interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}

export default function ShoppingBottomSheet({ visible, onClose, onSave }: BottomSheetProps) {
    const { isDarkMode } = useThemeStore();
    const colors = getColors(isDarkMode);
    const styles = createStyles(colors);

    const [title, setTitle] = useState('');
    const [note, setNote] = useState('');
    const [category, setCategory] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);

    const urgentStyle = useAnimatedStyle(() => ({
        backgroundColor: isUrgent ? 'rgba(251,146,60,0.09)' : colors.border,
        borderColor: isUrgent ? 'rgba(251,146,60,0.5)' : colors.border,
    }));

    const handleSave = () => {
        if (!title.trim()) return;
        onSave({ title, note, category, isUrgent });
        setTitle(''); setNote(''); setCategory(''); setIsUrgent(false);
        onClose();
    };

    return (
        <BottomSheetWrapper visible={visible} onClose={onClose} accentColor={A}>
            <View style={styles.header}>
                <View style={styles.iconBox}>
                    <ShoppingCart size={20} color={A} />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.subtitle}>ALIŞVERİŞ</Text>
                    <Text style={styles.title}>Yeni Ürün Ekle</Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <X size={15} color="#8a93b5" />
                </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow} keyboardShouldPersistTaps="handled">
                    {QUICK_CHIPS.map(chip => {
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

                <Text style={styles.label}>ÜRÜN ADI</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ürün adı... (ör: Meyveli Yoğurt)"
                    placeholderTextColor="#47506f"
                    value={title}
                    onChangeText={setTitle}
                />

                <Text style={styles.label}>NOT (İSTEĞE BAĞLI)</Text>
                <TextInput
                    style={[styles.input, { height: undefined, paddingVertical: 12 }]}
                    placeholder="Not ekle (isteğe bağlı)..."
                    placeholderTextColor="#47506f"
                    value={note}
                    onChangeText={setNote}
                />

                <Animated.View style={[styles.urgentCard, urgentStyle]}>
                    <TouchableOpacity
                        style={styles.urgentRow}
                        activeOpacity={0.8}
                        onPress={() => setIsUrgent(!isUrgent)}
                    >
                        <View style={styles.urgentLeft}>
                            <View style={[styles.urgentIconBox, isUrgent && styles.urgentIconBoxActive]}>
                                <AlertCircle size={17} color={isUrgent ? '#fb923c' : colors.textSecondary} />
                            </View>
                            <View>
                                <Text style={[styles.urgentTitle, isUrgent && { color: '#fb923c' }]}>🚨 Acil</Text>
                                <Text style={styles.urgentSub}>Listenin en üstüne sabitle</Text>
                            </View>
                        </View>
                        <View style={[styles.toggleTrack, isUrgent && styles.toggleTrackActive]}>
                            <Animated.View style={[styles.toggleThumb, { transform: [{ translateX: isUrgent ? 22 : 0 }] }]} />
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                <TouchableOpacity
                    style={[styles.saveBtn, title.trim() ? (isUrgent ? styles.saveUrgent : styles.saveActive) : {}]}
                    activeOpacity={title.trim() ? 0.8 : 1}
                    onPress={handleSave}
                >
                    <Check size={19} color={title.trim() ? (isUrgent ? '#fff' : '#0c2825') : colors.textSecondary} />
                    <Text style={[styles.saveText, title.trim() && { color: isUrgent ? '#fff' : '#0c2825' }]}>
                        {isUrgent ? 'Acil Ekle' : 'Ürün Ekle'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </BottomSheetWrapper>
    );
}

function createStyles(colors: any) { return StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', padding: 18, paddingTop: 6 },
    iconBox: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(94,234,212,0.13)', borderColor: 'rgba(94,234,212,0.26)', borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    headerText: { flex: 1, marginLeft: 12 },
    subtitle: { color: colors.textSecondary, fontSize: 11, fontWeight: 'bold' },
    title: { color: colors.textPrimary, fontSize: 17, fontWeight: 'bold' },
    closeBtn: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 18, marginBottom: 18 },
    body: { paddingHorizontal: 18, paddingBottom: 90 },
    chipsRow: { gap: 7, paddingBottom: 16 },
    chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 13, borderRadius: 22, backgroundColor: colors.border, borderWidth: 1.5, borderColor: colors.border, gap: 5 },
    chipActive: { backgroundColor: 'rgba(94,234,212,0.13)', borderColor: 'rgba(94,234,212,0.7)' },
    chipIcon: { fontSize: 13 },
    chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '400' },
    chipTextActive: { color: A, fontWeight: '600' },
    label: { color: colors.textSecondary, fontSize: 11, fontWeight: 'bold', marginBottom: 8 },
    input: { backgroundColor: colors.border, borderRadius: 15, paddingHorizontal: 16, height: 50, color: colors.textPrimary, borderWidth: 1.5, borderColor: colors.border, marginBottom: 14 },
    urgentCard: { borderRadius: 16, borderWidth: 1.5, padding: 14, marginBottom: 20 },
    urgentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    urgentLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    urgentIconBox: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
    urgentIconBoxActive: { backgroundColor: 'rgba(248,113,113,0.3)', borderColor: 'rgba(251,146,60,0.5)' },
    urgentTitle: { color: colors.textPrimary, fontWeight: 'bold' },
    urgentSub: { color: colors.textSecondary, fontSize: 12 },
    toggleTrack: { width: 50, height: 28, borderRadius: 14, backgroundColor: colors.border, justifyContent: 'center', paddingHorizontal: 3 },
    toggleTrackActive: { backgroundColor: '#fb923c' },
    toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.5)' },
    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.border, padding: 17, borderRadius: 18, gap: 9 },
    saveActive: { backgroundColor: A },
    saveUrgent: { backgroundColor: '#ef4444' },
    saveText: { color: colors.textSecondary, fontWeight: 'bold', fontSize: 16 },
}); }
