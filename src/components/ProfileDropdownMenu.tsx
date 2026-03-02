import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, Image } from 'react-native';
import { User, UserPlus, LogOut, ChevronRight } from 'lucide-react-native';
import { UserProfile } from '../store/authStore';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const THEME = {
    bg: '#1c1f31',
    surface: '#21243a',
    surfaceHover: '#272b44',
    text: '#e4e8f8',
    textMuted: '#8a93b5',
    textDim: '#47506f',
    primary: '#a78bfa',
    danger: '#ef4444',
    borderStrong: 'rgba(255,255,255,0.14)',
};

interface ProfileDropdownMenuProps {
    visible: boolean;
    user: UserProfile | null;
    onClose: () => void;
    onEditProfile: () => void;
    onInvite: () => void;
    onSignOut: () => void;
}

export default function ProfileDropdownMenu({ visible, user, onClose, onEditProfile, onInvite, onSignOut }: ProfileDropdownMenuProps) {
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
                                    <User size={20} color={THEME.primary} />
                                </View>
                                <View style={styles.menuTextWrap}>
                                    <Text style={styles.menuTitle}>Profili Düzenle</Text>
                                    <Text style={styles.menuSub}>İsim ve fotoğraf</Text>
                                </View>
                                <ChevronRight size={16} color={THEME.textDim} />
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
                                <ChevronRight size={16} color={THEME.textDim} />
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            <TouchableOpacity
                                style={styles.menuItem}
                                activeOpacity={0.7}
                                onPress={() => { onClose(); onSignOut(); }}
                            >
                                <View style={[styles.menuIconWrap, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                                    <LogOut size={20} color={THEME.danger} />
                                </View>
                                <View style={styles.menuTextWrap}>
                                    <Text style={[styles.menuTitle, { color: THEME.danger }]}>Çıkış Yap</Text>
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

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
    },
    dropdown: {
        width: 300,
        backgroundColor: THEME.bg,
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
        borderColor: THEME.borderStrong,
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
        color: THEME.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    headerTextWrap: {
        flex: 1,
        justifyContent: 'center',
    },
    userName: {
        color: THEME.text,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    userEmail: {
        color: THEME.textDim,
        fontSize: 12,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
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
        color: THEME.text,
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    menuSub: {
        color: THEME.textDim,
        fontSize: 12,
    }
});
