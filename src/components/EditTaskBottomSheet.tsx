import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
let DateTimePicker: any = null;
if (!isExpoGo) {
    try {
        DateTimePicker = require('@react-native-community/datetimepicker').default;
    } catch (e) { console.warn('DateTimePicker not found'); }
}
import { Save, X, AlertCircle, Trash2, Edit3 } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import BottomSheetWrapper from './BottomSheetWrapper';
import { Task } from '../hooks/useTasks';
import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';

const SHOPPING_CHIPS = [
    { label: 'Meyve & Sebze', icon: '🥦' }, { label: 'Süt Ürünleri', icon: '🥛' },
    { label: 'Et & Tavuk', icon: '🥩' }, { label: 'Ekmek & Unlu', icon: '🍞' },
    { label: 'Temizlik', icon: '🧼' }, { label: 'Kişisel Bakım', icon: '🧴' },
    { label: 'İçecek', icon: '🧃' }, { label: 'Atıştırmalık', icon: '🍿' },
];

const PLAN_CHIPS = [
    { label: 'Aile', icon: '👨‍👩‍👧‍👦' }, { label: 'Eğlence', icon: '🎬' },
    { label: 'Yemek', icon: '🍽️' }, { label: 'Spor', icon: '⚽' },
    { label: 'Seyahat', icon: '✈️' }, { label: 'Toplantı', icon: '💼' },
    { label: 'Kutlama', icon: '🎉' },
];

const TASK_CHIPS = [
    { label: 'Ev İşi', icon: '🏠' }, { label: 'Tamir', icon: '🔧' },
    { label: 'Bahçe', icon: '🌱' }, { label: 'Evcil Hayvan', icon: '🐾' },
    { label: 'Sağlık', icon: '💊' }, { label: 'Kişisel', icon: '✨' },
    { label: 'Teknoloji', icon: '💻' },
];

interface EditBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onSave: (id: string, updates: Partial<Task>) => void;
    onDelete: (id: string) => void;
    task: Task | null;
    accentColor: string;
}

export default function EditTaskBottomSheet({ visible, onClose, onSave, onDelete, task, accentColor }: EditBottomSheetProps) {
    const { isDarkMode } = useThemeStore();
    const colors = getColors(isDarkMode);
    const styles = createStyles(colors);

    const [title, setTitle] = useState('');
    const [note, setNote] = useState('');
    const [tag, setTag] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);

    // Dynamic fields
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [planDate, setPlanDate] = useState('');
    const [planTime, setPlanTime] = useState('');
    const [planLoc, setPlanLoc] = useState('');

    // Date/Time Pickers state
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [dateObj, setDateObj] = useState(new Date());
    const [activeDateField, setActiveDateField] = useState<'dueDate' | 'planDate' | null>(null);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDateObj(selectedDate);
            const d = String(selectedDate.getDate()).padStart(2, '0');
            const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const y = selectedDate.getFullYear();
            const formatted = `${d}.${m}.${y}`;
            if (activeDateField === 'dueDate') setDueDate(formatted);
            if (activeDateField === 'planDate') setPlanDate(formatted);
        }
    };

    const handleTimeChange = (event: any, selectedTime?: Date) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (selectedTime) {
            setDateObj(selectedTime);
            const h = String(selectedTime.getHours()).padStart(2, '0');
            const min = String(selectedTime.getMinutes()).padStart(2, '0');
            setPlanTime(`${h}:${min}`);
        }
    };

    const openDatePicker = (field: 'dueDate' | 'planDate', currentValue: string) => {
        setActiveDateField(field);
        if (currentValue) {
            const parts = currentValue.split('.');
            if (parts.length === 3) {
                const date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
                if (!isNaN(date.getTime())) setDateObj(date);
            }
        } else {
            setDateObj(new Date());
        }
        setShowDatePicker(true);
    };

    const openTimePicker = (currentValue: string) => {
        if (currentValue) {
            const parts = currentValue.split(':');
            if (parts.length === 2) {
                const date = new Date();
                date.setHours(Number(parts[0]), Number(parts[1]));
                if (!isNaN(date.getTime())) setDateObj(date);
            }
        } else {
            setDateObj(new Date());
        }
        setShowTimePicker(true);
    };

    const prevTask = useRef<Task | null>(null);

    useEffect(() => {
        if (task) {
            prevTask.current = task;
        }
    }, [task]);

    // During the exit animation, `task` might be null because the parent cleared it.
    // We use `prevTask.current` so the UI doesn't suddenly disappear before the slide-down finishes.
    const displayTask = task || prevTask.current;

    useEffect(() => {
        if (displayTask && visible) {
            setTitle(displayTask.title);
            setTag(displayTask.tag || '');
            setIsUrgent(displayTask.isUrgent || false);

            let currentNote = displayTask.note || '';
            let newAmount = '', newDueDate = '', newPlanDate = '', newPlanTime = '', newPlanLoc = '';

            if (displayTask.columnId === 'faturalar') {
                const aMatch = currentNote.match(/💸\s*(.*?)\s*₺/);
                if (aMatch) newAmount = aMatch[1];
                const dMatch = currentNote.match(/Son Ödeme:\s*(.*?)(?:\s*\||$)/);
                if (dMatch) newDueDate = dMatch[1];
            } else if (displayTask.columnId === 'planlar') {
                const dMatch = currentNote.match(/📅\s*(.*?)(?:\s*\||$)/);
                if (dMatch) newPlanDate = dMatch[1];
                const tMatch = currentNote.match(/⏰\s*(.*?)(?:\s*\||$)/);
                if (tMatch) newPlanTime = tMatch[1];
                const lMatch = currentNote.match(/📍\s*(.*?)(?:\s*\||$)/);
                if (lMatch) newPlanLoc = lMatch[1];
            }

            setAmount(newAmount);
            setDueDate(newDueDate);
            setPlanDate(newPlanDate);
            setPlanTime(newPlanTime);
            setPlanLoc(newPlanLoc);
            setNote(currentNote);
        }
    }, [displayTask, visible]);

    const urgentStyle = useAnimatedStyle(() => ({
        backgroundColor: isUrgent ? 'rgba(251,146,60,0.09)' : colors.border,
        borderColor: isUrgent ? 'rgba(251,146,60,0.5)' : colors.border,
    }));

    const handleSave = () => {
        if (!title.trim() || !task) return;

        let finalNote = note;
        if (task.columnId === 'faturalar') {
            let parts = [];
            if (amount) parts.push(`💸 ${amount} ₺`);
            if (dueDate) parts.push(`⏳ Son Ödeme: ${dueDate}`);
            finalNote = parts.join(' | ');
        } else if (task.columnId === 'planlar') {
            let parts = [];
            if (planDate) parts.push(`📅 ${planDate}`);
            if (planTime) parts.push(`⏰ ${planTime}`);
            if (planLoc) parts.push(`📍 ${planLoc}`);
            finalNote = parts.join(' | ');
        }

        onSave(task.id, { title, note: finalNote, tag, isUrgent });
        onClose();
    };

    const handleDelete = () => {
        if (!displayTask) return;
        onDelete(displayTask.id);
        onClose();
    };

    if (!displayTask) return null;

    const renderCategoryChips = () => {
        let chips: { label: string, icon: string }[] = [];
        if (displayTask.columnId === 'alisveris') chips = SHOPPING_CHIPS;
        else if (displayTask.columnId === 'planlar') chips = PLAN_CHIPS;
        else if (displayTask.columnId === 'diger') chips = TASK_CHIPS;

        if (chips.length === 0) return null; // No chips for 'faturalar'

        return (
            <View style={{ marginBottom: 14 }}>
                <Text style={styles.label}>KATEGORİ</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow} keyboardShouldPersistTaps="handled">
                    {chips.map(chip => {
                        const active = tag === chip.label;
                        return (
                            <TouchableOpacity
                                key={chip.label}
                                style={[styles.chip, active && { backgroundColor: accentColor + '20', borderColor: accentColor }]}
                                onPress={() => setTag(active ? '' : chip.label)}
                            >
                                <Text style={styles.chipIcon}>{chip.icon}</Text>
                                <Text style={[styles.chipText, active && { color: accentColor, fontWeight: '600' }]}>{chip.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        );
    };

    return (
        <BottomSheetWrapper visible={visible} onClose={onClose} accentColor={accentColor}>
            <View style={styles.header}>
                <View style={[styles.iconBox, { backgroundColor: accentColor + '20', borderColor: accentColor + '40' }]}>
                    <Edit3 size={20} color={accentColor} />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.subtitle}>GÖREVİ DÜZENLE</Text>
                    <Text style={styles.title} numberOfLines={1}>{displayTask.title}</Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <X size={15} color="#8a93b5" />
                </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                <Text style={styles.label}>GÖREV ADI</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Görev adı..."
                    placeholderTextColor="#47506f"
                    value={title}
                    onChangeText={setTitle}
                />

                {renderCategoryChips()}

                {displayTask.columnId === 'faturalar' ? (
                    <>
                        <Text style={styles.label}>TUTAR (₺)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            placeholderTextColor="#47506f"
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                        />
                        <Text style={styles.label}>SON ÖDEME TARİHİ</Text>
                        {isExpoGo ? (
                            <TextInput
                                style={styles.input}
                                placeholder="GG.AA.YYYY"
                                placeholderTextColor="#47506f"
                                value={dueDate}
                                onChangeText={setDueDate}
                            />
                        ) : (
                            <TouchableOpacity
                                style={[styles.input, { justifyContent: 'center' }]}
                                onPress={() => openDatePicker('dueDate', dueDate)}
                            >
                                <Text style={{ color: dueDate ? colors.textPrimary : colors.textSecondary }}>
                                    {dueDate || "Tarih Seçin (GG.AA.YYYY)"}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </>
                ) : displayTask.columnId === 'planlar' ? (
                    <>
                        <Text style={styles.label}>TARİH (GG.AA.YYYY)</Text>
                        {isExpoGo ? (
                            <TextInput
                                style={styles.input}
                                placeholder="Tarih girin..."
                                placeholderTextColor="#47506f"
                                value={planDate}
                                onChangeText={setPlanDate}
                            />
                        ) : (
                            <TouchableOpacity
                                style={[styles.input, { justifyContent: 'center' }]}
                                onPress={() => openDatePicker('planDate', planDate)}
                            >
                                <Text style={{ color: planDate ? colors.textPrimary : colors.textSecondary }}>
                                    {planDate || "Tarih Seçin (GG.AA.YYYY)"}
                                </Text>
                            </TouchableOpacity>
                        )}

                        <Text style={styles.label}>SAAT (SS:DD)</Text>
                        {isExpoGo ? (
                            <TextInput
                                style={styles.input}
                                placeholder="Saat girin..."
                                placeholderTextColor="#47506f"
                                value={planTime}
                                onChangeText={setPlanTime}
                            />
                        ) : (
                            <TouchableOpacity
                                style={[styles.input, { justifyContent: 'center' }]}
                                onPress={() => openTimePicker(planTime)}
                            >
                                <Text style={{ color: planTime ? colors.textPrimary : colors.textSecondary }}>
                                    {planTime || "Saat Seçin (SS:DD)"}
                                </Text>
                            </TouchableOpacity>
                        )}
                        <Text style={styles.label}>KONUM / LİNK</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Konum ekle..."
                            placeholderTextColor="#47506f"
                            value={planLoc}
                            onChangeText={setPlanLoc}
                        />
                    </>
                ) : (
                    <>
                        <Text style={styles.label}>AÇIKLAMA / NOT (İSTEĞE BAĞLI)</Text>
                        <TextInput
                            style={[styles.input, { height: undefined, paddingVertical: 12, minHeight: 80 }]}
                            placeholder="Not ekle..."
                            placeholderTextColor="#47506f"
                            value={note}
                            onChangeText={setNote}
                            multiline
                        />
                    </>
                )}

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
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.deleteBtn]}
                        activeOpacity={0.8}
                        onPress={handleDelete}
                    >
                        <Trash2 size={19} color="#ef4444" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.saveBtn, { backgroundColor: title.trim() ? accentColor : colors.border }]}
                        activeOpacity={title.trim() ? 0.8 : 1}
                        onPress={handleSave}
                        disabled={!title.trim()}
                    >
                        <Save size={19} color={title.trim() ? '#0c2825' : colors.textSecondary} />
                        <Text style={[styles.saveText, title.trim() && { color: '#0c2825' }]}>
                            Güncelle
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </BottomSheetWrapper>
    );
}

function createStyles(colors: any) { return StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', padding: 18, paddingTop: 6 },
    iconBox: { width: 44, height: 44, borderRadius: 15, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    headerText: { flex: 1, marginLeft: 12 },
    subtitle: { color: colors.textSecondary, fontSize: 11, fontWeight: 'bold' },
    title: { color: colors.textPrimary, fontSize: 17, fontWeight: 'bold' },
    closeBtn: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 18, marginBottom: 18 },
    body: { paddingHorizontal: 18, paddingBottom: 90 },
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
    actionRow: { flexDirection: 'row', gap: 12 },
    saveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 17, borderRadius: 18, gap: 9 },
    saveText: { color: colors.textSecondary, fontWeight: 'bold', fontSize: 16 },
    deleteBtn: { width: 60, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', borderRadius: 18 },
    chipsRow: { gap: 7, paddingBottom: 4 },
    chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 13, borderRadius: 22, backgroundColor: colors.border, borderWidth: 1.5, borderColor: colors.border, gap: 5 },
    chipIcon: { fontSize: 13 },
    chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '400' },
}); }
