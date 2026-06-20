import { createQueryKeys } from '@lukemorales/query-key-factory';

export const onlineMusicQuery = createQueryKeys('onlineMusic', {
  search: (data: { query: string }) => {
    const { query } = data;

    return {
      queryKey: [`query=${query}`],
      queryFn: async (): Promise<OnlineSongResult[]> => {
        try {
          if (!query.trim()) return [];
          console.log(`[OnlineSearch] Initiating online search for query: "${query}"`);
          const results = await window.api.onlineMusic.searchOnlineSongs(query);
          console.log(`[OnlineSearch] Received ${results.length} results for query: "${query}"`);
          return results;
        } catch (error) {
          console.error(`[OnlineSearch] Online music search failed for query: "${query}"`, error);
          return [];
        }
      }
    };
  }
});
