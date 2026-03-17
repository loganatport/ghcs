import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAppStore } from './src/store/useAppStore';

function AppInitializer({ children }: { children: React.ReactNode }) {
  const loadAll = useAppStore((s) => s.loadAll);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return <>{children}</>;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppInitializer>
        <RootNavigator />
        <StatusBar style="light" />
      </AppInitializer>
    </SafeAreaProvider>
  );
}
