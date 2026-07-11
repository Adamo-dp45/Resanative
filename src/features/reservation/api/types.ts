/**
 * Types de l'API publique de réservation (miroir des DTO backend, format
 * `application/json`). Les statuts restent des chaînes brutes ; des helpers
 * dérivent un libellé/couleur de façon tolérante aux valeurs inconnues.
 */

export interface Compagnie {
  slug: string;
  libelle?: string | null;
  sigle?: string | null;
  contact?: string | null;
  siteweb?: string | null;
}

export interface Ville {
  id: number;
  nom: string;
}

export interface Gare {
  id: number;
  libelle: string;
  ville?: string | null;
}

export interface Destination {
  gare: Gare;
  montant: number;
}

export interface Depart {
  voyageId: number;
  codevoyage?: string | null;
  datedepartprevue?: string | null;
  datearriveeprevue?: string | null;
  placesDisponibles: number;
  montant?: number | null;
}

export interface PaiementInfo {
  reference: string;
  url?: string | null;
  estSimule: boolean;
}

export interface Reservation {
  code: string;
  statut: string;
  etatpaiement: string;
  nomclient?: string | null;
  contactclient?: string | null;
  montant?: number | null;
  dateexpiration?: string | null;
  montee?: string | null;
  descente?: string | null;
  codevoyage?: string | null;
  datedepartprevue?: string | null;
  bonDisponible: boolean;
  billetEmis?: string | null;
  paiement?: PaiementInfo | null;
}

export interface CreateReservationRequest {
  nom: string;
  contact: string;
  voyage: number;
  montee: number;
  descente?: number;
  returnUrl?: string;
}

// -- Statuts (dérivés) -- //

export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente de paiement',
  CONFIRMEE: 'Confirmée',
  A_REGULARISER: 'À régulariser',
  EXPIREE: 'Expirée',
  ANNULEE: 'Annulée',
};

export function isPaid(reservation: Reservation): boolean {
  return reservation.etatpaiement === 'PAYE';
}

export function isSimulatedPayment(reservation: Reservation): boolean {
  return reservation.paiement?.estSimule ?? false;
}
