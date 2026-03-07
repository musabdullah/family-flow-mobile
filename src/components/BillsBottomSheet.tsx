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
import { Zap, X, Check } from 'lucide-react-native';
import BottomSheetWrapper from './BottomSheetWrapper';
import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';

const A = '#fbbf6a';

interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}

export default function BillsBottomSheet({ visible, onClose, onSave }: BottomSheetProps) {
    const { isDarkMode } = useThemeStore();
    const colors = getColors(isDarkMode);
    const styles = createStyles(colors);

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateObj, setDateObj] = useState(new Date());

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDateObj(selectedDate);
            const d = String(selectedDate.getDate()).padStart(2, '0');
            const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const y = selectedDate.getFullYear();
            setDueDate(`${d}.${m}.${y}`);
        }
    };

    const handleSave = () => {
        if (!title.trim()) return;
        onSave({ title, amount, dueDate });
        setTitle(''); setAmount(''); setDueDate('');
        onClose();
    };

    return (
        <BottomSheetWrapper visible={visible} onClose={onClose} accentColor={A}>
            <View style={styles.header}>
                <View style={styles.iconBox}>
                    <Zap size={20} color={A} />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.subtitle}>FATURALAR</Text>
                    <Text style={styles.title}>Yeni Fatura Ekle</Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <X size={15} color="#8a93b5" />
                </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={styles.label}>FATURA ADI</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ör: Elektrik Faturası"
                    placeholderTextColor="#47506f"
                    value={title}
                    onChangeText={setTitle}
                />

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
                    <>
                        <TouchableOpacity
                            style={[styles.input, { justifyContent: 'center' }]}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={{ color: dueDate ? colors.textPrimary : colors.textSecondary }}>
                                {dueDate || "Tarih Seçin (GG.AA.YYYY)"}
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
                    </>
                )}

                <TouchableOpacity
                    style={[styles.saveBtn, title.trim() ? styles.saveActive : {}]}
                    activeOpacity={title.trim() ? 0.8 : 1}
                    onPress={handleSave}
                >
                    <Check size={19} color={title.trim() ? '#fff' : colors.textSecondary} />
                    <Text style={[styles.saveText, title.trim() && { color: '#fff' }]}>Fatura Ekle</Text>
                </TouchableOpacity>
            </ScrollView>
        </BottomSheetWrapper>
    );
}

function createStyles(colors: any) { return StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', padding: 18, paddingTop: 6 },
    iconBox: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(251,191,106,0.13)', borderColor: 'rgba(251,191,106,0.26)', borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    headerText: { flex: 1, marginLeft: 12 },
    subtitle: { color: colors.textSecondary, fontSize: 11, fontWeight: 'bold' },
    title: { color: colors.textPrimary, fontSize: 17, fontWeight: 'bold' },
    closeBtn: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 18, marginBottom: 18 },
    body: { paddingHorizontal: 18, paddingBottom: 90 },
    label: { color: colors.textSecondary, fontSize: 11, fontWeight: 'bold', marginBottom: 8 },
    input: { backgroundColor: colors.border, borderRadius: 15, paddingHorizontal: 16, height: 50, color: colors.textPrimary, borderWidth: 1.5, borderColor: colors.border, marginBottom: 14 },
    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.border, padding: 17, borderRadius: 18, gap: 9 },
    saveActive: { backgroundColor: A },
    saveText: { color: colors.textSecondary, fontWeight: 'bold', fontSize: 16 },
}); }
