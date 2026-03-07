import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
let DateTimePicker: any = null;
if (!isExpoGo) {
    try {
        DateTimePicker = require('@react-native-community/datetimepicker').default;
    } catch (e) { console.warn('DateTimePicker not found'); }
}
import { Calendar, X, Check, MapPin, Clock } from 'lucide-react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import BottomSheetWrapper from './BottomSheetWrapper';
import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';

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
    const { isDarkMode } = useThemeStore();
    const colors = getColors(isDarkMode);
    const styles = createStyles(colors);

    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('');
    const [showDatePanel, setShowDatePanel] = useState(false);

    // Date/Time Pickers state
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [dateObj, setDateObj] = useState(new Date());

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDateObj(selectedDate);
            const d = String(selectedDate.getDate()).padStart(2, '0');
            const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const y = selectedDate.getFullYear();
            setDate(`${d}.${m}.${y}`);
        }
    };

    const handleTimeChange = (event: any, selectedTime?: Date) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (selectedTime) {
            // Keep the same date object so time gets attached to it
            setDateObj(selectedTime);
            const h = String(selectedTime.getHours()).padStart(2, '0');
            const min = String(selectedTime.getMinutes()).padStart(2, '0');
            setTime(`${h}:${min}`);
        }
    };

    const handleSave = () => {
        if (!title.trim()) return;
        onSave({ title, date, time, location, category });
        setTitle(''); setDate(''); setTime(''); setLocation(''); setCategory('');
        setShowDatePanel(false);
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
                    <X size={15} color={colors.textSecondary} />
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
                    placeholderTextColor={colors.textSecondary}
                    value={title}
                    onChangeText={setTitle}
                />

                <View style={styles.dateTimeRow}>
                    <TouchableOpacity
                        style={[styles.timeBtn, (date || time || showDatePanel) && styles.timeBtnActive]}
                        onPress={() => setShowDatePanel(!showDatePanel)}
                    >
                        <Clock size={16} color={(date || time || showDatePanel) ? A : colors.textSecondary} />
                        <Text style={[styles.timeBtnText, (date || time || showDatePanel) && { color: A }]}>
                            {date ? date : (time || 'Tarih & Saat')}
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.locInputWrapper}>
                        <MapPin size={16} color={location ? A : colors.textSecondary} style={styles.locIcon} />
                        <TextInput
                            style={styles.locInput}
                            placeholder="Konum/Link"
                            placeholderTextColor={colors.textSecondary}
                            value={location}
                            onChangeText={setLocation}
                        />
                    </View>
                </View>

                {showDatePanel && (
                    <View style={styles.datePanel}>
                        <Text style={{ color: colors.textSecondary, marginBottom: 10 }}>Tarih Seçimi</Text>

                        {isExpoGo ? (
                            <>
                                <TextInput style={styles.input} placeholder="Tarih girin (GG.AA.YYYY)" placeholderTextColor={colors.textSecondary} value={date} onChangeText={setDate} />
                                <TextInput style={styles.input} placeholder="Saat girin (SS:DD)" placeholderTextColor={colors.textSecondary} value={time} onChangeText={setTime} />
                            </>
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={[styles.input, { justifyContent: 'center' }]}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text style={{ color: date ? colors.textPrimary : colors.textSecondary }}>
                                        {date || "Tarih Seçin (GG.AA.YYYY)"}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.input, { justifyContent: 'center' }]}
                                    onPress={() => setShowTimePicker(true)}
                                >
                                    <Text style={{ color: time ? colors.textPrimary : colors.textSecondary }}>
                                        {time || "Saat Seçin (SS:DD)"}
                                    </Text>
                                </TouchableOpacity>

                                {showDatePicker && DateTimePicker && (
                                    <DateTimePicker
                                        value={dateObj}
                                        mode="date"
                                        display="default"
                                        onChange={handleDateChange}
                                    />
                                )}

                                {showTimePicker && DateTimePicker && (
                                    <DateTimePicker
                                        value={dateObj}
                                        mode="time"
                                        display="default"
                                        onChange={handleTimeChange}
                                    />
                                )}
                            </>
                        )}
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.saveBtn, title.trim() ? styles.saveActive : {}]}
                    activeOpacity={title.trim() ? 0.8 : 1}
                    onPress={handleSave}
                >
                    <Check size={19} color={title.trim() ? '#fff' : colors.textSecondary} />
                    <Text style={[styles.saveText, title.trim() && { color: '#fff' }]}>Plan Ekle</Text>
                </TouchableOpacity>
            </ScrollView>
        </BottomSheetWrapper>
    );
}

function createStyles(colors: any) {
    return StyleSheet.create({
        header: { flexDirection: 'row', alignItems: 'center', padding: 18, paddingTop: 6 },
        iconBox: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(167,139,250,0.13)', borderColor: 'rgba(167,139,250,0.26)', borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
        headerText: { flex: 1, marginLeft: 12 },
        subtitle: { color: colors.textSecondary, fontSize: 11, fontWeight: 'bold' },
        title: { color: colors.textPrimary, fontSize: 17, fontWeight: 'bold' },
        closeBtn: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
        divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 18, marginBottom: 18 },
        body: { paddingHorizontal: 18, paddingBottom: 90 },
        chipsRow: { gap: 7, paddingBottom: 16 },
        chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 13, borderRadius: 22, backgroundColor: colors.border, borderWidth: 1.5, borderColor: colors.border, gap: 5 },
        chipActive: { backgroundColor: 'rgba(167,139,250,0.13)', borderColor: 'rgba(167,139,250,0.7)' },
        chipIcon: { fontSize: 13 },
        chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '400' },
        chipTextActive: { color: A, fontWeight: '600' },
        label: { color: colors.textSecondary, fontSize: 11, fontWeight: 'bold', marginBottom: 8 },
        input: { backgroundColor: colors.border, borderRadius: 15, paddingHorizontal: 16, height: 50, color: colors.textPrimary, borderWidth: 1.5, borderColor: colors.border, marginBottom: 14 },
        dateTimeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
        timeBtn: { flex: 1, height: 50, backgroundColor: colors.border, borderRadius: 15, borderWidth: 1.5, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
        timeBtnActive: { backgroundColor: 'rgba(167,139,250,0.13)', borderColor: 'rgba(167,139,250,0.44)' },
        timeBtnText: { color: colors.textSecondary, fontSize: 13 },
        locInputWrapper: { flex: 1, position: 'relative', justifyContent: 'center' },
        locIcon: { position: 'absolute', left: 12, zIndex: 1 },
        locInput: { backgroundColor: colors.border, borderRadius: 15, paddingLeft: 34, paddingRight: 10, height: 50, color: colors.textPrimary, borderWidth: 1.5, borderColor: colors.border },
        datePanel: { backgroundColor: colors.card, borderRadius: 20, padding: 14, marginBottom: 20, borderWidth: 1.5, borderColor: colors.border },
        saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.border, padding: 17, borderRadius: 18, gap: 9 },
        saveActive: { backgroundColor: A },
        saveText: { color: colors.textSecondary, fontWeight: 'bold', fontSize: 16 },
    });
}
