import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    Image,
    Alert
} from 'react-native';
import { Send } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';

import { useMessages, ChatMessage } from '../hooks/useMessages';

const authorColors: Record<string, string> = {
    'Annesi': '#f472b6',
    'Babası': '#fbbf6a',
    'Ayşe': '#a78bfa',
    'Sen': '#5eead4'
};

export default function ChatScreen() {
    const { isDarkMode } = useThemeStore();
    const colors = getColors(isDarkMode);
    const styles = createStyles(colors);

    const user = useAuthStore(state => state.user);
    const { messages, loading, sendMessage, loadMoreMessages, deleteMessage } = useMessages();
    const [input, setInput] = useState('');
    const listRef = useRef<FlatList>(null);
    const insets = useSafeAreaInsets();
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    // BottomNavBar height is 70, plus its dynamic bottom offset:
    const bottomNavOffset = Math.max(insets.bottom, Platform.OS === 'ios' ? 10 : 0);
    const totalBottomPadding = 70 + bottomNavOffset + 10; // extra 10px spacing

    // When keyboard is open, use its height; when closed, use nav bar padding
    const currentBottomPadding = keyboardHeight > 0 ? keyboardHeight : totalBottomPadding;

    // Attach 'isMine' on the fly for rendering and reverse for inverted list
    const displayMessages = [...messages].reverse().map(msg => ({
        ...msg,
        isMine: msg.author === user?.name || msg.author === 'Sen'
    }));

    // Track keyboard height to adjust layout manually when needed
    useEffect(() => {
        const keyboardShowEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const keyboardHideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSub = Keyboard.addListener(keyboardShowEvent, (e) => {
            // Give slightly more padding to ensure SwiftKey and other keyboards don't clip
            setKeyboardHeight(e.endCoordinates.height + (Platform.OS === 'android' ? 45 : 0));
        });

        const hideSub = Keyboard.addListener(keyboardHideEvent, () => {
            setKeyboardHeight(0);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const handleSend = () => {
        if (!input.trim() || !user) return;

        sendMessage({
            author: user.name,
            text: input.trim(),
            timestamp: Date.now(),
            avatar: user.avatar,
            customPhoto: user.customPhoto,
        });

        setInput('');
        // Keyboard.dismiss() removed to keep keyboard open
    };

    const renderItem = ({ item }: { item: typeof displayMessages[0] }) => {
        const isMine = item.isMine;
        const bubbleColor = isMine ? (isDarkMode ? '#2a3560' : '#e0e7ff') : colors.card;
        const nameColor = authorColors[item.author] || colors.textSecondary;
        const timeString = new Date(item.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

        const getInitials = (name: string) => {
            if (!name) return '?';
            const parts = name.trim().split(/\s+/);
            if (parts.length > 1) {
                return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
            }
            return name.substring(0, 2).toUpperCase();
        };

        const renderAvatarContent = () => {
            if (item.customPhoto) {
                return <Image source={{ uri: item.customPhoto }} style={styles.profilePhoto} />;
            }
            if (item.avatar && item.avatar.startsWith('http')) {
                return <Image source={{ uri: item.avatar }} style={styles.profilePhoto} />;
            }
            return <Text style={styles.initialsText}>{getInitials(item.author)}</Text>;
        };

        return (
            <View style={[styles.messageRow, isMine ? styles.messageMineRow : styles.messageOtherRow]}>
                {!isMine && (
                    <View style={styles.avatarWrap}>
                        {renderAvatarContent()}
                    </View>
                )}

                <View style={[styles.messageContent, isMine ? styles.contentMine : styles.contentOther]}>
                    {!isMine && <Text style={[styles.authorName, { color: nameColor }]}>{item.author}</Text>}

                    <TouchableOpacity
                        activeOpacity={isMine ? 0.7 : 1}
                        onLongPress={() => {
                            if (isMine) {
                                Alert.alert(
                                    'Mesajı Sil',
                                    'Bu mesajı herkes için silmek istediğine emin misin?',
                                    [
                                        { text: 'İptal', style: 'cancel' },
                                        { text: 'Sil', style: 'destructive', onPress: () => deleteMessage(item.id) }
                                    ]
                                );
                            }
                        }}
                        style={[
                            styles.bubble,
                            { backgroundColor: bubbleColor },
                            isMine ? styles.bubbleMine : styles.bubbleOther
                        ]}
                    >
                        <Text style={styles.messageText}>{item.text}</Text>
                    </TouchableOpacity>

                    <Text style={[styles.timeText, isMine && { alignSelf: 'flex-end' }]}>{timeString}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingBottom: currentBottomPadding }]}>
            <FlatList
                ref={listRef}
                data={displayMessages}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                inverted
                keyboardShouldPersistTaps="handled"
                onEndReached={loadMoreMessages}
                onEndReachedThreshold={0.5}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Bir mesaj yazın..."
                    placeholderTextColor="#8a93b5"
                    value={input}
                    onChangeText={setInput}
                    multiline
                />
                <TouchableOpacity
                    style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
                    onPress={handleSend}
                    disabled={!input.trim()}
                >
                    {input.trim() ? (
                        <LinearGradient
                            colors={['#5eead4', '#60a5fa']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.sendGradient}
                        >
                            <Send size={18} color="#fff" />
                        </LinearGradient>
                    ) : (
                        <View style={[styles.sendGradient, { backgroundColor: colors.border }]}>
                            <Send size={18} color="#47506f" />
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

function createStyles(colors: any) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            paddingBottom: 90, // Space for BottomNavBar
        },
        keyboardInner: {
            flex: 1,
        },
        listContent: {
            padding: 16,
            paddingBottom: 20,
            gap: 16,
            flexGrow: 1, // ensures content starts from bottom up in an inverted list
        },
        messageRow: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: 10,
        },
        messageMineRow: {
            justifyContent: 'flex-end',
        },
        messageOtherRow: {
            justifyContent: 'flex-start',
        },
        avatarWrap: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.inactiveDot,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16, // to align with top of bubble rather than time text
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.border,
        },
        profilePhoto: {
            width: '100%',
            height: '100%',
            resizeMode: 'cover',
        },
        initialsText: {
            color: colors.textSecondary,
            fontSize: 12,
            fontWeight: 'bold',
            letterSpacing: 0.5,
        },
        messageContent: {
            maxWidth: '78%',
        },
        contentMine: {
            alignItems: 'flex-end',
        },
        contentOther: {
            alignItems: 'flex-start',
        },
        authorName: {
            fontSize: 11,
            fontWeight: 'bold',
            marginBottom: 4,
            marginLeft: 12,
        },
        bubble: {
            paddingVertical: 12,
            paddingHorizontal: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 2,
        },
        bubbleMine: {
            borderRadius: 20,
            borderBottomRightRadius: 6,
        },
        bubbleOther: {
            borderRadius: 20,
            borderBottomLeftRadius: 6,
            borderWidth: 1,
            borderColor: colors.border,
        },
        messageText: {
            color: colors.textPrimary,
            fontSize: 14,
            lineHeight: 20,
        },
        timeText: {
            color: colors.textSecondary,
            fontSize: 10,
            marginTop: 6,
            marginHorizontal: 6,
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            paddingBottom: Platform.OS === 'ios' ? 24 : 12,
            backgroundColor: colors.headerBg,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        input: {
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: 22,
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 12,
            color: colors.textPrimary,
            fontSize: 14,
            borderWidth: 1,
            borderColor: colors.inputBorder,
            maxHeight: 100,
        },
        sendButton: {
            marginLeft: 8,
        },
        sendButtonDisabled: {
            opacity: 0.8,
        },
        sendGradient: {
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
        },
    });
}
