import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    withDelay,
    Easing,
    FadeInDown,
    FadeInLeft,
    ZoomIn
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
    webClientId: '459137016269-2gnenn8bdsub2bhj3rec4g511ejlea51.apps.googleusercontent.com',
});

const { width, height } = Dimensions.get('window');

function GoogleLogo({ size = 20 }: { size?: number }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <Path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
            <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
        </Svg>
    );
}

const PARTICLES = [
    { emoji: '🛒', x: '8%', y: '18%', delay: 0, dur: 6000 },
    { emoji: '⚡', x: '82%', y: '12%', delay: 1200, dur: 7000 },
    { emoji: '📅', x: '15%', y: '72%', delay: 600, dur: 5500 },
    { emoji: '⭐', x: '78%', y: '68%', delay: 1800, dur: 6500 },
    { emoji: '✅', x: '50%', y: '8%', delay: 300, dur: 8000 },
    { emoji: '🏠', x: '85%', y: '42%', delay: 2000, dur: 5000 },
    { emoji: '💜', x: '5%', y: '45%', delay: 1000, dur: 7000 },
    { emoji: '🌟', x: '60%', y: '88%', delay: 900, dur: 6000 },
];

const FloatingParticle = ({ particle }: { particle: typeof PARTICLES[0] }) => {
    const translateY = useSharedValue(0);
    const rotate = useSharedValue(0);

    useEffect(() => {
        translateY.value = withDelay(
            particle.delay,
            withRepeat(
                withSequence(
                    withTiming(-14, { duration: particle.dur / 2, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0, { duration: particle.dur / 2, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            )
        );

        rotate.value = withDelay(
            particle.delay,
            withRepeat(
                withSequence(
                    withTiming(8, { duration: particle.dur / 2, easing: Easing.inOut(Easing.ease) }),
                    withTiming(-8, { duration: particle.dur / 2, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { rotate: `${rotate.value}deg` }
        ]
    }));

    return (
        <Animated.View style={[
            { position: 'absolute', left: particle.x as any, top: particle.y as any, opacity: 0.15 },
            animatedStyle
        ]}>
            <Text style={{ fontSize: 22 }}>{particle.emoji}</Text>
        </Animated.View>
    );
};

export function ProfileSelection() {
    const login = useAuthStore(state => state.login);
    const [loading, setLoading] = React.useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            const userInfo = await GoogleSignin.signIn();
            const idToken = userInfo.data?.idToken;

            if (!idToken) throw new Error('Google Sign-In failed to return ID token.');

            const credential = GoogleAuthProvider.credential(idToken);
            await signInWithCredential(auth, credential);
            // Firebase onAuthStateChanged will handle navigation in initAuth
        } catch (error: any) {
            console.error(error);
            Alert.alert('Giriş Başarısız', error?.message || 'Google ile giriş yaparken bir sorun oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0d0f18', '#12141c', '#181b27']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {PARTICLES.map((p, i) => <FloatingParticle key={i} particle={p} />)}

            {/* Background Glows */}
            <View style={[styles.glow, { top: -120, left: width / 2 - 170, backgroundColor: 'rgba(167,139,250,0.08)' }]} />
            <View style={[styles.glow, { bottom: -80, right: -60, backgroundColor: 'rgba(94,234,212,0.07)', width: 260, height: 260 }]} />

            {/* Main Card */}
            <Animated.View entering={ZoomIn.duration(550).delay(100)} style={styles.card}>

                {/* Logo */}
                <Animated.View entering={ZoomIn.duration(500).delay(150)} style={styles.logoWrap}>
                    <LinearGradient
                        colors={['rgba(167,139,250,0.22)', 'rgba(94,234,212,0.14)']}
                        style={StyleSheet.absoluteFillObject}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                    <Text style={styles.logoText}>🏡</Text>
                </Animated.View>

                {/* Title */}
                <Animated.View entering={FadeInDown.duration(450).delay(250)} style={styles.titleWrap}>
                    <Text style={styles.title}>FamilyFlow</Text>
                    <Text style={styles.subtitle}>Ailenizle birlikte organize olun 🌟</Text>
                </Animated.View>

                {/* Features */}
                <View style={styles.features}>
                    {[
                        { icon: '🛒', text: 'Alışveriş listesi oluşturun' },
                        { icon: '⚡', text: 'Faturaları takip edin' },
                        { icon: '📅', text: 'Planlarınızı senkronize edin' },
                        { icon: '💬', text: 'Ailenizle sohbet edin' },
                    ].map((item, i) => (
                        <Animated.View
                            key={i}
                            entering={FadeInLeft.duration(350).delay(380 + (i * 70))}
                            style={styles.featureRow}
                        >
                            <Text style={styles.featureIcon}>{item.icon}</Text>
                            <Text style={styles.featureText}>{item.text}</Text>
                        </Animated.View>
                    ))}
                </View>

                {/* Login Button */}
                <Animated.View entering={FadeInDown.duration(400).delay(550)} style={{ width: '100%' }}>
                    <TouchableOpacity
                        style={styles.loginBtn}
                        activeOpacity={0.8}
                        onPress={handleGoogleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <Text style={[styles.loginBtnText, { color: '#8a93b5' }]}>Giriş yapılıyor...</Text>
                        ) : (
                            <>
                                <GoogleLogo size={20} />
                                <Text style={styles.loginBtnText}>Google ile Giriş Yap</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </Animated.View>

                {/* Divider */}
                <View style={styles.dividerWrap}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>GÜVENLİ GİRİŞ</Text>
                    <View style={styles.divider} />
                </View>

                <Animated.Text entering={FadeInDown.duration(400).delay(700)} style={styles.securityNote}>
                    🔒 Google hesabınızla güvenli şekilde giriş yapın.{'\n'}
                    Şifre saklanmaz, verileriniz korunur.
                </Animated.Text>
            </Animated.View>

            <Animated.Text entering={FadeInDown.duration(400).delay(800)} style={styles.versionNote}>
                FamilyFlow v1.0 · Aile Görev Yönetimi
            </Animated.Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#12141c' },
    glow: { position: 'absolute', width: 340, height: 340, borderRadius: 170 },
    card: {
        width: '90%',
        maxWidth: 360,
        backgroundColor: 'rgba(24,27,39,0.85)',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderRadius: 28,
        padding: 32,
        alignItems: 'center',
        zIndex: 1,
    },
    logoWrap: {
        width: 80,
        height: 80,
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: 'rgba(167,139,250,0.28)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 22,
        overflow: 'hidden',
    },
    logoText: { fontSize: 40 },
    titleWrap: { alignItems: 'center', marginBottom: 28 },
    title: { color: '#eef0fb', fontSize: 26, fontWeight: 'bold', marginBottom: 6, letterSpacing: -0.5 },
    subtitle: { color: 'rgba(180,186,220,0.7)', fontSize: 14 },
    features: { width: '100%', gap: 10, marginBottom: 32 },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'rgba(255,255,255,0.035)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    featureIcon: { fontSize: 18 },
    featureText: { color: 'rgba(200,206,235,0.8)', fontSize: 13 },
    loginBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        paddingVertical: 14,
        borderRadius: 14,
        gap: 12,
    },
    loginBtnText: { color: '#1a1a2e', fontSize: 15, fontWeight: 'bold', letterSpacing: -0.1 },
    dividerWrap: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: 24, gap: 12 },
    divider: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.07)' },
    dividerText: { color: 'rgba(150,158,190,0.5)', fontSize: 11, fontWeight: 'bold' },
    securityNote: { color: 'rgba(140,150,185,0.5)', fontSize: 11.5, textAlign: 'center', lineHeight: 18 },
    versionNote: { color: 'rgba(120,128,160,0.4)', fontSize: 11, marginTop: 24, position: 'absolute', bottom: 40 },
});
