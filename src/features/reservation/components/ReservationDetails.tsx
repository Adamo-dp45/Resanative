import { StyleSheet, View } from 'react-native';

import { formatDateTime, formatMoney } from '@/core/format/formatters';
import { spacing } from '@/core/theme/theme';
import { Card } from '@/core/ui/Card';
import { Text } from '@/core/ui/Text';

import {
  estEnRetard,
  heureEmbarquement,
  isAwaitingPayment,
  isConfirmed,
  isPaid,
  needsRegularisation,
  retardLabel,
  suiviDisponible,
  type Reservation,
} from '../api/types';
import { DownloadVoucherButton } from './DownloadVoucherButton';
import { StatusBadge } from './StatusBadge';

/**
 * Carte de détail d'une réservation (réutilisée par suivi et historique).
 * `showTracking` ajoute le bloc « où est mon car » (position + retard) — réservé
 * au suivi : inutile sur l'historique, où le voyage est terminé.
 */
export function ReservationDetails({
  reservation,
  showTracking = false,
}: {
  reservation: Reservation;
  showTracking?: boolean;
}) {
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
        <Line label="Départ" value={formatDateTime(heureEmbarquement(reservation))} />
        <Line label="Montant" value={formatMoney(reservation.montant)} />
        {reservation.nomclient ? (
          <Line label="Passager" value={reservation.nomclient} />
        ) : null}
        {isAwaitingPayment(reservation) && reservation.dateexpiration ? (
          <Line label="À payer avant" value={formatDateTime(reservation.dateexpiration)} />
        ) : null}
        {/*
          Une fois payée, 'dateexpiration' ne porte plus la limite de paiement mais celle de
          PRÉSENTATION au guichet : au-delà, la place n'est plus tenue et la réservation devient un
          no-show à régulariser. Le client doit donc la voir tant qu'elle court — d'où le statut
          CONFIRMEE et non 'payée', qui vaut aussi pour une réservation déjà passée en
          A_REGULARISER. Plus d'échéance dès que le billet est émis : la réservation est honorée.
        */}
        {isConfirmed(reservation) && !reservation.billetEmis && reservation.dateexpiration ? (
          <Line label="À retirer avant" value={formatDateTime(reservation.dateexpiration)} />
        ) : null}
        {reservation.billetEmis ? (
          <Line label="Billet" value={reservation.billetEmis} />
        ) : null}

        {/* Départ manqué : le client a besoin de la marche à suivre, pas d'une date dépassée. */}
        {needsRegularisation(reservation) ? (
          <Text tone="muted" style={styles.notice}>
            Départ manqué. Votre place n&apos;est pas perdue : présentez-vous en gare pour la
            reporter sur un prochain départ.
          </Text>
        ) : null}
      </Card>

      {showTracking && suiviDisponible(reservation) ? (
        <TrackingCard reservation={reservation} />
      ) : null}

      {isPaid(reservation) ? (
        <DownloadVoucherButton reservation={reservation} />
      ) : null}
    </View>
  );
}

/** « Où est mon car » : position courante + retard estimé + heure de passage révisée. */
function TrackingCard({ reservation }: { reservation: Reservation }) {
  const retard = retardLabel(reservation);
  const retardTone = retard == null ? 'muted' : estEnRetard(reservation) ? 'danger' : 'success';

  return (
    <Card>
      <View style={styles.header}>
        <Text variant="subtitle" bold>
          Suivi du car
        </Text>
      </View>

      <Line label="Position" value={reservation.positionActuelle ?? 'En route'} />
      {retard ? (
        <View style={styles.line}>
          <Text tone="muted" style={styles.lineLabel}>
            État
          </Text>
          <Text tone={retardTone} style={styles.lineValue} bold>
            {retard}
          </Text>
        </View>
      ) : null}
      {/* Heure à laquelle le car est désormais attendu chez CE client (prévue + retard). */}
      {reservation.heurepassageEstimee ? (
        <Line label="Passage estimé" value={formatDateTime(reservation.heurepassageEstimee)} />
      ) : null}
    </Card>
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
  notice: { marginTop: spacing.sm },
  line: { flexDirection: 'row', paddingVertical: 4, gap: spacing.md },
  lineLabel: { width: 100 },
  lineValue: { flex: 1, fontWeight: '500' },
});
