import { createQueryKeys } from '@lukemorales/query-key-factory';

export const onlineMusicQuery = createQueryKeys('onlineMusic', {
  search: (data: { query: string }) => {
    const normalizedQuery = (data.query ?? '').trim().toLowerCase();

    return {
      queryKey: [{ query: normalizedQuery }],
      queryFn: async (): Promise<OnlineSongResult[]> => {
        try {
          if (!normalizedQuery) return [];
          console.log(`[OnlineSearch] Initiating online search for query: "${normalizedQuery}"`);
          const results = await window.api.onlineMusic.searchOnlineSongs(normalizedQuery);
          console.log(`[OnlineSearch] Received ${results.length} results for query: "${normalizedQuery}"`);
          return results;
        } catch (error) {
          console.error(`[OnlineSearch] Online music search failed for query: "${normalizedQuery}"`, error);
          return [];
        }
      }
    };
  }
});
