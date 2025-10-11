import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
  },
  videoPlaceholder: {
    height: 250,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
    borderRadius: 8,
  },
  videoTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  videoId: {
    color: '#9ca3af',
    fontSize: 14,
  },
  infoContainer: {
    padding: 16,
  },
  videoTitleText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  videoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaText: {
    fontSize: 14,
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#3b82f6',
  },
  pauseButton: {
    backgroundColor: '#dc2626',
  },
  youtubeButton: {
    backgroundColor: '#dc2626',
    flex: 0,
    paddingHorizontal: 24,
  },
  controlButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default styles;


