import { useQuery } from '@tanstack/react-query';

import { reservationApi } from './reservationApi';

/** Clés de cache centralisées (facilite invalidations et cohérence). */
export const reservationKeys = {
  compagnie: ['compagnie'] as const,
  villes: ['villes'] as const,
  gares: (villeId: number) => ['gares', villeId] as const,
  destinations: (gareId: number) => ['destinations', gareId] as const,
  departs: (provenance: number, destination: number) =>
    ['departs', provenance, destination] as const,
  suivi: (code: string, contact: string) => ['suivi', code, contact] as const,
  historique: (contact: string) => ['historique', contact] as const,
};

export function useCompagnie() {
  return useQuery({
    queryKey: reservationKeys.compagnie,
    queryFn: reservationApi.getCompagnie,
  });
}

export function useVilles() {
  return useQuery({
    queryKey: reservationKeys.villes,
    queryFn: reservationApi.getVilles,
  });
}

export function useGares(villeId: number | null) {
  return useQuery({
    queryKey: reservationKeys.gares(villeId ?? 0),
    queryFn: () => reservationApi.getGares(villeId as number),
    enabled: villeId != null,
  });
}

export function useDestinations(gareId: number | null) {
  return useQuery({
    queryKey: reservationKeys.destinations(gareId ?? 0),
    queryFn: () => reservationApi.getDestinations(gareId as number),
    enabled: gareId != null,
  });
}

export function useDeparts(
  provenance: number | null,
  destination: number | null,
) {
  const enabled = provenance != null && destination != null;
  return useQuery({
    queryKey: reservationKeys.departs(provenance ?? 0, destination ?? 0),
    queryFn: () =>
      reservationApi.getDeparts(provenance as number, destination as number),
    enabled,
  });
}

export function useSuivi(code: string, contact: string, enabled: boolean) {
  return useQuery({
    queryKey: reservationKeys.suivi(code, contact),
    queryFn: () => reservationApi.track(code, contact),
    enabled,
  });
}

export function useHistorique(contact: string, enabled: boolean) {
  return useQuery({
    queryKey: reservationKeys.historique(contact),
    queryFn: () => reservationApi.history(contact),
    enabled,
  });
}
