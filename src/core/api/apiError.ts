import { isAxiosError } from 'axios';

/** Formes de message d'erreur possibles renvoyées par API Platform. */
interface ApiErrorBody {
  'hydra:description'?: string;
  description?: string;
  detail?: string;
  message?: string;
  error?: string;
}

/**
 * Erreur normalisée exposée à l'UI : un message affichable + un éventuel code
 * HTTP. Isole le reste de l'app d'axios (aucun composant ne manipule d'AxiosError).
 */
export class ApiError extends Error {
  readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }

  get isNotFound(): boolean {
    return this.statusCode === 404;
  }

  get isRateLimited(): boolean {
    return this.statusCode === 429;
  }

  get isValidation(): boolean {
    return this.statusCode === 400 || this.statusCode === 422;
  }

  /** Convertit n'importe quelle erreur (axios ou autre) en ApiError. */
  static from(error: unknown): ApiError {
    if (error instanceof ApiError) return error;

    if (isAxiosError(error)) {
      // Pas de réponse : réseau / délai dépassé.
      if (error.code === 'ECONNABORTED') {
        return new ApiError('Connexion trop lente. Réessayez.');
      }
      if (!error.response) {
        return new ApiError(
          'Impossible de joindre le serveur. Vérifiez votre connexion.',
        );
      }

      const status = error.response.status;
      if (status === 429) {
        return new ApiError(
          'Trop de tentatives. Patientez un instant avant de réessayer.',
          429,
        );
      }

      const message =
        ApiError.extractMessage(error.response.data) ??
        `Une erreur est survenue (${status}).`;
      return new ApiError(message, status);
    }

    return new ApiError('Une erreur inattendue est survenue.');
  }

  private static extractMessage(data: unknown): string | undefined {
    if (typeof data === 'string' && data.trim()) return data;
    if (data && typeof data === 'object') {
      const body = data as ApiErrorBody;
      const candidate =
        body['hydra:description'] ??
        body.description ??
        body.detail ??
        body.message ??
        body.error;
      if (typeof candidate === 'string' && candidate.trim()) return candidate;
    }
    return undefined;
  }
}
