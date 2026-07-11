import { create } from 'axios';

import { env } from '../config/env';
import { ApiError } from './apiError';

/**
 * Instance axios partagée par toute l'application.
 *
 * - `baseURL` = backend ; `Accept: application/json` force API Platform à
 *   renvoyer des tableaux/objets JSON simples (pas de Hydra).
 * - Le paramètre `?slug=` (périmètre entreprise) est injecté par défaut sur
 *   chaque requête.
 * - Toute erreur est normalisée en {@link ApiError} par l'intercepteur.
 */
export const apiClient = create({
  baseURL: env.apiBaseUrl,
  timeout: 20000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  params: { slug: env.companySlug },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(ApiError.from(error)),
);
