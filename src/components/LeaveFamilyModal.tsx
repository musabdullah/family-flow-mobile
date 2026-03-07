import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, BackHandler } from 'react-native';
import { ChevronLeft, LogOut, AlertTriangle, CheckCircle } from 'lucide-react-native';
import Animated, { SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';

interface LeaveFamilyModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirmLeave: () => void;
}

const CONFIRMATION_WORD = 'AYRILIYORUM';

export default function LeaveFamilyModal({ visible, onClose, onConfirmLeave }: LeaveFamilyModalProps) {
    const [inputValue, setInputValue] = useState('');
    const { isDarkMode } = useThemeStore();
    const colors = getColors(isDarkMode);
    const styles = createStyles(colors);

    useEffect(() => {
        if (visible) setInputValue('');
    }, [visible]);

    useEffect(() => {
        if (!visible) return;
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            onClose();
            return true;
        });
        return () => sub.remove();
    }, [visible, onClose]);

    if (!visible) return null;

    const isMatch = inputValue === CONFIRMATION_WORD;

    const handleLeave = () => {
        if (isMatch) {
            onConfirmLeave();
            onClose();
        }
    };

    return (
        <Animated.View
            entering={SlideInRight.duration(300)}
            exiting={SlideOutRight.duration(250)}
            style={styles.container}
        >
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
                        <ChevronLeft size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <View style={styles.headerTextWrap}>
                        <Text style={styles.headerTitle}>Aileden Ayrıl</Text>
                        <Text style={styles.headerSub}>Grubu terk etme onayı</Text>
                    </View>
                </View>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
                    <View style={styles.infoCard}>
                        <View style={styles.infoIconWrap}>
                            <AlertTriangle size={24} color={colors.warning} />
                        </View>
                        <View style={styles.infoTextWrap}>
                            <Text style={[styles.infoTitle, { color: colors.warning }]}>Önemli Bilgilendirme</Text>
                            <Text style={styles.infoDesc}>
                                Aileden ayrıldığınızda pano, görevler ve mesajlara olan erişiminizi kaybedersiniz.
                            </Text>
                            <Text style={[styles.infoDesc, { marginTop: 8, fontWeight: 'bold' }]}>
                                Daha önce eklediğiniz alışveriş kartları, faturalar veya planlar SİLİNMEZ, aile panosunda kalmaya devam eder.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.inputSection}>
                        <Text style={styles.sectionTitleLabel}>ONAY KELİMESİ</Text>
                        <Text style={styles.sectionHelper}>
                            Ayrılmak istediğinizi doğrulamak için lütfen aşağıya <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>{CONFIRMATION_WORD}</Text> yazın.
                        </Text>
                        <View style={styles.inputWrap}>
                            <TextInput
                                style={styles.input}
                                placeholder="AYRILIYORUM"
                                placeholderTextColor={colors.textSecondary}
                                value={inputValue}
                                onChangeText={setInputValue}
                                autoCapitalize="characters"
                            />
                            {isMatch && (
                                <View style={styles.successIcon}>
                                    <CheckCircle size={20} color="#10b981" />
                                </View>
                            )}
                        </View>
                    </View>

                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.leaveBtn, isMatch ? styles.leaveBtnActive : styles.leaveBtnDisabled]}
                        activeOpacity={isMatch ? 0.8 : 1}
                        onPress={handleLeave}
                        disabled={!isMatch}
                    >
                        <LogOut size={20} color={isMatch ? '#fff' : colors.textSecondary} />
                        <Text style={[styles.leaveBtnText, isMatch && { color: '#fff' }]}>Aileden Ayrılığı Onayla</Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </Animated.View>
    );
}

function createStyles(colors: any) {
    return StyleSheet.create({
        container: {
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: colors.background,
            zIndex: 999,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: Platform.OS === 'ios' ? 60 : 20,
            paddingBottom: 15,
            paddingHorizontal: 20,
            backgroundColor: colors.card,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        backBtn: {
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 15,
        },
        headerTextWrap: {
            flex: 1,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.textPrimary,
        },
        headerSub: {
            fontSize: 13,
            color: colors.textSecondary,
        },
        content: {
            padding: 20,
            paddingBottom: 40,
        },
        infoCard: {
            flexDirection: 'row',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            borderWidth: 1.5,
            borderColor: 'rgba(239, 68, 68, 0.3)',
            borderRadius: 16,
            padding: 16,
            marginBottom: 25,
        },
        infoIconWrap: {
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
        },
        infoTextWrap: {
            flex: 1,
        },
        infoTitle: {
            fontSize: 15,
            fontWeight: 'bold',
            marginBottom: 6,
        },
        infoDesc: {
            fontSize: 13,
            color: colors.textSecondary,
            lineHeight: 20,
        },
        inputSection: {
            marginBottom: 20,
        },
        sectionTitleLabel: {
            fontSize: 12,
            fontWeight: 'bold',
            color: colors.textSecondary,
            marginBottom: 8,
            letterSpacing: 0.5,
        },
        sectionHelper: {
            fontSize: 13,
            color: colors.textSecondary,
            marginBottom: 12,
            lineHeight: 18,
        },
        inputWrap: {
            position: 'relative',
        },
        input: {
            backgroundColor: colors.card,
            borderWidth: 1.5,
            borderColor: colors.border,
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingRight: 45,
            height: 56,
            fontSize: 16,
            color: colors.textPrimary,
            fontWeight: 'bold',
            letterSpacing: 2,
        },
        successIcon: {
            position: 'absolute',
            right: 16,
            top: 18,
        },
        footer: {
            padding: 20,
            paddingBottom: Platform.OS === 'ios' ? 40 : 20,
            backgroundColor: colors.card,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        leaveBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            height: 56,
            borderRadius: 16,
            gap: 10,
        },
        leaveBtnDisabled: {
            backgroundColor: colors.border,
        },
        leaveBtnActive: {
            backgroundColor: colors.warning,
            shadowColor: colors.warning,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
        },
        leaveBtnText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.textSecondary,
        }
    });
}
