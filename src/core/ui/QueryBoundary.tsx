import { ReactElement } from 'react';
import { UseQueryResult } from '@tanstack/react-query';

import { ApiError } from '../api/apiError';
import { ErrorView, LoadingView } from './StateView';

interface QueryBoundaryProps<T> {
  query: UseQueryResult<T>;
  children: (data: T) => ReactElement | null;
}

/**
 * Rend un résultat React Query de façon uniforme : chargement, erreur (avec
 * « Réessayer »), ou le contenu. Évite de répéter le triptyque dans chaque écran.
 */
export function QueryBoundary<T>({ query, children }: QueryBoundaryProps<T>) {
  if (query.isPending) return <LoadingView />;
  if (query.isError) {
    const message =
      query.error instanceof ApiError
        ? query.error.message
        : 'Une erreur est survenue.';
    return <ErrorView message={message} onRetry={() => query.refetch()} />;
  }
  return children(query.data);
}
