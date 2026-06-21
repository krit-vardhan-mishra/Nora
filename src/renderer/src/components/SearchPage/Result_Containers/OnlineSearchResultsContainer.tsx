import { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import { AppUpdateContext } from '../../../contexts/AppUpdateContext';
import Button from '../../Button';
import Img from '../../Img';
import SecondaryContainer from '../../SecondaryContainer';

type Props = {
  results: OnlineSongResult[];
  noOfVisibleSongs?: number;
};

/** Formats duration in seconds to "M:SS" or "H:MM:SS". */
function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const OnlineSearchResultsContainer = (props: Props) => {
  const { results, noOfVisibleSongs = 10 } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createQueue } = useContext(AppUpdateContext);
  const [loadingVideoId, setLoadingVideoId] = useState<string | null>(null);

  const handlePlayOnlineSong = useCallback(
    async (song: OnlineSongResult) => {
      try {
        setLoadingVideoId(song.videoId);

        console.log(`[OnlineStream] Caching clicked song: "${song.title}"`);
        const clickedSongId = await window.api.onlineMusic.cacheOnlineSong(song);

        console.log(`[OnlineStream] Fetching recommendations for videoId: "${song.videoId}"`);
        const recommendations = await window.api.onlineMusic.getOnlineRecommendations(song.videoId);
        
        console.log(`[OnlineStream] Caching recommended songs in parallel...`);
        const recommendedSongIds = await Promise.all(
          recommendations.map((rec) => window.api.onlineMusic.cacheOnlineSong(rec))
        );

        const unifiedQueue = [clickedSongId, ...recommendedSongIds];
        console.log(`[OnlineStream] Replacing queue with ${unifiedQueue.length} songs and starting playback of ID ${clickedSongId}`);

        // Create the queue and automatically start playing
        createQueue(unifiedQueue, 'songs', false, undefined, true);
      } catch (error: any) {
        console.error('Failed to play online song:', error);
        alert(error.message || 'Failed to play online song');
      } finally {
        setLoadingVideoId(null);
      }
    },
    [createQueue]
  );

  const handleSongTitleClick = useCallback(
    async (song: OnlineSongResult) => {
      try {
        setLoadingVideoId(song.videoId);
        console.log(`[OnlineStream] Caching clicked song for details page: "${song.title}"`);
        const songId = await window.api.onlineMusic.cacheOnlineSong(song);
        navigate({
          to: '/main-player/songs/$songId',
          params: { songId: String(songId) }
        });
      } catch (error) {
        console.error('Failed to open online song details:', error);
      } finally {
        setLoadingVideoId(null);
      }
    },
    [navigate]
  );

  const songItems = useMemo(() => {
    if (results.length === 0) return [];

    return results.slice(0, noOfVisibleSongs).map((song) => (
      <div
        key={song.videoId}
        className="online-song-item group relative mb-1 flex items-center gap-4 rounded-lg px-3 py-2.5 transition-colors hover:bg-background-color-2/70 dark:hover:bg-dark-background-color-2/70"
      >
        {/* Thumbnail */}
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
          {song.thumbnailUrl ? (
            <Img
              src={song.thumbnailUrl}
              alt={song.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="bg-background-color-2 dark:bg-dark-background-color-2 flex h-full w-full items-center justify-center">
              <span className="material-icons-round-outlined text-font-color-highlight dark:text-dark-font-color-highlight text-xl">
                music_note
              </span>
            </div>
          )}
          {/* Play overlay on hover */}
          <button
            className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => handlePlayOnlineSong(song)}
            disabled={loadingVideoId === song.videoId}
            title={`Play ${song.title}`}
          >
            <span className="material-icons-round text-2xl text-white">
              {loadingVideoId === song.videoId ? 'hourglass_top' : 'play_arrow'}
            </span>
          </button>
        </div>

        {/* Song info */}
        <div className="flex min-w-0 flex-1 flex-col">
          <span
            onClick={() => handleSongTitleClick(song)}
            className="text-font-color-black dark:text-font-color-white hover:text-font-color-highlight dark:hover:text-dark-font-color-highlight w-fit max-w-full cursor-pointer truncate text-sm font-medium hover:underline outline-offset-1 focus-visible:outline!"
            title={song.title}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleSongTitleClick(song)}
          >
            {song.title}
          </span>
          <span className="text-font-color-highlight dark:text-dark-font-color-highlight truncate text-xs">
            {song.artists.join(', ') || 'Unknown Artist'}
            {song.album && ` • ${song.album}`}
          </span>
        </div>

        {/* Duration */}
        <span className="text-font-color-highlight dark:text-dark-font-color-highlight shrink-0 text-xs tabular-nums">
          {formatDuration(song.duration)}
        </span>

        {/* Play button (visible version) */}
        <Button
          className="online-play-btn opacity-0 transition-opacity group-hover:opacity-100"
          iconName={loadingVideoId === song.videoId ? 'hourglass_top' : 'play_arrow'}
          tooltipLabel={`Play ${song.title}`}
          clickHandler={() => handlePlayOnlineSong(song)}
          isDisabled={loadingVideoId === song.videoId}
        />
      </div>
    ));
  }, [results, noOfVisibleSongs, handlePlayOnlineSong, handleSongTitleClick, loadingVideoId]);

  return (
    <SecondaryContainer
      className={`secondary-container online-songs-list-container ${
        songItems.length > 0 ? 'active relative mt-8' : 'absolute mt-4'
      }`}
    >
      <>
        <div
          className={`title-container text-font-color-highlight dark:text-dark-font-color-highlight mt-1 mb-8 flex items-center pr-4 text-2xl font-medium ${
            songItems.length > 0 ? 'visible opacity-100' : 'invisible opacity-0'
          }`}
        >
          <div className="container flex items-center gap-2">
            <span className="material-icons-round-outlined text-2xl">language</span>
            {t('searchPage.onlineResults', 'Online Results')}
            <div className="other-stats-container ml-8 flex items-center text-xs">
              {results.length > 0 && (
                <span className="no-of-songs">
                  {results.length} {results.length === 1 ? 'result' : 'results'}
                </span>
              )}
            </div>
          </div>
        </div>
        <div
          className={`online-songs-container mb-12 ${
            songItems.length > 0
              ? 'visible translate-y-0 opacity-100'
              : 'invisible translate-y-8 opacity-0 transition-transform'
          }`}
        >
          {songItems}
        </div>
      </>
    </SecondaryContainer>
  );
};

export default OnlineSearchResultsContainer;
