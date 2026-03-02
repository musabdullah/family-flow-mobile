import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import { Calendar, X, Check, MapPin, Clock } from 'lucide-react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import BottomSheetWrapper from './BottomSheetWrapper';

const A = '#a78bfa';
const PLAN_CHIPS = [
    { label: 'Aile', icon: '👨‍👩‍👧‍👦' }, { label: 'Eğlence', icon: '🎬' },
    { label: 'Yemek', icon: '🍽️' }, { label: 'Spor', icon: '⚽' },
    { label: 'Seyahat', icon: '✈️' }, { label: 'Toplantı', icon: '💼' },
    { label: 'Kutlama', icon: '🎉' },
];

interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}

export default function PlansBottomSheet({ visible, onClose, onSave }: BottomSheetProps) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('');
    const [showDatePanel, setShowDatePanel] = useState(false);

    const handleSave = () => {
        if (!title.trim()) return;
        onSave({ title, date, time, location, category });
        setTitle(''); setDate(''); setTime(''); setLocation(''); setCategory('');
        onClose();
    };

    return (
        <BottomSheetWrapper visible={visible} onClose={onClose} accentColor={A}>
            <View style={styles.header}>
                <View style={styles.iconBox}>
                    <Calendar size={20} color={A} />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.subtitle}>PLANLAR</Text>
                    <Text style={styles.title}>Yeni Plan Ekle</Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <X size={15} color="#8a93b5" />
                </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                    {PLAN_CHIPS.map(chip => {
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

                <Text style={styles.label}>PLAN ADI</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Plan adı... (ör: Aile Pikniği)"
                    placeholderTextColor="#47506f"
                    value={title}
                    onChangeText={setTitle}
                />

                <View style={styles.dateTimeRow}>
                    <TouchableOpacity
                        style={[styles.timeBtn, (date || time || showDatePanel) && styles.timeBtnActive]}
                        onPress={() => setShowDatePanel(!showDatePanel)}
                    >
                        <Clock size={16} color={(date || time || showDatePanel) ? A : '#47506f'} />
                        <Text style={[styles.timeBtnText, (date || time || showDatePanel) && { color: A }]}>
                            {date ? date : (time || 'Tarih & Saat')}
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.locInputWrapper}>
                        <MapPin size={16} color={location ? A : '#47506f'} style={styles.locIcon} />
                        <TextInput
                            style={styles.locInput}
                            placeholder="Konum/Link"
                            placeholderTextColor="#47506f"
                            value={location}
                            onChangeText={setLocation}
                        />
                    </View>
                </View>

                {showDatePanel && (
                    <View style={styles.datePanel}>
                        <Text style={{ color: '#8a93b5', marginBottom: 10 }}>Tarih Seçimi (Yakında)</Text>
                        {/* Simple toggle inputs for now */}
                        <TextInput style={styles.input} placeholder="Tarih girin (GG.AA.YYYY)" placeholderTextColor="#47506f" value={date} onChangeText={setDate} />
                        <TextInput style={styles.input} placeholder="Saat girin (SS:DD)" placeholderTextColor="#47506f" value={time} onChangeText={setTime} />
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.saveBtn, title.trim() ? styles.saveActive : {}]}
                    activeOpacity={title.trim() ? 0.8 : 1}
                    onPress={handleSave}
                >
                    <Check size={19} color={title.trim() ? '#fff' : '#47506f'} />
                    <Text style={[styles.saveText, title.trim() && { color: '#fff' }]}>Plan Ekle</Text>
                </TouchableOpacity>
            </ScrollView>
        </BottomSheetWrapper>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', padding: 18, paddingTop: 6 },
    iconBox: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(167,139,250,0.13)', borderColor: 'rgba(167,139,250,0.26)', borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    headerText: { flex: 1, marginLeft: 12 },
    subtitle: { color: '#47506f', fontSize: 11, fontWeight: 'bold' },
    title: { color: '#e4e8f8', fontSize: 17, fontWeight: 'bold' },
    closeBtn: { width: 34, height: 34, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 18, marginBottom: 18 },
    body: { paddingHorizontal: 18, paddingBottom: 40 },
    chipsRow: { gap: 7, paddingBottom: 16 },
    chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 13, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.09)', gap: 5 },
    chipActive: { backgroundColor: 'rgba(167,139,250,0.13)', borderColor: 'rgba(167,139,250,0.7)' },
    chipIcon: { fontSize: 13 },
    chipText: { color: '#8a93b5', fontSize: 13, fontWeight: '400' },
    chipTextActive: { color: A, fontWeight: '600' },
    label: { color: '#47506f', fontSize: 11, fontWeight: 'bold', marginBottom: 8 },
    input: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 15, paddingHorizontal: 16, height: 50, color: '#e4e8f8', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.09)', marginBottom: 14 },
    dateTimeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    timeBtn: { flex: 1, height: 50, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 15, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.09)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    timeBtnActive: { backgroundColor: 'rgba(167,139,250,0.13)', borderColor: 'rgba(167,139,250,0.44)' },
    timeBtnText: { color: '#47506f', fontSize: 13 },
    locInputWrapper: { flex: 1, position: 'relative', justifyContent: 'center' },
    locIcon: { position: 'absolute', left: 12, zIndex: 1 },
    locInput: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 15, paddingLeft: 34, paddingRight: 10, height: 50, color: '#e4e8f8', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.09)' },
    datePanel: { backgroundColor: '#191c2c', borderRadius: 20, padding: 14, marginBottom: 20, borderWidth: 1.5, borderColor: 'rgba(167,139,250,0.3)' },
    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 17, borderRadius: 18, gap: 9 },
    saveActive: { backgroundColor: A },
    saveText: { color: '#47506f', fontWeight: 'bold', fontSize: 16 },
});
