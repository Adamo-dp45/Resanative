import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { env } from '@/core/config/env';
import { spacing, useTheme } from '@/core/theme/theme';
import { Button } from '@/core/ui/Button';
import { Screen } from '@/core/ui/Screen';
import { Text } from '@/core/ui/Text';
import { QueryBoundary } from '@/core/ui/QueryBoundary';

import { useCompagnie } from '../api/queries';
import { useBookingStore } from '../store/bookingStore';

/** Accueil : branding de la compagnie + points d'entrée. */
export function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const compagnie = useCompagnie();
  const reset = useBookingStore((s) => s.reset);

  return (
    <Screen>
      <QueryBoundary query={compagnie}>
        {(c) => (
          <View style={styles.container}>
            <View
              style={[styles.logo, { backgroundColor: colors.primaryContainer }]}
            >
              <Text
                variant="display"
                bold
                style={{ color: colors.onPrimaryContainer }}
              >
                {(c.sigle ?? c.libelle ?? '?').charAt(0).toUpperCase()}
              </Text>
            </View>

            <Text variant="title" center bold style={styles.name}>
              {c.libelle ?? 'Réservation'}
            </Text>
            <Text center tone="muted">
              Réservez votre place en quelques secondes
            </Text>

            <View style={styles.actions}>
              <Button
                label="Réserver un trajet"
                icon="🚌"
                onPress={() => {
                  reset();
                  router.push('/booking');
                }}
              />
              <Button
                label="Suivre une réservation"
                variant="outline"
                icon="🔎"
                onPress={() => router.push('/track')}
              />
              <Button
                label="Mes réservations"
                variant="text"
                icon="🕘"
                onPress={() => router.push('/history')}
              />
            </View>

            <Text center variant="caption" tone="muted">
              {[c.contact, c.siteweb].filter(Boolean).join(' · ')}
            </Text>
            <Text center variant="label" tone="muted">
              Compagnie : {env.companySlug}
            </Text>
          </View>
        )}
      </QueryBoundary>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'stretch', gap: spacing.md, paddingTop: spacing.xl },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { marginTop: spacing.md },
  actions: { gap: spacing.md, marginTop: spacing.xl, marginBottom: spacing.lg },
});
