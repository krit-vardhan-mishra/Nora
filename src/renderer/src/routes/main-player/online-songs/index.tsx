import NoSongsImage from '@assets/images/svg/Empty Inbox _Monochromatic.svg';
import Button from '@renderer/components/Button';
import Img from '@renderer/components/Img';
import MainContainer from '@renderer/components/MainContainer';
import Song from '@renderer/components/SongsPage/Song';
import VirtualizedList from '@renderer/components/VirtualizedList';
import { AppUpdateContext } from '@renderer/contexts/AppUpdateContext';
import useSelectAllHandler from '@renderer/hooks/useSelectAllHandler';
import { queryClient } from '@renderer/index';
import { homeQuery } from '@renderer/queries/home';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/main-player/online-songs/')({
  loader: async () => {
    await queryClient.ensureQueryData(homeQuery.recentlyPlayedOnlineSongs);
  },
  component: OnlineSongsPage
});

function OnlineSongsPage() {
  const { createQueue, playSong, addNewNotifications } = useContext(AppUpdateContext);
  const { t } = useTranslation();

  const { data: onlineSongData } = useSuspenseQuery(homeQuery.recentlyPlayedOnlineSongs);

  const selectAllHandler = useSelectAllHandler(onlineSongData, 'songs', 'songId');

  const handleSongPlayBtnClick = useCallback(
    (currSongId: number) => {
      const queueSongIds = onlineSongData.map((song) => song.songId);
      createQueue(queueSongIds, 'songs', false, undefined, false);
      playSong(currSongId, true);
    },
    [onlineSongData, createQueue, playSong]
  );

  return (
    <MainContainer
      className="main-container appear-from-bottom online-songs-list-container h-full! overflow-hidden pb-0!"
      focusable
      onKeyDown={(e) => {
        if (e.ctrlKey && e.key === 'a') {
          e.stopPropagation();
          selectAllHandler();
        }
      }}
    >
      <div className="title-container text-font-color-highlight dark:text-dark-font-color-highlight mt-1 mb-8 flex items-center pr-4 text-3xl font-medium">
        <div className="container flex">
          {t('sideBar.onlineSongs', 'Online Songs')}{' '}
          <div className="other-stats-container text-font-color-black dark:text-font-color-white ml-12 flex items-center text-xs">
            {onlineSongData && onlineSongData.length > 0 && (
              <span className="no-of-songs">
                {t('common.songWithCount', {
                  count: onlineSongData.length
                })}
              </span>
            )}
          </div>
        </div>
        <div className="other-controls-container flex">
          <Button
            key={0}
            tooltipLabel={t('common.playAll')}
            className="play-all-btn text-sm md:text-lg md:[&>.button-label-text]:hidden md:[&>.icon]:mr-0"
            iconName="play_arrow"
            isDisabled={onlineSongData.length === 0}
            clickHandler={() =>
              createQueue(
                onlineSongData.map((song) => song.songId),
                'songs',
                false,
                undefined,
                true
              )
            }
          />
          <Button
            key={1}
            label={t('common.shuffleAndPlay')}
            className="shuffle-and-play-all-btn text-sm md:text-lg md:[&>.button-label-text]:hidden md:[&>.icon]:mr-0"
            iconName="shuffle"
            isDisabled={onlineSongData.length === 0}
            clickHandler={() =>
              createQueue(
                onlineSongData.map((song) => song.songId),
                'songs',
                true,
                undefined,
                true
              )
            }
          />
        </div>
      </div>
      <div className="songs-container appear-from-bottom h-full flex-1 delay-100">
        {onlineSongData && onlineSongData.length > 0 && (
          <VirtualizedList
            data={onlineSongData}
            fixedItemHeight={60}
            itemContent={(index, song) => {
              if (song) {
                // Map AudioPlayerData properties to match Song component prop requirements
                const songProp = {
                  songId: song.songId,
                  title: song.title,
                  path: song.path,
                  artists: song.artists,
                  album: song.album,
                  duration: song.duration,
                  isAFavorite: song.isAFavorite,
                  isBlacklisted: song.isBlacklisted,
                  artworkPaths: {
                    isDefaultArtwork: !song.artworkPath,
                    artworkPath: song.artworkPath || '',
                    optimizedArtworkPath: song.artworkPath || ''
                  },
                  isIndexingSongs: false
                };

                return (
                  <Song
                    key={index}
                    index={index}
                    onPlayClick={handleSongPlayBtnClick}
                    selectAllHandler={selectAllHandler}
                    {...songProp}
                    additionalContextMenuItems={[
                      {
                        label: t('onlineSongs.removeFromHistory', 'Remove from history'),
                        iconName: 'delete',
                        handlerFunction: () => {
                          window.api.onlineMusic
                            .removeFromOnlineListenedSongs(song.songId)
                            .then((success) => {
                              if (success) {
                                queryClient.invalidateQueries(homeQuery.recentlyPlayedOnlineSongs);
                                addNewNotifications([
                                  {
                                    id: `${song.songId}-removed`,
                                    duration: 5000,
                                    content: t('notifications.removedFromHistory', {
                                      title: song.title
                                    })
                                  }
                                ]);
                              }
                            })
                            .catch((err) => console.error(err));
                        }
                      }
                    ]}
                  />
                );
              }
              return <div>Bad Index</div>;
            }}
          />
        )}
      </div>
      {onlineSongData.length === 0 && (
        <div className="no-songs-container text-font-color-black dark:text-font-color-white my-[8%] flex h-full w-full flex-col items-center justify-center text-center text-xl">
          <Img src={NoSongsImage} alt="" className="mb-8 w-60" />
          <span>No recently played online songs</span>
        </div>
      )}
    </MainContainer>
  );
}
