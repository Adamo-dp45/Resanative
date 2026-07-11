import { StyleSheet, View } from 'react-native';

import { formatDateTime, formatMoney } from '@/core/format/formatters';
import { spacing, useTheme } from '@/core/theme/theme';
import { Card } from '@/core/ui/Card';
import { Text } from '@/core/ui/Text';

import { selectedMontant, useBookingStore } from '../store/bookingStore';

/** Récapitulatif du trajet en cours de réservation (trajet, départ, montant). */
export function TripSummary() {
  const { colors } = useTheme();
  const gareDepart = useBookingStore((s) => s.gareDepart);
  const destination = useBookingStore((s) => s.destination);
  const depart = useBookingStore((s) => s.depart);
  const montant = useBookingStore(selectedMontant);

  return (
    <Card background={colors.surfaceAlt}>
      <Text variant="subtitle" bold>
        {gareDepart?.libelle ?? '—'} → {destination?.gare.libelle ?? '—'}
      </Text>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <Row label="🕒" value={formatDateTime(depart?.datedepartprevue)} />
      <Row label="💳" value={formatMoney(montant)} emphasize />
    </Card>
  );
}

function Row({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text>{label}</Text>
      <Text
        variant={emphasize ? 'subtitle' : 'body'}
        bold={emphasize}
        tone={emphasize ? 'primary' : 'default'}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  divider: { height: StyleSheet.hairlineWidth, marginVertical: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 3 },
});
