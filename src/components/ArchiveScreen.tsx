import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ScrollView,
    Platform,
    Image,
} from 'react-native';
import { Archive, SlidersHorizontal, CheckCircle2, Sparkles, Clock, X, ShoppingCart, Zap, Calendar, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTasks, Task } from '../hooks/useTasks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COL_CFG: Record<string, { Icon: any; accent: string; accentBg: string; label: string }> = {
    alisveris: { Icon: ShoppingCart, accent: '#5eead4', accentBg: 'rgba(94,234,212,0.12)', label: 'Alışveriş' },
    faturalar: { Icon: Zap, accent: '#fbbf6a', accentBg: 'rgba(251,191,106,0.12)', label: 'Faturalar' },
    planlar: { Icon: Calendar, accent: '#a78bfa', accentBg: 'rgba(167,139,250,0.12)', label: 'Planlar' },
    diger: { Icon: Star, accent: '#f472b6', accentBg: 'rgba(244,114,182,0.12)', label: 'Diğerleri' },
};

export default function ArchiveScreen() {
    const { tasks, deleteTask } = useTasks();
    const completedTasks = tasks.filter(t => t.tag === 'Tamamlandı');
    const insets = useSafeAreaInsets();
    const bottomPadding = 70 + Math.max(insets.bottom, Platform.OS === 'ios' ? 10 : 0);

    const [showFilter, setShowFilter] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string>('all');

    const filtered = activeFilter === 'all'
        ? completedTasks
        : completedTasks.filter(ct => ct.columnId === activeFilter);

    // Naive 'today' check (if timestamp was within last 24h roughly)
    const now = Date.now();
    const todayCount = completedTasks.filter(ct => (now - ct.timestamp) < 86400000).length;

    const handleRemove = (id: string) => {
        deleteTask(id);
    };

    const getFormattedTimestamp = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        const timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

        if (diffDays === 0 && date.getDate() === now.getDate()) {
            return timeStr;
        } else if (diffDays === 1 || (diffDays === 0 && date.getDate() !== now.getDate())) {
            return `Dün ${timeStr}`;
        } else {
            const day = date.getDate().toString().padStart(2, '0');
            const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
            const monthStr = months[date.getMonth()];
            return `${day} ${monthStr} ${timeStr}`;
        }
    };

    const renderItem = ({ item: ct }: { item: Task }) => {
        const cfg = COL_CFG[ct.columnId] || COL_CFG.diger;
        const formattedTime = getFormattedTimestamp(ct.timestamp);
        const avatarStr = ct.customPhoto || ct.completedByAvatar || ct.avatar || '';

        return (
            <View style={styles.cardContainer}>
                {/* Timeline node */}
                <View style={[styles.timelineNode, { backgroundColor: cfg.accentBg, borderColor: cfg.accent }]}>
                    <cfg.Icon size={10} color={cfg.accent} />
                </View>

                {/* Card */}
                <View style={styles.card}>
                    <LinearGradient
                        colors={['transparent', cfg.accent + '55', cfg.accent, cfg.accent + '55', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.cardShimmer}
                    />

                    <View style={styles.cardRow}>
                        <View style={styles.cardLeft}>
                            <View style={styles.titleRow}>
                                <CheckCircle2 size={14} color="#4ade80" />
                                <Text style={styles.taskTitle} numberOfLines={1}>{ct.title}</Text>
                            </View>
                            <View style={styles.tagRow}>
                                <View style={[styles.tagPill, { backgroundColor: cfg.accentBg, borderColor: cfg.accent + '22' }]}>
                                    <Text style={[styles.tagText, { color: cfg.accent }]}>{ct.tag}</Text>
                                </View>
                                <Text style={styles.colLabel}>{cfg.label}</Text>
                            </View>
                        </View>

                        <View style={styles.cardRight}>
                            <View style={styles.avatarRow}>
                                <View style={styles.avatarWrap}>
                                    {avatarStr.length > 2 ? (
                                        <Image source={{ uri: avatarStr }} style={{ width: '100%', height: '100%', borderRadius: 14 }} />
                                    ) : (
                                        <Text style={{ fontSize: 13, color: '#fff', fontWeight: 'bold' }}>
                                            {ct.completedBy ? ct.completedBy.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '👤'}
                                        </Text>
                                    )}
                                </View>
                                <TouchableOpacity style={styles.closeBtn} onPress={() => handleRemove(ct.id)}>
                                    <X size={12} color="#47506f" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.timeRow}>
                                <Clock size={10} color="#47506f" />
                                <Text style={styles.timeText}>{formattedTime}</Text>
                            </View>
                            <Text style={styles.authorText} numberOfLines={1}>{ct.completedBy || ct.addedBy}</Text>
                        </View>
                    </View>

                    {(ct.completionNote || ct.note) && (
                        <View style={[styles.noteBox, { borderLeftColor: cfg.accent + '66' }]}>
                            <Text style={[styles.quoteMark, { color: cfg.accent }]}>"</Text>
                            <View style={styles.noteContent}>
                                <Text style={[styles.noteLabel, { color: cfg.accent }]}>
                                    {ct.completionNote ? "İLETİLEN NOT" : "EK NOT"}
                                </Text>
                                <Text style={styles.noteDesc}>{ct.completionNote || ct.note}</Text>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingBottom: bottomPadding }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.headerIcon}>
                        <Archive size={18} color="#4ade80" />
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.title}>Tamamlananlar</Text>
                        <Text style={styles.subtitle}>
                            {completedTasks.length} görev arşivlendi {todayCount > 0 && `• Bugün ${todayCount} yeni`}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.filterBtn, showFilter && styles.filterBtnActive]}
                        onPress={() => setShowFilter(!showFilter)}
                    >
                        <SlidersHorizontal size={18} color={showFilter ? '#a78bfa' : '#8a93b5'} />
                    </TouchableOpacity>
                </View>

                {/* Stats */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
                    <View style={[styles.statCell, { backgroundColor: 'rgba(74,222,128,0.1)' }]}>
                        <Sparkles size={12} color="#4ade80" />
                        <Text style={[styles.statVal, { color: '#4ade80' }]}>{completedTasks.length}</Text>
                        <Text style={styles.statLabel}>Toplam</Text>
                    </View>
                    <View style={[styles.statCell, { backgroundColor: 'rgba(167,139,250,0.1)' }]}>
                        <Sparkles size={12} color="#a78bfa" />
                        <Text style={[styles.statVal, { color: '#a78bfa' }]}>{todayCount}</Text>
                        <Text style={styles.statLabel}>Bugün</Text>
                    </View>
                </ScrollView>

                {/* Filters */}
                {showFilter && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
                        <TouchableOpacity
                            style={[styles.filterChip, activeFilter === 'all' && styles.filterChipAll]}
                            onPress={() => setActiveFilter('all')}
                        >
                            <Text style={[styles.filterChipText, activeFilter === 'all' && { color: '#e4e8f8', fontWeight: 'bold' }]}>Tümü</Text>
                        </TouchableOpacity>
                        {Object.entries(COL_CFG).map(([key, cfg]) => {
                            const isActive = activeFilter === key;
                            return (
                                <TouchableOpacity
                                    key={key}
                                    style={[
                                        styles.filterChip,
                                        isActive && { backgroundColor: cfg.accentBg, borderColor: cfg.accent + '55' }
                                    ]}
                                    onPress={() => setActiveFilter(key)}
                                >
                                    <Text style={[styles.filterChipText, isActive && { color: cfg.accent, fontWeight: 'bold' }]}>
                                        {cfg.label}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })}
                    </ScrollView>
                )}
            </View>

            {/* List */}
            {filtered.length === 0 ? (
                <View style={styles.emptyWrap}>
                    <View style={styles.emptyIcon}>
                        <CheckCircle2 size={36} color="#4ade80" />
                    </View>
                    <Text style={styles.emptyTitle}>Henüz tamamlanan görev yok</Text>
                    <Text style={styles.emptyDesc}>Bir görevi tamamladığında burada görünecek ✨</Text>
                </View>
            ) : (
                <View style={styles.listWrap}>
                    {/* Vertical Line */}
                    <View style={styles.verticalLine} />

                    <FlatList
                        data={filtered}
                        keyExtractor={item => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={[styles.listContent, { paddingBottom: 20 }]}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#12141c',
    },
    header: {
        backgroundColor: '#181b27',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
        paddingTop: 16,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    headerIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(74,222,128,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(74,222,128,0.22)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        flex: 1,
        marginLeft: 12,
    },
    title: {
        color: '#e4e8f8',
        fontSize: 18,
        fontWeight: 'bold',
    },
    subtitle: {
        color: '#8a93b5',
        fontSize: 12,
        marginTop: 2,
    },
    filterBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    filterBtnActive: {
        backgroundColor: 'rgba(167,139,250,0.18)',
        borderColor: 'rgba(167,139,250,0.4)',
    },
    statsRow: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        gap: 8,
    },
    statCell: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    statVal: {
        fontSize: 13,
        fontWeight: 'bold',
    },
    statLabel: {
        color: '#8a93b5',
        fontSize: 11,
    },
    filtersRow: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 16,
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.06)',
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    filterChipAll: {
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    filterChipText: {
        color: '#8a93b5',
        fontSize: 12,
    },
    listWrap: {
        flex: 1,
        position: 'relative',
    },
    verticalLine: {
        position: 'absolute',
        left: 42,
        top: 0,
        bottom: 0,
        width: 1.5,
        backgroundColor: 'rgba(255,255,255,0.05)',
        zIndex: 0,
    },
    listContent: {
        paddingTop: 24,
        paddingHorizontal: 20,
        paddingBottom: 120,
    },
    cardContainer: {
        position: 'relative',
        paddingLeft: 46,
        marginBottom: 16,
    },
    timelineNode: {
        position: 'absolute',
        left: 12, // 42 (line) - 10 (radius) + 20 (padding)
        top: 14,
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    card: {
        backgroundColor: '#1e2133',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
    },
    cardShimmer: {
        height: 2,
        width: '100%',
    },
    cardRow: {
        flexDirection: 'row',
        padding: 14,
        gap: 12,
    },
    cardLeft: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    taskTitle: {
        color: '#8a93b5',
        fontSize: 15,
        fontWeight: 'bold',
        textDecorationLine: 'line-through',
        textDecorationColor: 'rgba(255,255,255,0.2)',
        flexShrink: 1,
    },
    tagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    tagPill: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        borderWidth: 1,
    },
    tagText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    colLabel: {
        color: '#47506f',
        fontSize: 11,
    },
    cardRight: {
        alignItems: 'flex-end',
        gap: 4,
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    avatarWrap: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    closeBtn: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        color: '#47506f',
        fontSize: 11,
    },
    authorText: {
        color: '#47506f',
        fontSize: 10,
        maxWidth: 60,
    },
    noteBox: {
        marginHorizontal: 14,
        marginBottom: 14,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        borderLeftWidth: 3,
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: 'row',
        gap: 8,
    },
    quoteMark: {
        fontSize: 24,
        lineHeight: 24,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        opacity: 0.6,
    },
    noteContent: {
        flex: 1,
    },
    noteLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    noteDesc: {
        color: '#8a93b5',
        fontSize: 13,
        lineHeight: 18,
    },
    emptyWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: 'rgba(74,222,128,0.1)',
        borderWidth: 2,
        borderColor: 'rgba(74,222,128,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        color: '#8a93b5',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptyDesc: {
        color: '#47506f',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
    }
});
