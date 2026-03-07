import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableWithoutFeedback,
    Animated,
    PanResponder,
    Dimensions,
    BackHandler,
    Keyboard,
    Platform,
} from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DISMISS_THRESHOLD = 120;

interface BottomSheetWrapperProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    accentColor?: string;
    minHeight?: number;
}

export default function BottomSheetWrapper({
    visible,
    onClose,
    children,
    accentColor = '#a78bfa',
    minHeight = 400,
}: BottomSheetWrapperProps) {
    const { isDarkMode } = useThemeStore();
    const colors = getColors(isDarkMode);
    const styles = createStyles(colors);

    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [renderVisible, setRenderVisible] = useState(visible);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        const keyboardShowEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const keyboardHideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSub = Keyboard.addListener(keyboardShowEvent, (e) => {
            setKeyboardHeight(e.endCoordinates.height);
        });
        const hideSub = Keyboard.addListener(keyboardHideEvent, () => {
            setKeyboardHeight(0);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    useEffect(() => {
        if (visible) {
            setRenderVisible(true);
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    bounciness: 6,
                    speed: 14,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else if (renderVisible) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: SCREEN_HEIGHT,
                    duration: 220,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 180,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setRenderVisible(false);
            });
        }
    }, [visible]);

    // Handle Android back button
    useEffect(() => {
        if (!visible) return;
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            onClose();
            return true;
        });
        return () => sub.remove();
    }, [visible, onClose]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (e: any, gs: any) =>
                gs.dy > 10 && Math.abs(gs.dx) < 25,
            onPanResponderMove: (e: any, gs: any) => {
                if (gs.dy > 0) slideAnim.setValue(gs.dy);
            },
            onPanResponderRelease: (e: any, gs: any) => {
                if (gs.dy > DISMISS_THRESHOLD || gs.vy > 0.8) {
                    Animated.timing(slideAnim, {
                        toValue: SCREEN_HEIGHT,
                        duration: 200,
                        useNativeDriver: true,
                    }).start(() => onClose());
                } else {
                    Animated.spring(slideAnim, {
                        toValue: 0,
                        useNativeDriver: true,
                        bounciness: 8,
                    }).start();
                }
            },
        })
    ).current;

    // Don't render anything when not visible (and animation is done)
    if (!renderVisible) return null;

    return (
        <View
            style={styles.fullscreen}
            pointerEvents="box-none"
        >
            {/* Backdrop */}
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
            </TouchableWithoutFeedback>

            {/* Sheet */}
            <Animated.View
                style={[
                    styles.sheetContainer,
                    {
                        minHeight,
                        maxHeight: SCREEN_HEIGHT * 0.85,
                        transform: [{ translateY: slideAnim }],
                        paddingBottom: keyboardHeight,
                    },
                ]}
            >
                {/* Drag handle */}
                <View {...panResponder.panHandlers} style={styles.dragHandle}>
                    <View style={[styles.shimmer, { backgroundColor: accentColor }]} />
                    <View style={styles.handleBar} />
                </View>

                {children}
            </Animated.View>
        </View>
    );
}

function createStyles(colors: any) {
    return StyleSheet.create({
        fullscreen: {
            ...StyleSheet.absoluteFillObject,
            zIndex: 1000,
            elevation: 1000,
            justifyContent: 'flex-end',
        },
        backdrop: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: colors.modalOverlay,
        },
        sheetContainer: {
            backgroundColor: colors.card,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -6 },
            shadowOpacity: 0.5,
            shadowRadius: 30,
            elevation: 20,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
        },
        shimmer: {
            height: 3,
            width: '100%',
            opacity: 0.6,
        },
        dragHandle: {
            width: '100%',
            paddingBottom: 8,
            alignItems: 'center',
        },
        handleBar: {
            marginTop: 12,
            width: 38,
            height: 4,
            borderRadius: 3,
            backgroundColor: colors.border,
        },
    });
}
