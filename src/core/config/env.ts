/**
 * Configuration applicative, résolue via variables d'environnement Expo
 * (`EXPO_PUBLIC_*`, injectées au bundling). À définir dans un `.env` local :
 *
 *   EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8000
 *   EXPO_PUBLIC_COMPANY_SLUG=ma-compagnie
 *
 * - `apiBaseUrl` : racine du backend Symfony/API Platform (sans `/api`).
 *   `10.0.2.2` = l'hôte local vu depuis l'émulateur Android.
 * - `companySlug` : slug de la compagnie ; porte le périmètre entreprise de
 *   l'API publique (`?slug=`). Une build = une compagnie.
 */
export const env = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://10.0.2.2:8000',
  companySlug: process.env.EXPO_PUBLIC_COMPANY_SLUG ?? 'demo',
  reservationApiPrefix: '/api/reservation',
} as const;
