import { StyleSheet, View } from 'react-native';

import { Text } from '@/core/ui/Text';
import { radius, useTheme } from '@/core/theme/theme';

import { isPaid, RESERVATION_STATUS_LABELS, type Reservation } from '../api/types';

/** Puce colorée résumant l'état d'une réservation (paiement prioritaire). */
export function StatusBadge({ reservation }: { reservation: Reservation }) {
  const { colors } = useTheme();

  let label: string;
  let color: string;

  if (isPaid(reservation)) {
    label = reservation.billetEmis ? 'Billet émis' : 'Payé';
    color = colors.success;
  } else {
    switch (reservation.statut) {
      case 'A_REGULARISER':
        label = 'À régulariser';
        color = colors.warning;
        break;
      case 'EXPIREE':
      case 'ANNULEE':
        label = RESERVATION_STATUS_LABELS[reservation.statut];
        color = colors.danger;
        break;
      case 'CONFIRMEE':
        label = 'Confirmée';
        color = colors.success;
        break;
      default:
        label =
          RESERVATION_STATUS_LABELS[reservation.statut] ?? reservation.statut;
        color = colors.textMuted;
    }
  }

  return (
    <View style={[styles.badge, { backgroundColor: `${color}22` }]}>
      <Text variant="caption" bold style={{ color }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
});
