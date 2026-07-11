import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { formatDateTime, formatMoney } from '@/core/format/formatters';
import { spacing, useTheme } from '@/core/theme/theme';
import { Button } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { Text } from '@/core/ui/Text';

import { useBookingStore } from '../../store/bookingStore';
import { DownloadVoucherButton } from '../DownloadVoucherButton';
import { StatusBadge } from '../StatusBadge';

/** Étape finale — réservation payée : le « bon » (code) + téléchargement PDF. */
export function ConfirmationStep() {
  const router = useRouter();
  const { colors } = useTheme();
  const reservation = useBookingStore((s) => s.reservation);
  const reset = useBookingStore((s) => s.reset);

  if (!reservation) return null;

  const finish = () => {
    reset();
    router.replace('/');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text center style={styles.emoji}>
        ✅
      </Text>
      <Text variant="title" center bold>
        Réservation confirmée
      </Text>
      <Text center tone="muted">
        Présentez ce code à la gare pour retirer votre billet.
      </Text>

      <Card background={colors.primaryContainer} style={styles.bon}>
        <Text center style={{ color: colors.onPrimaryContainer }}>
          Votre bon
        </Text>
        <Text
          selectable
          variant="title"
          center
          bold
          style={[styles.code, { color: colors.onPrimaryContainer }]}
        >
          {reservation.code}
        </Text>
      </Card>

      <Card>
        <View style={styles.badgeRow}>
          <StatusBadge reservation={reservation} />
        </View>
        <Line label="Trajet" value={`${reservation.montee ?? '—'} → ${reservation.descente ?? '—'}`} />
        <Line label="Départ" value={formatDateTime(reservation.datedepartprevue)} />
        <Line label="Montant" value={formatMoney(reservation.montant)} />
        <Line label="Passager" value={reservation.nomclient ?? '—'} />
      </Card>

      <DownloadVoucherButton reservation={reservation} />
      <Button label="Terminer" icon="🏠" onPress={finish} />
    </ScrollView>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.line}>
      <Text tone="muted" style={styles.lineLabel}>
        {label}
      </Text>
      <Text style={styles.lineValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, padding: spacing.lg },
  emoji: { fontSize: 56 },
  bon: { alignItems: 'center', paddingVertical: spacing.xl },
  code: { letterSpacing: 3, marginTop: spacing.sm },
  badgeRow: { marginBottom: spacing.sm },
  line: { flexDirection: 'row', paddingVertical: 4, gap: spacing.md },
  lineLabel: { width: 90 },
  lineValue: { flex: 1, fontWeight: '500' },
});
