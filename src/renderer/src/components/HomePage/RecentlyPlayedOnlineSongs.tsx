import { useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import DefaultSongCover from '../../assets/images/webp/song_cover_default.webp';
import useSelectAllHandler from '../../hooks/useSelectAllHandler';
import Button from '../Button';
import SecondaryContainer from '../SecondaryContainer';
import SongCard from '../SongsPage/SongCard';

type Props = { recentlyPlayedOnlineSongs: AudioPlayerData[]; noOfVisibleSongs: number };

const RecentlyPlayedOnlineSongs = (props: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { recentlyPlayedOnlineSongs, noOfVisibleSongs = 3 } = props;
  const MAX_SONG_LIMIT = 15;

  const selectAllHandler = useSelectAllHandler(recentlyPlayedOnlineSongs, 'songs', 'songId');
  const recentlyPlayedSongComponents = useMemo(
    () =>
      recentlyPlayedOnlineSongs
        .filter((_, i) => i < (noOfVisibleSongs ?? MAX_SONG_LIMIT))
        .map((song, index) => {
          return (
            <SongCard
              index={index}
              key={song.songId}
              title={song.title}
              artworkPath={song.artworkPath || DefaultSongCover}
              path={song.path}
              songId={song.songId}
              artists={song.artists}
              album={song.album}
              palette={song.paletteData}
              isAFavorite={song.isAFavorite}
              isBlacklisted={song.isBlacklisted}
              selectAllHandler={selectAllHandler}
            />
          );
        }),
    [noOfVisibleSongs, recentlyPlayedOnlineSongs, selectAllHandler]
  );

  return (
    <>
      {recentlyPlayedSongComponents.length > 0 && (
        <SecondaryContainer
          className="recently-played-online-songs-container appear-from-bottom flex h-fit max-h-full flex-col pb-8 pl-8"
          focusable
          onKeyDown={(e) => {
            if (e.ctrlKey && e.key === 'a') {
              e.stopPropagation();
              selectAllHandler();
            }
          }}
        >
          <>
            <div className="title-container text-font-color-highlight dark:text-dark-font-color-highlight mt-1 mb-4 flex items-center justify-between text-2xl font-medium">
              {t('homePage.recentlyPlayedOnlineSongs', 'Recently Played Online Songs')}

              <Button
                label={t('common.showAll')}
                tooltipLabel={t('homePage.openOnlineSongsHistory', 'Open Online Songs')}
                iconName="apps"
                className="show-all-btn text-sm font-normal"
                clickHandler={() =>
                  navigate({
                    to: '/main-player/online-songs'
                  })
                }
              />
            </div>
            <div
              style={{
                gridTemplateColumns: `repeat(${noOfVisibleSongs},1fr)`
              }}
              className="songs-container grid gap-2 pr-2"
            >
              {recentlyPlayedSongComponents}
            </div>
          </>
        </SecondaryContainer>
      )}
    </>
  );
};

export default RecentlyPlayedOnlineSongs;
