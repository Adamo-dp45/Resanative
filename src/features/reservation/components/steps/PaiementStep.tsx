import { useEffect, useState } from 'react';
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
/** Millisecondes restantes avant l'échéance, ou null si elle est passée. */
function calculerRestant(echeance?: string | null): number | null {
  if (!echeance) return null;
  const restant = new Date(echeance).getTime() - Date.now();
  return Number.isNaN(restant) || restant <= 0 ? null : restant;
}

/**
 * Compte à rebours vers l'échéance.
 *
 * Hors du composant, 'calculerRestant' n'est appelé que par l'initialiseur paresseux de useState et
 * par le tick : jamais pendant le rendu (Date.now() y est impur), jamais en corps d'effet (setState
 * synchrone → rendus en cascade). L'échéance d'une réservation ne bouge pas pendant qu'on la paie,
 * une resynchronisation immédiate serait sans objet.
 */
function useTempsRestant(echeance?: string | null): number | null {
  const [restant, setRestant] = useState<number | null>(() => calculerRestant(echeance));

  useEffect(() => {
    if (!echeance) return;
    const id = setInterval(() => {
      const suivant = calculerRestant(echeance);
      setRestant(suivant);
      // Échéance passée : plus rien ne changera, on ne réveille pas l'écran chaque seconde.
      if (suivant === null) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [echeance]);

  return restant;
}

function formatDuree(ms: number): string {
  const total = Math.floor(ms / 1000);
  const minutes = Math.floor(total / 60);
  const secondes = total % 60;
  return `${minutes}:${String(secondes).padStart(2, '0')}`;
}

export function PaiementStep() {
  const { colors } = useTheme();
  const reservation = useBookingStore((s) => s.reservation);
  // Hook appelé AVANT tout retour anticipé (règle des hooks React)
  const restant = useTempsRestant(reservation?.dateexpiration);

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
        <>
          {/*
            La place n'est tenue que le temps du paiement : un décompte est plus parlant qu'une
            heure limite, surtout sur une fenêtre courte. L'heure reste affichée en repère.
          */}
          <Text center bold tone={restant !== null && restant <= 60_000 ? 'danger' : 'primary'}>
            {restant === null
              ? 'Délai de paiement dépassé'
              : `Place tenue encore ${formatDuree(restant)}`}
          </Text>
          <Text center tone="muted" variant="caption">
            À payer avant le {formatDateTime(reservation.dateexpiration)}
          </Text>
        </>
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
