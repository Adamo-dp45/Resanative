import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { spacing, useTheme } from '../theme/theme';
import { Button } from './Button';
import { Text } from './Text';

/** Indicateur de chargement centré. */
export function LoadingView() {
  const { colors } = useTheme();
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

/** Vue d'erreur centrée avec action « Réessayer » optionnelle. */
export function ErrorView({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.center}>
      <Text center style={styles.icon}>
        ⚠️
      </Text>
      <Text center>{message}</Text>
      {onRetry ? (
        <Button
          label="Réessayer"
          variant="outline"
          onPress={onRetry}
          style={styles.retry}
        />
      ) : null}
    </View>
  );
}

/** Vue « liste vide » centrée. */
export function EmptyView({ message, icon = '📭' }: { message: string; icon?: string }) {
  return (
    <View style={styles.center}>
      <Text center style={styles.icon}>
        {icon}
      </Text>
      <Text center tone="muted">
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  icon: { fontSize: 40 },
  retry: { marginTop: spacing.sm, alignSelf: 'center', paddingHorizontal: spacing.xl },
});
