import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LayoutGrid, MessageCircle, CheckCircle } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface BottomNavProps {
    activeTab: 'pano' | 'sohbet' | 'arsiv';
    onChangeTab: (tab: 'pano' | 'sohbet' | 'arsiv') => void;
    completedCount: number;
}

export default function BottomNav({ activeTab, onChangeTab, completedCount }: BottomNavProps) {
    const insets = useSafeAreaInsets();
    const centerScale = useSharedValue(1);
    const pulseGlow = useSharedValue(0.1);

    useEffect(() => {
        pulseGlow.value = withRepeat(
            withSequence(
                withTiming(0.8, { duration: 1500 }),
                withTiming(0.2, { duration: 1500 })
            ),
            -1,
            true
        );
    }, []);

    const centerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: centerScale.value }]
    }));

    const glowStyle = useAnimatedStyle(() => ({
        shadowOpacity: pulseGlow.value,
    }));

    const handleCenterPressIn = () => { centerScale.value = withSpring(0.85); };
    const handleCenterPressOut = () => {
        centerScale.value = withSpring(1);
        onChangeTab('arsiv');
    };

    return (
        <View style={[styles.navContainer, { bottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 10 : 0) }]}>
            <View style={styles.navBar}>

                {/* Pano Tab */}
                <TouchableOpacity style={styles.navBtn} onPress={() => onChangeTab('pano')} activeOpacity={0.7}>
                    <LayoutGrid size={24} color={activeTab === 'pano' ? '#a78bfa' : '#47506f'} />
                    <Text style={[styles.navText, activeTab === 'pano' && { color: '#e4e8f8' }]}>Pano</Text>
                </TouchableOpacity>

                {/* Center Button */}
                <View style={styles.centerWrap}>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPressIn={handleCenterPressIn}
                        onPressOut={handleCenterPressOut}
                    >
                        <View style={styles.centerBtnContainer}>
                            {/* Breathing Glow Aura */}
                            <Animated.View style={[styles.glowRing, glowStyle]} />

                            <Animated.View style={[styles.centerBtn, centerStyle]}>
                                <CheckCircle size={26} color="#4ade80" strokeWidth={1.5} />
                                {completedCount > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{completedCount}</Text>
                                    </View>
                                )}
                            </Animated.View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Sohbet Tab */}
                <TouchableOpacity style={styles.navBtn} onPress={() => onChangeTab('sohbet')} activeOpacity={0.7}>
                    <MessageCircle size={24} color={activeTab === 'sohbet' ? '#5eead4' : '#47506f'} />
                    <Text style={[styles.navText, activeTab === 'sohbet' && { color: '#e4e8f8' }]}>Sohbet</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    navContainer: {
        position: 'absolute',
        width: width,
        alignItems: 'center',
    },
    navBar: {
        backgroundColor: 'rgba(18,20,28,0.92)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: width * 0.85,
        height: 70,
        borderRadius: 35,
        paddingHorizontal: 25,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    navBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
    },
    navText: {
        color: '#47506f',
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 4,
    },
    centerWrap: {
        width: 60,
        alignItems: 'center',
    },
    centerBtnContainer: {
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    glowRing: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 28,
        backgroundColor: 'transparent',
        shadowColor: '#4ade80',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 18,
        elevation: 10,
    },
    centerBtn: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#12141c', // match background or slightly lighter
        borderWidth: 1.5,
        borderColor: '#4ade80',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#4ade80',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#f87171',
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#181b27'
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    }
});
