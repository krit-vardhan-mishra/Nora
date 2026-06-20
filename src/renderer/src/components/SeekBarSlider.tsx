import { store } from '@renderer/store/store';
import { useStore } from '@tanstack/react-store';
import {
  type CSSProperties,
  type ChangeEvent,
  type WheelEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';

import { AppUpdateContext } from '../contexts/AppUpdateContext';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import calculateTime from '../utils/calculateTime';
import debounce from '../utils/debounce';

type Props = {
  id: string;
  name: string;
  className?: string;
  sliderOpacity?: number;
  onSeek?: (currentPosition: number) => void;
};

const SeekBarSlider = (props: Props) => {
  const currentSongData = useStore(store, (state) => state.currentSongData);
  const preferences = useStore(store, (state) => state.localStorage.preferences);
  const player = useAudioPlayer();

  const { updateSongPosition } = useContext(AppUpdateContext);

  const { id, name, className, sliderOpacity, onSeek } = props;

  const [songPos, setSongPos] = useState(0);
  const [bufferedPos, setBufferedPos] = useState(0);
  const isMouseDownRef = useRef(false);
  const isMouseScrollRef = useRef(false);
  const seekbarRef = useRef(null as HTMLInputElement | null);
  const lowResponseSongPositionRef = useRef(0);

  const duration = currentSongData.duration || 0;
  const seekBarCssProperties: CSSProperties = {};
  seekBarCssProperties['--seek-before-width'] = `${
    duration > 0 ? (songPos / (duration >= songPos ? duration : songPos)) * 100 : 0
  }%`;
  seekBarCssProperties['--seek-buffer-width'] = `${
    duration > 0 ? (bufferedPos / (duration >= bufferedPos ? duration : bufferedPos)) * 100 : 0
  }%`;
  if (sliderOpacity !== undefined) seekBarCssProperties['--slider-opacity'] = `${sliderOpacity}`;

  const handleSongPositionChange = useCallback((e: Event) => {
    if ('detail' in e && typeof e.detail === 'number') {
      const songPosition = e.detail as number;

      lowResponseSongPositionRef.current = songPosition;
    }
  }, []);

  useEffect(() => {
    document.addEventListener('player/positionChange', handleSongPositionChange);

    return () => document.removeEventListener('player/positionChange', handleSongPositionChange);
  }, [handleSongPositionChange]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (seekbarRef.current && !isMouseDownRef.current && !isMouseScrollRef.current) {
        setSongPos(lowResponseSongPositionRef.current);
        if (onSeek) onSeek(lowResponseSongPositionRef.current);
      }

      // Update buffered position
      try {
        const buffered = player.audio.buffered;
        const currentTime = player.currentTime || 0;
        let bufferedEnd = 0;
        for (let i = 0; i < buffered.length; i++) {
          if (currentTime >= buffered.start(i) && currentTime <= buffered.end(i)) {
            bufferedEnd = buffered.end(i);
            break;
          }
        }
        setBufferedPos(bufferedEnd);
      } catch (e) {
        // Ignored
      }
    }, 500);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  // useEffect(() => {
  //   if (
  //     seekbarRef.current &&
  //     !isMouseDownRef.current &&
  //     !isMouseScrollRef.current
  //   ) {
  //     setSongPos(songPosition);
  //     if (onSeek) onSeek(songPosition);
  //   }
  //   //  ? Adding onSeek as a dependency makes the slider unresponsive while sliding for short times.
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [songPosition]);

  useEffect(() => {
    const seekBar = seekbarRef.current;

    if (seekbarRef.current) {
      const handleSeekbarMouseDown = () => {
        isMouseDownRef.current = true;
      };
      const handleSeekbarMouseUp = () => {
        isMouseDownRef.current = false;
        updateSongPosition(seekbarRef.current?.valueAsNumber ?? 0);
      };
      seekbarRef.current.addEventListener('mousedown', () => handleSeekbarMouseDown());
      seekbarRef.current.addEventListener('mouseup', () => handleSeekbarMouseUp());
      return () => {
        seekBar?.removeEventListener('mouseup', handleSeekbarMouseUp);
        seekBar?.removeEventListener('mousedown', handleSeekbarMouseDown);
      };
    }
    return undefined;
  }, [updateSongPosition]);

  const currentSongPosition = calculateTime(songPos);

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const pos = e.currentTarget.valueAsNumber;
    setSongPos(pos);
    if (onSeek) onSeek(pos);
  };

  const handleOnWheel = (e: WheelEvent<HTMLInputElement>) => {
    isMouseScrollRef.current = true;

    const max = parseInt(e.currentTarget.max);
    const scrollIncrement = preferences.seekbarScrollInterval;

    const incrementValue = e.deltaY > 0 ? -scrollIncrement : scrollIncrement;
    let value = (songPos || 0) + incrementValue;

    if (value > max) value = max;
    if (value < 0) value = 0;
    if (onSeek) onSeek(value);
    setSongPos(value);

    debounce(() => {
      isMouseScrollRef.current = false;
      updateSongPosition(value);
    }, 250);
  };

  const baseClassName =
    className ||
    "seek-bar-slider before:bg-seekbar-background-color/75 hover:before:bg-font-color-highlight dark:before:bg-dark-seekbar-background-color/75 dark:hover:before:bg-dark-font-color-highlight relative float-left m-0 h-6 w-full appearance-none bg-[transparent] p-0 outline-hidden outline-offset-1 before:absolute before:top-1/2 before:left-0 before:h-1 before:w-[var(--seek-before-width)] before:-translate-y-1/2 before:cursor-pointer before:rounded-3xl before:transition-[width,background] before:content-[''] focus-visible:outline!";

  const finalClassName = `${baseClassName} after:absolute after:top-1/2 after:left-0 after:h-1 after:w-[var(--seek-buffer-width)] after:-translate-y-1/2 after:cursor-pointer after:rounded-3xl after:transition-[width,height,transform] after:content-[''] after:bg-white/40 dark:after:bg-white/25 after:z-0 before:z-10 hover:after:h-3 group-hover:after:h-3 group-focus-within:after:h-3 group-hover/fullScreenPlayer:after:h-3`;

  return (
    <input
      type="range"
      name={name}
      id={id}
      className={finalClassName}
      min={0}
      max={(currentSongData.duration || 0) >= songPos ? currentSongData.duration || 0 : songPos}
      value={songPos || 0}
      onChange={handleOnChange}
      onWheel={handleOnWheel}
      ref={seekbarRef}
      style={seekBarCssProperties}
      title={`${currentSongPosition.minutes}:${currentSongPosition.seconds}`}
    />
  );
};

export default SeekBarSlider;
