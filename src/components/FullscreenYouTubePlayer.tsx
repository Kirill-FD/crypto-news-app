import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from 'react-native';
import YoutubePlayer, { PLAYER_STATES } from 'react-native-youtube-iframe';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Video } from '../types';
import styles from './FullscreenYouTubePlayer.styles';

type ScreenOrientationModule = typeof import('expo-screen-orientation');

let cachedOrientationModule: ScreenOrientationModule | null | undefined;

const getOrientationModule = (): ScreenOrientationModule | null => {
  if (cachedOrientationModule !== undefined) {
    return cachedOrientationModule;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    cachedOrientationModule = require('expo-screen-orientation') as ScreenOrientationModule;
  } catch (error) {
    console.warn('[FullscreenYouTubePlayer] expo-screen-orientation unavailable', error);
    cachedOrientationModule = null;
  }
  return cachedOrientationModule;
};

interface FullscreenYouTubePlayerProps {
  visible: boolean;
  video: Video | null;
  onClose: () => void;
}

const FullscreenYouTubePlayer: React.FC<FullscreenYouTubePlayerProps> = ({
  visible,
  video,
  onClose,
}) => {
  const dimensions = useWindowDimensions();
  const [playing, setPlaying] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);

  const height = useMemo(() => dimensions.height, [dimensions.height]);

  useEffect(() => {
    if (!visible) {
      setPlaying(false);
      return;
    }
    setPlaying(true);
    setIsReady(false);
    setPlayerKey(prev => prev + 1);
  }, [visible, video?.youtubeId]);

  useEffect(() => {
    const orientationModule = getOrientationModule();
    if (!orientationModule) {
      return;
    }

    if (visible) {
      orientationModule
        .lockAsync(orientationModule.OrientationLock.ALL)
        .catch(error => console.warn('[FullscreenYouTubePlayer] Failed to unlock orientation', error));
    } else {
      orientationModule
        .lockAsync(orientationModule.OrientationLock.PORTRAIT_UP)
        .catch(error => console.warn('[FullscreenYouTubePlayer] Failed to lock portrait', error));
    }

    return () => {
      orientationModule
        ?.lockAsync(orientationModule.OrientationLock.PORTRAIT_UP)
        .catch(error => console.warn('[FullscreenYouTubePlayer] Failed to lock portrait', error));
    };
  }, [visible]);

  const handleRequestClose = useCallback(() => {
    setPlaying(false);
    onClose();
  }, [onClose]);

  if (!video) {
    return null;
  }

  const handleStateChange = (state: PLAYER_STATES) => {
    if (state === PLAYER_STATES.ENDED) {
      setPlaying(false);
      onClose();
    }
  };

  const handleReady = () => {
    setIsReady(true);
    setPlaying(true);
  };

  const handleError = (error: string) => {
    console.error('[FullscreenYouTubePlayer] error', error);
    Alert.alert('Ошибка', 'Не удалось воспроизвести видео. Попробуйте ещё раз.');
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      hardwareAccelerated
      visible={visible}
      onRequestClose={handleRequestClose}
      presentationStyle="fullScreen"
    >
      <View style={styles.modalRoot}>
        <View style={styles.playerWrapper}>
          {!isReady && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          )}

          <YoutubePlayer
            key={`fullscreen-${playerKey}`}
            height={height}
            width={dimensions.width}
            play={playing}
            forceAndroidAutoplay
            videoId={video.youtubeId}
            onChangeState={handleStateChange}
            onReady={handleReady}
            onError={handleError}
            initialPlayerParams={{
              controls: true,
              preventFullScreen: false,
              rel: false,
            }}
          />

          <TouchableOpacity
            style={styles.closeButton}
            activeOpacity={0.85}
            onPress={handleRequestClose}
            accessibilityLabel="Закрыть плеер"
          >
            <Ionicons name="close" size={26} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FullscreenYouTubePlayer;

