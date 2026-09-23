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
  /** Minutes pendant lesquelles une réservation non payée tient sa place (réglé par la compagnie). */
  delaiPaiementMinutes?: number | null;
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
  /**
   * Numéro de départ DU JOUR (« Départ 2 ») : le repère que la gare annonce à l'embarquement et
   * que portera le billet. Attribué par le serveur.
   */
  numerodepart?: number | null;
  /*
    Heure de passage du car À LA GARE DE MONTÉE demandée : c'est CELLE-CI qu'on affiche au client.
    'datedepartprevue' est le départ du voyage depuis SON origine — sur Abidjan → Bouaké → Korhogo,
    qui réserve au départ de Bouaké n'a que faire de l'heure à laquelle le car quitte Abidjan.
    Calculée par l'API (durées de trajet par arrêt), jamais ici.
  */
  heurepassage?: string | null;
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
  /**
   * Numéro de départ DU JOUR (« Départ 2 ») : le repère que la gare annonce à l'embarquement et
   * que portera le billet. Attribué par le serveur.
   */
  numerodepart?: number | null;
  /** Heure de passage du car à VOTRE gare de montée — l'heure à laquelle il faut être là. */
  heurepassage?: string | null;
  datedepartprevue?: string | null;
  bonDisponible: boolean;
  billetEmis?: string | null;
  // -- Suivi temps réel « où est mon car » -- //
  /** Le car a-t-il quitté son origine (départ réel horodaté) ? */
  voyageDemarre?: boolean;
  /** Gare où se trouve actuellement le car ; absent tant qu'il n'est pas parti. */
  positionActuelle?: string | null;
  /** Retard courant du car en minutes (positif = retard, négatif = avance) ; absent si non mesuré. */
  retardMinutes?: number | null;
  /** Heure de passage ESTIMÉE chez le client = heure prévue + retard courant. */
  heurepassageEstimee?: string | null;
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

/*
  Heure à laquelle le client doit être à SA gare. C'est toujours celle-ci qu'on affiche : le départ
  du voyage depuis son origine ne le concerne pas s'il monte en cours de route. Repli sur ce départ
  tant que l'API ne renvoie pas d'heure de passage (ligne dont les durées d'arrêt ne sont pas encore
  renseignées) — l'ancien affichage, jamais une heure inventée ici.
*/
/*
  Comment on NOMME un départ au client : « Départ 2 ».

  Le code voyage est du vocabulaire d'exploitation, il ne lui dit rien ; le numéro, lui, est ce que
  la gare annoncera à l'embarquement. Repli sur le code tant qu'une API ne sert pas le numéro,
  plutôt que d'afficher « Départ null ».
*/
export function libelleDepart(
  x: { numerodepart?: number | null; codevoyage?: string | null } | null | undefined
): string {
  if (x?.numerodepart != null) return `Départ ${x.numerodepart}`;
  return x?.codevoyage ?? '';
}

export function heureEmbarquement(
  x: { heurepassage?: string | null; datedepartprevue?: string | null } | null | undefined
): string | null | undefined {
  return x?.heurepassage ?? x?.datedepartprevue;
}

/*
  Une échéance ne s'affiche QUE tant qu'elle est encore à respecter, ce que dit le statut — pas
  'etatpaiement'. Une réservation à régulariser est payée elle aussi : se fier au paiement lui
  faisait afficher « À retirer avant » avec une heure déjà passée. Passé le statut vivant,
  'dateexpiration' n'est plus une consigne mais la trace de l'échéance manquée.
*/
export function isAwaitingPayment(reservation: Reservation): boolean {
  return reservation.statut === 'EN_ATTENTE';
}

export function isConfirmed(reservation: Reservation): boolean {
  return reservation.statut === 'CONFIRMEE';
}

export function needsRegularisation(reservation: Reservation): boolean {
  return reservation.statut === 'A_REGULARISER';
}

export function isSimulatedPayment(reservation: Reservation): boolean {
  return reservation.paiement?.estSimule ?? false;
}

// -- Suivi temps réel (dérivés) -- //

/** Le suivi « où est mon car » n'a de sens qu'une fois le car parti. */
export function suiviDisponible(reservation: Reservation): boolean {
  return reservation.voyageDemarre === true;
}

/** Le car est-il en retard (au-delà d'une minute) ? Pilote la couleur d'alerte. */
export function estEnRetard(reservation: Reservation): boolean {
  return (reservation.retardMinutes ?? 0) > 0;
}

/**
 * Libellé lisible du retard courant, ou null si non mesuré.
 * Ex. `À l'heure`, `15 min de retard`, `10 min d'avance`.
 */
export function retardLabel(reservation: Reservation): string | null {
  const r = reservation.retardMinutes;
  if (r == null) return null;
  if (r === 0) return "À l'heure";
  return r > 0 ? `${r} min de retard` : `${-r} min d'avance`;
}
