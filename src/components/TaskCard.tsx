import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, Image } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    LinearTransition
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';

interface Task {
    id: string;
    title: string;
    note?: string;
    tag?: string;
    isUrgent?: boolean;
    avatar?: string;
    customPhoto?: string;
    timestamp?: number;
    addedBy?: string;
    columnId?: string;
}

interface TaskCardProps {
    task: Task;
    onComplete: (id: string) => void;
    onLongPress: () => void;
    accentColor: string;
}

export default function TaskCard({ task, onComplete, onLongPress, accentColor }: TaskCardProps) {
    const { isDarkMode } = useThemeStore();
    const colors = getColors(isDarkMode);
    const styles = createStyles(colors);

    const scale = useSharedValue(1);
    const checkScale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedCheckStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: checkScale.value }],
        };
    });

    const animatedCardStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ scale: scale.value }],
        };
    });

    const handlePressIn = () => {
        scale.value = withSpring(0.96);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    const handleComplete = () => {
        // Pop animation on check button
        checkScale.value = withSequence(
            withSpring(1.3),
            withSpring(1)
        );
        onComplete(task.id);
    };

    // Parse note for Due Date (Son Ödeme: GG.AA.YYYY) 
    const getDueDateStatus = () => {
        if (!task.note || !task.note.includes('Son Ödeme:')) return null;

        const match = task.note.match(/Son Ödeme:\s*(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?/);
        if (!match) return null;

        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1; // 0-indexed
        let year = match[3] ? parseInt(match[3], 10) : new Date().getFullYear();
        if (year < 100) year += 2000;

        const dueDate = new Date(year, month, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { status: 'overdue', color: '#f87171', text: 'Gecikmiş' };
        if (diffDays === 0) return { status: 'today', color: '#f87171', text: 'Bugün Son' };
        if (diffDays <= 3) return { status: 'soon', color: '#fbbf24', text: `${diffDays} Gün Kaldı` };
        return null;
    };

    const getFormattedTimestamp = () => {
        if (!task.timestamp) return 'Az önce';

        const date = new Date(task.timestamp);
        const now = new Date();

        const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();

        const timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

        if (isToday) {
            return timeStr;
        } else if (isYesterday) {
            return `Dün ${timeStr}`;
        } else {
            return `${date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} ${timeStr}`;
        }
    };

    const dateStatus = getDueDateStatus();
    const isErrorState = task.isUrgent || dateStatus?.status === 'overdue' || dateStatus?.status === 'today';
    const isShopping = task.columnId === 'alisveris';

    return (
        <Animated.View style={[
            styles.card,
            isShopping && styles.shoppingCard,
            isErrorState && styles.urgentCard,
            animatedCardStyle
        ]}>
            <TouchableOpacity
                activeOpacity={0.9}
                onLongPress={onLongPress}
                delayLongPress={300}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[
                    styles.cardContent,
                    isShopping && styles.shoppingCardContent,
                    !task.note && !isShopping && { paddingBottom: 8 }
                ]}
            >
                {/* Glow effect for urgent/overdue */}
                {isErrorState && <View style={styles.urgentGlow} />}

                <View style={[styles.row, !task.note && { alignItems: 'center' }]}>

                    <View style={[styles.avatarWrap, isShopping && styles.shoppingAvatarWrap]}>
                        {task.customPhoto && task.customPhoto.length > 2 ? (
                            <Image source={{ uri: task.customPhoto }} style={{ width: '100%', height: '100%', borderRadius: isShopping ? 14 : 16 }} />
                        ) : task.avatar && task.avatar.length > 2 ? (
                            <Image source={{ uri: task.avatar }} style={{ width: '100%', height: '100%', borderRadius: isShopping ? 14 : 16 }} />
                        ) : (
                            <Text style={{ fontSize: isShopping ? 16 : 20, color: colors.switchThumb, fontWeight: 'bold' }}>
                                {task.addedBy ? task.addedBy.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() : '👤'}
                            </Text>
                        )}
                    </View>

                    {/* Middle: Info */}
                    <View style={styles.midCol}>
                        <View style={[styles.topMeta, isShopping && { marginBottom: 2 }]}>
                            <View style={[styles.tag, task.isUrgent ? styles.urgentTag : null, isShopping && { paddingVertical: 1 }]}>
                                <Text style={[styles.tagText, task.isUrgent ? styles.urgentTagText : { color: accentColor }, isShopping && { fontSize: 8 }]}>
                                    {task.isUrgent ? '🚨 Acil' : task.tag || 'Yeni'}
                                </Text>
                            </View>
                            <Text style={[styles.userName, isShopping && { fontSize: 9 }]}>{task.addedBy || 'Aile Üyesi'}</Text>
                        </View>

                        <Text
                            style={[styles.title, isShopping && styles.shoppingTitle]}
                            numberOfLines={isShopping ? 1 : undefined}
                        >
                            {task.title}
                        </Text>

                        <View style={styles.timeRow}>
                            <Text style={styles.timestamp}>
                                {getFormattedTimestamp()}
                            </Text>

                            {dateStatus && (
                                <View style={[styles.dateBadge, { backgroundColor: dateStatus.color + '20' }]}>
                                    <Text style={[styles.dateBadgeText, { color: dateStatus.color }]}>
                                        {dateStatus.text}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {task.note && !isShopping ? (
                            <Text style={styles.note}>
                                {task.note}
                            </Text>
                        ) : null}
                    </View>

                    {/* Right: Check */}
                    <View style={styles.rightCol}>
                        <TouchableOpacity activeOpacity={0.7} onPress={handleComplete} style={styles.checkHitbox}>
                            <Animated.View style={[styles.checkBtn, isShopping && styles.shoppingCheckBtn, { borderColor: accentColor }, animatedCheckStyle]}>
                                <Check size={isShopping ? 14 : 18} color={accentColor} strokeWidth={3} />
                            </Animated.View>
                        </TouchableOpacity>
                    </View>
                </View>

            </TouchableOpacity>
        </Animated.View>
    );
}

function createStyles(colors: any) {
    return StyleSheet.create({
        card: {
            backgroundColor: colors.card,
            borderRadius: 18,
            borderWidth: 1.5,
            borderColor: colors.border,
            marginBottom: 10,
            position: 'relative',
            overflow: 'hidden',
        },
        shoppingCard: {
            marginBottom: 8,
            borderRadius: 14,
        },
        urgentCard: {
            borderColor: 'rgba(248,113,113,0.8)', // distinct red/orange border
            backgroundColor: colors.card,
        },
        urgentGlow: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(251,146,60,0.05)',
        },
        cardContent: {
            paddingVertical: 8,
            paddingHorizontal: 14,
        },
        shoppingCardContent: {
            paddingVertical: 6,
            paddingHorizontal: 12,
        },
        row: {
            flexDirection: 'row',
        },
        midCol: {
            flex: 1,
            justifyContent: 'center',
        },
        rightCol: {
            justifyContent: 'center',
            alignItems: 'flex-end',
            paddingLeft: 8,
        },
        checkHitbox: {
            padding: 4, // easier to tap
        },
        topMeta: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 6,
            gap: 6,
            flexWrap: 'wrap',
        },
        userName: {
            color: colors.textSecondary,
            fontSize: 11,
            fontWeight: 'bold',
        },
        tag: {
            backgroundColor: colors.border,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
        },
        urgentTag: {
            backgroundColor: 'rgba(248,113,113,0.15)',
        },
        tagText: {
            fontSize: 10,
            fontWeight: 'bold',
        },
        urgentTagText: {
            color: '#f87171',
        },
        title: {
            color: colors.textPrimary,
            fontSize: 15,
            fontWeight: 'bold',
            marginBottom: 4,
        },
        shoppingTitle: {
            fontSize: 14,
            marginBottom: 2,
        },
        timestamp: {
            color: colors.textSecondary,
            fontSize: 10,
            fontWeight: '600',
        },
        timeRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginTop: 2,
        },
        noteIndicator: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.border,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
            gap: 2,
        },
        noteIndicatorText: {
            color: colors.textSecondary,
            fontSize: 9,
            fontWeight: 'bold',
        },
        note: {
            color: colors.textSecondary,
            fontSize: 12,
            lineHeight: 16,
            marginTop: 8,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        dateBadge: {
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
        },
        dateBadgeText: {
            fontSize: 10,
            fontWeight: 'bold',
        },
        avatarWrap: {
            width: 48,
            height: 48,
            borderRadius: 16,
            backgroundColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 10,
            alignSelf: 'flex-start',
        },
        shoppingAvatarWrap: {
            width: 38,
            height: 38,
            borderRadius: 14,
            marginRight: 10,
            alignSelf: 'center',
        },
        checkBtn: {
            width: 32,
            height: 32,
            borderRadius: 10,
            borderWidth: 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.border,
        },
        shoppingCheckBtn: {
            width: 26,
            height: 26,
            borderRadius: 8,
        },
    });
}
