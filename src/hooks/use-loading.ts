import { useState, useCallback } from 'react';

export type LoadingState =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error'
  | 'syncing'
  | 'processing'
  | 'searching';

export interface LoadingHookReturn {
  isLoading: boolean;
  loadingState: LoadingState;
  error: string | null;
  setLoading: (state: LoadingState) => void;
  setError: (error: string) => void;
  setSuccess: () => void;
  setIdle: () => void;
  withLoading: <T>(asyncFn: () => Promise<T>) => Promise<T>;
}

/**
 * 🔄 useLoading Hook
 *
 * Universal loading state management pro Repetito
 * s českým educational kontextem
 */
export const useLoading = (
  initialState: LoadingState = 'idle'
): LoadingHookReturn => {
  const [loadingState, setLoadingState] = useState<LoadingState>(initialState);
  const [error, setErrorState] = useState<string | null>(null);

  const isLoading =
    loadingState !== 'idle' &&
    loadingState !== 'success' &&
    loadingState !== 'error';

  const setLoading = useCallback((state: LoadingState) => {
    setLoadingState(state);
    if (state !== 'error') {
      setErrorState(null);
    }
  }, []);

  const setError = useCallback((errorMessage: string) => {
    setLoadingState('error');
    setErrorState(errorMessage);
  }, []);

  const setSuccess = useCallback(() => {
    setLoadingState('success');
    setErrorState(null);
  }, []);

  const setIdle = useCallback(() => {
    setLoadingState('idle');
    setErrorState(null);
  }, []);

  const withLoading = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T> => {
      try {
        setLoading('loading');
        const result = await asyncFn();
        setSuccess();
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Neočekávaná chyba';
        setError(errorMessage);
        throw err;
      }
    },
    [setLoading, setSuccess, setError]
  );

  return {
    isLoading,
    loadingState,
    error,
    setLoading,
    setError,
    setSuccess,
    setIdle,
    withLoading,
  };
};

/**
 * 🎭 useMagicNotesLoading Hook
 *
 * Specialized hook pro Magic Notes processing
 */
export const useMagicNotesLoading = () => {
  const [stage, setStage] = useState<
    'idle' | 'ocr' | 'ai' | 'creating' | 'complete' | 'error'
  >('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const startProcessing = useCallback(async (imageUri: string) => {
    try {
      setStage('ocr');
      setProgress(0);
      setError(null);

      // Simulate OCR stage
      await new Promise(resolve => setTimeout(resolve, 2000));
      setProgress(33);

      setStage('ai');
      await new Promise(resolve => setTimeout(resolve, 2000));
      setProgress(66);

      setStage('creating');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProgress(100);

      setStage('complete');

      return {
        success: true,
        cardsCreated: Math.floor(Math.random() * 15) + 5, // 5-20 cards
      };
    } catch (err) {
      setStage('error');
      setError(
        err instanceof Error ? err.message : 'Magic Notes processing failed'
      );
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setStage('idle');
    setProgress(0);
    setError(null);
  }, []);

  return {
    stage,
    progress,
    error,
    isProcessing: stage !== 'idle' && stage !== 'complete' && stage !== 'error',
    startProcessing,
    reset,
  };
};

/**
 * 🔍 useSearchLoading Hook
 *
 * Pro search operations s debouncing
 */
export const useSearchLoading = (debounceMs: number = 300) => {
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const search = useCallback(
    async (
      searchQuery: string,
      searchFn: (query: string) => Promise<any[]>
    ) => {
      setQuery(searchQuery);

      if (!searchQuery.trim()) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      try {
        // Debounce
        await new Promise(resolve => setTimeout(resolve, debounceMs));

        const searchResults = await searchFn(searchQuery);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [debounceMs]
  );

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsSearching(false);
  }, []);

  return {
    isSearching,
    query,
    results,
    search,
    clearSearch,
  };
};

/**
 * 📊 useCzechDataLoading Hook
 *
 * Pro loading s českým educational kontextem
 */
export const useCzechDataLoading = () => {
  const {
    isLoading,
    loadingState,
    error,
    setLoading,
    setError,
    setSuccess,
    withLoading,
  } = useLoading();

  const loadStudySets = useCallback(async () => {
    return withLoading(async () => {
      console.log('📚 Načítám study sets...');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const studySets = [
        { id: 1, subject: 'Český jazyk', name: 'Maturitní slohové práce' },
        { id: 2, subject: 'Matematika', name: 'Funkce a jejich vlastnosti' },
        { id: 3, subject: 'Dějepis', name: 'První světová válka' },
      ];

      console.log('✅ Study sets načteny');
      return studySets;
    });
  }, [withLoading]);

  const syncUserData = useCallback(async () => {
    setLoading('syncing');

    try {
      console.log('☁️ Synchronizuji uživatelská data...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccess();
      console.log('✅ Synchronizace dokončena');

      return { synced: true, timestamp: new Date().toISOString() };
    } catch (err) {
      const errorMessage = 'Synchronizace selhala - zkontroluj připojení';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [setLoading, setSuccess, setError]);

  const loadUserProfile = useCallback(async () => {
    return withLoading(async () => {
      console.log('👤 Načítám profil uživatele...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      const profile = {
        name: 'Jan Novák',
        email: 'jan@example.com',
        studyStreak: 7,
        completedSets: 12,
        totalCards: 248,
      };

      console.log('✅ Profil načten');
      return profile;
    });
  }, [withLoading]);

  return {
    isLoading,
    loadingState,
    error,
    loadStudySets,
    syncUserData,
    loadUserProfile,
  };
};

export default {
  useLoading,
  useMagicNotesLoading,
  useSearchLoading,
  useCzechDataLoading,
};
