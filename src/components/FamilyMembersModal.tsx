import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, Image, FlatList } from 'react-native';
import { Users, X } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, SlideInUp, SlideOutDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { UserProfile } from '../store/authStore';

interface FamilyMembersModalProps {
    visible: boolean;
    onClose: () => void;
    familyId: string | undefined;
    currentUserEmail: string | undefined;
}

export default function FamilyMembersModal({ visible, onClose, familyId, currentUserEmail }: FamilyMembersModalProps) {
    const { isDarkMode } = useThemeStore();
    const colors = getColors(isDarkMode);
    const styles = createStyles(colors);

    const [members, setMembers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!visible || !familyId) return;

        setIsLoading(true);
        const q = query(collection(db, 'users'), where('familyId', '==', familyId));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMembers: UserProfile[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                fetchedMembers.push({
                    id: doc.id,
                    email: data.email,
                    name: data.name,
                    familyId: data.familyId,
                    customPhoto: data.customPhoto,
                    avatar: data.avatar || '',
                    role: data.role || 'user',
                } as UserProfile);
            });
            // Sort to put current user first, then alphabetical
            fetchedMembers.sort((a, b) => {
                if (a.email === currentUserEmail) return -1;
                if (b.email === currentUserEmail) return 1;
                return (a.name || '').localeCompare(b.name || '');
            });
            setMembers(fetchedMembers);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching family members:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [visible, familyId, currentUserEmail]);

    if (!visible) return null;

    const renderItem = ({ item }: { item: UserProfile }) => {
        const isCurrentUser = item.email === currentUserEmail;
        const initials = (item.name || '?').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        
        return (
            <View style={styles.memberItem}>
                <LinearGradient
                    colors={['rgba(167,139,250,0.3)', 'rgba(94,234,212,0.2)']}
                    style={styles.avatarWrap}
                >
                    {item.customPhoto ? (
                        <Image source={{ uri: item.customPhoto }} style={styles.avatarImage} />
                    ) : (
                        <Text style={styles.avatarInitials}>{initials}</Text>
                    )}
                </LinearGradient>
                
                <View style={styles.memberInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.memberName}>{item.name}</Text>
                        {isCurrentUser && (
                            <View style={styles.youBadge}>
                                <Text style={styles.youBadgeText}>Sen</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.memberEmail}>{item.email}</Text>
                </View>
            </View>
        );
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            entering={SlideInUp.duration(300)}
                            exiting={SlideOutDown.duration(250)}
                            style={styles.modalContent}
                        >
                            <View style={styles.header}>
                                <View style={styles.headerTitleWrap}>
                                    <View style={[styles.titleIconWrap, { backgroundColor: 'rgba(167,139,250,0.1)' }]}>
                                        <Users size={20} color={colors.accent} />
                                    </View>
                                    <Text style={styles.headerTitle}>Aile Üyeleri ({members.length})</Text>
                                </View>
                                <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                                    <X size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.divider} />

                            {isLoading ? (
                                <View style={styles.loadingWrap}>
                                    <Text style={styles.loadingText}>Yükleniyor...</Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={members}
                                    keyExtractor={(item) => item.id}
                                    renderItem={renderItem}
                                    contentContainerStyle={styles.listContent}
                                    showsVerticalScrollIndicator={false}
                                    ItemSeparatorComponent={() => <View style={styles.listDivider} />}
                                />
                            )}
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

function createStyles(colors: any) {
    return StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        modalContent: {
            width: '100%',
            maxHeight: '80%',
            backgroundColor: colors.background,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 20,
            paddingBottom: 16,
            backgroundColor: colors.card,
        },
        headerTitleWrap: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        titleIconWrap: {
            width: 36,
            height: 36,
            borderRadius: 18,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        headerTitle: {
            color: colors.textPrimary,
            fontSize: 18,
            fontWeight: 'bold',
        },
        closeBtn: {
            padding: 4,
        },
        divider: {
            height: 1,
            backgroundColor: colors.border,
            width: '100%',
        },
        listContent: {
            padding: 20,
            paddingTop: 8,
        },
        listDivider: {
            height: 16,
        },
        memberItem: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.card,
            padding: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
        },
        avatarWrap: {
            width: 48,
            height: 48,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
            overflow: 'hidden',
        },
        avatarImage: {
            width: '100%',
            height: '100%',
            borderRadius: 16,
        },
        avatarInitials: {
            color: colors.textPrimary,
            fontSize: 18,
            fontWeight: 'bold',
        },
        memberInfo: {
            flex: 1,
        },
        nameRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 4,
        },
        memberName: {
            color: colors.textPrimary,
            fontSize: 16,
            fontWeight: '600',
            marginRight: 8,
        },
        youBadge: {
            backgroundColor: colors.accent,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 8,
        },
        youBadgeText: {
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: 'bold',
        },
        memberEmail: {
            color: colors.textSecondary,
            fontSize: 13,
        },
        loadingWrap: {
            padding: 40,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            color: colors.textSecondary,
            fontSize: 14,
        }
    });
}
