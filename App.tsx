import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from './src/store/authStore';
import { useThemeStore } from './src/store/themeStore';
import { getColors } from './src/theme/colors';
import { ProfileSelection } from './src/components/ProfileSelection';
import FamilyFlowBoard from './src/components/FamilyFlowBoard';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  const { user, isAuthReady, initAuth } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const colors = getColors(isDarkMode);

  useEffect(() => {
    const unsubscribe = initAuth();
    return () => unsubscribe();
  }, [initAuth]);

  if (!isAuthReady) {
    return null; // Wait for Firebase Auth to initialize before rendering
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: colors.background }]}>
          <StatusBar style={isDarkMode ? "light" : "dark"} />
          {!user ? <ProfileSelection /> : <FamilyFlowBoard />}
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
});
