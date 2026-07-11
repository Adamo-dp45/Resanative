import { useState } from 'react';
import { Alert } from 'react-native';

import { Button } from '@/core/ui/Button';

import { useCompagnie } from '../api/queries';
import { isPaid, type Reservation } from '../api/types';
import { downloadVoucher } from '../pdf/voucher';

/**
 * Bouton « Télécharger le bon (PDF) » : génère le bon et ouvre la feuille
 * système de partage/enregistrement. Activé uniquement si la réservation est
 * payée (cohérent avec la règle backend).
 */
export function DownloadVoucherButton({
  reservation,
}: {
  reservation: Reservation;
}) {
  const [busy, setBusy] = useState(false);
  const { data: compagnie } = useCompagnie();

  const handlePress = async () => {
    setBusy(true);
    try {
      await downloadVoucher(reservation, compagnie);
    } catch {
      Alert.alert('Bon indisponible', 'Impossible de générer le bon. Réessayez.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      label="Télécharger le bon (PDF)"
      variant="outline"
      icon="⬇"
      loading={busy}
      disabled={!isPaid(reservation)}
      onPress={handlePress}
    />
  );
}
