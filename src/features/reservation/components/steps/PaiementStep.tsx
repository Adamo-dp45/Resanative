import { ScrollView, StyleSheet, View } from 'react-native';

import { formatDateTime, formatMoney } from '@/core/format/formatters';
import { spacing, useTheme } from '@/core/theme/theme';
import { Card } from '@/core/ui/Card';
import { Text } from '@/core/ui/Text';

import { isSimulatedPayment } from '../../api/types';
import { useBookingStore } from '../../store/bookingStore';

/**
 * Étape 4 — paiement de la réservation créée. Le prestataire réel n'étant pas
 * encore branché, le paiement est SIMULÉ ; l'action (barre du bas) déclenche le
 * webhook puis rafraîchit la réservation.
 */
export function PaiementStep() {
  const { colors } = useTheme();
  const reservation = useBookingStore((s) => s.reservation);

  if (!reservation) {
    return (
      <View style={styles.center}>
        <Text>Aucune réservation à payer.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text center style={styles.emoji}>
        💳
      </Text>
      <Text variant="title" center bold>
        Réservation {reservation.code}
      </Text>
      <Text center tone="muted">
        Montant à payer
      </Text>
      <Text variant="display" center tone="primary" bold>
        {formatMoney(reservation.montant)}
      </Text>

      <Card background={colors.primaryContainer} style={styles.notice}>
        <Text style={{ color: colors.onPrimaryContainer }}>
          {isSimulatedPayment(reservation)
            ? 'Paiement Mobile Money simulé pour la démo. En production, vous serez redirigé vers le prestataire.'
            : 'Vous allez être redirigé vers votre prestataire de paiement.'}
        </Text>
      </Card>

      {reservation.dateexpiration ? (
        <Text center tone="muted" variant="caption">
          À payer avant le {formatDateTime(reservation.dateexpiration)}
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, padding: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 48 },
  notice: { marginTop: spacing.md },
});
