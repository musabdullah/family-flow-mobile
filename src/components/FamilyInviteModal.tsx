import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert, BackHandler } from 'react-native';
import { ChevronLeft, Users, Send, Check, Trash2, Hourglass } from 'lucide-react-native';
import Animated, { SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { collection, query, where, onSnapshot, setDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';

type InviteStatus = 'pending' | 'accepted';

interface Invite {
    id: string; // usually email
    email: string;
    familyId: string;
    inviterName: string;
    status: InviteStatus;
}

interface FamilyInviteModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function FamilyInviteModal({ visible, onClose }: FamilyInviteModalProps) {
    const [emailInput, setEmailInput] = useState('');
    const [invites, setInvites] = useState<Invite[]>([]);
    const { user } = useAuthStore();
    const { isDarkMode } = useThemeStore();
    const colors = getColors(isDarkMode);
    const styles = createStyles(colors);

    useEffect(() => {
        if (!visible || !user?.familyId) return;

        const q = query(collection(db, 'invites'), where('familyId', '==', user.familyId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invite));
            // Sort accepted first, then pending
            data.sort((a, b) => {
                if (a.status === 'accepted' && b.status !== 'accepted') return -1;
                if (a.status !== 'accepted' && b.status === 'accepted') return 1;
                return 0;
            });
            setInvites(data);
        });

        return () => unsubscribe();
    }, [visible, user?.familyId]);

    useEffect(() => {
        if (!visible) return;
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            onClose();
            return true;
        });
        return () => sub.remove();
    }, [visible, onClose]);

    if (!visible) return null;

    const handleSend = async () => {
        const targetEmail = emailInput.trim().toLowerCase();
        if (!targetEmail || !targetEmail.includes('@') || !user?.familyId) return;

        if (targetEmail === user.email.toLowerCase()) {
            Alert.alert('Hata', 'Kendinize davet gönderemezsiniz.');
            return;
        }

        try {
            // Validate if user exists
            const usersRef = collection(db, 'users');
            const userQuery = query(usersRef, where('email', '==', targetEmail));
            const querySnapshot = await getDocs(userQuery);

            if (querySnapshot.empty) {
                Alert.alert('Hata', 'Bu e-posta adresine kayıtlı bir kullanıcı bulunamadı.');
                return;
            }

            await setDoc(doc(db, 'invites', targetEmail), {
                email: targetEmail,
                familyId: user.familyId,
                inviterName: user.name,
                status: 'pending',
                timestamp: Date.now()
            });
            setEmailInput('');
        } catch (error) {
            console.error("Error sending invite:", error);
            Alert.alert('Hata', 'Davet gönderilemedi.');
        }
    };

    const handleRemove = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'invites', id));
        } catch (error) {
            console.error("Error removing invite:", error);
        }
    };

    return (
        <Animated.View
            entering={SlideInRight.duration(300)}
            exiting={SlideOutRight.duration(250)}
            style={styles.container}
        >
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
                        <ChevronLeft size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <View style={styles.headerTextWrap}>
                        <Text style={styles.headerTitle}>Aileye Davet Et</Text>
                        <Text style={styles.headerSub}>E-posta ile aile üyesi ekle</Text>
                    </View>
                </View>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>

                    {/* Info Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoIconWrap}>
                            <Users size={20} color="#10b981" />
                        </View>
                        <View style={styles.infoTextWrap}>
                            <Text style={styles.infoTitle}>Aile Üyelerini Ekle</Text>
                            <Text style={styles.infoDesc}>Davet gönderilen kişiler FamilyFlow'a katılarak ortak panoya erişebilir.</Text>
                        </View>
                    </View>

                    {/* Input Section */}
                    <View style={styles.inputSection}>
                        <Text style={styles.sectionTitleLabel}>E-POSTA ADRESİ</Text>
                        <View style={styles.inputRow}>
                            <View style={styles.inputWrap}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="ornek@gmail.com"
                                    placeholderTextColor={colors.textSecondary}
                                    value={emailInput}
                                    onChangeText={setEmailInput}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                            <TouchableOpacity
                                style={[styles.sendBtn, !emailInput.trim() && styles.sendBtnDisabled]}
                                onPress={handleSend}
                                disabled={!emailInput.trim()}
                                activeOpacity={0.7}
                            >
                                <Send size={20} color={emailInput.trim() ? "#10b981" : colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Invites List */}
                    <View style={styles.listSection}>
                        <Text style={styles.sectionTitleLabel}>{invites.length} ÜYE</Text>
                        <View style={styles.listContainer}>
                            {invites.map((invite, index) => (
                                <View key={invite.id} style={[styles.listItem, index !== invites.length - 1 && styles.listBorder]}>
                                    <View style={[styles.statusIcon, invite.status === 'accepted' ? styles.statusIconAccepted : styles.statusIconPending]}>
                                        {invite.status === 'accepted' ? (
                                            <Check size={16} color="#10b981" />
                                        ) : (
                                            <Hourglass size={16} color="#fbbf24" />
                                        )}
                                    </View>
                                    <View style={styles.itemTextWrap}>
                                        <Text style={styles.itemEmail}>{invite.email}</Text>
                                        <Text style={[styles.itemStatus, { color: invite.status === 'accepted' ? "#10b981" : '#fbbf24' }]}>
                                            {invite.status === 'accepted' ? 'Kabul etti · Aile üyesi' : 'Davet bekleniyor'}
                                        </Text>
                                    </View>
                                    {invite.status === 'pending' && (
                                        <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(invite.id)}>
                                            <Trash2 size={16} color={colors.warning} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </Animated.View>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.background,
        zIndex: 100,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.headerBg,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    headerTextWrap: {
        flex: 1,
    },
    headerTitle: {
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    headerSub: {
        color: colors.textSecondary,
        fontSize: 13,
    },
    content: {
        padding: 24,
    },
    infoCard: {
        backgroundColor: 'rgba(16, 185, 129, 0.05)', // slight green tint
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.1)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 32,
    },
    infoIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoTextWrap: {
        flex: 1,
    },
    infoTitle: {
        color: '#10b981',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    infoDesc: {
        color: colors.textSecondary,
        fontSize: 13,
        lineHeight: 20,
    },
    sectionTitleLabel: {
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 12,
    },
    inputSection: {
        marginBottom: 32,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    inputWrap: {
        flex: 1,
        backgroundColor: colors.inputBg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
    },
    input: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        color: colors.textPrimary,
        fontSize: 15,
    },
    sendBtn: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendBtnDisabled: {
        backgroundColor: colors.card,
        borderColor: colors.border,
    },
    listSection: {
        flex: 1,
    },
    listContainer: {
        backgroundColor: colors.card,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    listBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    statusIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    statusIconAccepted: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
    },
    statusIconPending: {
        backgroundColor: 'rgba(251, 191, 36, 0.15)',
    },
    itemTextWrap: {
        flex: 1,
    },
    itemEmail: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    itemStatus: {
        fontSize: 13,
    },
    removeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    }
});
