import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView, BackHandler } from 'react-native';
import { ChevronLeft, Edit2, Upload, Camera } from 'lucide-react-native';
import { UserProfile } from '../store/authStore';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';

interface ProfileEditModalProps {
    visible: boolean;
    user: UserProfile | null;
    onClose: () => void;
    onSavePhoto: (uri: string | undefined) => void;
    onSaveName?: (name: string) => void;
}

export default function ProfileEditModal({ visible, user, onClose, onSavePhoto, onSaveName }: ProfileEditModalProps) {
    const { isDarkMode } = useThemeStore();
    const colors = getColors(isDarkMode);
    const styles = createStyles(colors);

    const [name, setName] = useState(user?.name || '');

    const handleBack = () => {
        if (name.trim() !== '' && name.trim() !== user?.name && onSaveName) {
            onSaveName(name.trim());
        }
        onClose();
    };

    React.useEffect(() => {
        if (!visible) return;
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            handleBack();
            return true;
        });
        return () => sub.remove();
    }, [visible, name, user?.name, onSaveName, onClose]);

    if (!visible) return null;

    const initials = (name || user?.name || '?').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const displayAvatar = user?.customPhoto;

    const handlePickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.2,
            base64: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].base64) {
            const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
            onSavePhoto(base64Img);
        }
    };

    const handleRemovePhoto = () => {
        onSavePhoto(undefined);
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
                    <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
                        <ChevronLeft size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <View style={styles.headerTextWrap}>
                        <Text style={styles.headerTitle}>Profili Düzenle</Text>
                        <Text style={styles.headerSub}>İsim ve profil fotoğrafını güncelle</Text>
                    </View>
                </View>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
                    {/* User Info Mock Card */}
                    <View style={styles.infoCard}>
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
                        <View style={styles.infoTextWrap}>
                            <Text style={styles.infoName}>{user?.name || 'Kullanıcı'}</Text>
                            <Text style={styles.infoEmail}>{user?.email || 'E-posta yok'}</Text>
                            <Text style={styles.infoHint}>
                                {displayAvatar ? 'Özel fotoğraf yüklendi' : 'Baş harfler görünüyor — fotoğraf yükleyebilirsin'}
                            </Text>
                        </View>
                    </View>

                    {/* Name Input */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={[styles.sectionIcon, { backgroundColor: 'rgba(167,139,250,0.1)' }]}>
                                <Edit2 size={14} color={colors.accent} />
                            </View>
                            <View>
                                <Text style={styles.sectionTitle}>Görünen İsim</Text>
                                <Text style={styles.sectionSub}>Header ve aile üyelerine görünen isim</Text>
                            </View>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Adınızı girin"
                            placeholderTextColor={colors.textSecondary}
                            maxLength={40}
                        />
                        <Text style={styles.charCount}>{name.length}/40</Text>
                    </View>

                    {/* Photo Upload Options */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={[styles.sectionIcon, { backgroundColor: 'rgba(96,165,250,0.1)' }]}>
                                <Camera size={14} color="#60a5fa" />
                            </View>
                            <View>
                                <Text style={styles.sectionTitle}>Profil Fotoğrafı</Text>
                                <Text style={styles.sectionSub}>Yüklenirse baş harflerin yerine görünür</Text>
                            </View>
                        </View>

                        <View style={styles.photoGrid}>
                            <TouchableOpacity style={styles.uploadCard} onPress={handlePickImage} activeOpacity={0.7}>
                                <View style={styles.uploadIconWrap}>
                                    <Upload size={20} color="#60a5fa" />
                                </View>
                                <Text style={styles.uploadCardTitle}>Fotoğraf Seç</Text>
                                <Text style={styles.uploadCardSub}>JPG · PNG · WEBP</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.initialsCard, !displayAvatar && styles.initialsCardActive]}
                                onPress={handleRemovePhoto}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={['rgba(167,139,250,0.2)', 'rgba(94,234,212,0.1)']}
                                    style={styles.initialsPreview}
                                >
                                    <Text style={styles.initialsPreviewText}>{initials}</Text>
                                </LinearGradient>
                                <Text style={styles.initialsCardText}>Baş harf</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </Animated.View>
    );
}

function createStyles(colors: any) {
    return StyleSheet.create({
        container: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: colors.background, // slightly darker overall background than bottom sheet
            zIndex: 100,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: Platform.OS === 'ios' ? 50 : 30, // SafeArea approximation
            paddingBottom: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.card,
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
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 24,
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 32,
        },
        avatarGradient: {
            width: 64,
            height: 64,
            borderRadius: 20, // slightly squarcle
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 20,
            overflow: 'hidden',
        },
        avatarImage: {
            width: '100%',
            height: '100%',
        },
        avatarInitials: {
            color: colors.textPrimary,
            fontSize: 24,
            fontWeight: '800',
        },
        infoTextWrap: {
            flex: 1,
        },
        infoName: {
            color: colors.textPrimary,
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 4,
        },
        infoEmail: {
            color: colors.textSecondary,
            fontSize: 14,
            marginBottom: 8,
        },
        infoHint: {
            color: colors.textSecondary,
            fontSize: 12,
        },
        section: {
            marginBottom: 32,
        },
        sectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
        },
        sectionIcon: {
            width: 32,
            height: 32,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        sectionTitle: {
            color: colors.textPrimary,
            fontSize: 15,
            fontWeight: '600',
            marginBottom: 2,
        },
        sectionSub: {
            color: colors.textSecondary,
            fontSize: 12,
        },
        input: {
            backgroundColor: colors.border,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 16,
            paddingHorizontal: 20,
            paddingVertical: 16,
            color: colors.textPrimary,
            fontSize: 16,
        },
        charCount: {
            color: colors.textSecondary,
            fontSize: 12,
            alignSelf: 'flex-end',
            marginTop: 8,
        },
        photoGrid: {
            flexDirection: 'row',
            gap: 16,
        },
        uploadCard: {
            flex: 1.5,
            backgroundColor: 'rgba(255,255,255,0.02)',
            borderWidth: 1,
            borderColor: colors.border,
            borderStyle: 'dashed',
            borderRadius: 20,
            padding: 24,
            justifyContent: 'center',
            alignItems: 'center',
        },
        uploadIconWrap: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: 'rgba(96,165,250,0.1)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
        },
        uploadCardTitle: {
            color: '#60a5fa',
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 4,
        },
        uploadCardSub: {
            color: colors.textSecondary,
            fontSize: 12,
        },
        initialsCard: {
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            borderWidth: 1,
            borderColor: 'transparent',
        },
        initialsCardActive: {
            borderColor: colors.border,
            backgroundColor: colors.card,
        },
        initialsPreview: {
            width: 56,
            height: 56,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
        },
        initialsPreviewText: {
            color: colors.textPrimary,
            fontSize: 22,
            fontWeight: 'bold',
        },
        initialsCardText: {
            color: colors.textSecondary,
            fontSize: 13,
        }
    });
}
