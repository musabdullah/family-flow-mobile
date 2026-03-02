import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from './src/store/authStore';
import { ProfileSelection } from './src/components/ProfileSelection';
import FamilyFlowBoard from './src/components/FamilyFlowBoard';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  const { user, isAuthReady, initAuth } = useAuthStore();

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
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
          <StatusBar style="light" />
          {!user ? <ProfileSelection /> : <FamilyFlowBoard />}
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12141c', // Dark background as default
  },
});
