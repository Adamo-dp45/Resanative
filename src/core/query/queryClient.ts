import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '../api/apiError';

/**
 * Client React Query partagé. On ne réessaie pas les erreurs « définitives »
 * (validation / 404) et on garde les données fraîches quelques minutes.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && (error.isValidation || error.isNotFound)) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
