import { apiClient } from '@/core/api/client';
import { env } from '@/core/config/env';

import type {
  Compagnie,
  CreateReservationRequest,
  Depart,
  Destination,
  Gare,
  Reservation,
  Ville,
} from './types';

/**
 * Appels HTTP bruts à l'API publique de réservation. Ne fait que la requête +
 * le typage ; la gestion d'erreur est centralisée dans l'intercepteur axios
 * (→ ApiError), le cache/loading dans React Query.
 */
const prefix = env.reservationApiPrefix;

export const reservationApi = {
  async getCompagnie(): Promise<Compagnie> {
    const { data } = await apiClient.get<Compagnie>(`${prefix}/compagnie`);
    return data;
  },

  async getVilles(): Promise<Ville[]> {
    const { data } = await apiClient.get<Ville[]>(`${prefix}/villes`);
    return data;
  },

  async getGares(villeId: number): Promise<Gare[]> {
    const { data } = await apiClient.get<Gare[]>(`${prefix}/gares`, {
      params: { ville: villeId },
    });
    return data;
  },

  async getDestinations(gareId: number): Promise<Destination[]> {
    const { data } = await apiClient.get<Destination[]>(`${prefix}/destinations`, {
      params: { gare: gareId },
    });
    return data;
  },

  async getDeparts(provenance: number, destination: number): Promise<Depart[]> {
    const { data } = await apiClient.get<Depart[]>(`${prefix}/departs`, {
      params: { provenance, destination },
    });
    return data;
  },

  async createReservation(
    body: CreateReservationRequest,
  ): Promise<Reservation> {
    const { data } = await apiClient.post<Reservation>(
      `${prefix}/reservations`,
      body,
    );
    return data;
  },

  async confirmPayment(reference: string, status = 'SUCCESS'): Promise<void> {
    await apiClient.post(`${prefix}/paiement/webhook`, { reference, status });
  },

  async track(code: string, contact: string): Promise<Reservation> {
    const { data } = await apiClient.get<Reservation>(`${prefix}/suivi`, {
      params: { code, contact },
    });
    return data;
  },

  async history(contact: string): Promise<Reservation[]> {
    const { data } = await apiClient.get<Reservation[]>(`${prefix}/historique`, {
      params: { contact },
    });
    return data;
  },
};
