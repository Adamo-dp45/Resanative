import { useMutation } from '@tanstack/react-query';

import { reservationApi } from './reservationApi';
import type { CreateReservationRequest } from './types';

/** Création d'une réservation invité (+ initiation du paiement côté backend). */
export function useCreateReservation() {
  return useMutation({
    mutationFn: (body: CreateReservationRequest) =>
      reservationApi.createReservation(body),
  });
}

interface PayArgs {
  reference: string;
  code: string;
  contact: string;
}

/**
 * Paiement (simulé) : déclenche le webhook puis rafraîchit la réservation pour
 * refléter l'état payé. Renvoie la réservation à jour.
 */
export function usePayReservation() {
  return useMutation({
    mutationFn: async ({ reference, code, contact }: PayArgs) => {
      await reservationApi.confirmPayment(reference);
      return reservationApi.track(code, contact);
    },
  });
}
