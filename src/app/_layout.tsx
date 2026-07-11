import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/core/query/queryClient';

/**
 * Layout racine : fournisseurs globaux (React Query, zones sûres, gestes) et
 * navigateur Stack. Les titres/entêtes sont définis par écran.
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="booking" options={{ title: 'Réserver' }} />
            <Stack.Screen name="track" options={{ title: 'Suivre' }} />
            <Stack.Screen
              name="history"
              options={{ title: 'Mes réservations' }}
            />
          </Stack>
          <StatusBar style="auto" />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
