import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import { Zap, X, Check } from 'lucide-react-native';
import BottomSheetWrapper from './BottomSheetWrapper';

const A = '#fbbf6a';

interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}

export default function BillsBottomSheet({ visible, onClose, onSave }: BottomSheetProps) {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');

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
                <TextInput
                    style={styles.input}
                    placeholder="GG.AA.YYYY"
                    placeholderTextColor="#47506f"
                    value={dueDate}
                    onChangeText={setDueDate}
                />

                <TouchableOpacity
                    style={[styles.saveBtn, title.trim() ? styles.saveActive : {}]}
                    activeOpacity={title.trim() ? 0.8 : 1}
                    onPress={handleSave}
                >
                    <Check size={19} color={title.trim() ? '#fff' : '#47506f'} />
                    <Text style={[styles.saveText, title.trim() && { color: '#fff' }]}>Fatura Ekle</Text>
                </TouchableOpacity>
            </ScrollView>
        </BottomSheetWrapper>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', padding: 18, paddingTop: 6 },
    iconBox: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(251,191,106,0.13)', borderColor: 'rgba(251,191,106,0.26)', borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    headerText: { flex: 1, marginLeft: 12 },
    subtitle: { color: '#47506f', fontSize: 11, fontWeight: 'bold' },
    title: { color: '#e4e8f8', fontSize: 17, fontWeight: 'bold' },
    closeBtn: { width: 34, height: 34, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 18, marginBottom: 18 },
    body: { paddingHorizontal: 18, paddingBottom: 40 },
    label: { color: '#47506f', fontSize: 11, fontWeight: 'bold', marginBottom: 8 },
    input: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 15, paddingHorizontal: 16, height: 50, color: '#e4e8f8', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.09)', marginBottom: 14 },
    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 17, borderRadius: 18, gap: 9 },
    saveActive: { backgroundColor: A },
    saveText: { color: '#47506f', fontWeight: 'bold', fontSize: 16 },
});
