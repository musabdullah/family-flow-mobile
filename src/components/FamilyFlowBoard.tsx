import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, Image, BackHandler } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';
import { useTasks } from '../hooks/useTasks';
import { ShoppingCart, Zap, Calendar, Star, Sun, Moon, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, withTiming, withSpring, useSharedValue, withRepeat, withSequence, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TaskCard from './TaskCard';
import BottomNavBar from './BottomNavBar';
import BillsBottomSheet from './BillsBottomSheet';
import ShoppingBottomSheet from './ShoppingBottomSheet';
import PlansBottomSheet from './PlansBottomSheet';
import OthersBottomSheet from './OthersBottomSheet';
import EditTaskBottomSheet from './EditTaskBottomSheet';
import CompleteTaskBottomSheet from './CompleteTaskBottomSheet';
import ProfileDropdownMenu from './ProfileDropdownMenu';
import ProfileEditModal from './ProfileEditModal';
import FamilyInviteModal from './FamilyInviteModal';
import LeaveFamilyModal from './LeaveFamilyModal';
import FamilyMembersModal from './FamilyMembersModal';
import ThemePreviewModal from './ThemePreviewModal';
import ChatScreen from './ChatScreen';
import ArchiveScreen from './ArchiveScreen';
import { ActivityIndicator, Alert } from 'react-native';
import { Task } from '../hooks/useTasks';
import { useMessages } from '../hooks/useMessages';
import { useInvites, PendingInvite } from '../hooks/useInvites';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const { width } = Dimensions.get('window');

const COLUMNS = [
    { id: 'alisveris', title: 'Alışveriş', accent: '#5eead4', accentDim: '#3ab5a6', accentBg: 'rgba(94,234,212,0.12)', Icon: ShoppingCart },
    { id: 'faturalar', title: 'Faturalar', accent: '#fbbf6a', accentDim: '#d99a40', accentBg: 'rgba(251,191,106,0.12)', Icon: Zap },
    { id: 'planlar', title: 'Planlar', accent: '#a78bfa', accentDim: '#7c5cd6', accentBg: 'rgba(167,139,250,0.12)', Icon: Calendar },
    { id: 'diger', title: 'Diğerleri', accent: '#f472b6', accentDim: '#c94490', accentBg: 'rgba(244,114,182,0.12)', Icon: Star }
];

const PaginationDot = ({ isActive, color, count = 0 }: { isActive: boolean; color: string; count?: number }) => {
    const { isDarkMode } = useThemeStore();
    const colors = getColors(isDarkMode);
    const styles = createStyles(colors);
    const pulse = useSharedValue(0.2);

    useEffect(() => {
        if (isActive) {
            pulse.value = withRepeat(
                withSequence(
                    withTiming(0.8, { duration: 1000 }),
                    withTiming(0.2, { duration: 1000 })
                ),
                -1,
                true
            );
        } else {
            pulse.value = 0;
        }
    }, [isActive]);

    const dotStyle = useAnimatedStyle(() => {
        return {
            width: withSpring(isActive ? 28 : 10, { damping: 15 }),
            opacity: withTiming(isActive ? 1 : 0.6)
        };
    });

    const auraStyle = useAnimatedStyle(() => {
        return {
            width: withSpring(isActive ? 24 : 6, { damping: 14, stiffness: 120 }),
            shadowOpacity: pulse.value,
        };
    });

    return (
        <View style={{ justifyContent: 'center', alignItems: 'center', marginHorizontal: 2 }}>
            {/* The Number Indicator above the dot */}
            {count > 0 && (
                <View style={{
                    position: 'absolute',
                    top: -16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 30, // Fixed width to prevent wrapping 2 digits
                    zIndex: 10
                }}>
                    <Text
                        numberOfLines={1}
                        style={{
                            color: color,
                            fontSize: 10,
                            fontWeight: 'bold',
                            textShadowColor: 'rgba(0,0,0,0.5)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2,
                            opacity: isActive ? 1 : 0.6
                        }}>
                        {count}
                    </Text>
                </View>
            )}

            {/* The Outer Aura (Pulse) */}
            <Animated.View
                pointerEvents="none"
                style={[
                    styles.paginationDot,
                    {
                        position: 'absolute',
                        backgroundColor: 'transparent',
                        shadowColor: color,
                        shadowOffset: { width: 0, height: 0 },
                        shadowRadius: 5,
                        elevation: isActive ? 10 : 0,
                    },
                    auraStyle
                ]}
            />

            <Animated.View
                style={[
                    styles.paginationDot,
                    {
                        backgroundColor: color, // Replaced 'rgba(255,255,255,0.2)' with page color
                        zIndex: 2,
                    },
                    dotStyle
                ]}
            />
        </View>
    );
};

export default function FamilyFlowBoard() {
    const { isDarkMode, toggleTheme } = useThemeStore();
    const colors = getColors(isDarkMode);
    const styles = createStyles(colors);

    const { user, login, logout, updateProfile } = useAuthStore();
    const { tasks, loading, addTask, updateTask, deleteTask } = useTasks();
    const { invites } = useInvites();
    const insets = useSafeAreaInsets();

    // Setup push notification listeners and register token
    usePushNotifications();

    const acceptInvite = async (invite: PendingInvite) => {
        if (!user) return;
        try {
            await updateDoc(doc(db, 'users', user.id), { familyId: invite.familyId });
            await updateDoc(doc(db, 'invites', invite.id), { status: 'accepted' });
            Alert.alert('Başarılı', `${invite.inviterName} ailesine katıldınız!`);
            // Update local user state so UI refreshes immediately
            login({ ...user, familyId: invite.familyId });
        } catch (error) {
            console.error("Error accepting invite:", error);
            Alert.alert('Hata', 'Davet kabul edilemedi.');
        }
    };

    const rejectInvite = async (inviteId: string) => {
        try {
            await deleteDoc(doc(db, 'invites', inviteId));
        } catch (error) {
            console.error("Error rejecting invite:", error);
        }
    };

    useEffect(() => {
        if (invites.length > 0) {
            const invite = invites[0]; // Process one at a time
            Alert.alert(
                'Davetiniz Var! 💌',
                `${invite.inviterName} sizi ailesine davet ediyor.Katılmak ister misiniz ? `,
                [
                    { text: 'Reddet', style: 'cancel', onPress: () => rejectInvite(invite.id) },
                    { text: 'Kabul Et', style: 'default', onPress: () => acceptInvite(invite) }
                ]
            );
        }
    }, [invites]);

    const [activeTab, setActiveTab] = useState<'pano' | 'sohbet' | 'arsiv'>('pano');
    const [activeCol, setActiveCol] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleTabChange = (tab: 'pano' | 'sohbet' | 'arsiv') => {
        setActiveTab(tab);
        if (tab === 'pano') {
            setActiveCol(0);
            setTimeout(() => {
                flatListRef.current?.scrollToIndex({ index: 0, animated: true });
            }, 50);
        }
    };

    useEffect(() => {
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            if (activeTab !== 'pano') {
                handleTabChange('pano');
                return true;
            }

            Alert.alert(
                'Çıkış',
                'Uygulamadan çıkmak istiyor musunuz?',
                [
                    { text: 'Hayır', style: 'cancel', onPress: () => { } },
                    { text: 'Evet', style: 'destructive', onPress: () => BackHandler.exitApp() }
                ]
            );
            return true;
        });
        return () => sub.remove();
    }, [activeTab]);

    const [showBillsSheet, setShowBillsSheet] = useState(false);
    const [showShoppingSheet, setShowShoppingSheet] = useState(false);
    const [showPlansSheet, setShowPlansSheet] = useState(false);
    const [showOthersSheet, setShowOthersSheet] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showProfileEdit, setShowProfileEdit] = useState(false);
    const [showFamilyInvite, setShowFamilyInvite] = useState(false);
    const [showFamilyMembers, setShowFamilyMembers] = useState(false);
    const [showThemePreview, setShowThemePreview] = useState(false);
    const [showLeaveFamilyModal, setShowLeaveFamilyModal] = useState(false);

    const [editTask, setEditTask] = useState<Task | null>(null);
    const [editAccent, setEditAccent] = useState(colors.accent);

    const [completeTask, setCompleteTask] = useState<Task | null>(null);
    const [completeAccent, setCompleteAccent] = useState('#4ade80');
    const { sendMessage } = useMessages();

    const openSheet = (colId: string) => {
        if (colId === 'faturalar') setShowBillsSheet(true);
        else if (colId === 'alisveris') setShowShoppingSheet(true);
        else if (colId === 'planlar') setShowPlansSheet(true);
        else if (colId === 'diger') setShowOthersSheet(true);
    };

    const getDueDateStatus = (note?: string) => {
        if (!note || !note.includes('Son Ödeme:')) return null;

        const match = note.match(/Son Ödeme:\s*(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?/);
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

        if (diffDays < 0) return { status: 'overdue' };
        if (diffDays === 0) return { status: 'today' };
        if (diffDays <= 3) return { status: 'soon' };
        return null;
    };

    const completedCount = tasks.filter(t => t.tag === 'Tamamlandı').length;

    const overdueCount = tasks.filter(t => {
        if (t.tag === 'Tamamlandı') return false;
        const status = getDueDateStatus(t.note);
        return status?.status === 'overdue';
    }).length;

    const renderItem = ({ item }: { item: typeof COLUMNS[0] }) => {
        const columnTasks = tasks.filter(t => t.columnId === item.id && t.tag !== 'Tamamlandı');
        return (
            <View style={[styles.column, { width }]}>
                {/* Top shimmer line */}
                <LinearGradient
                    colors={['transparent', item.accent + '55', item.accent, item.accent + '55', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ height: 2.5, width: '100%' }}
                />

                <View style={styles.colHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
                        <View style={[styles.iconBox, { backgroundColor: item.accentBg, borderColor: item.accent + '30', shadowColor: item.accent }]}>
                            <item.Icon size={16} color={item.accent} />
                        </View>
                        <View>
                            <Text style={[styles.columnTitle, { color: item.accent }]}>{item.title}</Text>
                            <Text style={styles.taskCount}>{columnTasks.length} görev</Text>
                        </View>
                    </View>
                    <View style={[styles.countPill, { backgroundColor: item.accentBg, borderColor: item.accent + '30' }]}>
                        <Text style={[styles.countText, { color: item.accentDim }]}>{columnTasks.length}</Text>
                    </View>
                </View>

                <TouchableOpacity style={[styles.addButton, { backgroundColor: item.accentBg, borderColor: item.accent + '50' }]} onPress={() => openSheet(item.id)}>
                    <Text style={[styles.addText, { color: item.accent }]}>+ Yeni Ekle</Text>
                </TouchableOpacity>

                <Animated.FlatList
                    data={columnTasks}
                    itemLayoutAnimation={LinearTransition.springify().damping(16).stiffness(120)}
                    keyExtractor={t => t.id}
                    renderItem={({ item: task }) => (
                        <TaskCard
                            task={task}
                            onComplete={(id) => {
                                setCompleteTask(task);
                                setCompleteAccent(item.accent);
                            }}
                            onLongPress={() => {
                                setEditTask(task);
                                setEditAccent(item.accent);
                            }}
                            accentColor={item.accent}
                        />
                    )}
                    contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 120 }}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        );
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) return 'Hayırlı sabahlar';
        if (hour >= 12 && hour < 18) return 'Hayırlı günler';
        if (hour >= 18 && hour < 22) return 'Hayırlı akşamlar';
        return 'Hayırlı geceler';
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            {/* Header Area */}
            <View style={styles.headerArea}>
                {/* Top Header */}
                <View style={[styles.header, { paddingTop: Math.max(insets.top, 2) }]}>
                    <View style={{ flex: 1, paddingRight: 10, justifyContent: 'center' }}>
                        <Text style={styles.greeting} numberOfLines={1}>{getGreeting()},</Text>
                        <Text
                            style={styles.familyName}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.5}
                        >
                            {user?.name} 👋
                        </Text>
                    </View>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity
                            style={styles.themeButton}
                            onPress={toggleTheme}
                        >
                            {isDarkMode ? (
                                <Sun size={20} color="#fbbf6a" strokeWidth={2.5} />
                            ) : (
                                <Moon size={20} color={colors.textPrimary} strokeWidth={2.5} />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.8} onPress={() => setShowProfileDropdown(true)}>
                            <LinearGradient
                                colors={['#818cf8', '#38bdf8']}
                                style={styles.avatarWrap}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                {user?.customPhoto ? (
                                    <Image source={{ uri: user.customPhoto }} style={{ width: '100%', height: '100%', borderRadius: 16 }} />
                                ) : user?.avatar && user.avatar.length > 2 ? (
                                    <Image source={{ uri: user.avatar }} style={{ width: '100%', height: '100%', borderRadius: 16 }} />
                                ) : (
                                    <Text style={{ fontSize: 18, color: colors.switchThumb, fontWeight: 'bold' }}>
                                        {user?.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '👤'}
                                    </Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                {activeTab === 'pano' && (
                    <>
                        {/* Stat Pills */}
                        <View style={styles.statsRow}>
                            <View style={[styles.statBox, { backgroundColor: 'rgba(167,139,250,0.1)' }]}>
                                <Text style={[styles.statValue, { color: colors.accent }]}>{tasks.filter(t => t.tag !== 'Tamamlandı').length}</Text>
                                <Text style={styles.statLabel}>Aktif</Text>
                            </View>
                            <View style={[styles.statBox, { backgroundColor: 'rgba(74,222,128,0.1)' }]}>
                                <Text style={[styles.statValue, { color: '#4ade80' }]}>{completedCount}</Text>
                                <Text style={styles.statLabel}>Tamamlanan</Text>
                            </View>
                            <View style={[styles.statBox, { backgroundColor: 'rgba(248,113,113,0.1)' }]}>
                                <Text style={[styles.statValue, { color: '#f87171' }]}>{overdueCount}</Text>
                                <Text style={styles.statLabel}>Gecikmiş</Text>
                            </View>
                        </View>

                        {/* Subtitle & Pagination */}
                        <View style={styles.subHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Sparkles size={14} color="#8a93b5" />
                                <Text style={styles.subHeaderTitle}>BUGÜNÜN PANOSU</Text>
                            </View>

                            {/* Pagination Indicator */}
                            <View style={styles.paginationRow}>
                                {COLUMNS.map((col, idx) => {
                                    const colTasksCount = tasks.filter(t => t.columnId === col.id && t.tag !== 'Tamamlandı').length;
                                    return (
                                        <PaginationDot
                                            key={col.id}
                                            isActive={activeCol === idx}
                                            color={col.accent}
                                            count={colTasksCount}
                                        />
                                    );
                                })}
                            </View>
                        </View>
                    </>
                )}
            </View>

            {/* Main Area */}
            {activeTab === 'pano' && (
                loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#a78bfa" />
                        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Görevler Yükleniyor...</Text>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={COLUMNS}
                        horizontal
                        pagingEnabled
                        initialScrollIndex={activeCol}
                        getItemLayout={(data, index) => ({ length: width, offset: width * index, index })}
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) => {
                            const contentOffsetX = e.nativeEvent.contentOffset.x;
                            setActiveCol(Math.round(contentOffsetX / width));
                        }}
                        keyExtractor={item => item.id}
                        renderItem={renderItem}
                    />
                )
            )}

            {activeTab === 'sohbet' && (
                <ChatScreen />
            )}

            {activeTab === 'arsiv' && (
                <ArchiveScreen />
            )}

            {/* Nav */}
            <BottomNavBar activeTab={activeTab} onChangeTab={handleTabChange} completedCount={completedCount} />

            {/* Bottom Sheets */}
            <ShoppingBottomSheet
                visible={showShoppingSheet}
                onClose={() => setShowShoppingSheet(false)}
                onSave={(data: any) => {
                    addTask({
                        title: data.title,
                        note: data.note,
                        tag: data.category || 'Alışveriş',
                        isUrgent: data.isUrgent,
                        columnId: 'alisveris',
                        addedBy: user!.name,
                        avatar: user!.avatar,
                        customPhoto: user!.customPhoto,
                        timestamp: Date.now()
                    });
                }}
            />

            <ProfileDropdownMenu
                visible={showProfileDropdown}
                user={user}
                onClose={() => setShowProfileDropdown(false)}
                onEditProfile={() => setShowProfileEdit(true)}
                onInvite={() => setShowFamilyInvite(true)}
                onViewFamily={() => setShowFamilyMembers(true)}
                onLeaveFamily={() => setShowLeaveFamilyModal(true)}
                onSignOut={logout}
            />

            <LeaveFamilyModal
                visible={showLeaveFamilyModal}
                onClose={() => setShowLeaveFamilyModal(false)}
                onConfirmLeave={async () => {
                    if (user) {
                        await updateProfile({ familyId: user.id });
                    }
                }}
            />

            <ProfileEditModal
                visible={showProfileEdit}
                user={user}
                onClose={() => setShowProfileEdit(false)}
                onSaveName={(name) => {
                    updateProfile({ name });
                }}
                onSavePhoto={(uri) => {
                    updateProfile({ customPhoto: uri });
                }}
            />

            <FamilyInviteModal
                visible={showFamilyInvite}
                onClose={() => setShowFamilyInvite(false)}
            />

            <FamilyMembersModal
                visible={showFamilyMembers}
                onClose={() => setShowFamilyMembers(false)}
                familyId={user?.familyId}
                currentUserEmail={user?.email}
            />

            <BillsBottomSheet
                visible={showBillsSheet}
                onClose={() => setShowBillsSheet(false)}
                onSave={(data: any) => {
                    let parts = [];
                    if (data.amount) parts.push(`💸 ${data.amount} ₺`);
                    if (data.dueDate) parts.push(`⏳ Son Ödeme: ${data.dueDate} `);

                    addTask({
                        title: data.title,
                        note: parts.join(' | '),
                        tag: 'Fatura',
                        columnId: 'faturalar',
                        addedBy: user!.name,
                        avatar: user!.avatar,
                        customPhoto: user!.customPhoto,
                        timestamp: Date.now()
                    });
                }}
            />
            <PlansBottomSheet
                visible={showPlansSheet}
                onClose={() => setShowPlansSheet(false)}
                onSave={(data: any) => {
                    let parts = [];
                    if (data.date) parts.push(`📅 ${data.date} `);
                    if (data.time) parts.push(`⏰ ${data.time} `);
                    if (data.location) parts.push(`📍 ${data.location} `);

                    addTask({
                        title: data.title,
                        note: parts.join(' | '),
                        tag: data.category || 'Plan',
                        columnId: 'planlar',
                        addedBy: user!.name,
                        avatar: user!.avatar,
                        customPhoto: user!.customPhoto,
                        timestamp: Date.now()
                    });
                }}
            />
            <OthersBottomSheet
                visible={showOthersSheet}
                onClose={() => setShowOthersSheet(false)}
                onSave={(data: any) => {
                    addTask({
                        title: data.title,
                        note: data.description,
                        tag: data.category || 'Görev',
                        isUrgent: data.priority === 'yüksek',
                        columnId: 'diger',
                        addedBy: user!.name,
                        avatar: user!.avatar,
                        customPhoto: user!.customPhoto,
                        timestamp: Date.now()
                    });
                }}
            />

            <EditTaskBottomSheet
                visible={!!editTask}
                task={editTask}
                accentColor={editAccent}
                onClose={() => setEditTask(null)}
                onSave={(id, updates) => updateTask(id, updates)}
                onDelete={(id) => deleteTask(id)}
            />

            <CompleteTaskBottomSheet
                visible={!!completeTask}
                task={completeTask}
                accentColor={completeAccent}
                onClose={() => setCompleteTask(null)}
                onSave={(id, note) => {
                    updateTask(id, {
                        tag: 'Tamamlandı',
                        timestamp: Date.now(),
                        completedBy: user?.name,
                        completedByAvatar: user?.customPhoto || user?.avatar,
                        completionNote: note
                    });

                    if (completeTask) {
                        let verb = 'tamamlandı';
                        if (completeTask.columnId === 'alisveris') verb = 'alındı';
                        else if (completeTask.columnId === 'faturalar') verb = 'ödendi';
                        else if (completeTask.columnId === 'planlar') verb = 'gerçekleştirildi';
                        else if (completeTask.columnId === 'diger') verb = 'tamamlandı';

                        sendMessage({
                            author: user?.name || 'Sistem',
                            text: `✅ "${completeTask.title}" ${verb}.${note ? `\nNot: ${note}` : ''} `,
                            timestamp: Date.now(),
                            avatar: user?.avatar || '🤖',
                            customPhoto: user?.customPhoto,
                            isSystem: true
                        });
                    }
                }}
            />

            <ThemePreviewModal
                visible={showThemePreview}
                onClose={() => setShowThemePreview(false)}
            />
        </KeyboardAvoidingView>
    );
}

function createStyles(colors: any) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        headerArea: { backgroundColor: colors.headerBg, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
        header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 10 },
        greeting: { color: colors.textSecondary, fontSize: 13, marginBottom: 0, paddingBottom: 0 },
        familyName: { color: colors.textPrimary, fontSize: 22, fontWeight: 'bold', paddingTop: 0, marginTop: 0 },
        headerIcons: { flexDirection: 'row', gap: 8, alignItems: 'center' },
        iconButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
        themeButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
        badge: { position: 'absolute', top: -3, right: -3, width: 17, height: 17, borderRadius: 8.5, backgroundColor: colors.warning, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: colors.headerBg },
        badgeText: { color: colors.switchThumb, fontSize: 9, fontWeight: 'bold' },
        avatarWrap: { width: 44, height: 44, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#38bdf8', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
        statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 14 },
        statBox: { flex: 1, paddingVertical: 10, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
        statValue: { fontSize: 20, fontWeight: 'bold', marginBottom: 2 },
        statLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
        subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
        subHeaderTitle: { color: colors.textSecondary, fontSize: 11, fontWeight: 'bold', letterSpacing: 0.8 },
        paginationRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
        paginationDot: { height: 6, borderRadius: 3 },
        column: { flex: 1, backgroundColor: colors.card, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 24, elevation: 10 },
        colHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 15, marginTop: 12, marginBottom: 8 },
        iconBox: { width: 34, height: 34, borderRadius: 11, borderWidth: 1, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 12 },
        columnTitle: { fontSize: 16, fontWeight: '700', letterSpacing: -0.1 },
        taskCount: { color: colors.textSecondary, fontSize: 11 },
        countPill: { borderRadius: 20, paddingHorizontal: 11, paddingVertical: 3, borderWidth: 1 },
        countText: { fontSize: 12, fontWeight: '700' },
        addButton: { marginHorizontal: 15, marginBottom: 10, padding: 8, borderRadius: 12, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1.5 },
        addText: { fontSize: 13, fontWeight: '600' }
    });
}
