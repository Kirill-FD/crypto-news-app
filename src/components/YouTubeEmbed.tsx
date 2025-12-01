import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import YoutubePlayer, { PLAYER_STATES } from 'react-native-youtube-iframe';

interface YouTubeEmbedProps {
  videoId: string;
  height?: number;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
});

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ videoId, height = 220 }) => {
  const [playing, setPlaying] = useState(false);

  const handleStateChange = useCallback((state: PLAYER_STATES) => {
    if (state === PLAYER_STATES.PLAYING) {
      setPlaying(true);
    } else if (state === PLAYER_STATES.PAUSED || state === PLAYER_STATES.ENDED) {
      setPlaying(false);
    }
  }, []);

  return (
    <View style={[styles.container, { height }]}>
      <YoutubePlayer
        height={height}
        width={'100%'}
        videoId={videoId}
        play={playing}
        onChangeState={handleStateChange}
        webViewStyle={{ backgroundColor: 'transparent' }}
        initialPlayerParams={{
          controls: true,
          // Разрешаем переход в полноэкранный режим через стандартную кнопку YouTube
          preventFullScreen: false,
          modestbranding: true,
          rel: false,
        }}
      />
    </View>
  );
};

export default YouTubeEmbed;


