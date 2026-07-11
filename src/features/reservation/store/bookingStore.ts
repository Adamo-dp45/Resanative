import { create } from 'zustand';

import type { Depart, Destination, Gare, Reservation, Ville } from '../api/types';

export type BookingStep =
  | 'troncon'
  | 'depart'
  | 'passager'
  | 'paiement'
  | 'termine';

const STEP_ORDER: BookingStep[] = [
  'troncon',
  'depart',
  'passager',
  'paiement',
  'termine',
];

interface BookingState {
  step: BookingStep;
  villeDepart: Ville | null;
  gareDepart: Gare | null;
  destination: Destination | null;
  depart: Depart | null;
  nom: string;
  contact: string;
  reservation: Reservation | null;

  setVilleDepart: (ville: Ville) => void;
  setGareDepart: (gare: Gare) => void;
  setDestination: (destination: Destination) => void;
  setDepart: (depart: Depart) => void;
  setPassenger: (nom: string, contact: string) => void;
  goTo: (step: BookingStep) => void;
  back: () => void;
  setReservation: (reservation: Reservation) => void;
  reset: () => void;
}

const initialState = {
  step: 'troncon' as BookingStep,
  villeDepart: null,
  gareDepart: null,
  destination: null,
  depart: null,
  nom: '',
  contact: '',
  reservation: null,
};

/**
 * État du tunnel de réservation, partagé par tous les écrans/étapes. Les
 * sélections en amont réinitialisent celles en aval (cohérence du parcours).
 */
export const useBookingStore = create<BookingState>((set, get) => ({
  ...initialState,

  setVilleDepart: (ville) =>
    set((s) =>
      s.villeDepart?.id === ville.id
        ? s
        : { villeDepart: ville, gareDepart: null, destination: null, depart: null },
    ),

  setGareDepart: (gare) =>
    set((s) =>
      s.gareDepart?.id === gare.id
        ? s
        : { gareDepart: gare, destination: null, depart: null },
    ),

  setDestination: (destination) => set({ destination, depart: null }),

  setDepart: (depart) => set({ depart }),

  setPassenger: (nom, contact) => set({ nom, contact }),

  goTo: (step) => set({ step }),

  back: () => {
    const index = STEP_ORDER.indexOf(get().step);
    if (index > 0) set({ step: STEP_ORDER[index - 1] });
  },

  setReservation: (reservation) => set({ reservation }),

  reset: () => set(initialState),
}));

// -- Sélecteurs dérivés (pure, testables) -- //

export function isTronconComplete(s: BookingState): boolean {
  return s.gareDepart != null && s.destination != null;
}

export function isPassagerComplete(s: BookingState): boolean {
  return s.nom.trim().length >= 2 && s.contact.trim().length >= 6;
}

export function selectedMontant(s: BookingState): number | null {
  return s.depart?.montant ?? s.destination?.montant ?? null;
}
