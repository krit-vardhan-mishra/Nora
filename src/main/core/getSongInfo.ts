import { getAllSongs } from '@main/db/queries/songs';
import { getOnlineSongFromCache } from './onlineMusic';

import logger from '../logger';
import { convertToSongData } from '../utils/convert';

const getSongInfo = async (
  songIds: number[],
  sortType?: SongSortTypes,
  filterType?: SongFilterTypes,
  limit = songIds.length,
  preserveIdOrder = false,
  noBlacklistedSongs = false
): Promise<SongData[]> => {
  logger.debug(`Fetching song data from getSongInfo`, {
    songIdsLength: songIds.length,
    sortType,
    limit,
    preserveIdOrder,
    noBlacklistedSongs
  });
  
  if (songIds.length === 0) {
    logger.warn(`App made a request to get-song-info function with an empty array of song ids.`);
    return [];
  }

  const localSongIds = songIds.filter((id) => Number(id) >= 0);
  const onlineSongIds = songIds.filter((id) => Number(id) < 0);

  let localSongs: SongData[] = [];
  if (localSongIds.length > 0) {
    try {
      const songsDataResponse = await getAllSongs({
        sortType,
        filterType,
        songIds: localSongIds.map((id) => Number(id)),
        preserveIdOrder
      });

      const songsData = songsDataResponse.data;
      if (Array.isArray(songsData) && songsData.length > 0) {
        localSongs = songsData.map((x) => convertToSongData(x));
      }
    } catch (err) {
      logger.error('Failed to fetch local songs in getSongInfo', { err });
    }
  }

  const onlineSongs: SongData[] = [];
  for (const id of onlineSongIds) {
    const cachedSong = getOnlineSongFromCache(id);
    if (cachedSong) {
      onlineSongs.push({
        songId: id,
        title: cachedSong.title,
        duration: cachedSong.duration,
        artists: cachedSong.artists?.map((a) => ({ artistId: a.artistId, name: a.name })) || [],
        album: cachedSong.album,
        isAFavorite: cachedSong.isAFavorite,
        isArtworkAvailable: !!cachedSong.artworkPath,
        path: cachedSong.path,
        isBlacklisted: cachedSong.isBlacklisted,
        artworkPaths: {
          isDefaultArtwork: !cachedSong.artworkPath,
          artworkPath: cachedSong.artworkPath || '',
          optimizedArtworkPath: cachedSong.artworkPath || ''
        },
        addedDate: Date.now()
      });
    }
  }

  // Merge the results and preserve the original songIds order
  const mergedSongsMap = new Map<number, SongData>();
  localSongs.forEach((song) => mergedSongsMap.set(song.songId, song));
  onlineSongs.forEach((song) => mergedSongsMap.set(song.songId, song));

  let orderedResults: SongData[] = [];
  for (const id of songIds) {
    const song = mergedSongsMap.get(id);
    if (song) {
      orderedResults.push(song);
    }
  }

  if (noBlacklistedSongs) {
    orderedResults = orderedResults.filter((result) => !result.isBlacklisted);
  }

  return orderedResults.slice(0, limit);
};

export default getSongInfo;
