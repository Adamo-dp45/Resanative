import { StyleSheet, View } from 'react-native';

import { formatDateTime, formatMoney } from '@/core/format/formatters';
import { spacing } from '@/core/theme/theme';
import { Card } from '@/core/ui/Card';
import { Text } from '@/core/ui/Text';

import { isPaid, type Reservation } from '../api/types';
import { DownloadVoucherButton } from './DownloadVoucherButton';
import { StatusBadge } from './StatusBadge';

/** Carte de détail d'une réservation (réutilisée par suivi et historique). */
export function ReservationDetails({ reservation }: { reservation: Reservation }) {
  return (
    <View style={styles.wrapper}>
      <Card>
        <View style={styles.header}>
          <Text variant="subtitle" bold>
            {reservation.code}
          </Text>
          <StatusBadge reservation={reservation} />
        </View>

        <Line label="Trajet" value={`${reservation.montee ?? '—'} → ${reservation.descente ?? '—'}`} />
        <Line label="Départ" value={formatDateTime(reservation.datedepartprevue)} />
        <Line label="Montant" value={formatMoney(reservation.montant)} />
        {reservation.nomclient ? (
          <Line label="Passager" value={reservation.nomclient} />
        ) : null}
        {!isPaid(reservation) && reservation.dateexpiration ? (
          <Line label="À payer avant" value={formatDateTime(reservation.dateexpiration)} />
        ) : null}
        {reservation.billetEmis ? (
          <Line label="Billet" value={reservation.billetEmis} />
        ) : null}
      </Card>

      {isPaid(reservation) ? (
        <DownloadVoucherButton reservation={reservation} />
      ) : null}
    </View>
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
  wrapper: { gap: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  line: { flexDirection: 'row', paddingVertical: 4, gap: spacing.md },
  lineLabel: { width: 100 },
  lineValue: { flex: 1, fontWeight: '500' },
});
