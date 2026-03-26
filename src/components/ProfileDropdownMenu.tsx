import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, Image } from 'react-native';
import { User, UserPlus, LogOut, ChevronRight, Users } from 'lucide-react-native';
import { UserProfile } from '../store/authStore';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';


interface ProfileDropdownMenuProps {
    visible: boolean;
    user: UserProfile | null;
    onClose: () => void;
    onEditProfile: () => void;
    onInvite: () => void;
    onViewFamily: () => void;
    onLeaveFamily: () => void;
    onSignOut: () => void;
}

export default function ProfileDropdownMenu({ visible, user, onClose, onEditProfile, onInvite, onViewFamily, onLeaveFamily, onSignOut }: ProfileDropdownMenuProps) {
    const { isDarkMode } = useThemeStore();
    const colors = getColors(isDarkMode);
    const styles = createStyles(colors);

    if (!visible) return null;

    const initials = (user?.name || '?').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const displayAvatar = user?.customPhoto;

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
                            entering={SlideInRight.duration(200)}
                            exiting={SlideOutRight.duration(200)}
                            style={styles.dropdown}
                        >
                            {/* User Header */}
                            <View style={styles.header}>
                                <LinearGradient
                                    colors={['rgba(167,139,250,0.3)', 'rgba(94,234,212,0.2)']}
                                    style={styles.avatarGradient}
                                >
                                    {displayAvatar ? (
                                        <Image source={{ uri: displayAvatar }} style={styles.avatarImage} />
                                    ) : (
                                        <Text style={styles.avatarInitials}>{initials}</Text>
                                    )}
                                </LinearGradient>
                                <View style={styles.headerTextWrap}>
                                    <Text style={styles.userName}>{user?.name || 'Kullanıcı'}</Text>
                                    <Text style={styles.userEmail}>{user?.email || 'E-posta yok'}</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            {/* Menu Items */}
                            <TouchableOpacity
                                style={styles.menuItem}
                                activeOpacity={0.7}
                                onPress={() => { onClose(); onEditProfile(); }}
                            >
                                <View style={[styles.menuIconWrap, { backgroundColor: 'rgba(167,139,250,0.1)' }]}>
                                    <User size={20} color={colors.accent} />
                                </View>
                                <View style={styles.menuTextWrap}>
                                    <Text style={styles.menuTitle}>Profili Düzenle</Text>
                                    <Text style={styles.menuSub}>İsim ve fotoğraf</Text>
                                </View>
                                <ChevronRight size={16} color={colors.textSecondary} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.menuItem}
                                activeOpacity={0.7}
                                onPress={() => { onClose(); onInvite(); }}
                            >
                                <View style={[styles.menuIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                    <UserPlus size={20} color="#10b981" />
                                </View>
                                <View style={styles.menuTextWrap}>
                                    <Text style={styles.menuTitle}>Davet Gönder</Text>
                                    <Text style={styles.menuSub}>Aile üyesi ekle</Text>
                                </View>
                                <ChevronRight size={16} color={colors.textSecondary} />
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            <TouchableOpacity
                                style={styles.menuItem}
                                activeOpacity={0.7}
                                onPress={() => { onClose(); onViewFamily(); }}
                            >
                                <View style={[styles.menuIconWrap, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                                    <Users size={20} color="#3b82f6" />
                                </View>
                                <View style={styles.menuTextWrap}>
                                    <Text style={styles.menuTitle}>Aileyi Görüntüle</Text>
                                    <Text style={styles.menuSub}>Aile üyelerini gör</Text>
                                </View>
                                <ChevronRight size={16} color={colors.textSecondary} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.menuItem}
                                activeOpacity={0.7}
                                onPress={() => { onClose(); onLeaveFamily(); }}
                            >
                                <View style={[styles.menuIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                                    <LogOut size={20} color="#f59e0b" />
                                </View>
                                <View style={styles.menuTextWrap}>
                                    <Text style={[styles.menuTitle, { color: '#f59e0b' }]}>Aileden Ayrıl</Text>
                                    <Text style={styles.menuSub}>Kendi grubuna dön</Text>
                                </View>
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            <TouchableOpacity
                                style={styles.menuItem}
                                activeOpacity={0.7}
                                onPress={() => { onClose(); onSignOut(); }}
                            >
                                <View style={[styles.menuIconWrap, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                                    <LogOut size={20} color={colors.warning} />
                                </View>
                                <View style={styles.menuTextWrap}>
                                    <Text style={[styles.menuTitle, { color: colors.warning }]}>Çıkış Yap</Text>
                                    <Text style={[styles.menuSub, { color: 'rgba(239, 68, 68, 0.7)' }]}>Google hesabından çık</Text>
                                </View>
                            </TouchableOpacity>

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
            backgroundColor: colors.modalOverlay,
            justifyContent: 'flex-start',
            alignItems: 'flex-end',
        },
        dropdown: {
            width: 300,
            backgroundColor: colors.card,
            borderRadius: 24,
            marginTop: 60,
            marginRight: 20,
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
            elevation: 10,
            borderWidth: 1,
            borderColor: colors.border,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
            paddingHorizontal: 8,
            paddingTop: 8,
        },
        avatarGradient: {
            width: 44,
            height: 44,
            borderRadius: 14,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
            overflow: 'hidden',
        },
        avatarImage: {
            width: '100%',
            height: '100%',
        },
        avatarInitials: {
            color: colors.textPrimary,
            fontSize: 16,
            fontWeight: 'bold',
        },
        headerTextWrap: {
            flex: 1,
            justifyContent: 'center',
        },
        userName: {
            color: colors.textPrimary,
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 2,
        },
        userEmail: {
            color: colors.textSecondary,
            fontSize: 12,
        },
        divider: {
            height: 1,
            backgroundColor: colors.border,
            marginVertical: 12,
        },
        menuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 8,
        },
        menuIconWrap: {
            width: 40,
            height: 40,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        menuTextWrap: {
            flex: 1,
            justifyContent: 'center',
        },
        menuTitle: {
            color: colors.textPrimary,
            fontSize: 15,
            fontWeight: 'bold',
            marginBottom: 2,
        },
        menuSub: {
            color: colors.textSecondary,
            fontSize: 12,
        }
    });
}
