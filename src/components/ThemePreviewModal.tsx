import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Switch, Dimensions } from 'react-native';
import { Sun, Moon, ShoppingCart, Zap, Calendar, Star, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface Props {
    visible: boolean;
    onClose: () => void;
}

export default function ThemePreviewModal({ visible, onClose }: Props) {
    const [isDark, setIsDark] = useState(true);

    // Define our prototype theme colors
    const colors = {
        background: isDark ? '#12141c' : '#f8fafc',
        card: isDark ? '#1e2133' : '#ffffff',
        textPrimary: isDark ? '#e4e8f8' : '#1e293b',
        textSecondary: isDark ? '#8a93b5' : '#64748b',
        border: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
        headerBg: isDark ? '#181b27' : '#ffffff',
        iconBoxBg: isDark ? 'rgba(167,139,250,0.12)' : 'rgba(167,139,250,0.15)',
        accent: '#a78bfa',
        accentDim: '#7c5cd6'
    };

    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20
        },
        container: {
            width: '100%',
            backgroundColor: colors.background,
            borderRadius: 24,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 5
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 20,
            backgroundColor: colors.headerBg,
            borderBottomWidth: 1,
            borderBottomColor: colors.border
        },
        title: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.textPrimary
        },
        body: {
            padding: 20,
            gap: 20
        },
        previewSection: {
            gap: 12
        },
        sectionTitle: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 1
        },
        // Mock components
        statBox: {
            padding: 16,
            borderRadius: 16,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center'
        },
        taskCard: {
            padding: 16,
            borderRadius: 16,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12
        },
        iconBox: {
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: colors.iconBoxBg,
            justifyContent: 'center',
            alignItems: 'center'
        },
        toggleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.card,
            padding: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border
        }
    });

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Tema Vitrini 🎨</Text>
                        <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                            <X size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Body */}
                    <View style={styles.body}>

                        {/* Toggle Switch */}
                        <View style={styles.toggleRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                {isDark ? <Moon color={colors.textPrimary} size={20} /> : <Sun color="#fbbf6a" size={20} />}
                                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
                                    {isDark ? "Koyu Tema" : "Açık Tema"}
                                </Text>
                            </View>
                            <Switch
                                value={isDark}
                                onValueChange={setIsDark}
                                trackColor={{ false: '#cbd5e1', true: '#a78bfa' }}
                                thumbColor="#fff"
                            />
                        </View>

                        {/* Preview: Stat Box */}
                        <View style={styles.previewSection}>
                            <Text style={styles.sectionTitle}>Örnek İstatistik Kutusu</Text>
                            <View style={styles.statBox}>
                                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.accent, marginBottom: 4 }}>42</Text>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary }}>Aktif Görevler</Text>
                            </View>
                        </View>

                        {/* Preview: Task Card */}
                        <View style={styles.previewSection}>
                            <Text style={styles.sectionTitle}>Örnek Görev Kartı</Text>
                            <View style={styles.taskCard}>
                                <View style={styles.iconBox}>
                                    <ShoppingCart size={20} color={colors.accent} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 2 }}>Süt ve Ekmek Al</Text>
                                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>Kapanmadan alalım</Text>
                                </View>
                                <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.border }} />
                            </View>
                        </View>

                        {/* Submit/Apply Note */}
                        <Text style={{ textAlign: 'center', color: colors.textSecondary, fontSize: 12, marginTop: 10 }}>
                            Bu renkler hoşuna giderse, onayladığında tüm uygulamaya entegre edilecek!
                        </Text>

                    </View>
                </View>
            </View>
        </Modal>
    );
}
